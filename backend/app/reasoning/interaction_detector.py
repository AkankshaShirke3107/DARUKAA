"""
Interaction detector — identifies multi-variable ecological interactions.

Uses the deterministic relationship graph to find activated pathways
based on the current environmental state. Requires ≥3 variables per interaction.
"""
from typing import List, Dict, Set, Optional
from ..models.responses import (
    AnalysisObservation, AnalysisInteraction, AnalysisImplication,
    SupportingEvidence, ReasoningChain, MetricData, DimensionData,
)
from .relationship_graph import relationship_graph, EcologicalRelationship


# Predefined interaction templates — activated when specific variable combinations are present
INTERACTION_TEMPLATES = [
    {
        "id": "water_soil_carbon",
        "title": "Water–Soil Carbon Feedback",
        "required_variables": ["rainfall", "soil_moisture", "soil_organic_carbon"],
        "trigger_conditions": {"rainfall": "poor", "soil_moisture": "poor", "soil_organic_carbon": "poor"},
        "variables_display": ["Rainfall", "Soil moisture", "Organic carbon"],
        "description": "Low rainfall limits soil moisture, reducing microbial activity and organic matter decomposition. This decreases soil organic carbon accumulation, which in turn reduces water retention capacity — creating a reinforcing degradation cycle.",
        "implication_title": "Soil degradation trajectory",
        "implication_desc": "Current organic carbon levels combined with water limitation suggest ongoing soil degradation. Without intervention, soil fertility, water retention, and biological activity may continue declining.",
        "severity": "critical",
        "evidence_ids": ["EVD-001", "EVD-007", "EVD-014", "EVD-020"],
    },
    {
        "id": "monoculture_habitat",
        "title": "Monoculture–Habitat Simplification",
        "required_variables": ["monoculture", "habitat_diversity", "pollinator_resources"],
        "trigger_conditions": {"monoculture": "poor", "habitat_diversity": "poor"},
        "variables_display": ["Monoculture", "Habitat diversity", "Pollinator resources"],
        "description": "Continuous monoculture eliminates habitat heterogeneity, reducing structural diversity needed by pollinating species. Limited floral resources outside crop flowering windows create temporal gaps in pollinator support.",
        "implication_title": "Declining pollination services",
        "implication_desc": "Continued monoculture with limited habitat diversity threatens pollinator populations, which may reduce crop productivity and compromise reproductive success of remaining native plant species.",
        "severity": "high",
        "evidence_ids": ["EVD-003", "EVD-005", "EVD-015"],
    },
    {
        "id": "fragmentation_biodiversity",
        "title": "Fragmentation–Biodiversity Cascade",
        "required_variables": ["fragmentation", "species_richness", "habitat_connectivity"],
        "trigger_conditions": {"fragmentation": "poor"},
        "variables_display": ["Habitat fragmentation", "Species richness", "Ecosystem resilience"],
        "description": "High fragmentation isolates remaining habitat patches, reducing gene flow and species dispersal capacity. Small, isolated populations face increased extinction risk, reducing overall ecosystem functional redundancy.",
        "implication_title": "Reduced ecological resilience",
        "implication_desc": "Habitat isolation combined with environmental stress creates conditions where the ecosystem has limited capacity to absorb disturbances. Recovery from drought or pest events would be significantly delayed.",
        "severity": "high",
        "evidence_ids": ["EVD-006", "EVD-008"],
    },
    {
        "id": "water_stress_biodiversity",
        "title": "Water Stress–Biodiversity Pressure",
        "required_variables": ["rainfall", "water_availability", "species_survival"],
        "trigger_conditions": {"rainfall": "poor"},
        "variables_display": ["Rainfall", "Water availability", "Species survival"],
        "description": "Limited rainfall reduces water availability across the landscape, creating water stress that constrains vegetation growth and species survival capacity. Species with narrow water tolerances are particularly affected.",
        "implication_title": "Climate-driven biodiversity pressure",
        "implication_desc": "Water limitation is a primary constraint on biological activity in this system. Under projected climate variability, water stress episodes may become more frequent and severe.",
        "severity": "high",
        "evidence_ids": ["EVD-002", "EVD-009", "EVD-020"],
    },
    {
        "id": "soil_carbon_biodiversity",
        "title": "Soil Carbon–Biodiversity Link",
        "required_variables": ["soil_organic_carbon", "soil_biology", "biodiversity"],
        "trigger_conditions": {"soil_organic_carbon": "poor"},
        "variables_display": ["Organic carbon", "Soil biology", "Biodiversity"],
        "description": "Depleted soil organic carbon reduces the energy substrate for soil biological communities, diminishing soil food web complexity. This affects nutrient cycling and vegetation productivity that supports above-ground biodiversity.",
        "implication_title": "Below-ground ecosystem decline",
        "implication_desc": "Soil biological communities are a foundation for ecosystem function. Continued carbon depletion may lead to cascading losses in soil biodiversity, nutrient cycling, and ecosystem service provision.",
        "severity": "high",
        "evidence_ids": ["EVD-007", "EVD-010"],
    },
    {
        "id": "pollution_biodiversity",
        "title": "Pollution–Biodiversity Impact",
        "required_variables": ["pollution", "soil_biology", "species_richness"],
        "trigger_conditions": {"pollution": "poor"},
        "variables_display": ["Pollution", "Soil biology", "Species richness"],
        "description": "Chemical pollution disrupts soil microbial communities and non-target organisms including invertebrates and pollinators. Chronic exposure to sub-lethal concentrations can compromise population viability.",
        "implication_title": "Pollution-mediated ecosystem stress",
        "implication_desc": "Pollution adds an additional stressor to already stressed ecosystems. Reducing pollution loads would allow partial recovery of biological communities.",
        "severity": "moderate",
        "evidence_ids": ["EVD-016"],
    },
    {
        "id": "deforestation_cascade",
        "title": "Deforestation–Habitat Loss Cascade",
        "required_variables": ["deforestation", "habitat_diversity", "soil_organic_carbon"],
        "trigger_conditions": {"deforestation": "poor"},
        "variables_display": ["Deforestation", "Habitat diversity", "Soil carbon"],
        "description": "Forest removal eliminates habitat structure, reduces organic matter inputs to soil, and exposes soil to accelerated decomposition and erosion. This simultaneously impacts biodiversity and soil health.",
        "implication_title": "Compound habitat and soil degradation",
        "implication_desc": "Deforestation drives simultaneous biodiversity loss and soil degradation. Recovery requires both vegetation restoration and soil rehabilitation, which occurs over longer timeframes.",
        "severity": "critical",
        "evidence_ids": ["EVD-013", "EVD-017"],
    },
]


def _extract_variable_statuses(dimensions: List[DimensionData], assessment: dict) -> Dict[str, str]:
    """Extract variable → status mapping from evaluated dimensions and raw assessment data."""
    statuses: Dict[str, str] = {}

    for dim in dimensions:
        for metric in dim.metrics:
            if metric.status:
                # Map metric labels to variable names
                key = metric.label.lower().replace(" ", "_")
                statuses[key] = metric.status

    # Also add derived variables
    land = assessment.get("land", {}) or {}
    if land.get("land_use", "").lower() in ("agriculture",) and land.get("habitat_diversity", "").lower() in ("low", "very-low"):
        statuses["monoculture"] = "poor"

    if land.get("fragmentation", "").lower() in ("high", "severe"):
        statuses["fragmentation"] = "poor"
        statuses["habitat_connectivity"] = "poor"

    # Derive some implicit variables from explicit ones
    if statuses.get("rainfall") == "poor" or statuses.get("moisture") == "poor":
        statuses["water_availability"] = "poor"
        statuses["soil_moisture"] = statuses.get("moisture", "poor")

    if statuses.get("species_richness") in ("poor", "critical"):
        statuses["species_survival"] = "poor"

    if statuses.get("organic_carbon") in ("poor", "critical"):
        statuses["soil_organic_carbon"] = statuses["organic_carbon"]
        statuses["soil_biology"] = "poor"

    if statuses.get("habitat_diversity") in ("poor", "critical"):
        statuses["habitat_diversity"] = statuses["habitat_diversity"]

    if statuses.get("pollinator_resources") in ("poor", "critical"):
        statuses["pollinator_resources"] = statuses["pollinator_resources"]

    # Human impact
    human = assessment.get("human_impact", {}) or {}
    if human.get("pollution", "").lower() in ("moderate", "high"):
        statuses["pollution"] = "poor" if human["pollution"].lower() == "high" else "moderate"
    if human.get("deforestation", "").lower() in ("moderate", "high", "severe"):
        statuses["deforestation"] = "poor" if human["deforestation"].lower() in ("high", "severe") else "moderate"

    return statuses


def detect_interactions(
    dimensions: List[DimensionData],
    assessment: dict,
) -> tuple:
    """
    Detect activated multi-variable interactions.
    Returns (observations, interactions, implications, evidence_ids)
    """
    statuses = _extract_variable_statuses(dimensions, assessment)

    # Build observations from dimensions
    observations: List[AnalysisObservation] = []
    for dim in dimensions:
        for metric in dim.metrics:
            if metric.status and metric.status in ("poor", "critical"):
                value_str = metric.value
                if metric.unit:
                    value_str += f" {metric.unit}"
                # Add contextual description
                if metric.status == "critical":
                    value_str += " — critically depleted" if "carbon" in metric.label.lower() else " — critical"
                elif metric.status == "poor":
                    value_str += " — below adequate"
                observations.append(AnalysisObservation(
                    variable=metric.label,
                    value=value_str,
                    status=metric.status,
                ))

    # Detect activated interaction templates
    interactions: List[AnalysisInteraction] = []
    implications: List[AnalysisImplication] = []
    all_evidence_ids: Set[str] = set()

    for template in INTERACTION_TEMPLATES:
        # Check if trigger conditions are met
        triggered = True
        for var, required_status in template["trigger_conditions"].items():
            # Check both the var name and common aliases
            actual = statuses.get(var)
            if actual is None:
                # Try without prefix
                for k, v in statuses.items():
                    if var in k or k in var:
                        actual = v
                        break
            if actual is None or _severity_rank(actual) < _severity_rank(required_status):
                triggered = False
                break

        if triggered:
            interactions.append(AnalysisInteraction(
                title=template["title"],
                variables=template["variables_display"],
                description=template["description"],
            ))
            implications.append(AnalysisImplication(
                title=template["implication_title"],
                description=template["implication_desc"],
                severity=template["severity"],
            ))
            all_evidence_ids.update(template["evidence_ids"])

    # If no multi-variable interactions detected (insufficient data), note it
    if not interactions and observations:
        interactions.append(AnalysisInteraction(
            title="Limited interaction analysis",
            variables=[o.variable for o in observations[:3]],
            description="Insufficient environmental variables provided to identify multi-variable interactions. Additional data on soil, climate, land use, or biodiversity would enable more comprehensive ecological reasoning.",
        ))

    return observations, interactions, implications, sorted(all_evidence_ids)


def _severity_rank(status: str) -> int:
    return {"good": 0, "moderate": 1, "poor": 2, "critical": 3}.get(status, 0)


def build_reasoning_chain(
    observations: List[AnalysisObservation],
    interactions: List[AnalysisInteraction],
    implications: List[AnalysisImplication],
    evidence_ids: List[str],
) -> ReasoningChain:
    """Build the complete reasoning chain response."""
    strong = len([e for e in evidence_ids if e in (
        "EVD-001", "EVD-002", "EVD-003", "EVD-006", "EVD-007", "EVD-009", "EVD-010"
    )])
    moderate = len(evidence_ids) - strong

    return ReasoningChain(
        observations=observations,
        interactions=interactions,
        implications=implications,
        supporting_evidence=SupportingEvidence(
            total=len(evidence_ids),
            strong=strong,
            moderate=moderate,
            ids=evidence_ids,
        ),
    )
