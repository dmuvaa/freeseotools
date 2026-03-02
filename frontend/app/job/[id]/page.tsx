'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/Sidebar'
import { BlitzScoreGauge } from '@/components/BlitzScoreGauge'
import { ModelCard } from '@/components/ModelCard'
import { KnowledgeGraphView } from '@/components/KnowledgeGraphView'
import { IndexGraphView } from '@/components/IndexGraphView'
import { JobQuickStats } from '@/components/JobQuickStats'
import { ModelComparisonChart } from '@/components/ModelComparisonChart'
import { CitationsOverview } from '@/components/CitationsOverview'
import { ContentOpportunities } from '@/components/ContentOpportunities'
import { CompetitorMentions } from '@/components/CompetitorMentions'
import { createClient } from '@/lib/supabase/client'
import type { AuditJob, AuditRun, Project, KnowledgeAudit, IndexAudit } from '@/lib/types'

const MODEL_ICONS: Record<string, string> = {
    'openai/gpt-5': '🟢',
    'google/gemini-2.5-pro': '🔵',
    'perplexity/sonar-reasoning': '🟣',
    'anthropic/claude-opus-4.5': '🟠',
    'deepseek/deepseek-v3.2': '🔷',
}

export default function JobPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)

    const [job, setJob] = useState<AuditJob | null>(null)
    const [runs, setRuns] = useState<AuditRun[]>([])
    const [knowledgeAudit, setKnowledgeAudit] = useState<KnowledgeAudit | null>(null)
    const [indexAudit, setIndexAudit] = useState<IndexAudit | null>(null)
    const [project, setProject] = useState<Project | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true
        let timeoutId: NodeJS.Timeout

        async function fetchData() {
            // Pause if tab is hidden
            if (document.hidden) {
                timeoutId = setTimeout(fetchData, 5000)
                return
            }

            const supabase = createClient()

            try {
                // Fetch job
                const { data: jobData, error: jobError } = await supabase
                    .from('audit_jobs')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (!isMounted) return

                if (jobError || !jobData) {
                    setError('Audit not found')
                    setIsLoading(false)
                    return // Stop polling on error
                }

                setJob(jobData)

                // Fetch project (only if not loaded or changed)
                if (!project || project.id !== jobData.project_id) {
                    const { data: projectData } = await supabase
                        .from('projects')
                        .select('*')
                        .eq('id', jobData.project_id)
                        .single()
                    if (isMounted) setProject(projectData)
                }

                // Fetch runs
                const { data: runsData } = await supabase
                    .from('audit_runs')
                    .select('*')
                    .eq('job_id', id)
                    .order('created_at', { ascending: true })

                if (isMounted) setRuns(runsData || [])

                // Check for INDEX_GRAPH / KNOWLEDGE_GRAPH data
                if (jobData.job_type === 'INDEX_GRAPH') {
                    const { data: indexData } = await supabase
                        .from('index_audits')
                        .select('*')
                        .eq('project_id', jobData.project_id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single()

                    if (indexData && isMounted) {
                        const jobTime = new Date(jobData.created_at).getTime()
                        const indexTime = new Date(indexData.created_at).getTime()
                        if (Math.abs(indexTime - jobTime) < 120000) {
                            setIndexAudit(indexData)
                        }
                    }
                } else if (jobData.job_type === 'KNOWLEDGE_GRAPH') {
                    const { data: kgData } = await supabase
                        .from('knowledge_audits')
                        .select('*')
                        .eq('project_id', jobData.project_id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single()

                    if (kgData && isMounted) {
                        const jobTime = new Date(jobData.created_at).getTime()
                        const kgTime = new Date(kgData.created_at).getTime()
                        if (Math.abs(kgTime - jobTime) < 120000) {
                            setKnowledgeAudit(kgData)
                        }
                    }
                }

                if (isMounted) setIsLoading(false)

                // STOP POLLING if completed or failed
                if (jobData.status === 'COMPLETED' || jobData.status === 'FAILED') {
                    return
                }
                // Otherwise, schedule next poll
                timeoutId = setTimeout(fetchData, 10000)

            } catch (e) {
                console.error(e)
                // Retry slowly on error
                timeoutId = setTimeout(fetchData, 15000)
            }
        }

        fetchData()

        return () => {
            isMounted = false
            clearTimeout(timeoutId)
        }
    }, [id])

    const getRunForModel = (modelId: string): AuditRun | null => {
        return runs.find(r => r.ai_model === modelId) || null
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-background">
                <Sidebar />
                <main className="flex-1 ml-64 p-8">
                    <div className="skeleton w-48 h-8 rounded mb-8" />
                    <div className="flex justify-center mb-12">
                        <div className="skeleton w-48 h-48 rounded-full" />
                    </div>
                </main>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-background">
                <Sidebar />
                <main className="flex-1 ml-64 p-8">
                    <p className="text-error">{error}</p>
                    <Link href="/dashboard" className="text-primary hover:underline mt-4 inline-block">
                        Back to Dashboard
                    </Link>
                </main>
            </div>
        )
    }

    const isProcessing = job?.status === 'QUEUED' || job?.status === 'PROCESSING'
    const isIndexGraph = job?.job_type === 'INDEX_GRAPH'
    const isKnowledgeGraph = job?.job_type === 'KNOWLEDGE_GRAPH'

    // Determine page title
    const getPageTitle = () => {
        if (isIndexGraph) return 'AI Index Audit'
        if (isKnowledgeGraph) return 'Knowledge Graph Audit'
        return `"${job?.query_phrase}"`
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/project/${job?.project_id}`}
                        className="text-text-muted hover:text-foreground transition-colors text-sm mb-2 inline-flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to {project?.name || 'Project'}
                    </Link>

                    <div className="flex items-center gap-3 mt-2">
                        <h1 className="text-2xl font-bold text-foreground">
                            {getPageTitle()}
                        </h1>
                        {isProcessing && (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-accent-muted text-accent animate-pulse">
                                Processing...
                            </span>
                        )}
                    </div>
                </div>

                {isIndexGraph ? (
                    // --- INDEX GRAPH VIEW ---
                    <div className="space-y-8">
                        {indexAudit ? (
                            <IndexGraphView
                                audit={indexAudit}
                                isLoading={isProcessing}
                                modelName={indexAudit.model}
                                modelIcon={MODEL_ICONS[indexAudit.model] || '⚪'}
                            />
                        ) : (
                            <div className="p-12 text-center border border-border rounded-2xl bg-surface-2 border-dashed">
                                <p className="text-text-muted">Probing AI Index...</p>
                            </div>
                        )}
                    </div>
                ) : isKnowledgeGraph ? (
                    // --- KNOWLEDGE GRAPH VIEW (Legacy) ---
                    <div className="space-y-8">
                        {knowledgeAudit ? (
                            <KnowledgeGraphView
                                audit={knowledgeAudit}
                                isLoading={isProcessing}
                                modelName={knowledgeAudit.ai_model}
                                modelIcon={MODEL_ICONS[knowledgeAudit.ai_model] || '⚪'}
                            />
                        ) : (
                            <div className="p-12 text-center border border-border rounded-2xl bg-surface-2 border-dashed">
                                <p className="text-text-muted">Waiting for Knowledge Graph data...</p>
                            </div>
                        )}
                    </div>
                ) : (
                    // --- STANDARD AUDIT VIEW ---
                    <>
                        {/* Blitz Score Hero */}
                        <div className="flex justify-center mb-8">
                            <div className="text-center">
                                <BlitzScoreGauge
                                    score={isProcessing ? null : job?.blitz_score ?? null}
                                    size="lg"
                                />
                                {job?.status === 'COMPLETED' && (
                                    <p className="text-text-muted mt-4">
                                        Your brand was mentioned in {runs.filter(r => r.is_mentioned).length} of {runs.length} AI responses
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats Bar */}
                        {job && <JobQuickStats job={job} runs={runs} />}

                        {/* Model Comparison Chart */}
                        {job && runs.length > 0 && (
                            <ModelComparisonChart job={job} runs={runs} />
                        )}

                        {/* Analytics Grid */}
                        {runs.length > 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="min-w-0">
                                    <CitationsOverview runs={runs} />
                                </div>
                                <div className="min-w-0">
                                    <CompetitorMentions
                                        runs={runs}
                                        ownDomain={project?.primary_domain || undefined}
                                        brandAliases={project?.brand_aliases || []}
                                        trackedCompetitors={project?.tracked_competitors || []}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Model Responses Grid */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-foreground mb-4">Model Responses</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {job?.models_selected.map(modelId => (
                                    <ModelCard
                                        key={modelId}
                                        run={getRunForModel(modelId)}
                                        isLoading={isProcessing}
                                        brandAliases={project?.brand_aliases || []}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
