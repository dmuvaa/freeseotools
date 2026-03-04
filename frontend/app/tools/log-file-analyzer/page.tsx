import { Metadata } from "next";
import Link from "next/link";
import LogFileAnalyzerClient from "./client";

export const metadata: Metadata = {
    title: "Free SEO Log File Analyzer | See How Googlebot Crawls Your Site",
    description: "Free SEO Log File Analyzer: Upload your Apache or Nginx access log to see Googlebot crawl frequency, status code distribution, most-crawled URLs, and wasted crawl budget.",
};

export default function LogFileAnalyzerPage() {
    return (
        <>
            <LogFileAnalyzerClient />
            <div className="border-t border-[var(--border)] mt-4">
                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-600 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free SEO Log File Analyzer</h2>
                        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">Log files are the most honest data source in SEO — they show exactly what happened between your server and the bot, with no sampling, no estimation, and no API limits. Our free analyzer extracts every insight in seconds.</p>
                    </div>
                </section>
                <section className="px-6 py-12 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-8">What Log File SEO Analysis Reveals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: "📊", title: "True Crawl Frequency", color: "from-slate-500/20 to-gray-500/10 border-slate-500/20", desc: "Which pages is Googlebot visiting daily, weekly, or never? Log data reveals Google's actual crawl priority for your site — often very different from what you assume based on content quality alone." },
                            { icon: "💥", title: "Bot Error Exposure", color: "from-red-500/20 to-rose-500/10 border-red-500/20", desc: "Repeated 404 errors, 500 server errors, and timeout responses to Googlebot are invisible from Google Search Console until they cause index coverage issues. Log files show you every error in real time." },
                            { icon: "🕵️", title: "Multi-Bot Analysis", color: "from-blue-500/20 to-indigo-500/10 border-blue-500/20", desc: "Our analyzer identifies Googlebot, Bingbot, AhrefsBot, SemrushBot, and other major crawlers separately — so you can compare how different engines allocate resources across your site differently." },
                        ].map(f => (
                            <div key={f.title} className={`rounded-2xl border bg-gradient-to-br ${f.color} p-6`}>
                                <div className="text-4xl mb-3">{f.icon}</div>
                                <h4 className="font-bold text-lg mb-2">{f.title}</h4>
                                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="bg-[var(--surface-1)] px-6 py-12">
                    <div className="max-w-4xl mx-auto space-y-5">
                        <h3 className="text-2xl font-bold">How to Download Your Access Log</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">For Apache servers, access logs are typically located at <code className="bg-[var(--surface-2)] px-1.5 py-0.5 rounded text-xs font-mono">/var/log/apache2/access.log</code>. For Nginx servers, look at <code className="bg-[var(--surface-2)] px-1.5 py-0.5 rounded text-xs font-mono">/var/log/nginx/access.log</code>. If you're on managed hosting (WP Engine, Kinsta, SiteGround), check your hosting control panel's "Logs" section. Our free analyzer supports the Combined Log Format used by both Apache and Nginx by default.</p>
                        <p className="text-[var(--text-muted)] leading-relaxed">After analyzing your logs, verify findings against your <Link href="/tools/crawl-budget-simulator" className="text-[var(--primary)] hover:underline font-medium">Free Crawl Budget Simulator</Link> to understand whether the wasted crawl paths you see in the logs are caused by robots.txt gaps or internal linking patterns discovered by the <Link href="/tools/internal-link-audit" className="text-[var(--primary)] hover:underline font-medium">Free Internal Link Audit Tool</Link>.</p>
                    </div>
                </section>
                <section className="px-6 py-10 max-w-5xl mx-auto">
                    <h3 className="text-lg font-bold mb-4">Free Technical SEO Tools</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: "Free Crawl Budget Simulator", href: "/tools/crawl-budget-simulator", desc: "Analyze crawl priority and waste" },
                            { name: "Free Robots.txt Tester", href: "/tools/robots-txt-tester", desc: "Validate crawler access rules" },
                            { name: "Free Internal Link Audit Tool", href: "/tools/internal-link-audit", desc: "Discover orphan pages" },
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
