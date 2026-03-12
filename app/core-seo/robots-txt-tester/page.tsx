import { Metadata } from "next";
import Link from "next/link";
import RobotsTxtTesterClient from "./client";
import {
    MdSearch, MdScreenSearchDesktop, MdDescription, MdRoute,
    MdLanguage, MdShield, MdVisibilityOff, MdTerminal,
    MdWarningAmber, MdHelpOutline, MdArrowForward
} from "react-icons/md";
import { BiBot } from "react-icons/bi";

export const metadata: Metadata = {
    title: "Robots.txt Tester & Validator | Master Crawl Logic",
    description: "Free Robots.txt Tester: Instantly fetch, parse, and validate any domain's robots.txt file. Ensure bots are focusing on high-intent pages and not wasting crawl budget.",
};

const relatedTools = [
    { name: "Schema Checker & Validator", href: "/core-seo/schema-checker", desc: "Validate structured data markup" },
    { name: "JavaScript Rendering Checker", href: "/core-seo/javascript-rendering-checker", desc: "Compare Raw HTML vs Rendered DOM" },
    { name: "Meta Tags Analyzer", href: "/core-seo/title-meta-length", desc: "Audit On-Page SEO Essentials" },
];

export default function RobotsTxtTesterPage() {
    return (
        <div className="bg-background">

            {/* Hero / Intro Section — Command Center Style */}
            <section className="relative overflow-hidden bg-surface-2 border-b border-border py-12 md:py-20 text-center">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{
                    backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }} />

                <div className="relative container mx-auto max-w-4xl px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight text-foreground">
                        Robots.txt Tester
                        <span className="block text-orange-600 dark:text-orange-400 mt-2 text-2xl md:text-4xl">Master Your Website Crawl Logic</span>
                    </h1>
                    <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed mb-10">
                        Our Robots.txt Tester gives you total control over how search engine crawlers interact with your website. Ensure automated visitors are focused on your most valuable pages.
                    </p>

                    <div className="bg-surface-1 rounded-2xl border border-border p-8 shadow-2xl w-full max-w-4xl mx-auto ring-4 ring-orange-500/5 transition-all">
                        <RobotsTxtTesterClient />
                    </div>
                </div>
            </section>

            <div className="bg-background">
                {/* Why the Robots.txt File is Your Technical Foundation */}
                <section className="px-6 py-12 md:py-16 container mx-auto max-w-5xl space-y-12">
                    <div className="flex flex-col md:flex-row gap-10 items-center bg-surface-1 p-8 md:p-12 rounded-3xl border border-border shadow-sm">
                        <div className="md:w-1/3 shrink-0 text-center md:text-left">
                            <div className="size-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center mb-6 shadow-inner mx-auto md:mx-0">
                                <MdSearch className="size-8" />
                            </div>
                            <h3 className="text-3xl font-bold leading-tight">Why the Robots.txt File is Your Technical Foundation</h3>
                        </div>
                        <div className="md:w-2/3 space-y-6 text-lg text-text-muted leading-relaxed">
                            <p>
                                Before a bot like Googlebot reads a single word of your content, it looks for one specific file: <code>robots.txt</code>. This file acts as the primary gatekeeper for your domain, telling automated visitors which areas are open for exploration and which are strictly off limits.
                            </p>
                            <p>
                                You cannot afford to treat your robots.txt file as an afterthought. It is the very first point of contact between your server and the search engine. If the file is misconfigured, the bot might turn around and leave without indexing a single page.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row-reverse gap-10 items-center bg-surface-1 p-8 md:p-12 rounded-3xl border border-border shadow-sm">
                        <div className="md:w-1/3 shrink-0 text-center md:text-left">
                            <div className="size-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center mb-6 shadow-inner mx-auto md:mx-0">
                                <MdScreenSearchDesktop className="size-8" />
                            </div>
                            <h3 className="text-3xl font-bold leading-tight">Crawl Budget and SEO Efficiency</h3>
                        </div>
                        <div className="md:w-2/3 space-y-6 text-lg text-text-muted leading-relaxed">
                            <p>
                                Search engines do not have infinite resources. They assign a crawl budget to every website. If your site is large, you do not want bots wasting that budget on redundant or low-value pages like <code>/admin/</code> or search result folders.
                            </p>
                            <p>
                                Our tool calculates the impact of your rules so you can see exactly which paths are being closed and which are being opened. By using directives with surgical precision, you force the crawler to prioritize your product pages and high-value content.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Core Features */}
                <section className="px-6 py-16 bg-surface-2 border-y border-border">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Features of the Robots.txt Analysis Tool</h2>
                            <p className="text-lg text-text-muted max-w-2xl mx-auto">
                                We have built this tool to handle everything from simple syntax checks to complex user agent simulations.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {[
                                { icon: MdDescription, title: "Live Sandbox Analysis", desc: "Our tool parses your live robots.txt or allows you to paste new instructions to instantly highlight syntax errors or outdated commands ignored by modern crawlers.", color: "orange" },
                                { icon: MdRoute, title: "URL Path Verification", desc: "Test any URL and select specific bots (Googlebot, Bingbot) to see if they are allowed or disallowed based on your configuration.", color: "blue" },
                                { icon: BiBot, title: "User-Agent Specificity", desc: "Toggle between different user agent profiles to see how your rules apply to aggressive scrapers versus legitimate search bots.", color: "purple" },
                                { icon: MdLanguage, title: "Sitemap Discovery Check", desc: "We verify that your XML sitemap is correctly declared at the bottom of the file where bots expect to find it for deep crawling.", color: "teal" },
                            ].map((f, i) => {
                                const Icon = f.icon;
                                return (
                                    <div key={i} className="bg-surface-1 border border-border p-8 rounded-2xl hover:shadow-lg transition-all duration-300 group">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="size-12 rounded-xl bg-surface-2 text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                                <Icon className="size-6" />
                                            </div>
                                            <h4 className="text-2xl font-bold">{i + 1}. {f.title}</h4>
                                        </div>
                                        <p className="text-text-muted leading-relaxed">
                                            {f.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Mistakes Section Grid */}
                <section className="px-6 py-20 bg-background">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                            <MdShield className="size-16 text-rose-500 mx-auto mb-6" />
                            <h3 className="text-3xl md:text-4xl font-bold mb-4">Common Robots.txt Mistakes to Avoid</h3>
                            <p className="text-lg text-text-muted max-w-2xl mx-auto">
                                Even experienced developers make errors that lead to massive traffic losses. We flag these before they become problems.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { icon: MdVisibilityOff, title: "The Forward Slash Trap", body: "A directive that says Disallow: / tells every bot to stay away from your entire website. Fastest way to disappear from search." },
                                { icon: MdTerminal, title: "Blocking CSS & JS", body: "Modern Googlebot needs to render your page visually. If you block these resources, Google sees a broken version of your site." },
                                { icon: MdWarningAmber, title: "Case Sensitivity", body: "Robots.txt is case sensitive. Disallowing /Admin/ while your folder is /admin/ allows bots to crawl the folder anyway." },
                                { icon: MdScreenSearchDesktop, title: "Pattern Confusion", body: "A misplaced wildcard (*) or dollar sign ($) can block thousands of pages you intended to keep open." },
                            ].map((m, i) => {
                                const Icon = m.icon;
                                return (
                                    <div key={i} className="bg-surface-1 p-6 rounded-2xl border border-border shadow-sm hover:border-rose-500/50 transition-colors group">
                                        <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-rose-600 dark:text-rose-400">
                                            <Icon className="size-5 group-hover:scale-110 transition-transform" /> {m.title}
                                        </h4>
                                        <p className="text-text-muted text-sm leading-relaxed">
                                            {m.body}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Pro Workflow */}
                <section className="px-6 py-20 bg-surface-2 border-y border-border">
                    <div className="container mx-auto max-w-4xl">
                        <div className="text-center mb-16">
                            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6">The Professional Workflow for Crawl Optimization</h3>
                            <p className="text-lg text-text-muted">
                                To get the most out of your crawl budget, follow this structured process with our tool.
                            </p>
                        </div>

                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-orange-500/50 before:to-transparent">
                            {[
                                { step: "1", title: "Audit Your Existing File", desc: "Enter your URL and let our tool fetch your live robots.txt file. Look for any 'Disallow' rules that you do not recognize." },
                                { step: "2", title: "Test Your 'Money' Pages", desc: "Run your most important product or service pages through the URL tester. Ensure they all show a 'Success' or 'Allowed' status." },
                                { step: "3", title: "Clean Up Junk Paths", desc: "Identify folders that provide no value to a search user (like account login pages) and add 'Disallow' rules for them." },
                                { step: "4", title: "Verify the Changes", desc: "Only then should you upload the new file to your server. Retest critical URLs to ensure you haven't blocked anything vital." }
                            ].map((item, i) => (
                                <div key={item.step} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[var(--background)] bg-orange-500 text-white font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10 transition-transform group-hover:scale-110">
                                        {item.step}
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-surface-1 p-6 rounded-2xl border border-border shadow-xl hover:border-orange-500/50 transition-all group-hover:bg-surface-2">
                                        <h4 className="font-bold text-xl text-foreground mb-2">{item.title}</h4>
                                        <p className="text-text-muted leading-relaxed text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="px-6 py-20 container mx-auto max-w-5xl">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold mb-4">Frequently Asked Questions</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { q: "Does robots.txt stop a page from being indexed?", a: "Not necessarily. It stops a bot from crawling. If other sites link to that page, Google might still index it based on anchor text. Use 'noindex' meta tags for total exclusion." },
                            { q: "What is the Crawl-delay directive?", a: "Some bots support it to prevent server overwhelm, but Googlebot does not follow this command. Control Google's crawl rate via Search Console." },
                            { q: "How many robots.txt files can I have?", a: "Only one per domain, and it must be at the root (yoursite.com/robots.txt). Subfolder robots.txt files are ignored." },
                            { q: "Should I block my images?", a: "Generally, no. Image search is a massive source of traffic. Only block images if they are private or have specific copyright concerns." },
                        ].map((faq, i) => (
                            <div key={i} className="p-8 bg-surface-1 border border-border rounded-2xl hover:border-primary/50 transition-colors group">
                                <h4 className="font-bold text-lg flex gap-3 items-start mb-3">
                                    <MdHelpOutline className="size-6 text-orange-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                    {faq.q}
                                </h4>
                                <p className="text-text-muted leading-relaxed text-sm">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section className="px-6 py-20">
                    <div className="container mx-auto max-w-4xl text-center bg-gradient-to-br from-orange-600 to-red-700 rounded-3xl p-10 md:p-14 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-10">
                            <MdShield className="size-64" />
                        </div>
                        <div className="relative z-10 text-center flex flex-col items-center">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Take Command of Your Site Access</h2>
                            <p className="text-lg text-orange-100 max-w-2xl mx-auto mb-10 leading-relaxed text-center">
                                Your technical SEO begins at the root level. Use our Robots.txt Tester to build a clean, efficient, and safe path for search engines to follow.
                            </p>
                            <Link href="/core-seo/robots-txt-tester#top" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full sm:w-auto">
                                <MdSearch className="size-5" /> Audit Your Robots.txt Now
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Related Tools Footer */}
                <section className="bg-surface-2 px-6 py-12 border-t border-border">
                    <div className="max-w-5xl mx-auto">
                        <h3 className="text-lg font-bold mb-6">Related Technical Tools</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {relatedTools.map(t => (
                                <Link key={t.href} href={t.href} className="group block p-5 rounded-xl border border-border bg-surface-1 hover:border-orange-500/50 hover:shadow-md transition-all duration-200">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-semibold group-hover:text-orange-600 transition-colors text-sm">{t.name}</p>
                                        <MdArrowForward className="size-4 text-text-subtle group-hover:text-orange-500 transition-transform group-hover:translate-x-1" />
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
