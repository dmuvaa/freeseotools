'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getFriendlyErrorMessage } from '@/utils/error-mapping'

interface AddProjectModalProps {
    isOpen: boolean
    onClose: () => void
    orgId: string
}

export function AddProjectModal({ isOpen, onClose, orgId }: AddProjectModalProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [name, setName] = useState('')
    const [primaryDomain, setPrimaryDomain] = useState('')
    const [aliasesInput, setAliasesInput] = useState('')

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        console.log('Attempting to create project for Org ID:', orgId)

        try {
            const supabase = createClient()

            // Parse aliases (comma-separated)
            const brandAliases = aliasesInput
                .split(',')
                .map(a => a.trim())
                .filter(a => a.length > 0)

            const { data, error: insertError } = await supabase
                .from('projects')
                .insert({
                    org_id: orgId,
                    name: name.trim(),
                    primary_domain: primaryDomain.trim() || null,
                    brand_aliases: brandAliases,
                })
                .select()
                .single()

            if (insertError) throw insertError

            // Reset form and close
            setName('')
            setPrimaryDomain('')
            setAliasesInput('')
            onClose()

            // Navigate to the new project
            if (data) {
                router.push(`/project/${data.id}`)
            } else {
                router.refresh()
            }
        } catch (err: any) {
            console.error('Project creation error:', err)
            setError(getFriendlyErrorMessage(err, 'create_project'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md p-6 rounded-2xl bg-surface-1 border border-border shadow-2xl">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                    Create New Project
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Project Name */}
                    <div>
                        <label className="block text-sm font-medium text-text-subtle mb-2">
                            Project Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. My Brand"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Primary Domain */}
                    <div>
                        <label className="block text-sm font-medium text-text-subtle mb-2">
                            Primary Domain
                        </label>
                        <input
                            type="text"
                            value={primaryDomain}
                            onChange={(e) => setPrimaryDomain(e.target.value)}
                            placeholder="e.g. mybrand.com"
                            className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none transition-colors"
                        />
                        <p className="text-xs text-text-muted mt-1">
                            Used to detect citations in AI responses
                        </p>
                    </div>

                    {/* Brand Aliases */}
                    <div>
                        <label className="block text-sm font-medium text-text-subtle mb-2">
                            Brand Aliases
                        </label>
                        <input
                            type="text"
                            value={aliasesInput}
                            onChange={(e) => setAliasesInput(e.target.value)}
                            placeholder="e.g. MyBrand, My Brand, mybrand.com"
                            className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none transition-colors"
                        />
                        <p className="text-xs text-text-muted mt-1">
                            Comma-separated list of brand name variations to search for
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-error">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-border text-text-subtle hover:bg-surface-2 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                            className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
