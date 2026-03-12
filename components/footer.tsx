import Link from "next/link"
import { Search } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t border-[var(--border)] py-12 bg-[var(--surface-1)]">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 font-bold mb-4">
                            <div className="size-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center">
                                <Search className="size-5" />
                            </div>
                            <span>Free SEO Tools</span>
                        </Link>
                        <p className="text-sm text-[var(--text-muted)] max-w-xs leading-relaxed">
                            The ultimate technical SEO suite. Audit, preview, and optimize your pages instantly.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4 text-sm">Tools</h3>
                        <ul className="space-y-2.5">
                            <li><Link href="/#core-seo" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">Core SEO</Link></li>
                            <li><Link href="/#advanced" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">Advanced Analysis</Link></li>
                            <li><Link href="/#lighthouse" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">Lighthouse Suite</Link></li>
                            <li><Link href="/#technical" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">Technical Audits</Link></li>
                            <li><Link href="/#speed" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">Speed Optimization</Link></li>
                            <li><Link href="/#diagnostics" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">Diagnostics</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4 text-sm">Resources</h3>
                        <ul className="space-y-2.5">
                            <li><Link href="/about" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">About Us</Link></li>
                            <li><Link href="/docs" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">Documentation</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4 text-sm">Legal</h3>
                        <ul className="space-y-2.5">
                            <li><Link href="/privacy" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-[var(--text-subtle)]">
                        © {new Date().getFullYear()} Free SEO Tools. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
