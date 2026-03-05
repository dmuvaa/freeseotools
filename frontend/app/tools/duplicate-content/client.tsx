"use client";
import { useState } from "react";

function SimilarityBadge({ pct }: { pct: number }) {
    const color = pct >= 80 ? "#ef4444" : pct >= 60 ? "#f59e0b" : "#10b981";
    return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>{pct}% similar</span>;
}

export default function DuplicateContentClient() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");
    const [tab, setTab] = useState<"clusters" | "titles" | "metas">("clusters");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError(""); setResult(null);
        try {
            const res = await fetch("/api/tools/duplicate-content", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
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
                <h1 className="text-3xl font-bold mb-2">Duplicate Content Cluster Finder</h1>
                <p className="text-[var(--text-muted)]">Crawl a domain, compute content similarity between pages using Jaccard analysis, and surface near-duplicate content clusters, duplicate titles, and repeated meta descriptions.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://yourdomain.com"
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition" />
                <button type="submit" disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 transition">
                    {loading ? "Crawling..." : "Find Duplicates"}
                </button>
            </form>

            {loading && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-10 text-center animate-pulse">
                    <div className="text-5xl mb-3">📋</div>
                    <p className="font-semibold mb-1">Crawling and comparing pages...</p>
                    <p className="text-sm text-[var(--text-muted)]">Fetching up to 30 pages and computing content similarity. Takes 30–60 seconds.</p>
                </div>
            )}

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm">{error}</div>}

            {result && (
                <div className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: "Pages Crawled", value: result.pagesCrawled, color: "var(--foreground)" },
                            { label: "Near-Duplicates (≥80%)", value: result.summary.highSimilarity, color: result.summary.highSimilarity > 0 ? "#ef4444" : "#10b981" },
                            { label: "Duplicate Titles", value: result.summary.duplicateTitleCount, color: result.summary.duplicateTitleCount > 0 ? "#f59e0b" : "#10b981" },
                            { label: "Duplicate Metas", value: result.summary.duplicateMetaCount, color: result.summary.duplicateMetaCount > 0 ? "#f59e0b" : "#10b981" },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-center">
                                <div className="text-2xl font-bold" style={{ color }}>{value}</div>
                                <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                        <div className="flex border-b border-[var(--border)]">
                            {[
                                { key: "clusters", label: `Content Clusters (${result.clusters.length})` },
                                { key: "titles", label: `Dup. Titles (${result.duplicateTitles.length})` },
                                { key: "metas", label: `Dup. Metas (${result.duplicateMetas.length})` },
                            ].map(({ key, label }) => (
                                <button key={key} onClick={() => setTab(key as any)}
                                    className={`px-4 py-3 text-sm font-medium transition-colors ${tab === key ? "border-b-2 border-[var(--primary)] text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-[var(--foreground)]"}`}>
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="divide-y divide-[var(--border)] max-h-[450px] overflow-y-auto">
                            {tab === "clusters" && (
                                result.clusters.length === 0
                                    ? <p className="p-6 text-sm text-green-600 text-center">✅ No near-duplicate content clusters found.</p>
                                    : result.clusters.map((c: any, i: number) => (
                                        <div key={i} className="p-4">
                                            <div className="flex items-center gap-2 mb-2"><SimilarityBadge pct={c.similarity} /></div>
                                            <a href={c.url1} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary)] hover:underline block truncate">{c.url1}</a>
                                            <a href={c.url2} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary)] hover:underline block truncate">{c.url2}</a>
                                        </div>
                                    ))
                            )}
                            {tab === "titles" && (
                                result.duplicateTitles.length === 0
                                    ? <p className="p-6 text-sm text-green-600 text-center">✅ No duplicate title tags found.</p>
                                    : result.duplicateTitles.map((d: any, i: number) => (
                                        <div key={i} className="p-4">
                                            <p className="text-sm font-medium mb-1">"{d.title}"</p>
                                            {d.urls.map((u: string, j: number) => (
                                                <a key={j} href={u} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary)] hover:underline block truncate">{u}</a>
                                            ))}
                                        </div>
                                    ))
                            )}
                            {tab === "metas" && (
                                result.duplicateMetas.length === 0
                                    ? <p className="p-6 text-sm text-green-600 text-center">✅ No duplicate meta descriptions found.</p>
                                    : result.duplicateMetas.map((d: any, i: number) => (
                                        <div key={i} className="p-4">
                                            <p className="text-sm text-[var(--text-muted)] mb-1 italic">"{d.meta}..."</p>
                                            {d.urls.map((u: string, j: number) => (
                                                <a key={j} href={u} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary)] hover:underline block truncate">{u}</a>
                                            ))}
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
