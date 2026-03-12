import { Metadata } from "next";
import Link from "next/link";
import MetaTagsAnalyzerClient from "./client";
import { MdFormatShapes, MdSearch, MdOutlineArrowForward, MdLabelOutline } from "react-icons/md";
import { BiFile, BiCodeBlock, BiShareAlt, BiShield } from "react-icons/bi";

export const metadata: Metadata = {
    title: "Free Meta Tags Analyzer | Audit Your On-Page SEO Essentials",
    description: "Our Meta Tags Analyzer provides a deep forensic audit of your page's metadata to ensure your site is communicating effectively with humans and algorithms.",
};

const relatedTools = [
    { name: "Title & Meta Length Checker", href: "/core-seo/title-meta-length", desc: "Preview tags in Google" },
    { name: "SERP Preview Tool", href: "/core-seo/serp-preview", desc: "Simulate search snippet" },
    { name: "Sitemap Analyzer", href: "/core-seo/sitemap-analyzer", desc: "Audit XML health" },
];

export default function MetaTagsAnalyzerPage() {
    return (
        <div className="bg-background min-h-screen">

            {/* Hero Section — X-Ray / Forensic Theme */}
            <section className="relative overflow-hidden bg-surface-2 border-b border-border py-12 md:py-20 text-center">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{
                    backgroundImage: "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
                    backgroundSize: "40px 40px"
                }} />

                <div className="relative container mx-auto max-w-4xl px-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-foreground">
                        Meta Tags Analyzer
                        <span className="block text-emerald-600 dark:text-emerald-400 mt-2 text-2xl md:text-4xl font-bold">Your Digital Storefront Audit</span>
                    </h1>
                    <p className="text-lg text-text-muted leading-relaxed max-w-2xl mb-10 mx-auto">
                        Our Meta Tags Analyzer provides a deep forensic audit of your page's metadata. Your tags are the first thing search bots read and users see in results.
                    </p>

                    <div className="bg-surface-1 rounded-2xl border border-border p-8 shadow-2xl w-full max-w-4xl mx-auto ring-4 ring-emerald-500/5 transition-all">
                        <MetaTagsAnalyzerClient />
                    </div>
                </div>
            </section>

            <div className="bg-background">
                {/* Meta Tags Analyzer: Audit Your On-Page SEO Essentials */}
                <section className="px-6 py-12 md:py-16 text-center container mx-auto max-w-4xl">
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-8 text-foreground leading-tight">
                        Why Meta Tags are the Foundation of High Rankings
                    </h2>
                    <p className="text-lg text-text-muted leading-relaxed mb-6">
                        Your meta tags are the digital storefront of your website. If your tags are missing, duplicated, or poorly written, you are essentially closing your doors to potential traffic.
                    </p>
                    <p className="text-lg text-text-muted leading-relaxed">
                        While Google's algorithms have become incredibly sophisticated, they still rely on these tags to understand the primary topic of your page. A well-optimized meta title and description do not just help you rank; they improve your Click-Through Rate (CTR) by persuading users to choose your link over the competition.
                    </p>
                </section>

                {/* Feature Grid */}
                <section className="px-6 py-16 bg-surface-2 border-y border-border">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { title: "Title Tags & CTR", icon: BiFile, body: "Our analyzer flags titles that are too long (causing truncation) or too short (missing keyword opportunities). Every pixel counts." },
                                { title: "Meta Description Logic", icon: BiCodeBlock, body: "A great description is your silent sales pitch. We check length and presence to ensure Google doesn't auto-generate a poor substitute." },
                                { title: "Social Graph Coverage", icon: BiShareAlt, body: "Missing OpenGraph or Twitter Card tags means social shares look broken. We audit every social tag for 100% professional coverage." },
                            ].map((f, i) => {
                                const Icon = f.icon;
                                return (
                                    <div key={i} className="bg-surface-1 p-8 rounded-3xl border border-border shadow-sm hover:border-emerald-500/50 transition-all group">
                                        <div className="size-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                                            <Icon className="text-3xl" />
                                        </div>
                                        <h4 className="font-bold text-xl mb-3 text-foreground">{f.title}</h4>
                                        <p className="text-text-muted text-sm leading-relaxed">{f.body}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="px-6 py-16 container mx-auto max-w-4xl">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="md:w-1/2">
                            <h3 className="text-3xl font-bold mb-6">How the Forensic Scan Works</h3>
                            <div className="space-y-6">
                                {[
                                    { step: "1", title: "HTML Fetching", desc: "Our system fetches the raw HTML of your page, bypassing client-side rendering issues to see exactly what bots see." },
                                    { step: "2", title: "Tag Extraction", desc: "We parse the <head> section to extract Title, Description, Canonical, Robots, Viewport, and all OG/Twitter tags." },
                                    { step: "3", title: "Status Validation", desc: "We apply pixel-width and character-count logic to flag warnings or errors based on current search engine standards." },
                                ].map((s, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="size-8 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0">{s.step}</div>
                                        <div>
                                            <h4 className="font-bold text-foreground mb-1">{s.title}</h4>
                                            <p className="text-text-muted text-sm leading-relaxed">{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="md:w-1/2 bg-surface-1 p-8 rounded-3xl border border-border shadow-lg relative">
                            <div className="absolute -top-4 -left-4 p-4 bg-emerald-600 rounded-2xl text-white shadow-xl">
                                <BiShield className="text-3xl" />
                            </div>
                            <h4 className="text-xl font-bold mb-4 mt-4">Canonical & Duplicate Protection</h4>
                            <p className="text-text-muted text-sm leading-relaxed">
                                Without a canonical tag, Google might index multiple versions of the same page (filtering, sorting, etc.), diluting your ranking power. Our free analyzer surfaces pages missing their canonical declaration before duplicate content penalties take hold of your site's performance.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Deep Dive Content */}
                <section className="px-6 py-16 bg-surface-2 border-y border-border">
                    <div className="container mx-auto max-w-5xl">
                        <div className="grid md:grid-cols-2 gap-12">
                            <div>
                                <h3 className="text-2xl font-bold mb-4 text-emerald-600 dark:text-emerald-400">Winning Title Tags</h3>
                                <p className="text-text-muted leading-relaxed text-sm">Google renders titles at around 600 pixels. Our analyzer flags anything outside that window so you can fix it before losing CTR to a competitor. A winning title front-loads your primary keyword and stays under 60 characters.</p>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-4 text-emerald-600 dark:text-emerald-400">The Description Sweet Spot</h3>
                                <p className="text-text-muted leading-relaxed text-sm">Between 150 and 160 characters is the goldilocks zone. Write in active voice, include a specific benefit, and close with a direct invitation to click. Our tool highlights exactly where your description falls on that spectrum.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="px-6 py-16 container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-center mb-16">Meta Tags Frequently Asked Questions</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { q: "What are Meta Tags?", a: "Meta tags are snippets of text that describe a page's content; they don't appear on the page itself, but only in the page's source code." },
                            { q: "Why is og:image important?", a: "When your URL is shared on social media, the og:image tag determines which picture appears in the preview card. No tag means no image, dramatically lowering engagement." },
                            { q: "Can I have multiple title tags?", a: "No. A page should have exactly one title tag. Having multiple can confuse search engines and lead to the wrong title being displayed in results." },
                            { q: "Do meta tags help with rankings?", a: "Yes. Titles are a direct ranking factor. Descriptions and social tags improve CTR, which is a strong behavioral signal for relevance." },
                        ].map((faq, i) => (
                            <div key={i} className="flex gap-4 group">
                                <MdLabelOutline className="text-emerald-500 text-2xl mt-1 shrink-0 group-hover:scale-110 transition-transform" />
                                <div>
                                    <h3 className="font-bold text-foreground mb-2">{faq.q}</h3>
                                    <p className="text-text-muted text-sm leading-relaxed">{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Related Tools */}
                <section className="bg-surface-2 px-6 py-12 border-t border-border">
                    <div className="max-w-5xl mx-auto">
                        <h3 className="text-lg font-bold mb-6">Continue Your SEO Audit</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {relatedTools.map(t => (
                                <Link key={t.href} href={t.href} className="group block p-5 rounded-xl border border-border bg-surface-1 hover:border-emerald-500/50 hover:shadow-md transition-all duration-200">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-semibold group-hover:text-emerald-600 transition-colors text-sm">{t.name}</p>
                                        <MdOutlineArrowForward className="size-4 text-text-subtle group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />
                                    </div>
                                    <p className="text-xs text-text-muted">{t.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
