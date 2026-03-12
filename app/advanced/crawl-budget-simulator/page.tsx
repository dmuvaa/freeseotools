import { Metadata } from "next";
import Link from "next/link";
import CrawlBudgetClient from "./client";

export const metadata: Metadata = {
    title: "Free Crawl Budget Simulator | Estimate Google Crawl Efficiency",
    description: "Free Crawl Budget Simulator: Estimate how search engines allocate crawl resources across your website. Detect crawl traps, blocked key pages, and wasted crawl paths.",
};

export default function CrawlBudgetPage() {
    return (
        <>
            <CrawlBudgetClient />
            <div className="border-t border-[var(--border)] mt-4">
                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-600 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free Crawl Budget Simulator</h2>
                        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">See how efficiently search engines crawl your website and reclaim budget wasted on thin, duplicate, and parameterized URLs so Googlebot can discover more of your valuable content.</p>
                    </div>
                </section>
                <section className="px-6 py-12 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-8">What Eats Your Free Crawl Budget</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: "🔄", title: "Parameterized URLs", color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/20", desc: "Filtered product pages, sorted results, and session ID parameters create thousands of near-identical URLs that Googlebot explores individually, consuming enormous crawl budget while adding zero indexing value." },
                            { icon: "🚫", title: "Blocked Important Pages", color: "from-red-500/20 to-orange-500/10 border-red-500/20", desc: "Overly aggressive robots.txt rules frequently block revenue-generating category pages, product pages, or blog posts that were meant to be indexed. Our simulator cross-references robots.txt rules against your sitemap URLs to expose this conflict." },
                            { icon: "♻️", title: "Redirect Chains", color: "from-yellow-500/20 to-amber-500/10 border-yellow-500/20", desc: "Each redirect hop forces Googlebot to make an additional HTTP request. Multi-hop chains for http to https to www to canonical URL can reduce the effective crawl rate of your important pages by 50 to 70 percent." },
                        ].map(f => (
                            <div key={f.title} className={`rounded-2xl border bg-gradient-to-br ${f.color} p-6`}>
                                <div className="text-4xl mb-3">{f.icon}</div>
                                <h4 className="font-bold text-lg mb-2">{f.title}</h4>
                                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="bg-[var(--surface-1)] px-6 py-12">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <h3 className="text-2xl font-bold">How Google Allocates Crawl Budget</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Crawl budget is determined by two factors: crawl rate limit (how fast Googlebot can crawl your site without overloading your server) and crawl demand (how many URLs Google wants to crawl based on popularity and freshness signals). Large sites — ecommerce stores, news sites, aggregators — routinely have more URLs than Google will crawl in a reasonable timeframe. Optimizing crawl budget means ensuring that every URL Googlebot visits is one worth indexing.</p>
                        <p className="text-[var(--text-muted)] leading-relaxed">After identifying crawl waste with this free simulator, use our <Link href="/tools/robots-txt-tester" className="text-[var(--primary)] hover:underline font-medium">Free Robots.txt Tester</Link> to verify that your Disallow rules are correctly implemented and not inadvertently blocking critical pages.</p>
                    </div>
                </section>
                <section className="px-6 py-10 max-w-5xl mx-auto">
                    <h3 className="text-lg font-bold mb-4">Free Crawlability Tools</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: "Free Robots.txt Tester", href: "/tools/robots-txt-tester", desc: "Validate crawler access rules" },
                            { name: "Free Internal Link Audit Tool", href: "/tools/internal-link-audit", desc: "Discover orphan pages and click depth" },
                            { name: "Free Sitemap Analyzer", href: "/tools/sitemap-analyzer", desc: "Validate XML sitemap URL health" },
                        ].map(t => (
                            <Link key={t.href} href={t.href} className="group block p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--primary)] hover:shadow-md transition-all">
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
