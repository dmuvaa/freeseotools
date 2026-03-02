'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { ProjectCard } from '@/components/ProjectCard'
import { AddProjectModal } from '@/components/AddProjectModal'
import { LiveLogViewer } from '@/components/LiveLogViewer'
import { createClient } from '@/lib/supabase/client'
import type { Project, AuditJob, Organization } from '@/lib/types'
import { ChevronDown, ChevronUp } from 'lucide-react'

// ============ COLLAPSIBLE SECTION HELPER ============
function CollapsibleSection({
    title,
    children,
    defaultOpen = true
}: {
    title: string
    children: React.ReactNode
    defaultOpen?: boolean
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="bg-surface-2 border border-border rounded-2xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-3/50 transition-colors"
            >
                <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-text-muted" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-text-muted" />
                )}
            </button>
            {isOpen && (
                <div className="px-6 pb-6">
                    {children}
                </div>
            )}
        </div>
    )
}

export default function DashboardPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [projects, setProjects] = useState<Project[]>([])
    const [jobsByProject, setJobsByProject] = useState<Record<string, AuditJob[]>>({})
    const [organization, setOrganization] = useState<Organization | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                const client = createClient()

                // Get organization
                let { data: orgs, error: orgsError } = await client
                    .from('organizations')
                    .select('*')
                    .limit(1)

                if (orgsError) {
                    console.error('Data fetch error:', orgsError)
                    setError('Unable to load workspace. Please contact support.')
                    setIsLoading(false)
                    return
                }

                let org = orgs?.[0]

                if (!org) {
                    setError('Account setup pending. Please contact support.')
                    setIsLoading(false)
                    return
                }

                setOrganization(org)

                if (org) {
                    // Fetch projects
                    const { data: projectsData, error: projectsError } = await client
                        .from('projects')
                        .select('*')
                        .order('created_at', { ascending: false })

                    if (projectsError) {
                        console.error('Project fetch error:', projectsError)
                    }

                    setProjects(projectsData || [])

                    // Fetch recent jobs for each project
                    if (projectsData && projectsData.length > 0) {
                        const projectIds = projectsData.map(p => p.id)
                        const { data: jobsData } = await client
                            .from('audit_jobs')
                            .select('*')
                            .in('project_id', projectIds)
                            .order('created_at', { ascending: false })
                            .limit(50)

                        // Group jobs by project
                        const grouped: Record<string, AuditJob[]> = {}
                        jobsData?.forEach(job => {
                            if (!grouped[job.project_id]) grouped[job.project_id] = []
                            grouped[job.project_id].push(job)
                        })
                        setJobsByProject(grouped)
                    }
                }

                setIsLoading(false)
            } catch (err) {
                console.error('System error:', err)
                setError('A system error occurred. Please refresh the page.')
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Projects</h1>
                        <p className="text-text-muted mt-1">
                            Track your brand visibility across AI search engines
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Project
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-8 p-6 rounded-2xl bg-error-muted border border-error/30">
                        <h3 className="text-lg font-semibold text-error mb-2">Notice</h3>
                        <p className="text-text-subtle">{error}</p>
                    </div>
                )}

                {/* Content */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-surface-2 border border-border">
                                <div className="skeleton w-32 h-6 rounded mb-4" />
                                <div className="skeleton w-20 h-4 rounded mb-4" />
                                <div className="skeleton w-full h-8 rounded" />
                            </div>
                        ))}
                    </div>
                ) : !error && projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-20 h-20 rounded-2xl bg-surface-2 flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-foreground mb-2">No projects yet</h2>
                        <p className="text-text-muted mb-6 text-center max-w-sm">
                            Create your first project to start tracking your brand's visibility in AI responses.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Project
                        </button>
                    </div>
                ) : !error && (
                    <div className="space-y-8">
                        {/* Projects Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map(project => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    recentJobs={jobsByProject[project.id] || []}
                                />
                            ))}
                        </div>

                        {/* Section 7: Live Activity - Collapsible */}
                        <CollapsibleSection title="Live Activity" defaultOpen={false}>
                            <LiveLogViewer maxHeight="300px" />
                        </CollapsibleSection>
                    </div>
                )}
            </main>

            {/* Add Project Modal - always render, just control visibility */}
            <AddProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                orgId={organization?.id || ''}
            />
        </div>
    )
}
