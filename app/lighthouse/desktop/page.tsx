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
            <div className="bg-[var(--background)]">
                {/* Hero-like Value Proposition Section */}
                <section className="px-6 py-20 bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] border-t border-[var(--border)] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-sky-500 opacity-[0.02] -skew-x-12 translate-x-1/4 pointer-events-none"></div>
                    <div className="mx-auto max-w-5xl relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div>
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 text-[10px] font-black uppercase tracking-widest mb-6">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                                    High-Performance Audit
                                </span>
                                <h2 className="text-4xl md:text-5xl font-black mb-6 leading-[1.1] tracking-tight text-[var(--foreground)]">
                                    Speed for the <span className="text-sky-600">Enterprise</span> Audience
                                </h2>
                                <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-8 font-medium">
                                    Desktop experience impacts conversion rates for professionals, SaaS users, and high-value buyers. Benchmark your site using uncapped speeds and high-resolution rendering simulation.
                                </p>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0 mt-1">
                                            <span className="text-sky-600 font-bold text-xs">01</span>
                                        </div>
                                        <p className="text-sm font-semibold">Run uncapped performance audits to measure raw server and asset speeds.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0 mt-1">
                                            <span className="text-sky-600 font-bold text-xs">02</span>
                                        </div>
                                        <p className="text-sm font-semibold">Audit security headers and modern standard compliance for desktop browsers.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0 mt-1">
                                            <span className="text-sky-600 font-bold text-xs">03</span>
                                        </div>
                                        <p className="text-sm font-semibold">Benchmark multi-category scores (Perf, SEO, Acc, Best Practices) in 30s.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-3xl mb-3">💻</div>
                                    <h4 className="font-bold mb-2">Desktop View</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">Test on a full 1350x940px viewport to catch layout issues that only appear on large screens.</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow mt-4">
                                    <div className="text-3xl mb-3">🛡️</div>
                                    <h4 className="font-bold mb-2">Security</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">Ensure HTTPS, CSP, and modern API usage meet the strict security bars of modern desktop browsers.</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow -mt-4">
                                    <div className="text-3xl mb-3">🚀</div>
                                    <h4 className="font-bold mb-2">Uncapped</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">Discover your 'Theoretical Best' performance without the artificial constraints of mobile networks.</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-3xl mb-3">💼</div>
                                    <h4 className="font-bold mb-2">UX Standard</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">Optimize for professional workflows where precision and responsiveness are the primary KPIs.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Technical Deep Dive */}
                <section className="px-6 py-20 max-w-5xl mx-auto border-t border-[var(--border)]">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl font-black mb-4">Enterprise-Grade Performance</h3>
                        <p className="text-[var(--text-muted)] max-w-2xl mx-auto">Desktop audits remove the 'safe' limits of mobile, pushing your server and infrastructure to reveal their true performance floor.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-600 flex items-center justify-center text-xs">1</span>
                                Uncapped I/O
                            </h4>
                            <p className="text-sm text-[var(--text-muted)] leading-relaxed">We test your <strong>Server Response Time (TTFB)</strong> and asset delivery without network bottlenecks. This highlights issues with your hosting provider, database, or backend logic.</p>
                            <div className="h-px bg-gradient-to-r from-[var(--border)] to-transparent"></div>
                            <p className="text-[10px] text-[var(--text-subtle)]">Measuring Raw Infrastructure Performance</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center text-xs">2</span>
                                Modern Standards
                            </h4>
                            <p className="text-sm text-[var(--text-muted)] leading-relaxed">Our <strong>Best Practices Audit</strong> scans for deprecated APIs, insecure libraries, and legacy patterns that slow down modern browsers and create technical debt.</p>
                            <div className="h-px bg-gradient-to-r from-[var(--border)] to-transparent"></div>
                            <p className="text-[10px] text-[var(--text-subtle)]">Checking Tech Stack Modernity & Security</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs">3</span>
                                Desktop Accuracy
                            </h4>
                            <p className="text-sm text-[var(--text-muted)] leading-relaxed">By benchmarking on a <strong>1350x940 Viewport</strong>, we ensure that complex dashboard layouts and high-res media are correctly optimized for professional monitors.</p>
                            <div className="h-px bg-gradient-to-r from-[var(--border)] to-transparent"></div>
                            <p className="text-[10px] text-[var(--text-subtle)]">Validating Full-Resolution UX Performance</p>
                        </div>
                    </div>
                </section>

                {/* Ecosystem Links */}
                <section className="bg-[var(--surface-1)] px-6 py-20 border-t border-[var(--border)]">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h3 className="text-2xl font-black mb-2">Complete the Performance Picture</h3>
                            <p className="text-sm text-[var(--text-muted)]">Don't ignore the mobile majority. Verify your benchmarks on all constraints.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { name: "Mobile Performance", href: "/tools/lighthouse-mobile", icon: "🚀", desc: "Test on 4G network and throttled CPU to satisfy Google's mobile-first ranking algorithms." },
                                { name: "SEO Lighthouse Audit", href: "/tools/lighthouse-seo", icon: "🔍", desc: "Audit your on-page metadata, crawlability, and indexing signals to grow organic traffic." },
                                { name: "Accessibility Audit", href: "/tools/lighthouse-accessibility", icon: "♿", desc: "Ensure your site is usable by everyone and meets professional WCAG compliance standards." },
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
