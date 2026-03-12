import { Metadata } from "next";
import Link from "next/link";
import SitemapAnalyzerClient from "./client";
import {
    TbMap2, TbSitemap, TbLink, TbFileCode, TbPhoto, TbBrandSpeedtest,
    TbCircleCheck, TbAlertTriangle, TbFileX, TbChartBar, TbArrowRight
} from "react-icons/tb";

export const metadata: Metadata = {
    title: "Sitemap Analyzer | Free XML Sitemap Health Check Tool",
    description: "Provide an exhaustive health check for your XML sitemaps to ensure every URL you want indexed is discoverable by search engines.",
};

const coreFeatures = [
    {
        icon: TbSitemap,
        title: "Sitemap Index Support",
        desc: "We automatically detect and crawl sitemap index files, allowing you to audit thousands of sub-sitemaps in one pass.",
        color: "blue"
    },
    {
        icon: TbChartBar,
        title: "Response Code Mapping",
        desc: "We provide a breakdown of every status code found, including 200, 301, 404, and 500 errors.",
        color: "green"
    },
    {
        icon: TbPhoto,
        title: "Image & Video Support",
        desc: "Our tool validates specialized sitemaps designed for media, ensuring your visual assets are also visible in search.",
        color: "purple"
    },
    {
        icon: TbBrandSpeedtest,
        title: "Crawl Priority Analysis",
        desc: "We check the \"priority\" and \"changefreq\" tags to ensure they are being used logically to guide bot behavior.",
        color: "orange"
    },
];

const auditChecks = [
    {
        num: "01",
        title: "URL Accessibility",
        desc: "We verify that every link returns a 200 OK status. Any 404 or 500 errors are flagged for immediate removal.",
        status: "critical"
    },
    {
        num: "02",
        title: "Canonical Consistency",
        desc: "We check that the URL in the sitemap matches the canonical tag on the page. If they differ, search engines will likely ignore the sitemap entry.",
        status: "warning"
    },
    {
        num: "03",
        title: "Robots.txt Alignment",
        desc: "We verify that the sitemap does not contain URLs that are blocked in your robots.txt file.",
        status: "critical"
    },
    {
        num: "04",
        title: "Noindex Tags",
        desc: "Our scanner finds URLs that are listed in the sitemap but contain a \"noindex\" meta tag, which is a major signal conflict.",
        status: "critical"
    },
    {
        num: "05",
        title: "Lastmod Accuracy",
        desc: "We verify that the \"lastmod\" date is correctly formatted and reflects recent changes to help bots prioritize crawling.",
        status: "info"
    },
];

const faqs = [
    {
        q: "Why should I use an XML sitemap instead of an HTML sitemap?",
        a: "An XML sitemap is designed specifically for search engines to process data efficiently. While HTML sitemaps help users navigate your site, XML sitemaps provide the technical metadata (like last modification dates) that bots need to manage your crawl budget."
    },
    {
        q: "How many URLs can I include in a single sitemap?",
        a: "A single XML sitemap can contain up to 50,000 URLs or have a file size of 50MB. If your site exceeds these limits, you must use a sitemap index file to group multiple sitemaps together."
    },
    {
        q: "Does a sitemap guarantee that my pages will be indexed?",
        a: "No. A sitemap is a recommendation, not a command. It helps Google find your pages, but Google will still evaluate the quality and uniqueness of the content before deciding to index it."
    },
    {
        q: "What is the best way to submit my sitemap to Google?",
        a: "You should submit your sitemap URL directly through the Google Search Console. You can also specify the location of your sitemap in your site's robots.txt file using the Sitemap: directive."
    },
    {
        q: "What happens if my sitemap has 404 errors?",
        a: "If your sitemap includes 404 (Not Found) links, search engines will waste crawl budget visiting dead pages. It is critical to remove 404 links from your sitemap immediately."
    },
    {
        q: "Can I use a free sitemap analyzer for a large website?",
        a: "Yes, our free sitemap analysis service is built to handle sitemap index files, which means you can audit large websites with tens of thousands of pages."
    },
];

const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    green: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

const relatedTools = [
    { name: "Robots.txt Tester", href: "/core-seo/robots-txt-tester", desc: "Master your crawl logic" },
    { name: "Redirect Checker", href: "/core-seo/redirect-checker", desc: "Trace URL redirect chains" },
    { name: "Broken Links Scanner", href: "/core-seo/broken-link-checker", desc: "Find and fix dead URLs" },
];

export default function SitemapAnalyzerPage() {
    return (
        <div className="bg-background min-h-screen">

            {/* Hero — Blueprint Aesthetic */}
            <section className="relative overflow-hidden bg-surface-2 border-b border-border py-12 md:py-20 text-center">
                {/* Grid lines background */}
                <div
                    className="absolute inset-0 opacity-[0.03] dark:opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px"
                    }}
                />
                <div className="relative container mx-auto max-w-4xl px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 text-foreground">
                        Sitemap Analyzer
                        <span className="block text-blue-600 dark:text-blue-400 mt-1 text-2xl md:text-3xl font-bold">Ensure Your Roadmap is Error-Free</span>
                    </h1>
                    <p className="text-lg text-text-muted leading-relaxed max-w-2xl mx-auto mb-8">
                        Provide an exhaustive health check for your XML sitemaps to ensure every URL you want indexed is discoverable by search engines.
                    </p>

                    {/* Embedded Tool within Hero */}
                    <div className="bg-surface-1 rounded-2xl border border-border p-6 shadow-2xl w-full max-w-4xl mx-auto ring-4 ring-blue-500/5 transition-all">
                        <SitemapAnalyzerClient />
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="px-6 py-12 md:py-16 container mx-auto max-w-5xl">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">How the Sitemap Analyzer Works</h2>
                        <div className="space-y-5 text-text-muted leading-relaxed">
                            <p>Our tool functions by fetching your XML sitemap directly from your server and parsing every entry within the file. It simulates a search engine crawler by visiting each URL listed to verify its status.</p>
                            <p>The process begins with a <strong>syntax validation</strong> to ensure the XML structure follows the official Sitemaps.org protocol. Once the file structure is verified, our system executes a "mini-crawl" of the URLs.</p>
                            <p>It looks for response codes, canonical tags, and meta robots instructions. Finally, it aggregates this data into a visual report, highlighting which pages are healthy and which are preventing your site from being fully indexed.</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[
                            { step: "01", label: "Fetch sitemap.xml from your server" },
                            { step: "02", label: "Validate XML structure (Sitemaps.org protocol)" },
                            { step: "03", label: "Mini-crawl all listed URLs" },
                            { step: "04", label: "Check response codes, canonicals, robots" },
                            { step: "05", label: "Generate visual health report" },
                        ].map((item) => (
                            <div key={item.step} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface-2 hover:border-primary hover:bg-primary-muted transition-all">
                                <span className="font-mono text-xl font-bold text-primary w-8 shrink-0">{item.step}</span>
                                <TbArrowRight className="text-text-subtle shrink-0" />
                                <span className="text-foreground font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Features */}
            <section className="px-6 py-16 bg-surface-2 border-y border-border">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Core Features of the Audit Tool</h2>
                        <p className="text-lg text-text-muted max-w-2xl mx-auto">Our analyzer is built to handle complex, multi-layered sitemap structures.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {coreFeatures.map((f) => {
                            const Icon = f.icon;
                            return (
                                <div key={f.title} className="bg-surface-1 rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300 group">
                                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${colorMap[f.color]}`}>
                                        <Icon className="text-xl" />
                                    </div>
                                    <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                                    <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Audit Checks */}
            <section className="px-6 py-16 container mx-auto max-w-5xl">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What is Checked During the Audit</h2>
                    <p className="text-lg text-text-muted max-w-2xl mx-auto">Our forensic scan leaves no stone unturned when it comes to sitemap health.</p>
                </div>
                <div className="space-y-4">
                    {auditChecks.map((check) => (
                        <div key={check.num} className="flex items-start gap-5 p-6 rounded-2xl border border-border bg-surface-1 hover:border-primary hover:shadow-sm transition-all group">
                            <span className="text-3xl font-black font-mono text-surface-3 group-hover:text-primary-muted transition-colors leading-none mt-1">{check.num}</span>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-lg text-foreground">{check.title}</h3>
                                    {check.status === "critical" && (
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-error-muted text-error">Critical</span>
                                    )}
                                    {check.status === "warning" && (
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-warning-muted text-warning">Warning</span>
                                    )}
                                </div>
                                <p className="text-text-muted leading-relaxed">{check.desc}</p>
                            </div>
                            {check.status === "critical" ? (
                                <TbAlertTriangle className="text-2xl text-red-400 shrink-0 mt-1" />
                            ) : check.status === "warning" ? (
                                <TbAlertTriangle className="text-2xl text-amber-400 shrink-0 mt-1" />
                            ) : (
                                <TbCircleCheck className="text-2xl text-green-400 shrink-0 mt-1" />
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Why It Matters */}
            <section className="px-6 py-16 bg-surface-2 border-y border-border">
                <div className="container mx-auto max-w-4xl text-center">
                    <TbFileX className="text-6xl text-blue-600 dark:text-blue-400 mx-auto mb-6" />
                    <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">Why This Sitemap Analyzer is Critical for SEO Success</h2>
                    <p className="text-lg text-text-muted mb-6 leading-relaxed max-w-3xl mx-auto font-medium">
                        A flawless XML sitemap is non-negotiable for sites with deep hierarchies or those that rely on continuous content updates. By validating your sitemap regularly, you ensure that search engine bots are not wasting time crawling low-value pages, are correctly prioritizing your most important content, and are quickly indexing new or updated URLs.
                    </p>
                    <p className="text-lg text-text-subtle leading-relaxed max-w-3xl mx-auto italic font-bold">
                        It is the fundamental link between your content strategy and Google's ability to discover it, acting as an insurance policy against critical indexing errors.
                    </p>
                </div>
            </section>

            {/* FAQ */}
            <section className="px-6 py-20 container mx-auto max-w-5xl">
                <div className="text-center mb-14">
                    <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    {faqs.map((faq) => (
                        <div key={faq.q} className="p-6 rounded-2xl border border-border bg-surface-2 hover:border-primary transition-colors">
                            <h3 className="font-bold text-foreground mb-3">{faq.q}</h3>
                            <p className="text-text-muted text-sm leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Related Tools */}
            <section className="px-6 py-12 bg-surface-2 border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <h3 className="text-lg font-bold text-foreground mb-6">Related Tools</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {relatedTools.map((t) => (
                            <Link key={t.href} href={t.href} className="group flex items-center justify-between p-5 rounded-xl border border-border bg-surface-1 hover:border-primary hover:shadow-md transition-all">
                                <div>
                                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm mb-0.5">{t.name}</p>
                                    <p className="text-xs text-text-muted">{t.desc}</p>
                                </div>
                                <TbArrowRight className="text-text-subtle group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
