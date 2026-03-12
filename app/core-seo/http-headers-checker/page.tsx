import { Metadata } from "next";
import Link from "next/link";
import HttpHeadersClient from "./client";
import {
    HiOutlineShieldCheck, HiOutlineCpuChip, HiOutlineBolt,
    HiOutlineDocumentMagnifyingGlass, HiOutlineArrowPath,
    HiOutlineLockClosed, HiOutlineExclamationTriangle,
    HiOutlineChatBubbleBottomCenterText, HiOutlineArrowRight,
    HiOutlineCubeTransparent
} from "react-icons/hi2";
import {
    MdOutlineSecurity, MdOutlineDns, MdOutlineStorage,
    MdOutlinePolicy
} from "react-icons/md";

export const metadata: Metadata = {
    title: "HTTP Headers Checker | Free Server Response Audit",
    description: "Inspect every HTTP response header to verify server security settings, cache policies, and compression directives.",
};

const securityHeaders = [
    { name: "Content-Security-Policy", icon: HiOutlineLockClosed, desc: "A powerful layer of security that prevents Cross-Site Scripting (XSS) and other code injection attacks." },
    { name: "Strict-Transport-Security", icon: HiOutlineShieldCheck, desc: "Forces browsers to communicate with your server over encrypted HTTPS only." },
    { name: "X-Frame-Options", icon: HiOutlineCubeTransparent, desc: "Prevents your site from being embedded in iframes, protecting you from clickjacking." },
    { name: "X-Content-Type-Options", icon: HiOutlineDocumentMagnifyingGlass, desc: "Stops browsers from 'sniffing' the content type, preventing certain types of malware injection." },
];

const features = [
    { icon: HiOutlineBolt, title: "Latency Analysis", desc: "Identify headers that reveal slow server processing times or inefficient backend handshakes." },
    { icon: HiOutlineCpuChip, title: "Server Fingerprinting", desc: "Discover if your server is leaking version information that could be leveraged by attackers." },
    { icon: HiOutlineArrowPath, title: "Redirect Tracing", desc: "We follow the complete chain of response headers to ensure your redirects are direct and efficient." },
    { icon: HiOutlineChatBubbleBottomCenterText, title: "Cache Optimization", desc: "Audit your Cache-Control and ETag headers to ensure static assets are being handled correctly." },
];

const faqs = [
    { q: "What are HTTP headers?", a: "HTTP headers are name-value pairs sent between a client (your browser) and a server. They contain metadata about the request or the response, such as content type, caching instructions, and security policies." },
    { q: "Why is the Server header a security risk?", a: "If the Server header reveals specific version numbers (e.g., 'Apache/2.4.41'), it makes it easier for hackers to target known vulnerabilities for that specific version." },
    { q: "What does 'nosniff' mean?", a: "The 'X-Content-Type-Options: nosniff' header tells the browser to strictly follow the Content-Type header. This prevents the browser from trying to guess if a file is an executable, which is a common vector for malware." },
    { q: "How does CSP improve my SEO?", a: "While not a direct ranking factor, CSP prevents site defacement and XSS attacks. A hacked or compromised site will quickly be demoted or blacklisted by search engines." },
    { q: "Do I need HSTS if I already have a redirect to HTTPS?", a: "Yes. Redirects can be intercepted. HSTS tells the browser to never even attempt an insecure connection in the first place, providing much stronger protection." },
    { q: "What header controls page caching?", a: "The 'Cache-Control' header is the primary tool for instructing browsers and CDNs on how long to store a copy of your page before requesting a new one from the origin server." },
];

const relatedTools = [
    { name: "Broken Link Scanner", href: "/core-seo/broken-link-checker", desc: "Find dead URLs on your page" },
    { name: "Redirect Checker", href: "/core-seo/redirect-checker", desc: "Trace complex redirect chains" },
    { name: "Sitemap Analyzer", href: "/core-seo/sitemap-analyzer", desc: "Verify sitemap health" },
];

export default function HttpHeadersPage() {
    return (
        <div className="bg-background min-h-screen">

            {/* Hero — Industrial Indigo Aesthetic */}
            <section className="relative overflow-hidden bg-surface-2 border-b border-border py-12 md:py-20 text-center">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{
                    backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }} />

                <div className="relative container mx-auto max-w-4xl px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-8 text-foreground">
                        HTTP Headers
                        <span className="block text-indigo-600 dark:text-indigo-400 mt-2 text-2xl md:text-4xl font-bold italic tracking-tighter">Response Packet Inspector</span>
                    </h1>
                    <p className="text-lg text-text-muted leading-relaxed max-w-2xl mx-auto mb-10">
                        Every server response carries hidden metadata that dictates security, caching, and performance. Inspect the raw packet headers to ensure your infrastructure is optimized.
                    </p>

                    <div className="bg-surface-1 rounded-2xl border border-border p-8 shadow-2xl w-full max-w-4xl mx-auto ring-4 ring-indigo-500/5 transition-all">
                        <HttpHeadersClient />
                    </div>
                </div>
            </section>

            <div className="bg-background">
                {/* How it Works */}
                <section className="px-6 py-12 md:py-16 container mx-auto max-w-4xl">
                    <div className="text-center mb-20 px-4">
                        <h2 className="text-3xl md:text-5xl font-black text-foreground mb-8 uppercase tracking-tighter">The Packet Inspection Workflow</h2>
                        <div className="h-1 w-24 bg-indigo-600 mx-auto" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-10">
                        {[
                            { title: "Direct Socket Request", desc: "Our engine makes a direct request to your URL without any browser overhead to capture raw response headers." },
                            { title: "Policy Extraction", desc: "We parse security directives like CSP and HSTS to ensure they adhere to modern security standards." },
                            { title: "Configuration Mapping", desc: "The tool identifies the server software, content type, and any custom metadata being broadcasted." },
                            { title: "Vulnerability Check", desc: "We flag missing security headers that often result in lower browser security scores and increased risk." },
                        ].map((step, i) => (
                            <div key={step.title} className="flex gap-8 p-10 rounded-3xl border border-border bg-surface-1 hover:border-indigo-500/50 transition-all group relative overflow-hidden backdrop-blur-sm shadow-sm">
                                <div className="shrink-0 w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/30">
                                    {i + 1}
                                </div>
                                <div>
                                    <h3 className="font-black text-foreground mb-3 text-lg uppercase tracking-tight">{step.title}</h3>
                                    <p className="text-text-muted text-sm leading-relaxed font-medium">{step.desc}</p>
                                </div>
                                <div className="absolute -bottom-10 -right-10 text-9xl font-black text-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {i + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section className="px-6 py-16 bg-surface-2 border-y border-border overflow-hidden relative">
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                        <MdOutlineDns className="size-96 absolute -top-20 -left-20" />
                        <MdOutlineStorage className="size-96 absolute -bottom-20 -right-20" />
                    </div>
                    <div className="container mx-auto max-w-6xl relative z-10">
                        <h2 className="text-3xl md:text-4xl font-black text-foreground text-center mb-20 uppercase tracking-[0.3em]">Critical Inspection Clusters</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((f) => {
                                const Icon = f.icon;
                                return (
                                    <div key={f.title} className="bg-surface-1 p-10 rounded-[2.5rem] border border-border hover:shadow-2xl hover:-translate-y-2 transition-all group text-left shadow-sm">
                                        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-3xl mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                            <Icon />
                                        </div>
                                        <h3 className="font-black text-foreground mb-4 uppercase text-sm tracking-widest">{f.title}</h3>
                                        <p className="text-sm text-text-muted leading-relaxed font-bold opacity-80">{f.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Security Headers Summary */}
                <section className="px-6 py-16 container mx-auto max-w-5xl">
                    <h2 className="text-3xl md:text-4xl font-black text-foreground text-center mb-16 uppercase tracking-widest">Modern Security Compliance</h2>
                    <div className="grid md:grid-cols-1 gap-6">
                        {securityHeaders.map((sh) => (
                            <div key={sh.name} className="flex items-start gap-8 p-8 rounded-3xl border border-border bg-surface-1 hover:border-indigo-500/50 transition-all group shadow-sm">
                                <sh.icon className="text-4xl text-indigo-500 shrink-0 mt-1 drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
                                <div>
                                    <h3 className="font-mono text-lg font-black text-foreground mb-3 uppercase tracking-tighter group-hover:text-indigo-500 transition-colors">{sh.name}</h3>
                                    <p className="text-text-muted leading-relaxed text-sm lg:text-base font-bold sm:font-medium">{sh.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Why it Matters */}
                <section className="px-6 py-16 bg-slate-950 border-white/5 border-y relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
                        <MdOutlinePolicy className="size-full text-indigo-500 font-thin" />
                    </div>
                    <div className="container mx-auto max-w-4xl text-center relative z-10">
                        <HiOutlineExclamationTriangle className="text-7xl text-amber-500 mx-auto mb-10 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]" />
                        <h2 className="text-3xl md:text-5xl font-black mb-8 text-white uppercase tracking-tighter leading-none">The Integrity of the Payload</h2>
                        <p className="text-xl text-slate-300 leading-relaxed mb-10 max-w-3xl mx-auto font-medium">
                            An server that broadcasts too much information is a target; one that broadcasts too little is an enigma to browsers. Finding the balance in your HTTP response headers is critical for both security and speed.
                        </p>
                        <p className="text-slate-400 leading-relaxed max-w-3xl mx-auto italic font-bold">
                            Our inspector provides the visibility you need to enforce strict security policies, optimize browser caching, and ensure that your server is acting as a secure, efficient gateway for your content.
                        </p>
                    </div>
                </section>

                {/* FAQ */}
                <section className="px-6 py-16 container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-black text-foreground text-center mb-16 uppercase tracking-widest">Protocol FAQ</h2>
                    <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
                        {faqs.map((f) => (
                            <div key={f.q} className="group">
                                <h3 className="font-black text-foreground mb-4 text-lg tracking-tight uppercase border-b border-border pb-4 group-hover:border-indigo-500 transition-colors">
                                    {f.q}
                                </h3>
                                <p className="text-text-muted leading-relaxed text-sm font-bold opacity-80">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Related Tools */}
                <section className="px-6 py-12 bg-surface-2 border-t border-border">
                    <div className="container mx-auto max-w-5xl">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground-muted mb-8 text-center">Extended Infrastructure Tools</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            {relatedTools.map((t) => (
                                <Link key={t.href} href={t.href} className="group p-8 rounded-3xl border border-border bg-surface-1 hover:border-indigo-500 hover:shadow-2xl transition-all block relative overflow-hidden">
                                    <div className="relative z-10 flex flex-col justify-between h-full">
                                        <div>
                                            <p className="font-black text-foreground group-hover:text-indigo-600 transition-colors uppercase text-xs tracking-widest mb-2">{t.name}</p>
                                            <p className="text-[10px] text-text-muted font-bold tracking-tight uppercase opacity-60">{t.desc}</p>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <HiOutlineArrowRight className="text-text-subtle group-hover:text-indigo-600 group-hover:translate-x-2 transition-all text-2xl" />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 -left-4 size-16 bg-indigo-500/5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
