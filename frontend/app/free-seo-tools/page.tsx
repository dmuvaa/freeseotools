import Link from "next/link";
import {
    Search, Globe, FileText, Zap, Link as LinkIcon, BarChart, FileCode, CheckCircle, Smartphone,
    GitBranch, Layers, SlidersHorizontal, Copy, Tag, Package, Share2, Timer, Map, Scissors, GitMerge, History
} from "lucide-react";

export default function FreeSEOToolsLandingPage() {
    const categories = [
        {
            title: "Core SEO Tools",
            description: "Essential checks for technical and on-page optimization.",
            tools: [
                { name: "Schema Checker", desc: "Validate structured data markup.", href: "/schema-checker", icon: <Tag className="size-6 text-indigo-500" /> },
                { name: "JS Rendering", desc: "See how JS affects your rendered DOM.", href: "/javascript-rendering-checker", icon: <FileCode className="size-6 text-fuchsia-500" /> },
                { name: "Meta Tags Analyzer", desc: "Check on-page meta tags for SEO compliance.", href: "/tools/meta-tags-analyzer", icon: <Globe className="size-6 text-blue-500" /> },
                { name: "Robots.txt Tester", desc: "Check rules and accessibility for search engine crawlers.", href: "/tools/robots-txt-tester", icon: <FileCode className="size-6 text-orange-500" /> },
                { name: "Sitemap Analyzer", desc: "Analyze your XML sitemaps for SEO errors.", href: "/tools/sitemap-analyzer", icon: <FileText className="size-6 text-green-500" /> },
                { name: "Redirect Checker", desc: "Trace URL redirect chains and status codes.", href: "/tools/redirect-checker", icon: <Zap className="size-6 text-yellow-500" /> },
                { name: "HTTP Headers", desc: "Inspect HTTP response headers.", href: "/tools/http-headers-checker", icon: <Search className="size-6 text-teal-500" /> },
                { name: "Title & Meta Length", desc: "Validate the length of titles and descriptions.", href: "/tools/title-meta-length", icon: <Smartphone className="size-6 text-pink-500" /> },
                { name: "Heading Structure", desc: "Audit the hierarchy and flow of H1-H6 tags.", href: "/tools/heading-structure", icon: <BarChart className="size-6 text-purple-500" /> },
                { name: "Broken Links", desc: "Scan for dead links and 404 errors.", href: "/tools/broken-link-checker", icon: <LinkIcon className="size-6 text-red-500" /> },
                { name: "SERP Preview", desc: "Simulate how your page will appear in Google.", href: "/tools/serp-preview", icon: <CheckCircle className="size-6 text-emerald-500" /> },
            ]
        },
        {
            title: "Advanced SEO Analysis",
            description: "Deep-dive technical audits for mature websites.",
            tools: [
                { name: "Internal Link Audit", desc: "Graph and assess your internal link architecture.", href: "/tools/internal-link-audit", icon: <LinkIcon className="size-6 text-blue-400" /> },
                { name: "Crawl Budget Simulator", desc: "Estimate how search engines prioritize crawling.", href: "/tools/crawl-budget-simulator", icon: <Zap className="size-6 text-yellow-400" /> },
                { name: "Indexability Checker", desc: "Verify indexation blocks and canonical tags.", href: "/tools/indexability-checker", icon: <CheckCircle className="size-6 text-green-400" /> },
                { name: "Anchor Text Analyzer", desc: "Breakdown internal vs external anchor diversity.", href: "/tools/anchor-text-analyzer", icon: <Search className="size-6 text-indigo-400" /> },
                { name: "Thin Content Detector", desc: "Find low-value pages harming panda scores.", href: "/tools/thin-content-detector", icon: <FileText className="size-6 text-orange-400" /> },
                { name: "Keyword Cannibalization", desc: "Detect pages competing for the exact same terms.", href: "/tools/keyword-cannibalization", icon: <BarChart className="size-6 text-purple-400" /> },
                { name: "Log File Analyzer", desc: "Understand real Googlebot crawl behavior.", href: "/tools/log-file-analyzer", icon: <FileCode className="size-6 text-cyan-400" /> },
            ]
        },
        {
            title: "Lighthouse & Core Web Vitals",
            description: "Google's official performance and experience metrics.",
            tools: [
                { name: "Mobile Lighthouse", desc: "Full mobile performance, SEO, and accessibility audit.", href: "/tools/lighthouse-mobile", icon: <Smartphone className="size-6 text-pink-400" /> },
                { name: "Desktop Lighthouse", desc: "Full desktop performance and SEO audit.", href: "/tools/lighthouse-desktop", icon: <Globe className="size-6 text-blue-400" /> },
                { name: "Core Web Vitals", desc: "Measure CLS, LCP, and INP metrics.", href: "/tools/lighthouse-cwv", icon: <Zap className="size-6 text-yellow-400" /> },
                { name: "SEO Lighthouse", desc: "Google's strict SEO best practices test.", href: "/tools/lighthouse-seo", icon: <Search className="size-6 text-emerald-400" /> },
                { name: "Accessibility Tools", desc: "Ensure ADA and WCAG compliance.", href: "/tools/lighthouse-accessibility", icon: <CheckCircle className="size-6 text-teal-400" /> },
                { name: "Performance Tracker", desc: "Compare site speed over time.", href: "/tools/lighthouse-tracker", icon: <BarChart className="size-6 text-indigo-400" /> },
            ]
        },
        {
            title: "Technical Audits",
            description: "Advanced debugging for complex site architectures.",
            tools: [
                { name: "JS SEO Diff", desc: "Compare raw HTML vs Javascript rendered DOM.", href: "/tools/js-seo-diff", icon: <GitBranch className="size-6 text-fuchsia-400" /> },
                { name: "Canonical Conflicts", desc: "Detect canonical loops and incorrect targets.", href: "/tools/canonical-conflicts", icon: <GitMerge className="size-6 text-rose-400" /> },
                { name: "Pagination Analyzer", desc: "Audit rel=prev/next and parameter URLs.", href: "/tools/pagination-analyzer", icon: <SlidersHorizontal className="size-6 text-orange-400" /> },
                { name: "Duplicate Content", desc: "Find exact or near-match duplicate pages.", href: "/tools/duplicate-content", icon: <Copy className="size-6 text-slate-400" /> },
                { name: "Schema Coverage", desc: "Site-wide rich snippet eligibility check.", href: "/tools/schema-coverage", icon: <Tag className="size-6 text-blue-400" /> },
            ]
        },
        {
            title: "Speed Optimization",
            description: "Granular network and payload analysis.",
            tools: [
                { name: "JS Bundle Analyzer", desc: "Evaluate main-thread blocking scripts.", href: "/tools/js-bundle-analyzer", icon: <Package className="size-6 text-purple-400" /> },
                { name: "Third-Party Scripts", desc: "Identify slow trackers and ad networks.", href: "/tools/third-party-scripts", icon: <Share2 className="size-6 text-teal-400" /> },
                { name: "TTFB Checker", desc: "Time to First Byte global latency check.", href: "/tools/ttfb-checker", icon: <Timer className="size-6 text-amber-400" /> },
            ]
        },
        {
            title: "Diagnostics & History",
            description: "Forensic analysis of site issues.",
            tools: [
                { name: "Crawl Path Visualizer", desc: "Map the shortest path to any URL.", href: "/tools/crawl-path", icon: <Map className="size-6 text-green-400" /> },
                { name: "SERP Snippet", desc: "Check history of title tag changes.", href: "/tools/serp-snippet", icon: <Scissors className="size-6 text-indigo-400" /> },
                { name: "Orphan Page Finder", desc: "Locate unlinked pages in your sitemap.", href: "/tools/orphan-pages", icon: <Layers className="size-6 text-red-400" /> },
                { name: "Index History", desc: "Track how pages enter and drop from Google.", href: "/tools/index-history", icon: <History className="size-6 text-blue-400" /> },
            ]
        }
    ];

    return (
        <div className="container mx-auto p-6 md:p-10 max-w-7xl">
            <div className="mb-12">
                <h1 className="text-3xl md:text-5xl font-bold mb-4">Free SEO Tools</h1>
                <p className="text-lg text-[var(--text-muted)] max-w-3xl">
                    Instantly audit, preview, and optimize your web pages with our massive suite of marketing and technical SEO tools.
                    From basic meta tags to deep Javascript rendering analysis, we have everything you need to boost visibility.
                </p>
            </div>

            <div className="flex flex-col gap-16">
                {categories.map((category, idx) => (
                    <div key={idx}>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold">{category.title}</h2>
                            <p className="text-[var(--text-muted)] mt-1">{category.description}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {category.tools.map((tool) => (
                                <Link
                                    key={tool.href}
                                    href={tool.href}
                                    className="group flex flex-col p-5 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] hover:shadow-md hover:-translate-y-1 transition-all duration-300 hover:border-[var(--primary)]/30"
                                >
                                    <div className="mb-3 p-2.5 bg-[var(--surface-2)] group-hover:bg-[var(--primary-muted)] w-max rounded-lg transition-colors">
                                        <div className="group-hover:scale-110 transition-transform duration-300">
                                            {tool.icon}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-1 group-hover:text-[var(--primary)] transition-colors">{tool.name}</h3>
                                    <p className="text-[var(--text-muted)] text-xs flex-1 leading-relaxed">{tool.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
