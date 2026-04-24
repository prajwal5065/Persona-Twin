from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from backend.app.models.note import Note
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

    async def simulate_decision(self, user_id: int, scenario: str) -> Dict[str, str]:
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
        1. Predict the likely decision.
        2. Provide clear reasoning based on their past patterns, values, and writing style.
        3. Respond as the Digital Twin.

        Your response MUST be in this format:
        DECISION: [One sentence prediction]
        REASONING: [Multi-sentence explanation of why this matches the user's persona]
        """
        
        raw_response = self.llm_service.generate_response(prompt, history_context, style_profile)
        
        # Simple parsing logic
        decision = "Uncertain"
        reasoning = raw_response
        
        if "DECISION:" in raw_response and "REASONING:" in raw_response:
            parts = raw_response.split("REASONING:")
            decision = parts[0].replace("DECISION:", "").strip()
            reasoning = parts[1].strip()

        return {
            "predicted_decision": decision,
            "reasoning": reasoning
        }
