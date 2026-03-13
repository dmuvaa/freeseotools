"use client";
import { useState } from "react";

type Metric = { value: string; score: number | null };
type SideData = { score: number; lcp: string; cls: string; inp: string; fcp: string; tbt: string };

function MetricBadge({ value, score }: Metric) {
    const color = score === null ? "text-[var(--text-muted)]" : score >= 0.9 ? "text-green-600" : score >= 0.5 ? "text-yellow-600" : "text-red-500";
    const dot = score === null ? "bg-gray-400" : score >= 0.9 ? "bg-green-500" : score >= 0.5 ? "bg-yellow-500" : "bg-red-500";
    return (
        <div className="flex items-center gap-2">
            <div className={`size-2 rounded-full shrink-0 ${dot}`} />
            <span className={`text-sm font-semibold ${color}`}>{value}</span>
        </div>
    );
}

function ScoreCircle({ score, label }: { score: number; label: string }) {
    const color = score >= 90 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
    const r = 36; const c = 2 * Math.PI * r;
    return (
        <div className="flex flex-col items-center gap-1">
            <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-[var(--surface-2)]" />
                <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={`${(score / 100) * c} ${c}`} strokeLinecap="round" transform="rotate(-90 45 45)" />
                <text x="45" y="45" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="18" fontWeight="bold">{score}</text>
            </svg>
            <span className="text-xs text-[var(--text-muted)] text-center max-w-[80px]">{label}</span>
        </div>
    );
}

export default function CwvCompareClient() {
    const [urlA, setUrlA] = useState("");
    const [urlB, setUrlB] = useState("");
    const [mode, setMode] = useState<"desktop" | "mobile">("desktop");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        let tUrlA = urlA;
        if (!/^https?:\/\//i.test(tUrlA)) tUrlA = 'https://' + tUrlA;
        setUrlA(tUrlA);

        let tUrlB = urlB;
        if (!/^https?:\/\//i.test(tUrlB)) tUrlB = 'https://' + tUrlB;
        setUrlB(tUrlB);

        setLoading(true); setError(""); setResult(null);
        try {
            const res = await fetch("/api/tools/cwv-compare", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ urlA: tUrlA, urlB: tUrlB }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setResult(data);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    const metrics = [
        { key: "lcp", label: "Largest Contentful Paint" },
        { key: "cls", label: "Cumulative Layout Shift" },
        { key: "inp", label: "Interaction / TBT" },
        { key: "fcp", label: "First Contentful Paint" },
        { key: "tbt", label: "Total Blocking Time" },
    ];

    const sideData: { a: SideData; b: SideData } | null = result ? result[mode] : null;

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Free Core Web Vitals Comparator</h1>
                <p className="text-[var(--text-muted)]">Compare two pages side-by-side using Google Lighthouse data: LCP, CLS, INP, and Performance Score.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="text" value={urlA} onChange={e => setUrlA(e.target.value)} required placeholder="Page A: https://page-a.com"
                        className="rounded-lg border border-blue-500/40 bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    />
                    <input type="text" value={urlB} onChange={e => setUrlB(e.target.value)} required placeholder="Page B: https://page-b.com"
                        className="rounded-lg border border-purple-500/40 bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
                    />
                </div>
                <button type="submit" disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors">
                    {loading ? "Running Lighthouse..." : "Compare Pages"}
                </button>
            </form>

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm mb-4">{error}</div>}

            {result && sideData && (
                <div className="space-y-6">
                    <div className="flex gap-2">
                        {(["desktop", "mobile"] as const).map(m => (
                            <button key={m} onClick={() => setMode(m)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-1)] border border-[var(--border)] hover:border-[var(--primary-muted)]"}`}>
                                {m === "desktop" ? "🖥 Desktop" : "📱 Mobile"}
                            </button>
                        ))}
                    </div>

                    {/* Score Circles */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: "Page A Performance", score: sideData.a.score, url: result.urlA, color: "border-blue-500/30 bg-blue-500/5" },
                            { label: "Page B Performance", score: sideData.b.score, url: result.urlB, color: "border-purple-500/30 bg-purple-500/5" },
                        ].map(s => (
                            <div key={s.label} className={`rounded-2xl border ${s.color} p-6 flex flex-col items-center gap-3`}>
                                <ScoreCircle score={s.score} label="Performance Score" />
                                <p className="text-xs text-[var(--text-muted)] truncate max-w-full text-center">{s.url}</p>
                            </div>
                        ))}
                    </div>

                    {/* Metric Table */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                        <div className="grid grid-cols-3 border-b border-[var(--border)]">
                            <div className="px-4 py-3 text-sm font-semibold text-[var(--text-muted)]">Metric</div>
                            <div className="px-4 py-3 text-sm font-semibold text-blue-500 text-center">Page A</div>
                            <div className="px-4 py-3 text-sm font-semibold text-purple-500 text-center">Page B</div>
                        </div>
                        {metrics.map(m => (
                            <div key={m.key} className="grid grid-cols-3 border-b border-[var(--border)]/50 hover:bg-[var(--surface-2)] transition-colors">
                                <div className="px-4 py-3 text-sm font-medium">{m.label}</div>
                                <div className="px-4 py-3 text-center">
                                    <MetricBadge value={sideData.a[m.key as keyof SideData] as string} score={null} />
                                </div>
                                <div className="px-4 py-3 text-center">
                                    <MetricBadge value={sideData.b[m.key as keyof SideData] as string} score={null} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
