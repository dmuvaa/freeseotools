import { Metadata } from "next";
import Link from "next/link";
import TitleMetaLengthCheckerClient from "./client";
import {
    MdOutlineFormatSize, MdOutlineVisibility, MdOutlineSpeed, MdOutlineSpellcheck,
    MdOutlineCheckCircle, MdOutlinePriorityHigh, MdOutlineArrowForward
} from "react-icons/md";
import { BiRuler, BiSelection, BiTerminal, BiPulse } from "react-icons/bi";

export const metadata: Metadata = {
    title: "Title & Meta Length Validator | Pixel-Perfect SERP Checker",
    description: "Ensure your meta titles and descriptions are the perfect length for Google. Avoid truncation and optimize for CTR with our pixel-width validator.",
};

const valueProps = [
    {
        icon: BiRuler,
        title: "Pixel-Width Accuracy",
        desc: "Google doesn't just count characters; it counts pixels. We use precise width simulation to ensure your tags fit within the 600px desktop and 550px mobile limits.",
    },
    {
        icon: BiSelection,
        title: "Visual Truncation Check",
        desc: "See exactly where the dreaded ellipses (...) will appear if your meta data is too long, allowing you to move your key message to the front.",
    },
    {
        icon: BiTerminal,
        title: "Direct URL Import",
        desc: "Don't waste time copying and pasting. Simply enter your URL and we'll pull your existing tags directly into the editor for instant validation.",
    },
    {
        icon: BiPulse,
        title: "Real-Time Scoring",
        desc: "As you type, our engine updates your status. No guesswork—just clear green and red indicators based on current search engine standards.",
    },
];

const relatedTools = [
    { name: "SERP Preview Tool", href: "/core-seo/serp-preview", desc: "Simulate rich snippets" },
    { name: "Meta Tags Analyzer", href: "/core-seo/meta-tags-analyzer", desc: "Audit on-page SEO health" },
    { name: "Sitemap Analyzer", href: "/core-seo/sitemap-analyzer", desc: "Optimize your crawl roadmap" },
];

export default function TitleMetaLengthPage() {
    return (
        <div className="bg-background min-h-screen">

            {/* Hero / Header Section — The Precision Lab Theme */}
            <section className="relative overflow-hidden bg-surface-2 border-b border-border py-12 md:py-20 text-center">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{
                    backgroundImage: "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
                    backgroundSize: "60px 60px"
                }} />

                <div className="relative container mx-auto max-w-4xl px-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-foreground">
                        Title & Meta Validator
                        <span className="block text-violet-600 dark:text-violet-400 mt-2 text-2xl md:text-4xl font-bold">Don't Get Cut Off. Get Clicks.</span>
                    </h1>
                    <p className="text-lg text-text-muted leading-relaxed max-w-2xl mb-10 mx-auto">
                        Ensure your meta titles and descriptions are the perfect length for Google. Avoid truncation and optimize for CTR with our pixel-width validator.
                    </p>

                    <div className="bg-surface-1 rounded-2xl border border-border p-8 shadow-2xl w-full max-w-4xl mx-auto ring-4 ring-violet-500/5 transition-all">
                        <TitleMetaLengthCheckerClient />
                    </div>
                </div>
            </section>

            <div className="bg-background">
                {/* Why it Matters — Character vs Pixel Precision */}
                <section className="px-6 py-12 md:py-16 container mx-auto max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="size-20 rounded-3xl bg-violet-600 text-white flex items-center justify-center mb-8 shadow-xl shadow-violet-500/20">
                                <MdOutlineVisibility className="size-10" />
                            </div>
                            <h2 className="text-4xl font-bold mb-6 text-foreground leading-tight">Pixel-Level Strategy for Maximum CTR</h2>
                            <p className="text-lg text-text-muted leading-relaxed mb-6">
                                Most SEO tools only count characters, but Google renders text using a proportional font (Arial/Roboto). This means a wide character like 'W' takes up much more space than a narrow one like 'i'.
                            </p>
                            <p className="text-lg text-text-muted leading-relaxed">
                                Our validator uses a pixel-emulation engine to show you what Google truly sees. If your title is 'perfect' at 58 characters but uses many wide capital letters, it might still get cut off. We eliminate that risk.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            {valueProps.map((p, i) => {
                                const Icon = p.icon;
                                return (
                                    <div key={i} className="bg-surface-1 p-6 rounded-2xl border border-border group hover:border-violet-500/50 transition-all">
                                        <div className="flex gap-4">
                                            <div className="size-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 flex items-center justify-center shrink-0">
                                                <Icon className="text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold mb-1 text-foreground">{p.title}</h3>
                                                <p className="text-xs text-text-muted leading-relaxed">{p.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* The Truncation Penalty */}
                <section className="px-6 py-16 bg-surface-2 border-y border-border">
                    <div className="container mx-auto max-w-4xl text-center">
                        <MdOutlinePriorityHigh className="size-16 text-violet-500 mx-auto mb-6" />
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-8 text-foreground leading-tight">The Truncation Penalty</h2>
                        <p className="text-lg text-text-muted leading-relaxed mb-10">
                            When your meta data is cut off, you lose more than just a few characters. You lose your Call to Action (CTA), your secondary keywords, and your professional polish. Truncated snippets signal to users that your brand isn't paying attention to the details.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            {[
                                "No Truncated CTAs", "Balanced Pixel Load", "Mobile Responsive Tags", "Keyword Prioritization"
                            ].map((tag, i) => (
                                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-surface-1 border border-border rounded-full text-sm font-bold text-foreground">
                                    <MdOutlineCheckCircle className="text-emerald-500" />
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="px-6 py-16 container mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <MdOutlineSpellcheck className="size-12 text-violet-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-4">Precision Length FAQ</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-10">
                        {[
                            { q: "What is the character limit for meta titles?", a: "Technically, Google allows up to 600 pixels. Usually, this equates to 50–60 characters. Anything more is likely to be cut off." },
                            { q: "How long should meta descriptions be?", a: "Aim for 120-160 characters (approx 920 pixels on desktop). This ensures your full message is displayed in most search scenarios." },
                            { q: "Why is pixel width more important than character count?", a: "Because search engines use fixed-width containers to display results. Capital letters (W, M) and bold text occupy more pixel space than lowercase letters (i, l)." },
                            { q: "Does the title length affect my ranking?", a: "While length itself isn't a direct ranking factor, a truncated title can lower your CTR, which is a significant behavioral signal for Google." },
                        ].map((faq, i) => (
                            <div key={i} className="group">
                                <h3 className="font-bold text-lg mb-3 flex items-start gap-3 text-foreground group-hover:text-violet-600 transition-colors">
                                    <MdOutlineSpeed className="text-violet-500 shrink-0 mt-1" />
                                    {faq.q}
                                </h3>
                                <p className="text-text-muted leading-relaxed pl-9 text-sm">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Related Tools */}
                <section className="bg-surface-2 px-6 py-12 border-t border-border">
                    <div className="max-w-5xl mx-auto">
                        <h3 className="text-lg font-bold mb-6">Related Technical Tools</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {relatedTools.map(t => (
                                <Link key={t.href} href={t.href} className="group block p-5 rounded-xl border border-border bg-surface-1 hover:border-violet-500/50 hover:shadow-md transition-all duration-200">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-semibold group-hover:text-violet-600 transition-colors text-sm">{t.name}</p>
                                        <MdOutlineArrowForward className="size-4 text-text-subtle group-hover:text-violet-500 transition-transform group-hover:translate-x-1" />
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
