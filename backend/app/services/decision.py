import json
import re
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.note import Note
from .retrieval import RetrievalService
from .llm import LLMService
from .style_extractor import StyleExtractorService
from typing import Dict

class DecisionService:
    def __init__(self, db: AsyncSession, retrieval_service: RetrievalService = None, llm_service: LLMService = None, style_extractor: StyleExtractorService = None):
        self.db = db
        self.retrieval_service = retrieval_service or RetrievalService()
        self.llm_service = llm_service or LLMService()
        self.style_extractor = style_extractor or StyleExtractorService()

    async def simulate_decision(self, user_id: int, scenario: str) -> Dict:
        """
        Retrieves relevant history, analyzes user style, and predicts a decision for a given scenario.
        """
        # 1. Retrieve notes relevant to the scenario (past similar situations)
        note_ids = self.retrieval_service.find_similar_notes(user_id, scenario, top_k=8)
        
        stmt = select(Note).where(Note.id.in_(note_ids), Note.user_id == user_id)
        result = await self.db.execute(stmt)
        relevant_notes = result.scalars().all()
        
        # Sort relevant_notes by the order of note_ids to maintain ranking
        id_to_note = {n.id: n for n in relevant_notes}
        ordered_relevant_notes = [id_to_note[nid] for nid in note_ids if nid in id_to_note]
        
        history_context = "\n".join([f"- {n.content}" for n in ordered_relevant_notes])

        # 2. Extract current user style
        stmt_recent = select(Note).where(Note.user_id == user_id).order_by(desc(Note.created_at)).limit(15)
        result_recent = await self.db.execute(stmt_recent)
        recent_notes = result_recent.scalars().all()
        
        recent_texts = [n.content for n in recent_notes]
        style_profile = self.style_extractor.extract_style(recent_texts)

        # 3. Create a specialized simulation prompt
        prompt = f"""
        Scenario for Simulation:
        "{scenario}"

        Based on the provided User History and Style Profile, predict how this user would make a decision in this specific scenario.
        
        USER STYLE PROFILE:
        {style_profile}

        USER HISTORY CONTEXT:
        {history_context}

        Task:
        Predict the likely decision and provide a detailed analysis.
        Respond as the user's Digital Twin.

        Your response MUST be a valid JSON object with the following structure:
        {{
          "predicted_decision": "One sentence summary of the decision",
          "confidence": number (0-100),
          "reasoning": [
            {{ "label": "Risk Tolerance", "score": number (0-100), "note": "one sentence explaining why" }},
            {{ "label": "Pattern Match", "score": number (0-100), "note": "one sentence explaining why" }},
            {{ "label": "Values Alignment", "score": number (0-100), "note": "one sentence explaining why" }},
            {{ "label": "Energy Read", "score": number (0-100), "note": "one sentence explaining why" }}
          ],
          "alternatives": ["alternative path 1", "alternative path 2", "alternative path 3"]
        }}
        """
        
        raw_response = self.llm_service.generate_response(prompt, history_context, style_profile)
        
        # Parse JSON from response
        try:
            # Look for JSON block if LLM added conversational text
            json_match = re.search(r'\{.*\}', raw_response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group(0))
                # Validate keys
                required = ["predicted_decision", "confidence", "reasoning", "alternatives"]
                if all(k in result for k in required):
                    return result
            
            # Fallback if parsing fails
            return {
                "predicted_decision": "Synthesis inconclusive. Proceed with caution.",
                "confidence": 50,
                "reasoning": [
                    { "label": "Analysis", "score": 50, "note": "The available neural data is insufficient for a high-confidence prediction." }
                ],
                "alternatives": ["Establish more memories to improve simulation accuracy."]
            }
        except Exception:
            return {
                "predicted_decision": "Neural uplink interrupted.",
                "confidence": 0,
                "reasoning": [],
                "alternatives": ["Try again in a moment."]
            }
