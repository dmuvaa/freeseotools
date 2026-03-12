import { Metadata } from "next";
import Link from "next/link";
import SerpPreviewToolClient from "./client";
import {
    MdOutlineSearch, MdOutlineSmartphone, MdOutlineDesktopMac,
    MdOutlineRemoveRedEye, MdOutlineAutoFixHigh, MdOutlineSpeed, MdOutlineArrowForward
} from "react-icons/md";
import { BiDevices, BiTargetLock, BiPalette, BiLineChart } from "react-icons/bi";

export const metadata: Metadata = {
    title: "SERP Preview Tool | Google Search Result Simulator",
    description: "Preview how your page title and meta description will look in Google search results. Optimize for CTR with our live SERP simulator.",
};

const features = [
    {
        icon: BiDevices,
        title: "Cross-Device Accuracy",
        desc: "Google renders mobile and desktop results differently. We simulate both perfectly, including character limits and pixel widths.",
    },
    {
        icon: BiTargetLock,
        title: "Pixel-Perfect Precision",
        desc: "We use Google's exact font rendering and spacing to ensure your title tags aren't cut off mid-sentence by an ellipses.",
    },
    {
        icon: BiPalette,
        title: "Rich Snippet Preview",
        desc: "Simulate star ratings, review counts, and dates to see how much visual real estate your brand can dominate in the search feed.",
    },
    {
        icon: BiLineChart,
        title: "CTR Focused Design",
        desc: "Optimize for the click, not just the keyword. A well-designed snippet can outperform higher-ranking results by driving more traffic.",
    },
];

const checklist = [
    { title: "Avoid Title Truncation", desc: "Keep titles under 60 characters or ~600px to ensure the full message is visible." },
    { title: "Vibrant Descriptions", desc: "Craft descriptions between 120-160 characters that act as your organic sales pitch." },
    { title: "Targeted Keywords", desc: "Ensure your primary keyword appears naturally in the title to signal relevance to bots." },
    { title: "Compelling Call to Action", desc: "End your description with a clear invitation (e.g., 'Learn More' or 'Get Started')." },
];

const relatedTools = [
    { name: "Title & Meta Length Checker", href: "/core-seo/title-meta-length", desc: "Verify pixel-width limits" },
    { name: "Meta Tags Analyzer", href: "/core-seo/meta-tags-analyzer", desc: "Audit on-page SEO health" },
    { name: "Sitemap Analyzer", href: "/core-seo/sitemap-analyzer", desc: "Optimize your crawl path" },
];

export default function SerpPreviewPage() {
    return (
        <div className="bg-background min-h-screen">

            {/* Hero / Header Section — The Simulator Experience */}
            <section className="relative overflow-hidden bg-surface-2 border-b border-border py-12 md:py-20 text-center">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{
                    backgroundImage: "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
                    backgroundSize: "40px 40px"
                }} />

                <div className="relative container mx-auto max-w-4xl px-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-foreground">
                        SERP Preview Tool
                        <span className="block text-blue-600 dark:text-blue-400 mt-2 text-2xl md:text-4xl font-bold">Visibility is Your First Impression</span>
                    </h1>
                    <p className="text-lg text-text-muted leading-relaxed max-w-2xl mb-10 mx-auto">
                        Preview how your pages will look in Google's search results on both desktop and mobile devices. Optimize for maximum clicks.
                    </p>

                    <div className="bg-surface-1 rounded-2xl border border-border p-8 shadow-2xl w-full max-w-4xl mx-auto ring-4 ring-blue-500/5 transition-all">
                        <SerpPreviewToolClient />
                    </div>
                </div>
            </section>

            <div className="bg-background">
                {/* Visual Impact Section */}
                <section className="px-6 py-12 md:py-16 container mx-auto max-w-5xl">
                    <div className="flex flex-col md:flex-row gap-16 items-center">
                        <div className="md:w-1/2">
                            <div className="size-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20">
                                <MdOutlineSearch className="size-8" />
                            </div>
                            <h2 className="text-4xl font-bold mb-6 text-foreground leading-tight">Master the Art of the Snippet</h2>
                            <p className="text-lg text-text-muted leading-relaxed mb-6">
                                In the search results, you aren't just competing with algorithms; you're competing for human attention. A well-optimized meta title and description can drive significantly more traffic than a higher-ranking page with a generic snippet.
                            </p>
                            <p className="text-lg text-text-muted leading-relaxed">
                                Our tool allows you to A/B test your messaging visually before you ever push code, ensuring your brand presents a professional and compelling face to every potential visitor.
                            </p>
                        </div>
                        <div className="md:w-1/2 grid grid-cols-1 gap-6">
                            {features.map((f, i) => {
                                const Icon = f.icon;
                                return (
                                    <div key={i} className="bg-surface-1 p-6 rounded-2xl border border-border hover:border-blue-500/50 transition-all group">
                                        <div className="flex gap-4">
                                            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
                                                <Icon className="text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold mb-1 text-foreground">{f.title}</h3>
                                                <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Best Practices checklist */}
                <section className="px-6 py-16 bg-surface-2 border-y border-border">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Snippet Optimization Checklist</h2>
                            <p className="text-lg text-text-muted max-w-2xl mx-auto">Follow these industry-standard rules to ensure your SERP listing is flawless.</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {checklist.map((item, i) => (
                                <div key={i} className="bg-surface-1 p-8 rounded-3xl border border-border relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 text-4xl font-black text-blue-500/5 group-hover:text-blue-500/10 transition-colors">
                                        0{i + 1}
                                    </div>
                                    <h4 className="font-bold text-lg mb-3 text-foreground">{item.title}</h4>
                                    <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Deep Dive: Mobile vs Desktop */}
                <section className="px-6 py-16 container mx-auto max-w-4xl">
                    <div className="bg-surface-2 border border-border rounded-[3rem] p-10 md:p-20 text-foreground relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 text-center">
                            <h3 className="text-3xl md:text-5xl font-extrabold mb-8 text-foreground">Dual-Screen Optimization</h3>
                            <p className="text-lg text-text-muted leading-relaxed mb-10 max-w-2xl mx-auto font-medium">
                                Google's mobile SERP often allows for a slightly taller description but restricts the title width differently than desktop. Our simulator switches breakpoints instantly so you can verify your 'hook' is visible on every screen size.
                            </p>
                            <div className="flex flex-wrap justify-center gap-6">
                                <div className="flex items-center gap-3 bg-surface-1 border border-border px-6 py-4 rounded-2xl shadow-sm">
                                    <MdOutlineDesktopMac className="text-blue-600 dark:text-blue-400 text-2xl" />
                                    <span className="font-bold text-sm">600px Limit</span>
                                </div>
                                <div className="flex items-center gap-3 bg-surface-1 border border-border px-6 py-4 rounded-2xl shadow-sm">
                                    <MdOutlineSmartphone className="text-blue-600 dark:text-blue-400 text-2xl" />
                                    <span className="font-bold text-sm">Breakpoint Aware</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="px-6 py-16 container mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-10">
                        {[
                            { q: "What is a SERP?", a: "SERP stands for Search Engine Results Page. It is the page Google displays after a user enters a query." },
                            { q: "Why is my title different in Google?", a: "Google sometimes rewrites titles if they believe their version matches the user's intent better, or if yours is excessively long or spammy." },
                            { q: "How long should my description be?", a: "Aim for 120-155 characters. Anything longer is almost certain to be truncated on mobile devices." },
                            { q: "Does the SERP preview affect my ranking?", a: "It helps with the Click-Through Rate (CTR). High CTR is a signal to Google that your result is relevant to users, which can indirectly help your rankings." },
                        ].map((faq, i) => (
                            <div key={i} className="border-b border-border pb-8">
                                <h3 className="font-bold text-lg mb-3 flex items-start gap-3">
                                    <MdOutlineSpeed className="text-blue-500 shrink-0 mt-1" />
                                    {faq.q}
                                </h3>
                                <p className="text-text-muted leading-relaxed pl-9 text-sm">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer Tools */}
                <section className="bg-surface-2 px-6 py-12 border-t border-border">
                    <div className="max-w-5xl mx-auto">
                        <h3 className="text-lg font-bold mb-6">Related Technical Tools</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {relatedTools.map(t => (
                                <Link key={t.href} href={t.href} className="group block p-5 rounded-xl border border-border bg-surface-1 hover:border-blue-500/50 hover:shadow-md transition-all duration-200">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-semibold group-hover:text-blue-600 transition-colors text-sm">{t.name}</p>
                                        <MdOutlineArrowForward className="size-4 text-text-subtle group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
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
