import { Metadata } from "next";
import Link from "next/link";
import BrokenLinkCheckerClient from "./client";

export const metadata: Metadata = {
    title: "Free Broken Link Checker | Find Dead Links & 404 Errors",
    description: "Free Broken Link Checker: Scan any webpage for dead outbound and internal links. Find 404 errors, timeouts, and server failures before they damage your SEO.",
};

const relatedTools = [
    { name: "Free Redirect Checker", href: "/tools/redirect-checker", desc: "Trace where broken links redirect to" },
    { name: "Free Sitemap Analyzer", href: "/tools/sitemap-analyzer", desc: "Find dead links embedded in your sitemap" },
    { name: "Free HTTP Headers Checker", href: "/tools/http-headers-checker", desc: "Inspect full server responses per URL" },
];

export default function BrokenLinkCheckerPage() {
    return (
        <>
            <BrokenLinkCheckerClient />

            <div className="border-t border-[var(--border)] mt-4">

                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-600 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free Broken Link Checker</h2>
                        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
                            Dead links frustrate users, waste crawl budget, and signal to search engines that your site is unmaintained. Our free checker scans up to 50 links per page concurrently, exposing every 404 and server error in seconds.
                        </p>
                    </div>
                </section>

                {/* Impact Stats */}
                <section className="px-6 py-14 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-10">Why Free Broken Link Checking is Essential</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: "🚫", title: "Crawl Budget Killer", color: "from-red-500/20 to-rose-500/10", border: "border-red-500/20", body: "Every 404 Googlebot hits is a dead end. On sites with thousands of pages, broken links mean search engines spend their entire crawl budget on error pages instead of discovering new, valuable content." },
                            { icon: "📉", title: "Link Equity Drain", color: "from-orange-500/20 to-amber-500/10", border: "border-orange-500/20", body: "Internal links are how PageRank flows through your site. A broken internal link severs that flow entirely — authority that should be boosting your product pages disappears into a void." },
                            { icon: "😤", title: "User Trust Destroyer", color: "from-yellow-500/20 to-orange-500/10", border: "border-yellow-500/20", body: "Nothing erodes reader trust faster than clicking a recommended resource only to hit a 404 page. High bounce rates from dead links send negative engagement signals directly to Google's ranking algorithm." },
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
                        <h3 className="text-2xl font-bold mb-10 text-center">How the Free Broken Link Checker Works</h3>
                        <ol className="space-y-6">
                            {[
                                { step: "1", title: "Enter the Page URL", body: "Paste the URL of any webpage you want to audit. Our server fetches the HTML and extracts every anchor tag with an href attribute, de-duplicating URLs and filtering out mailto, javascript, and fragment-only links." },
                                { step: "2", title: "URL Resolution", body: "Relative URLs (like /about or ../images/logo.png) are resolved against the page's base URL so every link is converted to a fully qualified absolute URL before checking." },
                                { step: "3", title: "Concurrent HEAD Requests", body: "We fire up to 50 concurrent HTTP HEAD requests — lightweight requests that check availability without downloading full page bodies. This delivers results in seconds rather than minutes." },
                                { step: "4", title: "Color-Coded Status Report", body: "Results are displayed in a table with green badges for successful 200s, red badges for 404s and 5xx errors, and yellow badges for 403/405 responses that may indicate bot blocking rather than true breakage." },
                            ].map(s => (
                                <li key={s.step} className="flex gap-5 items-start">
                                    <div className="size-9 rounded-full bg-red-600 text-white font-bold text-sm flex items-center justify-center shrink-0">{s.step}</div>
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
                        <h3 className="text-2xl font-bold mb-3">Fixing Broken Links: Your Action Plan</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Once our free checker surfaces the dead links on a page, you have three options. For internal broken links, implement a 301 redirect from the dead URL to the most relevant live alternative — this instantly heals all links pointing to it across your entire site. For broken external links, either find a live alternative resource and update your anchor, or remove the link entirely if no suitable replacement exists. For timeout errors, check whether the site is temporarily down or permanently gone before deciding.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-2xl font-bold mb-3">Internal vs External: Which to Fix First</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Internal broken links are your highest priority because they directly impact PageRank flow and user journeys within your own domain. Run your most trafficked pages — homepage, top landing pages, high-authority blog posts — through our free tool first. External links should be audited on a regular schedule, as third-party sites remove and restructure content constantly. A link that worked last month may be a 404 today.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-2xl font-bold mb-3">403 and 405 Responses: Not Always Broken</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Some servers return 403 Forbidden or 405 Method Not Allowed specifically in response to HEAD requests from bots — yet serve the page perfectly to actual browser users. Our tool marks these as warnings rather than confirmed errors. If you see a 403 or 405 on a link you know is functional in a browser, it simply means that server is rejecting our bot-style request. The link itself is not broken for human visitors.</p>
                    </div>
                </section>

                <section className="bg-[var(--surface-1)] px-6 py-12">
                    <div className="max-w-5xl mx-auto">
                        <h3 className="text-xl font-bold mb-6">Free Link Health Tools</h3>
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
