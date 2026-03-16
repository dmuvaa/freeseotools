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
            <div className="bg-[var(--background)]">
                {/* Hero-like Value Proposition Section */}
                <section className="px-6 py-20 bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] border-t border-[var(--border)] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-violet-600 opacity-[0.02] -skew-x-12 translate-x-1/4 pointer-events-none"></div>
                    <div className="mx-auto max-w-5xl relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div>
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 text-[10px] font-black uppercase tracking-widest mb-6">
                                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
                                    Performance Benchmark
                                </span>
                                <h2 className="text-4xl md:text-5xl font-black mb-6 leading-[1.1] tracking-tight text-[var(--foreground)]">
                                    Are you optimized for <span className="text-violet-600">mobile</span>-first?
                                </h2>
                                <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-8 font-medium">
                                    Google ranks your site according to the mobile experience. If your site is slow on a 4G connection or throttled CPU, your rankings will suffer. Benchmark your site using standard mobile simulation.
                                </p>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-1">
                                            <span className="text-violet-600 font-bold text-xs">01</span>
                                        </div>
                                        <p className="text-sm font-semibold">Simulate 4x CPU throttling to identify execution-heavy JavaScript.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-1">
                                            <span className="text-violet-600 font-bold text-xs">02</span>
                                        </div>
                                        <p className="text-sm font-semibold">Test on a simulated slow 4G network to measure true loading times.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-1">
                                            <span className="text-violet-600 font-bold text-xs">03</span>
                                        </div>
                                        <p className="text-sm font-semibold">Validate Core Web Vitals (LCP, INP, CLS) for mobile ranking eligibility.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-3xl mb-3">⚡</div>
                                    <h4 className="font-bold mb-2">LCP</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">Ensure your largest content paints within 2.5 seconds to pass the ranking threshold.</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow mt-4">
                                    <div className="text-3xl mb-3">🎨</div>
                                    <h4 className="font-bold mb-2">CLS</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">Fix layout shifts that cause users to mis-click and hurt your UX metrics.</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow -mt-4">
                                    <div className="text-3xl mb-3">🖱️</div>
                                    <h4 className="font-bold mb-2">INP</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">Optimize responsiveness to user interactions, now a primary Google ranking factor.</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-3xl mb-3">📉</div>
                                    <h4 className="font-bold mb-2">Throttling</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">Test on a mid-range phone simulation to see what the average user actually experiences.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Technical Deep Dive */}
                <section className="px-6 py-20 max-w-5xl mx-auto border-t border-[var(--border)]">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl font-black mb-4">Mobile Device Simulation</h3>
                        <p className="text-[var(--text-muted)] max-w-2xl mx-auto">We use Lighthouse's standard mobile config: 375px viewport, 1.6 Mbps throughput, and 150ms round-trip time.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center text-xs">1</span>
                                Network Latency
                            </h4>
                            <p className="text-sm text-[var(--text-muted)] leading-relaxed">We simulate a <strong>Slow 4G Network</strong> to reveal how heavy assets like high-res images and unoptimized scripts delay the time-to-first-meaningful-paint.</p>
                            <div className="h-px bg-gradient-to-r from-[var(--border)] to-transparent"></div>
                            <p className="text-[10px] text-[var(--text-subtle)]">Simulating 150ms RTT & 1.6Mbps Bandwidth</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs">2</span>
                                CPU Throttling
                            </h4>
                            <p className="text-sm text-[var(--text-muted)] leading-relaxed">Mobile devices have significantly less processing power than desktops. We apply <strong>4x CPU Throttling</strong> to identify JavaScript that locks the main thread and freezes the page.</p>
                            <div className="h-px bg-gradient-to-r from-[var(--border)] to-transparent"></div>
                            <p className="text-[10px] text-[var(--text-subtle)]">Simulating a Mid-Range Android Device</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xs">3</span>
                                Viewport Dynamics
                            </h4>
                            <p className="text-sm text-[var(--text-muted)] leading-relaxed">Testing on a <strong>375x812px Viewport</strong> ensures that we capture layout shifts and tap target issues exactly as they would appear on a standard modern smartphone.</p>
                            <div className="h-px bg-gradient-to-r from-[var(--border)] to-transparent"></div>
                            <p className="text-[10px] text-[var(--text-subtle)]">Simulating Mobile-First Rendering</p>
                        </div>
                    </div>
                </section>

                {/* Ecosystem Links */}
                <section className="bg-[var(--surface-1)] px-6 py-20 border-t border-[var(--border)]">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h3 className="text-2xl font-black mb-2">Expand Your Performance Audit</h3>
                            <p className="text-sm text-[var(--text-muted)]">Don't settle for mobile-only. Verify benchmarks across all device categories.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { name: "Desktop Performance", href: "/tools/lighthouse-desktop", icon: "💻", desc: "Compare your mobile scores against uncapped desktop benchmarks for a complete picture." },
                                { name: "SEO Lighthouse Audit", href: "/tools/lighthouse-seo", icon: "🔍", desc: "Audit your technical SEO signals, crawlability, and on-page metadata optimization." },
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
