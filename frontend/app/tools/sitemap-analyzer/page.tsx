import { Metadata } from "next";
import Link from "next/link";
import SitemapAnalyzerClient from "./client";

export const metadata: Metadata = {
    title: "Free XML Sitemap Analyzer | Validate URLs & Find SEO Errors",
    description: "Free Sitemap Analyzer: Parse any XML sitemap, check URL health, validate lastmod dates, and detect broken links embedded in your sitemap instantly.",
};

const relatedTools = [
    { name: "Free Robots.txt Tester", href: "/tools/robots-txt-tester", desc: "Ensure Googlebot can reach your sitemap" },
    { name: "Free Broken Link Checker", href: "/tools/broken-link-checker", desc: "Audit individual pages for dead links" },
    { name: "Free Redirect Checker", href: "/tools/redirect-checker", desc: "Catch redirect chains inside your sitemap" },
];

export default function SitemapAnalyzerPage() {
    return (
        <>
            <SitemapAnalyzerClient />

            <div className="border-t border-[var(--border)] mt-4">

                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-600 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free Sitemap Analyzer</h2>
                        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
                            A healthy sitemap is the express lane to Google's index. Our free analyzer parses your XML sitemap, checks every URL's HTTP status, and surfaces the errors killing your indexation rates.
                        </p>
                    </div>
                </section>

                <section className="px-6 py-14 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-10">What Our Free Sitemap Analyzer Checks</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "URL Status Verification", color: "from-green-500/20 to-emerald-500/10", border: "border-green-500/20", icon: "✅", body: "We fire concurrent HEAD requests against a sample of your sitemap URLs and report back real HTTP status codes. Find 404s, 500s, and unwanted 301 redirect chains before Googlebot wastes crawl budget on them." },
                            { title: "Sitemap Index Support", color: "from-blue-500/20 to-indigo-500/10", border: "border-blue-500/20", icon: "📂", body: "Large sites use sitemap index files containing dozens of child sitemaps for products, posts, and images. Our free analyzer recursively unpacks sitemap indexes and presents a unified view of your entire URL architecture." },
                            { title: "Metadata Validation", color: "from-purple-500/20 to-violet-500/10", border: "border-purple-500/20", icon: "🗓️", body: "We extract lastmod, changefreq, and priority tags from each URL entry. Missing or outdated lastmod dates cause Googlebot to recrawl on its own schedule rather than when you actually update content." },
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
                        <h3 className="text-2xl font-bold mb-10 text-center">How the Free Sitemap Analyzer Works</h3>
                        <ol className="space-y-6">
                            {[
                                { step: "1", title: "Paste Your Sitemap URL", body: "Enter the direct URL to your sitemap file (e.g., yourdomain.com/sitemap.xml or /sitemap_index.xml). Our system makes a server-side request to fetch the raw XML." },
                                { step: "2", title: "XML Parsing & Structure Analysis", body: "We use a standards-compliant XML parser to walk through each URL entry, extracting location, lastmod, changefreq, and priority values into a structured format." },
                                { step: "3", title: "Concurrent HTTP Health Checks", body: "A sample of entries are simultaneously checked via HTTP HEAD requests to verify actual server availability. We capture the status code and flag anything that isn't a clean 200 OK." },
                                { step: "4", title: "Visual Summary Report", body: "Results are presented as a full statistics dashboard: total URLs, healthy vs. broken counts, and a sortable table for drilling down into specific issues." },
                            ].map(s => (
                                <li key={s.step} className="flex gap-5 items-start">
                                    <div className="size-9 rounded-full bg-green-600 text-white font-bold text-sm flex items-center justify-center shrink-0">{s.step}</div>
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
                        <h3 className="text-2xl font-bold mb-3">The Hidden Danger: 404 URLs Inside Sitemaps</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Sitemaps become stale. A product page you deleted six months ago might still be listed in your sitemap, quietly sending Googlebot on pointless 404 crawls. Over time, repeated errors erode crawler trust in your domain. Our free analyzer exposes these ghost URLs so you can rebuild a clean, authoritative sitemap that search engines treat as a reliable signal.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-2xl font-bold mb-3">Sitemap Size Limits and Index Files</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Google enforces a hard limit of 50,000 URLs per sitemap file and a maximum uncompressed file size of 50MB. Enterprise ecommerce stores with millions of SKUs routinely exceed these limits. The solution is a sitemap index file that references multiple child sitemaps. Our tool fully supports sitemap indexes and drills into each referenced child file automatically.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-2xl font-bold mb-3">The lastmod Tag: Your Content Freshness Signal</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">The <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded text-xs font-mono">lastmod</code> tag tells Googlebot when you last modified a page. If you update a core landing page but forget to update its lastmod value, Googlebot may delay recrawling it for weeks. Keeping lastmod values accurate and current is one of the highest leverage, lowest effort technical SEO improvements available.</p>
                    </div>
                </section>

                <section className="bg-[var(--surface-1)] px-6 py-12">
                    <div className="max-w-5xl mx-auto">
                        <h3 className="text-xl font-bold mb-6">More Free Crawling Tools</h3>
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
