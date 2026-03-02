import Link from "next/link"
import { Clock } from "lucide-react"

export const metadata = {
    title: "Blog - BlitzGeo",
    description: "Insights on AI visibility, brand monitoring, and the future of AI-powered search.",
}

export default function BlogPage() {
    const posts = [
        {
            title: "Why AI Visibility is the New SEO",
            excerpt: "As ChatGPT and Gemini become the new front doors to the internet, traditional SEO isn't enough. Learn why brands need to optimize for AI visibility.",
            date: "Jan 5, 2026",
            readTime: "5 min read",
            category: "AI Visibility",
        },
        {
            title: "Understanding the Blitz Score",
            excerpt: "What makes up your Blitz Score and how to interpret it. We break down the metrics behind our AI visibility scoring system.",
            date: "Jan 3, 2026",
            readTime: "8 min read",
            category: "Product",
        },
        {
            title: "How the AI Index Graph Works",
            excerpt: "A look at how BlitzGeo maps which sources influence AI model responses about your brand.",
            date: "Dec 28, 2025",
            readTime: "6 min read",
            category: "Product",
        },
        {
            title: "GPT-5 vs Gemini vs Claude: Which AI Matters Most?",
            excerpt: "A comparison of major AI models and their market share. Which ones should you prioritize for brand visibility?",
            date: "Dec 15, 2025",
            readTime: "6 min read",
            category: "AI Visibility",
        },
    ]

    return (
        <main>
            {/* Hero */}
            <section className="py-20">
                <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        BlitzGeo Blog
                    </h1>
                    <p className="text-lg md:text-xl text-[var(--text-muted)]">
                        Insights on AI visibility and navigating the new era of AI-powered search.
                    </p>
                </div>
            </section>

            {/* Posts Grid */}
            <section className="py-12">
                <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-8">
                        {posts.map((post, i) => (
                            <article
                                key={i}
                                className="group p-6 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--border-hover)] transition-colors"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-[var(--primary-muted)] text-[var(--primary)]">
                                        {post.category}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold mb-2 group-hover:text-[var(--primary)] transition-colors">
                                    {post.title}
                                </h2>
                                <p className="text-[var(--text-muted)] mb-4 line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between text-sm text-[var(--text-subtle)]">
                                    <span>{post.date}</span>
                                    <div className="flex items-center gap-1">
                                        <Clock className="size-4" />
                                        <span>{post.readTime}</span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="py-20 bg-[var(--surface-1)]">
                <div className="container mx-auto px-4 md:px-6 text-center max-w-2xl">
                    <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
                    <p className="text-[var(--text-muted)] mb-6">
                        Get weekly insights on AI visibility and product updates.
                    </p>
                    <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-4 py-3 rounded-full border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium transition-colors"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>
        </main>
    )
}
