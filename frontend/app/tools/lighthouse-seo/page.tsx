import { Metadata } from "next";
import LighthouseClient from "@/components/LighthouseClient";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Free SEO Lighthouse Audit | Google Lighthouse SEO Score Tool",
    description: "Free SEO Lighthouse Audit: Run Google Lighthouse's SEO category on any URL. Check meta tags, mobile-friendliness, crawlability, structured data, and more.",
};

export default function SeoLighthousePage() {
    return (
        <>
            <LighthouseClient config={{ title: "Free SEO Lighthouse Audit", strategy: "mobile", categories: ["seo"], accentColor: "#8b5cf6", description: "Run Google Lighthouse's dedicated SEO audit on any URL. Check everything from document crawlability and meta tags to tap target sizing and font legibility — all scored and fixable." }} />
            <div className="border-t border-[var(--border)] mt-4">
                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-violet-500/10 text-violet-600 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free SEO Lighthouse Audit</h2>
                        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">Google Lighthouse's SEO category tests the technical on-page signals search engines need to crawl, understand, and rank your page. Our free tool runs this audit in under 30 seconds and surfaces every failing check with clear remediation guidance.</p>
                    </div>
                </section>
                <section className="px-6 py-12 max-w-4xl mx-auto space-y-8">
                    <h3 className="text-2xl font-bold text-center mb-6">What the Free SEO Lighthouse Audit Checks</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                            { icon: "📋", title: "Document Crawlability", desc: "Checks for robots meta tags, X-Robots-Tag headers, and whether the page is blocked by robots.txt — confirming Googlebot can actually access and process the URL." },
                            { icon: "📱", title: "Mobile SEO Signals", desc: "Verifies a viewport meta tag exists, font sizes are at least 12px for legibility, and tap targets (buttons, links) are at least 48x48px — critical for mobile-first indexing." },
                            { icon: "🔗", title: "Link Architecture", desc: "Checks that all links have descriptive anchor text (not just 'click here'), external links use rel=noopener, and href attributes contain valid URLs rather than JavaScript handlers." },
                            { icon: "📊", title: "Structured Data", desc: "Validates presence of JSON-LD or Microdata structured data and tests it for schema.org conformity — a prerequisite for rich results in Google Search." },
                        ].map(c => (
                            <div key={c.title} className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5 flex gap-4">
                                <div className="text-2xl shrink-0">{c.icon}</div>
                                <div>
                                    <h4 className="font-semibold mb-1">{c.title}</h4>
                                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">{c.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="bg-[var(--surface-1)] px-6 py-10 max-w-5xl mx-auto">
                    <h3 className="text-lg font-bold mb-4">Free On-Page SEO Tools</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: "Free Meta Tags Analyzer", href: "/tools/meta-tags-analyzer", desc: "Audit all on-page meta tags" },
                            { name: "Free Heading Structure Analyzer", href: "/tools/heading-structure", desc: "Check H1–H6 hierarchy" },
                            { name: "Free Mobile Lighthouse Test", href: "/tools/lighthouse-mobile", desc: "Full 4-category mobile audit" },
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
