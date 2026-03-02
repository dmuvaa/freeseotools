'use client'

import { useState, useMemo } from 'react'
import type { AuditRun } from '@/lib/types'
import {
    extractSourceCompetitors,
    extractMentionedBrands,
    findTrackedCompetitors,
    type CompetitorMention
} from '@/lib/competitorExtractor'
import { Globe, Search, Target, Crown, TrendingUp, Users } from 'lucide-react'

interface CompetitorMentionsProps {
    runs: AuditRun[]
    ownDomain?: string
    brandAliases?: string[]
    trackedCompetitors?: string[]
}

type TabType = 'sources' | 'mentioned' | 'tracked'

interface CompetitorBarProps {
    competitor: CompetitorMention
    maxMentions: number
    totalModels: number
    rank: number
}

function CompetitorBar({ competitor, maxMentions, totalModels, rank }: CompetitorBarProps) {
    const percentage = maxMentions > 0 ? (competitor.mentions / maxMentions) * 100 : 0
    const modelCoverage = totalModels > 0 ? Math.round((competitor.models.length / totalModels) * 100) : 0

    return (
        <div className="group relative">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-3 transition-colors">
                {/* Rank Badge */}
                <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0
                    ${competitor.isOwnBrand
                        ? 'bg-green-500/20 text-green-400 ring-2 ring-green-500/50'
                        : rank <= 3
                            ? 'bg-violet-500/20 text-violet-400'
                            : 'bg-surface-3 text-text-muted'
                    }
                `}>
                    {competitor.isOwnBrand ? <Crown className="w-4 h-4" /> : rank}
                </div>

                {/* Name & Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`font-medium truncate ${competitor.isOwnBrand ? 'text-green-400' : 'text-foreground'}`}>
                            {competitor.name}
                        </span>
                        {competitor.isOwnBrand && (
                            <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                                You
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-text-muted">
                        {modelCoverage}% model coverage • {competitor.models.length} of {totalModels} models
                    </p>
                </div>

                {/* Mentions Count */}
                <div className="text-right shrink-0">
                    <p className={`text-lg font-bold ${competitor.isOwnBrand ? 'text-green-400' : 'text-foreground'}`}>
                        {competitor.mentions}
                    </p>
                    <p className="text-xs text-text-muted">mentions</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mx-3 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${competitor.isOwnBrand ? 'bg-green-500' : 'bg-violet-500'
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

export function CompetitorMentions({
    runs,
    ownDomain,
    brandAliases = [],
    trackedCompetitors = []
}: CompetitorMentionsProps) {
    const [activeTab, setActiveTab] = useState<TabType>('sources')

    // Compute all competitor data
    const sources = useMemo(() =>
        extractSourceCompetitors(runs, ownDomain),
        [runs, ownDomain]
    )

    const mentioned = useMemo(() =>
        extractMentionedBrands(runs, brandAliases),
        [runs, brandAliases]
    )

    const tracked = useMemo(() =>
        findTrackedCompetitors(runs, trackedCompetitors, brandAliases),
        [runs, trackedCompetitors, brandAliases]
    )

    const totalModels = runs.length

    // Get active data based on tab
    const activeData = useMemo(() => {
        switch (activeTab) {
            case 'sources': return sources.slice(0, 10)
            case 'mentioned': return mentioned.slice(0, 10)
            case 'tracked': return tracked
        }
    }, [activeTab, sources, mentioned, tracked])

    const maxMentions = Math.max(...activeData.map(c => c.mentions), 1)

    // Calculate summary stats
    const ownBrandMentions = activeData.find(c => c.isOwnBrand)?.mentions || 0
    const topCompetitorMentions = activeData.find(c => !c.isOwnBrand)?.mentions || 0

    const tabs = [
        { id: 'sources' as const, label: 'Sources', icon: Globe, count: sources.length },
        { id: 'mentioned' as const, label: 'Detected', icon: Search, count: mentioned.length },
        { id: 'tracked' as const, label: 'Tracked', icon: Target, count: tracked.length },
    ]

    if (runs.length === 0) return null

    return (
        <div className="bg-surface-2 border border-border rounded-xl p-6 h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Users className="w-5 h-5 text-violet-400" />
                        Competitor Analysis
                    </h3>
                    <p className="text-sm text-text-muted">Who else is being recommended for this query?</p>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                        <p className="text-green-400 font-bold">{ownBrandMentions}</p>
                        <p className="text-xs text-text-muted">Your mentions</p>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="text-center">
                        <p className="text-violet-400 font-bold">{topCompetitorMentions}</p>
                        <p className="text-xs text-text-muted">Top competitor</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${activeTab === tab.id
                                ? 'bg-primary text-white'
                                : 'bg-surface-3 text-text-muted hover:text-foreground'
                            }
                        `}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        <span className={`
                            px-1.5 py-0.5 rounded text-xs
                            ${activeTab === tab.id ? 'bg-white/20' : 'bg-surface-2'}
                        `}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tab Descriptions */}
            <div className="mb-4 text-xs text-text-muted">
                {activeTab === 'sources' && (
                    <p className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Domains cited by AI models as sources for this query
                    </p>
                )}
                {activeTab === 'mentioned' && (
                    <p className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Brand names detected in AI response text (auto-extracted)
                    </p>
                )}
                {activeTab === 'tracked' && (
                    <p className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {trackedCompetitors.length > 0
                            ? 'Your tracked competitors and brand aliases'
                            : 'Add tracked competitors in project settings to see head-to-head comparison'
                        }
                    </p>
                )}
            </div>

            {/* Competitor List */}
            <div className="space-y-2">
                {activeData.length > 0 ? (
                    activeData.map((competitor, index) => (
                        <CompetitorBar
                            key={`${competitor.name}-${index}`}
                            competitor={competitor}
                            maxMentions={maxMentions}
                            totalModels={totalModels}
                            rank={index + 1}
                        />
                    ))
                ) : (
                    <div className="py-8 text-center text-text-muted">
                        {activeTab === 'tracked' ? (
                            <p>No tracked competitors configured. Add them in project settings!</p>
                        ) : (
                            <p>No competitors detected in responses</p>
                        )}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        Your brand
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-violet-500"></span>
                        Competitors
                    </span>
                </div>
                <span>Bar length = Relative mention frequency</span>
            </div>
        </div>
    )
}
