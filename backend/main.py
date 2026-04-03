import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import generate, tryon

load_dotenv()

app = FastAPI(
    title="Nail Art AI API",
    description="AI-powered nail art generator and virtual try-on",
    version="1.0.0",
)

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router, prefix="/api", tags=["Generate"])
app.include_router(tryon.router, prefix="/api", tags=["Try-On"])


@app.get("/")
async def root():
    return {"status": "ok", "message": "Nail Art AI API is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
