"use client";
import { useState } from "react";

export default function OrphanPagesClient() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");
    const [tab, setTab] = useState<"orphans" | "unlisted">("orphans");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!url) return;
        let targetUrl = url;
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
        }
        setUrl(targetUrl);
        setLoading(true); setError(""); setResult(null);
        try {
            const res = await fetch("/api/tools/orphan-pages", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: targetUrl }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setResult(data);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Orphan Page Finder</h1>
                <p className="text-[var(--text-muted)]">Compare your sitemap URLs against pages discovered by crawling internal links. Find orphan pages (in sitemap but never linked to) and pages that are linked but missing from your sitemap.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://yourdomain.com"
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition" />
                <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 transition">
                    {loading ? "Scanning..." : "Find Orphans"}
                </button>
            </form>

            {loading && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-10 text-center animate-pulse">
                    <div className="text-5xl mb-3">🌐</div>
                    <p className="font-semibold mb-1">Fetching sitemap and crawling links...</p>
                    <p className="text-sm text-[var(--text-muted)]">Comparing sitemap URLs vs crawled pages. Takes 30–60 seconds.</p>
                </div>
            )}

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm">{error}</div>}

            {result && (
                <div className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: "Sitemap URLs", value: result.sitemapUrlCount },
                            { label: "Pages Crawled", value: result.crawledUrlCount },
                            { label: "Orphan Pages", value: result.summary.orphanCount, color: result.summary.orphanCount > 0 ? "#ef4444" : "#10b981" },
                            { label: "Unlisted Pages", value: result.summary.unlistedCount, color: result.summary.unlistedCount > 0 ? "#f59e0b" : "#10b981" },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-center">
                                <div className="text-2xl font-bold" style={{ color: color || "var(--foreground)" }}>{value}</div>
                                <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>
                            </div>
                        ))}
                    </div>

                    {result.sitemapUrlCount === 0 && (
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-700 text-sm">
                            ⚠️ No sitemap.xml found at /sitemap.xml or /sitemap_index.xml. Orphan detection requires a sitemap. Add a sitemap and try again.
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                        <div className="flex border-b border-[var(--border)]">
                            {[
                                { key: "orphans", label: `🔇 Orphan Pages (${result.summary.orphanCount})`, desc: "In sitemap, but never linked internally" },
                                { key: "unlisted", label: `📋 Unlisted Pages (${result.summary.unlistedCount})`, desc: "Linked internally, but not in sitemap" },
                            ].map(({ key, label }) => (
                                <button key={key} onClick={() => setTab(key as any)}
                                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${tab === key ? "border-b-2 border-[var(--primary)] text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-[var(--foreground)]"}`}>
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="divide-y divide-[var(--border)] max-h-[450px] overflow-y-auto">
                            {tab === "orphans" && (
                                result.orphans.length === 0
                                    ? <p className="p-6 text-sm text-green-600 text-center">✅ No orphan pages detected — all sitemap URLs are linked internally.</p>
                                    : result.orphans.map((u: string, i: number) => (
                                        <div key={i} className="flex items-center gap-3 p-3">
                                            <span className="text-red-500 shrink-0">⚠</span>
                                            <a href={u} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary)] hover:underline truncate">{u}</a>
                                        </div>
                                    ))
                            )}
                            {tab === "unlisted" && (
                                result.unlisted.length === 0
                                    ? <p className="p-6 text-sm text-green-600 text-center">✅ All crawled pages are present in the sitemap.</p>
                                    : result.unlisted.map((u: string, i: number) => (
                                        <div key={i} className="flex items-center gap-3 p-3">
                                            <span className="text-amber-500 shrink-0">ℹ</span>
                                            <a href={u} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary)] hover:underline truncate">{u}</a>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
