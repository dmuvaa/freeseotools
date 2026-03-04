import { Metadata } from "next";
import Link from "next/link";
import IndexabilityCheckerClient from "./client";

export const metadata: Metadata = {
    title: "Free Bulk Indexability Checker | Check 50 URLs for SEO Indexing",
    description: "Free Bulk Indexability Checker: Check up to 50 URLs at once for noindex tags, canonical conflicts, robots.txt blocks, redirects, and HTTP status — instantly.",
};

export default function IndexabilityCheckerPage() {
    return (
        <>
            <IndexabilityCheckerClient />
            <div className="border-t border-[var(--border)] mt-4">
                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free Bulk Indexability Checker</h2>
                        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">Check 50 URLs simultaneously across six indexability signals — HTTP status, canonical target, noindex meta tags, X-Robots-Tag headers, robots.txt blocks, and redirect status. Stop finding out pages are unindexed from Google Search Console weeks after the fact.</p>
                    </div>
                </section>
                <section className="px-6 py-12 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-8">Free Indexability Checks Explained</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                            { icon: "📡", title: "HTTP Status Code", desc: "A page must return HTTP 200 OK to be indexable. 301 redirects pass equity but are not themselves indexed at the target URL. 404 and 410 pages are explicitly excluded from Google's index." },
                            { icon: "🔗", title: "Canonical Conflicts", desc: "A canonical tag pointing to a different URL tells Google to index the canonical target instead. We detect mismatches between the page's self-referential canonical and its actual URL — a common cause of duplicate content dilution." },
                            { icon: "🚫", title: "Noindex Tag Detection", desc: "Both meta robots tags (noindex) and X-Robots-Tag HTTP headers are checked. Either one is sufficient to remove a page from Google's index. We check both sources simultaneously per URL." },
                            { icon: "🤖", title: "Robots.txt Verification", desc: "A page blocked by robots.txt may still appear in the index if other sites link to it, but Googlebot cannot access its content. We cross-reference each URL's path against the domain's robots.txt rules." },
                            { icon: "↪️", title: "Redirect Detection", desc: "We follow redirects to the final destination and flag any URL that doesn't resolve to its own canonical address — exposing redirect chains that split indexing signals across multiple URLs." },
                            { icon: "✅", title: "Final Indexable Verdict", desc: "Our tool combines all six signals into a definitive Yes/No indexability verdict per URL — no guesswork, no ambiguity." },
                        ].map(c => (
                            <div key={c.title} className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5 flex gap-3">
                                <div className="text-2xl shrink-0">{c.icon}</div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">{c.title}</h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{c.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="bg-[var(--surface-1)] px-6 py-10 max-w-5xl mx-auto">
                    <h3 className="text-lg font-bold mb-4">Free Indexing & Crawl Tools</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: "Free Crawl Budget Simulator", href: "/tools/crawl-budget-simulator", desc: "Analyze crawl priority and waste" },
                            { name: "Free Robots.txt Tester", href: "/tools/robots-txt-tester", desc: "Validate all crawler directives" },
                            { name: "Free HTTP Headers Checker", href: "/tools/http-headers-checker", desc: "Inspect X-Robots-Tag and caching headers" },
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
