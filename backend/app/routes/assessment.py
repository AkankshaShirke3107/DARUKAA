"""Assessment API — full analysis pipeline and history."""
import uuid
from fastapi import APIRouter, HTTPException
from ..models.environmental import AssessmentRequest
from ..models.responses import (
    FullAssessmentResponse, GraphNode, GraphEdge,
    ScientistConversation, ScientistOption,
)
from ..reasoning.state_evaluator import evaluate_environmental_state
from ..reasoning.interaction_detector import detect_interactions, build_reasoning_chain
from ..reasoning.recommender import generate_recommendations
from ..reasoning.relationship_graph import relationship_graph
from ..rag.retriever import EvidenceRetriever
from ..rag.knowledge_store import knowledge_store
from ..services.llm_service import llm_service
from ..services.assessment_store import assessment_store

router = APIRouter(prefix="/api", tags=["Assessment"])


def _build_assessment_dict(req: AssessmentRequest) -> dict:
    """Convert pydantic request to plain dict for internal processing."""
    d = {}
    if req.location:
        d["location"] = req.location.model_dump(exclude_none=True)
    if req.soil:
        d["soil"] = req.soil.model_dump(exclude_none=True)
    if req.climate:
        d["climate"] = req.climate.model_dump(exclude_none=True)
    if req.land:
        d["land"] = req.land.model_dump(exclude_none=True)
    if req.biodiversity:
        d["biodiversity"] = req.biodiversity.model_dump(exclude_none=True)
    if req.human_impact:
        d["human_impact"] = req.human_impact.model_dump(exclude_none=True)
    return d


def _identify_missing_information(assessment: dict) -> list:
    """Identify critical environmental variables not provided."""
    missing = []
    soil = assessment.get("soil", {})
    if not soil.get("organic_carbon"):
        missing.append("Soil organic carbon percentage")
    if not soil.get("moisture"):
        missing.append("Soil moisture level")

    climate = assessment.get("climate", {})
    if not climate.get("rainfall") and not climate.get("rainfall_qualitative"):
        missing.append("Annual rainfall or rainfall pattern")
    if not climate.get("temperature"):
        missing.append("Mean temperature")

    land = assessment.get("land", {})
    if not land.get("land_use"):
        missing.append("Primary land use type")
    if not land.get("habitat_diversity"):
        missing.append("Habitat diversity assessment")
    if not land.get("fragmentation"):
        missing.append("Habitat fragmentation level")

    bio = assessment.get("biodiversity", {})
    if not bio.get("species_richness"):
        missing.append("Species richness estimate")

    return missing


def _build_relationship_graph(assessment: dict, dimensions: list) -> dict:
    """Build frontend-compatible relationship graph from assessment data."""
    # Node positions following the frontend's existing layout
    NODE_POSITIONS = {
        "rainfall": (400, 40),
        "temperature": (620, 40),
        "water_availability": (500, 140),
        "soil_moisture": (300, 240),
        "soil_biology": (300, 340),
        "organic_carbon": (300, 440),
        "species_survival": (650, 240),
        "monoculture": (150, 340),
        "habitat_diversity": (650, 380),
        "pollinator_resources": (500, 440),
        "biodiversity": (500, 540),
        "ecosystem_resilience": (500, 630),
    }

    CATEGORY_MAP = {
        "rainfall": "climate",
        "temperature": "climate",
        "water_availability": "climate",
        "soil_moisture": "soil",
        "soil_biology": "soil",
        "organic_carbon": "soil",
        "species_survival": "biodiversity",
        "monoculture": "land",
        "habitat_diversity": "biodiversity",
        "pollinator_resources": "biodiversity",
        "biodiversity": "outcome",
        "ecosystem_resilience": "outcome",
    }

    # Build value/status from dimensions
    metric_map = {}
    for dim in dimensions:
        for m in dim.metrics:
            key = m.label.lower().replace(" ", "_")
            metric_map[key] = {"value": f"{m.value}{' ' + m.unit if m.unit else ''}", "status": m.status}

    # Derive node data
    nodes = []
    for var_id, (x, y) in NODE_POSITIONS.items():
        label = var_id.replace("_", " ").title()
        category = CATEGORY_MAP.get(var_id, "outcome")

        # Try to find matching metric data
        value = None
        status = None
        for key, data in metric_map.items():
            if var_id.replace("_", "") in key.replace("_", "") or key.replace("_", "") in var_id.replace("_", ""):
                value = data["value"]
                status = data["status"]
                break

        # Defaults for derived variables
        if var_id == "water_availability" and not value:
            rf_data = metric_map.get("rainfall", {})
            if rf_data.get("status") == "poor":
                value, status = "Low", "poor"
        if var_id == "soil_biology" and not value:
            soc_data = metric_map.get("organic_carbon", {})
            if soc_data.get("status") in ("poor", "critical"):
                value, status = "Reduced", "poor"
        if var_id == "species_survival" and not value:
            sr_data = metric_map.get("species_richness", {})
            if sr_data.get("status") in ("poor", "critical"):
                value, status = "Stressed", "poor"
        if var_id == "monoculture" and not value:
            land = assessment.get("land", {})
            if land.get("crop"):
                value = land["crop"]
                status = "poor" if land.get("land_use", "").lower() == "agriculture" else "moderate"
        if var_id == "ecosystem_resilience" and not value:
            # Derive from overall assessment health
            poor_count = sum(1 for dim in dimensions for m in dim.metrics if m.status in ("poor", "critical"))
            if poor_count > 5:
                value, status = "Low", "critical"
            elif poor_count > 2:
                value, status = "Moderate", "moderate"
            else:
                value, status = "Adequate", "good"
        if var_id == "biodiversity" and not value:
            sr = metric_map.get("species_richness", {})
            value = sr.get("value", "Unknown")
            status = sr.get("status", "moderate")

        # Count evidence for this node
        rels = relationship_graph.get_downstream(var_id) + relationship_graph.get_upstream(var_id)
        ev_count = len(set(eid for r in rels for eid in r.evidence_ids))

        desc_map = {
            "rainfall": "Annual precipitation drives water availability across the ecosystem, directly influencing soil moisture retention and plant survival capacity.",
            "temperature": "Mean temperature affects evapotranspiration rates, soil microbial activity, and species metabolic demands.",
            "water_availability": "Effective water availability for ecosystem processes, determined by rainfall minus evapotranspiration and runoff.",
            "soil_moisture": "Available water content in the soil profile, critical for root uptake, microbial activity, and nutrient cycling.",
            "soil_biology": "Diversity and activity of soil microorganisms, fungi, and invertebrates that drive decomposition and nutrient cycling.",
            "organic_carbon": "Soil organic carbon content, a primary indicator of soil health, fertility, and carbon sequestration capacity.",
            "species_survival": "Capacity of local species populations to persist under current environmental conditions.",
            "monoculture": "Single-crop cultivation reduces habitat heterogeneity and depletes specific soil nutrients while increasing pest vulnerability.",
            "habitat_diversity": "Variety of distinct habitats available within the landscape, essential for supporting diverse species assemblages.",
            "pollinator_resources": "Availability of floral resources, nesting sites, and foraging habitat for pollinating species.",
            "biodiversity": "Overall biological diversity of the ecosystem, integrating species richness, functional diversity, and ecological connectivity.",
            "ecosystem_resilience": "Capacity of the ecosystem to absorb disturbances while retaining its essential structure and functions.",
        }

        nodes.append(GraphNode(
            id=var_id.replace("_", "-"),
            label=label,
            x=x, y=y,
            category=category,
            value=value,
            status=status,
            description=desc_map.get(var_id, f"Environmental variable: {label}"),
            evidenceCount=ev_count,
        ))

    # Build edges from relationship graph
    edges = []
    all_rels = relationship_graph.get_all_relationships()
    existing_nodes = {n.id for n in nodes}
    for rel in all_rels:
        source_id = rel.source.replace("_", "-")
        target_id = rel.target.replace("_", "-")
        if source_id in existing_nodes and target_id in existing_nodes:
            edge_type = "negative" if rel.direction == "negative" else "positive"
            label = None
            if rel.source == "temperature" and rel.target == "water_availability":
                label = "evapotranspiration"
            edges.append(GraphEdge(
                source=source_id,
                target=target_id,
                strength=rel.strength,
                type=edge_type,
                label=label,
            ))

    # Deduplicate edges
    seen = set()
    unique_edges = []
    for e in edges:
        key = (e.source, e.target)
        if key not in seen:
            seen.add(key)
            unique_edges.append(e)

    return {
        "nodes": [n.model_dump() for n in nodes],
        "edges": [e.model_dump() for e in unique_edges],
    }


@router.post("/assessment/analyze", response_model=FullAssessmentResponse)
async def analyze_assessment(req: AssessmentRequest):
    """
    Full environmental assessment pipeline:
    1. Parse environmental state
    2. Retrieve scientific evidence
    3. Map ecological relationships
    4. Detect multi-variable interactions
    5. Generate recommendations
    6. Build reasoning chain
    """
    assessment = _build_assessment_dict(req)
    assessment_id = f"ASM-{uuid.uuid4().hex[:6].upper()}"

    # Step 1: Evaluate environmental state → DimensionData[]
    dimensions = evaluate_environmental_state(assessment)

    # Step 2: Retrieve relevant evidence
    retriever = EvidenceRetriever(knowledge_store)
    evidence = retriever.retrieve(assessment, max_results=10)

    # Step 3: Build relationship graph
    relationships = _build_relationship_graph(assessment, dimensions)

    # Step 4: Detect multi-variable interactions
    observations, interactions, implications, evidence_ids = detect_interactions(dimensions, assessment)

    # Step 5: Generate recommendations
    detected_ids = []
    for inter in interactions:
        # Map interaction titles back to template IDs
        title_lower = inter.title.lower()
        if "water" in title_lower and "carbon" in title_lower:
            detected_ids.append("water_soil_carbon")
        if "monoculture" in title_lower:
            detected_ids.append("monoculture_habitat")
        if "fragmentation" in title_lower:
            detected_ids.append("fragmentation_biodiversity")
        if "water stress" in title_lower:
            detected_ids.append("water_stress_biodiversity")
        if "soil carbon" in title_lower and "biodiversity" in title_lower:
            detected_ids.append("soil_carbon_biodiversity")
        if "pollution" in title_lower:
            detected_ids.append("pollution_biodiversity")
        if "deforestation" in title_lower:
            detected_ids.append("deforestation_cascade")

    recommendations = generate_recommendations(detected_ids, dimensions, assessment)

    # Step 6: Build reasoning chain
    reasoning = build_reasoning_chain(observations, interactions, implications, evidence_ids)

    # Step 7: Identify missing information
    missing = _identify_missing_information(assessment)

    # Step 8: Generate scientist message
    missing_vars_internal = []
    if not assessment.get("soil", {}).get("organic_carbon"):
        missing_vars_internal.append("soil_organic_carbon")
    if not assessment.get("climate", {}).get("rainfall"):
        missing_vars_internal.append("rainfall")
    if not assessment.get("land", {}).get("habitat_diversity"):
        missing_vars_internal.append("habitat_diversity")

    scientist_data = await llm_service.generate_scientist_message(
        observations, interactions, missing_vars_internal
    )

    scientist = None
    if scientist_data:
        options = None
        if scientist_data.get("options"):
            options = [ScientistOption(value=o["value"], label=o["label"]) for o in scientist_data["options"]]
        scientist = ScientistConversation(
            message=scientist_data["message"],
            question=scientist_data.get("question"),
            options=options,
        )

    # Build response
    response = FullAssessmentResponse(
        assessment_id=assessment_id,
        environmental_state=dimensions,
        relationships=relationships,
        reasoning=reasoning,
        recommendations=recommendations,
        evidence=evidence,
        missing_information=missing,
        scientist=scientist,
    )

    # Save to store
    location = assessment.get("location", {})
    assessment_store.save(
        response,
        name=f"Assessment {assessment_id}",
        region=location.get("region", "Unknown"),
        ecosystem=location.get("ecosystem_type", "Unknown").replace("-", " ").title(),
    )

    return response


@router.get("/assessments")
async def list_assessments():
    """List all saved assessments."""
    return assessment_store.list_all()


@router.get("/assessments/{assessment_id}")
async def get_assessment(assessment_id: str):
    """Retrieve a specific assessment."""
    result = assessment_store.get_full_response(assessment_id)
    if not result:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return result
