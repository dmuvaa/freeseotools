import { Metadata } from "next";
import Link from "next/link";
import RedirectCheckerClient from "./client";
import {
    MdSwapCalls, MdOutlineSpeed, MdCheckCircle, MdErrorOutline,
    MdOutlineHelpOutline, MdSecurity, MdOutlineExplore, MdArrowForward
} from "react-icons/md";
import { BiTimer, BiTargetLock, BiShieldQuarter, BiTransfer } from "react-icons/bi";

export const metadata: Metadata = {
    title: "Redirect Checker & URL Tracer | Free HTTP Status Tool",
    description: "Trace URL redirect chains to ensure search engines and users reach the correct destination. Identify 301/302 redirects and loops.",
};

const features = [
    {
        icon: BiTransfer,
        title: "Complete Chain Exposure",
        desc: "Don't just see the final destination. We show you every single 'hop' in between, revealing hidden redirects you didn't know existed.",
    },
    {
        icon: BiTimer,
        title: "Latency per Hop",
        desc: "Measure the response time for every stage of the redirect. Essential for identifying slow servers that are killing your site speed.",
    },
    {
        icon: BiShieldQuarter,
        title: "Loop Detection",
        desc: "Our engine automatically detects and flags infinite redirect loops that prevent bots from indexing your site and crash browsers.",
    },
    {
        icon: BiTargetLock,
        title: "HTTP Status Insight",
        desc: "Get crystal clear status codes (301, 302, 307, 308) for every stage of the journey to ensure your SEO equity is passing correctly.",
    },
];

const redirectTypes = [
    {
        code: "301",
        label: "Moved Permanently",
        desc: "The gold standard for SEO. It passes almost all of its ranking power (link equity) to the redirected page.",
        type: "success"
    },
    {
        code: "302",
        label: "Found / Moved Temp",
        desc: "Often used incorrectly. It tells bots the move is only temporary and does not pass ranking power to the new URL.",
        type: "warning"
    },
    {
        code: "307",
        label: "Temporary Redirect",
        desc: "The modern HTTP/1.1 successor to the 302. Used for temporary changes but ensures the request method stays the same.",
        type: "info"
    },
    {
        code: "308",
        label: "Permanent Redirect",
        desc: "The modern counterpart to 301. It indicates a permanent move while maintaining the original request method (POST, etc).",
        type: "success"
    },
];

const faqs = [
    {
        q: "How many redirects are too many for SEO?",
        a: "Ideally, you should have zero. However, if you must redirect, try to keep it to a single hop. Most search engines will stop following a chain after 5 or 6 hops, potentially leaving your page unindexed."
    },
    {
        q: "What is the difference between a 301 and a 302 redirect?",
        a: "A 301 redirect is permanent and passes 'link juice' (ranking power). A 302 is temporary and generally does not pass ranking power. Use 301 for site migrations and 302 for short-term promotions."
    },
    {
        q: "Does a redirect slow down my website?",
        a: "Yes. Every redirect requires an additional round-trip to the server. For mobile users on slow connections, a chain of 3 or 4 redirects can add several seconds to the total load time."
    },
    {
        q: "Can search engines follow meta refresh redirects?",
        a: "They can, but it is highly discouraged. Meta refresh redirects (the ones that happen in the browser after a few seconds) are often associated with spam and provide a poor user experience."
    },
    {
        q: "What is a redirect loop?",
        a: "A redirect loop occurs when Page A redirects to Page B, and Page B redirects back to Page A. This creates an infinite cycle that browsers and search bots eventually give up on, resulting in an error."
    },
    {
        q: "Is it safe to use redirect chains for affiliate links?",
        a: "While common, it's better to use one clean redirect. Excessive chains can trigger security warnings in some browsers or be flagged by ad-blockers as suspicious behavior."
    },
];

const relatedTools = [
    { name: "Sitemap Analyzer", href: "/core-seo/sitemap-analyzer", desc: "Audit your XML roadmap" },
    { name: "Broken Link Checker", href: "/core-seo/broken-link-checker", desc: "Find 404 errors" },
    { name: "Robots.txt Tester", href: "/core-seo/robots-txt-tester", desc: "Test crawl permissions" },
];

export default function RedirectCheckerPage() {
    return (
        <div className="bg-background min-h-screen">

            {/* Hero / Header Section — Focused on the 'Trace' metaphor */}
            <section className="relative overflow-hidden bg-surface-2 border-b border-border py-12 md:py-20 text-center">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{
                    backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }} />

                <div className="relative container mx-auto max-w-4xl px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-foreground">
                        Redirect Checker
                        <span className="block text-indigo-600 dark:text-indigo-400 mt-2 text-2xl md:text-4xl font-bold">Trace Every Hop. Preserve Every Link.</span>
                    </h1>
                    <p className="text-lg text-text-muted leading-relaxed max-w-2xl mx-auto mb-10 text-center">
                        Trace URL redirect chains to ensure search engines and users reach the correct destination. Identify 301/302 redirects, and measure exact response times.
                    </p>

                    <div className="bg-surface-1 rounded-2xl border border-border p-8 shadow-2xl w-full max-w-4xl mx-auto ring-4 ring-indigo-500/5 transition-all">
                        <RedirectCheckerClient />
                    </div>
                </div>
            </section>

            {/* Why it Matters & Stakes */}
            <section className="px-6 py-12 md:py-16 bg-surface-2 border-y border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="size-16 rounded-3xl bg-primary text-white flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
                                <MdSecurity className="size-8" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Why Redirect Chains Kill Your Performance</h2>
                            <div className="space-y-5 text-text-muted leading-relaxed">
                                <p>A redirect chain occurs when there is more than one redirect between the initial URL and the destination URL. For example: <code>URL A → URL B → URL C</code>.</p>
                                <p>Every single step in that chain forces the browser to make a new request and wait for a new response. On mobile devices, this can lead to significant latency and a poor user experience. More importantly, search engines may stop following a chain if it's too long, meaning your destination page might never get indexed.</p>
                                <p>Our tool helps you flatten these chains so users reach their destination instantly and you preserve 100% of your link equity.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            {features.map((f, i) => {
                                const Icon = f.icon;
                                return (
                                    <div key={i} className="bg-surface-1 p-6 rounded-2xl border border-border hover:border-primary/50 hover:shadow-md transition-all group">
                                        <div className="flex items-start gap-4">
                                            <div className="size-10 rounded-xl bg-primary-muted text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Icon className="text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-foreground mb-1">{f.title}</h3>
                                                <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Deep Dive: Redirect Types */}
            <section className="px-6 py-16 container mx-auto max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Understanding HTTP Redirect Codes</h2>
                    <p className="text-lg text-text-muted max-w-2xl mx-auto">Not all redirects are created equal. Choosing the wrong one can lead to "ghosting" in search results.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {redirectTypes.map((t) => (
                        <div key={t.code} className="bg-surface-1 border border-border p-8 rounded-3xl relative overflow-hidden group hover:border-primary transition-colors">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <MdOutlineExplore className="size-24" />
                            </div>
                            <div className={`inline-block text-3xl font-black mb-4 ${t.type === 'success' ? 'text-success' : t.type === 'warning' ? 'text-warning' : 'text-primary'}`}>
                                {t.code}
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">{t.label}</h3>
                            <p className="text-sm text-text-muted leading-relaxed">{t.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Steps Section */}
            <section className="px-6 py-16 bg-surface-2 border-y border-border">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-16">
                        <MdOutlineSpeed className="text-5xl text-indigo-500 mx-auto mb-6" />
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">The Professional Redirect Audit Workflow</h2>
                        <p className="text-lg text-text-muted">Follow these steps to ensure your URL architecture is optimized for speed and SEO.</p>
                    </div>
                    <div className="space-y-6">
                        {[
                            { title: "Identify Your Legacy URLs", desc: "Start by collecting URLs from old versions of your site or marketing campaigns that are still generating traffic." },
                            { title: "Trace the Path", desc: "Paste them into our redirect checker to see exactly how they are reaching their current destination." },
                            { title: "Eliminate Intermediate Hops", desc: "If you see a chain (A → B → C), update your server configuration to point A directly to C." },
                            { title: "Update Internal Links", desc: "Once the server-side redirect is clean, use a crawler to find any internal links still pointing to the old URL and update them to the final destination." }
                        ].map((step, i) => (
                            <div key={i} className="flex gap-6 p-6 rounded-2xl bg-surface-1 border border-border hover:border-indigo-500/50 transition-colors group">
                                <div className="size-10 rounded-full bg-indigo-500/10 text-indigo-600 font-bold flex items-center justify-center shrink-0 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all font-mono">
                                    0{i + 1}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                                    <p className="text-text-muted leading-relaxed text-sm md:text-base">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="px-6 py-16 container mx-auto max-w-5xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-foreground mb-4">Redirect Checker FAQ</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-10">
                    {faqs.map((f) => (
                        <div key={f.q} className="group">
                            <h3 className="flex items-center gap-3 font-bold text-foreground mb-4 text-lg border-b border-border pb-2 group-hover:border-primary transition-colors">
                                <MdOutlineHelpOutline className="text-primary shrink-0" />
                                {f.q}
                            </h3>
                            <p className="text-text-muted leading-relaxed text-sm pl-9">{f.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Related Tools */}
            <section className="px-6 py-12 bg-surface-2 border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <h3 className="text-lg font-bold text-foreground mb-6">Related Technical Tools</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {relatedTools.map((t) => (
                            <Link key={t.href} href={t.href} className="group flex items-center justify-between p-6 rounded-2xl border border-border bg-surface-1 hover:border-primary hover:shadow-md transition-all">
                                <div>
                                    <p className="font-bold text-foreground group-hover:text-primary transition-colors mb-1">{t.name}</p>
                                    <p className="text-xs text-text-muted">{t.desc}</p>
                                </div>
                                <MdArrowForward className="text-text-subtle group-hover:text-primary group-hover:translate-x-1 transition-all text-xl" />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
