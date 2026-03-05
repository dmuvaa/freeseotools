"use client";
import { useState } from "react";

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: color || "var(--foreground)" }}>{value}</div>
            <div className="text-xs font-semibold mt-1">{label}</div>
            {sub && <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{sub}</div>}
        </div>
    );
}

export default function JsSEODiffClient() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"links" | "content">("links");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError(""); setResult(null);
        try {
            const res = await fetch("/api/tools/js-seo-diff", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setResult(data);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    const diffColor = (n: number) => n > 50 ? "#ef4444" : n > 10 ? "#f59e0b" : "#10b981";

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">JavaScript SEO Diff Tool</h1>
                <p className="text-[var(--text-muted)]">Compare raw HTML (what Googlebot sees without JS) vs the fully rendered DOM. Find content and links that only exist after JavaScript runs — a common cause of indexing failures on React, Vue, and Next.js sites.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://yourdomain.com"
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition" />
                <button type="submit" disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 transition">
                    {loading ? "Analyzing..." : "Diff Page"}
                </button>
            </form>

            {loading && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-10 text-center animate-pulse">
                    <div className="text-5xl mb-3">🔍</div>
                    <p className="font-semibold mb-1">Fetching raw HTML & rendering with browser...</p>
                    <p className="text-sm text-[var(--text-muted)]">Playwright is rendering the full DOM. This takes 20–40 seconds for JS-heavy sites.</p>
                </div>
            )}

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm">{error}</div>}

            {result && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${result.diff.similarity >= 80 ? "bg-green-500/10 text-green-600" : result.diff.similarity >= 50 ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"}`}>
                                {result.diff.similarity}% content similarity
                            </div>
                            <span className="text-xs text-[var(--text-muted)]">Raw HTML vs Rendered DOM — {result.diff.similarity < 70 ? "⚠️ Significant JS rendering gap detected" : "✅ Content mostly present in raw HTML"}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <StatCard label="Raw Word Count" value={result.raw.wordCount.toLocaleString()} sub="Without JS" />
                            <StatCard label="Rendered Word Count" value={result.rendered.wordCount.toLocaleString()} sub="After JS executes" />
                            <StatCard label="JS-Only Links" value={result.diff.jsOnlyLinks.length} sub="Missing from raw HTML" color={result.diff.jsOnlyLinks.length > 5 ? "#ef4444" : "#10b981"} />
                            <StatCard label="JS-Only Content" value={result.diff.jsOnlyContent.length} sub="Text not in raw HTML" color={result.diff.jsOnlyContent.length > 5 ? "#f59e0b" : "#10b981"} />
                        </div>
                    </div>

                    {/* Word count comparison bar */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                        <h3 className="font-semibold mb-4">Word Count Comparison</h3>
                        <div className="space-y-3">
                            {[
                                { label: "Raw HTML (Googlebot without JS)", count: result.raw.wordCount, color: "#6366f1" },
                                { label: "Rendered DOM (with JavaScript)", count: result.rendered.wordCount, color: "#10b981" },
                            ].map(({ label, count, color }) => {
                                const max = Math.max(result.raw.wordCount, result.rendered.wordCount);
                                const pct = max > 0 ? (count / max) * 100 : 0;
                                return (
                                    <div key={label}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-[var(--text-muted)]">{label}</span>
                                            <span className="font-semibold">{count.toLocaleString()} words</span>
                                        </div>
                                        <div className="h-3 rounded-full bg-[var(--surface-2)]">
                                            <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {result.diff.wordCountDiff > 0 && (
                            <p className="text-sm mt-3 text-amber-600">
                                ⚠️ {result.diff.wordCountDiff.toLocaleString()} words only exist after JavaScript runs. If Googlebot can't render JS, this content won't be indexed.
                            </p>
                        )}
                    </div>

                    {/* Tabs: JS-only links / content */}
                    {(result.diff.jsOnlyLinks.length > 0 || result.diff.jsOnlyContent.length > 0) && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                            <div className="flex gap-2 mb-4">
                                <button onClick={() => setActiveTab("links")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "links" ? "bg-[var(--primary)] text-white" : "text-[var(--text-muted)] hover:bg-[var(--surface-2)]"}`}>
                                    JS-Only Links ({result.diff.jsOnlyLinks.length})
                                </button>
                                <button onClick={() => setActiveTab("content")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "content" ? "bg-[var(--primary)] text-white" : "text-[var(--text-muted)] hover:bg-[var(--surface-2)]"}`}>
                                    JS-Only Content ({result.diff.jsOnlyContent.length})
                                </button>
                            </div>
                            {activeTab === "links" && (
                                result.diff.jsOnlyLinks.length === 0
                                    ? <p className="text-sm text-green-600">✅ All links are present in raw HTML — no JS-only links detected.</p>
                                    : <div className="space-y-1.5 max-h-64 overflow-y-auto">
                                        {result.diff.jsOnlyLinks.map((link: string, i: number) => (
                                            <div key={i} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-red-500/5 border border-red-500/15">
                                                <span className="text-red-500">⚠</span>
                                                <a href={link} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline truncate">{link}</a>
                                            </div>
                                        ))}
                                    </div>
                            )}
                            {activeTab === "content" && (
                                result.diff.jsOnlyContent.length === 0
                                    ? <p className="text-sm text-green-600">✅ All significant content is present in raw HTML.</p>
                                    : <div className="space-y-1.5 max-h-64 overflow-y-auto">
                                        {result.diff.jsOnlyContent.map((snippet: string, i: number) => (
                                            <div key={i} className="text-xs p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15">
                                                <span className="text-amber-600">⚠ </span>{snippet}
                                                {snippet.length >= 100 && "..."}
                                            </div>
                                        ))}
                                    </div>
                            )}
                        </div>
                    )}

                    <p className="text-xs text-[var(--text-muted)] text-center">Raw HTML fetched with Googlebot user-agent · Rendered DOM via Playwright Chromium</p>
                </div>
            )}
        </div>
    );
}
