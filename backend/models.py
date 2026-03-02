"""
Pydantic models for BlitzGeo Worker
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime



class JobPayload(BaseModel):
    """Background queue message format"""
    job_id: str
    project_id: str
    query_phrase: str
    brand_aliases: list[str]
    primary_domain: str
    models: list[str]
    job_type: str = "STANDARD"  # STANDARD, KNOWLEDGE_GRAPH, INDEX_GRAPH


class Citation(BaseModel):
    """Structured citation object"""
    index: int
    url: str
    domain: str
    context: Optional[str] = None
    source_layer: str = "unknown"  # metadata, markdown, reference


class AnalysisResult(BaseModel):
    """Result of brand presence analysis"""
    is_mentioned: bool = False
    sentiment_score: float = 0.0
    citations_found: list[Citation] = Field(default_factory=list)


class AuditRunCreate(BaseModel):
    """Schema for creating an audit run record"""
    job_id: str
    ai_model: str
    response_raw: Optional[str] = None
    is_mentioned: bool = False
    sentiment_score: Optional[float] = None
    citations_found: list[dict] = Field(default_factory=list) # JSONB compatible
    execution_time_ms: Optional[int] = None


class AuditJob(BaseModel):
    """Audit job record from database"""
    id: str
    project_id: str
    query_phrase: str
    status: str
    blitz_score: Optional[int] = None
    models_selected: list[str]
    created_at: datetime
    completed_at: Optional[datetime] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    worker_id: str
    redis_connected: bool


# ============================================
# AI Index Knowledge Graph (IKG) Models
# ============================================

class IndexedDomain(BaseModel):
    """Domain with retrieval weight"""
    domain: str
    weight: float


class ConceptAnchor(BaseModel):
    """Semantic anchor phrase with weight"""
    phrase: str
    weight: float


class Conflict(BaseModel):
    """Index instability signal"""
    attribute: str
    variance: str  # "low", "medium", "high"


class IndexAuditResult(BaseModel):
    """Complete AI Index Audit snapshot"""
    dominant_domain: Optional[str] = None
    dominance_score: float = 0.0
    indexed_domains: list[IndexedDomain] = Field(default_factory=list)
    concept_anchors: list[ConceptAnchor] = Field(default_factory=list)
    missing_entities: list[str] = Field(default_factory=list)
    conflicts: list[Conflict] = Field(default_factory=list)
    index_stability_score: float = 0.0


# Legacy models (kept for backward compatibility)
class ProbeResult(BaseModel):
    """Result from a single knowledge probe"""
    probe_type: str
    question: str
    response: str
    confidence_score: float
    metadata: dict = Field(default_factory=dict)


class KnowledgeGraphResult(BaseModel):
    """Aggregated knowledge graph data (legacy)"""
    brand: str
    probes: list[ProbeResult]
    summary: str
    rag_sources: list[str] = Field(default_factory=list)
    last_updated: datetime = Field(default_factory=datetime.utcnow)

