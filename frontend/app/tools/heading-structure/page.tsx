import { Metadata } from "next";
import Link from "next/link";
import HeadingStructureClient from "./client";

export const metadata: Metadata = {
    title: "Free Heading Structure Analyzer | Audit H1–H6 Tags for SEO",
    description: "Free Heading Structure Analyzer: Visualize your H1–H6 hierarchy, detect missing H1 tags, skipped heading levels, and accessibility issues on any webpage.",
};

const relatedTools = [
    { name: "Free Meta Tags Analyzer", href: "/tools/meta-tags-analyzer", desc: "Audit title and description tags alongside headings" },
    { name: "Free Broken Link Checker", href: "/tools/broken-link-checker", desc: "Scan this same page for dead outbound links" },
    { name: "Free SERP Preview Tool", href: "/tools/serp-preview", desc: "Preview how this page looks in Google search" },
];

export default function HeadingStructurePage() {
    return (
        <>
            <HeadingStructureClient />

            <div className="border-t border-[var(--border)] mt-4">

                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-600 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free Heading Structure Analyzer</h2>
                        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
                            Search engines use your heading tags to build a mental model of your content. A broken hierarchy confuses algorithms and blinds screen readers. Our free tool rebuilds your heading tree visually so you can fix structure issues before they cost you rankings.
                        </p>
                    </div>
                </section>

                {/* Heading Level Cards */}
                <section className="px-6 py-14 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-10">The Free SEO Hierarchy Guide: H1 Through H6</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { tag: "H1", role: "Page Title", weight: "Highest", color: "bg-blue-500", text: "text-blue-500", border: "border-blue-500/30", bg: "bg-blue-500/10" },
                            { tag: "H2", role: "Main Sections", weight: "Very High", color: "bg-purple-500", text: "text-purple-500", border: "border-purple-500/30", bg: "bg-purple-500/10" },
                            { tag: "H3", role: "Subsections", weight: "High", color: "bg-green-500", text: "text-green-500", border: "border-green-500/30", bg: "bg-green-500/10" },
                            { tag: "H4", role: "Sub-Points", weight: "Medium", color: "bg-yellow-500", text: "text-yellow-600", border: "border-yellow-500/30", bg: "bg-yellow-500/10" },
                            { tag: "H5", role: "Detail", weight: "Low", color: "bg-orange-500", text: "text-orange-500", border: "border-orange-500/30", bg: "bg-orange-500/10" },
                            { tag: "H6", role: "Minor", weight: "Lowest", color: "bg-red-500", text: "text-red-500", border: "border-red-500/30", bg: "bg-red-500/10" },
                        ].map(h => (
                            <div key={h.tag} className={`rounded-xl border ${h.border} ${h.bg} p-4 text-center flex flex-col gap-1`}>
                                <div className={`font-extrabold font-mono text-2xl ${h.text}`}>{h.tag}</div>
                                <div className="text-xs font-semibold">{h.role}</div>
                                <div className="text-[10px] text-[var(--text-muted)]">SEO Weight: {h.weight}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-[var(--surface-1)] px-6 py-14">
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-2xl font-bold mb-10 text-center">How the Free Heading Structure Analyzer Works</h3>
                        <ol className="space-y-6">
                            {[
                                { step: "1", title: "Paste Your URL", body: "Enter any webpage URL. Our server fetches the full HTML of the live page — not a cached snapshot — and runs it through a structured parser designed to extract semantic HTML elements." },
                                { step: "2", title: "Full Heading Extraction", body: "Every H1 through H6 tag on the page is extracted in document order, including their full text content with normalized whitespace. Decorative UI elements using heading tags for visual sizing (a common mistake) will be exposed here." },
                                { step: "3", title: "Hierarchy Tree Visualization", body: "Headings are rendered as a visual tree with indentation matching their nesting level, color-coded by tag type. A glance reveals whether your outline flows logically — or skips levels awkwardly." },
                                { step: "4", title: "Automated SEO Warnings", body: "We apply SEO best-practice rules: flag any page with zero or multiple H1 tags, alert when heading levels are skipped (e.g., H2 jumping to H4), and count distribution across all six levels." },
                            ].map(s => (
                                <li key={s.step} className="flex gap-5 items-start">
                                    <div className="size-9 rounded-full bg-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0">{s.step}</div>
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
                        <h3 className="text-2xl font-bold mb-3">The H1 Rule: One Per Page, No Exceptions</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Despite HTML5 technically permitting multiple H1 tags inside distinct sectioning elements, SEO best practice established by Google's own guidance is unambiguous: one H1 per page. This single tag should contain your primary keyword and accurately describe the page's single, dominant topic. A second H1 forces a search engine to choose between competing topics. Multiple H1s are also a strong signal that a theme or plugin is misbehaving and injecting heading tags into sidebars or footers.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-2xl font-bold mb-3">Featured Snippets and Heading Optimization</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Structured heading hierarchies are one of Google's primary signals for extracting Featured Snippets. "How-to" content structured with H2s as steps, followed by concise paragraphs, is routinely pulled into position zero. Q&A content structured with H3s as questions and immediate paragraph answers triggers FAQ rich results. Our free analyzer lets you verify that your structure matches what Google's extraction algorithms prefer.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-2xl font-bold mb-3">Heading Tags vs. CSS Styling: A Critical Distinction</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">The single biggest heading mistake developers make is using H2 or H3 tags for visual styling purposes — placing a widget title inside an H2 because it "looks better." Every page on your site then inherits "Newsletter Signup" as an H2, confusing Googlebot's topical model for literally every URL. Always use CSS classes for visual sizing of non-content elements, and reserve semantic heading tags exclusively for the logical structure of your written content.</p>
                    </div>
                </section>

                <section className="bg-[var(--surface-1)] px-6 py-12">
                    <div className="max-w-5xl mx-auto">
                        <h3 className="text-xl font-bold mb-6">Pair With These Free On-Page SEO Tools</h3>
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
