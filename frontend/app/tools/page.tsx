import Link from "next/link"
import { Search, Globe, FileText, Zap, Link as LinkIcon, BarChart, FileCode, CheckCircle, Smartphone } from "lucide-react"

export default function ToolsLandingPage() {
    const tools = [
        {
            name: "Meta Tags Analyzer",
            desc: "Check on-page meta tags for SEO compliance.",
            href: "/tools/meta-tags-analyzer",
            icon: <Globe className="size-6 text-blue-500" />
        },
        {
            name: "Robots.txt Tester",
            desc: "Check rules and accessibility for search engine crawlers.",
            href: "/tools/robots-txt-tester",
            icon: <FileCode className="size-6 text-orange-500" />
        },
        {
            name: "Sitemap Analyzer",
            desc: "Analyze your XML sitemaps for SEO errors and HTTP status codes.",
            href: "/tools/sitemap-analyzer",
            icon: <FileText className="size-6 text-green-500" />
        },
        {
            name: "Redirect Checker",
            desc: "Trace URL redirect chains (301, 302) and response times.",
            href: "/tools/redirect-checker",
            icon: <Zap className="size-6 text-yellow-500" />
        },
        {
            name: "HTTP Headers Checker",
            desc: "Inspect HTTP response headers and security directives.",
            href: "/tools/http-headers-checker",
            icon: <Search className="size-6 text-teal-500" />
        },
        {
            name: "Title & Meta Length Checker",
            desc: "Validate the length of titles/descriptions against pixel limits.",
            href: "/tools/title-meta-length",
            icon: <Smartphone className="size-6 text-pink-500" />
        },
        {
            name: "Heading Structure Analyzer",
            desc: "Audit the hierarchy and flow of H1-H6 tags on your page.",
            href: "/tools/heading-structure",
            icon: <BarChart className="size-6 text-purple-500" />
        },
        {
            name: "Broken Link Checker",
            desc: "Scan for dead links and 404 errors on any given webpage.",
            href: "/tools/broken-link-checker",
            icon: <LinkIcon className="size-6 text-red-500" />
        },
        {
            name: "SERP Preview Tool",
            desc: "Simulate how your page will appear in Google search results.",
            href: "/tools/serp-preview",
            icon: <CheckCircle className="size-6 text-emerald-500" />
        },
    ];

    return (
        <div className="container mx-auto p-6 md:p-10 max-w-6xl">
            <div className="mb-12">
                <h1 className="text-3xl md:text-5xl font-bold mb-4">Free SEO Tools</h1>
                <p className="text-lg text-[var(--text-muted)] max-w-3xl">
                    Instantly audit, preview, and optimize your web pages with our suite of lightweight marketing and technical SEO tools.
                    Identify critical bottlenecks holding back your search visibility.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                    <Link
                        key={tool.href}
                        href={tool.href}
                        className="group flex flex-col p-6 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] hover:shadow-sm hover:-translate-y-1 transition-all duration-300 hover:border-[var(--primary-muted)]"
                    >
                        <div className="mb-4 p-3 bg-[var(--surface-2)] group-hover:bg-[var(--primary-muted)] w-max rounded-lg transition-colors">
                            <div className="group-hover:scale-110 transition-transform duration-300">
                                {tool.icon}
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-[var(--primary)] transition-colors">{tool.name}</h3>
                        <p className="text-[var(--text-muted)] text-sm flex-1">{tool.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}
