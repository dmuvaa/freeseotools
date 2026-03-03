// Database types for BlitzGeo

export interface Organization {
    id: string
    name: string
    plan_tier: 'free' | 'pro' | 'agency'
    created_at: string
}

export interface Project {
    id: string
    org_id: string
    name: string
    primary_domain: string | null
    brand_aliases: string[]
    tracked_competitors?: string[]
    created_at: string
}

export interface MonitoredKeyword {
    id: string
    project_id: string
    query_phrase: string
    frequency: 'daily' | 'weekly'
    is_active: boolean
    last_run_at: string | null
    next_run_at: string | null
    created_at: string
}

export interface AuditJob {
    id: string
    project_id: string
    query_phrase: string
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
    blitz_score: number | null
    models_selected: string[]
    created_at: string
    completed_at: string | null
    job_type?: 'STANDARD' | 'KNOWLEDGE_GRAPH' | 'INDEX_GRAPH'
}

export interface Citation {
    index: number
    url: string
    domain: string
    context?: string
    source_layer?: string
}

// ============================================
// AI Index Knowledge Graph (IKG) Types
// ============================================

export interface IndexedDomain {
    domain: string
    weight: number
}

export interface ConceptAnchor {
    phrase: string
    weight: number
}

export interface Conflict {
    attribute: string
    variance: 'low' | 'medium' | 'high'
}

export interface IndexAudit {
    id: string
    project_id: string
    model: string
    created_at: string
    dominant_domain: string | null
    dominance_score: number
    indexed_domains: IndexedDomain[]
    concept_anchors: ConceptAnchor[]
    missing_entities: string[]
    conflicts: Conflict[]
    index_stability_score: number
}

// Legacy Knowledge Graph Types (kept for backward compatibility)
export interface ProbeResult {
    probe_type: 'identity' | 'neighbor' | 'attribute' | 'sentiment'
    question: string
    response: string
    confidence_score: number
}

export interface KnowledgeGraphMap {
    probes: ProbeResult[]
    summary: string
    rag_sources?: string[]
}

export interface KnowledgeAudit {
    id: string
    project_id: string
    ai_model: string
    knowledge_map: KnowledgeGraphMap
    created_at: string
}

export interface AuditRun {
    id: string
    job_id: string
    ai_model: string
    response_raw: string | null
    is_mentioned: boolean
    sentiment_score: number | null
    citations_found: Citation[] | null
    execution_time_ms: number | null
    created_at: string
}

// Available AI models (2026 versions)
export const AI_MODELS = [
    { id: 'openai/gpt-5', name: 'GPT-5', provider: 'OpenAI' },
    { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google' },
    { id: 'perplexity/sonar-reasoning', name: 'Sonar Reasoning', provider: 'Perplexity' },
    { id: 'anthropic/claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'Anthropic' },
    { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek V3.2', provider: 'DeepSeek' },
] as const

export type AIModelId = typeof AI_MODELS[number]['id']

// System status types
export interface SystemStatus {
    queue_depth: number
    worker_id: string
    worker_active: boolean
    redis_connected: boolean
    recent_jobs: {
        completed: number
        failed: number
        queued: number
        processing: number
    }
    uptime_seconds: number
}

export interface LogEntry {
    timestamp: string
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
    component: string
    message: string
    metadata: Record<string, unknown>
}

export interface AIRankingTip {
    id: string
    project_id: string
    query_phrase: string
    target_model: string
    tips: string[]
    additional_tips: string
    created_at: string
}

