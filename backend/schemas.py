from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str
    fullname: str
    email: EmailStr
    phone_number: str

class UserResponse(BaseModel):
    id: int
    username: str
    fullname: str
    email: EmailStr
    phone_number: str

class userlogin(BaseModel):
    username: str
    password: str

class DocumentCreate(BaseModel):
    category_id: int
    doc_type_id: int
    subtype_id: int
    doc_date: str
    party_main_account: str
    party_sub_account: str
    uploaded_by: int
    remarks: Optional[str] = None


class DocumentUpdate(BaseModel):
    category_id: int
    doc_type_id: int
    subtype_id: int
    doc_date: str
    party_main_account: str
    party_sub_account: str
    modified_by: int
    remarks: Optional[str] = None


class DocumentResponse(BaseModel):
    id: int
    category_id: int
    doc_type_id: int
    subtype_id: int
    doc_date: str
    party_main_account: str
    party_sub_account: str
    file_path: str
    file_name: str
    uploaded_by: int
    uploaded_date: datetime
    modified_by: int
    modified_date: datetime
    remarks: Optional[str]

    class Config:
        orm_mode = True