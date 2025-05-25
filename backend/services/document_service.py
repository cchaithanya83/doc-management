from sqlalchemy.orm import Session
from app.models import Document
from app.schemas import DocumentCreate
import os
import shutil

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_document(db: Session, document: DocumentCreate, file_path: str, uploaded_by: int):
    new_doc = Document(
        category_id=document.category_id,
        doc_type_id=document.doc_type_id,
        subtype_id=document.subtype_id,
        doc_date=document.doc_date,
        party_main_account=document.party_main_account,
        party_sub_account=document.party_sub_account,
        file_path=file_path,
        file_name=document.file_name,
        uploaded_by=uploaded_by
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc

def handle_file_upload(file, filename: str):
    file_location = f"{UPLOAD_DIR}/{filename}"
    with open(file_location, "wb") as f:
        shutil.copyfileobj(file, f)
    return file_location

def delete_document(db: Session, doc_id: int):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        return None
    os.remove(doc.file_path)
    db.delete(doc)
    db.commit()
    return doc
