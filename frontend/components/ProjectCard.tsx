'use client'

import Link from 'next/link'
import type { Project, AuditJob } from '@/lib/types'

interface ProjectCardProps {
    project: Project
    recentJobs?: AuditJob[]
}

export function ProjectCard({ project, recentJobs = [] }: ProjectCardProps) {
    // Get last 5 blitz scores for sparkline
    const scores = recentJobs
        .filter(j => j.blitz_score !== null)
        .slice(0, 5)
        .map(j => j.blitz_score as number)
        .reverse()

    const avgScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null

    return (
        <Link href={`/project/${project.id}`}>
            <div className="group relative p-6 rounded-2xl bg-surface-2 border border-border hover:border-border-hover transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                {/* Gradient accent on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                {project.name}
                            </h3>
                            {project.primary_domain && (
                                <p className="text-sm text-text-muted mt-1">
                                    {project.primary_domain}
                                </p>
                            )}
                        </div>

                        {/* Average Score Badge */}
                        {avgScore !== null && (
                            <div className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${avgScore >= 70 ? 'bg-success-muted text-success' :
                                    avgScore >= 40 ? 'bg-warning-muted text-warning' :
                                        'bg-error-muted text-error'}
              `}>
                                {avgScore}%
                            </div>
                        )}
                    </div>

                    {/* Sparkline */}
                    {scores.length > 0 && (
                        <div className="mt-4">
                            <Sparkline scores={scores} />
                        </div>
                    )}

                    {/* Aliases */}
                    {project.brand_aliases && project.brand_aliases.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {project.brand_aliases.slice(0, 3).map((alias, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-0.5 text-xs rounded-md bg-surface-3 text-text-subtle"
                                >
                                    {alias}
                                </span>
                            ))}
                            {project.brand_aliases.length > 3 && (
                                <span className="px-2 py-0.5 text-xs rounded-md bg-surface-3 text-text-muted">
                                    +{project.brand_aliases.length - 3} more
                                </span>
                            )}
                        </div>
                    )}

                    {/* Empty state */}
                    {recentJobs.length === 0 && (
                        <p className="text-sm text-text-muted mt-4">
                            No audits yet. Run your first audit to see results.
                        </p>
                    )}
                </div>
            </div>
        </Link>
    )
}

function Sparkline({ scores }: { scores: number[] }) {
    if (scores.length === 0) return null

    const max = 100
    const min = 0
    const width = 100
    const height = 32
    const padding = 4

    const points = scores.map((score, i) => {
        const x = padding + (i / (scores.length - 1 || 1)) * (width - padding * 2)
        const y = height - padding - ((score - min) / (max - min)) * (height - padding * 2)
        return `${x},${y}`
    }).join(' ')

    const lastScore = scores[scores.length - 1]
    const color = lastScore >= 70 ? 'var(--success)' :
        lastScore >= 40 ? 'var(--warning)' : 'var(--error)'

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Last point dot */}
            {scores.length > 0 && (
                <circle
                    cx={padding + ((scores.length - 1) / (scores.length - 1 || 1)) * (width - padding * 2)}
                    cy={height - padding - ((lastScore - min) / (max - min)) * (height - padding * 2)}
                    r="3"
                    fill={color}
                />
            )}
        </svg>
    )
}
