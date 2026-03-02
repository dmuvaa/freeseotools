'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChatResponse } from './ChatResponse'
import type { KnowledgeAudit, ProbeResult } from '@/lib/types'

interface KnowledgeGraphViewProps {
    audit: KnowledgeAudit | null
    isLoading?: boolean
    modelName: string
    modelIcon: string
}

const PROBE_CONFIG: Record<string, { label: string; icon: string; color: string; desc: string }> = {
    identity: {
        label: 'Identity',
        icon: '🆔',
        color: 'text-blue-400',
        desc: 'Does the model know who you are?'
    },
    neighbor: {
        label: 'Neighbors',
        icon: '🏘️',
        color: 'text-purple-400',
        desc: 'Who does it associate you with?'
    },
    attribute: {
        label: 'Attributes',
        icon: '📋',
        color: 'text-green-400',
        desc: 'Are the details accurate?'
    },
    sentiment: {
        label: 'Sentiment',
        icon: '🎭',
        color: 'text-yellow-400',
        desc: 'What is the vibe?'
    }
}

export function KnowledgeGraphView({ audit, isLoading, modelName, modelIcon }: KnowledgeGraphViewProps) {
    const [selectedProbe, setSelectedProbe] = useState<string>('identity')

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

    const activeProbe = audit.knowledge_map?.probes?.find(p => p.probe_type === selectedProbe)

    if (!audit.knowledge_map?.probes) {
        return (
            <div className="p-8 text-center text-text-muted">
                Invalid Knowledge Graph Data
            </div>
        )
    }

    return (
        <div className="bg-surface-2 border border-border rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-surface-3/30 border-b md:border-b-0 md:border-r border-border p-4 flex flex-row md:flex-col gap-2 overflow-x-auto">
                <div className="mb-4 hidden md:block px-2">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <span>{modelIcon}</span> {modelName}
                    </h3>
                    <p className="text-xs text-text-muted mt-1">Knowledge Graph</p>
                </div>

                {['identity', 'neighbor', 'attribute', 'sentiment'].map((type) => {
                    const config = PROBE_CONFIG[type]
                    const probeData = audit.knowledge_map?.probes?.find(p => p.probe_type === type)
                    const score = Math.round((probeData?.confidence_score || 0) * 100)
                    const isSelected = selectedProbe === type

                    return (
                        <button
                            key={type}
                            onClick={() => setSelectedProbe(type)}
                            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all relative group min-w-[160px] md:min-w-0 ${isSelected
                                ? 'bg-primary/10 border border-primary/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]'
                                : 'hover:bg-surface-3 border border-transparent'
                                }`}
                        >
                            <span className="text-xl">{config.icon}</span>
                            <div className="flex-1 min-w-0">
                                <div className={`font-medium text-sm ${isSelected ? 'text-primary' : 'text-text-subtle group-hover:text-foreground'}`}>
                                    {config.label}
                                </div>
                                <div className="text-xs text-text-muted truncate">
                                    {config.desc}
                                </div>
                            </div>

                            {/* Score/Status Indicator */}
                            <div className={`w-1.5 h-8 rounded-full ${score >= 80 ? 'bg-success' : score >= 40 ? 'bg-warning' : 'bg-error'
                                } opacity-80`} />
                        </button>
                    )
                })}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {activeProbe && (
                    <motion.div
                        key={selectedProbe}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex flex-col h-full"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border bg-surface-2">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                        {PROBE_CONFIG[activeProbe.probe_type].label} Analysis
                                    </h2>
                                    <p className="text-sm text-text-muted mt-1">
                                        Q: &quot;{activeProbe.question}&quot;
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="text-3xl font-bold gradient-text">
                                        {Math.round(activeProbe.confidence_score * 100)}%
                                    </div>
                                    <div className="text-xs text-text-muted font-mono uppercase tracking-widest">
                                        Confidence
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 overflow-y-auto bg-surface-1/50">
                            <div className="prose-blitz max-w-none mb-8">
                                <ChatResponse content={activeProbe.response} />
                            </div>

                            {/* RAG sources (Only show on Identity probe or if relevant? Actually let's show separate section or global) 
                                The user wanted "RAG Dump". It's global to the audit, not per probe.
                                Let's check if the audit has rag_sources and display them. 
                                Getting it from props `audit`
                            */}
                            {selectedProbe === 'identity' && audit.knowledge_map?.rag_sources && audit.knowledge_map.rag_sources.length > 0 && (
                                <div className="mt-8 border-t border-border pt-6">
                                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <span className="text-blue-400">🌐</span> RAG Source Dump
                                    </h3>
                                    <div className="grid gap-2">
                                        {audit.knowledge_map.rag_sources.map((url, i) => (
                                            <a
                                                key={i}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block p-3 rounded-lg bg-surface-2 border border-border hover:border-primary/50 hover:bg-surface-3 transition-colors text-sm text-text-subtle truncate"
                                            >
                                                {url}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
