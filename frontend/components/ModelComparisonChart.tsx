'use client'

import type { AuditJob, AuditRun } from '@/lib/types'
import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react'

interface ModelComparisonChartProps {
    job: AuditJob
    runs: AuditRun[]
}

const MODEL_DISPLAY: Record<string, { name: string; icon: string; color: string }> = {
    'openai/gpt-5': { name: 'GPT-5', icon: '🟢', color: '#22c55e' },
    'google/gemini-2.5-pro': { name: 'Gemini 2.5', icon: '🔵', color: '#3b82f6' },
    'perplexity/sonar-reasoning': { name: 'Sonar Reasoning', icon: '🟣', color: '#a855f7' },
    'anthropic/claude-opus-4.5': { name: 'Claude Opus 4.5', icon: '🟠', color: '#f97316' },
    'deepseek/deepseek-v3.2': { name: 'DeepSeek V3.2', icon: '🔷', color: '#06b6d4' },
}

export function ModelComparisonChart({ job, runs }: ModelComparisonChartProps) {
    // Get max response time for scaling bars
    const maxTime = Math.max(...runs.map(r => r.execution_time_ms || 0), 1)

    // Map runs by model
    const runsByModel = new Map(runs.map(r => [r.ai_model, r]))

    return (
        <div className="bg-surface-2 border border-border rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Model Comparison</h3>
                <div className="flex items-center gap-4 text-sm text-text-muted">
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        Mentioned
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-500/50"></span>
                        Not Found
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                {job.models_selected.map(modelId => {
                    const run = runsByModel.get(modelId)
                    const display = MODEL_DISPLAY[modelId] || { name: modelId.split('/').pop(), icon: '⚪', color: '#6b7280' }
                    const timePercent = run && run.execution_time_ms
                        ? Math.max((run.execution_time_ms / maxTime) * 100, 10)
                        : 0
                    const citationCount = run?.citations_found?.length || 0

                    return (
                        <div key={modelId} className="group">
                            <div className="flex items-center gap-4 mb-2">
                                {/* Model Icon & Name */}
                                <div className="flex items-center gap-2 w-40 shrink-0">
                                    <span className="text-lg">{display.icon}</span>
                                    <span className="text-sm font-medium text-foreground truncate">
                                        {display.name}
                                    </span>
                                </div>

                                {/* Status Indicator */}
                                <div className="w-24 shrink-0">
                                    {!run ? (
                                        <span className="text-xs text-text-muted animate-pulse flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Waiting...
                                        </span>
                                    ) : run.is_mentioned ? (
                                        <span className="text-xs text-green-400 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Mentioned
                                        </span>
                                    ) : (
                                        <span className="text-xs text-red-400/70 flex items-center gap-1">
                                            <XCircle className="w-3 h-3" />
                                            Not Found
                                        </span>
                                    )}
                                </div>

                                {/* Response Time Bar */}
                                <div className="flex-1 relative h-6">
                                    <div className="absolute inset-0 bg-surface-3 rounded-lg overflow-hidden">
                                        {run && (run.execution_time_ms || 0) > 0 && (
                                            <div
                                                className="h-full rounded-lg transition-all duration-500 ease-out"
                                                style={{
                                                    width: `${timePercent}%`,
                                                    backgroundColor: run.is_mentioned ? display.color : `${display.color}40`
                                                }}
                                            />
                                        )}
                                    </div>
                                    {run && (run.execution_time_ms || 0) > 0 && (
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-muted">
                                            {run.execution_time_ms! > 1000
                                                ? `${(run.execution_time_ms! / 1000).toFixed(1)}s`
                                                : `${run.execution_time_ms}ms`
                                            }
                                        </span>
                                    )}
                                </div>

                                {/* Citations Count */}
                                <div className="w-20 shrink-0 text-right">
                                    {run && (
                                        <span className="text-xs text-text-muted flex items-center justify-end gap-1">
                                            <MessageSquare className="w-3 h-3" />
                                            {citationCount} {citationCount === 1 ? 'source' : 'sources'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span>Bar length = Response time</span>
                <span>Color intensity = Brand mentioned</span>
            </div>
        </div>
    )
}
