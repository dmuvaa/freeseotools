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
            <div className="bg-[var(--background)]">
                {/* Hero-like Value Proposition Section */}
                <section className="px-6 py-20 bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] border-t border-[var(--border)] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-violet-500 opacity-[0.02] -skew-x-12 translate-x-1/4 pointer-events-none"></div>
                    <div className="mx-auto max-w-5xl relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div>
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 text-[10px] font-black uppercase tracking-widest mb-6">
                                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
                                    Rank Performance Audit
                                </span>
                                <h2 className="text-4xl md:text-5xl font-black mb-6 leading-[1.1] tracking-tight text-[var(--foreground)]">
                                    Can Google <span className="text-violet-600">index</span> your content?
                                </h2>
                                <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-8 font-medium">
                                    Technical SEO is the foundation of organic growth. Even the best content will fail if search bots can't crawl, render, or understand your page structure. Our audit reveals exactly what Google sees.
                                </p>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-1">
                                            <span className="text-violet-600 font-bold text-xs">01</span>
                                        </div>
                                        <p className="text-sm font-semibold">Audit robots.txt and meta-tags to prevent accidental indexing blocks.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-1">
                                            <span className="text-violet-600 font-bold text-xs">02</span>
                                        </div>
                                        <p className="text-sm font-semibold">Verify semantic title tags and H1–H6 hierarchy for keyword relevance.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-1">
                                            <span className="text-violet-600 font-bold text-xs">03</span>
                                        </div>
                                        <p className="text-sm font-semibold">Identify mobile-friendliness issues like tiny fonts or tap target proximity.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-3xl mb-3">🤖</div>
                                    <h4 className="font-bold mb-2">Crawlability</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">Ensure bots aren't trapped in redirect loops or blocked by improper header tags.</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow mt-4">
                                    <div className="text-3xl mb-3">🏷️</div>
                                    <h4 className="font-bold mb-2">Metadata</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">Check for missing or duplicate meta descriptions that hurt your SERP click-through rates.</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow -mt-4">
                                    <div className="text-3xl mb-3">📱</div>
                                    <h4 className="font-bold mb-2">Mobile Signals</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">Validate viewport configuration and touch-target sizing for Google's mobile-first index.</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-3xl mb-3">📝</div>
                                    <h4 className="font-bold mb-2">Readability</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">Detect font sizes smaller than 12px which Google considers an 'unfriendly' mobile experience.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Technical Deep Dive */}
                <section className="px-6 py-20 max-w-5xl mx-auto border-t border-[var(--border)]">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl font-black mb-4">Search Engine Insight</h3>
                        <p className="text-[var(--text-muted)] max-w-2xl mx-auto">Our Lighthouse SEO engine parses your DOM exactly like Googlebot, providing a definitive score on your technical on-page health.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs">1</span>
                                Discovery
                            </h4>
                            <p className="text-sm text-[var(--text-muted)] leading-relaxed">We audit <strong>Robots Directives</strong> including metatags and X-Robots headers to ensure your high-priority pages aren't accidentally hidden from search engines.</p>
                            <div className="h-px bg-gradient-to-r from-[var(--border)] to-transparent"></div>
                            <p className="text-[10px] text-[var(--text-subtle)]">Indexing & Crawling Validation</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs">2</span>
                                Content Structure
                            </h4>
                            <p className="text-sm text-[var(--text-muted)] leading-relaxed">Our parser checks for <strong>Correct Tag Hierarchy</strong>. We ensure every page has a single H1 and that your links are descriptive (avoiding 'click here' traps).</p>
                            <div className="h-px bg-gradient-to-r from-[var(--border)] to-transparent"></div>
                            <p className="text-[10px] text-[var(--text-subtle)]">Semantic HTML & Link Architecture</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-violet-500/10 text-violet-600 flex items-center justify-center text-xs">3</span>
                                Rich Features
                            </h4>
                            <p className="text-sm text-[var(--text-muted)] leading-relaxed">We validate <strong>Structured Data</strong> (JSON-LD) and canonical URLs. These are the signals Google uses to award rich snippets and properly attribute your content.</p>
                            <div className="h-px bg-gradient-to-r from-[var(--border)] to-transparent"></div>
                            <p className="text-[10px] text-[var(--text-subtle)]">Advanced Technical SEO Signals</p>
                        </div>
                    </div>
                </section>

                {/* Ecosystem Links */}
                <section className="bg-[var(--surface-1)] px-6 py-20 border-t border-[var(--border)]">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h3 className="text-2xl font-black mb-2">Standardize Your Technical Stack</h3>
                            <p className="text-sm text-[var(--text-muted)]">SEO is just one pillar. Ensure your site is fast, secure, and accessible.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { name: "Accessibility Audit", href: "/tools/lighthouse-accessibility", icon: "♿", desc: "Ensure your site is usable by everyone and meets WCAG 2.1 Level AA compliance standards." },
                                { name: "Mobile Performance", href: "/tools/lighthouse-mobile", icon: "🚀", desc: "Master your Core Web Vitals on mobile networks to unlock higher organic search rankings." },
                                { name: "Best Practices Audit", href: "/tools/lighthouse-desktop", icon: "✅", desc: "Audit high-level security markers, HTTPS configuration, and modern web standard adherence." },
                            ].map(t => (
                                <Link key={t.href} href={t.href} className="group p-8 rounded-[2rem] border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <span className="text-6xl grayscale group-hover:grayscale-0">{t.icon}</span>
                                    </div>
                                    <div className="text-2xl mb-4">{t.icon}</div>
                                    <h4 className="font-bold text-lg mb-2 group-hover:text-[var(--primary)] transition-colors">{t.name}</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-6">{t.desc}</p>
                                    <div className="inline-flex items-center gap-2 text-[var(--primary)] font-bold text-xs uppercase tracking-widest">
                                        Open Tool
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
            </div>
        </>
    );
}
