"""Conversation service — multi-turn context management."""
import uuid
from typing import Dict, List, Optional
from datetime import datetime


class ConversationSession:
    """Tracks a multi-turn conversation and accumulated environmental variables."""
    def __init__(self, conversation_id: str, assessment_id: Optional[str] = None):
        self.conversation_id = conversation_id
        self.assessment_id = assessment_id
        self.messages: List[dict] = []
        self.extracted_variables: dict = {
            "soil": {},
            "climate": {},
            "land": {},
            "biodiversity": {},
            "human_impact": {},
            "location": {},
        }
        self.created_at = datetime.utcnow().isoformat()

    def add_message(self, role: str, content: str):
        self.messages.append({
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat(),
        })

    def update_variables(self, category: str, updates: dict):
        """Merge new variables into the session context."""
        if category in self.extracted_variables:
            self.extracted_variables[category].update(updates)

    def get_all_variables_flat(self) -> dict:
        """Return all extracted variables in flat assessment format."""
        return {k: v for k, v in self.extracted_variables.items() if v}

    def get_missing_critical_variables(self) -> List[str]:
        """Identify critical variables not yet provided."""
        missing = []
        soil = self.extracted_variables.get("soil", {})
        if not soil.get("organic_carbon"):
            missing.append("soil_organic_carbon")

        climate = self.extracted_variables.get("climate", {})
        if not climate.get("rainfall") and not climate.get("rainfall_qualitative"):
            missing.append("rainfall")

        land = self.extracted_variables.get("land", {})
        if not land.get("land_use"):
            missing.append("land_use")
        if not land.get("habitat_diversity"):
            missing.append("habitat_diversity")

        bio = self.extracted_variables.get("biodiversity", {})
        if not bio.get("species_richness"):
            missing.append("species_richness")

        return missing


class ConversationStore:
    """In-memory conversation store. Interface ready for DB replacement."""

    def __init__(self):
        self._sessions: Dict[str, ConversationSession] = {}

    def create(self, assessment_id: Optional[str] = None) -> ConversationSession:
        cid = f"CONV-{uuid.uuid4().hex[:8].upper()}"
        session = ConversationSession(cid, assessment_id)
        self._sessions[cid] = session
        return session

    def get(self, conversation_id: str) -> Optional[ConversationSession]:
        return self._sessions.get(conversation_id)

    def get_or_create(self, conversation_id: Optional[str], assessment_id: Optional[str] = None) -> ConversationSession:
        if conversation_id and conversation_id in self._sessions:
            return self._sessions[conversation_id]
        return self.create(assessment_id)


# Singleton
conversation_store = ConversationStore()
