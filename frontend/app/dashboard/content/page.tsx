'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { ContentOpportunities } from '@/components/ContentOpportunities'
import { createClient } from '@/lib/supabase/client'
import type { AuditJob, AuditRun, Project, IndexAudit } from '@/lib/types'
import { LightbulbIcon } from 'lucide-react'

export default function ContentStrategyPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [allProjects, setAllProjects] = useState<Project[]>([])
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)

    // Data for the selected project
    const [latestJob, setLatestJob] = useState<AuditJob | null>(null)
    const [runs, setRuns] = useState<AuditRun[]>([])
    const [indexAudit, setIndexAudit] = useState<IndexAudit | null>(null)

    // 1. Initial Load: Fetch Projects
    useEffect(() => {
        async function loadProjects() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('org_id')
                .eq('id', user.id)
                .single()

            if (!profile?.org_id) return

            const { data: projects } = await supabase
                .from('projects')
                .select('*')
                .eq('org_id', profile.org_id)
                .order('created_at', { ascending: false })

            if (projects && projects.length > 0) {
                setAllProjects(projects)
                setSelectedProject(projects[0])
            } else {
                setIsLoading(false)
            }
        }
        loadProjects()
    }, [])

    // 2. Fetch Data when Selected Project Changes
    useEffect(() => {
        if (!selectedProject) return

        async function fetchProjectData() {
            setIsLoading(true)
            const supabase = createClient()
            setLatestJob(null)
            setRuns([])
            setIndexAudit(null)

            // Fetch Latest Completed Job
            const { data: job } = await supabase
                .from('audit_jobs')
                .select('*')
                .eq('project_id', selectedProject?.id)
                .eq('status', 'COMPLETED')
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (job) {
                setLatestJob(job)

                // Fetch Runs
                const { data: runsData } = await supabase
                    .from('audit_runs')
                    .select('*')
                    .eq('job_id', job.id)
                    .order('created_at', { ascending: true })
                setRuns(runsData || [])

                // Fetch Index Audit
                if (job.job_type === 'INDEX_GRAPH') {
                    const { data: idx } = await supabase
                        .from('index_audits')
                        .select('*')
                        .eq('project_id', selectedProject?.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single()
                    if (idx) setIndexAudit(idx)
                }
            }
            setIsLoading(false)
        }

        fetchProjectData()
    }, [selectedProject])

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                            <LightbulbIcon className="w-8 h-8 text-warning" />
                            Content Strategy Hub
                        </h1>
                        <p className="text-text-muted mt-2">
                            Actionable content plans derived from your latest AI audit.
                        </p>
                    </div>

                    {/* Project Selector */}
                    {allProjects.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-text-muted">Project:</span>
                            <select
                                value={selectedProject?.id || ''}
                                onChange={(e) => {
                                    const proj = allProjects.find(p => p.id === e.target.value)
                                    if (proj) setSelectedProject(proj)
                                }}
                                className="bg-surface-1 border border-border text-foreground text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                            >
                                {allProjects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="space-y-6">
                        <div className="skeleton w-full h-32 rounded-2xl" />
                        <div className="grid grid-cols-2 gap-6">
                            <div className="skeleton w-full h-48 rounded-2xl" />
                            <div className="skeleton w-full h-48 rounded-2xl" />
                        </div>
                    </div>
                ) : !latestJob ? (
                    <div className="p-12 text-center border border-border rounded-2xl bg-surface-2">
                        <p className="text-lg font-medium text-foreground mb-2">
                            No Audit Data for "{selectedProject?.name}"
                        </p>
                        <p className="text-text-muted">
                            Run a new audit in this project to generate AI-driven content opportunities.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="p-4 bg-surface-1 rounded-xl border border-border inline-flex items-center gap-2 text-sm text-text-muted">
                            <span>Based on latest audit for <strong>{selectedProject?.name}</strong>:</span>
                            <span className="font-medium text-foreground underline decoration-dotted" title={latestJob.id}>
                                "{latestJob.query_phrase}"
                            </span>
                            <span className="text-xs">
                                ({new Date(latestJob.created_at).toLocaleDateString()})
                            </span>
                        </div>

                        <ContentOpportunities
                            job={latestJob}
                            runs={runs}
                            indexAudit={indexAudit}
                            primaryDomain={selectedProject?.primary_domain}
                        />
                    </div>
                )}
            </main>
        </div>
    )
}
