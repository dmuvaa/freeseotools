import { Metadata } from "next";
import LighthouseClient from "@/components/LighthouseClient";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Free Performance Over Time Tracker | Track Lighthouse Score History",
    description: "Free Performance Over Time Tracker: Monitor how your Lighthouse Performance, SEO, and Accessibility scores change after deployments. Track improvement trends.",
};

export default function LighthouseTrackerPage() {
    return (
        <>
            <LighthouseClient config={{ title: "Free Performance Over Time Tracker", strategy: "mobile", categories: ["performance", "seo", "accessibility", "best-practices"], accentColor: "#ec4899", description: "Run a full Lighthouse audit and compare your current scores against previous results. Identify regressions after deployments and measure the impact of your optimizations." }} />
            <div className="border-t border-[var(--border)] mt-4">
                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-pink-500/10 text-pink-500 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free Performance Over Time Tracker</h2>
                        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">A single Lighthouse score is a snapshot. Performance tracking over time reveals trends: whether new features are causing regressions, whether optimizations are actually improving scores, and whether scores fluctuate between Google's infrastructure nodes. Our free tracker captures and stores your audit history so you can monitor improvement with data.</p>
                    </div>
                </section>
                <section className="px-6 py-12 max-w-4xl mx-auto space-y-6">
                    <h3 className="text-2xl font-bold mb-4">Why Single Lighthouse Runs Are Misleading</h3>
                    <p className="text-[var(--text-muted)] leading-relaxed">Lighthouse scores have an inherent variance of 5 to 15 points between consecutive runs on the same URL. Server response times, CDN cache hits, third-party script loading, and network routing all introduce variability. A single 67 score does not tell you whether you improved from 55 last week or regressed from 78 post-deployment. Only a time series of results reveals the true direction of your performance trajectory.</p>
                    <div className="h-px bg-[var(--border)]" />
                    <p className="text-[var(--text-muted)] leading-relaxed">Best practice is to run audits at consistent times — immediately post-deployment, then at weekly intervals. Our free tracker lets you run a fresh Lighthouse audit at any time and compare results across sessions. Track all four categories: Performance, SEO, Accessibility, and Best Practices. When a score drops unexpectedly after a deployment, you can immediately pinpoint whether it's a performance regression or a new accessibility violation. Pair with our <Link href="/tools/lighthouse-mobile" className="text-[var(--primary)] hover:underline font-medium">Free Mobile Lighthouse Test</Link> for baseline establishment.</p>
                </section>
                <section className="bg-[var(--surface-1)] px-6 py-10 max-w-5xl mx-auto">
                    <h3 className="text-lg font-bold mb-4">Full Free Lighthouse Testing Suite</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: "Free Mobile Lighthouse Test", href: "/tools/lighthouse-mobile", desc: "Full 4-category mobile audit" },
                            { name: "Free Desktop Lighthouse Test", href: "/tools/lighthouse-desktop", desc: "Desktop performance and compliance" },
                            { name: "Free Core Web Vitals Lighthouse", href: "/tools/lighthouse-cwv", desc: "Focused LCP, CLS & INP scores" },
                        ].map(t => (
                            <Link key={t.href} href={t.href} className="group block p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] hover:shadow-md transition-all">
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
