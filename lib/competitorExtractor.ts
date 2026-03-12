/**
 * Competitor Extraction Utilities
 * 
 * Three methods for detecting competitors in AI responses:
 * 1. Source-based: Extract domains from citations
 * 2. Text mining: Parse responses for brand/company names
 * 3. User-defined: Match against tracked competitor list
 */

import type { AuditRun, Citation } from '@/lib/types'

export interface CompetitorMention {
    name: string
    mentions: number
    models: string[]
    type: 'source' | 'mentioned' | 'tracked'
    isOwnBrand?: boolean
    sentiment?: 'positive' | 'neutral' | 'negative'
}

/**
 * 1. SOURCE-BASED COMPETITORS
 * Extract unique domains from citations across all runs
 */
export function extractSourceCompetitors(
    runs: AuditRun[],
    ownDomain?: string
): CompetitorMention[] {
    const domainMap: Record<string, { count: number; models: Set<string> }> = {}

    runs.forEach(run => {
        if (run.citations_found && Array.isArray(run.citations_found)) {
            run.citations_found.forEach((citation: Citation) => {
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
                    domainMap[domain] = { count: 0, models: new Set() }
                }
                domainMap[domain].count++
                domainMap[domain].models.add(run.ai_model)
            })
        }
    })

    return Object.entries(domainMap)
        .map(([domain, data]) => ({
            name: domain,
            mentions: data.count,
            models: Array.from(data.models),
            type: 'source' as const,
            isOwnBrand: ownDomain ? domain.includes(ownDomain.replace('www.', '')) : false
        }))
        .sort((a, b) => b.mentions - a.mentions)
}

/**
 * 2. TEXT MINING - BRAND NAME EXTRACTION
 * Parse response text to find company/brand mentions
 * Uses common patterns: capitalized words, proper nouns, known suffixes
 */
export function extractMentionedBrands(
    runs: AuditRun[],
    brandAliases: string[] = []
): CompetitorMention[] {
    const brandMap: Record<string, { count: number; models: Set<string> }> = {}

    // Common company suffixes and patterns
    const companyPatterns = [
        /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+(?:Inc|LLC|Ltd|Corp|Co|Company|Group|Agency|Studio|Labs|Technologies|Tech|Solutions|Services)\b/g,
        /\b([A-Z][a-zA-Z]+(?:\.(?:com|io|co|org|net|ai)))\b/gi,
        // African/Kenyan specific patterns
        /\b([A-Z][a-zA-Z]+)\s+(?:Kenya|Africa|Nairobi|African)\b/g,
        /\b(?:Kenya|African|Nairobi)\s+([A-Z][a-zA-Z]+)\b/g,
    ]

    // Known brand patterns (two+ capitalized words together)
    const brandPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g

    runs.forEach(run => {
        if (!run.response_raw) return

        const text = run.response_raw
        const foundBrands = new Set<string>()

        // Apply company patterns
        companyPatterns.forEach(pattern => {
            const matches = text.matchAll(pattern)
            for (const match of matches) {
                const brand = match[1]?.trim()
                if (brand && brand.length > 2 && brand.length < 50) {
                    foundBrands.add(brand)
                }
            }
        })

        // Apply general brand pattern
        const brandMatches = text.matchAll(brandPattern)
        for (const match of brandMatches) {
            const brand = match[1]?.trim()
            if (brand && brand.length > 3 && brand.length < 40) {
                // Filter out common false positives
                const skipWords = ['The', 'This', 'That', 'Here', 'There', 'What', 'When', 'Where', 'How', 'Why',
                    'Best', 'Top', 'Most', 'More', 'Some', 'Many', 'All', 'Any', 'Each', 'Every',
                    'Software Engineering', 'Web Development', 'Machine Learning', 'Data Science',
                    'University', 'College', 'School', 'Institute', 'Program', 'Course']
                if (!skipWords.some(w => brand.includes(w))) {
                    foundBrands.add(brand)
                }
            }
        }

        // Add to map
        foundBrands.forEach(brand => {
            if (!brandMap[brand]) {
                brandMap[brand] = { count: 0, models: new Set() }
            }
            brandMap[brand].count++
            brandMap[brand].models.add(run.ai_model)
        })
    })

    const ownBrandLower = brandAliases.map(a => a.toLowerCase())

    return Object.entries(brandMap)
        .map(([name, data]) => ({
            name,
            mentions: data.count,
            models: Array.from(data.models),
            type: 'mentioned' as const,
            isOwnBrand: ownBrandLower.some(alias => name.toLowerCase().includes(alias))
        }))
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 20) // Top 20 mentioned brands
}

/**
 * 3. USER-DEFINED TRACKED COMPETITORS
 * Check responses for specific competitor names defined by user
 */
export function findTrackedCompetitors(
    runs: AuditRun[],
    trackedCompetitors: string[],
    brandAliases: string[] = []
): CompetitorMention[] {
    if (!trackedCompetitors.length) return []

    const competitorMap: Record<string, { count: number; models: Set<string> }> = {}

    // Initialize all tracked competitors
    trackedCompetitors.forEach(comp => {
        competitorMap[comp] = { count: 0, models: new Set() }
    })

    // Also track own brand
    brandAliases.forEach(alias => {
        competitorMap[alias] = { count: 0, models: new Set() }
    })

    runs.forEach(run => {
        if (!run.response_raw) return

        const textLower = run.response_raw.toLowerCase()

        // Check for each tracked competitor
        trackedCompetitors.forEach(competitor => {
            if (textLower.includes(competitor.toLowerCase())) {
                competitorMap[competitor].count++
                competitorMap[competitor].models.add(run.ai_model)
            }
        })

        // Check for own brand
        brandAliases.forEach(alias => {
            if (textLower.includes(alias.toLowerCase())) {
                competitorMap[alias].count++
                competitorMap[alias].models.add(run.ai_model)
            }
        })
    })

    const ownBrandLower = brandAliases.map(a => a.toLowerCase())

    return Object.entries(competitorMap)
        .filter(([, data]) => data.count > 0)
        .map(([name, data]) => ({
            name,
            mentions: data.count,
            models: Array.from(data.models),
            type: 'tracked' as const,
            isOwnBrand: ownBrandLower.some(alias => name.toLowerCase().includes(alias))
        }))
        .sort((a, b) => b.mentions - a.mentions)
}

/**
 * COMBINED: Get all competitor data aggregated
 */
export function getAllCompetitorData(
    runs: AuditRun[],
    options: {
        ownDomain?: string
        brandAliases?: string[]
        trackedCompetitors?: string[]
    } = {}
) {
    return {
        sources: extractSourceCompetitors(runs, options.ownDomain),
        mentioned: extractMentionedBrands(runs, options.brandAliases),
        tracked: findTrackedCompetitors(runs, options.trackedCompetitors || [], options.brandAliases)
    }
}
