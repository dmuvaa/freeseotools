'use client'

import { useState } from 'react'
import { AuditJob, AuditRun, IndexAudit } from '@/lib/types'
import {
    LightbulbIcon,
    SearchIcon,
    TargetIcon,
    RocketIcon,
    CrosshairIcon,
    BookOpenIcon,
    Loader2Icon,
    SparklesIcon
} from 'lucide-react'

interface ContentOpportunitiesProps {
    job: AuditJob
    runs: AuditRun[]
    indexAudit?: IndexAudit | null
    primaryDomain?: string | null
}

export function ContentOpportunities({ job, runs, indexAudit, primaryDomain }: ContentOpportunitiesProps) {
    const [loadingTips, setLoadingTips] = useState<Record<string, boolean>>({})
    const [aiTips, setAiTips] = useState<Record<string, { tips: string[], additional_tips: string }>>({})

    const handleGetTips = async (model: string) => {
        setLoadingTips(prev => ({ ...prev, [model]: true }))
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/strategy/generate-tips`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: job.project_id,
                    query_phrase: job.query_phrase,
                    target_model: model,
                    brand_name: primaryDomain ? primaryDomain.split('.')[0].charAt(0).toUpperCase() + primaryDomain.split('.')[0].slice(1) : 'Your Brand'
                })
            })
            if (res.ok) {
                const data = await res.json()
                setAiTips(prev => ({ ...prev, [model]: data }))
            }
        } catch (error) {
            console.error("Failed to fetch tips", error)
        } finally {
            setLoadingTips(prev => ({ ...prev, [model]: false }))
        }
    }

    const renderTips = (tips: string[]) => {
        let parsed: string[] = []
        tips.forEach(tip => {
            // Aggressively split massive text blocks that use numbering or bullets
            if (tip.length > 60 && (/\d+\.\s/.test(tip) || /\*\*/.test(tip) || /\s\*\s/.test(tip) || /\s-\s/.test(tip))) {
                // Split by '1. ', '2. ', '* ', '- ', '**1.', etc.
                const parts = tip.split(/(?:^|\s)(?:\d+\.|[*•-])\s+(?:\*\*)?/)
                if (parts.length <= 1) {
                    // Try splitting by just ** if it's weirdly formatted
                    parsed.push(...tip.split(/\*\*[A-Za-z\s]+:\*\*/).map(p => p.trim()))
                } else {
                    parsed.push(...parts.map(p => p.replace(/\*\*/g, '').trim()))
                }
            } else {
                parsed.push(tip.replace(/\*\*/g, ''))
            }
        })

        // Filter and clean
        const finalTips = parsed
            .map(t => t.replace(/^(?:\*\*)?\d+\.(?:\*\*)?\s*/, '').replace(/^[-*•]\s*/, '').trim())
            .filter(t => t.length > 20)
            .slice(0, 3)

        // Fallback if the parser completely failed to extract chunks
        const displayTips = finalTips.length > 0 ? finalTips : tips.slice(0, 3).map(t => t.replace(/\*\*/g, ''))

        return displayTips.map((tip, idx) => (
            <li key={idx} className="flex gap-2.5 text-sm text-foreground">
                <span className="text-primary font-bold shrink-0">{idx + 1}.</span>
                <span className="leading-relaxed text-left">{tip}</span>
            </li>
        ))
    }

    // 1. Identify Model Gaps (Models that didn't mention the brand)
    const failedRuns = runs.filter(r => !r.is_mentioned && r.response_raw)

    // 2. Identify Citation Gaps (Domains appearing in failed runs)
    const competitorCounts = new Map<string, number>()
    failedRuns.forEach(run => {
        run.citations_found?.forEach(cit => {
            let domain = cit.domain
            if (domain && domain !== primaryDomain) {
                competitorCounts.set(domain, (competitorCounts.get(domain) || 0) + 1)
            }
        })
    })

    // Sort competitors by mention count
    const sortedCompetitors = Array.from(competitorCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([domain, count]) => ({ domain, count }))

    // 3. Index Gaps (From Index Graph)
    const missingEntities = indexAudit?.missing_entities || []
    const conflicts = indexAudit?.conflicts || []

    const hasOpportunities = failedRuns.length > 0 || missingEntities.length > 0 || conflicts.length > 0

    if (!hasOpportunities && runs.length > 0) {
        return (
            <div className="rounded-2xl bg-surface-2 border border-border p-6 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-success-muted flex items-center justify-center text-success shrink-0">
                    <RocketIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Perfect Coverage!</h3>
                    <p className="text-text-muted text-sm mt-1">You are mentioned in all {runs.length} AI responses. Keep maintaining your momentum.</p>
                </div>
            </div>
        )
    }

    // Helper to get platform strategy based on model
    const getPlatformStrategy = (model: string) => {
        const m = model.toLowerCase()
        if (m.includes('perplexity') || m.includes('sonar')) {
            return {
                focus: "Real-time Discussions & News",
                contentTypes: "Opinionated articles, PR pieces, technical forum answers, and highly cited resource pages.",
                example: "A detailed Reddit post dissecting a recent industry news event, naturally linking to a primary research report on your site.",
                whereToPost: "Reddit, Hacker News, PR distribution networks, Twitter threads, Wikipedia.",
                launchStrategy: "Seed questions on Reddit/Quora and answer them thoroughly with links back to your domain. Release PR on high DR news sites.",
                why: "Perplexity relies heavily on fresh, real-time indexed data and highly-trusted user-generated content platforms."
            }
        }
        if (m.includes('gpt') || m.includes('openai')) {
            return {
                focus: "High-Authority Evergreen Content",
                contentTypes: "Comprehensive guides, statistical reports, listicles, and official documentation.",
                example: "A 5,000-word 'Definitive Guide to [Topic]' featuring original data, expert quotes, and comprehensive formatting.",
                whereToPost: "Your main blog, Medium, LinkedIn Articles, established industry platforms.",
                launchStrategy: "Optimize for traditional Google SEO. Earn backlinks from high Domain Authority sites.",
                why: "OpenAI models favor authoritative, well-structured, and frequently cited web content as their baseline training set."
            }
        }
        if (m.includes('gemini') || m.includes('google')) {
            return {
                focus: "Google Ecosystem & Video",
                contentTypes: "YouTube tutorials, Google Business Profile updates, rich snippet optimized FAQ pages.",
                example: "A 10-minute YouTube video titled 'How to solve [Problem]', with a highly optimized description and video transcript.",
                whereToPost: "YouTube, Google Business Profile, your own domain with strict schema markup.",
                launchStrategy: "Create short-form YouTube videos targeting the exact query. Use Google Search Console to ensure rapid indexing.",
                why: "Gemini heavily integrates with Google's proprietary properties (like YouTube) and relies heavily on structured data from Google Search."
            }
        }
        if (m.includes('claude') || m.includes('anthropic')) {
            return {
                focus: "Deep Semantic Content",
                contentTypes: "Whitepapers, extensive technical documentation, deep-dive analytical essays, case studies.",
                example: "A gated but publicly indexed HTML whitepaper detailing a complex case study with rigorous logical reasoning.",
                whereToPost: "Company knowledge base, Substack, GitHub (for code docs), academic or professional journals.",
                launchStrategy: "Publish ungated, highly detailed PDF-like content as HTML webpages. Ensure pristine grammar and logical flow.",
                why: "Claude places a premium on well-reasoned, long-form text with high semantic density and logical structure."
            }
        }
        return {
            focus: "General Digital PR",
            contentTypes: "Standard blog posts, social media updates, and community engagement.",
            example: "A widely distributed press release or guest post on a niche, but relevant, industry blog.",
            whereToPost: "Social media, niche industry forums, secondary blogs.",
            launchStrategy: "Maintain a steady drumbeat of mentions across the web to build basic entity recognition.",
            why: "Broad web presence helps generic LLMs pick up your brand over time."
        }
    }

    const brandName = primaryDomain ? primaryDomain.split('.')[0].charAt(0).toUpperCase() + primaryDomain.split('.')[0].slice(1) : 'Your Brand'
    const topCompetitor = sortedCompetitors.length > 0 ? sortedCompetitors[0].domain : null

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <TargetIcon className="w-5 h-5 text-primary" />
                Intelligence & Strategy Playbook
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Module 1: Strategic Action Plan */}
                <div className="rounded-2xl bg-surface-2 border border-border p-6 md:col-span-2 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-primary-muted flex items-center justify-center text-primary shrink-0">
                            <LightbulbIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Strategic Action Plan</h3>
                            <p className="text-xs text-text-muted">High-converting content angles generated for "{job.query_phrase}"</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 bg-surface-1 border border-border rounded-xl transition-all hover:border-primary/50 hover:shadow-md cursor-default">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 block">Authority Guide</span>
                            <p className="text-sm text-foreground font-semibold">"The Ultimate Guide to {job.query_phrase}"</p>
                            <p className="text-xs text-text-muted mt-3 leading-relaxed">Create an exhaustive, long-form pillar page that covers every aspect of the topic to establish domain authority and train AI scrapers.</p>
                        </div>
                        <div className="p-5 bg-surface-1 border border-border rounded-xl transition-all hover:border-warning/50 hover:shadow-md cursor-default">
                            <span className="text-[10px] font-bold text-warning uppercase tracking-wider mb-2 block">Problem / Solution</span>
                            <p className="text-sm text-foreground font-semibold">"{job.query_phrase}: Pitfalls & How to Avoid Them"</p>
                            <p className="text-xs text-text-muted mt-3 leading-relaxed">Target high-intent users actively struggling with this topic by offering actionable solutions while naturally positioning your product.</p>
                        </div>
                        <div className="p-5 bg-surface-1 border border-border rounded-xl transition-all hover:border-success/50 hover:shadow-md cursor-default">
                            <span className="text-[10px] font-bold text-success uppercase tracking-wider mb-2 block">Brand Positioning</span>
                            <p className="text-sm text-foreground font-semibold">"Why {brandName} is the Best Choice for {job.query_phrase}"</p>
                            <p className="text-xs text-text-muted mt-3 leading-relaxed">A high-conversion bottom-of-funnel landing page designed to capture ready-to-buy traffic and clearly state your UVP to reasoning agents.</p>
                        </div>
                    </div>
                </div>

                {/* Module 2: Platform Targeting Matrix */}
                {failedRuns.length > 0 && (
                    <div className="rounded-2xl bg-surface-2 border border-border p-6 shadow-sm md:col-span-2 flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-warning-muted flex items-center justify-center text-warning shrink-0">
                                <SearchIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Platform Targeting Matrix</h3>
                                <p className="text-xs text-text-muted">Comprehensive guidelines on what to create and where to publish to close AI blind spots.</p>
                            </div>
                        </div>
                        <div className="space-y-4 flex-1">
                            {failedRuns.map(run => {
                                const strategy = getPlatformStrategy(run.ai_model)
                                return (
                                    <div key={run.ai_model} className="p-5 bg-surface-1 border border-border rounded-xl relative overflow-hidden group transition-all hover:border-warning/50">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-warning/60 group-hover:bg-warning transition-colors" />

                                        <div className="flex justify-between items-center mb-4 pl-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-foreground bg-surface-3 border border-border px-3 py-1 rounded-md shadow-sm">
                                                    {run.ai_model}
                                                </span>
                                                <span className="text-xs font-medium text-text-subtle bg-surface-2 px-2 py-0.5 rounded-full border border-border/50">
                                                    {strategy.focus}
                                                </span>
                                            </div>
                                            <span className="text-[10px] uppercase font-bold text-warning tracking-wider bg-warning-muted px-2 py-1 rounded">Missing Entity</span>
                                        </div>

                                        <div className="pl-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Column 1 */}
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-[11px] font-bold text-text-subtle uppercase tracking-wider mb-1">Content Formats</h4>
                                                    <p className="text-sm text-foreground leading-relaxed mb-2.5">{strategy.contentTypes}</p>
                                                    <div className="bg-surface-2 p-3 rounded-lg border border-border/50 text-xs shadow-inner">
                                                        <span className="font-semibold text-text-muted block mb-1">Specific Example:</span>
                                                        <span className="text-foreground italic">"{strategy.example}"</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-[11px] font-bold text-text-subtle uppercase tracking-wider mb-1">Where to Publish</h4>
                                                    <p className="text-sm text-foreground leading-relaxed flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/70"></span>
                                                        {strategy.whereToPost}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Column 2 */}
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-[11px] font-bold text-text-subtle uppercase tracking-wider mb-1">Launch Strategy</h4>
                                                    <p className="text-sm text-foreground leading-relaxed">{strategy.launchStrategy}</p>
                                                </div>
                                                <div className="bg-surface-2 p-3 rounded-lg border border-border border-l-2 border-l-primary/40">
                                                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Why it works for {run.ai_model.split('/')[0]}</h4>
                                                    <p className="text-xs text-text-muted leading-relaxed">{strategy.why}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dynamic AI Tips Section */}
                                        <div className="mt-5 pt-5 border-t border-border/50">
                                            {!aiTips[run.ai_model] ? (
                                                <button
                                                    onClick={() => handleGetTips(run.ai_model)}
                                                    disabled={loadingTips[run.ai_model]}
                                                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                                                >
                                                    {loadingTips[run.ai_model] ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
                                                    Ask {run.ai_model.split('/')[1] || run.ai_model} how to rank here
                                                </button>
                                            ) : (
                                                <div className="bg-primary/5 rounded-xl p-5 border border-primary/20 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-500 shadow-sm relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none -mt-10 -mr-10" />
                                                    <div className="flex items-center gap-2 mb-4 relative z-10">
                                                        <SparklesIcon className="w-4 h-4 text-primary" />
                                                        <h4 className="text-sm font-bold text-primary">AI Strategy directly from {run.ai_model.split('/')[1] || run.ai_model}</h4>
                                                    </div>
                                                    <ul className="space-y-2.5 mb-5 relative z-10">
                                                        {renderTips(aiTips[run.ai_model].tips)}
                                                    </ul>
                                                    {aiTips[run.ai_model].additional_tips && (
                                                        <div className="bg-surface-1/80 backdrop-blur-sm p-3.5 rounded-lg text-xs text-text-subtle border border-border relative z-10 font-medium">
                                                            <strong className="text-foreground">Pro-Tip:</strong> {
                                                                // Clean up bolding and truncate if it's too long
                                                                aiTips[run.ai_model].additional_tips
                                                                    .replace(/^- /, '')
                                                                    .replace(/^\* /, '')
                                                                    .replace(/\*\*/g, '')
                                                                    .replace(/Sources?:.*/i, '')
                                                                    .replace(/Additional tips?:.*/i, '')
                                                                    .split('.')[0] + '.'
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Module 3: Competitor Conquesting Playbook */}
                {sortedCompetitors.length > 0 && (
                    <div className="rounded-2xl bg-surface-2 border border-border p-6 shadow-sm flex flex-col">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-lg bg-error-muted flex items-center justify-center text-error shrink-0">
                                <CrosshairIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Competitor Conquesting</h3>
                                <p className="text-xs text-text-muted">Steal share of voice from top cited domains</p>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                            {topCompetitor && (
                                <div className="mb-5 p-4 bg-gradient-to-br from-error-muted/40 to-transparent border border-error/30 rounded-xl relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-error/10 rounded-full blur-xl pointer-events-none" />
                                    <span className="text-[10px] font-bold text-error uppercase tracking-wider block mb-1">Primary Target</span>
                                    <p className="text-sm text-foreground font-semibold mb-3 flex items-center justify-between">
                                        <span>{topCompetitor}</span>
                                        <span className="text-xs text-text-muted font-normal bg-black/20 px-2 py-0.5 rounded-full">{sortedCompetitors[0].count} citations</span>
                                    </p>
                                    <div className="text-xs text-text-subtle leading-relaxed bg-black/10 rounded-lg p-3 border border-border/50">
                                        <strong className="text-foreground block mb-1">Conquest Strategy:</strong> Create a dedicated <span className="text-primary font-medium">"{brandName} vs {topCompetitor.replace('.com', '').split('.')[0].charAt(0).toUpperCase() + topCompetitor.replace('.com', '').split('.')[0].slice(1)}"</span> comparison page. Highlight specific differentiators clearly so reasoning agents can contrast your offering.
                                    </div>
                                </div>
                            )}

                            {sortedCompetitors.length > 1 && (
                                <div className="mt-auto">
                                    <span className="text-xs text-text-subtle mb-2 block font-medium uppercase tracking-wider">Secondary Threat Radar</span>
                                    <ul className="space-y-1.5">
                                        {sortedCompetitors.slice(1, 4).map(comp => (
                                            <li key={comp.domain} className="flex items-center justify-between text-xs py-2 px-3 bg-surface-1 rounded-lg border border-border group hover:border-border/80 transition-colors">
                                                <span className="text-text-subtle truncate max-w-[200px] group-hover:text-foreground transition-colors">{comp.domain}</span>
                                                <span className="text-text-muted font-mono bg-surface-3 px-1.5 rounded">{comp.count}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Module 4: Semantic Gap Filling (Index Graph) */}
                {missingEntities.length > 0 && (
                    <div className="rounded-2xl bg-surface-2 border border-border p-6 md:col-span-2 shadow-sm">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-lg bg-success-muted flex items-center justify-center text-success shrink-0">
                                <BookOpenIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Semantic Gap Filling</h3>
                                <p className="text-xs text-text-muted">Unclaimed knowledge graph entities</p>
                            </div>
                        </div>

                        <div className="p-5 bg-surface-1 border border-border rounded-xl">
                            <p className="text-sm text-text-subtle mb-4 leading-relaxed max-w-3xl">
                                AI models are failing to firmly associate the following critical semantic entities with your brand.
                                <strong className="text-foreground"> Action Item:</strong> Build an SEO Glossary, dedicated resource center, or detailed FAQ schema specifically addressing how your platform interacts with these concepts.
                            </p>
                            <div className="flex flex-wrap gap-2.5">
                                {missingEntities.map((entity, i) => (
                                    <span key={i} className="px-3.5 py-1.5 rounded-lg bg-surface-2 border border-border border-b-2 text-xs font-semibold text-foreground shadow-sm hover:border-primary/50 transition-colors cursor-default">
                                        {entity}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
