import { Metadata } from "next";
import LighthouseClient from "@/components/LighthouseClient";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Free Accessibility Lighthouse Audit | WCAG Compliance Checker",
    description: "Free Accessibility Lighthouse Audit: Run Google Lighthouse's accessibility audit to check WCAG compliance, alt text, ARIA labels, contrast ratios, and keyboard navigation.",
};

export default function AccessibilityLighthousePage() {
    return (
        <>
            <LighthouseClient config={{ title: "Free Accessibility Lighthouse Audit", strategy: "mobile", categories: ["accessibility"], accentColor: "#f59e0b", description: "Run Google Lighthouse's full accessibility audit to measure WCAG compliance across your webpage — including contrast ratios, ARIA labels, form inputs, and keyboard navigation." }} />
            <div className="border-t border-[var(--border)] mt-4">
            <div className="bg-[var(--background)]">
                {/* Hero-like Value Proposition Section */}
                <section className="px-6 py-20 bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] border-t border-[var(--border)] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-[var(--primary)] opacity-[0.02] -skew-x-12 translate-x-1/4 pointer-events-none"></div>
                    <div className="mx-auto max-w-5xl relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div>
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-6">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Professional Grade Tools
                                </span>
                                <h2 className="text-4xl md:text-5xl font-black mb-6 leading-[1.1] tracking-tight text-[var(--foreground)]">
                                    Is your website <span className="text-[var(--primary)]">truly</span> compliant?
                                </h2>
                                <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-8 font-medium">
                                    Accessibility isn't just a checkbox — it's a fundamental pillar of modern SEO and user experience. Google explicitly rewards sites that are usable by everyone, regardless of hardware, software, or ability.
                                </p>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center shrink-0 mt-1">
                                            <span className="text-[var(--primary)] font-bold text-xs">01</span>
                                        </div>
                                        <p className="text-sm font-semibold">Identify contrast ratio failures that burn eyes and bounce users.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center shrink-0 mt-1">
                                            <span className="text-[var(--primary)] font-bold text-xs">02</span>
                                        </div>
                                        <p className="text-sm font-semibold">Verify ARIA labels and semantic HTML for screen reader perfection.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center shrink-0 mt-1">
                                            <span className="text-[var(--primary)] font-bold text-xs">03</span>
                                        </div>
                                        <p className="text-sm font-semibold">Audit keyboard navigation and focus management automatically.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-3xl mb-3">⚡</div>
                                    <h4 className="font-bold mb-2">SEO Boost</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">Better accessibility markers (alt tags, headings) directly correlate with higher organic rankings.</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow mt-4">
                                    <div className="text-3xl mb-3">⚖️</div>
                                    <h4 className="font-bold mb-2">Compliance</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">Stay ahead of WCAG 2.1 Level AA requirements and avoid legal accessibility risks.</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow -mt-4">
                                    <div className="text-3xl mb-3">🤝</div>
                                    <h4 className="font-bold mb-2">Usability</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">Improve the experience for 15% of the global population with permanent or temporary impairments.</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-3xl mb-3">📱</div>
                                    <h4 className="font-bold mb-2">Retention</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">Accessible sites are easier to use for everyone, including mobile users and those in low-light environments.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Technical Deep Dive */}
                <section className="px-6 py-20 max-w-5xl mx-auto border-t border-[var(--border)]">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl font-black mb-4">Deep Technical Analysis</h3>
                        <p className="text-[var(--text-muted)] max-w-2xl mx-auto">Unlike basic tools, our Lighthouse engine runs full-browser emulation to test your site exactly how a user — or a screen reader — would see it.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs">1</span>
                                Visual Layout
                            </h4>
                            <p className="text-sm text-[var(--text-muted)] leading-relaxed">We scan for <strong>Color Contrast</strong> failures, ensuring text is readable against backgrounds. We also detect elements that may be too small to tap or interact with on mobile devices.</p>
                            <div className="h-px bg-gradient-to-r from-[var(--border)] to-transparent"></div>
                            <p className="text-[10px] text-[var(--text-subtle)]">Checking WCAG 1.4.3 Success Criterion</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center text-xs">2</span>
                                Semantic Integrity
                            </h4>
                            <p className="text-sm text-[var(--text-muted)] leading-relaxed">Our engine parses your <strong>DOM Structure</strong> to verify that headings are in order, landmarks are present, and lists are properly marked. This is crucial for Google's understanding of your page hierarchy.</p>
                            <div className="h-px bg-gradient-to-r from-[var(--border)] to-transparent"></div>
                            <p className="text-[10px] text-[var(--text-subtle)]">Checking ARIA Roles & Landmark Definitions</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center text-xs">3</span>
                                Interactive State
                            </h4>
                            <p className="text-sm text-[var(--text-muted)] leading-relaxed">We simulate <strong>Keyboard Navigation</strong> to ensure focus is never trapped and that all interactive elements are reachable without a mouse. This captures the essence of truly accessible web dev.</p>
                            <div className="h-px bg-gradient-to-r from-[var(--border)] to-transparent"></div>
                            <p className="text-[10px] text-[var(--text-subtle)]">Checking Focus Management & Tab Order</p>
                        </div>
                    </div>
                </section>

                {/* Ecosystem Links */}
                <section className="bg-[var(--surface-1)] px-6 py-20 border-t border-[var(--border)]">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h3 className="text-2xl font-black mb-2">The Complete Technical Suite</h3>
                            <p className="text-sm text-[var(--text-muted)]">Don't stop at accessibility. Build a faster, more optimized webPresence.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { name: "SEO Lighthouse Audit", href: "/tools/lighthouse-seo", icon: "🔍", desc: "Discover how Google's automated crawlers see your metadata, indexing, and crawlability." },
                                { name: "Performance Analysis", href: "/tools/lighthouse-mobile", icon: "🚀", desc: "Optimize your Core Web Vitals (LCP, CLS, INP) for lightning-fast mobile experiences." },
                                { name: "Best Practices Audit", href: "/tools/lighthouse-desktop", icon: "✅", desc: "Ensure your site uses HTTPS, avoids deprecated APIs, and follows modern web standards." },
                            ].map(t => (
                                <Link key={t.href} href={t.href} className="group p-8 rounded-[2rem] border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <span className="text-6xl grayscale group-hover:grayscale-0">{t.icon}</span>
                                    </div>
                                    <div className="text-2xl mb-4">{t.icon}</div>
                                    <h4 className="font-bold text-lg mb-2 group-hover:text-[var(--primary)] transition-colors">{t.name}</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-6">{t.desc}</p>
                                    <div className="inline-flex items-center gap-2 text-[var(--primary)] font-bold text-xs uppercase tracking-widest">
                                        Run Audit
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
