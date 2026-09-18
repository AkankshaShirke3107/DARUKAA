"""
State evaluator — classifies environmental metrics using documented thresholds.

Produces DimensionData[] matching the frontend's environmentalState format.
"""
from typing import List, Optional, Dict, Any
from ..models.responses import MetricData, DimensionData


# Threshold definitions based on established environmental science
# Sources: FAO soil classification, IPCC climate ranges, IPBES indicators
SOIL_THRESHOLDS = {
    "organic_carbon": [
        (0.0, 0.3, "critical", "Critically depleted"),
        (0.3, 0.6, "poor", "Low"),
        (0.6, 1.5, "moderate", "Moderate"),
        (1.5, float("inf"), "good", "Adequate"),
    ],
    "ph": [
        (0, 4.5, "critical", "Highly acidic"),
        (4.5, 5.5, "poor", "Acidic"),
        (5.5, 7.5, "moderate", "Near neutral"),
        (7.5, 8.5, "moderate", "Slightly alkaline"),
        (8.5, 14, "poor", "Alkaline"),
    ],
}

QUALITATIVE_STATUS = {
    "very-low": "critical",
    "low": "poor",
    "limited": "poor",
    "moderate": "moderate",
    "adequate": "good",
    "high": "moderate",  # high seasonality/fragmentation = not good
    "abundant": "good",
    "absent": "critical",
}

# For variables where "high" is bad (fragmentation, seasonality, land intensity)
INVERSE_STATUS = {
    "very-low": "good",
    "low": "good",
    "moderate": "moderate",
    "high": "poor",
    "severe": "critical",
}


def classify_numeric(value: float, thresholds: list) -> tuple:
    """Classify a numeric value using threshold ranges. Returns (status, description)."""
    for low, high, status, desc in thresholds:
        if low <= value < high:
            return status, desc
    return "moderate", "Unknown range"


def classify_qualitative(value: str, inverse: bool = False) -> str:
    """Classify a qualitative value to status."""
    v = value.lower().strip()
    if inverse:
        return INVERSE_STATUS.get(v, "moderate")
    return QUALITATIVE_STATUS.get(v, "moderate")


def evaluate_environmental_state(assessment: dict) -> List[DimensionData]:
    """
    Evaluate all environmental dimensions and produce structured state data
    matching the frontend's DimensionData[] format.
    """
    dimensions: List[DimensionData] = []

    # --- SOIL ---
    soil = assessment.get("soil", {}) or {}
    soil_metrics: List[MetricData] = []

    if soil.get("organic_carbon") is not None:
        try:
            oc = float(soil["organic_carbon"])
            status, _ = classify_numeric(oc, SOIL_THRESHOLDS["organic_carbon"])
            soil_metrics.append(MetricData(label="Organic Carbon", value=f"{oc:.2f}", unit="%", status=status))
        except (ValueError, TypeError):
            pass

    if soil.get("ph") is not None:
        try:
            ph = float(soil["ph"])
            status, _ = classify_numeric(ph, SOIL_THRESHOLDS["ph"])
            soil_metrics.append(MetricData(label="pH", value=f"{ph:.1f}", status=status))
        except (ValueError, TypeError):
            pass

    if soil.get("moisture"):
        moisture = soil["moisture"]
        status = classify_qualitative(str(moisture))
        label_val = str(moisture).capitalize()
        soil_metrics.append(MetricData(label="Moisture", value=label_val, status=status))

    if soil.get("nitrogen") is not None:
        try:
            n = float(soil["nitrogen"])
            status = "good" if n > 250 else "moderate" if n > 150 else "poor"
            soil_metrics.append(MetricData(label="Nitrogen", value=str(int(n)), unit="kg/ha", status=status))
        except (ValueError, TypeError):
            pass

    if soil.get("phosphorus") is not None:
        try:
            p = float(soil["phosphorus"])
            status = "good" if p > 25 else "moderate" if p > 15 else "poor"
            soil_metrics.append(MetricData(label="Phosphorus", value=str(int(p)), unit="kg/ha", status=status))
        except (ValueError, TypeError):
            pass

    if soil_metrics:
        dimensions.append(DimensionData(id="soil", title="SOIL", metrics=soil_metrics))

    # --- CLIMATE ---
    climate = assessment.get("climate", {}) or {}
    climate_metrics: List[MetricData] = []

    rainfall_val = climate.get("rainfall")
    rainfall_qual = climate.get("rainfall_qualitative")
    if rainfall_val is not None:
        try:
            rf = float(rainfall_val)
            status = "good" if rf > 1000 else "moderate" if rf > 600 else "poor"
            climate_metrics.append(MetricData(label="Rainfall", value=str(int(rf)), unit="mm/yr", status=status))
        except (ValueError, TypeError):
            if str(rainfall_val).lower() in QUALITATIVE_STATUS:
                status = classify_qualitative(str(rainfall_val))
                climate_metrics.append(MetricData(label="Rainfall", value=str(rainfall_val).capitalize(), status=status))
    elif rainfall_qual:
        status = classify_qualitative(rainfall_qual)
        climate_metrics.append(MetricData(label="Rainfall", value=rainfall_qual.capitalize(), status=status))

    if climate.get("temperature") is not None:
        try:
            temp = float(climate["temperature"])
            status = "good" if 15 <= temp <= 25 else "moderate" if 10 <= temp <= 35 else "poor"
            climate_metrics.append(MetricData(label="Temperature", value=f"{temp:.1f}", unit="°C", status=status))
        except (ValueError, TypeError):
            pass

    if climate.get("seasonality"):
        s = str(climate["seasonality"])
        status = classify_qualitative(s, inverse=True)
        climate_metrics.append(MetricData(label="Seasonality", value=s.capitalize(), status=status))

    # Derived: drought risk
    if rainfall_val is not None and climate.get("temperature") is not None:
        try:
            rf = float(rainfall_val)
            temp = float(climate["temperature"])
            if rf < 600 and temp > 30:
                climate_metrics.append(MetricData(label="Drought Risk", value="Elevated", status="poor"))
            elif rf < 800 and temp > 25:
                climate_metrics.append(MetricData(label="Drought Risk", value="Moderate", status="moderate"))
            else:
                climate_metrics.append(MetricData(label="Drought Risk", value="Low", status="good"))
        except (ValueError, TypeError):
            pass

    if climate_metrics:
        dimensions.append(DimensionData(id="climate", title="CLIMATE", metrics=climate_metrics))

    # --- LAND ---
    land = assessment.get("land", {}) or {}
    land_metrics: List[MetricData] = []

    if land.get("crop"):
        crop = str(land["crop"])
        # Check for monoculture
        is_mono = land.get("land_use", "").lower() in ("agriculture", "monoculture")
        status = "poor" if is_mono else "moderate"
        land_metrics.append(MetricData(label="Crop", value=crop, status=status))
        if is_mono:
            land_metrics.append(MetricData(label="Cultivation", value="Monoculture", status="poor"))

    if land.get("habitat_diversity"):
        hd = str(land["habitat_diversity"])
        status = classify_qualitative(hd)
        land_metrics.append(MetricData(label="Habitat Diversity", value=hd.capitalize(), status=status))

    if land.get("fragmentation"):
        frag = str(land["fragmentation"])
        status = classify_qualitative(frag, inverse=True)
        land_metrics.append(MetricData(label="Fragmentation", value=frag.capitalize(), status=status))

    if land_metrics:
        dimensions.append(DimensionData(id="land", title="LAND", metrics=land_metrics))

    # --- BIODIVERSITY ---
    bio = assessment.get("biodiversity", {}) or {}
    bio_metrics: List[MetricData] = []

    if bio.get("species_richness"):
        sr = str(bio["species_richness"])
        status = classify_qualitative(sr)
        bio_metrics.append(MetricData(label="Species Richness", value=sr.capitalize(), status=status))

    if bio.get("pollinator_presence"):
        pp = str(bio["pollinator_presence"])
        status = classify_qualitative(pp)
        bio_metrics.append(MetricData(label="Pollinator Resources", value=pp.capitalize(), status=status))

    if bio.get("native_vegetation") is not None:
        try:
            nv = float(bio["native_vegetation"])
            status = "good" if nv > 30 else "moderate" if nv > 20 else "poor" if nv > 10 else "critical"
            bio_metrics.append(MetricData(label="Native Vegetation", value=str(int(nv)), unit="%", status=status))
        except (ValueError, TypeError):
            pass

    # Derived: ecological connectivity
    frag = land.get("fragmentation", "").lower()
    if frag:
        conn_status = "poor" if frag in ("high", "severe") else "moderate" if frag == "moderate" else "good"
        conn_value = "Fragmented" if frag in ("high", "severe") else "Partial" if frag == "moderate" else "Connected"
        bio_metrics.append(MetricData(label="Ecological Connectivity", value=conn_value, status=conn_status))

    if bio_metrics:
        dimensions.append(DimensionData(id="biodiversity", title="BIODIVERSITY", metrics=bio_metrics))

    return dimensions
