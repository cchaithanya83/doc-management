
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, FastAPI
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import date, datetime, time
import shutil
import os
from database import get_db
from model import Document
from schemas import DocumentCreate, DocumentUpdate, DocumentResponse
router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Serve the uploads directory statically
from fastapi.staticfiles import StaticFiles
router.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@router.post("/upload", response_model=DocumentResponse)
def upload_document(
    file: UploadFile = File(...),
    data: DocumentCreate = Depends(),
    db: Session = Depends(get_db),
):
    print("Received data:", data)  # Debugging log
    print("File received:", file.filename)  # Debugging log

    if not data.category_id or not data.doc_type_id or not data.subtype_id or not data.uploaded_by:
        raise HTTPException(status_code=400, detail="Missing required fields")

    file_location = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_location, "wb") as f:
        shutil.copyfileobj(file.file, f)

    new_doc = Document(
        category_id=data.category_id,
        doc_type_id=data.doc_type_id,
        subtype_id=data.subtype_id,
        doc_date=data.doc_date,
        party_main_account=data.party_main_account,
        party_sub_account=data.party_sub_account,
        file_path=file_location,
        file_name=file.filename,
        uploaded_by=data.uploaded_by,
        uploaded_date=datetime.utcnow(),
        modified_by=data.uploaded_by,
        modified_date=datetime.utcnow(),
        remarks=data.remarks,
    )

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    return new_doc

@router.get("/", response_model=list[DocumentResponse])
def list_documents(
    uid: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve all documents for a specific user.
    
    Args:
        uid (str): User ID to filter documents.
        db (Session): Database session dependency.
    
    Returns:
        list[DocumentResponse]: List of documents uploaded by the user.
    """
    return db.query(Document).filter(Document.uploaded_by == uid).all()

@router.get("/filter", response_model=list[DocumentResponse])
def filter_documents(
    uid: str,
    category_id: int | None = None,
    doc_type_id: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    db: Session = Depends(get_db),
):
    """
    Retrieve documents for a specific user, filtered by category_id, doc_type_id, and modified_date range.
    
    Args:
        uid (str): User ID to filter documents.
        category_id (int, optional): Filter by category ID.
        doc_type_id (int, optional): Filter by document type ID.
        from_date (date, optional): Start date for modified_date (inclusive).
        to_date (date, optional): End date for modified_date (inclusive, until end of day).
        db (Session): Database session dependency.
    
    Raises:
        HTTPException: If from_date is after to_date.
    
    Returns:
        list[DocumentResponse]: List of documents matching the filters for the user.
    """
    query = db.query(Document).filter(Document.uploaded_by == uid)

    if from_date and to_date and from_date > to_date:
        raise HTTPException(status_code=400, detail="from_date cannot be after to_date")

    if category_id is not None:
        query = query.filter(Document.category_id == category_id)
    if doc_type_id is not None:
        query = query.filter(Document.doc_type_id == doc_type_id)
    if from_date is not None:
        query = query.filter(Document.modified_date >= datetime.combine(from_date, time.min))
    if to_date is not None:
        to_date_end = datetime.combine(to_date, time.max)
        query = query.filter(Document.modified_date <= to_date_end)

    return query.all()

@router.get("/user/{uid}", response_model=list[DocumentResponse])
def list_user_documents(
    uid: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve all documents for a specific user.
    
    Args:
        uid (str): User ID to filter documents.
        db (Session): Database session dependency.
    
    Returns:
        list[DocumentResponse]: List of documents uploaded by the user.
    """
    return db.query(Document).filter(Document.uploaded_by == uid).all()

@router.get("/user/{uid}/filter", response_model=list[DocumentResponse])
def filter_user_documents(
    uid: str,
    category_id: int | None = None,
    doc_type_id: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    db: Session = Depends(get_db),
):
    """
    Retrieve documents for a specific user, filtered by category_id, doc_type_id, and modified_date range.
    
    Args:
        uid (str): User ID to filter documents.
        category_id (int, optional): Filter by category ID.
        doc_type_id (int, optional): Filter by document type ID.
        from_date (date, optional): Start date for modified_date (inclusive).
        to_date (date, optional): End date for modified_date (inclusive, until end of day).
        db (Session): Database session dependency.
    
    Raises:
        HTTPException: If from_date is after to_date.
    
    Returns:
        list[DocumentResponse]: List of documents matching the filters for the user.
    """
    query = db.query(Document).filter(Document.uploaded_by == uid)

    if from_date and to_date and from_date > to_date:
        raise HTTPException(status_code=400, detail="from_date cannot be after to_date")

    if category_id is not None:
        query = query.filter(Document.category_id == category_id)
    if doc_type_id is not None:
        query = query.filter(Document.doc_type_id == doc_type_id)
    if from_date is not None:
        query = query.filter(Document.modified_date >= datetime.combine(from_date, time.min))
    if to_date is not None:
        to_date_end = datetime.combine(to_date, time.max)
        query = query.filter(Document.modified_date <= to_date_end)

    return query.all()

@router.put("/{doc_id}", response_model=DocumentResponse)
def update_document(
    doc_id: int,
    updated_data: DocumentUpdate,
    db: Session = Depends(get_db),
):
    """
    Update a document's metadata, ensuring it belongs to the user.
    """
    doc = db.query(Document).filter(Document.id == doc_id, Document.uploaded_by == updated_data.modified_by).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or not owned by user")

    doc.category_id = updated_data.category_id
    doc.doc_type_id = updated_data.doc_type_id
    doc.subtype_id = updated_data.subtype_id
    doc.doc_date = updated_data.doc_date
    doc.party_main_account = updated_data.party_main_account
    doc.party_sub_account = updated_data.party_sub_account
    doc.modified_by = updated_data.modified_by
    doc.modified_date = datetime.utcnow()
    doc.remarks = updated_data.remarks

    db.commit()
    db.refresh(doc)

    return doc

@router.delete("/{doc_id}", response_model=DocumentResponse)
def delete_document(
    doc_id: int,
    uid: str,
    db: Session = Depends(get_db),
):
    """
    Delete a document, ensuring it belongs to the user.
    """
    doc = db.query(Document).filter(Document.id == doc_id, Document.uploaded_by == uid).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or not owned by user")

    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)

    db.delete(doc)
    db.commit()
    return doc

@router.get("/file/{doc_id}")
def get_file(
    doc_id: int,

    db: Session = Depends(get_db),
):
    """
    Retrieve a file, ensuring it belongs to the user.
    """
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or not owned by user")
    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(doc.file_path)
