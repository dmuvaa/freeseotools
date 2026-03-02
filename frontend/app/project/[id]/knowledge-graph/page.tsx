'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/Sidebar'
import { createAuditJob } from '@/app/actions/audit'
import { AI_MODELS } from '@/lib/types'

export default function IndexAuditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()

    // Default to Perplexity for best retrieval visibility
    const [selectedModel, setSelectedModel] = useState<string>('perplexity/sonar-reasoning')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRunProbe = async () => {
        setIsSubmitting(true)
        setError(null)

        const formData = new FormData()
        formData.set('projectId', id)
        formData.set('queryPhrase', 'AI Index Audit Probe')
        formData.set('models', selectedModel)
        formData.set('jobType', 'INDEX_GRAPH')

        try {
            const result = await createAuditJob(formData)

            if (result.success && result.jobId) {
                router.push(`/job/${result.jobId}`)
            } else {
                setError(result.error || 'Failed to start audit')
                setIsSubmitting(false)
            }
        } catch {
            setError('An unexpected error occurred')
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/project/${id}`}
                        className="text-text-muted hover:text-foreground transition-colors text-sm mb-2 inline-flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Project
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground mt-2">AI Index Audit</h1>
                    <p className="text-text-muted mt-2 max-w-2xl">
                        Reverse-engineer the retrievable content surface that AI models rely on when answering questions about your brand.
                        This audit probes which sources are indexed, which concepts are anchored, and what information is missing.
                    </p>
                </div>

                <div className="max-w-xl">
                    <div className="p-8 rounded-2xl bg-surface-2 border border-border space-y-8">

                        {/* Model Selection */}
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-text-subtle uppercase tracking-wider">
                                Select Target Model
                            </label>
                            <div className="grid gap-3">
                                {AI_MODELS.map(model => (
                                    <button
                                        key={model.id}
                                        onClick={() => setSelectedModel(model.id)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${selectedModel === model.id
                                            ? 'bg-primary/10 border-primary shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]'
                                            : 'bg-surface-3 border-transparent hover:border-surface-4'
                                            }`}
                                    >
                                        <div>
                                            <div className={`font-semibold ${selectedModel === model.id ? 'text-primary' : 'text-foreground'}`}>
                                                {model.name}
                                            </div>
                                            <div className="text-xs text-text-muted mt-0.5">
                                                {model.provider}
                                            </div>
                                        </div>
                                        {selectedModel === model.id && (
                                            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="p-4 rounded-xl bg-surface-3/50 border border-surface-3 text-sm text-text-muted">
                            <strong className="text-foreground block mb-1">What This Audit Reveals</strong>
                            <ul className="space-y-1 mt-2">
                                <li>• <strong>Indexed Sources</strong> - Which domains the model retrieves</li>
                                <li>• <strong>Dominant Source</strong> - Which source most influences answers</li>
                                <li>• <strong>Concept Anchors</strong> - Phrases associated with your brand</li>
                                <li>• <strong>Index Gaps</strong> - Missing or weakly supported information</li>
                                <li>• <strong>Instability Signals</strong> - Conflicting claims across sources</li>
                            </ul>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-error/10 text-error text-sm border border-error/20">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleRunProbe}
                            disabled={isSubmitting}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Probing Index...
                                </>
                            ) : (
                                <>
                                    <span>🔍</span> Launch AI Index Audit
                                </>
                            )}
                        </button>

                    </div>
                </div>
            </main>
        </div>
    )
}
