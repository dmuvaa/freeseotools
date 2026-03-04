import { Metadata } from "next";
import Link from "next/link";
import KeywordCannibalizationClient from "./client";

export const metadata: Metadata = {
    title: "Free Keyword Cannibalization Checker | Stop Competing Against Yourself",
    description: "Free Keyword Cannibalization Checker: Compare 2–10 URLs against a target keyword to detect content similarity, title duplication, and self-competition that dilutes rankings.",
};

export default function KeywordCannibalizationPage() {
    return (
        <>
            <KeywordCannibalizationClient />
            <div className="border-t border-[var(--border)] mt-4">
                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-600 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free Keyword Cannibalization Checker</h2>
                        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">When multiple pages compete for the same keyword, Google cannot determine which to rank — so it ranks none of them well. Our free tool computes pairwise content similarity and keyword density across up to 10 URLs so you can consolidate, differentiate, or canonicalize your way out of self-competition.</p>
                    </div>
                </section>
                <section className="px-6 py-12 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-8">How Keyword Cannibalization Destroys Rankings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: "📊", title: "Split Link Equity", color: "from-rose-500/20 to-red-500/10 border-rose-500/20", desc: "Backlinks pointing to Page A for a keyword and backlinks pointing to Page B for the same keyword split the total authority you've built. Neither page accumulates enough to rank as well as a single consolidated resource would." },
                            { icon: "🤷", title: "Google's Indecision", color: "from-orange-500/20 to-amber-500/10 border-orange-500/20", desc: "When Google crawls two near-identical pages targeting the same intent, it must decide which to rank. It often oscillates between them — swapping rankings week to week — causing unpredictable performance and click-through instability." },
                            { icon: "📉", title: "CTR Dilution", color: "from-yellow-500/20 to-orange-500/10 border-yellow-500/20", desc: "If two of your pages appear for the same query, the combined click-through rate may be lower than a single dominant listing because users see repeated brand results and perceive a lack of variety in the search results." },
                        ].map(f => (
                            <div key={f.title} className={`rounded-2xl border bg-gradient-to-br ${f.color} p-6`}>
                                <div className="text-4xl mb-3">{f.icon}</div>
                                <h4 className="font-bold text-lg mb-2">{f.title}</h4>
                                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="bg-[var(--surface-1)] px-6 py-12">
                    <div className="max-w-4xl mx-auto space-y-5">
                        <h3 className="text-2xl font-bold">What to Do When Cannibalization is Detected</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">The first step is establishing which page has more authority — check backlink counts, internal link counts, and historical ranking performance. The weaker page should either be merged into the dominant page (with a 301 redirect), given a clearly distinct subtopic and keyword focus, or canonicalized to the dominant page if the content is truly duplicative. Consolidation consistently produces ranking lifts for the surviving page within 4 to 8 weeks as Google processes the structural change.</p>
                        <p className="text-[var(--text-muted)] leading-relaxed">After resolving cannibalization, use our <Link href="/tools/thin-content-detector" className="text-[var(--primary)] hover:underline font-medium">Free Thin Content Detector</Link> to verify the surviving page meets content quality thresholds, and our <Link href="/tools/internal-link-audit" className="text-[var(--primary)] hover:underline font-medium">Free Internal Link Audit</Link> to redistribute internal link equity appropriately.</p>
                    </div>
                </section>
                <section className="px-6 py-10 max-w-5xl mx-auto">
                    <h3 className="text-lg font-bold mb-4">Free Content & On-Page SEO Tools</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: "Free Thin Content Detector", href: "/tools/thin-content-detector", desc: "Score content quality per URL" },
                            { name: "Free Internal Link Audit Tool", href: "/tools/internal-link-audit", desc: "Redistribute link equity post-consolidation" },
                            { name: "Free Heading Structure Analyzer", href: "/tools/heading-structure", desc: "Differentiate H1 signals between pages" },
                        ].map(t => (
                            <Link key={t.href} href={t.href} className="group block p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--primary)] hover:shadow-md transition-all">
                                <p className="font-semibold text-sm group-hover:text-[var(--primary)] transition-colors mb-1">{t.name}</p>
                                <p className="text-xs text-[var(--text-muted)]">{t.desc}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
