import { Metadata } from "next";
import Link from "next/link";
import RedirectCheckerClient from "./client";

export const metadata: Metadata = {
    title: "Free Redirect Checker | Trace Redirect Chains & Fix 301 Loops",
    description: "Free Redirect Checker: Trace complete redirect chains step-by-step, expose infinite loops, capture HTTP status codes, and protect your SEO link equity.",
};

const relatedTools = [
    { name: "Free HTTP Headers Checker", href: "/tools/http-headers-checker", desc: "Inspect the full server response headers" },
    { name: "Free Sitemap Analyzer", href: "/tools/sitemap-analyzer", desc: "Find redirect chains inside your sitemap" },
    { name: "Free Broken Link Checker", href: "/tools/broken-link-checker", desc: "Scan pages for dead outbound links" },
];

export default function RedirectCheckerPage() {
    return (
        <>
            <RedirectCheckerClient />

            <div className="border-t border-[var(--border)] mt-4">

                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/10 text-yellow-600 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free Redirect Checker</h2>
                        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
                            Every extra hop in a redirect chain leaks link equity and adds latency. Our free tool traces the exact path a URL takes — step by step — so you can collapse chains and recover lost ranking power.
                        </p>
                    </div>
                </section>

                {/* Redirect type card grid */}
                <section className="px-6 py-14 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-10">Know Your Redirects: 301 vs 302 vs 307</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { code: "301", label: "Moved Permanently", color: "from-green-500/20 to-emerald-500/10", border: "border-green-500/30", badge: "bg-green-500/20 text-green-600", body: "The gold standard for SEO. Passes up to 99% of link equity to the new destination. Use this for all permanent URL changes and site migrations." },
                            { code: "302", label: "Moved Temporarily", color: "from-yellow-500/20 to-amber-500/10", border: "border-yellow-500/30", badge: "bg-yellow-500/20 text-yellow-700", body: "Intended for short-term redirects only. Search engines will not transfer ranking power until the redirect becomes permanent — a costly common mistake." },
                            { code: "307", label: "Temporary Redirect", color: "from-blue-500/20 to-indigo-500/10", border: "border-blue-500/30", badge: "bg-blue-500/20 text-blue-600", body: "The HTTP/1.1 equivalent of 302. The request method (POST, GET) is strictly preserved. Use 308 when you need a permanent version of this behavior." },
                        ].map(r => (
                            <div key={r.code} className={`rounded-2xl border ${r.border} bg-gradient-to-br ${r.color} p-6`}>
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold mb-3 ${r.badge}`}>HTTP {r.code}</span>
                                <h4 className="font-bold text-lg mb-2">{r.label}</h4>
                                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{r.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-[var(--surface-1)] px-6 py-14">
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-2xl font-bold mb-10 text-center">How the Free Redirect Checker Works</h3>
                        <ol className="space-y-6">
                            {[
                                { step: "1", title: "Enter the Starting URL", body: "Paste any URL — a legacy page, a deleted product, or a suspicious old blog post. Our system makes a clean server-side HTTP request with redirect-following disabled so every hop is captured individually." },
                                { step: "2", title: "Hop-by-Hop Chain Mapping", body: "At each step, we record the HTTP status code returned, the Location header value (the next destination), and the response time in milliseconds. This full trace is what browsers hide from you." },
                                { step: "3", title: "Redirect Loop Detection", body: "Our engine tracks every visited URL and immediately flags when a URL appears twice in the chain — the telltale sign of an infinite redirect loop that returns ERR_TOO_MANY_REDIRECTS to real users." },
                                { step: "4", title: "Visual Chain Diagram", body: "Results are rendered as a clean step-by-step visual flow: start URL → intermediate hops → final destination. Timing at each hop helps identify where latency is being introduced." },
                            ].map(s => (
                                <li key={s.step} className="flex gap-5 items-start">
                                    <div className="size-9 rounded-full bg-yellow-500 text-white font-bold text-sm flex items-center justify-center shrink-0">{s.step}</div>
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
                        <h3 className="text-2xl font-bold mb-3">Why Long Redirect Chains Destroy Rankings</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Googlebot follows a maximum of five consecutive redirects before abandoning the crawl. If your URL requires six hops to resolve, Googlebot never reaches the final page, which is then never indexed. Additionally, each hop causes a small but measurable dilution of PageRank. A URL pointing to your homepage via a three-hop chain delivers meaningfully less authority than a direct 1-to-1 redirect.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-2xl font-bold mb-3">The Right Way to Migrate a Website</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">During a site migration, implement 1-to-1 mappings: every old URL should redirect directly to its exact new counterpart. Avoid bulk redirecting thousands of old URLs to your homepage — Google treats this as a "soft 404" and strips the ranking signal entirely. After launch, run your most authoritative old URLs through this free redirect checker to confirm the chains resolve cleanly, then submit your new sitemap to Google Search Console to accelerate re-indexation.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-2xl font-bold mb-3">HTTP to HTTPS: The Most Common Redirect Chain</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">The most widespread redirect chain in the modern web looks like this: <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded text-xs font-mono">http://domain.com</code> → <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded text-xs font-mono">https://domain.com</code> → <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded text-xs font-mono">https://www.domain.com</code>. That is two hops when one is sufficient. Consolidate at the server level so all traffic hits a single canonical URL directly, without intermediate steps.</p>
                    </div>
                </section>

                <section className="bg-[var(--surface-1)] px-6 py-12">
                    <div className="max-w-5xl mx-auto">
                        <h3 className="text-xl font-bold mb-6">Related Free Technical SEO Tools</h3>
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
