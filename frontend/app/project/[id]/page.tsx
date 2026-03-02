// app/project/[id]/page.tsx

'use client'

import { useState, useEffect, use, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/Sidebar'
import { BlitzScoreGauge } from '@/components/BlitzScoreGauge'
import { CompetitorAnalysisTable, type Competitor } from '@/components/CompetitorAnalysisTable'
import { TopicPerformanceCards, type Topic } from '@/components/TopicPerformanceCards'
import { AISearchQueries, type QueryCategory } from '@/components/AISearchQueries'
import { PopularSources, type Source } from '@/components/PopularSources'
import { createClient } from '@/lib/supabase/client'
import { createAuditJob } from '@/app/actions/audit'
import { AI_MODELS } from '@/lib/types'
import type { Project, AuditJob, MonitoredKeyword, AuditRun, Citation } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Trash2, Pencil, CheckSquare, Square, X, Plus, MoreVertical, BarChart3 } from 'lucide-react'

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()

    const [project, setProject] = useState<Project | null>(null)
    const [jobs, setJobs] = useState<AuditJob[]>([])
    const [auditRuns, setAuditRuns] = useState<AuditRun[]>([])
    const [keywords, setKeywords] = useState<MonitoredKeyword[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Menu State
    const [activeMenuJobId, setActiveMenuJobId] = useState<string | null>(null)

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuJobId(null)
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    // Selection State
    const [selectedKwIds, setSelectedKwIds] = useState<string[]>([])
    const [selectedJobIds, setSelectedJobIds] = useState<string[]>([])

    // Modals State
    const [isEditProjectOpen, setIsEditProjectOpen] = useState(false)
    const [isEditKeywordOpen, setIsEditKeywordOpen] = useState(false)
    const [isAddKeywordOpen, setIsAddKeywordOpen] = useState(false)
    const [editingKeyword, setEditingKeyword] = useState<MonitoredKeyword | null>(null)

    // Forms State
    const [editProjectForm, setEditProjectForm] = useState({ name: '', primary_domain: '', tracked_competitors: [] as string[] })
    const [editKeywordForm, setEditKeywordForm] = useState({ query_phrase: '', frequency: 'daily' })
    const [newKeywordForm, setNewKeywordForm] = useState({ query_phrase: '', frequency: 'weekly' as 'daily' | 'weekly' })
    const [addKeywordMode, setAddKeywordMode] = useState<'single' | 'bulk'>('single')
    const [bulkKeywordsText, setBulkKeywordsText] = useState('')

    // Run Audit Form
    const [queryPhrase, setQueryPhrase] = useState('')
    const [selectedModels, setSelectedModels] = useState<string[]>(
        AI_MODELS.map(m => m.id)
    )

    // Calculate global blitz score
    const completedJobs = jobs.filter(j => j.status === 'COMPLETED' && j.blitz_score !== null)
    const recentScores = completedJobs.slice(0, 10).map(j => j.blitz_score as number)
    const globalScore = recentScores.length > 0
        ? Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length)
        : null

    const fetchData = async () => {
        const supabase = createClient()

        // 1. Fetch Project
        const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single()

        if (projectError || !projectData) {
            setError('Project not found')
            setIsLoading(false)
            return
        }

        setProject(projectData)
        setEditProjectForm({
            name: projectData.name,
            primary_domain: projectData.primary_domain || '',
            tracked_competitors: projectData.tracked_competitors || []
        })

        // 2. Fetch Keywords
        const { data: kwData } = await supabase
            .from('monitored_keywords')
            .select('*')
            .eq('project_id', id)
            .order('created_at', { ascending: false })

        setKeywords(kwData || [])

        // 3. Fetch Jobs
        const { data: jobsData } = await supabase
            .from('audit_jobs')
            .select('*')
            .eq('project_id', id)
            .order('created_at', { ascending: false })

        setJobs(jobsData || [])

        // 4. Fetch Audit Runs for this project (joined via job_id)
        if (jobsData && jobsData.length > 0) {
            const jobIds = jobsData.map(j => j.id)
            const { data: runsData } = await supabase
                .from('audit_runs')
                .select('*')
                .in('job_id', jobIds)
                .order('created_at', { ascending: false })

            setAuditRuns(runsData || [])
        }

        setIsLoading(false)
    }

    useEffect(() => {
        fetchData()

        // Poll for job updates
        const interval = setInterval(async () => {
            const supabase = createClient()
            const { data: jobsData } = await supabase
                .from('audit_jobs')
                .select('*')
                .eq('project_id', id)
                .order('created_at', { ascending: false })

            if (jobsData) setJobs(jobsData)
        }, 10000)

        return () => clearInterval(interval)
    }, [id])

    // ============ COMPUTED ANALYTICS DATA ============

    // 1. Popular Sources - Aggregate citations from all audit runs
    const sourcesData = useMemo(() => {
        const domainMap: Record<string, { citations: number; sources: Set<string>; links: number }> = {}

        auditRuns.forEach(run => {
            if (run.citations_found && Array.isArray(run.citations_found)) {
                run.citations_found.forEach((citation: Citation) => {
                    // Safely extract domain from citation
                    let domain = 'unknown'
                    if (citation.domain) {
                        domain = citation.domain
                    } else if (citation.url) {
                        try {
                            domain = new URL(citation.url).hostname.replace('www.', '')
                        } catch {
                            // Invalid URL, extract domain from string if possible
                            domain = citation.url.split('/')[0] || 'unknown'
                        }
                    }

                    if (!domainMap[domain]) {
                        domainMap[domain] = { citations: 0, sources: new Set(), links: 0 }
                    }
                    domainMap[domain].citations++
                    domainMap[domain].sources.add(run.ai_model)
                    domainMap[domain].links++
                })
            }
        })

        const CHART_COLORS = ['#f97316', '#ef4444', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#eab308', '#6366f1', '#14b8a6']

        return Object.entries(domainMap)
            .map(([domain, data], index) => ({
                domain,
                citations: data.citations,
                sources: data.sources.size,
                links: data.links,
                importance: (data.citations * 3) + (data.sources.size * 2) + data.links,
                color: CHART_COLORS[index % CHART_COLORS.length]
            }))
            .sort((a, b) => b.importance - a.importance)
            .slice(0, 50)
    }, [auditRuns])

    // 2. Topic Performance - Based on query phrases and their success (is_mentioned)
    const topicData = useMemo(() => {
        const topicMap: Record<string, { mentions: number; total: number; sentiment: number; citations: number }> = {}

        // Create a map from job_id to query_phrase
        const jobQueryMap: Record<string, string> = {}
        jobs.forEach(job => {
            jobQueryMap[job.id] = job.query_phrase
        })

        auditRuns.forEach(run => {
            const query = jobQueryMap[run.job_id]
            if (!query) return

            if (!topicMap[query]) {
                topicMap[query] = { mentions: 0, total: 0, sentiment: 0, citations: 0 }
            }
            topicMap[query].total++
            if (run.is_mentioned) topicMap[query].mentions++
            if (run.sentiment_score != null) topicMap[query].sentiment += run.sentiment_score
            if (run.citations_found) topicMap[query].citations += run.citations_found.length
        })

        return Object.entries(topicMap)
            .map(([topic, data], index) => ({
                rank: index + 1,
                name: topic,
                visibilityPercent: data.total > 0 ? Math.round((data.mentions / data.total) * 100) : 0,
                ratio: `${data.mentions}/${data.total}`,
                citations: data.citations
            }))
            .sort((a, b) => b.visibilityPercent - a.visibilityPercent)
    }, [auditRuns, jobs])

    const topPerformers = topicData.filter(t => t.visibilityPercent >= 50).slice(0, 6)
    const needsImprovement = topicData.filter(t => t.visibilityPercent < 50).slice(0, 6)

    // 3. AI Search Queries - Group query phrases by category
    const queryCategories = useMemo(() => {
        const categories: Record<string, Set<string>> = {}

        jobs.forEach(job => {
            // Simple categorization based on query content
            const query = job.query_phrase.toLowerCase()
            let category = 'General Queries'

            if (query.includes('seo') || query.includes('search')) category = 'SEO Services'
            else if (query.includes('web') || query.includes('dev')) category = 'Web Development'
            else if (query.includes('market') || query.includes('digital')) category = 'Digital Marketing'
            else if (query.includes('local') || query.includes('near')) category = 'Local SEO'
            else if (query.includes('e-commerce') || query.includes('shop')) category = 'E-commerce'

            if (!categories[category]) {
                categories[category] = new Set()
            }
            categories[category].add(job.query_phrase)
        })

        return Object.entries(categories).map(([category, queries]) => ({
            name: category,
            queryCount: queries.size,
            queries: Array.from(queries).map(q => ({
                query: q,
                count: auditRuns.filter(r => {
                    const job = jobs.find(j => j.id === r.job_id)
                    return job?.query_phrase === q
                }).length
            }))
        }))
    }, [jobs, auditRuns])

    // --- Actions ---

    const handleUpdateProject = async () => {
        if (!editProjectForm.name) return
        const supabase = createClient()

        const { error } = await supabase
            .from('projects')
            .update({
                name: editProjectForm.name,
                primary_domain: editProjectForm.primary_domain || null,
                tracked_competitors: editProjectForm.tracked_competitors
            })
            .eq('id', id)

        if (!error) {
            setIsEditProjectOpen(false)
            fetchData()
        }
    }

    const handleUpdateKeyword = async () => {
        if (!editingKeyword || !editKeywordForm.query_phrase) return
        const supabase = createClient()

        const { error } = await supabase
            .from('monitored_keywords')
            .update({
                query_phrase: editKeywordForm.query_phrase,
                frequency: editKeywordForm.frequency as 'daily' | 'weekly'
            })
            .eq('id', editingKeyword.id)

        if (!error) {
            setIsEditKeywordOpen(false)
            setEditingKeyword(null)
            fetchData()
        }
    }

    const handleDeleteKeyword = async (kwId: string) => {
        if (!confirm('Are you sure you want to delete this monitored keyword?')) return
        const supabase = createClient()

        const { error } = await supabase
            .from('monitored_keywords')
            .delete()
            .eq('id', kwId)

        if (!error) {
            fetchData()
        } else {
            alert(`Error deleting keyword: ${error.message}`)
        }
    }

    const handleAddKeyword = async () => {
        const supabase = createClient()
        let queriesToInsert: string[] = []

        if (addKeywordMode === 'single') {
            if (!newKeywordForm.query_phrase.trim()) return
            queriesToInsert = [newKeywordForm.query_phrase.trim()]
        } else {
            // Parse bulk text: split by newlines or commas
            queriesToInsert = bulkKeywordsText
                .split(/[\n,]/)
                .map(k => k.trim())
                .filter(k => k.length > 0)

            if (queriesToInsert.length === 0) {
                alert('No valid keywords found')
                return
            }
        }

        const payload = queriesToInsert.map(q => ({
            project_id: id,
            query_phrase: q,
            frequency: newKeywordForm.frequency
        }))

        const { error } = await supabase
            .from('monitored_keywords')
            .insert(payload)

        if (!error) {
            setIsAddKeywordOpen(false)
            setNewKeywordForm({ query_phrase: '', frequency: 'weekly' })
            setBulkKeywordsText('')
            setAddKeywordMode('single')
            fetchData()
        } else {
            alert(`Error adding keyword(s): ${error.message}`)
        }
    }

    const handleBulkFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target?.result as string
            if (text) setBulkKeywordsText(prev => prev + (prev ? '\n' : '') + text)
        }
        reader.readAsText(file)
    }

    const parsedBulkCount = bulkKeywordsText
        .split(/[\n,]/)
        .map(k => k.trim())
        .filter(k => k.length > 0).length

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedKwIds.length} keywords?`)) return
        const supabase = createClient()

        const { error } = await supabase
            .from('monitored_keywords')
            .delete()
            .in('id', selectedKwIds)

        if (!error) {
            setSelectedKwIds([])
            fetchData()
        }
    }

    const handleBulkDeleteJobs = async () => {
        if (!confirm(`Delete ${selectedJobIds.length} audit jobs? This will remove all their AI results.`)) return
        const supabase = createClient()

        const { error } = await supabase
            .from('audit_jobs')
            .delete()
            .in('id', selectedJobIds)

        if (!error) {
            setSelectedJobIds([])
            fetchData()
        } else {
            alert(`Error deleting jobs: ${error.message}`)
        }
    }

    const handleDeleteJob = async (jobId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        setActiveMenuJobId(null) // Close menu
        if (!confirm('Are you sure you want to delete this audit job?')) return
        const supabase = createClient()

        const { error } = await supabase
            .from('audit_jobs')
            .delete()
            .eq('id', jobId)

        if (!error) {
            fetchData()
        } else {
            alert(`Error deleting job from history: ${error.message}`)
        }
    }

    const toggleJobMenu = (jobId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        e.nativeEvent.stopImmediatePropagation()
        setActiveMenuJobId(activeMenuJobId === jobId ? null : jobId)
    }

    // --- Form Handlers ---

    const handleSubmitAudit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!queryPhrase.trim() || selectedModels.length === 0) return

        setIsSubmitting(true)
        setError(null)

        const formData = new FormData()
        formData.set('projectId', id)
        formData.set('queryPhrase', queryPhrase)
        formData.set('models', selectedModels.join(','))

        const result = await createAuditJob(formData)

        setIsSubmitting(false)

        if (result.success) {
            setQueryPhrase('')
            fetchData() // Refresh everything
        } else {
            setError(result.error || 'Failed to create audit')
        }
    }

    // --- Selection Logic ---

    const toggleSelectAll = () => {
        // Clear job selection when selecting keywords
        setSelectedJobIds([])
        if (selectedKwIds.length === keywords.length) {
            setSelectedKwIds([])
        } else {
            setSelectedKwIds(keywords.map(k => k.id))
        }
    }

    const toggleSelectRow = (kwId: string) => {
        // Clear job selection when selecting keywords
        setSelectedJobIds([])
        if (selectedKwIds.includes(kwId)) {
            setSelectedKwIds(selectedKwIds.filter(id => id !== kwId))
        } else {
            setSelectedKwIds([...selectedKwIds, kwId])
        }
    }

    const toggleSelectAllJobs = () => {
        // Clear keyword selection when selecting jobs
        setSelectedKwIds([])
        if (selectedJobIds.length === jobs.length) {
            setSelectedJobIds([])
        } else {
            setSelectedJobIds(jobs.map(j => j.id))
        }
    }

    const toggleSelectJobRow = (jobId: string) => {
        // Clear keyword selection when selecting jobs
        setSelectedKwIds([])
        if (selectedJobIds.includes(jobId)) {
            setSelectedJobIds(selectedJobIds.filter(id => id !== jobId))
        } else {
            setSelectedJobIds([...selectedJobIds, jobId])
        }
    }

    const openEditKeyword = (kw: MonitoredKeyword) => {
        setEditingKeyword(kw)
        setEditKeywordForm({
            query_phrase: kw.query_phrase,
            frequency: kw.frequency
        })
        setIsEditKeywordOpen(true)
    }

    const toggleModel = (modelId: string) => {
        setSelectedModels(prev =>
            prev.includes(modelId)
                ? prev.filter(m => m !== modelId)
                : [...prev, modelId]
        )
    }

    const handleDeleteProject = async () => {
        if (!confirm('Are you sure? This deletes ALL keywords and history. This action cannot be undone.')) return

        setIsLoading(true)

        // 1. Use the Supabase Client (already authenticated)
        const supabase = createClient()

        // 2. Delete directly (The SQL Cascades we added will handle the cleanup)
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Delete failed:', error)
            alert(`Error deleting project: ${error.message}`)
            setIsLoading(false)
        } else {
            // 3. Success!
            router.push('/dashboard')
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'QUEUED':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-surface-3 text-text-subtle">Queued</span>
            case 'PROCESSING':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent-muted text-accent animate-pulse">Processing</span>
            case 'COMPLETED':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-success-muted text-success">Completed</span>
            case 'FAILED':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-error-muted text-error">Failed</span>
            default:
                return null
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-background">
                <Sidebar />
                <main className="flex-1 ml-64 p-8">
                    <div className="skeleton w-48 h-8 rounded mb-4" />
                    <div className="skeleton w-64 h-4 rounded mb-8" />
                    <div className="skeleton w-full h-32 rounded-2xl" />
                </main>
            </div>
        )
    }

    if (error && !project) {
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

    return (
        <div className="flex min-h-screen bg-background relative">
            <Sidebar />

            <main className="flex-1 ml-64 p-8 pb-32">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <Link
                            href="/dashboard"
                            className="text-text-muted hover:text-foreground transition-colors text-sm mb-2 inline-flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Projects
                        </Link>
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-bold text-foreground">{project?.name}</h1>
                            <button
                                onClick={() => setIsEditProjectOpen(true)}
                                className="p-2 rounded-lg hover:bg-surface-2 text-text-muted hover:text-foreground transition-colors"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                        {project?.primary_domain && (
                            <p className="text-text-muted mt-1">{project.primary_domain}</p>
                        )}
                    </div>

                    {/* Global Score */}
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-text-muted">Global Blitz Score</p>
                            <p className="text-xs text-text-muted">Avg. of last 10 audits</p>
                        </div>
                        <BlitzScoreGauge score={globalScore} size="sm" showLabel={false} />
                    </div>
                </div>

                {/* --- DEEP DIVE SECTION --- */}
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-surface-2 to-surface-3 border border-border flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">Brand Knowledge Graph</h3>
                        <p className="text-sm text-text-muted">Explore your brand&apos;s presence in the AI&apos;s &quot;Long Term Memory&quot; with the God View.</p>
                    </div>
                    <Link
                        href={`/project/${id}/knowledge-graph`}
                        className="px-6 py-3 rounded-xl bg-surface-1 hover:bg-surface-2 border border-border text-foreground font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        Open God View
                    </Link>
                </div>

                {/* --- ANALYTICS SECTION --- */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">Analytics</h2>
                            <p className="text-sm text-text-muted">
                                Insights from {jobs.filter(j => j.status === 'COMPLETED').length} completed audits for {project?.name || 'this project'}
                            </p>
                        </div>
                    </div>

                    {jobs.filter(j => j.status === 'COMPLETED').length === 0 ? (
                        <div className="p-12 rounded-2xl bg-surface-2 border border-border text-center">
                            <BarChart3 className="w-12 h-12 text-text-muted mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">No Analytics Yet</h3>
                            <p className="text-text-muted max-w-md mx-auto">
                                Run some audits below to see competitor analysis, topic performance, AI search queries, and source rankings for <strong>{project?.name}</strong>.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Topic Performance - Real data from audit runs */}
                            <TopicPerformanceCards
                                topPerforming={topPerformers}
                                needsImprovement={needsImprovement}
                            />

                            {/* AI Search Queries - Real data from query phrases */}
                            <AISearchQueries
                                title="AI Search Queries"
                                subtitle={`Keywords audited for ${project?.primary_domain || project?.name}`}
                                categories={queryCategories}
                            />

                            {/* Popular Sources - Real data from citations */}
                            <PopularSources
                                title="Sources Cited"
                                subtitle={`Domains referenced in AI responses about ${project?.name}`}
                                data={sourcesData}
                                totalSources={sourcesData.length}
                                totalReferences={auditRuns.reduce((acc, run) => acc + (run.citations_found?.length || 0), 0)}
                            />
                        </div>
                    )}
                </div>

                {/* --- AUDIT FORM --- */}
                <form onSubmit={handleSubmitAudit} className="mb-8">
                    <div className="p-6 rounded-2xl bg-surface-2 border border-border">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Run New Audit</h2>

                        <div className="flex gap-4 mb-4">
                            <input
                                type="text"
                                value={queryPhrase}
                                onChange={(e) => setQueryPhrase(e.target.value)}
                                placeholder="Enter search query (e.g., &apos;Best CRM for real estate&apos;)"
                                className="flex-1 px-4 py-3 rounded-xl bg-surface-3 border border-border text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none transition-colors"
                            />

                            <button
                                type="submit"
                                disabled={isSubmitting || !queryPhrase.trim() || selectedModels.length === 0}
                                className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {isSubmitting ? 'Running...' : 'Run Audit'}
                            </button>
                        </div>

                        {/* Model selector */}
                        <div className="flex flex-wrap gap-2">
                            {AI_MODELS.map(model => (
                                <button
                                    key={model.id}
                                    type="button"
                                    onClick={() => toggleModel(model.id)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedModels.includes(model.id)
                                        ? 'bg-primary-muted text-primary'
                                        : 'bg-surface-3 text-text-muted hover:bg-surface-3/80'
                                        }`}
                                >
                                    {model.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </form>

                {/* --- KEYWORDS DATA GRID --- */}
                <div className="mb-8 rounded-2xl bg-surface-2 border border-border overflow-hidden">
                    <div className="p-6 border-b border-border flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-semibold text-foreground">Monitored Keywords</h2>
                            <span className="text-sm text-text-muted">{keywords.length} monitored</span>
                        </div>
                        <button
                            onClick={() => setIsAddKeywordOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Keyword
                        </button>
                    </div>

                    {keywords.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-text-muted mb-4">No keywords being monitored.</p>
                            <button
                                onClick={() => setIsAddKeywordOpen(true)}
                                className="text-primary hover:underline text-sm"
                            >
                                + Add your first keyword
                            </button>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-surface-3/30">
                                    <th className="px-6 py-4 w-12">
                                        <button onClick={toggleSelectAll} className="flex items-center">
                                            {selectedKwIds.length === keywords.length && keywords.length > 0 ?
                                                <CheckSquare className="w-5 h-5 text-primary" /> :
                                                <Square className="w-5 h-5 text-text-muted" />
                                            }
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-text-muted">Query Phrase</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-text-muted">Frequency</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-text-muted">Last Audit</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-text-muted">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {keywords.map(kw => (
                                    <tr key={kw.id} className="border-b border-border hover:bg-surface-3/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <button onClick={() => toggleSelectRow(kw.id)} className="flex items-center">
                                                {selectedKwIds.includes(kw.id) ?
                                                    <CheckSquare className="w-5 h-5 text-primary" /> :
                                                    <Square className="w-5 h-5 text-text-muted" />
                                                }
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-foreground font-medium">{kw.query_phrase}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-surface-3 text-text-subtle uppercase">
                                                {kw.frequency}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-muted">
                                            {kw.last_run_at ? new Date(kw.last_run_at).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditKeyword(kw)}
                                                    className="p-1.5 rounded hover:bg-surface-3 text-text-muted hover:text-primary transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteKeyword(kw.id)}
                                                    className="p-1.5 rounded hover:bg-surface-3 text-text-muted hover:text-error transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* --- JOBS HISTORY --- */}
                <div className="rounded-2xl bg-surface-2 border border-border">
                    <div className="p-6 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground">Audit History</h2>
                    </div>

                    {jobs.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-text-muted">No audits yet. Run your first audit above.</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-surface-3/30">
                                    <th className="px-6 py-4 w-12">
                                        <button onClick={toggleSelectAllJobs} className="flex items-center">
                                            {selectedJobIds.length === jobs.length && jobs.length > 0 ?
                                                <CheckSquare className="w-5 h-5 text-primary" /> :
                                                <Square className="w-5 h-5 text-text-muted" />
                                            }
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-text-muted">Query</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-text-muted">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-text-muted">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-text-muted">Score</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-text-muted">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map(job => (
                                    <tr
                                        key={job.id}
                                        onClick={() => router.push(`/job/${job.id}`)}
                                        className="border-b border-border hover:bg-surface-3/50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => toggleSelectJobRow(job.id)} className="flex items-center">
                                                {selectedJobIds.includes(job.id) ?
                                                    <CheckSquare className="w-5 h-5 text-primary" /> :
                                                    <Square className="w-5 h-5 text-text-muted" />
                                                }
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-foreground">{job.query_phrase}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-text-subtle text-sm">
                                                {new Date(job.created_at).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(job.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {job.blitz_score !== null ? (
                                                <span className={`text-lg font-semibold ${job.blitz_score >= 70 ? 'text-success' :
                                                    job.blitz_score >= 40 ? 'text-warning' : 'text-error'
                                                    }`}>
                                                    {job.blitz_score}%
                                                </span>
                                            ) : (
                                                <span className="text-text-muted">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={(e) => toggleJobMenu(job.id, e)}
                                                className="p-1.5 rounded hover:bg-surface-3 text-text-muted hover:text-foreground transition-colors inline-flex"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeMenuJobId === job.id && (
                                                <div className="absolute right-8 top-8 z-10 w-36 bg-surface-1 border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                    <button
                                                        onClick={(e) => handleDeleteJob(job.id, e)}
                                                        className="w-full px-4 py-2 text-left text-sm text-error hover:bg-surface-2 flex items-center gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* --- BULK ACTION BAR --- */}
            <AnimatePresence>
                {(selectedKwIds.length > 0 || selectedJobIds.length > 0) && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-surface-1 border border-border shadow-xl rounded-full px-6 py-3 flex items-center gap-6 z-50 ml-32"
                    >
                        <span className="text-foreground font-medium">
                            {selectedKwIds.length > 0
                                ? `${selectedKwIds.length} keyword${selectedKwIds.length !== 1 ? 's' : ''} selected`
                                : `${selectedJobIds.length} audit${selectedJobIds.length !== 1 ? 's' : ''} selected`
                            }
                        </span>

                        <div className="h-4 w-px bg-border" />

                        <button
                            onClick={selectedKwIds.length > 0 ? handleBulkDelete : handleBulkDeleteJobs}
                            className="text-error hover:text-error-hover font-medium flex items-center gap-2 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Selected
                        </button>

                        <button
                            onClick={() => {
                                setSelectedKwIds([])
                                setSelectedJobIds([])
                            }}
                            className="bg-surface-3 hover:bg-surface-3/80 p-1 rounded-full text-text-muted transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- EDIT PROJECT MODAL --- */}
            {isEditProjectOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-surface-1 rounded-2xl w-full max-w-md p-6 border border-border shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-foreground">Edit Project</h3>
                            <button onClick={() => setIsEditProjectOpen(false)}><X className="w-6 h-6 text-text-muted" /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Project Name</label>
                                <input
                                    value={editProjectForm.name}
                                    onChange={e => setEditProjectForm({ ...editProjectForm, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-surface-2 border border-border text-foreground focus:border-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Primary Domain</label>
                                <input
                                    value={editProjectForm.primary_domain}
                                    onChange={e => setEditProjectForm({ ...editProjectForm, primary_domain: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-surface-2 border border-border text-foreground focus:border-primary focus:outline-none"
                                />
                            </div>

                            {/* Tracked Competitors Section */}
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">Tracked Competitors</label>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            id="new-competitor-input"
                                            placeholder="Add competitor name..."
                                            className="flex-1 px-4 py-2 rounded-xl bg-surface-2 border border-border text-foreground focus:border-primary focus:outline-none text-sm"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    const val = (e.currentTarget as HTMLInputElement).value.trim()
                                                    if (val && !editProjectForm.tracked_competitors.includes(val)) {
                                                        setEditProjectForm(prev => ({
                                                            ...prev,
                                                            tracked_competitors: [...prev.tracked_competitors, val]
                                                        }));
                                                        (e.currentTarget as HTMLInputElement).value = ''
                                                    }
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={() => {
                                                const input = document.getElementById('new-competitor-input') as HTMLInputElement
                                                const val = input.value.trim()
                                                if (val && !editProjectForm.tracked_competitors.includes(val)) {
                                                    setEditProjectForm(prev => ({
                                                        ...prev,
                                                        tracked_competitors: [...prev.tracked_competitors, val]
                                                    }))
                                                    input.value = ''
                                                }
                                            }}
                                            className="px-3 py-2 bg-surface-3 hover:bg-surface-3/80 rounded-xl text-foreground"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {editProjectForm.tracked_competitors.map(comp => (
                                            <span key={comp} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs border border-orange-500/20">
                                                {comp}
                                                <button
                                                    onClick={() => setEditProjectForm(prev => ({
                                                        ...prev,
                                                        tracked_competitors: prev.tracked_competitors.filter(c => c !== comp)
                                                    }))}
                                                    className="hover:text-orange-300"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                        {editProjectForm.tracked_competitors.length === 0 && (
                                            <span className="text-xs text-text-muted italic">No competitors tracked yet. Add one above.</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                                <button
                                    onClick={handleDeleteProject}
                                    className="px-4 py-2 text-error hover:bg-error-muted rounded-xl font-medium transition-colors text-sm"
                                >
                                    Delete Project
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsEditProjectOpen(false)}
                                        className="px-4 py-2 text-text-muted hover:text-foreground font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateProject}
                                        className="px-6 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ... */}

            {/* --- EDIT KEYWORD MODAL --- */}
            {isEditKeywordOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-surface-1 rounded-2xl w-full max-w-md p-6 border border-border shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-foreground">Edit Keyword</h3>
                            <button onClick={() => setIsEditKeywordOpen(false)}><X className="w-6 h-6 text-text-muted" /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Query Phrase</label>
                                <input
                                    value={editKeywordForm.query_phrase}
                                    onChange={e => setEditKeywordForm({ ...editKeywordForm, query_phrase: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-surface-2 border border-border text-foreground focus:border-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Tracking Frequency</label>
                                <select
                                    value={editKeywordForm.frequency}
                                    onChange={e => setEditKeywordForm({ ...editKeywordForm, frequency: e.target.value as 'daily' | 'weekly' })}
                                    className="w-full px-4 py-2 rounded-xl bg-surface-2 border border-border text-foreground focus:border-primary focus:outline-none"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setIsEditKeywordOpen(false)}
                                    className="px-4 py-2 text-text-muted hover:text-foreground font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateKeyword}
                                    className="px-6 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover"
                                >
                                    Update Keyword
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ADD KEYWORD MODAL --- */}
            {isAddKeywordOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-surface-1 rounded-2xl w-full max-w-md p-6 border border-border shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-foreground">Add Tracked Keywords</h3>
                            <button onClick={() => setIsAddKeywordOpen(false)}><X className="w-6 h-6 text-text-muted" /></button>
                        </div>

                        <div className="space-y-4">
                            {/* Mode Tabs */}
                            <div className="flex p-1 bg-surface-2 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setAddKeywordMode('single')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${addKeywordMode === 'single' ? 'bg-surface-1 shadow text-primary' : 'text-text-muted hover:text-foreground'}`}
                                >
                                    Single
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAddKeywordMode('bulk')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${addKeywordMode === 'bulk' ? 'bg-surface-1 shadow text-primary' : 'text-text-muted hover:text-foreground'}`}
                                >
                                    Bulk Import
                                </button>
                            </div>

                            {addKeywordMode === 'single' ? (
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Query Phrase</label>
                                    <input
                                        value={newKeywordForm.query_phrase}
                                        onChange={e => setNewKeywordForm({ ...newKeywordForm, query_phrase: e.target.value })}
                                        placeholder="e.g., best CRM for startups"
                                        className="w-full px-4 py-2 rounded-xl bg-surface-2 border border-border text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-medium text-text-muted">Keywords List</label>
                                        <label className="cursor-pointer text-xs flex items-center gap-1 text-primary hover:underline">
                                            <Plus className="w-3 h-3" />
                                            Upload CSV/TXT
                                            <input type="file" accept=".csv,.txt" className="hidden" onChange={handleBulkFileUpload} />
                                        </label>
                                    </div>
                                    <textarea
                                        value={bulkKeywordsText}
                                        onChange={e => setBulkKeywordsText(e.target.value)}
                                        placeholder="Paste keywords here (one per line or comma-separated)..."
                                        rows={6}
                                        className="w-full px-4 py-2 rounded-xl bg-surface-2 border border-border text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none resize-none"
                                    />
                                    <div className="mt-1 text-xs text-text-muted">
                                        {parsedBulkCount} keyword{parsedBulkCount !== 1 ? 's' : ''} detected
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Tracking Frequency</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setNewKeywordForm({ ...newKeywordForm, frequency: 'daily' })}
                                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${newKeywordForm.frequency === 'daily'
                                            ? 'bg-primary/10 border-primary text-primary'
                                            : 'bg-surface-2 border-border text-text-muted hover:border-primary/50'
                                            }`}
                                    >
                                        Daily
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewKeywordForm({ ...newKeywordForm, frequency: 'weekly' })}
                                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${newKeywordForm.frequency === 'weekly'
                                            ? 'bg-primary/10 border-primary text-primary'
                                            : 'bg-surface-2 border-border text-text-muted hover:border-primary/50'
                                            }`}
                                    >
                                        Weekly
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setIsAddKeywordOpen(false)}
                                    className="px-4 py-2 text-text-muted hover:text-foreground font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddKeyword}
                                    disabled={addKeywordMode === 'single' ? !newKeywordForm.query_phrase.trim() : parsedBulkCount === 0}
                                    className="px-6 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {addKeywordMode === 'bulk' && parsedBulkCount > 0 ? `Add ${parsedBulkCount} Keywords` : 'Add Keyword'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
