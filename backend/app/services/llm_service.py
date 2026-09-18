"""LLM service — Gemini integration for natural language generation."""
import google.generativeai as genai
from typing import Optional, List
from ..config import get_settings


class LLMService:
    """Generates natural-language explanations using retrieved evidence and structured reasoning."""

    def __init__(self):
        self._model = None
        self._available = False
        self._init()

    def _init(self):
        settings = get_settings()
        if settings.llm_api_key:
            try:
                genai.configure(api_key=settings.llm_api_key)
                self._model = genai.GenerativeModel(settings.llm_model)
                self._available = True
                print(f"LLM service initialized: {settings.llm_model}")
            except Exception as e:
                print(f"LLM service unavailable: {e}")
                self._available = False
        else:
            print("LLM service: no API key configured, using template fallback")

    @property
    def available(self) -> bool:
        return self._available

    async def generate_scientist_message(
        self,
        observations: list,
        interactions: list,
        missing_vars: list,
    ) -> dict:
        """Generate the AI Environmental Scientist response."""
        if not self._available:
            return self._fallback_scientist(observations, interactions, missing_vars)

        try:
            obs_text = "\n".join(f"- {o.variable}: {o.value}" for o in observations)
            int_text = "\n".join(f"- {i.title}: {i.description[:120]}..." for i in interactions)
            missing_text = ", ".join(missing_vars) if missing_vars else "None"

            prompt = f"""You are an environmental scientist analyzing an ecosystem assessment.

OBSERVATIONS:
{obs_text}

IDENTIFIED INTERACTIONS:
{int_text}

MISSING INFORMATION: {missing_text}

Write a brief, professional scientific analysis message (3-4 sentences) that:
1. Summarizes the key environmental patterns observed
2. Identifies the most critical interaction
3. If information is missing, ask ONE specific targeted question about the most important missing variable

Do NOT use AI-marketing language. Write like a field scientist.
Do NOT mention that you are an AI.
Keep the response under 120 words."""

            response = await self._model.generate_content_async(prompt)
            text = response.text.strip()

            question = None
            options = None
            if missing_vars:
                question, options = self._generate_question(missing_vars[0])

            return {
                "message": text,
                "question": question,
                "options": options,
            }
        except Exception as e:
            print(f"LLM generation failed: {e}")
            return self._fallback_scientist(observations, interactions, missing_vars)

    async def generate_conversation_response(
        self,
        user_message: str,
        context: dict,
        evidence_texts: list,
    ) -> str:
        """Generate a conversational response using context and evidence."""
        if not self._available:
            return self._fallback_conversation(user_message, context)

        try:
            ctx_text = "\n".join(f"- {k}: {v}" for k, v in context.items() if v)
            ev_text = "\n".join(f"[{e['id']}] {e['text'][:200]}" for e in evidence_texts[:3])

            prompt = f"""You are an environmental scientist helping a land manager understand their ecosystem.

KNOWN CONTEXT:
{ctx_text}

RETRIEVED EVIDENCE:
{ev_text}

USER MESSAGE: {user_message}

Respond professionally as an environmental scientist. Reference evidence where relevant.
If critical information is missing, ask a targeted question.
Keep the response under 150 words. Be specific, not generic."""

            response = await self._model.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"LLM conversation failed: {e}")
            return self._fallback_conversation(user_message, context)

    def _fallback_scientist(self, observations, interactions, missing_vars):
        """Template-based fallback when LLM is unavailable."""
        obs_summary = ", ".join(o.variable.lower() for o in observations[:3]) if observations else "limited data"
        int_summary = interactions[0].title if interactions else "insufficient data for interaction analysis"

        message = f"Based on the environmental state analysis, I observe stress indicators in {obs_summary}. The primary interaction identified is: {int_summary}."

        if missing_vars:
            message += f" To improve the analysis, additional information about {missing_vars[0].replace('_', ' ')} would be valuable."

        question = None
        options = None
        if missing_vars:
            question, options = self._generate_question(missing_vars[0])

        return {"message": message, "question": question, "options": options}

    def _fallback_conversation(self, user_message: str, context: dict) -> str:
        known = [f"{k.replace('_', ' ')}: {v}" for k, v in context.items() if v]
        if known:
            return f"Based on the current assessment context ({', '.join(known[:3])}), I can provide analysis. Could you clarify what specific ecological aspect you would like to explore?"
        return "I need more environmental context to provide a meaningful analysis. Could you describe the ecosystem type, soil conditions, or land use pattern?"

    def _generate_question(self, missing_var: str):
        """Generate a targeted question for a missing variable."""
        questions = {
            "soil_organic_carbon": ("What is the approximate soil organic carbon percentage?", [
                {"value": "below-0.3", "label": "Below 0.3%"},
                {"value": "0.3-0.6", "label": "0.3–0.6%"},
                {"value": "0.6-1.5", "label": "0.6–1.5%"},
                {"value": "above-1.5", "label": "Above 1.5%"},
            ]),
            "rainfall": ("What is the approximate annual rainfall?", [
                {"value": "below-400", "label": "Below 400 mm"},
                {"value": "400-800", "label": "400–800 mm"},
                {"value": "800-1200", "label": "800–1,200 mm"},
                {"value": "above-1200", "label": "Above 1,200 mm"},
            ]),
            "habitat_diversity": ("How would you describe the habitat diversity?", [
                {"value": "low", "label": "Low — simplified landscape"},
                {"value": "moderate", "label": "Moderate — some variety"},
                {"value": "high", "label": "High — diverse habitats"},
            ]),
            "fragmentation": ("What is the level of habitat fragmentation?", [
                {"value": "low", "label": "Low — connected habitat"},
                {"value": "moderate", "label": "Moderate"},
                {"value": "high", "label": "High — isolated patches"},
            ]),
            "species_richness": ("How would you describe species richness in the area?", [
                {"value": "low", "label": "Low"},
                {"value": "moderate", "label": "Moderate"},
                {"value": "high", "label": "High"},
            ]),
            "land_use": ("What is the primary land use?", [
                {"value": "agriculture", "label": "Agriculture"},
                {"value": "forestry", "label": "Forestry"},
                {"value": "pastoral", "label": "Pastoral / Grazing"},
                {"value": "mixed", "label": "Mixed use"},
            ]),
            "irrigation": ("What is the current irrigation condition?", [
                {"value": "rain-fed", "label": "Rain-fed only"},
                {"value": "limited", "label": "Limited irrigation"},
                {"value": "reliable", "label": "Reliable irrigation"},
            ]),
        }
        q, opts = questions.get(missing_var, (
            f"Could you provide information about {missing_var.replace('_', ' ')}?",
            None,
        ))
        return q, opts


# Singleton
llm_service = LLMService()
