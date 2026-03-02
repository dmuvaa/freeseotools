'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/Sidebar'
import { IndexChatPanel } from '@/components/IndexChatPanel'
import { createClient } from '@/lib/supabase/client'
import type { IndexAudit, Project } from '@/lib/types'

interface AuditWithProject extends IndexAudit {
    project?: Project
}

export default function ChatPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [audits, setAudits] = useState<AuditWithProject[]>([])
    const [selectedAudit, setSelectedAudit] = useState<AuditWithProject | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showChat, setShowChat] = useState(false)

    useEffect(() => {
        async function fetchProjects() {
            const supabase = createClient()

            // Fetch all projects
            const { data: projectsData } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false })

            if (projectsData) {
                setProjects(projectsData)
            }

            setIsLoading(false)
        }

        fetchProjects()
    }, [])

    // Fetch audits when project is selected
    useEffect(() => {
        async function fetchAudits() {
            if (!selectedProject) {
                setAudits([])
                return
            }

            const supabase = createClient()

            const { data: auditsData } = await supabase
                .from('index_audits')
                .select('*')
                .eq('project_id', selectedProject.id)
                .order('created_at', { ascending: false })

            if (auditsData) {
                setAudits(auditsData.map(a => ({ ...a, project: selectedProject })))
            }
        }

        fetchAudits()
    }, [selectedProject])

    const handleSelectProject = (project: Project) => {
        setSelectedProject(project)
        setSelectedAudit(null)
        setShowChat(false)
    }

    const handleSelectAudit = (audit: AuditWithProject) => {
        setSelectedAudit(audit)
        setShowChat(true)
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-background">
                <Sidebar />
                <main className="flex-1 ml-64 p-8">
                    <div className="skeleton w-48 h-8 rounded mb-4" />
                    <div className="skeleton w-full h-96 rounded-2xl" />
                </main>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">GEO Chat</h1>
                    <p className="text-text-muted mt-2">
                        Chat with AI about your Index Audit data. Select a project, then an audit to start.
                    </p>
                </div>

                {projects.length === 0 ? (
                    // No projects state
                    <div className="text-center py-16 rounded-2xl bg-surface-2 border border-border">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-4xl">📁</span>
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">No Projects Yet</h3>
                        <p className="text-text-muted mb-6">Create a project and run an Index Audit to start chatting</p>
                        <Link
                            href="/dashboard"
                            className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Step 1: Select Project */}
                        <div className="rounded-2xl bg-surface-2 border border-border overflow-hidden">
                            <div className="p-4 border-b border-border bg-surface-3">
                                <h2 className="font-semibold text-foreground flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">1</span>
                                    Select Project
                                </h2>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {projects.map(project => (
                                    <button
                                        key={project.id}
                                        onClick={() => handleSelectProject(project)}
                                        className={`w-full text-left p-4 border-b border-border transition-colors ${selectedProject?.id === project.id
                                                ? 'bg-primary/10 border-l-2 border-l-primary'
                                                : 'hover:bg-surface-3'
                                            }`}
                                    >
                                        <div className="font-medium text-foreground">{project.name}</div>
                                        {project.primary_domain && (
                                            <div className="text-sm text-text-muted truncate">{project.primary_domain}</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Step 2: Select Audit */}
                        <div className="rounded-2xl bg-surface-2 border border-border overflow-hidden">
                            <div className="p-4 border-b border-border bg-surface-3">
                                <h2 className="font-semibold text-foreground flex items-center gap-2">
                                    <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${selectedProject ? 'bg-primary text-white' : 'bg-surface-3 text-text-muted'
                                        }`}>2</span>
                                    Select Index Audit
                                </h2>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {!selectedProject ? (
                                    <div className="p-8 text-center text-text-muted">
                                        Select a project first
                                    </div>
                                ) : audits.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <p className="text-text-muted mb-4">No audits for this project</p>
                                        <Link
                                            href={`/project/${selectedProject.id}/knowledge-graph`}
                                            className="text-primary hover:underline"
                                        >
                                            Run an Index Audit →
                                        </Link>
                                    </div>
                                ) : (
                                    audits.map(audit => (
                                        <button
                                            key={audit.id}
                                            onClick={() => handleSelectAudit(audit)}
                                            className={`w-full text-left p-4 border-b border-border transition-colors ${selectedAudit?.id === audit.id
                                                    ? 'bg-primary/10 border-l-2 border-l-primary'
                                                    : 'hover:bg-surface-3'
                                                }`}
                                        >
                                            <div className="font-medium text-foreground">{audit.model}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${audit.index_stability_score >= 0.7
                                                        ? 'bg-success/10 text-success'
                                                        : audit.index_stability_score >= 0.4
                                                            ? 'bg-warning/10 text-warning'
                                                            : 'bg-error/10 text-error'
                                                    }`}>
                                                    {Math.round(audit.index_stability_score * 100)}% stable
                                                </span>
                                                <span className="text-xs text-text-muted">
                                                    {new Date(audit.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="text-xs text-text-muted mt-1">
                                                {audit.indexed_domains?.length || 0} sources • {audit.conflicts?.length || 0} conflicts
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Step 3: Chat Preview */}
                        <div className="rounded-2xl bg-surface-2 border border-border overflow-hidden">
                            <div className="p-4 border-b border-border bg-surface-3">
                                <h2 className="font-semibold text-foreground flex items-center gap-2">
                                    <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${selectedAudit ? 'bg-primary text-white' : 'bg-surface-3 text-text-muted'
                                        }`}>3</span>
                                    Chat
                                </h2>
                            </div>
                            <div className="p-8 text-center">
                                {!selectedAudit ? (
                                    <div className="text-text-muted">
                                        Select an audit to start chatting
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-3xl">💬</span>
                                        </div>
                                        <h3 className="font-semibold text-foreground mb-2">
                                            Ready to Chat
                                        </h3>
                                        <p className="text-sm text-text-muted mb-6">
                                            {selectedAudit.model}<br />
                                            {Math.round(selectedAudit.index_stability_score * 100)}% stability score
                                        </p>
                                        <button
                                            onClick={() => setShowChat(true)}
                                            className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
                                        >
                                            Open Chat →
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Chat Panel */}
            {showChat && selectedAudit && (
                <IndexChatPanel
                    audit={selectedAudit}
                    onClose={() => setShowChat(false)}
                />
            )}
        </div>
    )
}
