'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis } from 'recharts'
import { ArrowUpRight, TrendingUp, Globe } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility function for merging Tailwind classes
function cn(...inputs: (string | undefined | null | boolean)[]) {
    return twMerge(clsx(inputs))
}

// ============ COLOR PALETTE ============
const COLORS = {
    brandBlue: '#3b82f6',
    successGreen: '#10b981',
    warningOrange: '#f97316',
    dangerRed: '#ef4444',
    surfaceBg: '#1e1e1e',
    gray: '#4b5563',
}

// ============ MOCK DATA ============
const defaultShareOfVoiceData = [
    { name: 'My Brand', value: 35, color: COLORS.brandBlue },
    { name: 'Competitors', value: 45, color: COLORS.dangerRed },
    { name: 'Unclaimed', value: 20, color: COLORS.gray },
]

const defaultSentimentData = [
    { name: 'Positive', value: 58, color: COLORS.successGreen },
    { name: 'Neutral', value: 27, color: COLORS.warningOrange },
    { name: 'Negative', value: 15, color: COLORS.dangerRed },
]

const defaultAuthoritySourcesData = [
    { name: 'Reddit', mentions: 847, percentage: 100 },
    { name: 'Quora', mentions: 623, percentage: 74 },
    { name: 'G2 Reviews', mentions: 412, percentage: 49 },
    { name: 'Capterra', mentions: 289, percentage: 34 },
    { name: 'TrustRadius', mentions: 156, percentage: 18 },
]

// ============ TYPES ============
interface ShareOfVoiceItem {
    name: string
    value: number
    color: string
}

interface SentimentItem {
    name: string
    value: number
    color: string
}

interface AuthoritySourceItem {
    name: string
    mentions: number
    percentage: number
}

interface DashboardWidgetsProps {
    shareOfVoiceData?: ShareOfVoiceItem[] | null
    sentimentData?: SentimentItem[] | null
    authoritySourcesData?: AuthoritySourceItem[] | null
}

// ============ CUSTOM TOOLTIP ============
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string } }[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/90 border border-gray-800 rounded-lg px-3 py-2 shadow-xl">
                <p className="text-white text-sm font-medium">{payload[0].name}</p>
                <p className="text-gray-300 text-xs">{payload[0].value}%</p>
            </div>
        )
    }
    return null
}

// ============ WIDGET A: SHARE OF VOICE ============
export function ShareOfVoiceWidget({ data }: { data?: ShareOfVoiceItem[] | null }) {
    const chartData = data || defaultShareOfVoiceData
    const total = chartData.reduce((sum, item) => sum + item.value, 0)
    const brandValue = chartData.find(d => d.name === 'My Brand')?.value || 0

    return (
        <div className="bg-surface-2 border border-border rounded-2xl p-6 h-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Share of Voice</h3>
                    <p className="text-sm text-text-muted">Brand visibility vs competitors</p>
                </div>
                <div className="flex items-center gap-1 text-success text-sm font-medium">
                    <TrendingUp className="w-4 h-4" />
                    <span>+2.3%</span>
                </div>
            </div>

            <div className="h-[200px] flex items-center">
                <ResponsiveContainer width="50%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={3}
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

                {/* Legend */}
                <div className="flex flex-col gap-3">
                    {chartData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-text-subtle">{item.name}</span>
                            <span className="text-sm font-medium text-foreground ml-auto">{item.value}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Center stat */}
            <div className="text-center mt-2">
                <div className="text-3xl font-bold text-foreground">{brandValue}%</div>
                <div className="text-xs text-text-muted">Your Share</div>
            </div>
        </div>
    )
}

// ============ WIDGET B: SENTIMENT HEALTH ============
export function SentimentHealthWidget({ data }: { data?: SentimentItem[] | null }) {
    const chartData = data || defaultSentimentData
    const total = chartData.reduce((sum, item) => sum + item.value, 0)

    return (
        <div className="bg-surface-2 border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Sentiment Health</h3>
                    <p className="text-sm text-text-muted">Mention sentiment breakdown</p>
                </div>
                <div className="flex items-center gap-1 text-success text-sm font-medium">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Healthy</span>
                </div>
            </div>

            {/* Stacked horizontal bar */}
            <div className="h-12 rounded-xl overflow-hidden flex mb-4">
                {chartData.map((item, index) => (
                    <div
                        key={index}
                        className="h-full transition-all duration-300 hover:opacity-80 relative group"
                        style={{
                            width: `${(item.value / total) * 100}%`,
                            backgroundColor: item.color
                        }}
                    >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 border border-gray-800 rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            <span className="text-white text-xs">{item.name}: {item.value}%</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between">
                {chartData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-text-subtle">{item.name}</span>
                        <span className="text-sm font-medium text-foreground">{item.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ============ WIDGET C: TOP AUTHORITY SOURCES ============
export function TopAuthoritySourcesWidget({ data }: { data?: AuthoritySourceItem[] | null }) {
    const chartData = data || defaultAuthoritySourcesData

    return (
        <div className="bg-surface-2 border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Top Authority Sources</h3>
                    <p className="text-sm text-text-muted">Where AI found your brand data</p>
                </div>
                <Globe className="w-5 h-5 text-text-muted" />
            </div>

            <div className="space-y-3">
                {chartData.map((source, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <span className="text-sm text-foreground w-24 truncate">{source.name}</span>
                        <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${source.percentage}%`,
                                    backgroundColor: index === 0 ? COLORS.brandBlue :
                                        index === 1 ? COLORS.successGreen :
                                            index === 2 ? COLORS.warningOrange : COLORS.gray
                                }}
                            />
                        </div>
                        <span className="text-xs text-text-muted w-16 text-right">{source.mentions.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ============ COMBINED WIDGET (Sentiment + Sources) ============
export function SentimentAndSourcesWidget({
    sentimentData,
    authoritySourcesData
}: {
    sentimentData?: SentimentItem[] | null
    authoritySourcesData?: AuthoritySourceItem[] | null
}) {
    return (
        <div className="flex flex-col gap-6 h-full">
            <SentimentHealthWidget data={sentimentData} />
            <TopAuthoritySourcesWidget data={authoritySourcesData} />
        </div>
    )
}

// ============ MAIN EXPORT ============
export function DashboardWidgets({
    shareOfVoiceData,
    sentimentData,
    authoritySourcesData
}: DashboardWidgetsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1">
                <ShareOfVoiceWidget data={shareOfVoiceData} />
            </div>
            <div className="lg:col-span-2">
                <SentimentAndSourcesWidget
                    sentimentData={sentimentData}
                    authoritySourcesData={authoritySourcesData}
                />
            </div>
        </div>
    )
}
