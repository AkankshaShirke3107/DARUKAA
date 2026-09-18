"""Conversation API — multi-turn conversational intelligence."""
from fastapi import APIRouter
from ..models.environmental import ConversationMessageRequest
from ..models.responses import ConversationResponse, ScientistOption
from ..services.conversation_service import conversation_store
from ..services.llm_service import llm_service
from ..rag.knowledge_store import knowledge_store
from ..rag.retriever import EvidenceRetriever

router = APIRouter(prefix="/api", tags=["Conversation"])

# Simple variable extraction from natural language
VARIABLE_KEYWORDS = {
    "soil": {
        "organic_carbon": ["organic carbon", "soc", "soil carbon", "carbon content", "carbon %"],
        "ph": ["ph", "soil ph", "acidity", "alkalinity"],
        "moisture": ["soil moisture", "dry soil", "wet soil"],
    },
    "climate": {
        "rainfall": ["rain", "rainfall", "precipitation", "mm"],
        "temperature": ["temperature", "temp", "°c", "hot", "cold", "warm"],
        "rainfall_qualitative": ["low rainfall", "high rainfall", "moderate rainfall"],
    },
    "land": {
        "land_use": ["agriculture", "farming", "forestry", "grazing", "pastoral"],
        "crop": ["wheat", "rice", "maize", "corn", "soybean", "crop"],
        "habitat_diversity": ["habitat diversity", "diverse habitat", "simple landscape", "monoculture"],
        "fragmentation": ["fragmented", "isolated", "connected", "corridors"],
    },
    "biodiversity": {
        "species_richness": ["species", "richness", "diverse species", "few species"],
        "pollinator_presence": ["pollinator", "bees", "butterflies", "insects"],
        "native_vegetation": ["native vegetation", "native plants", "natural vegetation"],
    },
    "human_impact": {
        "pollution": ["pollution", "pesticide", "chemical", "fertilizer", "contamination"],
        "deforestation": ["deforestation", "forest loss", "logging", "land clearing"],
    },
}

QUALITATIVE_MAP = {
    "low": "low",
    "very low": "very-low",
    "moderate": "moderate",
    "high": "high",
    "limited": "limited",
    "abundant": "abundant",
    "severe": "severe",
}


def extract_variables_from_text(text: str) -> dict:
    """Extract environmental variables from natural language text."""
    text_lower = text.lower()
    extracted = {}

    for category, variables in VARIABLE_KEYWORDS.items():
        cat_vals = {}
        for var_name, keywords in variables.items():
            for kw in keywords:
                if kw in text_lower:
                    # Try to extract a value
                    if var_name in ("rainfall", "temperature"):
                        import re
                        # Look for numbers near the keyword
                        patterns = [
                            rf"{kw}\s*(?:is\s*)?(?:about\s*)?(\d+\.?\d*)",
                            rf"(\d+\.?\d*)\s*(?:mm|°c|degrees)",
                        ]
                        for pattern in patterns:
                            match = re.search(pattern, text_lower)
                            if match:
                                cat_vals[var_name] = float(match.group(1))
                                break
                        if var_name not in cat_vals:
                            # Check for qualitative
                            for qual_word, qual_val in QUALITATIVE_MAP.items():
                                if qual_word in text_lower and kw in text_lower:
                                    if var_name == "rainfall":
                                        cat_vals["rainfall_qualitative"] = qual_val
                                    break
                    elif var_name == "organic_carbon":
                        import re
                        match = re.search(r"(\d+\.?\d*)\s*%", text_lower)
                        if match:
                            val = float(match.group(1))
                            if val < 10:  # Reasonable SOC range
                                cat_vals[var_name] = val
                    elif var_name == "crop":
                        for crop_name in ["wheat", "rice", "maize", "corn", "soybean", "millet"]:
                            if crop_name in text_lower:
                                cat_vals[var_name] = crop_name.title()
                                break
                    elif var_name == "land_use":
                        for lu in ["agriculture", "farming", "forestry", "grazing", "pastoral"]:
                            if lu in text_lower:
                                cat_vals[var_name] = "agriculture" if lu == "farming" else lu
                                break
                    else:
                        # Qualitative extraction
                        for qual_word, qual_val in QUALITATIVE_MAP.items():
                            context = text_lower[max(0, text_lower.index(kw)-30):text_lower.index(kw)+len(kw)+30]
                            if qual_word in context:
                                cat_vals[var_name] = qual_val
                                break
                    break  # Found keyword, move to next variable

        if cat_vals:
            extracted[category] = cat_vals

    return extracted


@router.post("/conversation/message", response_model=ConversationResponse)
async def send_message(req: ConversationMessageRequest):
    """
    Process a conversation message:
    1. Get or create conversation session
    2. Extract environmental variables from text
    3. Update session context (never re-ask for known info)
    4. Retrieve relevant evidence
    5. Generate response
    6. Identify remaining missing information
    """
    session = conversation_store.get_or_create(req.conversation_id, req.assessment_id)
    session.add_message("user", req.message)

    # Extract variables from this message
    new_vars = extract_variables_from_text(req.message)
    for category, values in new_vars.items():
        session.update_variables(category, values)

    # Build context from all accumulated variables
    context = session.get_all_variables_flat()

    # Retrieve relevant evidence
    retriever = EvidenceRetriever(knowledge_store)
    evidence_results = retriever.retrieve(context, max_results=5)
    evidence_texts = []
    for ev in evidence_results:
        doc = knowledge_store.get_by_id(ev.id)
        if doc and doc.text_chunks:
            evidence_texts.append({"id": ev.id, "text": doc.text_chunks[0]})

    # Generate response
    response_text = await llm_service.generate_conversation_response(
        req.message, context, evidence_texts
    )
    session.add_message("assistant", response_text)

    # Identify missing variables (that haven't been provided yet)
    missing = session.get_missing_critical_variables()

    # Generate targeted question if info is missing
    question = None
    options = None
    if missing:
        q, opts = llm_service._generate_question(missing[0])
        question = q
        if opts:
            options = [ScientistOption(value=o["value"], label=o["label"]) for o in opts]

    return ConversationResponse(
        conversation_id=session.conversation_id,
        assessment_id=session.assessment_id,
        message=response_text,
        question=question,
        options=options,
        extracted_variables=context,
        missing_information=missing,
    )
