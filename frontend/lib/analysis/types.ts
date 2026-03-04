export interface LinkNode {
    id: string; // The normalized URL
    depth?: number;
    type?: 'internal' | 'external';
}

export interface LinkEdge {
    source: string;
    target: string;
}

export interface JSLinkMetrics {
    totalLinks: number;
    uniqueInternalLinks: number;
    jsOnlyLinks: number;
    jsDependencyPercent: number;
    navLinkCount: number;
    bodyLinkCount: number;
    footerLinkCount: number;
    noFollowCount: number;
    emptyAnchorCount: number;
    avgAnchorTextLength: number;
}

export interface LinkAnalysisResult {
    nodes: LinkNode[];
    edges: LinkEdge[];
    metrics: JSLinkMetrics;
    jsOnlyLinks: string[];
}

export interface StructureMetrics {
    architecture: 'Linear' | 'Hub & Spoke' | 'Network' | 'Complex';
    depthRisk: 'Low' | 'Medium' | 'High';
    linkDistribution: 'Concentrated' | 'Balanced' | 'Sparse';
    crawlabilityScore: number; // 0-100
    benchmarks: {
        linkCountStatus: 'Low' | 'Healthy' | 'Excessive';
        anchorTextStatus: 'Poor' | 'Good' | 'Optimized';
    };
}

export interface AIInterpretation {
    primary_topic: string;
    detected_entity: string;
    entity_type: string;
    intent: string;
    clarity_score: number;
    confidence_level: 'low' | 'medium' | 'high';
    weaknesses: string[];
    qualitative_assessment: string; // e.g. "Excellent signal clarity"
    topic_relevance: 'Focused' | 'Diluted' | 'Scattered';
}

export interface AnalysisResponse {
    internal_link_analysis: LinkAnalysisResult & {
        structure: StructureMetrics;
    };
    ai_interpretation: AIInterpretation;
    error?: string;
}

export interface AnalysisRequest {
    url: string;
    enableCrawl?: boolean;
    enableLLM?: boolean;
}
