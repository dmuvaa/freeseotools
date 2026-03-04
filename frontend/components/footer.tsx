import Link from "next/link"

export function Footer() {
    return (
        <footer className="border-t border-[var(--border)] py-12 bg-[var(--surface-1)]">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6 mb-8">
                    <div>
                        <h3 className="font-semibold mb-3 text-sm">Product</h3>
                        <ul className="space-y-2">
                            <li><Link href="/features" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Features</Link></li>
                            <li><Link href="/pricing" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Pricing</Link></li>
                            <li><Link href="/dashboard" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Dashboard</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3 text-sm">Free SEO Tools</h3>
                        <ul className="space-y-1.5">
                            <li><Link href="/tools/meta-tags-analyzer" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Meta Tags Analyzer</Link></li>
                            <li><Link href="/tools/robots-txt-tester" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Robots.txt Tester</Link></li>
                            <li><Link href="/tools/sitemap-analyzer" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Sitemap Analyzer</Link></li>
                            <li><Link href="/tools/redirect-checker" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Redirect Checker</Link></li>
                            <li><Link href="/tools/http-headers-checker" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">HTTP Headers</Link></li>
                            <li><Link href="/tools/title-meta-length" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Title & Meta Length</Link></li>
                            <li><Link href="/tools/heading-structure" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Heading Structure</Link></li>
                            <li><Link href="/tools/broken-link-checker" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Broken Link Checker</Link></li>
                            <li><Link href="/tools/serp-preview" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">SERP Preview</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3 text-sm">Advanced Tools</h3>
                        <ul className="space-y-1.5">
                            <li><Link href="/tools/internal-link-audit" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Internal Link Audit</Link></li>
                            <li><Link href="/tools/crawl-budget-simulator" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Crawl Budget Simulator</Link></li>
                            <li><Link href="/tools/indexability-checker" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Indexability Checker</Link></li>
                            <li><Link href="/tools/anchor-text-analyzer" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Anchor Text Analyzer</Link></li>
                            <li><Link href="/tools/thin-content-detector" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Thin Content Detector</Link></li>
                            <li><Link href="/tools/keyword-cannibalization" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Keyword Cannibalization</Link></li>
                            <li><Link href="/tools/log-file-analyzer" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Log File Analyzer</Link></li>
                            <li><Link href="/tools/core-web-vitals" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">CWV Comparator</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3 text-sm">Lighthouse Suite</h3>
                        <ul className="space-y-1.5">
                            <li><Link href="/tools/lighthouse-mobile" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Mobile Lighthouse</Link></li>
                            <li><Link href="/tools/lighthouse-desktop" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Desktop Lighthouse</Link></li>
                            <li><Link href="/tools/lighthouse-js-rendering" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">JS Rendering</Link></li>
                            <li><Link href="/tools/lighthouse-cwv" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Core Web Vitals</Link></li>
                            <li><Link href="/tools/lighthouse-seo" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">SEO Lighthouse</Link></li>
                            <li><Link href="/tools/lighthouse-accessibility" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Accessibility</Link></li>
                            <li><Link href="/tools/lighthouse-tracker" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Performance Tracker</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3 text-sm">Resources</h3>
                        <ul className="space-y-1.5">
                            <li><Link href="/schema-checker" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Schema Checker</Link></li>
                            <li><Link href="/docs" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Documentation</Link></li>
                            <li><Link href="/blog" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Blog</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3 text-sm">Company</h3>
                        <ul className="space-y-1.5">
                            <li><Link href="/about" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">About</Link></li>
                            <li><Link href="/contact" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3 text-sm">Legal</h3>
                        <ul className="space-y-1.5">
                            <li><Link href="/privacy" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Privacy</Link></li>
                            <li><Link href="/terms" className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">Terms</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="size-6 rounded-md bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold text-xs">
                            B
                        </div>
                        <span className="text-sm text-[var(--text-muted)]">© 2026 BlitzGeo. All rights reserved.</span>
                    </div>
                    <div className="flex gap-4">
                        <a href="https://twitter.com/blitzgeo" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[var(--foreground)]">
                            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </a>
                        <a href="https://linkedin.com/company/blitzgeo" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[var(--foreground)]">
                            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
