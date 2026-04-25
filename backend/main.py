import os
import sys
import pathlib
from contextlib import asynccontextmanager

# Add parent directory to path so 'services' package can be found
sys.path.append(str(pathlib.Path(__file__).parent.parent))
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes.voice import router as voice_router
from routes.query import router as query_router
from routes.schemes import router as schemes_router
from routes.feedback import router as feedback_router
from database.feedback import init_db

load_dotenv()

CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:5173")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    await init_db()
    yield


app = FastAPI(
    title="NaamSeva API",
    description="AI Voice Assistant for Indian Government Services",
    version="1.3.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGIN, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(voice_router,    prefix="/api")
app.include_router(query_router,    prefix="/api")
app.include_router(schemes_router,  prefix="/api")
app.include_router(feedback_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "app": "NaamSeva",
        "description": "AI Voice Assistant for Indian Government Services",
        "version": "1.3.0",
        "docs": "/docs",
    }
