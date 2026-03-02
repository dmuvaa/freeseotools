'use client'

import { AuditJob, AuditRun, IndexAudit } from '@/lib/types'
import { LightbulbIcon, AlertTriangleIcon, SearchIcon, FileTextIcon } from 'lucide-react'

interface ContentOpportunitiesProps {
    job: AuditJob
    runs: AuditRun[]
    indexAudit?: IndexAudit | null
    primaryDomain?: string | null
}

export function ContentOpportunities({ job, runs, indexAudit, primaryDomain }: ContentOpportunitiesProps) {
    // 1. Identify Model Gaps (Models that didn't mention the brand)
    const failedRuns = runs.filter(r => !r.is_mentioned && r.response_raw)
    const successRuns = runs.filter(r => r.is_mentioned)

    // 2. Identify Citation Gaps (Domains appearing in failed runs)
    const competitorDomains = new Set<string>()
    failedRuns.forEach(run => {
        run.citations_found?.forEach(cit => {
            let domain = cit.domain
            // Simple cleanup if needed, though types say it's clean
            if (domain && domain !== primaryDomain) {
                competitorDomains.add(domain)
            }
        })
    })

    // 3. Index Gaps (From Index Graph)
    const missingEntities = indexAudit?.missing_entities || []
    const conflicts = indexAudit?.conflicts || []

    const hasOpportunities = failedRuns.length > 0 || missingEntities.length > 0 || conflicts.length > 0

    if (!hasOpportunities && runs.length > 0) {
        return (
            <div className="rounded-2xl bg-surface-2 border border-border p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-success-muted flex items-center justify-center text-success">
                    <LightbulbIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Perfect Coverage!</h3>
                    <p className="text-text-muted">You are mentioned in all {runs.length} AI responses. Keep maintaining your momentum.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <LightbulbIcon className="w-5 h-5 text-warning" />
                Content Opportunities
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Opportunity 1: Model Blind Spots */}
                {failedRuns.length > 0 && (
                    <div className="rounded-2xl bg-surface-2 border border-border p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-error-muted flex items-center justify-center text-error">
                                <SearchIcon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-foreground">Visibility Gaps</h3>
                        </div>
                        <p className="text-sm text-text-muted mb-4">
                            Your brand is missing from responses in these models. Consider targeting their specific data sources.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {failedRuns.map(run => (
                                <span key={run.ai_model} className="px-3 py-1 rounded-full bg-surface-1 border border-border text-xs font-medium text-text-subtle">
                                    {run.ai_model}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Opportunity 2: Competitor Conquesting */}
                {competitorDomains.size > 0 && (
                    <div className="rounded-2xl bg-surface-2 border border-border p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-primary-muted flex items-center justify-center text-primary">
                                <FileTextIcon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-foreground">Top Cited Competitors</h3>
                        </div>
                        <p className="text-sm text-text-muted mb-4">
                            These sources are winning citations when you aren't mentioned.
                        </p>
                        <ul className="space-y-2">
                            {Array.from(competitorDomains).slice(0, 4).map(domain => (
                                <li key={domain} className="flex items-center justify-between text-sm">
                                    <span className="text-text-subtle">{domain}</span>
                                    <a
                                        href={`https://${domain}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Visit
                                    </a>
                                </li>
                            ))}
                            {competitorDomains.size > 4 && (
                                <li className="text-xs text-text-muted italic pt-1">
                                    + {competitorDomains.size - 4} more sources
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                {/* Opportunity 3: Missing Knowledge (Index Graph) */}
                {missingEntities.length > 0 && (
                    <div className="rounded-2xl bg-surface-2 border border-border p-6 md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-warning-muted flex items-center justify-center text-warning">
                                <AlertTriangleIcon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-foreground">Missing Knowledge Graph Nodes</h3>
                        </div>
                        <p className="text-sm text-text-muted mb-4">
                            The AI is failing to associate these key concepts with your brand. Create dedicated content pages for:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {missingEntities.map((entity, i) => (
                                <span key={i} className="px-3 py-1 rounded-md bg-surface-1 border border-border text-xs font-semibold text-foreground">
                                    + {entity}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
