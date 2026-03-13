"use client";
import { useState } from "react";

export default function CrawlBudgetClient() {
    const [domain, setDomain] = useState("");
    const [sitemapUrl, setSitemapUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!domain) return;
        
        let tDomain = domain;
        if (!/^https?:\/\//i.test(tDomain)) tDomain = 'https://' + tDomain;
        setDomain(tDomain);

        let tSitemapUrl = sitemapUrl;
        if (tSitemapUrl && !/^https?:\/\//i.test(tSitemapUrl)) {
            tSitemapUrl = 'https://' + tSitemapUrl;
            setSitemapUrl(tSitemapUrl);
        }

        setLoading(true); setError(""); setResult(null);
        try {
            const res = await fetch("/api/tools/crawl-budget", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain: tDomain, sitemapUrl: tSitemapUrl }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setResult(data);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    const scoreColor = (s: number) => s >= 80 ? "text-green-500" : s >= 50 ? "text-yellow-500" : "text-red-500";
    const scoreBg = (s: number) => s >= 80 ? "from-green-500/20 to-emerald-500/10 border-green-500/30" : s >= 50 ? "from-yellow-500/20 to-amber-500/10 border-yellow-500/30" : "from-red-500/20 to-rose-500/10 border-red-500/30";

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Free Crawl Budget Simulator</h1>
                <p className="text-[var(--text-muted)]">Estimate how efficiently search engines allocate crawl resources across your website.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 mb-8">
                <input type="text" value={domain} onChange={e => setDomain(e.target.value)} required placeholder="yourdomain.com"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition"
                />
                <input type="text" value={sitemapUrl} onChange={e => setSitemapUrl(e.target.value)} placeholder="Sitemap URL (optional): https://yourdomain.com/sitemap.xml"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition"
                />
                <button type="submit" disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors">
                    {loading ? "Analyzing..." : "Simulate Crawl Budget"}
                </button>
            </form>

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm mb-4">{error}</div>}

            {result && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className={`rounded-xl border bg-gradient-to-br ${scoreBg(result.summary.crawlEfficiencyScore)} p-5 col-span-2 md:col-span-1 text-center`}>
                            <div className={`text-4xl font-extrabold ${scoreColor(result.summary.crawlEfficiencyScore)}`}>{result.summary.crawlEfficiencyScore}</div>
                            <div className="text-xs mt-1 text-[var(--text-muted)]">Crawl Efficiency Score</div>
                        </div>
                        {[
                            { label: "Sitemap URLs", value: result.summary.totalSitemapUrls },
                            { label: "Parameterized URLs", value: result.summary.parameterizedUrls, warn: result.summary.parameterizedUrls > 0 },
                            { label: "Blocked Important Pages", value: result.summary.blockedImportantPages, warn: result.summary.blockedImportantPages > 0 },
                        ].map(s => (
                            <div key={s.label} className={`rounded-xl border p-5 text-center ${s.warn ? "border-orange-500/30 bg-orange-500/5" : "border-[var(--border)] bg-[var(--surface-1)]"}`}>
                                <div className={`text-2xl font-bold ${s.warn ? "text-orange-500" : ""}`}>{s.value}</div>
                                <div className="text-xs text-[var(--text-muted)] mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Crawl Tiers */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                        <h3 className="font-semibold mb-4">Estimated Crawl Priority Tiers</h3>
                        <div className="space-y-3">
                            {result.tiers.map((t: any, i: number) => {
                                const colors = ["bg-green-500", "bg-blue-500", "bg-yellow-500", "bg-red-500"];
                                return (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`size-2.5 rounded-full shrink-0 ${colors[i]}`} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{t.tier}</p>
                                            <p className="text-xs text-[var(--text-muted)]">{t.desc}</p>
                                        </div>
                                        <span className="text-sm font-mono font-semibold">{t.count} URLs</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {result.blockedImportant?.length > 0 && (
                        <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-5">
                            <h3 className="font-semibold mb-3 text-orange-600">⚠️ Blocked Important Pages ({result.blockedImportant.length})</h3>
                            <div className="space-y-1">
                                {result.blockedImportant.map((u: string, i: number) => (
                                    <p key={i} className="text-xs font-mono text-[var(--text-muted)]">{u}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {result.wastedPaths?.length > 0 && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                            <h3 className="font-semibold mb-3">Parameterized / Wasted Crawl Paths</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                {result.wastedPaths.map((u: string, i: number) => (
                                    <p key={i} className="text-xs font-mono text-[var(--text-muted)] truncate">{u}</p>
                                ))}
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mt-3">Recommend: Add these paths to your robots.txt Disallow rules or use canonical tags.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
