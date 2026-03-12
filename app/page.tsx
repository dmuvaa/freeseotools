import Link from "next/link";
import {
    Search, Globe, FileText, Zap, Link as LinkIcon, BarChart, FileCode, CheckCircle, Smartphone,
    GitBranch, Layers, SlidersHorizontal, Copy, Tag, Package, Share2, Timer, Map, Scissors, GitMerge, History
} from "lucide-react";

export default function FreeSEOToolsLandingPage() {
    const categories = [
        {
            id: "core-seo",
            title: "Core SEO Tools",
            description: "Essential checks for technical and on-page optimization.",
            tools: [
                { name: "Schema Checker", desc: "Validate structured data markup.", href: "/core-seo/schema-checker", icon: <Tag className="size-6 text-indigo-500" /> },
                { name: "JS Rendering", desc: "See how JS affects your rendered DOM.", href: "/core-seo/javascript-rendering-checker", icon: <FileCode className="size-6 text-fuchsia-500" /> },
                { name: "Meta Tags Analyzer", desc: "Check on-page meta tags for SEO compliance.", href: "/core-seo/meta-tags-analyzer", icon: <Globe className="size-6 text-blue-500" /> },
                { name: "Robots.txt Tester", desc: "Check rules and accessibility for search engine crawlers.", href: "/core-seo/robots-txt-tester", icon: <FileCode className="size-6 text-orange-500" /> },
                { name: "Sitemap Analyzer", desc: "Analyze your XML sitemaps for SEO errors.", href: "/core-seo/sitemap-analyzer", icon: <FileText className="size-6 text-green-500" /> },
                { name: "Redirect Checker", desc: "Trace URL redirect chains and status codes.", href: "/core-seo/redirect-checker", icon: <Zap className="size-6 text-yellow-500" /> },
                { name: "HTTP Headers", desc: "Inspect HTTP response headers.", href: "/core-seo/http-headers-checker", icon: <Search className="size-6 text-teal-500" /> },
                { name: "Title & Meta Length", desc: "Validate the length of titles and descriptions.", href: "/core-seo/title-meta-length", icon: <Smartphone className="size-6 text-pink-500" /> },
                { name: "Heading Structure", desc: "Audit the hierarchy and flow of H1-H6 tags.", href: "/core-seo/heading-structure", icon: <BarChart className="size-6 text-purple-500" /> },
                { name: "Broken Links", desc: "Scan for dead links and 404 errors.", href: "/core-seo/broken-link-checker", icon: <LinkIcon className="size-6 text-red-500" /> },
                { name: "SERP Preview", desc: "Simulate how your page will appear in Google.", href: "/core-seo/serp-preview", icon: <CheckCircle className="size-6 text-emerald-500" /> },
            ]
        },
        {
            id: "advanced",
            title: "Advanced SEO Analysis",
            description: "Deep-dive technical audits for mature websites.",
            tools: [
                { name: "Internal Link Audit", desc: "Graph and assess your internal link architecture.", href: "/advanced/internal-link-audit", icon: <LinkIcon className="size-6 text-blue-400" /> },
                { name: "Crawl Budget Simulator", desc: "Estimate how search engines prioritize crawling.", href: "/advanced/crawl-budget-simulator", icon: <Zap className="size-6 text-yellow-400" /> },
                { name: "Indexability Checker", desc: "Verify indexation blocks and canonical tags.", href: "/advanced/indexability-checker", icon: <CheckCircle className="size-6 text-green-400" /> },
                { name: "Anchor Text Analyzer", desc: "Breakdown internal vs external anchor diversity.", href: "/advanced/anchor-text-analyzer", icon: <Search className="size-6 text-indigo-400" /> },
                { name: "Thin Content Detector", desc: "Find low-value pages harming panda scores.", href: "/advanced/thin-content-detector", icon: <FileText className="size-6 text-orange-400" /> },
                { name: "Keyword Cannibalization", desc: "Detect pages competing for the exact same terms.", href: "/advanced/keyword-cannibalization", icon: <BarChart className="size-6 text-purple-400" /> },
                { name: "Log File Analyzer", desc: "Understand real Googlebot crawl behavior.", href: "/advanced/log-file-analyzer", icon: <FileCode className="size-6 text-cyan-400" /> },
            ]
        },
        {
            id: "lighthouse",
            title: "Lighthouse & Core Web Vitals",
            description: "Google's official performance and experience metrics.",
            tools: [
                { name: "Mobile Lighthouse", desc: "Full mobile performance, SEO, and accessibility audit.", href: "/lighthouse/mobile", icon: <Smartphone className="size-6 text-pink-400" /> },
                { name: "Desktop Lighthouse", desc: "Full desktop performance and SEO audit.", href: "/lighthouse/desktop", icon: <Globe className="size-6 text-blue-400" /> },
                { name: "Core Web Vitals", desc: "Measure CLS, LCP, and INP metrics.", href: "/lighthouse/core-web-vitals", icon: <Zap className="size-6 text-yellow-400" /> },
                { name: "SEO Lighthouse", desc: "Google's strict SEO best practices test.", href: "/lighthouse/seo", icon: <Search className="size-6 text-emerald-400" /> },
                { name: "Accessibility Tools", desc: "Ensure ADA and WCAG compliance.", href: "/lighthouse/accessibility", icon: <CheckCircle className="size-6 text-teal-400" /> },
                { name: "Performance Tracker", desc: "Compare site speed over time.", href: "/lighthouse/tracker", icon: <BarChart className="size-6 text-indigo-400" /> },
            ]
        },
        {
            id: "technical",
            title: "Technical Audits",
            description: "Advanced debugging for complex site architectures.",
            tools: [
                { name: "JS SEO Diff", desc: "Compare raw HTML vs Javascript rendered DOM.", href: "/technical/js-seo-diff", icon: <GitBranch className="size-6 text-fuchsia-400" /> },
                { name: "Canonical Conflicts", desc: "Detect canonical loops and incorrect targets.", href: "/technical/canonical-conflicts", icon: <GitMerge className="size-6 text-rose-400" /> },
                { name: "Pagination Analyzer", desc: "Audit rel=prev/next and parameter URLs.", href: "/technical/pagination-analyzer", icon: <SlidersHorizontal className="size-6 text-orange-400" /> },
                { name: "Duplicate Content", desc: "Find exact or near-match duplicate pages.", href: "/technical/duplicate-content", icon: <Copy className="size-6 text-slate-400" /> },
                { name: "Schema Coverage", desc: "Site-wide rich snippet eligibility check.", href: "/technical/schema-coverage", icon: <Tag className="size-6 text-blue-400" /> },
            ]
        },
        {
            id: "speed",
            title: "Speed Optimization",
            description: "Granular network and payload analysis.",
            tools: [
                { name: "JS Bundle Analyzer", desc: "Evaluate main-thread blocking scripts.", href: "/speed/js-bundle-analyzer", icon: <Package className="size-6 text-purple-400" /> },
                { name: "Third-Party Scripts", desc: "Identify slow trackers and ad networks.", href: "/speed/third-party-scripts", icon: <Share2 className="size-6 text-teal-400" /> },
                { name: "TTFB Checker", desc: "Time to First Byte global latency check.", href: "/speed/ttfb-checker", icon: <Timer className="size-6 text-amber-400" /> },
            ]
        },
        {
            id: "diagnostics",
            title: "Diagnostics & History",
            description: "Forensic analysis of site issues.",
            tools: [
                { name: "Crawl Path Visualizer", desc: "Map the shortest path to any URL.", href: "/diagnostics/crawl-path", icon: <Map className="size-6 text-green-400" /> },
                { name: "SERP Snippet", desc: "Check history of title tag changes.", href: "/diagnostics/serp-snippet", icon: <Scissors className="size-6 text-indigo-400" /> },
                { name: "Orphan Page Finder", desc: "Locate unlinked pages in your sitemap.", href: "/diagnostics/orphan-pages", icon: <Layers className="size-6 text-red-400" /> },
                { name: "Index History", desc: "Track how pages enter and drop from Google.", href: "/diagnostics/index-history", icon: <History className="size-6 text-blue-400" /> },
            ]
        }
    ];

    return (
        <div className="bg-[var(--surface-2)]">
            <div className="w-full py-20 md:py-32 bg-gradient-to-br from-[var(--surface-1)] to-[var(--surface-2)] border-b border-[var(--border)] px-4">
                <div className="container mx-auto max-w-5xl text-center">
                    <div className="inline-flex items-center justify-center rounded-full bg-[var(--primary-muted)] px-3 py-1 text-sm font-medium text-[var(--primary)] mb-6">
                        <Zap className="mr-2 size-4" /> The Ultimate technical SEO suite
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-[var(--foreground)]">
                        Everything you need to <span className="text-[var(--primary)]">Dominate Search</span>
                    </h1>
                    <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-3xl mx-auto mb-10 leading-relaxed">
                        Instantly audit, preview, and optimize your web pages with our massive suite of free technical SEO tools. From basic meta tags to deep JavaScript rendering analysis.
                    </p>
                </div>
            </div>

            <div className="container mx-auto p-6 md:p-10 max-w-7xl -mt-8 relative z-10 bg-[var(--surface-1)] rounded-2xl shadow-sm border border-[var(--border)] mb-20">

                <div className="flex flex-col gap-16">
                    {categories.map((category) => (
                        <div key={category.id} id={category.id} className="scroll-mt-24">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold">{category.title}</h2>
                                <p className="text-[var(--text-muted)] mt-1">{category.description}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {category.tools.map((tool) => (
                                    <Link
                                        key={tool.href}
                                        href={tool.href}
                                        className="group flex flex-col p-6 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] hover:bg-white dark:hover:bg-[var(--surface-2)] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 hover:border-[var(--primary)]/50 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="mb-4 p-3 bg-[var(--surface-2)] group-hover:bg-[var(--primary-muted)] group-hover:text-[var(--primary)] text-[var(--text-subtle)] w-max rounded-xl transition-colors">
                                            <div className="group-hover:scale-110 transition-transform duration-300">
                                                {tool.icon}
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold mb-2 text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{tool.name}</h3>
                                        <p className="text-[var(--text-muted)] text-sm flex-1 leading-relaxed">{tool.desc}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
