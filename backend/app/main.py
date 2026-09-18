"""Darukaa Biosphere — FastAPI Backend."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
from .rag.knowledge_store import knowledge_store
from .routes.assessment import router as assessment_router
from .routes.evidence import router as evidence_router
from .routes.conversation import router as conversation_router
from .routes.scenario import router as scenario_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load knowledge base on startup."""
    knowledge_store.load()
    yield


app = FastAPI(
    title="Darukaa Biosphere API",
    description="Environmental Intelligence & Biodiversity Assessment System",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(assessment_router)
app.include_router(evidence_router)
app.include_router(conversation_router)
app.include_router(scenario_router)


@app.get("/")
async def root():
    return {
        "name": "Darukaa Biosphere API",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "knowledge_documents": len(knowledge_store.get_all()),
        "llm_available": True,  # Will be updated by service
    }
