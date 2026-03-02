'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, ExternalLink, Info, ChevronUp, ChevronDown } from 'lucide-react'

// ============ TYPES ============
export interface Competitor {
    rank: number
    brand: string
    brandIcon?: string // URL or emoji
    domain: string
    mentions: number
    mentionPercent: number
    avgPosition: number
    sources: number
    refs: number
    score: number
    isYourBrand?: boolean
}

interface CompetitorAnalysisTableProps {
    data?: Competitor[]
    title?: string
    subtitle?: string
    onViewPrompts?: () => void
}

type SortKey = keyof Competitor
type SortDirection = 'asc' | 'desc'

// ============ MOCK DATA ============
const defaultCompetitorData: Competitor[] = [
    { rank: 1, brand: 'Dashclicks', domain: 'dashclicks.com', mentions: 107, mentionPercent: 10.1, avgPosition: 3.5, sources: 17, refs: 581, score: 55.8 },
    { rank: 2, brand: 'Thrive Agency', domain: 'thriveagency.com', mentions: 154, mentionPercent: 14.5, avgPosition: 4.6, sources: 16, refs: 669, score: 54.6 },
    { rank: 3, brand: 'First Page Sage', domain: 'firstpagesage.com', mentions: 120, mentionPercent: 11.3, avgPosition: 4.6, sources: 38, refs: 443, score: 47.8 },
    { rank: 4, brand: 'WebFX', domain: 'webfx.com', mentions: 228, mentionPercent: 21.5, avgPosition: 5.2, sources: 368, refs: 402, score: 47.4 },
    { rank: 5, brand: 'Searchbloom', domain: 'searchbloom.com', mentions: 179, mentionPercent: 16.9, avgPosition: 5.6, sources: 44, refs: 507, score: 47.1 },
    { rank: 6, brand: 'SEO Reseller', domain: 'seoreseller.com', mentions: 133, mentionPercent: 12.6, avgPosition: 4.8, sources: 16, refs: 370, score: 45.6 },
    { rank: 7, brand: 'BlitzGeo', brandIcon: '🚀', domain: 'blitzgeo.com', mentions: 172, mentionPercent: 16.2, avgPosition: 3.7, sources: 300, refs: 76, score: 45.5, isYourBrand: true },
    { rank: 8, brand: 'Boostability', domain: 'boostability.com', mentions: 102, mentionPercent: 9.6, avgPosition: 5.0, sources: 31, refs: 119, score: 37.8 },
    { rank: 9, brand: 'Victorious', domain: 'victorious.com', mentions: 163, mentionPercent: 15.4, avgPosition: 6.4, sources: 125, refs: 196, score: 35.1 },
    { rank: 10, brand: 'Outerbox', domain: 'outerboxdesign.com', mentions: 133, mentionPercent: 12.6, avgPosition: 6.0, sources: 64, refs: 141, score: 35.1 },
]

// ============ SCORE BAR COMPONENT ============
function ScoreBar({ score, max = 60 }: { score: number; max?: number }) {
    const percentage = Math.min((score / max) * 100, 100)

    // Gradient from blue to purple based on score
    const getColor = (score: number) => {
        if (score >= 50) return 'bg-primary'
        if (score >= 40) return 'bg-blue-500'
        if (score >= 30) return 'bg-blue-400'
        return 'bg-blue-300'
    }

    return (
        <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-surface-3 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${getColor(score)}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-sm font-medium text-foreground w-10">{score.toFixed(1)}</span>
        </div>
    )
}

// ============ SORTABLE HEADER ============
function SortableHeader({
    label,
    sortKey,
    currentSort,
    currentDirection,
    onSort,
    hasInfo = false
}: {
    label: string
    sortKey: SortKey
    currentSort: SortKey
    currentDirection: SortDirection
    onSort: (key: SortKey) => void
    hasInfo?: boolean
}) {
    const isActive = currentSort === sortKey

    return (
        <th className="px-4 py-3 text-left">
            <button
                onClick={() => onSort(sortKey)}
                className="flex items-center gap-1 text-xs font-medium text-text-muted uppercase tracking-wider hover:text-foreground transition-colors group"
            >
                {label}
                {hasInfo && <Info className="w-3 h-3 text-text-muted" />}
                <span className="ml-1">
                    {isActive ? (
                        currentDirection === 'asc' ?
                            <ChevronUp className="w-3 h-3 text-primary" /> :
                            <ChevronDown className="w-3 h-3 text-primary" />
                    ) : (
                        <ArrowUpDown className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                </span>
            </button>
        </th>
    )
}

// ============ MAIN COMPONENT ============
export function CompetitorAnalysisTable({
    data,
    title = "Competitor Analysis",
    subtitle = "Top brands in AI responses",
    onViewPrompts
}: CompetitorAnalysisTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>('rank')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

    const competitors = data || defaultCompetitorData

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortDirection('asc')
        }
    }

    const sortedData = useMemo(() => {
        return [...competitors].sort((a, b) => {
            const aVal = a[sortKey]
            const bVal = b[sortKey]

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortDirection === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal)
            }

            const aNum = Number(aVal) || 0
            const bNum = Number(bVal) || 0
            return sortDirection === 'asc' ? aNum - bNum : bNum - aNum
        })
    }, [competitors, sortKey, sortDirection])

    return (
        <div className="bg-surface-2 border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                    <p className="text-sm text-text-muted">{subtitle}</p>
                </div>
                {onViewPrompts && (
                    <button
                        onClick={onViewPrompts}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-surface-3 transition-colors text-sm font-medium text-foreground"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Prompts
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-surface-1">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-12">#</th>
                            <SortableHeader label="Brand" sortKey="brand" currentSort={sortKey} currentDirection={sortDirection} onSort={handleSort} />
                            <SortableHeader label="Domain" sortKey="domain" currentSort={sortKey} currentDirection={sortDirection} onSort={handleSort} />
                            <SortableHeader label="Mentions" sortKey="mentionPercent" currentSort={sortKey} currentDirection={sortDirection} onSort={handleSort} hasInfo />
                            <SortableHeader label="Avg Position" sortKey="avgPosition" currentSort={sortKey} currentDirection={sortDirection} onSort={handleSort} hasInfo />
                            <th className="px-4 py-3 text-left">
                                <span className="flex items-center gap-1 text-xs font-medium text-text-muted uppercase tracking-wider">
                                    <span className="text-primary">Sources</span>
                                    <span className="text-text-muted">|</span>
                                    <span className="text-success">Refs</span>
                                    <Info className="w-3 h-3 text-text-muted ml-1" />
                                </span>
                            </th>
                            <SortableHeader label="Score" sortKey="score" currentSort={sortKey} currentDirection={sortDirection} onSort={handleSort} hasInfo />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sortedData.map((competitor, index) => (
                            <tr
                                key={competitor.domain}
                                className={`hover:bg-surface-3/50 transition-colors ${competitor.isYourBrand ? 'bg-primary-muted' : ''
                                    }`}
                            >
                                <td className="px-4 py-4 text-sm text-text-muted font-medium">
                                    {competitor.rank}
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        {competitor.brandIcon ? (
                                            <span className="text-lg">{competitor.brandIcon}</span>
                                        ) : (
                                            <div className="w-6 h-6 rounded bg-surface-3 flex items-center justify-center text-xs font-bold text-text-muted">
                                                {competitor.brand.charAt(0)}
                                            </div>
                                        )}
                                        <span className={`text-sm font-medium ${competitor.isYourBrand ? 'text-primary' : 'text-foreground'}`}>
                                            {competitor.brand}
                                        </span>
                                        {competitor.isYourBrand && (
                                            <span className="px-2 py-0.5 text-xs font-medium bg-primary text-white rounded">
                                                You
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <a
                                        href={`https://${competitor.domain}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline flex items-center gap-1"
                                    >
                                        {competitor.domain}
                                    </a>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-sm font-medium text-success">
                                        {competitor.mentionPercent.toFixed(1)}%
                                    </span>
                                    <span className="text-xs text-text-muted ml-1">
                                        ({competitor.mentions})
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-sm text-foreground">
                                    #{competitor.avgPosition.toFixed(1)}
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-sm text-primary font-medium">{competitor.sources}</span>
                                    <span className="text-text-muted mx-1">|</span>
                                    <span className="text-sm text-success font-medium">{competitor.refs}</span>
                                </td>
                                <td className="px-4 py-4">
                                    <ScoreBar score={competitor.score} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
