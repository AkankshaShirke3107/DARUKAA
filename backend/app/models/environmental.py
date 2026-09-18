"""Pydantic models for environmental input data."""
from pydantic import BaseModel, Field
from typing import Optional


class SoilInput(BaseModel):
    ph: Optional[float] = Field(None, description="Soil pH value (0-14)")
    organic_carbon: Optional[float] = Field(None, description="Soil organic carbon percentage")
    moisture: Optional[str] = Field(None, description="Soil moisture level: very-low, low, moderate, adequate, high")
    nitrogen: Optional[float] = Field(None, description="Nitrogen in kg/ha")
    phosphorus: Optional[float] = Field(None, description="Phosphorus in kg/ha")


class ClimateInput(BaseModel):
    temperature: Optional[float] = Field(None, description="Mean temperature in °C")
    rainfall: Optional[float] = Field(None, description="Annual rainfall in mm or qualitative: low, moderate, high")
    rainfall_qualitative: Optional[str] = Field(None, description="Qualitative rainfall: low, moderate, high")
    seasonality: Optional[str] = Field(None, description="Seasonality: low, moderate, high")


class LandInput(BaseModel):
    land_use: Optional[str] = Field(None, description="Land use type")
    crop: Optional[str] = Field(None, description="Primary crop")
    habitat_diversity: Optional[str] = Field(None, description="Habitat diversity: very-low, low, moderate, high")
    fragmentation: Optional[str] = Field(None, description="Fragmentation: low, moderate, high")


class BiodiversityInput(BaseModel):
    species_richness: Optional[str] = Field(None, description="Species richness: very-low, low, moderate, high")
    pollinator_presence: Optional[str] = Field(None, description="Pollinator presence: absent, limited, moderate, abundant")
    native_vegetation: Optional[float] = Field(None, description="Native vegetation cover percentage")


class HumanImpactInput(BaseModel):
    pollution: Optional[str] = Field(None, description="Pollution level: none, low, moderate, high")
    deforestation: Optional[str] = Field(None, description="Deforestation: none, low, moderate, high, severe")


class LocationInput(BaseModel):
    region: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    ecosystem_type: Optional[str] = None


class AssessmentRequest(BaseModel):
    """Full environmental assessment request."""
    text: Optional[str] = Field(None, description="Natural language description of the environment")
    location: Optional[LocationInput] = None
    soil: Optional[SoilInput] = None
    climate: Optional[ClimateInput] = None
    land: Optional[LandInput] = None
    biodiversity: Optional[BiodiversityInput] = None
    human_impact: Optional[HumanImpactInput] = None


class ConversationMessageRequest(BaseModel):
    """Conversation message request."""
    conversation_id: Optional[str] = None
    message: str
    assessment_id: Optional[str] = None


class ScenarioRequest(BaseModel):
    """Scenario analysis request."""
    assessment_id: str
    parameters: dict = Field(default_factory=dict, description="Modified environmental parameters")
