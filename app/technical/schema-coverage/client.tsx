"use client";
import { useState } from "react";

export default function SchemaCoverageClient() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

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
            const res = await fetch("/api/tools/schema-coverage", {
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
                <h1 className="text-3xl font-bold mb-2">Structured Data Coverage Scanner</h1>
                <p className="text-[var(--text-muted)]">Crawl up to 50 pages across a domain and audit structured data (JSON-LD + microdata) coverage. See which pages have schema, which are missing it, and catch parse errors.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://yourdomain.com"
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition" />
                <button type="submit" disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 transition">
                    {loading ? "Scanning..." : "Scan Schema"}
                </button>
            </form>

            {loading && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-10 text-center animate-pulse">
                    <div className="text-5xl mb-3">🏷️</div>
                    <p className="font-semibold mb-1">Crawling and scanning for structured data...</p>
                    <p className="text-sm text-[var(--text-muted)]">Checking up to 50 pages for JSON-LD and microdata. Takes 30–60 seconds.</p>
                </div>
            )}

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm">{error}</div>}

            {result && (
                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: "Pages Scanned", value: result.pagesCrawled, color: "var(--foreground)" },
                            { label: "With Schema", value: result.pagesWithSchema, color: "#10b981" },
                            { label: "Without Schema", value: result.pagesWithoutSchema, color: result.pagesWithoutSchema > 0 ? "#f59e0b" : "#10b981" },
                            { label: "Parse Errors", value: result.pagesWithErrors, color: result.pagesWithErrors > 0 ? "#ef4444" : "#10b981" },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-center">
                                <div className="text-2xl font-bold" style={{ color }}>{value}</div>
                                <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Schema type distribution */}
                    {Object.keys(result.schemaTypeDistribution).length > 0 && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                            <h3 className="font-semibold mb-3">Schema Types Found Across Site</h3>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(result.schemaTypeDistribution).map(([type, count]: [string, any]) => (
                                    <span key={type} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium">
                                        {type} <span className="opacity-70">×{count}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Per-page table */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                        <div className="p-4 border-b border-[var(--border)]">
                            <h3 className="font-semibold">Per-Page Coverage ({result.pages.length} pages)</h3>
                        </div>
                        <div className="divide-y divide-[var(--border)] max-h-[450px] overflow-y-auto">
                            {result.pages.map((p: any, i: number) => (
                                <div key={i} className="flex items-start gap-3 p-3">
                                    <span className="text-base shrink-0">{p.hasSchema ? "✅" : "⚠️"}</span>
                                    <div className="flex-1 min-w-0">
                                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary)] hover:underline truncate block">{p.url}</a>
                                        {p.schemaTypes.length > 0
                                            ? <div className="flex flex-wrap gap-1 mt-1">{p.schemaTypes.map((t: string, j: number) => <span key={j} className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[10px] font-medium">{t}</span>)}</div>
                                            : <span className="text-[10px] text-[var(--text-muted)]">No structured data found</span>
                                        }
                                        {p.errors.length > 0 && <p className="text-[10px] text-red-600 mt-0.5">⚠ {p.errors[0]}</p>}
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
