import os
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.document import Document
from app.services.embedding_service import embed_texts
from app.services.pinecone_service import get_pinecone_index
from app.utils.text_utils import chunk_text


def upload_document_and_index(
    db: Session,
    title: str,
    file: UploadFile,
    uploaded_by: int,
) -> tuple[Document, int]:
    if not file.filename or not file.filename.lower().endswith(".txt"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .txt files are supported",
        )

    os.makedirs(settings.UPLOADS_DIR, exist_ok=True)

    raw_content = file.file.read()
    try:
        text = raw_content.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text file must be UTF-8 encoded",
        ) from exc

    if not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded text file is empty",
        )

    safe_name = f"{uuid4().hex}_{os.path.basename(file.filename)}"
    save_path = os.path.join(settings.UPLOADS_DIR, safe_name)

    with open(save_path, "wb") as output_file:
        output_file.write(raw_content)

    document = Document(
        title=title,
        file_path=save_path,
        uploaded_by=uploaded_by,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    chunks = chunk_text(text, chunk_size=850, overlap=120)
    vectors = embed_texts(chunks)

    pinecone_vectors = []
    for idx, embedding in enumerate(vectors):
        pinecone_vectors.append(
            {
                "id": f"doc-{document.id}-chunk-{idx}",
                "values": embedding,
                "metadata": {
                    "document_id": document.id,
                    "text": chunks[idx],
                    "uploaded_by": uploaded_by,
                },
            }
        )

    if pinecone_vectors:
        index = get_pinecone_index()
        index.upsert(vectors=pinecone_vectors, namespace="documents")

    return document, len(pinecone_vectors)
