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

export default function JsBundleAnalyzerClient() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");
    const [sortBy, setSortBy] = useState<"size" | "blocking">("size");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError(""); setResult(null);
        try {
            const res = await fetch("/api/tools/js-bundle-analyzer", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setResult(data);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    const sortedScripts = result?.scripts ? [...result.scripts].sort((a: any, b: any) => {
        if (sortBy === "blocking") return (b.isBlocking ? 1 : 0) - (a.isBlocking ? 1 : 0) || b.sizeKb - a.sizeKb;
        return b.sizeKb - a.sizeKb;
    }) : [];

    const maxSize = sortedScripts.length > 0 ? sortedScripts[0]?.sizeKb || 1 : 1;

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">JavaScript Bundle Analyzer</h1>
                <p className="text-[var(--text-muted)]">Load a page and intercept every JavaScript file delivered to the browser. See total JS weight, render-blocking scripts, and first vs third-party breakdown — all from Googlebot's performance perspective.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://yourdomain.com"
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition" />
                <button type="submit" disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 transition">
                    {loading ? "Analyzing..." : "Analyze Bundles"}
                </button>
            </form>

            {loading && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-10 text-center animate-pulse">
                    <div className="text-5xl mb-3">📦</div>
                    <p className="font-semibold mb-1">Loading page and intercepting JS requests...</p>
                    <p className="text-sm text-[var(--text-muted)]">Playwright is capturing network traffic. Takes 20–35 seconds.</p>
                </div>
            )}

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm">{error}</div>}

            {result && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: "Total JS Size", value: `${result.summary.totalSizeKb} KB`, color: result.summary.totalSizeKb > 500 ? "#ef4444" : result.summary.totalSizeKb > 200 ? "#f59e0b" : "#10b981" },
                            { label: "Script Files", value: result.summary.totalScripts, color: "var(--foreground)" },
                            { label: "Render-Blocking", value: result.summary.blockingCount, color: result.summary.blockingCount > 0 ? "#ef4444" : "#10b981" },
                            { label: "Third-Party", value: result.summary.thirdPartyCount, color: result.summary.thirdPartyCount > 5 ? "#f59e0b" : "#10b981" },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-center">
                                <div className="text-2xl font-bold" style={{ color }}>{value}</div>
                                <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Scripts table with visual bars */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                            <h3 className="font-semibold">Scripts ({result.scripts.length})</h3>
                            <div className="flex gap-2">
                                {(["size", "blocking"] as const).map(s => (
                                    <button key={s} onClick={() => setSortBy(s)}
                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${sortBy === s ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-2)] text-[var(--text-muted)]"}`}>
                                        Sort by {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="divide-y divide-[var(--border)] max-h-[480px] overflow-y-auto">
                            {sortedScripts.map((s: any, i: number) => (
                                <div key={i} className="p-3">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        {s.isBlocking && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/15 text-red-600">BLOCKING</span>}
                                        {s.isThirdParty && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-600">3RD PARTY</span>}
                                        <span className="text-xs font-semibold ml-auto shrink-0">{s.sizeKb} KB</span>
                                    </div>
                                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--text-muted)] hover:text-[var(--primary)] truncate block mb-1.5">{s.url}</a>
                                    <div className="h-1.5 rounded-full bg-[var(--surface-2)]">
                                        <div className="h-1.5 rounded-full" style={{ width: `${Math.min((s.sizeKb / maxSize) * 100, 100)}%`, background: s.isBlocking ? "#ef4444" : s.isThirdParty ? "#f59e0b" : "#6366f1" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
