import Link from "next/link"
import { ArrowRight, Layers, Search, BarChart, Globe, Zap, Shield } from "lucide-react"

export const metadata = {
    title: "Features - Free SEO Tools AI Brand Visibility Platform",
    description: "Explore Free SEO Tools's powerful features: Multi-Model Audits, AI Index Graph, Blitz Score, and Citation Tracking.",
}

export default function FeaturesPage() {
    const features = [
        {
            icon: <Layers className="size-6" />,
            title: "Multi-Model Audits",
            description: "Query GPT-5, Gemini, Claude, Perplexity, and DeepSeek simultaneously. See how each AI perceives your brand with side-by-side comparisons.",
            details: ["5 AI models supported", "Parallel querying for speed", "Model-by-model breakdown", "Response comparison view"],
        },
        {
            icon: <Search className="size-6" />,
            title: "AI Index Graph",
            description: "Reverse-engineer the retrieval surface. Discover which sources AI models actually cite and rely on when answering questions about your brand.",
            details: ["Citation source mapping", "Dominant source identification", "Index gap detection", "Retrievability scoring"],
        },
        {
            icon: <Zap className="size-6" />,
            title: "Blitz Score",
            description: "Get a unified 0-100 score measuring your brand's overall AI visibility, sentiment, and citation quality across all models.",
            details: ["Composite visibility metric", "Historical tracking", "Benchmark comparisons", "Improvement recommendations"],
        },
        {
            icon: <Globe className="size-6" />,
            title: "Citation Extraction",
            description: "Identify every source AI models cite when mentioning your brand. See which domains influence your AI presence.",
            details: ["Automatic URL extraction", "Source identification", "Citation frequency tracking", "Domain analysis"],
        },
        {
            icon: <BarChart className="size-6" />,
            title: "Real-Time Results",
            description: "Watch audits happen in real-time with live status updates and streaming results. No waiting, no page refresh.",
            details: ["Live progress indicators", "Streaming responses", "Instant results", "Real-time status updates"],
        },
        {
            icon: <Shield className="size-6" />,
            title: "Secure & Private",
            description: "Your brand data and audit results stay private. We use encryption and never share your data with third parties.",
            details: ["Data encryption", "Private by default", "No data sharing", "Secure authentication"],
        },
    ]

    return (
        <main>
            {/* Hero */}
            <section className="py-20 md:py-32">
                <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
                    <span className="inline-flex items-center rounded-full bg-[var(--primary-muted)] px-4 py-1.5 text-sm font-medium text-[var(--primary)] mb-4">
                        Features
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        Everything You Need for AI Visibility
                    </h1>
                    <p className="text-lg md:text-xl text-[var(--text-muted)]">
                        Comprehensive tools to audit, analyze, and understand how AI models perceive and represent your brand.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--border-hover)] transition-colors"
                            >
                                <div className="size-12 rounded-full bg-[var(--primary-muted)] flex items-center justify-center text-[var(--primary)] mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-[var(--text-muted)] mb-4">{feature.description}</p>
                                <ul className="space-y-2">
                                    {feature.details.map((detail, j) => (
                                        <li key={j} className="flex items-center gap-2 text-sm text-[var(--text-subtle)]">
                                            <div className="size-1.5 rounded-full bg-[var(--primary)]" />
                                            {detail}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="py-20 bg-[var(--surface-1)]">
                <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                    <h2 className="text-3xl font-bold text-center mb-12">Free SEO Tools vs Traditional SEO Tools</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--border)]">
                                    <th className="text-left py-4 px-4 font-medium">Capability</th>
                                    <th className="text-center py-4 px-4 font-medium">Free SEO Tools</th>
                                    <th className="text-center py-4 px-4 font-medium text-[var(--text-muted)]">Traditional SEO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["AI Model Coverage", "✓", "✗"],
                                    ["Multi-Model Comparison", "✓", "✗"],
                                    ["Citation Source Tracking", "✓", "Partial"],
                                    ["Blitz Score (AI Visibility)", "✓", "✗"],
                                    ["Index Graph Analysis", "✓", "✗"],
                                    ["Google Rankings", "✗", "✓"],
                                    ["Backlink Analysis", "✗", "✓"],
                                    ["Real-time AI Audits", "✓", "✗"],
                                ].map(([feature, blitz, traditional], i) => (
                                    <tr key={i} className="border-b border-[var(--border)]">
                                        <td className="py-4 px-4">{feature}</td>
                                        <td className="py-4 px-4 text-center">
                                            <span className={blitz === "✓" ? "text-[var(--success)]" : blitz === "Partial" ? "text-[var(--warning)]" : "text-[var(--text-muted)]"}>
                                                {blitz}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className={traditional === "✓" ? "text-[var(--success)]" : traditional === "Partial" ? "text-[var(--warning)]" : "text-[var(--text-muted)]"}>
                                                {traditional}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/80 text-white">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Try Free SEO Tools?
                    </h2>
                    <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                        Start with a free audit and see how AI perceives your brand.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center rounded-full bg-white text-[var(--primary)] hover:bg-white/90 h-12 px-8 text-base font-medium"
                    >
                        Start Free Audit
                        <ArrowRight className="ml-2 size-4" />
                    </Link>
                </div>
            </section>
        </main>
    )
}
