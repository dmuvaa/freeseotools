import Link from "next/link"
import { Book, Zap, HelpCircle, ArrowRight } from "lucide-react"

export const metadata = {
    title: "Documentation - BlitzGeo",
    description: "Learn how to use BlitzGeo to audit your brand's AI visibility. Getting started guides and help.",
}

export default function DocsPage() {
    const sections = [
        {
            icon: <Zap className="size-5" />,
            title: "Getting Started",
            description: "Learn the basics of BlitzGeo in 5 minutes",
            links: [
                { title: "Quick Start Guide", href: "#" },
                { title: "Creating Your First Project", href: "#" },
                { title: "Running Your First Audit", href: "#" },
                { title: "Understanding Results", href: "#" },
            ],
        },
        {
            icon: <Book className="size-5" />,
            title: "Core Concepts",
            description: "Understand the key features and metrics",
            links: [
                { title: "What is the Blitz Score?", href: "#" },
                { title: "AI Model Coverage Explained", href: "#" },
                { title: "The AI Index Graph", href: "#" },
                { title: "Citation Tracking", href: "#" },
            ],
        },
    ]

    return (
        <main>
            {/* Hero */}
            <section className="py-20">
                <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        Documentation
                    </h1>
                    <p className="text-lg md:text-xl text-[var(--text-muted)] mb-8">
                        Everything you need to master BlitzGeo and understand your brand's AI visibility.
                    </p>
                    <div className="max-w-md mx-auto">
                        <input
                            type="search"
                            placeholder="Search documentation..."
                            className="w-full px-4 py-3 rounded-full border border-[var(--border)] bg-[var(--surface-1)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                    </div>
                </div>
            </section>

            {/* Quick Start Banner */}
            <section className="pb-12">
                <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                    <div className="rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] p-6 md:p-8 text-white">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold mb-2">New to BlitzGeo?</h2>
                                <p className="text-white/80">
                                    Get up and running in under 5 minutes with our quick start guide.
                                </p>
                            </div>
                            <Link
                                href="#"
                                className="inline-flex items-center justify-center rounded-full bg-white text-[var(--primary)] px-6 py-3 font-medium hover:bg-white/90 transition-colors"
                            >
                                Quick Start Guide
                                <ArrowRight className="ml-2 size-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Docs Grid */}
            <section className="py-12">
                <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-8">
                        {sections.map((section, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface-1)]"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="size-10 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center text-[var(--primary)]">
                                        {section.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{section.title}</h3>
                                        <p className="text-sm text-[var(--text-muted)]">{section.description}</p>
                                    </div>
                                </div>
                                <ul className="space-y-2">
                                    {section.links.map((link, j) => (
                                        <li key={j}>
                                            <Link
                                                href={link.href}
                                                className="flex items-center gap-2 text-sm text-[var(--text-subtle)] hover:text-[var(--primary)] transition-colors py-1"
                                            >
                                                <span className="size-1.5 rounded-full bg-[var(--border)]" />
                                                {link.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Articles */}
            <section className="py-12 bg-[var(--surface-1)]">
                <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                    <h2 className="text-2xl font-bold mb-8">Popular Articles</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { title: "How to Improve Your Blitz Score", views: "2.4k views" },
                            { title: "Understanding the Index Graph", views: "1.8k views" },
                            { title: "AI Model Coverage Explained", views: "1.2k views" },
                            { title: "Interpreting Citation Sources", views: "1.1k views" },
                            { title: "Creating Effective Projects", views: "980 views" },
                            { title: "Troubleshooting Common Issues", views: "870 views" },
                        ].map((article, i) => (
                            <Link
                                key={i}
                                href="#"
                                className="p-4 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--border-hover)] transition-colors"
                            >
                                <h3 className="font-medium mb-1 hover:text-[var(--primary)]">{article.title}</h3>
                                <span className="text-sm text-[var(--text-muted)]">{article.views}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Help CTA */}
            <section className="py-20">
                <div className="container mx-auto px-4 md:px-6 text-center max-w-2xl">
                    <HelpCircle className="size-12 text-[var(--primary)] mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-4">Can't Find What You're Looking For?</h2>
                    <p className="text-[var(--text-muted)] mb-6">
                        Our support team is here to help. Reach out and we'll get back to you within 24 hours.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 py-3 font-medium transition-colors"
                    >
                        Contact Support
                    </Link>
                </div>
            </section>
        </main>
    )
}
