import { Metadata } from "next";
import LighthouseClient from "@/components/LighthouseClient";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Free Mobile Lighthouse Test | Google Lighthouse Mobile Audit",
    description: "Free Mobile Lighthouse Test: Run Google Lighthouse with mobile simulation. Analyze performance, SEO, accessibility, and best practices scores as Google sees your site on mobile.",
};

export default function MobileLighthousePage() {
    return (
        <>
            <LighthouseClient config={{ title: "Free Mobile Lighthouse Test", strategy: "mobile", categories: ["performance", "seo", "accessibility", "best-practices"], accentColor: "#8b5cf6", description: "Audit any URL using Google Lighthouse's mobile simulation — 4x CPU throttling, slow 4G network, and 375px viewport. This is the score that influences Google search rankings." }} />
            <div className="border-t border-[var(--border)] mt-4">
                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-violet-500/10 text-violet-500 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free Mobile Lighthouse Test</h2>
                        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">Google uses mobile-first indexing, meaning your mobile Lighthouse score directly impacts your search rankings. Our free tool runs the exact same audit Google uses, simulating a mid-range Android device on a slow 4G connection.</p>
                    </div>
                </section>
                <section className="px-6 py-12 max-w-4xl mx-auto space-y-8">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Why Mobile Scores Are Lower Than Desktop</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Mobile Lighthouse applies 4x CPU throttling and simulates a slow 4G network (150ms RTT, 1.6 Mbps throughput). The viewport is 375x812 pixels with 3x device pixel ratio. This produces substantially lower Performance scores than desktop — a page scoring 95 on desktop may score 55 on mobile. Google ranks your site based on this mobile score, so closing that gap is often the highest-ROI performance optimization you can make.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-xl font-bold mb-2">What the Mobile Score Measures</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">The Performance score is a weighted blend of six metrics: First Contentful Paint (10%), Speed Index (10%), Largest Contentful Paint (25%), Total Blocking Time (30%), Cumulative Layout Shift (15%), and Interaction to Next Paint (10%). LCP and TBT are weighted heaviest because they most directly reflect what users experience. A score of 90+ is considered good; below 50 indicates significant performance issues that are likely hurting your rankings and conversion rates.</p>
                    </div>
                </section>
                <section className="bg-[var(--surface-1)] px-6 py-10 max-w-5xl mx-auto">
                    <h3 className="text-lg font-bold mb-4">Complete Your Free Lighthouse Testing Suite</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: "Free Desktop Lighthouse Test", href: "/tools/lighthouse-desktop", desc: "Compare your mobile vs desktop performance gap" },
                            { name: "Free Core Web Vitals Audit", href: "/tools/lighthouse-cwv", desc: "Deep-dive into LCP, CLS, and INP metrics" },
                            { name: "Free SEO Lighthouse Audit", href: "/tools/lighthouse-seo", desc: "Check mobile SEO signals and metadata" },
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
