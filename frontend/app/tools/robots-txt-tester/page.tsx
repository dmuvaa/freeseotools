import { Metadata } from "next";
import Link from "next/link";
import RobotsTxtTesterClient from "./client";

export const metadata: Metadata = {
    title: "Free Robots.txt Tester & Validator | Check Crawler Access Rules",
    description: "Free Robots.txt Tester: Instantly fetch, parse, and validate any domain's robots.txt file. Check user-agent rules, disallow paths, and sitemap declarations.",
};

const relatedTools = [
    { name: "Free Sitemap Analyzer", href: "/tools/sitemap-analyzer", desc: "Validate your XML sitemap URLs" },
    { name: "Free HTTP Headers Checker", href: "/tools/http-headers-checker", desc: "Inspect crawler-relevant server headers" },
    { name: "Free Redirect Checker", href: "/tools/redirect-checker", desc: "Trace redirect chains hurting indexation" },
];

export default function RobotsTxtTesterPage() {
    return (
        <>
            <RobotsTxtTesterClient />

            <div className="border-t border-[var(--border)] mt-4">

                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-orange-500/10 text-orange-500 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free Robots.txt Tester</h2>
                        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
                            One misconfigured line in your robots.txt can make your entire website invisible to Google overnight. Our free tester lets you validate crawler directives before that disaster happens.
                        </p>
                    </div>
                </section>

                <section className="px-6 py-14 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-10">Why Your Robots.txt File Matters So Much</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Your Gatekeeper to Google", color: "from-orange-500/20 to-red-500/10", border: "border-orange-500/20", icon: "🚪", body: "Robots.txt is the very first file Googlebot reads when it visits your site. A misplaced Disallow: / directive blocks crawling of every single page instantly, collapsing your organic traffic." },
                            { title: "Crawl Budget Optimization", color: "from-yellow-500/20 to-amber-500/10", border: "border-yellow-500/20", icon: "⚡", body: "Search engines allocate limited crawl budgets to each domain. By blocking admin pages, duplicate faceted URLs, and internal search results, you redirect all crawl resources to your money pages." },
                            { title: "Sitemap Discovery", color: "from-teal-500/20 to-emerald-500/10", border: "border-teal-500/20", icon: "🗺️", body: "A properly declared Sitemap: directive inside your robots.txt ensures every search engine discovers your sitemap automatically, accelerating the indexation of your newest content." },
                        ].map(f => (
                            <div key={f.title} className={`rounded-2xl border ${f.border} bg-gradient-to-br ${f.color} p-6 flex flex-col gap-3`}>
                                <div className="text-4xl">{f.icon}</div>
                                <h4 className="font-bold text-lg">{f.title}</h4>
                                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{f.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-[var(--surface-1)] px-6 py-14">
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-2xl font-bold mb-10 text-center">How the Free Robots.txt Tester Works</h3>
                        <ol className="space-y-6">
                            {[
                                { step: "1", title: "Enter Your Domain", body: "Simply type or paste any domain. Our tool automatically appends /robots.txt and makes a fresh server-side HTTP request, ensuring you always see the live file rather than a cached version." },
                                { step: "2", title: "Syntax-Highlighted Display", body: "The raw content is rendered with intuitive color coding. User-agent declarations appear in one color, Disallow rules in another, and Sitemap declarations highlighted separately for instant visual parsing." },
                                { step: "3", title: "Parsed Rules Breakdown", body: "We parse every directive and group it by User-agent. Allow, Disallow, and Crawl-delay rules are listed clearly so you can spot conflicting instructions without reading a wall of text." },
                                { step: "4", title: "Sitemap Extraction", body: "Any Sitemap: URLs declared in your robots.txt are surfaced as clickable links. Cross-reference them with our free Sitemap Analyzer to ensure they contain healthy, indexable URLs." },
                            ].map(s => (
                                <li key={s.step} className="flex gap-5 items-start">
                                    <div className="size-9 rounded-full bg-orange-500 text-white font-bold text-sm flex items-center justify-center shrink-0">{s.step}</div>
                                    <div>
                                        <h4 className="font-semibold text-base mb-1">{s.title}</h4>
                                        <p className="text-[var(--text-muted)] text-sm leading-relaxed">{s.body}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section className="px-6 py-14 max-w-4xl mx-auto space-y-10">
                    <div>
                        <h3 className="text-2xl font-bold mb-3">The Most Dangerous Robots.txt Mistake</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">The most catastrophic error in SEO history happens repeatedly during site migrations: deploying <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded text-xs font-mono">Disallow: /</code> to a production website while intending it only for staging. Within days, Googlebot stops crawling, indexed pages begin dropping out of search results, and organic traffic collapses. Regular testing with our free tool costs you nothing. Recovery costs you months of lost revenue.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-2xl font-bold mb-3">Understanding User-Agent Targeting</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Using a wildcard <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded text-xs font-mono">User-agent: *</code> applies your rules to every bot universally. Named agents like <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded text-xs font-mono">Googlebot</code> or <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded text-xs font-mono">Bingbot</code> allow granular, per-engine policies. This is useful when you want to block aggressive scrapers without restricting Googlebot's access to revenue-driving content pages.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-2xl font-bold mb-3">Common Paths to Block for Crawl Budget</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">On most websites, the following paths should be disallowed: <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded text-xs font-mono">/wp-admin/</code>, <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded text-xs font-mono">/cart</code>, <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded text-xs font-mono">/checkout</code>, parameter-driven sort/filter URLs like <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded text-xs font-mono">/?sort=price</code>, and internal search results. Blocking these ensures Googlebot's entire budget is focused on indexing product pages, blog posts, and landing pages that drive revenue.</p>
                    </div>
                </section>

                <section className="bg-[var(--surface-1)] px-6 py-12">
                    <div className="max-w-5xl mx-auto">
                        <h3 className="text-xl font-bold mb-6">Complete Your Technical SEO Audit</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {relatedTools.map(t => (
                                <Link key={t.href} href={t.href} className="group block p-5 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] hover:shadow-md transition-all duration-200">
                                    <p className="font-semibold group-hover:text-[var(--primary)] transition-colors text-sm mb-1">{t.name}</p>
                                    <p className="text-xs text-[var(--text-muted)]">{t.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

            </div>
        </>
    );
}
