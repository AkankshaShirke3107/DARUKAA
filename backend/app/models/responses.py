"""Pydantic response models — match existing frontend TypeScript interfaces exactly."""
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime


# --- Matches frontend MetricData / DimensionData ---
class MetricData(BaseModel):
    label: str
    value: str
    unit: Optional[str] = None
    status: Optional[Literal["good", "moderate", "poor", "critical"]] = None
    trend: Optional[Literal["up", "down", "stable"]] = None


class DimensionData(BaseModel):
    id: str
    title: str
    metrics: List[MetricData]


# --- Matches frontend GraphNode / GraphEdge ---
class GraphNode(BaseModel):
    id: str
    label: str
    x: float
    y: float
    category: Literal["climate", "soil", "biodiversity", "land", "outcome"]
    value: Optional[str] = None
    status: Optional[Literal["good", "moderate", "poor", "critical"]] = None
    description: str
    evidenceCount: int = 0


class GraphEdge(BaseModel):
    source: str
    target: str
    strength: Literal["strong", "moderate", "weak"]
    type: Literal["positive", "negative", "neutral"]
    label: Optional[str] = None


# --- Matches frontend AnalysisObservation / AnalysisInteraction / AnalysisImplication ---
class AnalysisObservation(BaseModel):
    variable: str
    value: str
    status: Literal["good", "moderate", "poor", "critical"]


class AnalysisInteraction(BaseModel):
    title: str
    variables: List[str]
    description: str


class AnalysisImplication(BaseModel):
    title: str
    description: str
    severity: Literal["low", "moderate", "high", "critical"]


class SupportingEvidence(BaseModel):
    total: int
    strong: int
    moderate: int
    ids: List[str]


# --- Matches frontend EvidenceSource ---
class EvidenceResponse(BaseModel):
    id: str
    source: str
    title: str
    year: int
    topic: str
    variables: List[str]
    relevance: int
    evidenceType: Literal["meta-analysis", "field-study", "review", "model", "observational"]
    abstract: str
    category: Literal["soil", "climate", "biodiversity", "land", "human-impact"]


# --- Matches frontend Intervention ---
class ImpactMetric(BaseModel):
    metric: str
    direction: Literal["up", "down", "stable"]
    magnitude: Literal["high", "moderate", "low"]


class InterventionResponse(BaseModel):
    id: str
    title: str
    why: str
    impacts: List[ImpactMetric]
    timeHorizon: Literal["short", "medium", "long"]
    evidenceStrength: Literal["strong", "moderate", "limited"]
    supportingEvidence: List[str]
    priority: int


# --- Matches frontend ScenarioResult ---
class ScenarioResultItem(BaseModel):
    metric: str
    current: float
    scenario: float
    unit: str
    direction: Literal["better", "worse", "neutral"]


# --- Matches frontend AssessmentRecord ---
class AssessmentRecord(BaseModel):
    id: str
    name: str
    region: str
    ecosystem: str
    created: str
    status: Literal["analysed", "draft", "in-progress"]


# --- Scientist conversation ---
class ScientistOption(BaseModel):
    value: str
    label: str


class ScientistConversation(BaseModel):
    message: str
    question: Optional[str] = None
    options: Optional[List[ScientistOption]] = None


# --- Reasoning chain ---
class ReasoningChain(BaseModel):
    observations: List[AnalysisObservation]
    interactions: List[AnalysisInteraction]
    implications: List[AnalysisImplication]
    supporting_evidence: SupportingEvidence


# --- Full assessment response ---
class FullAssessmentResponse(BaseModel):
    assessment_id: str
    environmental_state: List[DimensionData]
    relationships: dict  # {nodes: [], edges: []}
    reasoning: ReasoningChain
    recommendations: List[InterventionResponse]
    evidence: List[EvidenceResponse]
    missing_information: List[str]
    scientist: Optional[ScientistConversation] = None


# --- Scenario response ---
class ScenarioResponse(BaseModel):
    assessment_id: str
    baseline_results: List[ScenarioResultItem]
    scenario_results: List[ScenarioResultItem]
    reasoning_changes: List[str]
    evidence: List[EvidenceResponse]


# --- Conversation response ---
class ConversationResponse(BaseModel):
    conversation_id: str
    assessment_id: Optional[str] = None
    message: str
    question: Optional[str] = None
    options: Optional[List[ScientistOption]] = None
    extracted_variables: dict = Field(default_factory=dict)
    missing_information: List[str] = Field(default_factory=list)
