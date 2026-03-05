"use client";
import { useState } from "react";

export default function PaginationAnalyzerClient() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError(""); setResult(null);
        try {
            const res = await fetch("/api/tools/pagination-analyzer", {
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
    const checkItem = (ok: boolean, label: string, detail?: string) => (
        <div className="flex items-start gap-3 py-3 border-b border-[var(--border)]/50 last:border-0">
            <span className="text-lg shrink-0">{ok ? "✅" : "⚠️"}</span>
            <div>
                <p className="text-sm font-medium">{label}</p>
                {detail && <p className="text-xs text-[var(--text-muted)] mt-0.5">{detail}</p>}
            </div>
        </div>
    );

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Pagination & Faceted Navigation Analyzer</h1>
                <p className="text-[var(--text-muted)]">Detect rel=prev/next links, faceted URL parameter explosion, pagination signals, and infinite scroll — the top causes of crawl budget waste and duplicate content on ecommerce sites.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://shop.example.com/products?category=shoes"
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition" />
                <button type="submit" disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 transition">
                    {loading ? "Analyzing..." : "Analyze"}
                </button>
            </form>

            {loading && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-10 text-center animate-pulse">
                    <div className="text-5xl mb-3">📄</div>
                    <p className="font-semibold mb-1">Analyzing pagination signals...</p>
                    <p className="text-sm text-[var(--text-muted)]">Fetching HTML and detecting infinite scroll via Playwright. Takes ~15 seconds.</p>
                </div>
            )}

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm">{error}</div>}

            {result && (
                <div className="space-y-6">
                    {/* Risk Badge */}
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5 flex items-center gap-4">
                        <div className="size-14 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ background: riskColor(result.risk) }}>
                            {result.risk === "high" ? "!" : result.risk === "medium" ? "~" : "✓"}
                        </div>
                        <div>
                            <p className="font-bold capitalize text-lg">{result.risk} Crawl Risk</p>
                            {result.riskFactors.length > 0
                                ? <ul className="text-sm text-[var(--text-muted)] list-disc list-inside mt-1 space-y-0.5">{result.riskFactors.map((f: string, i: number) => <li key={i}>{f}</li>)}</ul>
                                : <p className="text-sm text-[var(--text-muted)]">No significant pagination or faceted navigation issues detected.</p>
                            }
                        </div>
                    </div>

                    {/* Checklist */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                        <h3 className="font-semibold mb-3">Pagination Signals</h3>
                        {checkItem(!!result.pagination.relPrev || !!result.pagination.relNext, "rel=prev / rel=next",
                            result.pagination.relPrev ? `rel=prev: ${result.pagination.relPrev}` : result.pagination.relNext ? `rel=next: ${result.pagination.relNext}` : "No rel=prev/next found — important for paginated sequences."
                        )}
                        {checkItem(!result.pagination.hasPaginationParams, "No pagination parameters in URL",
                            result.pagination.hasPaginationParams ? `Found: ${result.pagination.paginationParams.map((p: any) => `${p.key}=${p.value}`).join(", ")}` : "URL doesn't rely on pagination query params."
                        )}
                        {checkItem(!result.infiniteScroll, "No infinite scroll detected",
                            result.infiniteScroll ? "IntersectionObserver or infinite scroll signals detected in page JS — Googlebot may miss content." : "No infinite scroll patterns found."
                        )}
                    </div>

                    {/* Facet params */}
                    {(result.facets.hasFacetParams || Object.keys(result.facets.linkedFilterParams).length > 0) && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                            <h3 className="font-semibold mb-3">Faceted URL Parameters</h3>
                            {result.facets.facetParams.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs text-[var(--text-muted)] mb-2">In this URL:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {result.facets.facetParams.map((p: any, i: number) => (
                                            <span key={i} className="px-2 py-1 rounded bg-amber-500/10 text-amber-600 text-xs font-mono">{p.key}={p.value}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {Object.keys(result.facets.linkedFilterParams).length > 0 && (
                                <div>
                                    <p className="text-xs text-[var(--text-muted)] mb-2">Filter params found in linked URLs:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(result.facets.linkedFilterParams).map(([k, v]: [string, any]) => (
                                            <span key={k} className="px-2 py-1 rounded bg-red-500/10 text-red-600 text-xs font-mono">{k} ({v} links)</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
