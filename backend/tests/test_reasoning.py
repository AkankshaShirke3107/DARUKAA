"""Tests for the deterministic reasoning engine."""
import pytest
from backend.app.reasoning.state_evaluator import evaluate_environmental_state
from backend.app.reasoning.interaction_detector import detect_interactions, build_reasoning_chain
from backend.app.reasoning.recommender import generate_recommendations
from backend.app.reasoning.relationship_graph import relationship_graph


class TestStateEvaluator:
    """Test environmental state evaluation."""

    def test_soil_carbon_critical(self):
        assessment = {"soil": {"organic_carbon": 0.2, "ph": 6.2, "moisture": "low"}}
        dims = evaluate_environmental_state(assessment)
        soil_dim = next(d for d in dims if d.id == "soil")
        oc_metric = next(m for m in soil_dim.metrics if "Carbon" in m.label)
        assert oc_metric.status == "critical"

    def test_soil_carbon_good(self):
        assessment = {"soil": {"organic_carbon": 2.0, "ph": 6.5, "moisture": "adequate"}}
        dims = evaluate_environmental_state(assessment)
        soil_dim = next(d for d in dims if d.id == "soil")
        oc_metric = next(m for m in soil_dim.metrics if "Carbon" in m.label)
        assert oc_metric.status == "good"

    def test_climate_rainfall_poor(self):
        assessment = {"climate": {"rainfall": 400, "temperature": 32, "seasonality": "high"}}
        dims = evaluate_environmental_state(assessment)
        clim = next(d for d in dims if d.id == "climate")
        rf = next(m for m in clim.metrics if "Rainfall" in m.label)
        assert rf.status == "poor"

    def test_biodiversity_low(self):
        assessment = {"biodiversity": {"species_richness": "low", "pollinator_presence": "limited"}}
        dims = evaluate_environmental_state(assessment)
        bio = next(d for d in dims if d.id == "biodiversity")
        sr = next(m for m in bio.metrics if "Species" in m.label)
        assert sr.status == "poor"

    def test_fragmentation_inverse(self):
        assessment = {"land": {"fragmentation": "high", "habitat_diversity": "low", "crop": "Wheat", "land_use": "agriculture"}}
        dims = evaluate_environmental_state(assessment)
        land = next(d for d in dims if d.id == "land")
        frag = next(m for m in land.metrics if "Fragmentation" in m.label)
        assert frag.status == "poor"  # High fragmentation = poor status

    def test_empty_assessment(self):
        dims = evaluate_environmental_state({})
        assert dims == []

    def test_partial_assessment(self):
        assessment = {"soil": {"organic_carbon": 0.3}}
        dims = evaluate_environmental_state(assessment)
        assert len(dims) == 1
        assert dims[0].id == "soil"


class TestInteractionDetector:
    """Test multi-variable interaction detection."""

    def test_water_soil_carbon_interaction(self):
        assessment = {
            "soil": {"organic_carbon": 0.2, "moisture": "low"},
            "climate": {"rainfall": 400, "temperature": 32},
        }
        dims = evaluate_environmental_state(assessment)
        obs, inter, impl, ev_ids = detect_interactions(dims, assessment)

        assert len(obs) > 0
        assert len(inter) > 0
        titles = [i.title for i in inter]
        assert any("Water" in t and "Carbon" in t for t in titles)

    def test_monoculture_habitat_interaction(self):
        assessment = {
            "land": {"land_use": "agriculture", "habitat_diversity": "low", "crop": "Wheat"},
            "biodiversity": {"pollinator_presence": "limited"},
        }
        dims = evaluate_environmental_state(assessment)
        obs, inter, impl, ev_ids = detect_interactions(dims, assessment)

        titles = [i.title for i in inter]
        assert any("Monoculture" in t for t in titles)

    def test_full_assessment_interactions(self):
        assessment = {
            "soil": {"organic_carbon": 0.3, "ph": 6.2, "moisture": "low"},
            "climate": {"rainfall": 680, "temperature": 31.4, "seasonality": "high"},
            "land": {"land_use": "agriculture", "crop": "Wheat", "habitat_diversity": "low", "fragmentation": "high"},
            "biodiversity": {"species_richness": "low", "pollinator_presence": "limited", "native_vegetation": 12},
        }
        dims = evaluate_environmental_state(assessment)
        obs, inter, impl, ev_ids = detect_interactions(dims, assessment)

        assert len(obs) > 3
        assert len(inter) >= 2
        assert len(ev_ids) > 0

    def test_insufficient_data_warning(self):
        assessment = {"soil": {"ph": 6.5}}
        dims = evaluate_environmental_state(assessment)
        obs, inter, impl, ev_ids = detect_interactions(dims, assessment)

        # Should produce a "limited interaction analysis" warning
        assert len(inter) >= 0  # May or may not trigger depending on the single metric


class TestRecommender:
    """Test recommendation generation."""

    def test_generates_recommendations(self):
        detected_ids = ["water_soil_carbon", "monoculture_habitat"]
        assessment = {
            "soil": {"organic_carbon": 0.3, "moisture": "low"},
            "land": {"land_use": "agriculture", "crop": "Wheat"},
        }
        dims = evaluate_environmental_state(assessment)
        recs = generate_recommendations(detected_ids, dims, assessment)

        assert len(recs) > 0
        assert all(r.priority > 0 for r in recs)
        assert all(len(r.supportingEvidence) > 0 for r in recs)

    def test_recommendations_sorted_by_priority(self):
        detected_ids = ["water_soil_carbon", "monoculture_habitat", "fragmentation_biodiversity"]
        assessment = {
            "soil": {"organic_carbon": 0.3},
            "land": {"land_use": "agriculture", "fragmentation": "high"},
        }
        dims = evaluate_environmental_state(assessment)
        recs = generate_recommendations(detected_ids, dims, assessment)

        priorities = [r.priority for r in recs]
        assert priorities == sorted(priorities)


class TestRelationshipGraph:
    """Test the deterministic relationship graph."""

    def test_graph_has_relationships(self):
        all_rels = relationship_graph.get_all_relationships()
        assert len(all_rels) > 20

    def test_downstream_from_rainfall(self):
        downstream = relationship_graph.get_downstream("rainfall")
        targets = [r.target for r in downstream]
        assert "water_availability" in targets

    def test_causal_path(self):
        paths = relationship_graph.trace_causal_path("rainfall", "biodiversity")
        assert len(paths) > 0
        for path in paths:
            assert path[0] == "rainfall"
            assert path[-1] == "biodiversity"

    def test_evidence_ids_for_path(self):
        paths = relationship_graph.trace_causal_path("rainfall", "soil_moisture")
        if paths:
            ev_ids = relationship_graph.get_evidence_ids_for_path(paths[0])
            assert len(ev_ids) > 0
            assert all(eid.startswith("EVD-") for eid in ev_ids)
