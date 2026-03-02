"""
GEO Chat: Index-Aware AI Assistant

Provides AI-powered chat that helps users understand and act on their 
AI Index Audit data. Responses are grounded in the current audit snapshot.
Sessions persist for 72 hours.
"""
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel, Field

from supabase import Client
from openrouter import openrouter_client
from logger import log_info, log_error, log_debug


# ============================================
# Request/Response Models
# ============================================

class ChatMessage(BaseModel):
    """Single chat message"""
    role: str  # "user" or "assistant"
    content: str


class IndexChatRequest(BaseModel):
    """Request to chat about an index audit"""
    index_audit_id: str
    message: str
    session_id: Optional[str] = None  # If provided, continue existing session


class IndexChatResponse(BaseModel):
    """Chat response with session info"""
    session_id: str
    response: str
    citations: list[str] = Field(default_factory=list)
    message_count: int = 0


class ChatSessionResponse(BaseModel):
    """Response when loading a session"""
    session_id: str
    messages: list[ChatMessage] = Field(default_factory=list)
    expires_at: str
    created_at: str


# ============================================
# System Prompt Template
# ============================================

SYSTEM_PROMPT_TEMPLATE = """You are an AI Index Analyst for BlitzGeo. You help users understand their brand's AI visibility based on the provided Index Audit data.

## YOUR ROLE
Translate index data into actionable insights. Help users understand:
- Why certain domains dominate their AI retrieval
- Which gaps hurt their visibility most
- What actions will improve their AI Index

## STRICT RULES
1. ONLY answer using the provided index data below
2. If information is not in the audit, say "This isn't visible in the current audit"
3. ALWAYS cite specific data points (e.g., "wikipedia.org has 45% retrieval weight")
4. Recommend actionable next steps when relevant
5. NEVER invent rankings, scores, or domains not in the data
6. Be concise but thorough

## CURRENT INDEX AUDIT DATA

**Model:** {model}
**Stability Score:** {stability_score}%
**Dominant Domain:** {dominant_domain} ({dominance_score}% dominance)

### Indexed Sources (retrieval weight)
{indexed_domains}

### Concept Anchors (semantic associations)
{concept_anchors}

### Index Gaps (missing information)
{missing_entities}

### Instability Signals (conflicting data)
{conflicts}

---

Now answer the user's question using ONLY this data. Be specific and actionable."""


# ============================================
# Chat Handler
# ============================================

class IndexChatHandler:
    """Handles index-aware chat conversations with persistence"""
    
    def _format_audit_context(self, audit: dict) -> str:
        """Format index audit data for injection into system prompt"""
        
        # Format indexed domains
        domains = audit.get("indexed_domains", [])
        if domains:
            domain_lines = [f"- {d['domain']}: {round(d['weight'] * 100)}%" for d in domains]
            indexed_domains_str = "\n".join(domain_lines)
        else:
            indexed_domains_str = "No indexed domains detected"
        
        # Format concept anchors
        anchors = audit.get("concept_anchors", [])
        if anchors:
            anchor_lines = [f"- \"{a['phrase']}\" (weight: {round(a['weight'] * 100)}%)" for a in anchors]
            concept_anchors_str = "\n".join(anchor_lines)
        else:
            concept_anchors_str = "No concept anchors detected"
        
        # Format missing entities
        missing = audit.get("missing_entities", [])
        if missing:
            missing_lines = [f"- {item}" for item in missing]
            missing_entities_str = "\n".join(missing_lines)
        else:
            missing_entities_str = "No gaps detected"
        
        # Format conflicts
        conflicts = audit.get("conflicts", [])
        if conflicts:
            conflict_lines = [f"- {c['attribute']} ({c['variance']} variance)" for c in conflicts]
            conflicts_str = "\n".join(conflict_lines)
        else:
            conflicts_str = "No conflicts detected - index is stable"
        
        # Build final prompt
        return SYSTEM_PROMPT_TEMPLATE.format(
            model=audit.get("model", "Unknown"),
            stability_score=round(audit.get("index_stability_score", 0) * 100),
            dominant_domain=audit.get("dominant_domain", "None"),
            dominance_score=round(audit.get("dominance_score", 0) * 100),
            indexed_domains=indexed_domains_str,
            concept_anchors=concept_anchors_str,
            missing_entities=missing_entities_str,
            conflicts=conflicts_str
        )
    
    # ============================================
    # Session Management
    # ============================================
    
    def get_or_create_session(self, db: Client, audit_id: str) -> dict:
        """
        Get existing valid session or create a new one.
        Sessions expire after 72 hours.
        """
        # First, cleanup any expired sessions for this audit
        now = datetime.utcnow().isoformat()
        db.table("chat_sessions").delete().eq("index_audit_id", audit_id).lt("expires_at", now).execute()
        
        # Try to find existing valid session
        result = db.table("chat_sessions").select("*").eq("index_audit_id", audit_id).gte("expires_at", now).order("created_at", desc=True).limit(1).execute()
        
        if result.data and len(result.data) > 0:
            session = result.data[0]
            # Update the updated_at timestamp
            db.table("chat_sessions").update({"updated_at": now}).eq("id", session["id"]).execute()
            log_debug("chat", f"Found existing session {session['id']}")
            return session
        
        # Create new session
        expires_at = (datetime.utcnow() + timedelta(hours=72)).isoformat()
        new_session = {
            "index_audit_id": audit_id,
            "expires_at": expires_at
        }
        result = db.table("chat_sessions").insert(new_session).execute()
        session = result.data[0]
        log_info("chat", f"Created new session {session['id']} for audit {audit_id}")
        return session
    
    def save_message(self, db: Client, session_id: str, role: str, content: str):
        """Save a message to the session"""
        db.table("chat_messages").insert({
            "session_id": session_id,
            "role": role,
            "content": content
        }).execute()
        log_debug("chat", f"Saved {role} message to session {session_id}")
    
    def load_messages(self, db: Client, session_id: str) -> list[ChatMessage]:
        """Load all messages for a session, ordered by creation time"""
        result = db.table("chat_messages").select("role, content").eq("session_id", session_id).order("created_at", desc=False).execute()
        
        messages = []
        for row in result.data or []:
            messages.append(ChatMessage(role=row["role"], content=row["content"]))
        
        return messages
    
    def get_session(self, db: Client, audit_id: str) -> Optional[ChatSessionResponse]:
        """
        Get session and messages for an audit.
        Returns None if no valid session exists.
        """
        now = datetime.utcnow().isoformat()
        
        # Find valid session
        result = db.table("chat_sessions").select("*").eq("index_audit_id", audit_id).gte("expires_at", now).order("created_at", desc=True).limit(1).execute()
        
        if not result.data or len(result.data) == 0:
            return None
        
        session = result.data[0]
        messages = self.load_messages(db, session["id"])
        
        return ChatSessionResponse(
            session_id=session["id"],
            messages=messages,
            expires_at=session["expires_at"],
            created_at=session["created_at"]
        )
    
    def cleanup_expired(self, db: Client) -> int:
        """Delete all expired sessions. Returns count of deleted sessions."""
        now = datetime.utcnow().isoformat()
        
        # Count before delete
        count_result = db.table("chat_sessions").select("id", count="exact").lt("expires_at", now).execute()
        count = count_result.count or 0
        
        if count > 0:
            # Delete expired (messages cascade automatically)
            db.table("chat_sessions").delete().lt("expires_at", now).execute()
            log_info("chat", f"Cleaned up {count} expired sessions")
        
        return count
    
    # ============================================
    # Main Chat Method
    # ============================================
    
    async def chat(
        self, 
        db: Client, 
        request: IndexChatRequest
    ) -> IndexChatResponse:
        """
        Process a chat request about an index audit.
        
        1. Get or create session
        2. Load message history from DB
        3. Fetch the index audit
        4. Build context-aware system prompt
        5. Query the LLM
        6. Save messages to DB
        7. Return grounded response
        """
        log_info("chat", f"Processing chat for audit {request.index_audit_id}")
        
        # Get or create session
        session = self.get_or_create_session(db, request.index_audit_id)
        session_id = session["id"]
        
        # Fetch audit data
        audit_result = db.table("index_audits").select("*").eq("id", request.index_audit_id).single().execute()
        
        if not audit_result.data:
            log_error("chat", f"Index audit not found: {request.index_audit_id}")
            return IndexChatResponse(
                session_id=session_id,
                response="I couldn't find that index audit. Please try again.",
                citations=[],
                message_count=0
            )
        
        audit = audit_result.data
        log_debug("chat", f"Loaded audit for model: {audit.get('model')}")
        
        # Save user message to DB
        self.save_message(db, session_id, "user", request.message)
        
        # Load full message history from DB
        db_messages = self.load_messages(db, session_id)
        
        # Build system prompt with audit context
        system_prompt = self._format_audit_context(audit)
        
        # Build LLM messages
        llm_messages = [{"role": "system", "content": system_prompt}]
        for msg in db_messages:
            llm_messages.append({"role": msg.role, "content": msg.content})
        
        # Query LLM
        try:
            result = await openrouter_client.query("openai/gpt-5", llm_messages)
            response_text = result.get("content", "I couldn't generate a response.")
            
            log_info("chat", f"Generated response ({len(response_text)} chars)")
            
            # Save assistant response to DB
            self.save_message(db, session_id, "assistant", response_text)
            
            # Extract citations
            citations = self._extract_citations(response_text, audit)
            
            # Get updated message count
            message_count = len(db_messages) + 1  # +1 for the assistant message we just saved
            
            return IndexChatResponse(
                session_id=session_id,
                response=response_text,
                citations=citations,
                message_count=message_count
            )
            
        except Exception as e:
            log_error("chat", f"LLM query failed: {e}")
            return IndexChatResponse(
                session_id=session_id,
                response="I encountered an error processing your request. Please try again.",
                citations=[],
                message_count=len(db_messages)
            )
    
    def _extract_citations(self, response: str, audit: dict) -> list[str]:
        """
        Extract data points from the audit that were cited in the response.
        This helps verify the response is grounded in actual data.
        """
        citations = []
        
        # Check for domain mentions
        for domain in audit.get("indexed_domains", []):
            if domain["domain"].lower() in response.lower():
                citations.append(f"Indexed Source: {domain['domain']}")
        
        # Check for dominant domain mention
        dominant = audit.get("dominant_domain")
        if dominant and dominant.lower() in response.lower():
            if f"Dominant: {dominant}" not in citations:
                citations.append(f"Dominant: {dominant}")
        
        # Check for stability score mention
        if "stability" in response.lower():
            citations.append(f"Stability Score: {round(audit.get('index_stability_score', 0) * 100)}%")
        
        return citations


# Singleton instance
index_chat_handler = IndexChatHandler()
