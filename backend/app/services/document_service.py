import base64
import os
from io import BytesIO
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from pypdf import PdfReader
import requests
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.document import Document
from app.services.embedding_service import embed_texts
from app.services.pinecone_service import get_pinecone_index
from app.utils.text_utils import chunk_text


def _upload_to_imagekit(raw_content: bytes, file_name: str) -> str:
    if not settings.IMAGEKIT_PRIVATE_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="IMAGEKIT_PRIVATE_KEY is not configured",
        )

    auth = base64.b64encode(f"{settings.IMAGEKIT_PRIVATE_KEY}:".encode("utf-8")).decode("utf-8")
    headers = {"Authorization": f"Basic {auth}"}

    data = {"fileName": file_name}
    if settings.IMAGEKIT_FOLDER:
        data["folder"] = settings.IMAGEKIT_FOLDER

    files = {"file": (file_name, raw_content)}
    response = requests.post(
        settings.IMAGEKIT_UPLOAD_ENDPOINT,
        headers=headers,
        data=data,
        files=files,
        timeout=45,
    )

    if not response.ok:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to upload file to ImageKit",
        )

    payload = response.json()
    file_url = payload.get("url")
    if not file_url:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="ImageKit upload response missing file URL",
        )

    return file_url


def upload_document_and_index(
    db: Session,
    title: str,
    file: UploadFile,
    uploaded_by: int,
) -> tuple[Document, int]:
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File name is required",
        )

    filename = file.filename.lower()
    is_txt = filename.endswith(".txt")
    is_pdf = filename.endswith(".pdf")
    if not is_txt and not is_pdf:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .txt and .pdf files are supported",
        )

    raw_content = file.file.read()

    if is_txt:
        try:
            text = raw_content.decode("utf-8")
        except UnicodeDecodeError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text file must be UTF-8 encoded",
            ) from exc
    else:
        try:
            reader = PdfReader(BytesIO(raw_content))
            text = "\n".join((page.extract_text() or "") for page in reader.pages)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to read PDF content",
            ) from exc

    if not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file has no readable text",
        )

    safe_name = f"{uuid4().hex}_{os.path.basename(file.filename)}"
    file_url = _upload_to_imagekit(raw_content, safe_name)

    document = Document(
        title=title,
        file_path=file_url,
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
