"""Evidence retriever — extracts variables, constructs queries, ranks evidence."""
from typing import List, Optional, Dict
from ..models.responses import EvidenceResponse
from .knowledge_store import KnowledgeStore, KnowledgeDocument


# Map frontend-style variable names to knowledge base variable names
VARIABLE_ALIASES = {
    "organic_carbon": ["soil_organic_carbon"],
    "soil_carbon": ["soil_organic_carbon"],
    "ph": ["soil_ph"],
    "moisture": ["soil_moisture"],
    "rainfall": ["rainfall", "water_availability"],
    "temperature": ["temperature"],
    "land_use": ["land_use"],
    "crop": ["crop_diversity"],
    "habitat_diversity": ["habitat_diversity"],
    "fragmentation": ["fragmentation", "habitat_connectivity"],
    "species_richness": ["species_richness", "biodiversity"],
    "pollinator_presence": ["pollinator_presence"],
    "native_vegetation": ["native_vegetation"],
    "pollution": ["pollution"],
    "deforestation": ["deforestation"],
    "seasonality": ["seasonality"],
    "drought": ["drought"],
    "monoculture": ["land_use", "crop_diversity"],
}

# Map evidence_type from knowledge base to frontend format
EVIDENCE_TYPE_MAP = {
    "technical_report": "review",
    "assessment_report": "meta-analysis",
    "field_study": "field-study",
    "meta_analysis": "meta-analysis",
    "review": "review",
    "model": "model",
    "observational": "observational",
}


class EvidenceRetriever:
    """Retrieves and ranks scientific evidence based on environmental variables."""

    def __init__(self, store: KnowledgeStore):
        self.store = store

    def extract_variables(self, assessment_data: dict) -> List[str]:
        """Extract active environmental variables from assessment input."""
        variables = []

        soil = assessment_data.get("soil", {}) or {}
        if soil:
            if soil.get("organic_carbon") is not None:
                variables.append("soil_organic_carbon")
            if soil.get("ph") is not None:
                variables.append("soil_ph")
            if soil.get("moisture"):
                variables.append("soil_moisture")

        climate = assessment_data.get("climate", {}) or {}
        if climate:
            if climate.get("rainfall") is not None or climate.get("rainfall_qualitative"):
                variables.append("rainfall")
            if climate.get("temperature") is not None:
                variables.append("temperature")
            if climate.get("seasonality"):
                variables.append("seasonality")

        land = assessment_data.get("land", {}) or {}
        if land:
            if land.get("land_use"):
                variables.append("land_use")
            if land.get("crop"):
                variables.append("crop_diversity")
            if land.get("habitat_diversity"):
                variables.append("habitat_diversity")
            if land.get("fragmentation"):
                variables.append("fragmentation")

        bio = assessment_data.get("biodiversity", {}) or {}
        if bio:
            if bio.get("species_richness"):
                variables.append("species_richness")
            if bio.get("pollinator_presence"):
                variables.append("pollinator_presence")
            if bio.get("native_vegetation") is not None:
                variables.append("native_vegetation")

        human = assessment_data.get("human_impact", {}) or {}
        if human:
            if human.get("pollution"):
                variables.append("pollution")
            if human.get("deforestation"):
                variables.append("deforestation")

        return variables

    def extract_keywords(self, assessment_data: dict) -> List[str]:
        """Extract contextual keywords for text-based search."""
        keywords = []

        location = assessment_data.get("location", {}) or {}
        eco_type = location.get("ecosystem_type", "")
        if eco_type:
            keywords.extend(eco_type.replace("-", " ").split())

        land = assessment_data.get("land", {}) or {}
        if land.get("land_use"):
            keywords.append(land["land_use"])
        if land.get("crop"):
            keywords.append(land["crop"].lower())

        # Add problem-related keywords
        soil = assessment_data.get("soil", {}) or {}
        if soil.get("moisture") in ("low", "very-low"):
            keywords.append("drought")
            keywords.append("water stress")
        if soil.get("organic_carbon") is not None:
            try:
                if float(soil["organic_carbon"]) < 0.5:
                    keywords.append("soil degradation")
            except (ValueError, TypeError):
                pass

        if land.get("land_use") == "agriculture" and land.get("habitat_diversity") in ("low", "very-low"):
            keywords.append("monoculture")
            keywords.append("habitat simplification")

        bio = assessment_data.get("biodiversity", {}) or {}
        if bio.get("species_richness") in ("low", "very-low"):
            keywords.append("biodiversity loss")

        return keywords

    def retrieve(
        self,
        assessment_data: dict,
        category: Optional[str] = None,
        max_results: int = 10,
    ) -> List[EvidenceResponse]:
        """
        Full retrieval pipeline:
        1. Extract environmental variables from input
        2. Extract contextual keywords
        3. Search knowledge store
        4. Rank by relevance
        5. Return formatted evidence
        """
        variables = self.extract_variables(assessment_data)
        keywords = self.extract_keywords(assessment_data)

        # Search with variables
        docs = self.store.search(
            variables=variables,
            category=category,
            keywords=keywords if keywords else None,
        )

        # Score and rank
        scored = []
        for doc in docs:
            score = self._compute_relevance(doc, variables, keywords)
            scored.append((doc, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        top_docs = scored[:max_results]

        # Convert to response format
        return [self._to_response(doc, score) for doc, score in top_docs]

    def retrieve_by_variables(
        self,
        variables: List[str],
        max_results: int = 10,
    ) -> List[EvidenceResponse]:
        """Retrieve evidence for specific variables."""
        docs = self.store.search(variables=variables)
        scored = [(doc, self._compute_relevance(doc, variables, [])) for doc in docs]
        scored.sort(key=lambda x: x[1], reverse=True)
        return [self._to_response(doc, score) for doc, score in scored[:max_results]]

    def get_all_evidence(
        self,
        category: Optional[str] = None,
        topic: Optional[str] = None,
        evidence_type: Optional[str] = None,
    ) -> List[EvidenceResponse]:
        """Get all evidence with optional filters."""
        docs = self.store.search(
            category=category,
            topic=topic,
            evidence_type=evidence_type,
        )
        return [self._to_response(doc, 75) for doc in docs]

    def _compute_relevance(
        self,
        doc: KnowledgeDocument,
        query_variables: List[str],
        keywords: List[str],
    ) -> int:
        """Compute relevance score 0-100 based on variable overlap and keyword matches."""
        score = 50  # Base score

        # Variable overlap (up to +30)
        doc_vars = set(v.lower().replace(" ", "_") for v in doc.environmental_variables)
        query_vars = set(v.lower().replace(" ", "_") for v in query_variables)
        overlap = len(doc_vars & query_vars)
        total_possible = max(len(query_vars), 1)
        score += min(30, int(30 * overlap / total_possible))

        # Check aliases for additional matches
        for qv in query_vars:
            aliases = VARIABLE_ALIASES.get(qv, [])
            for alias in aliases:
                if alias in doc_vars:
                    score += 3

        # Keyword matches (up to +20)
        if keywords:
            full_text = (doc.title + " " + doc.topic + " " + " ".join(doc.text_chunks)).lower()
            kw_matches = sum(1 for kw in keywords if kw.lower() in full_text)
            score += min(20, int(20 * kw_matches / max(len(keywords), 1)))

        return min(99, max(50, score))

    def _to_response(self, doc: KnowledgeDocument, relevance: int) -> EvidenceResponse:
        """Convert internal document to frontend-compatible response."""
        evidence_type = EVIDENCE_TYPE_MAP.get(doc.evidence_type, "review")

        # Build abstract from first chunk
        abstract = doc.text_chunks[0] if doc.text_chunks else doc.title

        # Map variables to human-readable form
        variables = [v.replace("_", " ").title() for v in doc.environmental_variables[:4]]

        return EvidenceResponse(
            id=doc.document_id,
            source=doc.source,
            title=doc.title,
            year=doc.year,
            topic=doc.topic,
            variables=variables,
            relevance=relevance,
            evidenceType=evidence_type,
            abstract=abstract,
            category=doc.category,
        )
