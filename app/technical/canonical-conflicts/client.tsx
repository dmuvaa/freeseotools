"use client";
import { useState } from "react";

const SEVERITY_STYLES: Record<string, string> = {
    critical: "bg-red-500/10 text-red-600 border-red-500/30",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    info: "bg-blue-500/10 text-blue-600 border-blue-500/30",
};

export default function CanonicalConflictsClient() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError(""); setResult(null);
        try {
            const res = await fetch("/api/tools/canonical-conflicts", {
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
                <h1 className="text-3xl font-bold mb-2">Canonical Conflict Detector</h1>
                <p className="text-[var(--text-muted)]">Crawl up to 50 pages across a domain and detect canonical tag issues: multiple canonicals, loops, non-200 targets, and homepage misuse. Real technical SEO, not just single-page checks.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://yourdomain.com"
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition" />
                <button type="submit" disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 transition">
                    {loading ? "Crawling..." : "Detect Issues"}
                </button>
            </form>

            {loading && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-10 text-center animate-pulse">
                    <div className="text-5xl mb-3">🔗</div>
                    <p className="font-semibold mb-1">Crawling up to 50 pages...</p>
                    <p className="text-sm text-[var(--text-muted)]">Checking canonical tags and following links. This may take 30–60 seconds.</p>
                </div>
            )}

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm">{error}</div>}

            {result && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: "Pages Crawled", value: result.pagesCrawled, color: "var(--foreground)" },
                            { label: "Total Issues", value: result.issueCount, color: result.issueCount > 0 ? "#ef4444" : "#10b981" },
                            { label: "Critical", value: result.summary.critical, color: "#ef4444" },
                            { label: "Warnings", value: result.summary.warning, color: "#f59e0b" },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-center">
                                <div className="text-2xl font-bold" style={{ color }}>{value}</div>
                                <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>
                            </div>
                        ))}
                    </div>

                    {result.issues.length === 0 ? (
                        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
                            <div className="text-4xl mb-2">✅</div>
                            <p className="font-semibold text-green-700">No canonical issues found across {result.pagesCrawled} pages.</p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                            <div className="p-4 border-b border-[var(--border)]">
                                <h3 className="font-semibold">Issues Found ({result.issues.length})</h3>
                            </div>
                            <div className="divide-y divide-[var(--border)] max-h-[500px] overflow-y-auto">
                                {result.issues.map((issue: any, i: number) => (
                                    <div key={i} className="p-4 flex gap-3 items-start">
                                        <span className={`inline-block shrink-0 mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${SEVERITY_STYLES[issue.severity]}`}>
                                            {issue.severity}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold">{issue.type}</p>
                                            <a href={issue.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary)] hover:underline truncate block">{issue.url}</a>
                                            <p className="text-xs text-[var(--text-muted)] mt-1">{issue.detail}</p>
                                        </div>
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
