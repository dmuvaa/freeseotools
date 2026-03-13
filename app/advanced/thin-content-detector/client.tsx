"use client";
import { useState } from "react";

function ScoreRing({ score, label }: { score: number; label: string }) {
    const color = score >= 70 ? "#10b981" : score >= 45 ? "#f59e0b" : "#ef4444";
    const radius = 40; const circ = 2 * Math.PI * radius;
    const dash = (score / 100) * circ;
    return (
        <div className="flex flex-col items-center gap-2">
            <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-[var(--surface-2)]" />
                <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 50 50)" />
                <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="18" fontWeight="bold">{score}</text>
            </svg>
            <span className="text-xs font-medium text-[var(--text-muted)]">{label}</span>
        </div>
    );
}

export default function ThinContentClient() {
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
            const res = await fetch("/api/tools/thin-content", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: targetUrl }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setResult(data);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    const scoreLabel = result?.scoreLabel;
    const scoreBadgeClass = scoreLabel === "Good" ? "bg-green-500/10 text-green-600" : scoreLabel === "Needs Work" ? "bg-yellow-500/10 text-yellow-700" : "bg-red-500/10 text-red-600";

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Free Thin Content Detector</h1>
                <p className="text-[var(--text-muted)]">Analyze any URL for content quality signals: word count, text-to-HTML ratio, duplicate sections, and heading structure.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://yourdomain.com/page"
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition"
                />
                <button type="submit" disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors">
                    {loading ? "Analyzing..." : "Check Content"}
                </button>
            </form>

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm mb-4">{error}</div>}

            {result && (
                <div className="space-y-6">
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-6 flex flex-col md:flex-row items-center gap-8">
                        <ScoreRing score={result.score} label="Content Score" />
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold">{result.scoreLabel}</h3>
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${scoreBadgeClass}`}>{result.score}/100</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {[
                                    { label: "Word Count", value: result.wordCount },
                                    { label: "Text-to-HTML Ratio", value: `${result.textToHtmlRatio}%` },
                                    { label: "Heading Tags", value: result.headingCount },
                                    { label: "Duplicate Paragraphs", value: result.duplicateParagraphs, warn: result.duplicateParagraphs > 0 },
                                ].map(s => (
                                    <div key={s.label} className={`rounded-lg border p-3 ${s.warn ? "border-orange-500/30" : "border-[var(--border)]"}`}>
                                        <div className={`font-bold ${s.warn ? "text-orange-500" : ""}`}>{s.value}</div>
                                        <div className="text-xs text-[var(--text-muted)]">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {result.suggestions?.length > 0 && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                            <h3 className="font-semibold mb-3">Improvement Suggestions</h3>
                            <ul className="space-y-2">
                                {result.suggestions.map((s: string, i: number) => (
                                    <li key={i} className="flex gap-2 text-sm text-[var(--text-muted)]">
                                        <span className="text-[var(--primary)] shrink-0">→</span>{s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {result.headings?.length > 0 && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                            <h3 className="font-semibold mb-3">Detected Headings</h3>
                            <div className="space-y-1.5">
                                {result.headings.map((h: any, i: number) => {
                                    const indent = ({ H1: 0, H2: 1, H3: 2, H4: 3, H5: 4, H6: 5 } as Record<string, number>)[h.level] ?? 0;
                                    const colors: Record<string, string> = { H1: "text-blue-500", H2: "text-purple-500", H3: "text-green-500", H4: "text-yellow-600", H5: "text-orange-500", H6: "text-red-500" };
                                    return (
                                        <div key={i} className="flex items-start gap-2 text-sm" style={{ paddingLeft: indent * 16 }}>
                                            <span className={`font-mono text-xs font-bold ${colors[h.level]}`}>{h.level}</span>
                                            <span className="text-[var(--text-muted)] truncate">{h.text}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
