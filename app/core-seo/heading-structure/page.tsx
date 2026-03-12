import { Metadata } from "next";
import Link from "next/link";
import HeadingStructureClient from "./client";
import {
    HiOutlineRectangleGroup, HiOutlineMagnifyingGlass,
    HiOutlineExclamationCircle, HiOutlineCheckCircle, HiOutlineEye,
    HiOutlineLightBulb, HiOutlineQuestionMarkCircle, HiOutlineArrowRight,
    HiOutlineCodeBracket
} from "react-icons/hi2";

export const metadata: Metadata = {
    title: "Heading Structure Analyzer | Free Content Hierarchy Audit",
    description: "Get a structural map of your page to ensure your content is logically organized with proper H1-H6 hierarchy.",
};

const headingLevels = [
    { tag: "H1", px: "100%", label: "Page Topic (Only 1 allowed)", color: "from-emerald-500 to-teal-600", width: "w-full" },
    { tag: "H2", px: "85%", label: "Major Section Headings", color: "from-teal-500 to-cyan-500", width: "w-10/12" },
    { tag: "H3", px: "70%", label: "Sub-sections under H2", color: "from-cyan-500 to-blue-500", width: "w-8/12" },
    { tag: "H4", px: "55%", label: "Detailed sub-points", color: "from-blue-400 to-indigo-500", width: "w-6/12" },
    { tag: "H5", px: "40%", label: "Supporting detail (use sparingly)", color: "from-indigo-400 to-purple-500", width: "w-4/12" },
    { tag: "H6", px: "25%", label: "Rarely used — deepest level", color: "from-purple-400 to-pink-500", width: "w-3/12" },
];

const features = [
    { icon: HiOutlineRectangleGroup, title: "Visual Hierarchy Tree", desc: "See a \"Table of Contents\" style view of your entire page at a glance.", color: "emerald" },
    { icon: HiOutlineEye, title: "Accessibility Flagging", desc: "We identify structure issues that would confuse screen readers for visually impaired users.", color: "teal" },
    { icon: HiOutlineMagnifyingGlass, title: "Keyword Relevance Mapping", desc: "Our tool shows you which keywords are being emphasized in your headings.", color: "cyan" },
    { icon: HiOutlineCodeBracket, title: "Semantic Analysis", desc: "We verify if your headings are being used for structure rather than just for styling.", color: "blue" },
];

const checks = [
    { status: "critical", title: "H1 Presence and Count", desc: "We verify that there is exactly one H1 tag on the page. Missing or multiple H1s are flagged as critical errors." },
    { status: "critical", title: "Logical Sequencing", desc: "We ensure that an H2 follows an H1, and an H3 follows an H2. Skipping levels is a sign of poor structure." },
    { status: "warning", title: "Heading Length", desc: "We check if headings are too long, which can dilute their topical focus." },
    { status: "warning", title: "Duplicate Headings", desc: "Our scanner finds identical headings on the same page, which can be a sign of redundant content." },
    { status: "info", title: "Empty Headings", desc: "We flag tags that contain no text, which often happens due to coding errors." },
];

const faqs = [
    {
        q: "Can I use more than one H1 tag?",
        a: "While HTML5 allows for multiple H1 tags, SEO best practices still recommend using only one per page. This ensures that search engines have a clear understanding of the page's primary topic."
    },
    {
        q: "Do headings really help my rankings?",
        a: "Yes. Headings provide context. Including your keywords in H1 and H2 tags helps search engines confirm that your page is relevant to a specific search query."
    },
    {
        q: "Should I use headings for styling my text?",
        a: "No. You should use CSS to style your text. Heading tags should only be used to define the logical structure and hierarchy of your content."
    },
    {
        q: "What is the difference between an H1 and a Title Tag?",
        a: "The H1 tag is visible on the page and defines the main topic of the content. The title tag is visible in the browser tab and the SERPs, and it acts as the page's search listing title. Both should be unique and optimized."
    },
    {
        q: "How does heading structure affect Featured Snippets?",
        a: "Google often pulls content for Featured Snippets from sections clearly defined by H2 and H3 tags. Proper structure signals to Google that your content is organized and answers specific questions."
    },
    {
        q: "How often should I use H2 and H3 tags?",
        a: "Use H2 tags to introduce major new sections and H3 tags to introduce sub-points or details under the H2. The frequency depends entirely on the length and complexity of your content."
    },
];

const relatedTools = [
    { name: "Broken Links Scanner", href: "/core-seo/broken-link-checker", desc: "Find and fix dead-end URLs" },
    { name: "Meta Tags Analyzer", href: "/core-seo/meta-tags-analyzer", desc: "Audit your on-page SEO essentials" },
    { name: "SERP Preview Tool", href: "/core-seo/serp-preview", desc: "Simulate your Google appearance" },
];

export default function HeadingStructurePage() {
    return (
        <div className="bg-background min-h-screen">

            {/* Hero — Green Hierarchical Aesthetic */}
            <section className="relative overflow-hidden bg-surface-2 border-b border-border py-12 md:py-20 text-center">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, var(--primary) 39px, var(--primary) 40px)`,
                    backgroundSize: '100% 40px'
                }} />

                <div className="relative container mx-auto max-w-4xl px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-8 text-foreground">
                        Heading Structure
                        <span className="block text-emerald-600 dark:text-emerald-400 mt-2 text-2xl md:text-4xl font-bold">Audit Content Hierarchy</span>
                    </h1>
                    <p className="text-lg text-text-muted leading-relaxed max-w-2xl mx-auto mb-10 text-center">
                        Search engines use heading tags to understand the topical architecture of your page. Our auditor provides a visual map to ensure your content is logically organized.
                    </p>

                    <div className="bg-surface-1 rounded-2xl border border-border p-8 shadow-2xl w-full max-w-4xl mx-auto ring-4 ring-emerald-500/5 transition-all">
                        <HeadingStructureClient />
                    </div>
                </div>
            </section>

            <div className="bg-background">
                {/* How it Works */}
                <section className="px-6 py-12 md:py-16 container mx-auto max-w-4xl">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6 text-center leading-tight">Architecture Inspection Engine</h2>
                    <p className="text-text-muted text-center leading-relaxed mb-16 max-w-2xl mx-auto text-lg">
                        Our tool parses the HTML source code of your page to extract every tag from H1 to H6 in the order they appear to detect structural flaws.
                    </p>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { title: "Spectral Parsing", desc: "We extract every heading tag from H1 to H6 in the exact order they appear in your page's source code." },
                            { title: "Hierarchy Mapping", desc: "It then builds a nested tree structure that visualizes the relationship between different sections." },
                            { title: "Sequence Validation", desc: "The tool looks for skipping levels (jumping from H1 to H3) which is a major accessibility violation." },
                            { title: "Semantic Signaling", desc: "We analyze heading text to ensure it provides strong topical signals to search engines." },
                        ].map((step, i) => (
                            <div key={step.title} className="flex gap-6 p-8 rounded-3xl border border-border bg-surface-1 hover:border-emerald-500/50 transition-all group overflow-hidden relative">
                                <div className="absolute -right-4 -bottom-4 text-7xl font-black text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors">
                                    0{i + 1}
                                </div>
                                <div className="shrink-0 w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-emerald-500/20">
                                    {i + 1}
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground mb-2 text-lg">{step.title}</h3>
                                    <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Core Features */}
                <section className="px-6 py-16 bg-surface-2 border-y border-border">
                    <div className="container mx-auto max-w-6xl text-center">
                        <h2 className="text-3xl md:text-4xl font-black text-foreground mb-16 uppercase tracking-widest">Key Performance Indicators</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((f) => {
                                const Icon = f.icon;
                                return (
                                    <div key={f.title} className="bg-surface-1 rounded-[2rem] border border-border p-8 hover:shadow-2xl hover:border-emerald-500/50 transition-all group text-left">
                                        <div className="w-16 h-16 rounded-3xl border flex items-center justify-center text-3xl mb-8 group-hover:rotate-6 transition-transform bg-emerald-500/10 text-emerald-600 border-emerald-500/10">
                                            <Icon />
                                        </div>
                                        <h3 className="font-bold text-foreground mb-3 text-lg">{f.title}</h3>
                                        <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Audit Checks */}
                <section className="px-6 py-16 container mx-auto max-w-5xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-16">The Structure Audit Log</h2>
                    <div className="space-y-4">
                        {checks.map((c) => (
                            <div key={c.title} className="flex items-start gap-6 p-8 rounded-[2rem] border border-border bg-surface-1 hover:border-emerald-500/50 transition-all group shadow-sm">
                                {c.status === "critical" ? (
                                    <HiOutlineExclamationCircle className="text-3xl font-black text-rose-500 shrink-0 mt-1" />
                                ) : c.status === "warning" ? (
                                    <HiOutlineExclamationCircle className="text-3xl font-black text-amber-500 shrink-0 mt-1" />
                                ) : (
                                    <HiOutlineCheckCircle className="text-3xl font-black text-emerald-500 shrink-0 mt-1" />
                                )}
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                        <h3 className="font-bold text-xl text-foreground mb-0">{c.title}</h3>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit ${c.status === "critical" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : c.status === "warning" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"}`}>
                                            {c.status} Impact
                                        </span>
                                    </div>
                                    <p className="text-text-muted leading-relaxed text-sm lg:text-base">{c.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Why it Matters */}
                <section className="px-6 py-16 bg-surface-2 border-y border-border relative overflow-hidden">
                    <div className="container mx-auto max-w-4xl text-center relative z-10">
                        <HiOutlineLightBulb className="text-7xl text-emerald-600 dark:text-emerald-400 mx-auto mb-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                        <h2 className="text-3xl md:text-5xl font-black mb-8 text-foreground uppercase tracking-tighter">The Semantic Imperative</h2>
                        <p className="text-xl text-text-muted leading-relaxed mb-8 max-w-3xl mx-auto font-medium">
                            Logical heading structure is not just an organizational best practice; it's a semantic necessity. It functions as an explicit blueprint for search engines and assistive technology.
                        </p>
                        <p className="text-text-subtle leading-relaxed max-w-3xl mx-auto italic font-bold">
                            By maintaining a strict hierarchy, you signal to Google that your content is professionally researched, accessible to all users, and contextually rich—the primary ingredients for high-trust rankings.
                        </p>
                    </div>
                </section>

                {/* FAQ */}
                <section className="px-6 py-16 container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-black text-foreground text-center mb-16 uppercase tracking-widest">Structural FAQ</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {faqs.map((f) => (
                            <div key={f.q} className="p-8 rounded-[2rem] border border-border bg-surface-2 hover:bg-surface-1 hover:border-emerald-500/50 transition-all group">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="shrink-0 size-8 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                                        <HiOutlineQuestionMarkCircle className="text-emerald-500 group-hover:text-white text-xl" />
                                    </div>
                                    <h3 className="font-bold text-foreground text-lg leading-tight">{f.q}</h3>
                                </div>
                                <p className="text-text-muted text-sm leading-relaxed pl-12">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Related Tools */}
                <section className="px-6 py-12 bg-surface-2 border-t border-border">
                    <div className="container mx-auto max-w-5xl">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground-muted mb-8 text-center">Related Technical Tools</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            {relatedTools.map((t) => (
                                <Link key={t.href} href={t.href} className="group flex items-center justify-between p-6 rounded-2xl border border-border bg-surface-1 hover:border-emerald-500 hover:shadow-xl transition-all">
                                    <div>
                                        <p className="font-bold text-foreground group-hover:text-emerald-600 transition-colors text-sm mb-1">{t.name}</p>
                                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">{t.desc}</p>
                                    </div>
                                    <HiOutlineArrowRight className="text-text-subtle group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0 text-xl" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
