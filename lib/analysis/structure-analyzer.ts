import { LinkNode, LinkEdge, JSLinkMetrics, StructureMetrics } from './types';

export class StructureAnalyzer {
    analyze(nodes: LinkNode[], edges: LinkEdge[], metrics: JSLinkMetrics): StructureMetrics {
        const totalNodes = nodes.length;
        const totalEdges = edges.length;

        // 1. Determine Architecture Type
        let architecture: StructureMetrics['architecture'] = 'Complex';

        // Hub & Spoke: High portion of links originate from root, low interconnection elsewhere
        const rootId = nodes.find(n => n.depth === 0)?.id;
        const rootEdges = edges.filter(e => e.source === rootId).length;
        const rootDominance = totalEdges > 0 ? rootEdges / totalEdges : 0;

        if (totalNodes < 5) {
            architecture = 'Linear';
        } else if (rootDominance > 0.6) {
            architecture = 'Hub & Spoke';
        } else if (rootDominance < 0.3 && totalEdges > totalNodes * 1.5) {
            architecture = 'Network';
        }

        // 2. Crawl Depth Risk
        const deepNodes = nodes.filter(n => (n.depth || 0) > 3).length;
        let depthRisk: StructureMetrics['depthRisk'] = 'Low';
        if (deepNodes > totalNodes * 0.1) depthRisk = 'Medium';
        if (deepNodes > totalNodes * 0.3) depthRisk = 'High';

        // 3. Link Distribution
        let linkDistribution: StructureMetrics['linkDistribution'] = 'Balanced';
        if (rootDominance > 0.8) linkDistribution = 'Concentrated';
        if (metrics.uniqueInternalLinks < 5 && metrics.totalLinks < 10) linkDistribution = 'Sparse';

        // 4. Benchmarks
        let linkCountStatus: StructureMetrics['benchmarks']['linkCountStatus'] = 'Healthy';
        if (metrics.totalLinks < 15) linkCountStatus = 'Low';
        if (metrics.totalLinks > 300) linkCountStatus = 'Excessive';

        let anchorTextStatus: StructureMetrics['benchmarks']['anchorTextStatus'] = 'Good';
        if (metrics.avgAnchorTextLength < 5) anchorTextStatus = 'Poor'; // Too short
        if (metrics.avgAnchorTextLength > 30) anchorTextStatus = 'Poor'; // Too long
        if (metrics.avgAnchorTextLength >= 10 && metrics.avgAnchorTextLength <= 25) anchorTextStatus = 'Optimized';

        // 5. Crawlability Score (Heuristic)
        let score = 100;
        if (metrics.jsOnlyLinks > 0) score -= 10;
        if (metrics.jsDependencyPercent > 20) score -= 15;
        if (depthRisk === 'Medium') score -= 10;
        if (depthRisk === 'High') score -= 25;
        if (metrics.emptyAnchorCount > 0) score -= 5;
        if (linkCountStatus === 'Low') score -= 10;

        return {
            architecture,
            depthRisk,
            linkDistribution,
            crawlabilityScore: Math.max(0, score),
            benchmarks: {
                linkCountStatus,
                anchorTextStatus
            }
        };
    }
}
