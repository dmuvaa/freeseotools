'use client'

import type { AuditJob, AuditRun, Citation } from '@/lib/types'
import { Cpu, CheckCircle, Link2, Clock } from 'lucide-react'

interface JobQuickStatsProps {
    job: AuditJob
    runs: AuditRun[]
}

interface StatCardProps {
    icon: React.ReactNode
    label: string
    value: string | number
    subtext?: string
    color: string
}

function StatCard({ icon, label, value, subtext, color }: StatCardProps) {
    return (
        <div className="bg-surface-2 border border-border rounded-xl p-4 flex items-center gap-4 hover:border-border-bright transition-colors">
            <div className={`p-3 rounded-xl ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-text-muted text-sm">{label}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                {subtext && <p className="text-xs text-text-muted">{subtext}</p>}
            </div>
        </div>
    )
}

export function JobQuickStats({ job, runs }: JobQuickStatsProps) {
    // Calculate stats from runs
    const modelsQueried = job.models_selected.length
    const mentionedCount = runs.filter(r => r.is_mentioned).length
    const mentionRate = modelsQueried > 0 ? Math.round((mentionedCount / modelsQueried) * 100) : 0

    // Get total unique citations across all runs
    const allCitations = runs.flatMap(r => r.citations_found || [])
    const uniqueDomains = new Set(allCitations.map((c: Citation) => {
        if (c.domain) return c.domain
        try {
            return new URL(c.url).hostname.replace('www.', '')
        } catch {
            return c.url || 'unknown'
        }
    }))

    // Calculate average execution time
    const completedRuns = runs.filter(r => r.execution_time_ms && r.execution_time_ms > 0)
    const avgTime = completedRuns.length > 0
        ? Math.round(completedRuns.reduce((sum, r) => sum + (r.execution_time_ms || 0), 0) / completedRuns.length)
        : 0
    const avgTimeFormatted = avgTime > 1000 ? `${(avgTime / 1000).toFixed(1)}s` : `${avgTime}ms`

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
                icon={<Cpu className="w-5 h-5 text-blue-400" />}
                label="Models Queried"
                value={modelsQueried}
                subtext="AI engines"
                color="bg-blue-500/10"
            />
            <StatCard
                icon={<CheckCircle className="w-5 h-5 text-green-400" />}
                label="Mentioned In"
                value={`${mentionedCount}/${modelsQueried}`}
                subtext={`${mentionRate}% visibility`}
                color="bg-green-500/10"
            />
            <StatCard
                icon={<Link2 className="w-5 h-5 text-purple-400" />}
                label="Unique Sources"
                value={uniqueDomains.size}
                subtext={`${allCitations.length} total citations`}
                color="bg-purple-500/10"
            />
            <StatCard
                icon={<Clock className="w-5 h-5 text-orange-400" />}
                label="Avg Response Time"
                value={avgTimeFormatted}
                subtext={completedRuns.length > 0
                    ? `${completedRuns.length} responses`
                    : job.status === 'COMPLETED' ? 'No timing data' : 'Processing...'}
                color="bg-orange-500/10"
            />
        </div>
    )
}
