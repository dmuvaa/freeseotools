'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { ExternalLink, Info } from 'lucide-react'

// ============ TYPES ============
export interface Source {
    domain: string
    citations: number
    sources: number
    links: number
    importance: number
    color: string
}

interface PopularSourcesProps {
    data?: Source[]
    title?: string
    subtitle?: string
    totalSources?: number
    totalReferences?: number
}

// ============ COLOR PALETTE ============
const CHART_COLORS = [
    '#f97316', // orange
    '#ef4444', // red  
    '#22c55e', // green
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#eab308', // yellow
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#f43f5e', // rose
    '#84cc16', // lime
    '#a855f7', // purple
    '#0ea5e9', // sky
    '#d946ef', // fuchsia
]

// ============ MOCK DATA ============
const defaultSourcesData: Source[] = [
    { domain: 'susodigital.com', citations: 14, sources: 156, links: 56, importance: 532, color: CHART_COLORS[0] },
    { domain: 'eseospace.com', citations: 22, sources: 143, links: 31, importance: 504, color: CHART_COLORS[1] },
    { domain: 'vendasta.com', citations: 6, sources: 129, links: 102, importance: 501, color: CHART_COLORS[2] },
    { domain: 'fiverr.com', citations: 56, sources: 101, links: 58, importance: 473, color: CHART_COLORS[3] },
    { domain: 'ranktracker.com', citations: 55, sources: 98, links: 68, importance: 472, color: CHART_COLORS[4] },
    { domain: 'makdigitaldesign.com', citations: 34, sources: 83, links: 150, importance: 467, color: CHART_COLORS[5] },
    { domain: 'lseo.com', citations: 53, sources: 108, links: 35, importance: 465, color: CHART_COLORS[6] },
    { domain: 'victorious.com', citations: 47, sources: 108, links: 41, importance: 459, color: CHART_COLORS[7] },
    { domain: 'seoclarity.net', citations: 53, sources: 107, links: 9, importance: 436, color: CHART_COLORS[8] },
    { domain: 'indeedseo.com', citations: 65, sources: 86, links: 42, importance: 430, color: CHART_COLORS[9] },
    { domain: 'ossisto.com', citations: 74, sources: 89, links: 13, importance: 428, color: CHART_COLORS[10] },
    { domain: 'rankworks.com', citations: 32, sources: 76, links: 131, importance: 423, color: CHART_COLORS[11] },
    { domain: 'webyking.com', citations: 29, sources: 114, links: 21, importance: 421, color: CHART_COLORS[12] },
]

// ============ CUSTOM TOOLTIP ============
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: Source }[] }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload
        return (
            <div className="bg-black/90 border border-gray-800 rounded-lg px-3 py-2 shadow-xl">
                <p className="text-white text-sm font-medium">{data.domain}</p>
                <p className="text-gray-300 text-xs">Importance: {data.importance}</p>
            </div>
        )
    }
    return null
}

// ============ MAIN COMPONENT ============
export function PopularSources({
    data,
    title = "Popular Sources",
    subtitle = "Most referenced domains across all AI responses",
    totalSources = 5874,
    totalReferences = 76217
}: PopularSourcesProps) {
    const [viewMode, setViewMode] = useState<'importance' | 'count'>('importance')
    const [showDetailed, setShowDetailed] = useState(false)

    const sources = data || defaultSourcesData

    // Prepare chart data
    const chartData = sources.map(s => ({
        ...s,
        value: viewMode === 'importance' ? s.importance : s.citations + s.sources + s.links
    }))

    return (
        <div className="bg-surface-2 border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                        <p className="text-sm text-text-muted">{subtitle}</p>
                    </div>
                </div>
                <Info className="w-5 h-5 text-text-muted" />
            </div>

            {/* Toggle Buttons */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowDetailed(false)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${!showDetailed
                                ? 'bg-primary text-white'
                                : 'text-text-muted hover:bg-surface-3'
                            }`}
                    >
                        🌀 Overview
                    </button>
                    <button
                        onClick={() => setShowDetailed(true)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${showDetailed
                                ? 'bg-primary text-white'
                                : 'text-text-muted hover:bg-surface-3'
                            }`}
                    >
                        📊 Detailed
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setViewMode('importance')}
                        className={`text-sm font-medium transition-colors ${viewMode === 'importance' ? 'text-primary' : 'text-text-muted'
                            }`}
                    >
                        Importance
                    </button>
                    <button
                        onClick={() => setViewMode('count')}
                        className={`text-sm font-medium transition-colors ${viewMode === 'count' ? 'text-primary' : 'text-text-muted'
                            }`}
                    >
                        Total Count
                    </button>
                </div>

                <div className="text-sm text-text-muted">
                    <span className="font-medium text-foreground">{totalSources.toLocaleString()}</span> unique sources
                    <span className="mx-2">·</span>
                    <span className="font-medium text-foreground">{totalReferences.toLocaleString()}</span> total references
                </div>
            </div>

            {/* Content */}
            <div className="flex p-6 gap-6">
                {/* Donut Chart */}
                <div className="w-64 h-64 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Sources List */}
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-text-muted mb-3">
                        Top 50 Sources by {viewMode === 'importance' ? 'Importance' : 'Count'}
                    </h3>
                    <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
                        {sources.map((source, index) => (
                            <div
                                key={source.domain}
                                className="flex items-center gap-3 py-1.5 hover:bg-surface-3/50 rounded-lg px-2 -mx-2 transition-colors"
                            >
                                <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: source.color }}
                                />
                                <a
                                    href={`https://${source.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1 flex-shrink-0 w-40"
                                >
                                    {source.domain}
                                    <ExternalLink className="w-3 h-3 opacity-50" />
                                </a>
                                <div className="flex items-center gap-2 flex-1 justify-end text-xs">
                                    <span className="text-primary w-8 text-right">{source.citations}</span>
                                    <span className="text-success w-8 text-right">{source.sources}</span>
                                    <span className="text-text-muted w-8 text-right">{source.links}</span>
                                    <span className="font-semibold text-foreground w-12 text-right">{source.importance}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs text-text-muted">
                        <Info className="w-3 h-3" />
                        <span>
                            <strong>Importance Score:</strong> Citations are weighted 3x, Sources 2x, and Links 1x.
                            Higher scores indicate domains that AI models trust more frequently.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
