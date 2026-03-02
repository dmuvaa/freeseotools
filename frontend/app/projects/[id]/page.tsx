'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/Sidebar'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Play, Trash2, Edit2, Pause, PlayCircle, ChevronRight } from 'lucide-react'

interface Keyword {
    id: string
    query_phrase: string
    frequency: 'daily' | 'weekly'
    next_run_at: string
    last_run_at: string | null
    is_active: boolean
}

interface Project {
    id: string
    name: string
}

export default function ProjectTrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params)

    const [keywords, setKeywords] = useState<Keyword[]>([])
    const [project, setProject] = useState<Project | null>(null)
    const [credits, setCredits] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // Form State
    const [mode, setMode] = useState<'single' | 'bulk'>('single')
    const [newQuery, setNewQuery] = useState('')
    const [bulkText, setBulkText] = useState('')
    const [newFrequency, setNewFrequency] = useState<'daily' | 'weekly'>('weekly')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Edit State
    const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    // Delete State
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        fetchData()
    }, [projectId])

    const fetchData = async () => {
        const client = createClient()

        // Fetch Org & Credits
        const { data: user } = await client.auth.getUser()
        if (user.user) {
            const { data: profile } = await client.from('profiles').select('org_id').eq('id', user.user.id).single()
            if (profile?.org_id) {
                const { data: org } = await client.from('organizations').select('credits_balance').eq('id', profile.org_id).single()
                if (org) setCredits(org.credits_balance)
            }
        }

        // Fetch Project
        const { data: projectData } = await client
            .from('projects')
            .select('id, name')
            .eq('id', projectId)
            .single()

        if (projectData) {
            setProject(projectData)
        }

        // Fetch Keywords for this project only
        const { data: keywordsData } = await client
            .from('monitored_keywords')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })

        if (keywordsData) {
            setKeywords(keywordsData)
        }

        setIsLoading(false)
    }

    const parseKeywords = (text: string): string[] => {
        return text
            .split(/[\n,]/)
            .map(k => k.trim())
            .filter(k => k.length > 0)
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target?.result as string
            if (text) setBulkText(prev => prev + (prev ? '\n' : '') + text)
        }
        reader.readAsText(file)
    }

    const handleRunNow = async (ids: string[]) => {
        if (!ids.length) return

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/tracking/run-now`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword_ids: ids })
            })
            fetchData()
        } catch (e) {
            console.error("Run error", e)
            alert("Failed to trigger run")
        }
    }

    const handleAddKeyword = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const client = createClient()
        let queriesToInsert: string[] = []

        if (mode === 'single') {
            if (!newQuery.trim()) {
                alert('Please enter a keyword')
                setIsSubmitting(false)
                return
            }
            queriesToInsert = [newQuery.trim()]
        } else {
            queriesToInsert = parseKeywords(bulkText)
            if (queriesToInsert.length === 0) {
                alert('No valid keywords found')
                setIsSubmitting(false)
                return
            }
        }

        const totalCost = queriesToInsert.length * 5
        if ((credits || 0) < totalCost) {
            alert(`Insufficient credits. Needed: ${totalCost}, Available: ${credits}`)
            setIsSubmitting(false)
            return
        }

        // Hardcode project_id from URL params
        const payload = queriesToInsert.map(q => ({
            project_id: projectId,
            query_phrase: q,
            frequency: newFrequency
        }))

        // Insert and select returning IDs
        const { data, error } = await client.from('monitored_keywords').insert(payload).select('id')

        if (!error && data) {
            // Auto run
            const newIds = data.map(k => k.id)
            await handleRunNow(newIds)

            setIsAddModalOpen(false)
            setNewQuery('')
            setBulkText('')
            setMode('single')
            fetchData()
        } else {
            alert('Failed to add keywords. Please try again.')
            console.error(error)
        }
        setIsSubmitting(false)
    }

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const client = createClient()
        await client.from('monitored_keywords').update({ is_active: !currentStatus }).eq('id', id)
        fetchData()
    }

    const handleDelete = async () => {
        if (!deletingId) return
        const client = createClient()
        await client.from('monitored_keywords').delete().eq('id', deletingId)
        setDeletingId(null)
        fetchData()
    }

    const openEditModal = (keyword: Keyword) => {
        setEditingKeyword(keyword)
        setNewQuery(keyword.query_phrase)
        setNewFrequency(keyword.frequency)
        setIsEditModalOpen(true)
    }

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingKeyword) return

        const client = createClient()
        const { error } = await client.from('monitored_keywords').update({
            query_phrase: newQuery,
            frequency: newFrequency
        }).eq('id', editingKeyword.id)

        if (!error) {
            setIsEditModalOpen(false)
            setEditingKeyword(null)
            fetchData()
        } else {
            alert('Failed to update keyword')
        }
    }

    const bulkCount = parseKeywords(bulkText).length
    const bulkCost = bulkCount * 5

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-background">
                <Sidebar />
                <main className="flex-1 ml-64 p-8">
                    <div className="skeleton w-48 h-8 rounded mb-4" />
                    <div className="skeleton w-64 h-4 rounded mb-8" />
                    <div className="skeleton w-full h-64 rounded-2xl" />
                </main>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex min-h-screen bg-background">
                <Sidebar />
                <main className="flex-1 ml-64 p-8">
                    <p className="text-error">Project not found</p>
                    <Link href="/dashboard" className="text-primary hover:underline mt-4 inline-block">
                        Back to Dashboard
                    </Link>
                </main>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-text-muted mb-4">
                    <Link href="/dashboard" className="hover:text-foreground transition-colors">
                        Projects
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-foreground font-medium">{project.name}</span>
                </nav>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{project.name} — Tracking</h1>
                        <p className="text-text-muted mt-1">
                            Automated recurring audits for this project&apos;s keywords
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${(credits || 0) < 50 ? 'bg-error/10 border-error/20 text-error' : 'bg-surface-2 border-border text-foreground'
                            }`}>
                            <span className="text-lg">🪙</span>
                            <span className="font-bold">{credits !== null ? credits : '...'}</span>
                            <span className="text-xs uppercase opacity-70">Credits</span>
                        </div>

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            disabled={(credits || 0) < 5}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            + Add Keyword
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-surface-1 border border-border rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-surface-2/50">
                                <th className="p-4 text-xs font-medium text-text-muted uppercase">Keyword</th>
                                <th className="p-4 text-xs font-medium text-text-muted uppercase">Frequency</th>
                                <th className="p-4 text-xs font-medium text-text-muted uppercase">Next Run</th>
                                <th className="p-4 text-xs font-medium text-text-muted uppercase">Status</th>
                                <th className="p-4 text-xs font-medium text-text-muted uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keywords.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-text-muted">
                                        No keywords tracked for this project yet. Add one to start tracking.
                                    </td>
                                </tr>
                            ) : (
                                keywords.map(keyword => (
                                    <tr key={keyword.id} className="border-b border-border hover:bg-surface-2/30 transition-colors">
                                        <td className="p-4 font-medium text-foreground">{keyword.query_phrase}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${keyword.frequency === 'daily' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                {keyword.frequency}
                                            </span>
                                        </td>
                                        <td className="p-4 text-text-subtle text-sm">
                                            {new Date(keyword.next_run_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${keyword.is_active ? 'bg-success/10 text-success' : 'bg-text-muted/10 text-text-muted'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${keyword.is_active ? 'bg-success' : 'bg-text-muted'}`} />
                                                {keyword.is_active ? 'Active' : 'Paused'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleRunNow([keyword.id])}
                                                    title="Run Now"
                                                    disabled={(credits || 0) < 5 || !keyword.is_active}
                                                    className="p-2 rounded-lg text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors"
                                                >
                                                    <Play className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleStatus(keyword.id, keyword.is_active)}
                                                    title={keyword.is_active ? "Pause" : "Resume"}
                                                    className="p-2 rounded-lg text-text-muted hover:bg-surface-3 transition-colors"
                                                >
                                                    {keyword.is_active ? <Pause className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(keyword)}
                                                    title="Edit"
                                                    className="p-2 rounded-lg text-text-muted hover:bg-surface-3 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(keyword.id)}
                                                    title="Delete"
                                                    className="p-2 rounded-lg text-text-muted hover:bg-error/10 hover:text-error transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Add Keyword Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface-1 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-border"
                        >
                            <h2 className="text-xl font-bold text-foreground mb-2">Track New Keywords</h2>
                            <p className="text-sm text-text-muted mb-6">Adding to <span className="font-medium text-foreground">{project.name}</span></p>

                            <form onSubmit={handleAddKeyword} className="space-y-4">
                                {/* Mode Tabs */}
                                <div className="flex p-1 bg-surface-2 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setMode('single')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'single' ? 'bg-surface-1 shadow text-primary' : 'text-text-muted hover:text-foreground'
                                            }`}
                                    >
                                        Single
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('bulk')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'bulk' ? 'bg-surface-1 shadow text-primary' : 'text-text-muted hover:text-foreground'
                                            }`}
                                    >
                                        Bulk Import
                                    </button>
                                </div>

                                {mode === 'single' ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <label className="block text-sm font-medium text-text-muted mb-2">Query Phrase</label>
                                        <input
                                            type="text"
                                            value={newQuery}
                                            onChange={e => setNewQuery(e.target.value)}
                                            placeholder="e.g. best crm tools"
                                            required={mode === 'single'}
                                            className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border text-foreground focus:outline-none focus:border-primary"
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-text-muted">
                                                Keywords List
                                            </label>
                                            <label className="cursor-pointer text-xs flex items-center gap-1 text-primary hover:underline">
                                                <Upload className="w-3 h-3" />
                                                Upload CSV/TXT
                                                <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
                                            </label>
                                        </div>
                                        <textarea
                                            value={bulkText}
                                            onChange={e => setBulkText(e.target.value)}
                                            placeholder="Paste keywords here (one per line)..."
                                            required={mode === 'bulk'}
                                            rows={6}
                                            className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border text-foreground focus:outline-none focus:border-primary resize-none"
                                        />
                                        <div className="mt-2 text-xs flex justify-between text-text-muted">
                                            <span>Count: {bulkCount}</span>
                                            <span>Est. Cost: <span className={bulkCost > (credits || 0) ? 'text-error font-bold' : ''}>{bulkCost} credits</span></span>
                                        </div>
                                    </motion.div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-2">Frequency</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setNewFrequency('daily')}
                                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${newFrequency === 'daily'
                                                ? 'bg-primary/10 border-primary text-primary'
                                                : 'bg-surface-2 border-transparent text-text-muted'
                                                }`}
                                        >
                                            Daily (Run 24h)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewFrequency('weekly')}
                                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${newFrequency === 'weekly'
                                                ? 'bg-primary/10 border-primary text-primary'
                                                : 'bg-surface-2 border-transparent text-text-muted'
                                                }`}
                                        >
                                            Weekly (Run 7d)
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 px-4 py-3 rounded-xl bg-surface-2 text-text-muted font-medium hover:text-foreground hover:bg-surface-3 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || (mode === 'bulk' && bulkCost > (credits || 0))}
                                        className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Saving...' : `Track ${mode === 'bulk' ? bulkCount : ''} Keywords`}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface-1 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-border"
                        >
                            <h2 className="text-xl font-bold text-foreground mb-6">Edit Keyword</h2>
                            <form onSubmit={handleEditSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-2">Query Phrase</label>
                                    <input
                                        type="text"
                                        value={newQuery}
                                        onChange={e => setNewQuery(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border text-foreground focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-2">Frequency</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setNewFrequency('daily')}
                                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${newFrequency === 'daily'
                                                ? 'bg-primary/10 border-primary text-primary'
                                                : 'bg-surface-2 border-transparent text-text-muted'
                                                }`}
                                        >
                                            Daily
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewFrequency('weekly')}
                                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${newFrequency === 'weekly'
                                                ? 'bg-primary/10 border-primary text-primary'
                                                : 'bg-surface-2 border-transparent text-text-muted'
                                                }`}
                                        >
                                            Weekly
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 px-4 py-3 rounded-xl bg-surface-2 text-text-muted font-medium hover:text-foreground hover:bg-surface-3 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <AnimatePresence>
                {deletingId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface-1 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-border"
                        >
                            <h2 className="text-xl font-bold text-foreground mb-4">Delete Keyword?</h2>
                            <p className="text-text-muted mb-6">
                                Are you sure? This will stop future tracking for this keyword.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeletingId(null)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-surface-2 text-text-muted font-medium hover:text-foreground hover:bg-surface-3 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-4 py-3 rounded-xl bg-error text-white font-medium hover:bg-error-hover transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
