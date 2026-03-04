import { Metadata } from "next";
import Link from "next/link";
import CwvCompareClient from "./client";

export const metadata: Metadata = {
    title: "Free Core Web Vitals Comparator | Side-by-Side LCP, CLS & INP",
    description: "Free Core Web Vitals Comparator: Compare two pages side-by-side using Google Lighthouse data. Measure LCP, CLS, INP, and Performance Score on desktop and mobile.",
};

export default function CoreWebVitalsPage() {
    return (
        <>
            <CwvCompareClient />
            <div className="border-t border-[var(--border)] mt-4">
                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free Core Web Vitals Comparator</h2>
                        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">Compare two versions of a page — before and after an optimization, old vs new design, or your page vs a competitor's — across all Core Web Vitals metrics on both desktop and mobile simultaneously.</p>
                    </div>
                </section>
                <section className="px-6 py-12 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-8">How Core Web Vitals Influence Free Organic Rankings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: "🏎️", title: "LCP Below 2.5s = Rankings Edge", color: "from-green-500/20 to-emerald-500/10 border-green-500/20", desc: "Google's own Page Experience documentation confirms that pages passing Core Web Vitals thresholds may receive a rankings boost in closely contested queries. LCP is the most impactful of the three metrics." },
                            { icon: "📐", title: "CLS Below 0.1 = Trust Signal", color: "from-blue-500/20 to-indigo-500/10 border-blue-500/20", desc: "Layout instability — buttons moving after ads load, text jumping around images — drives bounce rates. Google measures CLS at the 75th percentile of real user sessions via Chrome User Experience Report data." },
                            { icon: "⚡", title: "INP Below 200ms = Engagement", color: "from-purple-500/20 to-violet-500/10 border-purple-500/20", desc: "INP replaced FID in 2024 as the responsiveness metric. It measures the worst interaction delay across the full page visit. Heavy JavaScript event handlers are the primary cause of INP failures." },
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
                        <h3 className="text-2xl font-bold">Using the Comparator for Competitive Intelligence</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Enter your page as URL A and a direct competitor as URL B. The side-by-side scores immediately reveal whether your competitor's rankings advantage partly comes from a technical performance edge. If they score a 94 on mobile and you score a 57, that gap is a direct ranking factor difference — one that can be closed with targeted optimization rather than more content or link building. Pair the findings with our <Link href="/tools/lighthouse-js-rendering" className="text-[var(--primary)] hover:underline font-medium">Free JavaScript Rendering Lighthouse Test</Link> to identify which scripts are causing the performance gap.</p>
                    </div>
                </section>
                <section className="px-6 py-10 max-w-5xl mx-auto">
                    <h3 className="text-lg font-bold mb-4">Free Performance Optimization Tools</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: "Free Core Web Vitals Lighthouse", href: "/tools/lighthouse-cwv", desc: "Focused LCP, CLS & INP scores" },
                            { name: "Free JS Rendering Lighthouse", href: "/tools/lighthouse-js-rendering", desc: "Detect render-blocking scripts" },
                            { name: "Free Mobile Lighthouse Test", href: "/tools/lighthouse-mobile", desc: "Full 4-category mobile audit" },
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
