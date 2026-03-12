"use client";
import { useState } from "react";

export interface LighthouseConfig {
    title: string;
    strategy: "mobile" | "desktop";
    categories: string[];
    accentColor: string;
    description: string;
}

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
    const r = 44; const c = 2 * Math.PI * r;
    const dash = (score / 100) * c;
    return (
        <div className="flex flex-col items-center gap-2">
            <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r={r} fill="none" stroke="currentColor" strokeWidth="9" className="text-[var(--surface-2)]" />
                <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="9"
                    strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 55 55)" />
                <text x="55" y="51" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="22" fontWeight="bold">{score}</text>
                <text x="55" y="68" textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="9">/100</text>
            </svg>
            <span className="text-xs font-medium text-[var(--text-muted)] capitalize text-center max-w-[90px]">{label}</span>
        </div>
    );
}

function scoreColor(s: number) {
    return s >= 90 ? "#10b981" : s >= 50 ? "#f59e0b" : "#ef4444";
}

function AuditRow({ audit }: { audit: any }) {
    const icon = audit.score === null ? "ℹ️" : audit.score >= 0.9 ? "✅" : audit.score >= 0.5 ? "⚠️" : "❌";
    return (
        <div className="flex items-start gap-3 py-3 border-b border-[var(--border)]/50 last:border-0">
            <span className="text-base shrink-0 mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{audit.title}</p>
                {audit.displayValue && <p className="text-xs text-[var(--text-muted)] mt-0.5">{audit.displayValue}</p>}
                {audit.savings && <p className="text-xs text-green-600 mt-0.5">{audit.savings}</p>}
            </div>
        </div>
    );
}

export default function LighthouseClient({ config }: { config: LighthouseConfig }) {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError(""); setResult(null);
        try {
            const res = await fetch("/api/tools/lighthouse", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, strategy: config.strategy, categories: config.categories }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setResult(data);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    const categoryLabels: Record<string, string> = {
        performance: "Performance",
        seo: "SEO",
        accessibility: "Accessibility",
        "best-practices": "Best Practices",
    };

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">{config.title}</h1>
                <p className="text-[var(--text-muted)]">{config.description}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://yourdomain.com"
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition"
                />
                <button type="submit" disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white hover:opacity-90 disabled:opacity-50 transition" style={{ background: config.accentColor }}>
                    {loading ? "Running Lighthouse..." : "Run Test"}
                </button>
            </form>

            {loading && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-10 text-center animate-pulse">
                    <div className="text-5xl mb-3">🔦</div>
                    <p className="font-semibold mb-1">Running Google Lighthouse...</p>
                    <p className="text-sm text-[var(--text-muted)]">Analyzing {config.strategy} performance via PageSpeed Insights. This takes 15–30 seconds.</p>
                </div>
            )}

            {error && (
                error === "QUOTA_EXCEEDED" ? (
                    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-3">
                        <p className="font-semibold text-amber-700">⚠️ Google PageSpeed API Daily Quota Exceeded</p>
                        <p className="text-sm text-amber-700/90 leading-relaxed">The shared anonymous quota (used when no API key is configured) has hit its daily limit. Add your own free API key to get 25,000 requests/day.</p>
                        <div className="space-y-2 text-sm">
                            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 font-mono text-xs space-y-1">
                                <p className="text-amber-800 font-semibold">Setup (2 minutes):</p>
                                <p>1. Go to <a href="https://console.cloud.google.com/apis/library/pagespeedonline.googleapis.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Cloud Console → PageSpeed Insights API</a></p>
                                <p>2. Enable the API and create an API key</p>
                                <p>3. Add to your <code>.env.local</code> file:</p>
                                <p className="bg-black/10 rounded px-2 py-1 font-mono">GOOGLE_PSI_API_KEY=your_key_here</p>
                                <p>4. Restart the dev server</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm">{error}</div>
                )
            )}

            {result && (
                <div className="space-y-6">
                    {/* Score Rings */}
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6">
                        <div className="flex flex-wrap gap-6 justify-center">
                            {Object.entries(result.scores).map(([cat, score]: [string, any]) => (
                                <ScoreRing key={cat} score={score} label={categoryLabels[cat] || cat} color={scoreColor(score)} />
                            ))}
                        </div>
                    </div>

                    {/* Core Vitals */}
                    {result.vitals && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                            <h3 className="font-semibold mb-4">Core Web Vitals</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                {Object.entries(result.vitals).map(([key, v]: [string, any]) => (
                                    <div key={key} className="rounded-xl border border-[var(--border)] p-3 text-center">
                                        <div className="text-sm font-bold" style={{ color: v.score !== null ? scoreColor(v.score >= 0 ? v.score * 100 : 0) : "inherit" }}>{v.value}</div>
                                        <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mt-1">{key.toUpperCase()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Opportunities */}
                    {result.opportunities?.length > 0 && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                            <h3 className="font-semibold mb-1">Opportunities to Improve</h3>
                            <p className="text-xs text-[var(--text-muted)] mb-4">Issues that have a direct impact on score</p>
                            {result.opportunities.map((a: any, i: number) => <AuditRow key={i} audit={a} />)}
                        </div>
                    )}

                    {/* Diagnostics */}
                    {result.diagnostics?.length > 0 && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                            <h3 className="font-semibold mb-1">Diagnostics</h3>
                            <p className="text-xs text-[var(--text-muted)] mb-4">Additional items to review</p>
                            {result.diagnostics.slice(0, 10).map((a: any, i: number) => <AuditRow key={i} audit={a} />)}
                        </div>
                    )}

                    <p className="text-xs text-[var(--text-muted)] text-center">Powered by Google PageSpeed Insights · Fetched at {result.fetchTime ? new Date(result.fetchTime).toLocaleTimeString() : "just now"}</p>
                </div>
            )}
        </div>
    );
}
