"""Scenario API — uses the same reasoning engine as assessment."""
from fastapi import APIRouter, HTTPException
from ..models.environmental import ScenarioRequest
from ..models.responses import ScenarioResultItem, ScenarioResponse
from ..reasoning.state_evaluator import evaluate_environmental_state
from ..reasoning.interaction_detector import detect_interactions
from ..rag.retriever import EvidenceRetriever
from ..rag.knowledge_store import knowledge_store
from ..services.assessment_store import assessment_store

router = APIRouter(prefix="/api", tags=["Scenario"])


def _compute_composite_scores(dimensions: list) -> dict:
    """Compute composite environmental scores from dimension data."""
    status_scores = {"good": 80, "moderate": 55, "poor": 30, "critical": 15}

    scores = {
        "water_stress": 50,
        "habitat_pressure": 50,
        "soil_resilience": 50,
        "biodiversity_index": 50,
        "pollinator_capacity": 50,
    }

    for dim in dimensions:
        for metric in dim.metrics:
            s = status_scores.get(metric.status, 50)
            label = metric.label.lower()

            if "moisture" in label or "rainfall" in label or "drought" in label:
                scores["water_stress"] = max(0, min(100, 100 - s))
            if "habitat" in label or "fragmentation" in label:
                scores["habitat_pressure"] = max(0, min(100, 100 - s))
            if "organic carbon" in label or "soil" in label:
                scores["soil_resilience"] = max(0, min(100, s))
            if "species" in label or "biodiversity" in label or "native" in label:
                scores["biodiversity_index"] = max(0, min(100, s))
            if "pollinator" in label:
                scores["pollinator_capacity"] = max(0, min(100, s))

    return scores


@router.post("/scenario/analyze", response_model=ScenarioResponse)
async def analyze_scenario(req: ScenarioRequest):
    """
    Scenario analysis using the same reasoning engine:
    1. Load baseline assessment
    2. Modify environmental parameters
    3. Re-run state evaluation and interaction detection
    4. Compare baseline vs scenario
    """
    # Get baseline assessment
    baseline_data = assessment_store.get(req.assessment_id)
    if not baseline_data:
        raise HTTPException(status_code=404, detail="Baseline assessment not found")

    baseline_response = assessment_store.get_full_response(req.assessment_id)
    baseline_dims = baseline_response.environmental_state
    baseline_scores = _compute_composite_scores(baseline_dims)

    # Build modified assessment dict from baseline + scenario parameters
    # The original assessment data isn't stored directly, so we reconstruct from dimensions
    scenario_assessment = _reconstruct_assessment(baseline_dims, req.parameters)

    # Run the same evaluation pipeline
    scenario_dims = evaluate_environmental_state(scenario_assessment)
    scenario_scores = _compute_composite_scores(scenario_dims)

    # Detect interactions in scenario
    _, scenario_interactions, _, _ = detect_interactions(scenario_dims, scenario_assessment)

    # Retrieve evidence for changed variables
    changed_vars = []
    for param_id, value in req.parameters.items():
        changed_vars.append(param_id.replace("-", "_"))

    retriever = EvidenceRetriever(knowledge_store)
    evidence = retriever.retrieve_by_variables(changed_vars, max_results=5)

    # Build comparison results
    metric_names = {
        "water_stress": "Water Stress Index",
        "habitat_pressure": "Habitat Pressure",
        "soil_resilience": "Soil Resilience",
        "biodiversity_index": "Biodiversity Index",
        "pollinator_capacity": "Pollinator Capacity",
    }

    inverse_metrics = {"water_stress", "habitat_pressure"}

    results = []
    for key, name in metric_names.items():
        baseline_val = baseline_scores[key]
        scenario_val = scenario_scores[key]

        if key in inverse_metrics:
            direction = "better" if scenario_val < baseline_val else "worse" if scenario_val > baseline_val else "neutral"
        else:
            direction = "better" if scenario_val > baseline_val else "worse" if scenario_val < baseline_val else "neutral"

        results.append(ScenarioResultItem(
            metric=name,
            current=baseline_val,
            scenario=scenario_val,
            unit="/100",
            direction=direction,
        ))

    # Reasoning changes
    reasoning_changes = []
    for inter in scenario_interactions:
        reasoning_changes.append(f"Scenario interaction: {inter.title}")

    return ScenarioResponse(
        assessment_id=req.assessment_id,
        baseline_results=results,
        scenario_results=results,
        reasoning_changes=reasoning_changes,
        evidence=evidence,
    )


def _reconstruct_assessment(dimensions: list, params: dict) -> dict:
    """Reconstruct a modifiable assessment dict from dimensions + scenario params."""
    assessment = {"soil": {}, "climate": {}, "land": {}, "biodiversity": {}}

    for dim in dimensions:
        for metric in dim.metrics:
            label = metric.label.lower()
            value = metric.value

            if dim.id == "soil":
                if "organic carbon" in label:
                    assessment["soil"]["organic_carbon"] = float(value) if value.replace(".", "").isdigit() else 0.3
                if "ph" in label:
                    assessment["soil"]["ph"] = float(value) if value.replace(".", "").isdigit() else 6.5
                if "moisture" in label:
                    assessment["soil"]["moisture"] = value.lower()
            elif dim.id == "climate":
                if "rainfall" in label:
                    try:
                        assessment["climate"]["rainfall"] = float(value)
                    except ValueError:
                        assessment["climate"]["rainfall_qualitative"] = value.lower()
                if "temperature" in label:
                    try:
                        assessment["climate"]["temperature"] = float(value)
                    except ValueError:
                        pass
                if "seasonality" in label:
                    assessment["climate"]["seasonality"] = value.lower()
            elif dim.id == "land":
                if "crop" in label:
                    assessment["land"]["crop"] = value
                    assessment["land"]["land_use"] = "agriculture"
                if "habitat diversity" in label:
                    assessment["land"]["habitat_diversity"] = value.lower()
                if "fragmentation" in label:
                    assessment["land"]["fragmentation"] = value.lower()
            elif dim.id == "biodiversity":
                if "species" in label:
                    assessment["biodiversity"]["species_richness"] = value.lower()
                if "pollinator" in label:
                    assessment["biodiversity"]["pollinator_presence"] = value.lower()
                if "native" in label:
                    try:
                        assessment["biodiversity"]["native_vegetation"] = float(value)
                    except ValueError:
                        pass

    # Apply scenario parameter overrides
    param_map = {
        "rainfall": ("climate", "rainfall"),
        "soil-carbon": ("soil", "organic_carbon"),
        "temperature": ("climate", "temperature"),
        "habitat-diversity": ("land", "habitat_diversity"),
        "land-intensity": ("land", "fragmentation"),
    }

    for param_id, value in params.items():
        mapping = param_map.get(param_id)
        if mapping:
            cat, key = mapping
            if param_id == "habitat-diversity":
                # Convert percentage to qualitative
                if value > 40:
                    assessment[cat][key] = "high"
                elif value > 20:
                    assessment[cat][key] = "moderate"
                else:
                    assessment[cat][key] = "low"
            elif param_id == "land-intensity":
                if value > 70:
                    assessment[cat][key] = "high"
                elif value > 40:
                    assessment[cat][key] = "moderate"
                else:
                    assessment[cat][key] = "low"
            elif param_id == "rainfall":
                # Value is percentage of baseline
                baseline_rf = assessment.get("climate", {}).get("rainfall", 680)
                try:
                    assessment[cat][key] = float(baseline_rf) * value / 100
                except (ValueError, TypeError):
                    pass
            elif param_id == "temperature":
                # Value is delta
                baseline_temp = assessment.get("climate", {}).get("temperature", 31)
                try:
                    assessment[cat][key] = float(baseline_temp) + value
                except (ValueError, TypeError):
                    pass
            else:
                assessment[cat][key] = value

    return assessment
