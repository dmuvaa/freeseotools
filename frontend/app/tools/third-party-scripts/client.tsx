"use client";
import { useState } from "react";

const CATEGORY_COLORS: Record<string, string> = {
    Analytics: "#6366f1",
    Ads: "#ef4444",
    Social: "#3b82f6",
    Fonts: "#f59e0b",
    CDN: "#10b981",
    Support: "#8b5cf6",
    Performance: "#ec4899",
    Other: "#6b7280",
};

export default function ThirdPartyScriptsClient() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError(""); setResult(null);
        try {
            const res = await fetch("/api/tools/third-party-scripts", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setResult(data);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    const categoryEntries = result ? Object.entries(result.byCategory).sort(([, a]: any, [, b]: any) => b.sizeKb - a.sizeKb) : [];
    const totalKb = categoryEntries.reduce((s: number, [, v]: any) => s + v.sizeKb, 0) || 1;

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Third-Party Script Impact Checker</h1>
                <p className="text-[var(--text-muted)]">Load a page with a real browser and capture every third-party request. Categorizes external scripts into Analytics, Ads, Social, CDN, Fonts, and more — with total weight and performance impact.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://yourdomain.com"
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition" />
                <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 transition">
                    {loading ? "Analyzing..." : "Scan Scripts"}
                </button>
            </form>

            {loading && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-10 text-center animate-pulse">
                    <div className="text-5xl mb-3">🌐</div>
                    <p className="font-semibold mb-1">Loading page and capturing third-party requests...</p>
                    <p className="text-sm text-[var(--text-muted)]">Playwright is recording all network requests. Takes 20–35 seconds.</p>
                </div>
            )}

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm">{error}</div>}

            {result && (
                <div className="space-y-6">
                    {/* Totals */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Total 3rd-Party Requests", value: result.summary.totalRequests, color: result.summary.totalRequests > 30 ? "#ef4444" : result.summary.totalRequests > 10 ? "#f59e0b" : "#10b981" },
                            { label: "Total Weight", value: `${result.summary.totalKb} KB`, color: result.summary.totalKb > 500 ? "#ef4444" : result.summary.totalKb > 200 ? "#f59e0b" : "#10b981" },
                            { label: "Unique Domains", value: result.summary.uniqueDomains, color: "var(--foreground)" },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-center">
                                <div className="text-2xl font-bold" style={{ color }}>{value}</div>
                                <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Category breakdown */}
                    {categoryEntries.length > 0 && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                            <h3 className="font-semibold mb-4">By Category</h3>
                            <div className="space-y-3">
                                {categoryEntries.map(([cat, stats]: any) => {
                                    const color = CATEGORY_COLORS[cat] || "#6b7280";
                                    const pct = (stats.sizeKb / totalKb) * 100;
                                    return (
                                        <div key={cat}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium flex items-center gap-2">
                                                    <span className="size-2.5 rounded-full shrink-0" style={{ background: color }} />
                                                    {cat}
                                                </span>
                                                <span className="text-[var(--text-muted)]">{stats.count} requests · {stats.sizeKb.toFixed(1)} KB</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-[var(--surface-2)]">
                                                <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Script list */}
                    {result.scripts.length > 0 && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                            <div className="p-4 border-b border-[var(--border)]">
                                <h3 className="font-semibold">Individual Third-Party Scripts ({result.scripts.length})</h3>
                            </div>
                            <div className="divide-y divide-[var(--border)] max-h-[400px] overflow-y-auto">
                                {result.scripts.map((s: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-3">
                                        <span className="size-2.5 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[s.category] || "#6b7280" }} />
                                        <div className="flex-1 min-w-0">
                                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--text-muted)] hover:text-[var(--primary)] truncate block">{s.url}</a>
                                        </div>
                                        <span className="text-xs text-[var(--text-muted)] shrink-0">{s.sizeKb > 0 ? `${s.sizeKb} KB` : "—"}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
