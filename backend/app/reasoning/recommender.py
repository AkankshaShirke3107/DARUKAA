"""
Recommendation engine — generates evidence-backed ecological interventions.

Maps detected interactions to specific, actionable recommendations.
Every recommendation references supporting evidence IDs.
"""
from typing import List, Set
from ..models.responses import (
    InterventionResponse, ImpactMetric, AnalysisInteraction,
    AnalysisImplication, DimensionData, MetricData,
)


# Recommendation templates activated by specific interaction patterns
RECOMMENDATION_TEMPLATES = [
    {
        "id": "INT-001",
        "title": "Introduce diversified cropping and native vegetation strips",
        "triggers": ["monoculture_habitat", "fragmentation_biodiversity"],
        "trigger_variables": ["monoculture", "habitat_diversity", "pollinator_resources"],
        "why": "Monoculture cultivation combined with low habitat diversity has created a simplified landscape with limited ecological function. Diversifying crops and introducing native vegetation strips along field margins would increase habitat heterogeneity, support pollinator populations, and improve soil biological activity through varied root systems and organic matter inputs.",
        "impacts": [
            {"metric": "Soil organic carbon", "direction": "up", "magnitude": "high"},
            {"metric": "Habitat diversity", "direction": "up", "magnitude": "high"},
            {"metric": "Pollinator resources", "direction": "up", "magnitude": "high"},
            {"metric": "Species richness", "direction": "up", "magnitude": "moderate"},
            {"metric": "Soil moisture", "direction": "up", "magnitude": "moderate"},
        ],
        "timeHorizon": "medium",
        "evidenceStrength": "strong",
        "evidence_ids": ["EVD-004", "EVD-008", "EVD-003", "EVD-015"],
        "priority": 1,
    },
    {
        "id": "INT-002",
        "title": "Implement soil carbon restoration through cover cropping",
        "triggers": ["water_soil_carbon", "soil_carbon_biodiversity"],
        "trigger_variables": ["soil_organic_carbon", "soil_moisture", "soil_biology"],
        "why": "Soil organic carbon is critically low for this ecosystem type. Cover cropping during fallow periods would increase organic matter inputs, protect soil from erosion, improve moisture retention through mulch effects, and stimulate soil microbial communities essential for nutrient cycling.",
        "impacts": [
            {"metric": "Soil organic carbon", "direction": "up", "magnitude": "high"},
            {"metric": "Soil moisture", "direction": "up", "magnitude": "high"},
            {"metric": "Soil biology", "direction": "up", "magnitude": "high"},
            {"metric": "Water retention", "direction": "up", "magnitude": "moderate"},
        ],
        "timeHorizon": "medium",
        "evidenceStrength": "strong",
        "evidence_ids": ["EVD-001", "EVD-007", "EVD-010", "EVD-012"],
        "priority": 2,
    },
    {
        "id": "INT-003",
        "title": "Establish ecological corridors between habitat patches",
        "triggers": ["fragmentation_biodiversity"],
        "trigger_variables": ["fragmentation", "habitat_connectivity", "species_richness"],
        "why": "High habitat fragmentation is isolating remaining native vegetation into disconnected patches. Establishing linear corridors of native species between patches would restore ecological connectivity, enable species dispersal, and increase effective habitat area for wildlife populations.",
        "impacts": [
            {"metric": "Ecological connectivity", "direction": "up", "magnitude": "high"},
            {"metric": "Species richness", "direction": "up", "magnitude": "moderate"},
            {"metric": "Habitat diversity", "direction": "up", "magnitude": "moderate"},
            {"metric": "Native vegetation", "direction": "up", "magnitude": "moderate"},
        ],
        "timeHorizon": "long",
        "evidenceStrength": "moderate",
        "evidence_ids": ["EVD-006", "EVD-008", "EVD-018"],
        "priority": 3,
    },
    {
        "id": "INT-004",
        "title": "Adopt water harvesting and soil moisture conservation",
        "triggers": ["water_soil_carbon", "water_stress_biodiversity"],
        "trigger_variables": ["rainfall", "water_availability", "soil_moisture"],
        "why": "With limited rainfall and high seasonality, water stress is a primary limiting factor. In-situ water harvesting techniques combined with mulching and reduced tillage would maximize the ecological benefit of available precipitation and reduce drought vulnerability.",
        "impacts": [
            {"metric": "Soil moisture", "direction": "up", "magnitude": "high"},
            {"metric": "Water stress", "direction": "down", "magnitude": "high"},
            {"metric": "Drought resilience", "direction": "up", "magnitude": "moderate"},
            {"metric": "Soil biology", "direction": "up", "magnitude": "moderate"},
        ],
        "timeHorizon": "short",
        "evidenceStrength": "strong",
        "evidence_ids": ["EVD-002", "EVD-009", "EVD-014"],
        "priority": 4,
    },
    {
        "id": "INT-005",
        "title": "Integrate agroforestry components into agricultural system",
        "triggers": ["monoculture_habitat", "soil_carbon_biodiversity"],
        "trigger_variables": ["land_use", "habitat_diversity", "soil_organic_carbon"],
        "why": "Integrating trees with crops can simultaneously increase habitat structure, improve soil carbon stocks, and moderate microclimate. Agroforestry provides continuous organic matter inputs and creates vertical habitat complexity absent in monoculture systems.",
        "impacts": [
            {"metric": "Habitat diversity", "direction": "up", "magnitude": "high"},
            {"metric": "Soil organic carbon", "direction": "up", "magnitude": "moderate"},
            {"metric": "Biodiversity", "direction": "up", "magnitude": "moderate"},
            {"metric": "Microclimate", "direction": "up", "magnitude": "moderate"},
        ],
        "timeHorizon": "long",
        "evidenceStrength": "strong",
        "evidence_ids": ["EVD-011", "EVD-004"],
        "priority": 5,
    },
    {
        "id": "INT-006",
        "title": "Reduce pollution through integrated pest management",
        "triggers": ["pollution_biodiversity"],
        "trigger_variables": ["pollution", "soil_biology", "species_richness"],
        "why": "Reducing chemical inputs through integrated pest management approaches would decrease pollution pressure on non-target organisms while maintaining crop protection. Precision application and biological alternatives reduce ecological impact.",
        "impacts": [
            {"metric": "Soil biology", "direction": "up", "magnitude": "moderate"},
            {"metric": "Species richness", "direction": "up", "magnitude": "moderate"},
            {"metric": "Pollinator resources", "direction": "up", "magnitude": "moderate"},
        ],
        "timeHorizon": "short",
        "evidenceStrength": "moderate",
        "evidence_ids": ["EVD-016"],
        "priority": 3,
    },
    {
        "id": "INT-007",
        "title": "Restore native vegetation on degraded areas",
        "triggers": ["deforestation_cascade", "fragmentation_biodiversity"],
        "trigger_variables": ["native_vegetation", "habitat_diversity", "deforestation"],
        "why": "Restoration of native vegetation on degraded or deforested areas would rebuild habitat structure, increase soil organic carbon inputs, and create functional habitat for local species. Prioritizing restoration in areas that connect existing habitat patches maximises biodiversity benefit.",
        "impacts": [
            {"metric": "Native vegetation", "direction": "up", "magnitude": "high"},
            {"metric": "Habitat diversity", "direction": "up", "magnitude": "high"},
            {"metric": "Soil organic carbon", "direction": "up", "magnitude": "moderate"},
            {"metric": "Biodiversity", "direction": "up", "magnitude": "moderate"},
        ],
        "timeHorizon": "long",
        "evidenceStrength": "strong",
        "evidence_ids": ["EVD-018", "EVD-013", "EVD-008"],
        "priority": 2,
    },
]


def generate_recommendations(
    detected_interaction_ids: List[str],
    dimensions: List[DimensionData],
    assessment: dict,
) -> List[InterventionResponse]:
    """
    Generate recommendations based on detected interactions.
    Each recommendation is linked to specific interactions and evidence.
    """
    # Collect all stressed variables
    stressed_vars: Set[str] = set()
    for dim in dimensions:
        for m in dim.metrics:
            if m.status in ("poor", "critical"):
                stressed_vars.add(m.label.lower().replace(" ", "_"))

    # Also derive variables from assessment
    land = assessment.get("land", {}) or {}
    if land.get("land_use", "").lower() == "agriculture":
        stressed_vars.add("monoculture")
    if land.get("fragmentation", "").lower() in ("high", "severe"):
        stressed_vars.add("fragmentation")

    human = assessment.get("human_impact", {}) or {}
    if human.get("pollution", "").lower() in ("moderate", "high"):
        stressed_vars.add("pollution")
    if human.get("deforestation", "").lower() in ("moderate", "high", "severe"):
        stressed_vars.add("deforestation")

    results: List[InterventionResponse] = []

    for template in RECOMMENDATION_TEMPLATES:
        # Check if this recommendation is relevant
        trigger_match = any(t in detected_interaction_ids for t in template["triggers"])
        variable_match = any(
            v.lower().replace(" ", "_") in stressed_vars or
            any(v.lower() in sv for sv in stressed_vars)
            for v in template["trigger_variables"]
        )

        if trigger_match or variable_match:
            results.append(InterventionResponse(
                id=template["id"],
                title=template["title"],
                why=template["why"],
                impacts=[ImpactMetric(**imp) for imp in template["impacts"]],
                timeHorizon=template["timeHorizon"],
                evidenceStrength=template["evidenceStrength"],
                supportingEvidence=template["evidence_ids"],
                priority=template["priority"],
            ))

    # Sort by priority
    results.sort(key=lambda r: r.priority)

    # Re-number priorities
    for i, r in enumerate(results):
        r.priority = i + 1

    return results
