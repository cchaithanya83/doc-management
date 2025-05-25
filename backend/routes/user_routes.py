from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from database import get_db
from model import User
from schemas import UserCreate, UserResponse , userlogin
from services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        username=user.username,
        password=hash_password(user.password),
        fullname=user.fullname,
        email=user.email,
        phone_number=user.phone_number
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login_user(user_login_data: userlogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_login_data.username).first()
    if not user or not verify_password(user_login_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.username})
    return {"access_token": token,"userId": user.id, "token_type": "bearer"}
