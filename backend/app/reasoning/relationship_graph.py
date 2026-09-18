"""
Deterministic ecological relationship graph.

Encodes known scientific relationships between environmental variables.
This is NOT LLM-generated — it's a hardcoded causal graph based on
established ecological principles.
"""
from typing import List, Dict, Optional, Tuple


class EcologicalRelationship:
    """A single directed ecological relationship."""
    def __init__(
        self,
        source: str,
        target: str,
        relationship: str,
        mechanism: str,
        direction: str = "positive",
        strength: str = "moderate",
        evidence_ids: Optional[List[str]] = None,
    ):
        self.source = source
        self.target = target
        self.relationship = relationship
        self.mechanism = mechanism
        self.direction = direction  # positive = source up → target up; negative = source up → target down
        self.strength = strength
        self.evidence_ids = evidence_ids or []


# The complete ecological relationship graph
ECOLOGICAL_RELATIONSHIPS: List[EcologicalRelationship] = [
    # Climate → Water
    EcologicalRelationship(
        source="rainfall",
        target="water_availability",
        relationship="drives",
        mechanism="Precipitation is the primary input to the water cycle, determining water availability for ecological processes",
        direction="positive",
        strength="strong",
        evidence_ids=["EVD-009", "EVD-014", "EVD-020"],
    ),
    EcologicalRelationship(
        source="temperature",
        target="water_availability",
        relationship="modulates",
        mechanism="Higher temperatures increase evapotranspiration, reducing effective water availability",
        direction="negative",
        strength="moderate",
        evidence_ids=["EVD-002", "EVD-009"],
    ),
    # Water → Soil
    EcologicalRelationship(
        source="water_availability",
        target="soil_moisture",
        relationship="determines",
        mechanism="Water availability directly controls soil moisture levels through infiltration and water table recharge",
        direction="positive",
        strength="strong",
        evidence_ids=["EVD-014", "EVD-020"],
    ),
    # Soil moisture → Biology
    EcologicalRelationship(
        source="soil_moisture",
        target="soil_biology",
        relationship="regulates",
        mechanism="Soil moisture regulates microbial activity, decomposition rates, and nutrient mineralization processes",
        direction="positive",
        strength="strong",
        evidence_ids=["EVD-007", "EVD-010", "EVD-019"],
    ),
    # Soil biology → Carbon
    EcologicalRelationship(
        source="soil_biology",
        target="soil_organic_carbon",
        relationship="builds",
        mechanism="Soil biological activity drives organic matter decomposition and humification, building stable soil carbon pools",
        direction="positive",
        strength="strong",
        evidence_ids=["EVD-001", "EVD-007", "EVD-010"],
    ),
    # SOC → Water retention (feedback loop)
    EcologicalRelationship(
        source="soil_organic_carbon",
        target="soil_moisture",
        relationship="enhances",
        mechanism="Soil organic carbon improves soil structure and water holding capacity, increasing moisture retention",
        direction="positive",
        strength="moderate",
        evidence_ids=["EVD-001", "EVD-012", "EVD-014"],
    ),
    # Land use effects
    EcologicalRelationship(
        source="monoculture",
        target="soil_biology",
        relationship="simplifies",
        mechanism="Monoculture reduces root exudate diversity and organic matter input variety, simplifying soil microbial communities",
        direction="negative",
        strength="moderate",
        evidence_ids=["EVD-004", "EVD-015"],
    ),
    EcologicalRelationship(
        source="monoculture",
        target="habitat_diversity",
        relationship="reduces",
        mechanism="Monoculture eliminates structural habitat heterogeneity required by diverse species assemblages",
        direction="negative",
        strength="strong",
        evidence_ids=["EVD-003", "EVD-005"],
    ),
    EcologicalRelationship(
        source="monoculture",
        target="pollinator_resources",
        relationship="limits",
        mechanism="Monoculture provides floral resources only during crop flowering, creating temporal gaps in pollinator support",
        direction="negative",
        strength="moderate",
        evidence_ids=["EVD-005", "EVD-015"],
    ),
    # Water → Species
    EcologicalRelationship(
        source="water_availability",
        target="species_survival",
        relationship="constrains",
        mechanism="Water availability constrains vegetation growth and habitat quality, influencing species survival capacity",
        direction="positive",
        strength="strong",
        evidence_ids=["EVD-009", "EVD-020"],
    ),
    # Biodiversity pathways
    EcologicalRelationship(
        source="habitat_diversity",
        target="species_richness",
        relationship="supports",
        mechanism="Diverse habitats provide varied ecological niches, supporting higher species richness and functional diversity",
        direction="positive",
        strength="strong",
        evidence_ids=["EVD-003", "EVD-006"],
    ),
    EcologicalRelationship(
        source="habitat_diversity",
        target="pollinator_resources",
        relationship="provides",
        mechanism="Habitat diversity provides continuous floral resources, nesting sites, and foraging habitat for pollinators",
        direction="positive",
        strength="strong",
        evidence_ids=["EVD-005", "EVD-008"],
    ),
    EcologicalRelationship(
        source="pollinator_resources",
        target="biodiversity",
        relationship="supports",
        mechanism="Pollinator populations support plant reproduction and food web integrity essential for broader biodiversity",
        direction="positive",
        strength="moderate",
        evidence_ids=["EVD-005"],
    ),
    EcologicalRelationship(
        source="species_richness",
        target="biodiversity",
        relationship="constitutes",
        mechanism="Species richness is a primary component of overall biodiversity",
        direction="positive",
        strength="strong",
        evidence_ids=["EVD-003"],
    ),
    EcologicalRelationship(
        source="species_survival",
        target="biodiversity",
        relationship="maintains",
        mechanism="Species population persistence maintains biodiversity over time",
        direction="positive",
        strength="strong",
        evidence_ids=["EVD-003", "EVD-006"],
    ),
    # Fragmentation
    EcologicalRelationship(
        source="fragmentation",
        target="habitat_connectivity",
        relationship="disrupts",
        mechanism="Fragmentation isolates habitat patches, reducing species movement, gene flow, and recolonization capacity",
        direction="negative",
        strength="strong",
        evidence_ids=["EVD-006"],
    ),
    EcologicalRelationship(
        source="habitat_connectivity",
        target="species_richness",
        relationship="enables",
        mechanism="Habitat connectivity enables species dispersal, gene flow, and recolonization of locally extinct populations",
        direction="positive",
        strength="strong",
        evidence_ids=["EVD-006", "EVD-008"],
    ),
    # SOC → Biodiversity
    EcologicalRelationship(
        source="soil_organic_carbon",
        target="biodiversity",
        relationship="supports",
        mechanism="Soil organic carbon supports soil food webs and vegetation productivity that underpin above-ground biodiversity",
        direction="positive",
        strength="moderate",
        evidence_ids=["EVD-007", "EVD-010"],
    ),
    # Biodiversity → Resilience
    EcologicalRelationship(
        source="biodiversity",
        target="ecosystem_resilience",
        relationship="provides",
        mechanism="Biodiversity provides functional redundancy, enabling ecosystems to maintain function under disturbance",
        direction="positive",
        strength="strong",
        evidence_ids=["EVD-003", "EVD-010"],
    ),
    EcologicalRelationship(
        source="soil_organic_carbon",
        target="ecosystem_resilience",
        relationship="supports",
        mechanism="Soil organic carbon underpins soil function, water retention, and nutrient cycling that support ecosystem stability",
        direction="positive",
        strength="moderate",
        evidence_ids=["EVD-001", "EVD-010"],
    ),
    # Human impact
    EcologicalRelationship(
        source="pollution",
        target="soil_biology",
        relationship="degrades",
        mechanism="Chemical pollution disrupts soil microbial communities and invertebrate populations",
        direction="negative",
        strength="moderate",
        evidence_ids=["EVD-016"],
    ),
    EcologicalRelationship(
        source="pollution",
        target="species_richness",
        relationship="reduces",
        mechanism="Pollution causes direct toxicity and indirect habitat degradation affecting species populations",
        direction="negative",
        strength="moderate",
        evidence_ids=["EVD-016"],
    ),
    EcologicalRelationship(
        source="deforestation",
        target="habitat_diversity",
        relationship="eliminates",
        mechanism="Deforestation removes forest habitat structure and the species assemblages it supports",
        direction="negative",
        strength="strong",
        evidence_ids=["EVD-017", "EVD-013"],
    ),
    EcologicalRelationship(
        source="deforestation",
        target="soil_organic_carbon",
        relationship="depletes",
        mechanism="Forest removal reduces organic matter inputs and exposes soil to accelerated decomposition and erosion",
        direction="negative",
        strength="strong",
        evidence_ids=["EVD-017"],
    ),
    # Native vegetation
    EcologicalRelationship(
        source="native_vegetation",
        target="habitat_diversity",
        relationship="provides",
        mechanism="Native vegetation provides habitat structure, food resources, and ecological niches for diverse species",
        direction="positive",
        strength="strong",
        evidence_ids=["EVD-008", "EVD-018"],
    ),
    EcologicalRelationship(
        source="native_vegetation",
        target="pollinator_resources",
        relationship="sustains",
        mechanism="Native vegetation provides diverse floral resources across seasons supporting pollinator communities",
        direction="positive",
        strength="strong",
        evidence_ids=["EVD-005", "EVD-008"],
    ),
]


class RelationshipGraph:
    """Queryable ecological relationship graph."""

    def __init__(self):
        self._relationships = ECOLOGICAL_RELATIONSHIPS
        self._by_source: Dict[str, List[EcologicalRelationship]] = {}
        self._by_target: Dict[str, List[EcologicalRelationship]] = {}

        for rel in self._relationships:
            self._by_source.setdefault(rel.source, []).append(rel)
            self._by_target.setdefault(rel.target, []).append(rel)

    def get_downstream(self, variable: str) -> List[EcologicalRelationship]:
        """Get all relationships where this variable is the source."""
        return self._by_source.get(variable, [])

    def get_upstream(self, variable: str) -> List[EcologicalRelationship]:
        """Get all relationships where this variable is the target."""
        return self._by_target.get(variable, [])

    def get_all_relationships(self) -> List[EcologicalRelationship]:
        return list(self._relationships)

    def trace_causal_path(self, start: str, end: str, max_depth: int = 6) -> List[List[str]]:
        """Find causal paths from start to end variable."""
        paths = []
        self._dfs(start, end, [start], set(), paths, max_depth)
        return paths

    def _dfs(self, current: str, target: str, path: List[str],
             visited: set, all_paths: List[List[str]], max_depth: int):
        if len(path) > max_depth:
            return
        if current == target and len(path) > 1:
            all_paths.append(list(path))
            return
        for rel in self.get_downstream(current):
            if rel.target not in visited:
                visited.add(rel.target)
                path.append(rel.target)
                self._dfs(rel.target, target, path, visited, all_paths, max_depth)
                path.pop()
                visited.discard(rel.target)

    def get_evidence_ids_for_path(self, path: List[str]) -> List[str]:
        """Get all evidence IDs supporting relationships along a path."""
        ids = set()
        for i in range(len(path) - 1):
            for rel in self.get_downstream(path[i]):
                if rel.target == path[i + 1]:
                    ids.update(rel.evidence_ids)
        return sorted(ids)


# Singleton
relationship_graph = RelationshipGraph()
