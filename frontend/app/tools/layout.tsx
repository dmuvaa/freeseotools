"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Globe, FileText, Zap, Link as LinkIcon, BarChart, FileCode, CheckCircle, Smartphone } from "lucide-react";

const tools = [
    { name: "Meta Tags Analyzer", href: "/tools/meta-tags-analyzer", icon: <Globe className="size-4" /> },
    { name: "Robots.txt Tester", href: "/tools/robots-txt-tester", icon: <FileCode className="size-4" /> },
    { name: "Sitemap Analyzer", href: "/tools/sitemap-analyzer", icon: <FileText className="size-4" /> },
    { name: "Redirect Checker", href: "/tools/redirect-checker", icon: <Zap className="size-4" /> },
    { name: "HTTP Headers Checker", href: "/tools/http-headers-checker", icon: <Search className="size-4" /> },
    { name: "Title & Meta Length", href: "/tools/title-meta-length", icon: <Smartphone className="size-4" /> },
    { name: "Heading Structure", href: "/tools/heading-structure", icon: <BarChart className="size-4" /> },
    { name: "Broken Link Checker", href: "/tools/broken-link-checker", icon: <LinkIcon className="size-4" /> },
    { name: "SERP Preview", href: "/tools/serp-preview", icon: <CheckCircle className="size-4" /> },
];

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            <aside className="w-full md:w-64 border-r border-[var(--border)] shrink-0 bg-[var(--surface-1)]">
                <div className="p-4 md:sticky top-0 h-screen overflow-y-auto hidden md:block">
                    <Link
                        href="/tools"
                        className="flex items-center gap-2 px-3 py-2 mb-5 font-bold text-base text-[var(--foreground)]"
                    >
                        <span className="size-6 rounded-md bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold text-xs shrink-0">S</span>
                        SEO Tools
                    </Link>

                    <NavSection label="SEO Tools" tools={tools} pathname={pathname} />

                    <NavSection label="Advanced Tools" pathname={pathname} tools={[
                        { name: "Internal Link Audit", href: "/tools/internal-link-audit", icon: <LinkIcon className="size-4" /> },
                        { name: "Crawl Budget Simulator", href: "/tools/crawl-budget-simulator", icon: <Zap className="size-4" /> },
                        { name: "Indexability Checker", href: "/tools/indexability-checker", icon: <CheckCircle className="size-4" /> },
                        { name: "Anchor Text Analyzer", href: "/tools/anchor-text-analyzer", icon: <Search className="size-4" /> },
                        { name: "Thin Content Detector", href: "/tools/thin-content-detector", icon: <FileText className="size-4" /> },
                        { name: "Keyword Cannibalization", href: "/tools/keyword-cannibalization", icon: <BarChart className="size-4" /> },
                        { name: "Log File Analyzer", href: "/tools/log-file-analyzer", icon: <FileCode className="size-4" /> },
                        { name: "Core Web Vitals Compare", href: "/tools/core-web-vitals", icon: <Globe className="size-4" /> },
                    ]} />

                    <NavSection label="Lighthouse Suite" pathname={pathname} tools={[
                        { name: "Mobile Lighthouse", href: "/tools/lighthouse-mobile", icon: <Smartphone className="size-4" /> },
                        { name: "Desktop Lighthouse", href: "/tools/lighthouse-desktop", icon: <Globe className="size-4" /> },
                        { name: "JS Rendering", href: "/tools/lighthouse-js-rendering", icon: <FileCode className="size-4" /> },
                        { name: "Core Web Vitals", href: "/tools/lighthouse-cwv", icon: <Zap className="size-4" /> },
                        { name: "SEO Audit", href: "/tools/lighthouse-seo", icon: <Search className="size-4" /> },
                        { name: "Accessibility", href: "/tools/lighthouse-accessibility", icon: <CheckCircle className="size-4" /> },
                        { name: "Performance Tracker", href: "/tools/lighthouse-tracker", icon: <BarChart className="size-4" /> },
                    ]} />
                </div>
            </aside>
            <main className="flex-1 w-full bg-[var(--background)]">
                {children}
            </main>
        </div>
    );
}

function NavSection({ label, tools, pathname }: { label: string; tools: { name: string; href: string; icon: React.ReactNode }[]; pathname: string }) {
    return (
        <div className="mb-4">
            <p className="px-3 text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] mb-1">{label}</p>
            <nav className="space-y-0.5">
                {tools.map((tool) => {
                    const isActive = pathname === tool.href;
                    return (
                        <Link
                            key={tool.href}
                            href={tool.href}
                            className={`flex items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${isActive
                                ? "bg-[var(--primary)] text-white"
                                : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                                }`}
                        >
                            <span className={isActive ? "opacity-100" : "opacity-70"}>{tool.icon}</span>
                            {tool.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
