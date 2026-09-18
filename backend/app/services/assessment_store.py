"""Assessment store — in-memory with clean interface for DB replacement."""
import uuid
from typing import Dict, List, Optional
from datetime import datetime
from ..models.responses import FullAssessmentResponse, AssessmentRecord


class AssessmentStore:
    """Stores and retrieves assessment results. Interface ready for PostgreSQL."""

    def __init__(self):
        self._assessments: Dict[str, dict] = {}

    def save(self, response: FullAssessmentResponse, name: str = "", region: str = "", ecosystem: str = "") -> str:
        """Save a complete assessment result."""
        assessment_id = response.assessment_id
        self._assessments[assessment_id] = {
            "id": assessment_id,
            "name": name or f"Assessment {assessment_id}",
            "region": region or "Unknown",
            "ecosystem": ecosystem or "Unknown",
            "created": datetime.utcnow().strftime("%Y-%m-%d"),
            "status": "analysed",
            "response": response.model_dump(),
        }
        return assessment_id

    def get(self, assessment_id: str) -> Optional[dict]:
        return self._assessments.get(assessment_id)

    def list_all(self) -> List[AssessmentRecord]:
        records = []
        for data in self._assessments.values():
            records.append(AssessmentRecord(
                id=data["id"],
                name=data["name"],
                region=data["region"],
                ecosystem=data["ecosystem"],
                created=data["created"],
                status=data["status"],
            ))
        return sorted(records, key=lambda r: r.created, reverse=True)

    def get_full_response(self, assessment_id: str) -> Optional[FullAssessmentResponse]:
        data = self._assessments.get(assessment_id)
        if data:
            return FullAssessmentResponse(**data["response"])
        return None


# Singleton
assessment_store = AssessmentStore()
