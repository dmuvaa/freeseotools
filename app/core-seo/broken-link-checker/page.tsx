import { Metadata } from "next";
import Link from "next/link";
import BrokenLinkCheckerClient from "./client";
import {
    AiOutlineWarning, AiOutlineCheckCircle, AiOutlineCloseCircle,
    AiOutlineLink, AiOutlineDisconnect, AiOutlineFilter,
    AiOutlineExclamationCircle, AiOutlineArrowRight, AiOutlineQuestionCircle,
    AiOutlineRadarChart
} from "react-icons/ai";
import {
    MdRunningWithErrors, MdLinkOff, MdInfoOutline, MdOutlineArrowForward
} from "react-icons/md";

export const metadata: Metadata = {
    title: "Broken Links Scanner | Free Dead Link Checker",
    description: "Scan every internal and external link on your page to verify they all point to live, healthy destinations.",
};

const statusCodes = [
    { code: "404", label: "Not Found", color: "rose", desc: "The most common error, indicating the linked page no longer exists." },
    { code: "500", label: "Server Error", color: "amber", desc: "Links to pages that are currently crashing or experiencing server issues." },
    { code: "Bad URL", label: "Invalid URL", color: "violet", desc: "Links with typos or incorrect formatting that prevent them from working." },
    { code: "Timeout", label: "Timeout Error", color: "orange", desc: "Links to servers that are taking too long to respond." },
    { code: "Empty", label: "Empty href", color: "slate", desc: "Tags that have no destination (missing href attribute)." },
];

const features = [
    { icon: AiOutlineRadarChart, title: "Bulk Radar Scan", desc: "Analyze every outbound and internal link on a page in a matter of seconds." },
    { icon: AiOutlineFilter, title: "Source Filtering", desc: "Quickly separate issues you can fix (internal) from those you may need to remove (external)." },
    { icon: AiOutlineLink, title: "Anchor Text Context", desc: "We show you exactly which text is linked so you can find the error on your page effortlessly." },
    { icon: AiOutlineDisconnect, title: "Trace Redirects", desc: "We flag links that go through redirects, allowing you to update them for faster performance." },
];

const faqs = [
    { q: "How do broken links affect my SEO?", a: "Broken links waste crawl budget and provide a poor user experience. If search engines find many broken links on your site, they may view it as low quality or unmaintained, which can lead to lower rankings." },
    { q: "Is it worse to have broken internal or external links?", a: "Both are bad, but broken internal links are worse because you have total control over them. They break the flow of your site's authority." },
    { q: "Should I use a redirect or just remove a broken link?", a: "If there is a relevant page to link to, use a 301 redirect. If the content is gone and there is no good alternative, remove the link entirely." },
    { q: "Should I worry about broken external links?", a: "Yes. Linking to a broken external page reflects poorly on your site's quality control. You should either update the link or remove it." },
    { q: "How often should I scan for broken links?", a: "For active sites, scan weekly. For static sites, a monthly check ensures your content remains a professional resource for your audience." },
    { q: "What is the best way to handle a 404 page?", a: "A 404 page should be helpful. Maintain your branding, explain the error, and offer links to your most popular content to keep users on-site." },
];

const relatedTools = [
    { name: "Redirect Checker", href: "/core-seo/redirect-checker", desc: "Trace URL redirect chains" },
    { name: "Sitemap Analyzer", href: "/core-seo/sitemap-analyzer", desc: "Verify every URL in your sitemap" },
    { name: "Heading Structure", href: "/core-seo/heading-structure", desc: "Audit your content hierarchy" },
];

export default function BrokenLinkCheckerPage() {
    return (
        <div className="bg-background min-h-screen">

            {/* Hero — Deep Red/Terminal Aesthetic */}
            <section className="relative overflow-hidden bg-surface-2 border-b border-border py-12 md:py-20 text-center">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{
                    backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
                    backgroundSize: '32px 32px'
                }} />

                <div className="relative container mx-auto max-w-4xl px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-8 text-foreground">
                        Broken Link Checker
                        <span className="block text-rose-600 dark:text-rose-400 mt-2 text-2xl md:text-4xl font-bold">Stop the Link Juice Leak</span>
                    </h1>
                    <p className="text-lg text-text-muted leading-relaxed max-w-2xl mx-auto mb-10 text-center">
                        Every broken link on your site is a dead end for users and search bots. Mimic a crawler to find and fix 404s before they impact your authority.
                    </p>

                    <div className="bg-surface-1 rounded-2xl border border-border p-8 shadow-2xl w-full max-w-4xl mx-auto ring-4 ring-rose-500/5 transition-all">
                        <BrokenLinkCheckerClient />
                    </div>
                </div>
            </section>

            <div className="bg-background">
                {/* How it Works */}
                <section className="px-6 py-12 md:py-16 container mx-auto max-w-4xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6 uppercase tracking-tighter">Crawl Recovery Protocol</h2>
                        <p className="text-text-muted text-center max-w-2xl mx-auto leading-relaxed text-lg">
                            Our system probe engine identifies every link in your source code to ensure they lead to healthy 200 OK destinations.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { title: "Recursive Discovery", desc: "Our crawler identifies every <a> tag in your footers, navigation, and sidebar widgets." },
                            { title: "Efficient Validation", desc: "We send HEAD requests to verify status codes without downloading entire pages, saving server resources." },
                            { title: "Logic Categorization", desc: "Results are grouped into Success (200), Redirects (30x), and Client Errors (404/410)." },
                            { title: "Correction Insights", desc: "For every dead end, we provide the exact anchor text to help you locate and fix it in your CMS." },
                        ].map((step, i) => (
                            <div key={step.title} className="flex gap-6 p-10 rounded-[2rem] border border-border bg-surface-1 hover:border-rose-500/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 text-8xl font-black text-rose-500/5 group-hover:text-rose-500/10 transition-colors">
                                    {i + 1}
                                </div>
                                <div className="shrink-0 w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-lg shadow-xl shadow-rose-500/20">
                                    {i + 1}
                                </div>
                                <div>
                                    <h3 className="font-black text-foreground mb-2 text-lg uppercase tracking-tight">{step.title}</h3>
                                    <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section className="px-6 py-16 bg-surface-2 border-y border-border">
                    <div className="container mx-auto max-w-6xl">
                        <h2 className="text-3xl md:text-4xl font-black text-foreground text-center mb-16 uppercase tracking-widest">Authority Preservation Tools</h2>
                        <div className="grid md:grid-cols-4 gap-8">
                            {features.map((b) => {
                                const Icon = b.icon;
                                return (
                                    <div key={b.title} className="bg-surface-1 p-8 rounded-[2.5rem] border border-border shadow-sm hover:shadow-2xl transition-all group">
                                        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-3xl mb-8 group-hover:rotate-12 transition-transform shadow-inner">
                                            <Icon />
                                        </div>
                                        <h3 className="font-black text-foreground mb-4 uppercase text-sm tracking-widest">{b.title}</h3>
                                        <p className="text-sm text-text-muted leading-relaxed font-medium">{b.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Status Codes Grid */}
                <section className="px-6 py-16 container mx-auto max-w-6xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-16">Spectral Analysis Targets</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {statusCodes.map((s) => (
                            <div key={s.code} className="p-8 rounded-3xl border border-border bg-surface-1 hover:border-rose-500/40 transition-all group relative overflow-hidden">
                                <div className="text-4xl font-black font-mono mb-4 text-rose-500 group-hover:scale-110 transition-transform origin-left">{s.code}</div>
                                <h3 className="font-black uppercase text-[10px] tracking-widest mb-3 text-foreground-subtle">{s.label}</h3>
                                <p className="text-[10px] leading-relaxed font-bold text-text-muted uppercase tracking-tight">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Why it Matters */}
                <section className="px-6 py-16 bg-surface-2 border-y border-border relative overflow-hidden">
                    <div className="container mx-auto max-w-4xl text-center relative z-10">
                        <AiOutlineDisconnect className="text-7xl text-rose-600 dark:text-rose-400 mx-auto mb-10 drop-shadow-[0_0_20px_rgba(251,113,133,0.3)]" />
                        <h2 className="text-3xl md:text-5xl font-black mb-8 text-foreground uppercase tracking-tighter">The Authority Leak</h2>
                        <p className="text-xl text-text-muted leading-relaxed mb-10 max-w-3xl mx-auto font-medium">
                            A high volume of broken links is a clear signal of neglect to both users and search engines, resulting in a poor quality score and a frustrated audience.
                        </p>
                        <p className="text-text-subtle leading-relaxed max-w-3xl mx-auto italic font-bold">
                            By proactively fixing 404s, our scanner plugs authority leaks, improves site navigation, and ensures search bots can traverse your site without hitting dead ends, maximizing your indexable potential.
                        </p>
                    </div>
                </section>

                {/* FAQ */}
                <section className="px-6 py-16 container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-black text-foreground text-center mb-16 uppercase tracking-widest">Scanner FAQ</h2>
                    <div className="grid md:grid-cols-2 gap-10">
                        {faqs.map((f) => (
                            <div key={f.q} className="group relative">
                                <div className="absolute -left-6 top-1.5 w-1 h-12 bg-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <h3 className="flex items-center gap-4 font-black text-foreground mb-4 text-xl tracking-tight">
                                    <div className="size-2 rounded-full bg-rose-500" />
                                    {f.q}
                                </h3>
                                <p className="text-text-muted leading-relaxed pl-6 font-medium border-l border-border">{f.a}</p>
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
                                <Link key={t.href} href={t.href} className="group flex items-center justify-between p-8 rounded-3xl border border-border bg-surface-1 hover:border-rose-500 hover:shadow-2xl transition-all">
                                    <div>
                                        <p className="font-black text-foreground group-hover:text-rose-600 transition-colors uppercase text-xs tracking-widest mb-1">{t.name}</p>
                                        <p className="text-[10px] text-text-muted font-bold tracking-tight uppercase">{t.desc}</p>
                                    </div>
                                    <MdOutlineArrowForward className="text-text-subtle group-hover:text-rose-600 group-hover:translate-x-1 transition-all text-2xl" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
