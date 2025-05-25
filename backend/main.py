from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import user_routes, document_routes
from database import engine, Base

# Initialize DB
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FastAPI File Management System", version="1.0.0")

# CORS Configuration (Adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routes
app.include_router(user_routes.router, prefix="/users", tags=["Users"])
app.include_router(document_routes.router, prefix="/documents", tags=["Documents"])

@app.get("/")
def home():
    return {"message": "Welcome to FastAPI File Management System"}
