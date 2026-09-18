"""Evidence API — list, filter, and retrieve scientific evidence."""
from fastapi import APIRouter, HTTPException
from typing import Optional
from ..rag.retriever import EvidenceRetriever
from ..rag.knowledge_store import knowledge_store
from ..models.responses import EvidenceResponse

router = APIRouter(prefix="/api", tags=["Evidence"])


@router.get("/evidence", response_model=list[EvidenceResponse])
async def list_evidence(
    category: Optional[str] = None,
    topic: Optional[str] = None,
    variable: Optional[str] = None,
    evidence_type: Optional[str] = None,
):
    """List and filter scientific evidence from the knowledge repository."""
    retriever = EvidenceRetriever(knowledge_store)

    if variable:
        return retriever.retrieve_by_variables([variable], max_results=20)

    return retriever.get_all_evidence(
        category=category,
        topic=topic,
        evidence_type=evidence_type,
    )


@router.get("/evidence/{document_id}", response_model=EvidenceResponse)
async def get_evidence(document_id: str):
    """Retrieve a specific evidence document."""
    doc = knowledge_store.get_by_id(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Evidence not found")

    retriever = EvidenceRetriever(knowledge_store)
    return retriever._to_response(doc, 95)
