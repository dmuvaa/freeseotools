"use client";
import { useState } from "react";

function SERPPreview({ title, desc, url, truncatedTitle }: { title: string; desc: string; url: string; truncatedTitle: string | null }) {
    const displayTitle = truncatedTitle || title;
    const displayDesc = desc.length > 155 ? desc.slice(0, 155) + "..." : desc;
    return (
        <div className="rounded-xl border border-[var(--border)] bg-white dark:bg-[var(--surface-1)] p-5 space-y-1 font-sans shadow-sm">
            <p className="text-xs text-[var(--text-muted)] truncate">{url}</p>
            <p className="text-xl text-[#1a0dab] dark:text-blue-400 font-medium leading-snug cursor-pointer hover:underline" style={{ fontFamily: "Arial, sans-serif" }}>{displayTitle}</p>
            {truncatedTitle && <p className="text-xs text-amber-600">⚠️ Title truncated — shown above is how it appears in SERPs</p>}
            <p className="text-sm text-[#4d5156] dark:text-[var(--text-muted)] leading-relaxed" style={{ fontFamily: "Arial, sans-serif" }}>{displayDesc}</p>
        </div>
    );
}

export default function SerpSnippetClient() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError(""); setResult(null);
        try {
            const res = await fetch("/api/tools/serp-snippet", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setResult(data);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    const riskColor = (r: string) => r === "high" ? "#ef4444" : r === "medium" ? "#f59e0b" : "#10b981";

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">SERP Snippet Extractor</h1>
                <p className="text-[var(--text-muted)]">Extract title and meta description, estimate pixel-accurate truncation in Google SERPs, detect rewrite risk, and preview exactly how your snippet appears in search results.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://yourdomain.com/your-page"
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition" />
                <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 transition">
                    {loading ? "Extracting..." : "Extract Snippet"}
                </button>
            </form>

            {loading && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-10 text-center animate-pulse">
                    <div className="text-5xl mb-3">🔍</div>
                    <p className="font-semibold mb-1">Fetching and analyzing page snippet...</p>
                </div>
            )}

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm">{error}</div>}

            {result && (
                <div className="space-y-6">
                    {/* SERP Preview */}
                    <div>
                        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2">Google SERP Preview</p>
                        <SERPPreview title={result.title} desc={result.metaDesc} url={result.url} truncatedTitle={result.analysis.truncatedTitle} />
                    </div>

                    {/* Rewrite Risk */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5 flex items-start gap-4">
                        <div className="size-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5" style={{ background: riskColor(result.analysis.rewriteRisk) }}>
                            {result.analysis.rewriteRisk === "high" ? "!" : result.analysis.rewriteRisk === "medium" ? "~" : "✓"}
                        </div>
                        <div>
                            <p className="font-semibold capitalize">{result.analysis.rewriteRisk} Rewrite Risk</p>
                            {result.analysis.rewriteReasons.length > 0
                                ? <ul className="text-sm text-[var(--text-muted)] list-disc list-inside mt-1 space-y-0.5">{result.analysis.rewriteReasons.map((r: string, i: number) => <li key={i}>{r}</li>)}</ul>
                                : <p className="text-sm text-[var(--text-muted)] mt-1">Title looks good — low risk of Google rewriting it.</p>
                            }
                        </div>
                    </div>

                    {/* Metrics table */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-[var(--border)] bg-[var(--surface-2)]"><th className="text-left p-3 text-xs font-semibold">Field</th><th className="text-left p-3 text-xs font-semibold">Value</th><th className="text-left p-3 text-xs font-semibold">Status</th></tr></thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {[
                                    { field: "Title", value: result.title || "—", status: result.analysis.titleTruncated ? "⚠️ Truncated" : result.title ? "✅ OK" : "❌ Missing" },
                                    { field: "Title Length", value: `${result.analysis.titleLength} chars / ~${result.analysis.titlePx}px`, status: result.analysis.titlePx > 600 ? "⚠️ Over limit (600px)" : "✅ OK" },
                                    { field: "Meta Description", value: result.metaDesc || "—", status: result.analysis.descTruncated ? "⚠️ Truncated" : result.metaDesc ? "✅ OK" : "❌ Missing" },
                                    { field: "Desc Length", value: `${result.analysis.descLength} chars / ~${result.analysis.descPx}px`, status: result.analysis.descPx > 960 ? "⚠️ Over limit" : "✅ OK" },
                                    { field: "OG Title", value: result.ogTitle || "—", status: result.ogTitle ? "✅" : "ℹ️ Not set" },
                                    { field: "H1", value: result.h1 || "—", status: result.h1 ? "✅" : "❌ Missing" },
                                    { field: "Canonical", value: result.canonical || "—", status: result.canonical ? "✅" : "⚠️ Not set" },
                                ].map(({ field, value, status }) => (
                                    <tr key={field}>
                                        <td className="p-3 font-medium text-xs text-[var(--text-muted)] w-36">{field}</td>
                                        <td className="p-3 text-xs max-w-xs truncate">{value}</td>
                                        <td className="p-3 text-xs whitespace-nowrap">{status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
