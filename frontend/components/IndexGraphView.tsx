'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { IndexChatPanel } from './IndexChatPanel'
import type { IndexAudit, IndexedDomain, ConceptAnchor, Conflict } from '@/lib/types'

interface IndexGraphViewProps {
    audit: IndexAudit | null
    isLoading?: boolean
    modelName: string
    modelIcon: string
}

export function IndexGraphView({ audit, isLoading, modelName, modelIcon }: IndexGraphViewProps) {
    const [showChat, setShowChat] = useState(false)

    if (isLoading || !audit) {
        return (
            <div className="p-8 rounded-2xl bg-surface-2 border border-border animate-pulse">
                <div className="h-8 w-48 bg-surface-3 rounded mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="h-24 bg-surface-3 rounded-xl" />
                        <div className="h-24 bg-surface-3 rounded-xl" />
                    </div>
                    <div className="h-64 bg-surface-3 rounded-xl" />
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-8">
                {/* Header Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-surface-2 to-surface-3 border border-border">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                                <span>{modelIcon}</span> AI Index Audit
                            </h2>
                            <p className="text-sm text-text-muted mt-1">{modelName}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Ask About Index Button */}
                            <button
                                onClick={() => setShowChat(true)}
                                className="px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-medium transition-all flex items-center gap-2"
                            >
                                <span>💬</span>
                                Ask about this index
                            </button>
                            <div className="text-right">
                                <div className="text-4xl font-bold gradient-text">
                                    {Math.round(audit.index_stability_score * 100)}%
                                </div>
                                <div className="text-xs text-text-muted uppercase tracking-widest">
                                    Stability Score
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-surface-1/50 border border-border">
                            <div className="text-2xl font-bold text-foreground">{audit.indexed_domains.length}</div>
                            <div className="text-xs text-text-muted">Indexed Sources</div>
                        </div>
                        <div className="p-4 rounded-xl bg-surface-1/50 border border-border">
                            <div className="text-2xl font-bold text-foreground">{audit.concept_anchors.length}</div>
                            <div className="text-xs text-text-muted">Concept Anchors</div>
                        </div>
                        <div className="p-4 rounded-xl bg-surface-1/50 border border-border">
                            <div className="text-2xl font-bold text-foreground">{audit.conflicts.length}</div>
                            <div className="text-xs text-text-muted">Conflicts</div>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Section 1: Indexed Sources */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 rounded-2xl bg-surface-2 border border-border"
                    >
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <span className="text-blue-400">🌐</span> Indexed Sources
                        </h3>
                        {audit.dominant_domain && (
                            <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                                <span className="text-xs text-text-muted uppercase tracking-wider">Dominant Source</span>
                                <div className="text-lg font-bold text-primary">{audit.dominant_domain}</div>
                            </div>
                        )}
                        <div className="space-y-3">
                            {audit.indexed_domains.map((domain, i) => (
                                <DomainBar key={i} domain={domain} isTop={i === 0} />
                            ))}
                            {audit.indexed_domains.length === 0 && (
                                <p className="text-text-muted text-sm">No domains detected</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Section 2: Concept Anchors */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 rounded-2xl bg-surface-2 border border-border"
                    >
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <span className="text-purple-400">🏷️</span> Concept Anchors
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {audit.concept_anchors.map((anchor, i) => (
                                <AnchorPill key={i} anchor={anchor} />
                            ))}
                            {audit.concept_anchors.length === 0 && (
                                <p className="text-text-muted text-sm">No concept anchors detected</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Section 3: Index Gaps */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 rounded-2xl bg-surface-2 border border-border"
                    >
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <span className="text-yellow-400">⚠️</span> Index Gaps
                        </h3>
                        <ul className="space-y-2">
                            {audit.missing_entities.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface-3/50">
                                    <span className="text-warning">○</span>
                                    <span className="text-sm text-text-subtle">{item}</span>
                                </li>
                            ))}
                            {audit.missing_entities.length === 0 && (
                                <li className="text-text-muted text-sm">No gaps detected</li>
                            )}
                        </ul>
                        {audit.missing_entities.length > 0 && (
                            <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20 text-sm text-accent">
                                💡 Content opportunity: Address these gaps in your indexed content
                            </div>
                        )}
                    </motion.div>

                    {/* Section 4: Instability Signals */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-6 rounded-2xl bg-surface-2 border border-border"
                    >
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <span className="text-red-400">⚡</span> Instability Signals
                        </h3>
                        <ul className="space-y-2">
                            {audit.conflicts.map((conflict, i) => (
                                <ConflictItem key={i} conflict={conflict} />
                            ))}
                            {audit.conflicts.length === 0 && (
                                <li className="text-success text-sm flex items-center gap-2">
                                    <span>✓</span> No conflicts detected
                                </li>
                            )}
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* Chat Panel */}
            {showChat && (
                <IndexChatPanel
                    audit={audit}
                    onClose={() => setShowChat(false)}
                />
            )}
        </>
    )
}

// Sub-components

function DomainBar({ domain, isTop }: { domain: IndexedDomain; isTop: boolean }) {
    const percentage = Math.round(domain.weight * 100)
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm ${isTop ? 'text-primary font-medium' : 'text-text-subtle'}`}>
                        {domain.domain}
                    </span>
                    <span className="text-xs text-text-muted">{percentage}%</span>
                </div>
                <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`h-full rounded-full ${isTop ? 'bg-primary' : 'bg-text-muted/30'}`}
                    />
                </div>
            </div>
        </div>
    )
}

function AnchorPill({ anchor }: { anchor: ConceptAnchor }) {
    // Size based on weight
    const size = anchor.weight > 0.2 ? 'text-base px-4 py-2' : 'text-sm px-3 py-1.5'
    return (
        <span className={`${size} rounded-full bg-surface-3 text-text-subtle border border-border hover:border-primary/50 transition-colors cursor-default`}>
            {anchor.phrase}
        </span>
    )
}

function ConflictItem({ conflict }: { conflict: Conflict }) {
    const varianceColors = {
        low: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
        medium: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
        high: 'text-red-400 bg-red-400/10 border-red-400/20'
    }
    return (
        <li className={`flex items-center justify-between p-3 rounded-lg border ${varianceColors[conflict.variance]}`}>
            <span className="text-sm">{conflict.attribute}</span>
            <span className="text-xs uppercase tracking-wider opacity-80">{conflict.variance}</span>
        </li>
    )
}
