"use client";
import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS: Record<string, string> = {
    "exact match": "#ef4444",
    "partial match": "#f97316",
    branded: "#8b5cf6",
    "naked url": "#3b82f6",
    generic: "#6b7280",
};

export default function AnchorTextAnalyzerClient() {
    const [rawData, setRawData] = useState("");
    const [keyword, setKeyword] = useState("");
    const [brand, setBrand] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError(""); setResult(null);
        try {
            const res = await fetch("/api/tools/anchor-text", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rawData, keyword, brand }),
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
                <h1 className="text-3xl font-bold mb-2">Free Anchor Text Analyzer</h1>
                <p className="text-[var(--text-muted)]">Paste your backlink data (one URL + anchor per line, or anchor only) to analyze your link profile distribution.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 mb-8">
                <textarea value={rawData} onChange={e => setRawData(e.target.value)} required rows={7}
                    placeholder={"Paste anchor text data (one per line):\nhttps://example.com\tbest seo tool\nhttps://blog.com\tclick here\nbuy widgets online\nFree SEO Tools"}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm font-mono outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition resize-none"
                />
                <div className="flex flex-wrap gap-3">
                    <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Target keyword (e.g. seo tool)"
                        className="flex-1 min-w-[180px] rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition"
                    />
                    <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Brand terms (comma-separated)"
                        className="flex-1 min-w-[180px] rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition"
                    />
                    <button type="submit" disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors">
                        {loading ? "Analyzing..." : "Analyze Anchors"}
                    </button>
                </div>
            </form>

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm mb-4">{error}</div>}

            {result && (
                <div className="space-y-6">
                    {result.overOptimized && (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                            <p className="font-semibold text-red-600 mb-1">⚠️ Over-Optimization Risk Detected</p>
                            {result.warnings.map((w: string, i: number) => <p key={i} className="text-sm text-red-600">{w}</p>)}
                        </div>
                    )}
                    {!result.overOptimized && result.warnings?.length > 0 && (
                        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                            {result.warnings.map((w: string, i: number) => <p key={i} className="text-sm text-yellow-700">{w}</p>)}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                            <h3 className="font-semibold mb-4">Anchor Distribution</h3>
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie data={result.distribution} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={(props: any) => `${((props.percent ?? 0) * 100).toFixed(0)}%`}>
                                        {result.distribution.map((d: any, i: number) => (
                                            <Cell key={i} fill={COLORS[d.category] || "#94a3b8"} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: any, n: any) => [v, n]} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                            <h3 className="font-semibold mb-4">Distribution Breakdown</h3>
                            <div className="space-y-3">
                                {result.distribution.map((d: any) => (
                                    <div key={d.category}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="capitalize font-medium">{d.category}</span>
                                            <span className="text-[var(--text-muted)]">{d.count} ({d.percent}%)</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${d.percent}%`, background: COLORS[d.category] || "#94a3b8" }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                        <div className="p-4 border-b border-[var(--border)]"><h3 className="font-semibold">Anchor Samples (up to 100)</h3></div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-[var(--text-muted)]">Anchor Text</th>
                                        <th className="px-4 py-3 text-left text-[var(--text-muted)]">Category</th>
                                        <th className="px-4 py-3 text-left text-[var(--text-muted)]">Source URL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.anchors.map((a: any, i: number) => (
                                        <tr key={i} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-2)]">
                                            <td className="px-4 py-2.5 font-medium">{a.anchor}</td>
                                            <td className="px-4 py-2.5">
                                                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: COLORS[a.category] + "20", color: COLORS[a.category] }}>{a.category}</span>
                                            </td>
                                            <td className="px-4 py-2.5 text-xs text-[var(--text-muted)] truncate max-w-xs">{a.url || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
