from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    fullname = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone_number = Column(String, nullable=False)

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, nullable=False)
    doc_type_id = Column(Integer, nullable=False)
    subtype_id = Column(Integer, nullable=False)
    doc_date = Column(String, nullable=False)
    party_main_account = Column(String, nullable=False)
    party_sub_account = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    uploaded_date = Column(DateTime, default=datetime.utcnow)
    modified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    modified_date = Column(DateTime, nullable=True)
    remarks = Column(String, nullable=True)

    uploader = relationship("User", foreign_keys=[uploaded_by])
    modifier = relationship("User", foreign_keys=[modified_by])
