import Link from "next/link"
import { ArrowRight, Target, Eye, Zap, Users } from "lucide-react"

export const metadata = {
    title: "About Free SEO Tools - AI Brand Visibility Platform",
    description: "Learn about Free SEO Tools's mission to help brands understand and improve their visibility across AI search engines.",
}

export default function AboutPage() {
    return (
        <main>
            {/* Hero */}
            <section className="py-20 md:py-32">
                <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        Making Brands Visible in the Age of AI
                    </h1>
                    <p className="text-lg md:text-xl text-[var(--text-muted)] mb-8">
                        Free SEO Tools was founded with a simple mission: help brands understand how AI sees them,
                        and give them the tools to improve their visibility across the new wave of AI-powered search.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="py-16 bg-[var(--surface-1)]">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                            <p className="text-[var(--text-muted)] mb-4">
                                The way people discover information is changing. ChatGPT, Gemini, Claude, and Perplexity
                                are becoming the new front doors to the internet. Traditional SEO tells you how Google
                                sees your website — but who's telling you how AI sees your brand?
                            </p>
                            <p className="text-[var(--text-muted)]">
                                That's where Free SEO Tools comes in. We audit your brand's presence across major AI models,
                                showing you exactly what they know, what they're missing, and what sources they cite.
                                It's SEO for the AI era.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                                <Target className="size-8 text-[var(--primary)] mb-3" />
                                <div className="text-2xl font-bold">5</div>
                                <div className="text-sm text-[var(--text-muted)]">AI Models Tracked</div>
                            </div>
                            <div className="p-6 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                                <Eye className="size-8 text-[var(--accent)] mb-3" />
                                <div className="text-2xl font-bold">Real-time</div>
                                <div className="text-sm text-[var(--text-muted)]">Audit Results</div>
                            </div>
                            <div className="p-6 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                                <Zap className="size-8 text-[var(--success)] mb-3" />
                                <div className="text-2xl font-bold">&lt;30s</div>
                                <div className="text-sm text-[var(--text-muted)]">Average Audit Time</div>
                            </div>
                            <div className="p-6 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                                <Users className="size-8 text-[var(--warning)] mb-3" />
                                <div className="text-2xl font-bold">Free</div>
                                <div className="text-sm text-[var(--text-muted)]">To Get Started</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20">
                <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                    <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="size-16 rounded-full bg-[var(--primary-muted)] flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🔍</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Transparency</h3>
                            <p className="text-[var(--text-muted)]">
                                We show you exactly what AI models say about your brand — the good and the bad.
                                No hidden metrics or black boxes.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="size-16 rounded-full bg-[var(--accent-muted)] flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Speed</h3>
                            <p className="text-[var(--text-muted)]">
                                AI moves fast, and so do we. Get comprehensive audits in seconds,
                                not hours. Real-time insights when you need them.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="size-16 rounded-full bg-[var(--success-muted)] flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Actionable</h3>
                            <p className="text-[var(--text-muted)]">
                                Data without action is just noise. We tell you exactly what AI models
                                know and what sources they rely on.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/80 text-white">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to See How AI Sees Your Brand?
                    </h2>
                    <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                        Start with a free audit and discover your AI visibility.
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
