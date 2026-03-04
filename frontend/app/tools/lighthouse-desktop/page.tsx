import { Metadata } from "next";
import LighthouseClient from "@/components/LighthouseClient";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Free Desktop Lighthouse Test | Google Lighthouse Desktop Audit",
    description: "Free Desktop Lighthouse Test: Run Google Lighthouse with desktop simulation. Compare performance, SEO, accessibility, and best practices scores against your mobile baseline.",
};

export default function DesktopLighthousePage() {
    return (
        <>
            <LighthouseClient config={{ title: "Free Desktop Lighthouse Test", strategy: "desktop", categories: ["performance", "seo", "accessibility", "best-practices"], accentColor: "#0ea5e9", description: "Audit any URL using Google Lighthouse's desktop simulation — faster CPU, uncapped bandwidth, and full-viewport rendering. Compare against mobile for a complete picture." }} />
            <div className="border-t border-[var(--border)] mt-4">
                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-500 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free Desktop Lighthouse Test</h2>
                        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">Desktop performance matters for B2B audiences, SaaS landing pages, and dashboard applications where most users are on broadband computers. Our free tool runs the exact Lighthouse audit Google uses, returning all four category scores in under 30 seconds.</p>
                    </div>
                </section>
                <section className="px-6 py-12 max-w-4xl mx-auto space-y-8">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Desktop vs Mobile: The Key Technical Differences</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Desktop Lighthouse removes CPU throttling entirely (1x speed) and applies no network throttling. The viewport is set to 1350x940 pixels. This produces notably higher Performance scores than mobile — a 95 on desktop versus a 61 on mobile for the same URL is common. Understanding both scores is essential for complete optimization, as Google uses the mobile score for ranking but your desktop experience influences conversion rates for high-value audiences.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-xl font-bold mb-2">Best Practices and Security Scoring</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">The Best Practices category is identical between desktop and mobile runs. Google checks whether your site uses HTTPS, has no browser console errors, avoids deprecated APIs (like document.write), uses secure XHR patterns, and properly handles permissions requests. A score below 90 here typically signals technical debt that compromises user trust and could influence how browsers handle or restrict your page.</p>
                    </div>
                </section>
                <section className="bg-[var(--surface-1)] px-6 py-10 max-w-5xl mx-auto">
                    <h3 className="text-lg font-bold mb-4">Complete Your Free Lighthouse Testing Suite</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: "Free Mobile Lighthouse Test", href: "/tools/lighthouse-mobile", desc: "The score that influences Google rankings" },
                            { name: "Free Accessibility Lighthouse Audit", href: "/tools/lighthouse-accessibility", desc: "WCAG compliance and screen reader support" },
                            { name: "Free Core Web Vitals Comparator", href: "/tools/core-web-vitals", desc: "Compare two pages side-by-side" },
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
