import React from 'react';
import { AIInterpretation } from '@/lib/analysis/types';
import Card from '@/components/ui/Card';

interface AIInterpretationProps {
    data: AIInterpretation;
}

export function AIInterpretationPanel({ data }: AIInterpretationProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-accent-green border-accent-green-glow bg-accent-green-glow';
        if (score >= 50) return 'text-accent-amber border-accent-amber-glow bg-accent-amber-glow';
        return 'text-accent-red border-accent-red-glow bg-accent-red-glow';
    };

    const scoreClass = getScoreColor(data.clarity_score);

    return (
        <Card padding="lg" className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Primary Stats */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-xs font-semibold text-foreground-subtle uppercase tracking-wider mb-3">Clarity Calculation</h3>
                    <div className={`flex items-center justify-between p-4 rounded-lg border ${scoreClass}`}>
                        <div>
                            <span className="text-4xl font-bold">{data.clarity_score}</span>
                            <span className="text-lg opacity-70">/100</span>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-semibold uppercase">{data.confidence_level} Confidence</div>
                            <div className="text-xs opacity-75">Heuristic Score</div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-semibold text-foreground-subtle uppercase tracking-wider mb-3">Detected Intent</h3>
                    <div className="p-4 bg-surface-2 rounded-lg border border-border flex items-center gap-3">
                        <div className="bg-accent-blue-glow p-2 rounded-md text-accent-blue">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <span className="text-lg font-medium text-foreground">{data.intent}</span>
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-surface-2 rounded-lg border border-border">
                        <div className="text-xs text-foreground-muted mb-1">Primary Topic</div>
                        <div className="font-semibold text-foreground truncate" title={data.primary_topic}>
                            {data.primary_topic}
                        </div>
                    </div>
                    <div className="p-3 bg-surface-2 rounded-lg border border-border">
                        <div className="text-xs text-foreground-muted mb-1">Entity Type</div>
                        <div className="font-semibold text-foreground truncate">
                            {data.entity_type}
                        </div>
                    </div>
                </div>

                {data.detected_entity !== 'Unknown' && (
                    <div className="p-3 bg-surface-2 rounded-lg border border-border">
                        <div className="text-xs text-foreground-muted mb-1">Detected Entity</div>
                        <div className="font-semibold text-foreground">
                            {data.detected_entity}
                        </div>
                    </div>
                )}

                {data.weaknesses.length > 0 && (
                    <div>
                        <h3 className="text-xs font-semibold text-foreground-subtle uppercase tracking-wider mb-3">Improvements Needed</h3>
                        <ul className="space-y-2">
                            {data.weaknesses.map((w, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-foreground-muted">
                                    <span className="text-accent-red">✗</span> {w}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

        </Card>
    );
}

