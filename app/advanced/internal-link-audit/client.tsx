"use client";
import { useState } from "react";

const LIMIT_OPTIONS = [25, 50, 100];

export default function InternalLinkAuditClient() {
    const [domain, setDomain] = useState("");
    const [limit, setLimit] = useState(25);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"orphans" | "overlinked" | "deep" | "all">("orphans");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!domain) return;
        let tDomain = domain;
        if (!/^https?:\/\//i.test(tDomain)) {
            tDomain = 'https://' + tDomain;
        }
        setDomain(tDomain);
        setLoading(true); setError(""); setResult(null);
        try {
            const res = await fetch("/api/tools/internal-link-audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain: tDomain, limit }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setResult(data);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    const tabs = [
        { key: "orphans", label: "Orphan Pages", count: result?.summary?.orphanCount },
        { key: "overlinked", label: "Over-Linked", count: result?.overLinked?.length },
        { key: "deep", label: "Deep Pages (3+ clicks)", count: result?.summary?.deepPageCount },
        { key: "all", label: "All Pages", count: result?.summary?.totalCrawled },
    ] as const;

    const tableData = {
        orphans: result?.orphans || [],
        overlinked: result?.overLinked || [],
        deep: result?.deepPages || [],
        all: result?.pages?.slice(0, 100) || [],
    };

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Free Internal Link Audit Tool</h1>
                <p className="text-[var(--text-muted)]">Crawl your website to uncover orphan pages, link depth issues, and crawl inefficiencies.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 mb-8">
                <input
                    type="text" value={domain} onChange={e => setDomain(e.target.value)} required
                    placeholder="yourdomain.com"
                    className="flex-1 min-w-[200px] rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition"
                />
                <select
                    value={limit} onChange={e => setLimit(+e.target.value)}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none cursor-pointer"
                >
                    {LIMIT_OPTIONS.map(l => <option key={l} value={l}>Crawl up to {l} pages</option>)}
                </select>
                <button
                    type="submit" disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors"
                >
                    {loading ? "Crawling..." : "Start Audit"}
                </button>
            </form>

            {loading && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-8 text-center animate-pulse">
                    <div className="text-4xl mb-3">🕷️</div>
                    <p className="font-semibold">Crawling your website...</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Following internal links up to {limit} pages. This may take up to 30 seconds.</p>
                </div>
            )}

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm">{error}</div>}

            {result && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: "Pages Crawled", value: result.summary.totalCrawled },
                            { label: "Total Links", value: result.summary.totalLinks },
                            { label: "Orphan Pages", value: result.summary.orphanCount, warn: result.summary.orphanCount > 0 },
                            { label: "Avg Links/Page", value: result.summary.avgLinksPerPage },
                            { label: "Deep Pages (>3 clicks)", value: result.summary.deepPageCount, warn: result.summary.deepPageCount > 0 },
                        ].map(s => (
                            <div key={s.label} className={`rounded-xl border p-4 text-center ${s.warn ? "border-orange-500/30 bg-orange-500/5" : "border-[var(--border)] bg-[var(--surface-1)]"}`}>
                                <div className={`text-2xl font-bold ${s.warn ? "text-orange-500" : ""}`}>{s.value}</div>
                                <div className="text-xs text-[var(--text-muted)] mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                        <div className="flex gap-0 border-b border-[var(--border)] overflow-x-auto">
                            {tabs.map(t => (
                                <button key={t.key} onClick={() => setActiveTab(t.key)}
                                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === t.key ? "bg-[var(--primary)] text-white" : "text-[var(--text-muted)] hover:text-[var(--foreground)]"}`}>
                                    {t.label} {t.count !== undefined ? `(${t.count})` : ""}
                                </button>
                            ))}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">URL</th>
                                        <th className="px-4 py-3 text-center font-medium text-[var(--text-muted)]">Depth</th>
                                        <th className="px-4 py-3 text-center font-medium text-[var(--text-muted)]">In-Links</th>
                                        <th className="px-4 py-3 text-center font-medium text-[var(--text-muted)]">Out-Links</th>
                                        <th className="px-4 py-3 text-center font-medium text-[var(--text-muted)]">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData[activeTab].length === 0
                                        ? <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--text-muted)]">No pages found in this category.</td></tr>
                                        : tableData[activeTab].map((p: any, i: number) => (
                                            <tr key={i} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-2)] transition-colors">
                                                <td className="px-4 py-3 font-mono text-xs max-w-xs truncate">
                                                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary)] hover:underline">{p.url}</a>
                                                </td>
                                                <td className="px-4 py-3 text-center">{p.depth}</td>
                                                <td className="px-4 py-3 text-center">{p.inLinkCount}</td>
                                                <td className="px-4 py-3 text-center">{p.outLinkCount}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.status === 200 ? "bg-green-500/10 text-green-600" : p.status >= 400 ? "bg-red-500/10 text-red-600" : "bg-gray-500/10 text-[var(--text-muted)]"}`}>{p.status || "?"}</span>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
