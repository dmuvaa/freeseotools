'use client'

import { useMemo } from 'react'
import type { AuditRun, Citation } from '@/lib/types'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { ExternalLink, Globe } from 'lucide-react'

interface CitationsOverviewProps {
    runs: AuditRun[]
}

const CHART_COLORS = ['#8b5cf6', '#3b82f6', '#22c55e', '#a855f7', '#ef4444', '#eab308', '#06b6d4', '#ec4899', '#6366f1', '#14b8a6']

export function CitationsOverview({ runs }: CitationsOverviewProps) {
    const citationData = useMemo(() => {
        const domainMap: Record<string, { count: number; models: Set<string>; urls: Set<string> }> = {}

        runs.forEach(run => {
            if (run.citations_found && Array.isArray(run.citations_found)) {
                run.citations_found.forEach((citation: Citation) => {
                    // Safely extract domain
                    let domain = 'unknown'
                    if (citation.domain) {
                        domain = citation.domain
                    } else if (citation.url) {
                        try {
                            domain = new URL(citation.url).hostname.replace('www.', '')
                        } catch {
                            domain = citation.url.split('/')[0] || 'unknown'
                        }
                    }

                    if (!domainMap[domain]) {
                        domainMap[domain] = { count: 0, models: new Set(), urls: new Set() }
                    }
                    domainMap[domain].count++
                    domainMap[domain].models.add(run.ai_model)
                    if (citation.url) domainMap[domain].urls.add(citation.url)
                })
            }
        })

        return Object.entries(domainMap)
            .map(([domain, data], index) => ({
                domain,
                count: data.count,
                modelCount: data.models.size,
                urlCount: data.urls.size,
                color: CHART_COLORS[index % CHART_COLORS.length]
            }))
            .sort((a, b) => b.count - a.count)
    }, [runs])

    const totalCitations = citationData.reduce((sum, d) => sum + d.count, 0)
    const topDomains = citationData.slice(0, 8)
    const otherCount = citationData.slice(8).reduce((sum, d) => sum + d.count, 0)

    const chartData = otherCount > 0
        ? [...topDomains, { domain: 'Other', count: otherCount, modelCount: 0, urlCount: 0, color: '#6b7280' }]
        : topDomains

    if (citationData.length === 0) {
        return null
    }

    return (
        <div className="bg-surface-2 border border-border rounded-xl p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Citations Overview</h3>
                    <p className="text-sm text-text-muted">Sources referenced across all AI responses</p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold text-foreground">{totalCitations}</p>
                    <p className="text-xs text-text-muted">total citations</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Donut Chart */}
                <div className="h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="count"
                                nameKey="domain"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        className="transition-opacity hover:opacity-80"
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--surface-2))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                }}
                                labelStyle={{ color: 'hsl(var(--foreground))' }}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                formatter={(value: any, name: any) => [`${value} citations`, name]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <Globe className="w-6 h-6 mx-auto text-text-muted mb-1" />
                            <p className="text-xl font-bold text-foreground">{citationData.length}</p>
                            <p className="text-xs text-text-muted">sources</p>
                        </div>
                    </div>
                </div>

                {/* Domain List */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {citationData.slice(0, 10).map((item, index) => (
                        <div
                            key={item.domain}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-3 transition-colors group"
                        >
                            {/* Rank */}
                            <span
                                className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0"
                                style={{ backgroundColor: item.color }}
                            >
                                {index + 1}
                            </span>

                            {/* Domain */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{item.domain}</p>
                                <p className="text-xs text-text-muted">
                                    {item.modelCount} {item.modelCount === 1 ? 'model' : 'models'} cited this
                                </p>
                            </div>

                            {/* Count */}
                            <div className="text-right shrink-0">
                                <p className="text-sm font-semibold text-foreground">{item.count}</p>
                                <p className="text-xs text-text-muted">citations</p>
                            </div>

                            {/* External link if available */}
                            {item.urlCount > 0 && (
                                <ExternalLink className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            )}
                        </div>
                    ))}

                    {citationData.length > 10 && (
                        <p className="text-xs text-text-muted text-center pt-2">
                            +{citationData.length - 10} more sources
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
