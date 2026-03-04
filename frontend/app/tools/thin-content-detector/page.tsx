import { Metadata } from "next";
import Link from "next/link";
import ThinContentClient from "./client";

export const metadata: Metadata = {
    title: "Free Thin Content Checker | Detect Low-Value Pages Hurting SEO",
    description: "Free Thin Content Checker: Analyze any URL for word count, content-to-code ratio, duplicate sections, and heading structure. Get a content quality score and fix recommendations.",
};

export default function ThinContentPage() {
    return (
        <>
            <ThinContentClient />
            <div className="border-t border-[var(--border)] mt-4">
                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free Thin Content Checker</h2>
                        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">Google's Panda algorithm targets low-value content. Our free checker analyzes five content quality signals and returns a score from 0 to 100 — giving you a prioritized list of pages to improve before they drag down your entire domain's rankings.</p>
                    </div>
                </section>
                <section className="px-6 py-12 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-8">Five Content Quality Signals We Check</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {[
                            { num: "1", label: "Word Count", threshold: "600+ words", desc: "Pages under 300 words rarely rank for competitive queries. Google favors comprehensive, authoritative coverage of topics." },
                            { num: "2", label: "Text-to-HTML", threshold: "15%+ ratio", desc: "A very low content-to-code ratio suggests a bloated template with minimal actual content — a classic thin content signal." },
                            { num: "3", label: "Duplicate Sections", threshold: "0 duplicates", desc: "Repeated boilerplate paragraphs (newsletter blocks, footer text included in body, syndicated intros) are detected and flagged." },
                            { num: "4", label: "Heading Structure", threshold: ">0 H tags", desc: "Pages without heading tags lack semantic organization, making it harder for Googlebot to understand the content hierarchy." },
                            { num: "5", label: "Words Per Section", threshold: "<400 per H tag", desc: "Very long unsectioned blocks of text signal poor content organization. We calculate average words per heading tag." },
                        ].map(s => (
                            <div key={s.num} className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-center">
                                <div className="size-8 rounded-full bg-[var(--primary)] text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">{s.num}</div>
                                <div className="font-semibold text-sm mb-1">{s.label}</div>
                                <div className="text-xs font-mono text-[var(--primary)] mb-2">{s.threshold}</div>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="bg-[var(--surface-1)] px-6 py-12">
                    <div className="max-w-4xl mx-auto space-y-5">
                        <h3 className="text-2xl font-bold">Thin Content vs Low-Value Content: What Google Actually Penalizes</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Thin content is not just about word count. A 2,000-word page filled with repetitive filler, scraped boilerplate, and keyword stuffing can qualify as thin. Google's quality raters assess Expertise, Authoritativeness, and Trustworthiness — EAT. Our content score is a proxy for these signals, identifying content that is likely to fail quality review. Pair this with our <Link href="/tools/keyword-cannibalization" className="text-[var(--primary)] hover:underline font-medium">Free Keyword Cannibalization Checker</Link> to identify pages competing against each other so you can consolidate them into a single authoritative resource instead.</p>
                    </div>
                </section>
                <section className="px-6 py-10 max-w-5xl mx-auto">
                    <h3 className="text-lg font-bold mb-4">Free Content Quality Tools</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: "Free Keyword Cannibalization Checker", href: "/tools/keyword-cannibalization", desc: "Compare similar pages for overlap" },
                            { name: "Free Heading Structure Analyzer", href: "/tools/heading-structure", desc: "Audit H1–H6 content hierarchy" },
                            { name: "Free Meta Tags Analyzer", href: "/tools/meta-tags-analyzer", desc: "Check on-page SEO signals" },
                        ].map(t => (
                            <Link key={t.href} href={t.href} className="group block p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--primary)] hover:shadow-md transition-all">
                                <p className="font-semibold text-sm group-hover:text-[var(--primary)] transition-colors mb-1">{t.name}</p>
                                <p className="text-xs text-[var(--text-muted)]">{t.desc}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
