"use client";
import { useState } from "react";

function TTFBGauge({ ms, rating }: { ms: number; rating: string }) {
    const max = 1200;
    const pct = Math.min((ms / max) * 100, 100);
    const color = rating === "good" ? "#10b981" : rating === "needs-improvement" ? "#f59e0b" : "#ef4444";
    const label = rating === "good" ? "Good" : rating === "needs-improvement" ? "Needs Improvement" : "Poor";
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative">
                <svg width="160" height="90" viewBox="0 0 160 90">
                    <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="var(--surface-2)" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
                        strokeDasharray={`${pct * 2.2} 220`} />
                    <text x="80" y="72" textAnchor="middle" fill={color} fontSize="24" fontWeight="bold">{ms}</text>
                    <text x="80" y="86" textAnchor="middle" fill="#94a3b8" fontSize="10">ms</text>
                </svg>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${color}20`, color }}>{label}</span>
            <p className="text-xs text-[var(--text-muted)] text-center">Google's threshold: ≤200ms Good, ≤600ms Needs Work, &gt;600ms Poor</p>
        </div>
    );
}

export default function TTFBCheckerClient() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError(""); setResult(null);
        try {
            const res = await fetch("/api/tools/ttfb-checker", {
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
                <h1 className="text-3xl font-bold mb-2">Time to First Byte (TTFB) Checker</h1>
                <p className="text-[var(--text-muted)]">Measure server response time across 3 runs, detect CDN provider, check cache status, and inspect key performance headers. TTFB is the first thing Google measures about your server speed.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://yourdomain.com"
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition" />
                <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 transition">
                    {loading ? "Measuring..." : "Check TTFB"}
                </button>
            </form>

            {loading && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-10 text-center animate-pulse">
                    <div className="text-5xl mb-3">⏱️</div>
                    <p className="font-semibold mb-1">Measuring server response time...</p>
                    <p className="text-sm text-[var(--text-muted)]">Running 3 measurements for accuracy. Takes ~5 seconds.</p>
                </div>
            )}

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm">{error}</div>}

            {result && (
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Gauge */}
                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6 flex items-center justify-center">
                            <TTFBGauge ms={result.ttfb.min} rating={result.ttfb.rating} />
                        </div>

                        {/* Measurements + Server info */}
                        <div className="space-y-4">
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
                                <h3 className="font-semibold text-sm mb-3">Measurements ({result.ttfb.measurements.length} runs)</h3>
                                <div className="space-y-2">
                                    {result.ttfb.measurements.map((ms: number, i: number) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-xs text-[var(--text-muted)] w-14">Run {i + 1}</span>
                                            <div className="flex-1 h-2 bg-[var(--surface-2)] rounded-full">
                                                <div className="h-2 rounded-full bg-[var(--primary)]" style={{ width: `${Math.min((ms / 1200) * 100, 100)}%` }} />
                                            </div>
                                            <span className="text-xs font-mono w-16 text-right">{ms} ms</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-[var(--text-muted)] mt-2">Best: {result.ttfb.min}ms · Avg: {result.ttfb.avg}ms</p>
                            </div>

                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
                                <h3 className="font-semibold text-sm mb-3">Server Information</h3>
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between"><dt className="text-[var(--text-muted)]">CDN</dt><dd className="font-medium">{result.server.cdn || "Not detected"}</dd></div>
                                    <div className="flex justify-between"><dt className="text-[var(--text-muted)]">Server</dt><dd className="font-medium">{result.server.software}</dd></div>
                                    <div className="flex justify-between"><dt className="text-[var(--text-muted)]">Cache Status</dt><dd className="font-medium">{result.server.cacheStatus}</dd></div>
                                </dl>
                            </div>
                        </div>
                    </div>

                    {/* Headers */}
                    {Object.keys(result.headers).length > 0 && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                            <h3 className="font-semibold mb-3">Response Headers</h3>
                            <div className="divide-y divide-[var(--border)]">
                                {Object.entries(result.headers).map(([k, v]: [string, any]) => (
                                    <div key={k} className="flex gap-4 py-2 text-xs">
                                        <span className="font-mono text-[var(--text-muted)] w-56 shrink-0">{k}</span>
                                        <span className="font-mono truncate">{v}</span>
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
