import { Metadata } from "next";
import LighthouseClient from "@/components/LighthouseClient";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Free Core Web Vitals Lighthouse Test | LCP, CLS & INP Audit",
    description: "Free Core Web Vitals Lighthouse Test: Measure LCP, CLS, and INP for any page using Google Lighthouse. Get actionable fixes to pass Google's Core Web Vitals thresholds.",
};

export default function CwvLighthousePage() {
    return (
        <>
            <LighthouseClient config={{ title: "Free Core Web Vitals Lighthouse Test", strategy: "mobile", categories: ["performance"], accentColor: "#10b981", description: "Run a focused Google Lighthouse Performance audit to measure Largest Contentful Paint, Cumulative Layout Shift, Interaction to Next Paint, and other Core Web Vitals." }} />
            <div className="border-t border-[var(--border)] mt-4">
                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free Core Web Vitals Lighthouse Test</h2>
                        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">LCP, CLS, and INP are Google's three primary page experience ranking signals. Our free Lighthouse test measures all three against Google's published thresholds and tells you exactly what to fix.</p>
                    </div>
                </section>
                <section className="px-6 py-12 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-8">Free Core Web Vitals Threshold Guide</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { metric: "LCP", name: "Largest Contentful Paint", good: "≤ 2.5s", ni: "2.5s – 4.0s", poor: "> 4.0s", color: "blue", desc: "Measures how long it takes for the largest visible content element (image, video, or text block) to fully render." },
                            { metric: "CLS", name: "Cumulative Layout Shift", good: "≤ 0.1", ni: "0.1 – 0.25", poor: "> 0.25", color: "purple", desc: "Measures visual stability — how much page elements unexpectedly move during load. Caused by images without dimensions, ad slots, and dynamic injections." },
                            { metric: "INP", name: "Interaction to Next Paint", good: "≤ 200ms", ni: "200ms – 500ms", poor: "> 500ms", color: "green", desc: "Measures the responsiveness of your page to user interactions — how quickly the page visually responds after clicks, taps, and keyboard input." },
                        ].map(m => (
                            <div key={m.metric} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                                <div className="p-5 border-b border-[var(--border)]">
                                    <div className="font-extrabold text-2xl font-mono mb-1">{m.metric}</div>
                                    <div className="text-sm font-semibold">{m.name}</div>
                                    <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">{m.desc}</p>
                                </div>
                                <div className="grid grid-cols-3 divide-x divide-[var(--border)]">
                                    {[["Good", m.good, "text-green-600 bg-green-500/5"], ["Needs Improvement", m.ni, "text-yellow-700 bg-yellow-500/5"], ["Poor", m.poor, "text-red-600 bg-red-500/5"]].map(([l, v, c]) => (
                                        <div key={l} className={`p-3 text-center ${c}`}>
                                            <div className="text-xs font-semibold">{l}</div>
                                            <div className="text-xs font-mono mt-1">{v}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="bg-[var(--surface-1)] px-6 py-10 max-w-5xl mx-auto">
                    <h3 className="text-lg font-bold mb-4">Free CWV Optimization Tools</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: "Free Core Web Vitals Comparator", href: "/tools/core-web-vitals", desc: "Compare two pages side-by-side" },
                            { name: "Free Mobile Lighthouse Test", href: "/tools/lighthouse-mobile", desc: "Full 4-category mobile audit" },
                            { name: "Free JS Rendering Lighthouse", href: "/tools/lighthouse-js-rendering", desc: "Detect render-blocking scripts" },
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
