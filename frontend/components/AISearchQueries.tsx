'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Search, Info } from 'lucide-react'

// ============ TYPES ============
export interface AIQuery {
    query: string
    count: number
}

export interface QueryCategory {
    name: string
    queryCount: number
    queries: AIQuery[]
}

interface AISearchQueriesProps {
    categories?: QueryCategory[]
    title?: string
    subtitle?: string
}

// ============ MOCK DATA ============
const defaultCategories: QueryCategory[] = [
    {
        name: 'E-commerce SEO Services',
        queryCount: 20,
        queries: [
            { query: 'e-commerce SEO services cost per month 2026', count: 16 },
            { query: 'best e-commerce SEO services for Shopify stores 2026', count: 13 },
            { query: 'typical e-commerce SEO services package', count: 13 },
            { query: 'recommended e-commerce SEO services for WooCommerce stores', count: 10 },
            { query: 'how to measure revenue impact from SEO', count: 9 },
            { query: 'e-commerce SEO link building strategies for product and category pages', count: 9 },
            { query: 'e-commerce SEO category page optimization', count: 8 },
            { query: 'How do e-commerce SEO services improve category page rankings', count: 7 },
            { query: 'KPIs to track when buying e-commerce SEO services', count: 7 },
            { query: 'realistic SEO results 6 months Shopify', count: 7 },
        ]
    },
    {
        name: 'Enterprise SEO Services',
        queryCount: 20,
        queries: [
            { query: 'enterprise SEO platform comparison', count: 14 },
            { query: 'enterprise SEO agency vs in-house team', count: 12 },
            { query: 'best enterprise SEO tools 2026', count: 11 },
        ]
    },
    {
        name: 'Franchise SEO Services',
        queryCount: 20,
        queries: [
            { query: 'franchise SEO best practices', count: 15 },
            { query: 'multi-location SEO strategy', count: 12 },
        ]
    },
    {
        name: 'Local SEO Services',
        queryCount: 20,
        queries: [
            { query: 'local SEO ranking factors 2026', count: 18 },
            { query: 'Google Business Profile optimization', count: 16 },
        ]
    },
    {
        name: 'White Label SEO Services',
        queryCount: 20,
        queries: [
            { query: 'white label SEO reseller programs', count: 22 },
            { query: 'best white label SEO providers', count: 19 },
        ]
    },
]

// ============ QUERY TAG COMPONENT ============
function QueryTag({ query, count }: AIQuery) {
    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-3 hover:bg-surface-3/80 rounded-lg transition-colors cursor-pointer group">
            <Search className="w-3 h-3 text-text-muted" />
            <span className="text-sm text-foreground">{query}</span>
            <span className="text-xs text-text-muted bg-surface-2 px-1.5 py-0.5 rounded">
                {count}
            </span>
        </div>
    )
}

// ============ CATEGORY ACCORDION ============
function CategoryAccordion({ category, isExpanded, onToggle }: {
    category: QueryCategory
    isExpanded: boolean
    onToggle: () => void
}) {
    return (
        <div className="border-b border-border last:border-b-0">
            {/* Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-3/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center">
                        <Search className="w-3 h-3 text-text-muted" />
                    </div>
                    <div className="text-left">
                        <h4 className="text-sm font-medium text-foreground">{category.name}</h4>
                        <p className="text-xs text-text-muted">{category.queryCount} unique queries</p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-text-muted" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-text-muted" />
                )}
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-6 pb-4">
                    <div className="flex flex-wrap gap-2">
                        {category.queries.map((query, index) => (
                            <QueryTag key={index} {...query} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// ============ MAIN COMPONENT ============
export function AISearchQueries({
    categories,
    title = "AI Search Queries",
    subtitle = "Keywords AI models used when searching for information - use these to optimize your content"
}: AISearchQueriesProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['E-commerce SEO Services']))
    const [allExpanded, setAllExpanded] = useState(false)

    const data = categories || defaultCategories

    const toggleCategory = (name: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev)
            if (next.has(name)) {
                next.delete(name)
            } else {
                next.add(name)
            }
            return next
        })
    }

    const toggleAll = () => {
        if (allExpanded) {
            setExpandedCategories(new Set())
        } else {
            setExpandedCategories(new Set(data.map(c => c.name)))
        }
        setAllExpanded(!allExpanded)
    }

    return (
        <div className="bg-surface-2 border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-muted flex items-center justify-center">
                        <Search className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                        <p className="text-sm text-text-muted">{subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleAll}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary-muted rounded-lg transition-colors"
                    >
                        {allExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {allExpanded ? 'Collapse All' : 'Expand All'}
                    </button>
                    <Info className="w-4 h-4 text-text-muted" />
                </div>
            </div>

            {/* Categories */}
            <div>
                {data.map((category) => (
                    <CategoryAccordion
                        key={category.name}
                        category={category}
                        isExpanded={expandedCategories.has(category.name)}
                        onToggle={() => toggleCategory(category.name)}
                    />
                ))}
            </div>
        </div>
    )
}
