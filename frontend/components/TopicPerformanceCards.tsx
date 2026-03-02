'use client'

import { TrendingUp, TrendingDown, ChevronRight, Info } from 'lucide-react'

// ============ TYPES ============
export interface Topic {
    rank: number
    name: string
    subdomain?: string
    visibilityPercent: number
    ratio: string // e.g., "155/269"
    citations: number
}

interface TopicPerformanceCardsProps {
    topPerforming?: Topic[]
    needsImprovement?: Topic[]
}

// ============ MOCK DATA ============
const defaultTopPerforming: Topic[] = [
    { rank: 1, name: 'White Label SEO Services', subdomain: 'blitzgeo.com', visibilityPercent: 57.6, ratio: '155/269', citations: 16 },
    { rank: 2, name: 'Local SEO Services', subdomain: 'blitzgeo.com', visibilityPercent: 6.9, ratio: '16/233', citations: 35 },
    { rank: 3, name: 'Franchise SEO Services', subdomain: 'blitzgeo.com', visibilityPercent: 0, ratio: '0/179', citations: 25 },
    { rank: 4, name: 'E-commerce SEO Services', subdomain: 'blitzgeo.com', visibilityPercent: 0.6, ratio: '1/169', citations: 1 },
    { rank: 5, name: 'Enterprise SEO Services', subdomain: 'blitzgeo.com', visibilityPercent: 0, ratio: '0/209', citations: 0 },
]

const defaultNeedsImprovement: Topic[] = [
    { rank: 1, name: 'Enterprise SEO Services', subdomain: 'blitzgeo.com', visibilityPercent: 0, ratio: '0/209', citations: 0 },
    { rank: 2, name: 'E-commerce SEO Services', subdomain: 'blitzgeo.com', visibilityPercent: 0.6, ratio: '1/169', citations: 1 },
    { rank: 3, name: 'Franchise SEO Services', subdomain: 'blitzgeo.com', visibilityPercent: 0, ratio: '0/179', citations: 25 },
    { rank: 4, name: 'Local SEO Services', subdomain: 'blitzgeo.com', visibilityPercent: 6.9, ratio: '16/233', citations: 35 },
    { rank: 5, name: 'White Label SEO Services', subdomain: 'blitzgeo.com', visibilityPercent: 57.6, ratio: '155/269', citations: 16 },
]

// ============ SINGLE CARD COMPONENT ============
function TopicCard({
    title,
    subtitle,
    topics,
    variant
}: {
    title: string
    subtitle: string
    topics: Topic[]
    variant: 'success' | 'danger'
}) {
    const accentColor = variant === 'success' ? 'text-success' : 'text-error'
    const bgColor = variant === 'success' ? 'bg-success' : 'bg-error'
    const Icon = variant === 'success' ? TrendingUp : TrendingDown

    return (
        <div className="bg-surface-2 border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${accentColor}`} />
                    <div>
                        <h3 className="text-base font-semibold text-foreground">{title}</h3>
                        <p className="text-xs text-text-muted">{subtitle}</p>
                    </div>
                </div>
                <Info className="w-4 h-4 text-text-muted" />
            </div>

            {/* Topic List */}
            <div className="divide-y divide-border">
                {topics.map((topic, index) => (
                    <div
                        key={topic.name}
                        className="flex items-center gap-4 px-6 py-3 hover:bg-surface-3/50 transition-colors cursor-pointer group"
                    >
                        {/* Rank Badge */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${bgColor}`}>
                            {topic.rank}
                        </div>

                        {/* Topic Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{topic.name}</p>
                            {topic.subdomain && (
                                <p className="text-xs text-text-muted truncate">{topic.subdomain}</p>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-right">
                            <div>
                                <p className={`text-sm font-semibold ${accentColor}`}>
                                    {topic.visibilityPercent.toFixed(1)}%
                                </p>
                                <p className="text-xs text-text-muted">{topic.ratio}</p>
                            </div>
                            <div className="text-right min-w-[60px]">
                                <p className="text-sm font-medium text-foreground">{topic.citations}</p>
                                <p className="text-xs text-text-muted">citations</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ============ MAIN COMPONENT ============
export function TopicPerformanceCards({
    topPerforming,
    needsImprovement
}: TopicPerformanceCardsProps) {
    const topTopics = topPerforming || defaultTopPerforming
    const bottomTopics = needsImprovement || defaultNeedsImprovement

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopicCard
                title="Top Performing Topics"
                subtitle="Topics with highest visibility scores"
                topics={topTopics}
                variant="success"
            />
            <TopicCard
                title="Needs Improvement"
                subtitle="Topics with lowest visibility scores"
                topics={bottomTopics}
                variant="danger"
            />
        </div>
    )
}
