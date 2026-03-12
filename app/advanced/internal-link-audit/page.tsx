import { Metadata } from "next";
import Link from "next/link";
import InternalLinkAuditClient from "./client";

export const metadata: Metadata = {
    title: "Free Internal Link Audit Tool | Find Orphan Pages & Link Depth Issues",
    description: "Free Internal Link Audit Tool: Crawl your website to uncover orphan pages, excessive link depth, anchor text distribution, and crawl inefficiencies. Fix your site architecture for better SEO.",
};

export default function InternalLinkAuditPage() {
    return (
        <>
            <InternalLinkAuditClient />
            <div className="border-t border-[var(--border)] mt-4">
                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-600 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free Internal Link Audit Tool</h2>
                        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">Discover orphan pages, excessive click depth, and link distribution problems across your website — without a subscription, crawler license, or annual contract.</p>
                    </div>
                </section>
                <section className="px-6 py-12 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-8">What Our Free Internal Link Audit Finds</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: "🏝️", title: "Orphan Pages", color: "from-red-500/20 to-rose-500/10 border-red-500/20", desc: "Orphan pages receive zero internal links, making them completely invisible to search engine crawlers and to users navigating your site. Our crawler identifies every isolated page so you can build link pathways to them." },
                            { icon: "🔢", title: "Click Depth Analysis", color: "from-orange-500/20 to-amber-500/10 border-orange-500/20", desc: "Pages more than three clicks from your homepage receive significantly less PageRank and are deprioritized by Googlebot in crawl scheduling. We map every page's shortest path from your homepage." },
                            { icon: "⚖️", title: "Link Distribution", color: "from-blue-500/20 to-indigo-500/10 border-blue-500/20", desc: "Pages with 100+ outgoing links dilute link equity across too many destinations. Pages with fewer than 3 incoming links are ranking-disadvantaged. We surface both extremes so you can rebalance." },
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
                        <h3 className="text-2xl font-bold">Why Internal Linking is Your Most Underrated Free SEO Lever</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">You don't need new backlinks to move rankings. Internal links redistribute existing PageRank from your high-authority pages to your target pages. A strategic internal link from a page with 50 referring domains to a page you want to rank is worth more than most paid link placements. Our free audit gives you the data to make these decisions with precision: which pages have authority to give, and which pages are starving for it.</p>
                        <p className="text-[var(--text-muted)] leading-relaxed">Pair this audit with our <Link href="/tools/crawl-budget-simulator" className="text-[var(--primary)] hover:underline font-medium">Free Crawl Budget Simulator</Link> to prioritize which discovered orphan pages are worth rescuing versus consolidating.</p>
                    </div>
                </section>
                <section className="px-6 py-10 max-w-5xl mx-auto">
                    <h3 className="text-lg font-bold mb-4">Free Site Architecture Tools</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: "Free Crawl Budget Simulator", href: "/tools/crawl-budget-simulator", desc: "Identify wasted crawl paths" },
                            { name: "Free Sitemap Analyzer", href: "/tools/sitemap-analyzer", desc: "Audit your XML sitemap URLs" },
                            { name: "Free Broken Link Checker", href: "/tools/broken-link-checker", desc: "Find dead outbound links per page" },
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
