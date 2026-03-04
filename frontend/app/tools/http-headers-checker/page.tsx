import { Metadata } from "next";
import Link from "next/link";
import HttpHeadersCheckerClient from "./client";

export const metadata: Metadata = {
    title: "Free HTTP Headers Checker | Inspect Server Response & Security Headers",
    description: "Free HTTP Headers Checker: Inspect raw server response headers, audit caching rules, and verify critical security headers like CSP, HSTS, and X-Frame-Options.",
};

const securityHeaders = [
    { name: "Strict-Transport-Security", abbr: "HSTS", color: "text-blue-500", desc: "Forces HTTPS-only connections, protecting against downgrade attacks." },
    { name: "Content-Security-Policy", abbr: "CSP", color: "text-purple-500", desc: "Restricts what scripts, styles, and resources the browser can load — eliminating XSS." },
    { name: "X-Frame-Options", abbr: "XFO", color: "text-green-500", desc: "Prevents your site being embedded in iframes on malicious third-party pages." },
    { name: "X-Content-Type-Options", abbr: "XCTO", color: "text-orange-500", desc: "Stops browsers sniffing MIME types, preventing content-type confusion attacks." },
    { name: "Permissions-Policy", abbr: "PP", color: "text-pink-500", desc: "Controls which browser features (camera, microphone) pages can access." },
    { name: "Referrer-Policy", abbr: "RP", color: "text-teal-500", desc: "Dictates how much referrer info is sent when users navigate away from your site." },
];

const relatedTools = [
    { name: "Free Redirect Checker", href: "/tools/redirect-checker", desc: "Inspect HTTP status codes across redirect hops" },
    { name: "Free Robots.txt Tester", href: "/tools/robots-txt-tester", desc: "Validate crawler directives at the server level" },
    { name: "Free Meta Tags Analyzer", href: "/tools/meta-tags-analyzer", desc: "Audit on-page SEO signals alongside headers" },
];

export default function HttpHeadersCheckerPage() {
    return (
        <>
            <HttpHeadersCheckerClient />

            <div className="border-t border-[var(--border)] mt-4">

                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-teal-500/10 text-teal-600 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free HTTP Headers Checker</h2>
                        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
                            HTTP headers are the silent signals your server sends to every browser and search engine bot. Our free checker strips back the curtain so you can validate caching, confirm security policies, and catch server misconfigurations before they cost you rankings.
                        </p>
                    </div>
                </section>

                {/* Security Header Grid */}
                <section className="px-6 py-14 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-3">Free Security Header Audit</h3>
                    <p className="text-center text-[var(--text-muted)] mb-10 max-w-2xl mx-auto text-sm">Our tool checks all six critical security headers and flags which are missing, misconfigured, or absent — protecting your users and your Google trust score.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {securityHeaders.map(h => (
                            <div key={h.abbr} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5 flex flex-col gap-2 hover:shadow-md hover:border-[var(--primary-muted)] transition-all">
                                <div className="flex items-center justify-between">
                                    <span className={`font-bold text-sm font-mono ${h.color}`}>{h.abbr}</span>
                                </div>
                                <h4 className="font-semibold text-sm">{h.name}</h4>
                                <p className="text-[var(--text-muted)] text-xs leading-relaxed">{h.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-[var(--surface-1)] px-6 py-14">
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-2xl font-bold mb-10 text-center">How the Free HTTP Headers Checker Works</h3>
                        <ol className="space-y-6">
                            {[
                                { step: "1", title: "Enter Any URL", body: "Paste any web address and click Analyze. Our server makes a direct HTTP request to the target, capturing the exact headers as they are returned — bypassing browser caches and client-side modifications." },
                                { step: "2", title: "Raw Header Display", body: "Every response header is shown exactly as delivered: key, value, and any nested directives. Nothing is hidden, normalized, or filtered — you see what Google sees." },
                                { step: "3", title: "Security Header Audit", body: "We cross-reference the response against the six most critical security headers and return a clear Pass/Fail for each. Missing headers are prominently flagged with remediation guidance." },
                                { step: "4", title: "Caching & Performance Insights", body: "Cache-Control, Expires, ETag, and Vary headers are extracted and displayed so you can immediately verify whether your CDN or origin server is caching responses as intended." },
                            ].map(s => (
                                <li key={s.step} className="flex gap-5 items-start">
                                    <div className="size-9 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center shrink-0">{s.step}</div>
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
                        <h3 className="text-2xl font-bold mb-3">Why Missing Security Headers Hurt SEO</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Google operates a Safe Browsing program that actively scans websites for malware, phishing, and deceptive content. Sites that get flagged are demoted in rankings or completely removed from search results. Implementing robust security headers such as CSP and HSTS dramatically reduces the attack surface that hackers exploit to inject malicious content — protecting both your users and your Google ranking.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-2xl font-bold mb-3">Caching Headers: The Free Performance Win</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Page speed is a confirmed Google ranking factor. Correct <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded text-xs font-mono">Cache-Control</code> headers with aggressive max-age values (e.g., <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded text-xs font-mono">max-age=31536000</code> for static assets) mean returning visitors load JavaScript, CSS, and images from their local browser cache rather than from your server. This cuts load times by 60 to 80 percent for repeat visits and dramatically improves Core Web Vitals scores.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-2xl font-bold mb-3">Validating Your CDN With Response Headers</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">If you use Cloudflare, Fastly, or AWS CloudFront, you are paying for edge caching. Our tool shows CDN-injected headers like <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded text-xs font-mono">cf-cache-status: HIT</code> or <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded text-xs font-mono">x-cache: Miss from cloudfront</code>. A persistent MISS status means every request hits your origin server — you are paying for a CDN that is not caching. Our free checker makes this immediately visible.</p>
                    </div>
                </section>

                <section className="bg-[var(--surface-1)] px-6 py-12">
                    <div className="max-w-5xl mx-auto">
                        <h3 className="text-xl font-bold mb-6">Continue Your Technical SEO Audit</h3>
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
