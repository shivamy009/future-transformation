from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.schemas.document import DocumentOut, DocumentUploadResponse
from app.services.activity_service import log_activity
from app.services.document_service import upload_document_and_index


router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
def upload_document(
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: User = Depends(require_roles(["admin"])),
):
    document, chunks_indexed = upload_document_and_index(
        db=db,
        title=title,
        file=file,
        uploaded_by=current_user.id,
    )

    log_activity(
        db,
        "document_upload",
        current_user.email,
        {"document_id": document.id, "title": document.title, "chunks_indexed": chunks_indexed},
    )

    return DocumentUploadResponse(
        document=DocumentOut.model_validate(document),
        chunks_indexed=chunks_indexed,
    )
