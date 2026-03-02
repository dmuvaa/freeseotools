'use client'

import { useState } from 'react'
import type { AuditRun } from '@/lib/types'
import { ChatResponse } from './ChatResponse'

interface ModelCardProps {
    run: AuditRun | null
    isLoading?: boolean
    brandAliases?: string[]
}

const MODEL_DISPLAY_NAMES: Record<string, { name: string; icon: string }> = {
    'openai/gpt-5': { name: 'GPT-5', icon: '🟢' },
    'google/gemini-2.5-pro': { name: 'Gemini 2.5', icon: '🔵' },
    'perplexity/sonar-reasoning': { name: 'Sonar Reasoning', icon: '🟣' },
    'anthropic/claude-opus-4.5': { name: 'Claude Opus 4.5', icon: '🟠' },
    'deepseek/deepseek-v3.2': { name: 'DeepSeek V3.2', icon: '🔷' },
}

export function ModelCard({ run, isLoading = false, brandAliases = [] }: ModelCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    if (isLoading || !run) {
        return (
            <div className="p-6 rounded-2xl bg-surface-2 border border-border">
                {/* Skeleton */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="skeleton w-8 h-8 rounded-full" />
                    <div className="skeleton w-24 h-5 rounded" />
                </div>
                <div className="skeleton w-20 h-6 rounded-full mb-4" />
                <div className="space-y-2">
                    <div className="skeleton w-full h-4 rounded" />
                    <div className="skeleton w-3/4 h-4 rounded" />
                    <div className="skeleton w-5/6 h-4 rounded" />
                </div>
            </div>
        )
    }

    const modelInfo = MODEL_DISPLAY_NAMES[run.ai_model] || {
        name: run.ai_model,
        icon: '⚪'
    }

    const hasResponse = run.response_raw && run.response_raw.length > 0
    const needsTruncation = (run.response_raw?.length || 0) > 500 // Increased truncation for markdown

    return (
        <div className="rounded-2xl bg-surface-2 border border-border hover:border-border-hover transition-colors overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-surface-3/50 border-b border-border">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{modelInfo.icon}</span>
                    <span className="font-medium text-foreground">{modelInfo.name}</span>
                </div>

                <div className="flex items-center gap-3">
                    {run.execution_time_ms && (
                        <span className="text-xs text-text-muted">
                            {(run.execution_time_ms / 1000).toFixed(1)}s
                        </span>
                    )}

                    {/* Status Badge */}
                    {!hasResponse ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-muted text-error border border-error/20">
                            Failed
                        </span>
                    ) : run.is_mentioned ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-muted text-success border border-success/20">
                            Mentioned
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-3 text-text-subtle border border-border">
                            Not Found
                        </span>
                    )}
                </div>
            </div>

            {/* Response Text */}
            <div className="p-6 md:p-8 bg-surface-2 flex-grow">
                {hasResponse ? (
                    <div className="relative">
                        <div className={`transition-all duration-300 ${!isExpanded ? 'max-h-64 overflow-hidden mask-linear-fade' : ''}`}>
                            <ChatResponse content={run.response_raw!} />
                        </div>

                        {needsTruncation && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className={`w-full text-center text-sm font-medium text-primary hover:text-primary-hover transition-colors py-2 ${!isExpanded ? 'bg-gradient-to-t from-surface-2 to-transparent -mt-8 pt-8 relative z-10' : 'mt-4'}`}
                            >
                                {isExpanded ? 'Show less' : 'Show more'}
                            </button>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-text-muted italic">
                        No response received from this model.
                    </p>
                )}
            </div>

            {/* Citations */}
            {run.citations_found && run.citations_found.length > 0 && (
                <div className="px-6 py-4 bg-surface-3/30 border-t border-border mt-auto">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                        Sources Cited
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {run.citations_found.map((cit, i) => {
                            // Normalize citation data
                            let url = '';
                            let index = i + 1;
                            let domain = 'link';

                            if (typeof cit === 'string') {
                                const citStr = cit as string;
                                if (citStr.trim().startsWith('{')) {
                                    try {
                                        const parsed = JSON.parse(citStr);
                                        url = parsed.url;
                                        index = parsed.index || index;
                                        domain = parsed.domain || domain;
                                    } catch {
                                        url = citStr;
                                    }
                                } else {
                                    url = citStr;
                                }
                            } else {
                                url = cit.url;
                                index = cit.index || index;
                                domain = cit.domain || domain;
                            }

                            // Extract hostname
                            let hostname = domain;
                            if (url) {
                                try {
                                    hostname = new URL(url).hostname.replace('www.', '');
                                } catch {
                                    // Keep existing hostname/domain
                                }
                            }

                            return (
                                <a
                                    key={i}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface-1 hover:bg-surface-3 border border-border text-xs text-text-subtle transition-colors group"
                                >
                                    <span className="w-4 h-4 rounded-full bg-primary-muted text-primary flex items-center justify-center text-[10px] font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                                        {index}
                                    </span>
                                    <span className="truncate max-w-[150px]">
                                        {hostname}
                                    </span>
                                </a>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
