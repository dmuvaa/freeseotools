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
        <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="relative">
                <svg width="100" height="100" viewBox="0 0 110 110" className="transform transition-transform group-hover:scale-105 duration-500">
                    <circle cx="55" cy="55" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-[var(--surface-3)]" />
                    <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="8"
                        strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 55 55)"
                        className="transition-all duration-1000 ease-out" />
                    <text x="55" y="52" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="24" fontWeight="800">{score}</text>
                    <text x="55" y="70" textAnchor="middle" dominantBaseline="middle" fill="var(--text-subtle)" fontSize="10" fontWeight="500">/100</text>
                </svg>
                <div className="absolute inset-0 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40" style={{ backgroundColor: color }}></div>
            </div>
            <span className="text-sm font-bold text-[var(--foreground)] capitalize text-center">{label}</span>
        </div>
    );
}

function scoreColor(s: number) {
    return s >= 90 ? "#10b981" : s >= 50 ? "#f59e0b" : "#ef4444";
}

function AuditRow({ audit }: { audit: any }) {
    const isSuccess = audit.score >= 0.9;
    const isWarning = audit.score >= 0.5 && audit.score < 0.9;
    const isError = audit.score !== null && audit.score < 0.5;

    const icon = isSuccess ? (
        <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-[10px]">✓</div>
    ) : isWarning ? (
        <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 text-[10px]">!</div>
    ) : isError ? (
        <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center text-red-600 text-[10px]">✕</div>
    ) : (
        <div className="w-5 h-5 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-600 text-[10px]">i</div>
    );

    return (
        <div className="flex items-start gap-4 py-4 border-b border-[var(--border)]/40 last:border-0 group hover:bg-[var(--background)]/50 px-2 -mx-2 rounded-lg transition-colors">
            <span className="shrink-0 mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{audit.title}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed line-clamp-2 group-hover:line-clamp-none">{audit.description?.replace(/\[Learn more\].*/, "")}</p>
                <div className="flex gap-3 mt-2">
                    {audit.displayValue && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--text-subtle)] border border-[var(--border)]">
                            {audit.displayValue}
                        </span>
                    )}
                    {audit.savings && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {audit.savings}
                        </span>
                    )}
                </div>
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

    const hasCoreVitals = result?.vitals && Object.values(result.vitals).some((v: any) => v.value !== "N/A");

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 md:px-8 lg:px-12">
            <div className="relative mb-12 text-center">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--primary)] opacity-[0.03] blur-[100px] pointer-events-none rounded-full"></div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-[var(--foreground)]">{config.title}</h1>
                <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">{config.description}</p>
            </div>

            <div className="max-w-3xl mx-auto mb-16">
                <form onSubmit={handleSubmit} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-focus-within:opacity-40"></div>
                    <div className="relative flex flex-col sm:flex-row gap-3 p-2 bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl shadow-xl">
                        <div className="flex-1 relative flex items-center">
                            <span className="absolute left-4 text-xl opacity-40">🔗</span>
                            <input type="text" value={url} onChange={e => setUrl(e.target.value)} required placeholder="Enter website URL to audit..."
                                className="w-full bg-transparent pl-12 pr-4 py-4 text-base outline-none font-medium placeholder:text-[var(--text-subtle)]"
                            />
                        </div>
                        <button type="submit" disabled={loading}
                            className="bg-[var(--foreground)] text-[var(--background)] sm:px-8 py-4 rounded-xl font-bold text-sm tracking-wide hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap shadow-lg">
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analyzing...
                                </>
                            ) : "Start Free Audit →"}
                        </button>
                    </div>
                </form>
            </div>

            {loading && (
                <div className="max-w-4xl mx-auto rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-16 text-center shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary)] overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent w-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                    <div className="text-7xl mb-6 inline-block animate-bounce">🔦</div>
                    <h2 className="text-2xl font-bold mb-3">Auditing Technical Performance</h2>
                    <p className="text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed">We're running a full Lighthouse suite via {config.strategy} emulation. This usually takes 20 seconds.</p>
                    <div className="mt-8 flex justify-center gap-1">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <div className="max-w-2xl mx-auto rounded-2xl border border-red-500/20 bg-red-500/5 p-6 flex items-center gap-4 text-red-600 animate-in fade-in slide-in-from-bottom-4">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                        <p className="font-bold text-sm">Analysis Failed</p>
                        <p className="text-xs opacity-80 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {result && (
                <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
                    {/* Top Summary Row */}
                    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-8 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <span className="bg-[var(--primary-muted)] p-2 rounded-lg text-[var(--primary)] text-sm">📊</span>
                                Audit Scores
                            </h3>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold bg-[var(--surface-2)] px-4 py-1.5 rounded-full border border-[var(--border)]">
                                Tested via {config.strategy} emulation
                            </p>
                        </div>
                        <div className={`grid gap-6 ${
                            Object.entries(result.scores).length === 1 
                                ? "grid-cols-1 place-items-center py-6" 
                                : Object.entries(result.scores).length === 2
                                    ? "grid-cols-2 max-w-2xl mx-auto"
                                    : "grid-cols-2 md:grid-cols-4"
                        }`}>
                            {Object.entries(result.scores).map(([cat, score]: [string, any]) => (
                                <div key={cat} className={Object.entries(result.scores).length === 1 ? "w-full max-w-[280px]" : ""}>
                                    <ScoreRing score={score} label={categoryLabels[cat] || cat} color={scoreColor(score)} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Main Details Column */}
                        <div className="lg:col-span-8 space-y-8">
                            {result.seoMetrics && (
                                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-8 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <span className="bg-emerald-500/10 p-2 rounded-lg text-emerald-600 text-sm">🔍</span>
                                            Search Engine Signals
                                        </h3>
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/5 px-2 py-1 rounded-full border border-emerald-500/10">Technical SEO Health</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {[
                                            { label: "Page Title", value: result.seoMetrics.title, icon: "📝" },
                                            { label: "Meta Description", value: result.seoMetrics.description, icon: "📋" },
                                            { label: "Link Analysis", value: result.seoMetrics.links, icon: "🔗" },
                                            { label: "Image Optimization", value: result.seoMetrics.altText, icon: "🖼️" },
                                            { label: "Canonical State", value: result.seoMetrics.canonical, icon: "✅" },
                                            { label: "Crawlability", value: result.seoMetrics.crawlable, icon: "🤖" },
                                            { label: "Robots.txt", value: result.seoMetrics.robots, icon: "📄" },
                                            { label: "Mobile SEO", value: result.seoMetrics.mobileFriendly, icon: "📱" },
                                        ].map((m, i) => (
                                            <div key={i} className="bg-[var(--background)] rounded-2xl border border-[var(--border)] p-4 hover:border-[var(--primary)] transition-all group/signal">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs group-hover/signal:scale-110 transition-transform">{m.icon}</span>
                                                    <div className="text-[9px] font-black text-[var(--text-subtle)] uppercase tracking-widest">{m.label}</div>
                                                </div>
                                                <div className="text-sm font-bold truncate text-[var(--foreground)]" title={m.value}>{m.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {hasCoreVitals && (
                                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-8 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <span className="bg-indigo-500/10 p-2 rounded-lg text-indigo-600 text-sm">⚡</span>
                                            Core Web Vitals
                                        </h3>
                                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-500/5 px-2 py-1 rounded-full border border-indigo-500/10">Real-user Experience</span>
                                    </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {Object.entries(result.vitals).filter(([_, v]: any) => v.value !== "N/A").map(([key, v]: [string, any]) => (
                                            <div key={key} className="group/vital bg-[var(--background)] rounded-2xl border border-[var(--border)] p-4 transition-all hover:border-[var(--primary)] hover:shadow-md relative overflow-visible">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="text-[10px] font-black text-[var(--text-subtle)] uppercase tracking-widest">{v.label || key}</div>
                                                    <div className="relative group/tip">
                                                        <span className="cursor-help opacity-40 hover:opacity-100 transition-opacity">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                                        </span>
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-[var(--foreground)] text-[var(--background)] text-[10px] leading-relaxed rounded-xl shadow-2xl opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover/tip:translate-y-0 z-50 font-medium">
                                                            {v.description}
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[var(--foreground)]"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-xl font-black tabular-nums" style={{ color: v.score !== null ? scoreColor(v.score * 100) : "inherit" }}>{v.value}</div>
                                                <div className="mt-2 h-1.5 w-full bg-[var(--surface-3)] rounded-full overflow-hidden">
                                                    <div className="h-full transition-all duration-1000" style={{ width: `${(v.score ?? 0) * 100}%`, backgroundColor: v.score !== null ? scoreColor(v.score * 100) : "transparent" }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-8 shadow-sm">
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <span className="bg-amber-500/10 p-2 rounded-lg text-amber-600 text-sm">🛠️</span>
                                    Improvement Opportunities
                                </h3>
                                <p className="text-xs text-[var(--text-muted)] mb-8">Direct actions you can take to improve your accessibility and performance scores.</p>
                                
                                <div className="space-y-2">
                                    {(result.opportunities?.length > 0 || result.diagnostics?.length > 0) ? (
                                        <>
                                            {result.opportunities?.map((a: any, i: number) => <AuditRow key={`opp-${i}`} audit={a} />)}
                                            {result.diagnostics?.slice(0, 15).map((a: any, i: number) => <AuditRow key={`diag-${i}`} audit={a} />)}
                                        </>
                                    ) : (
                                        <div className="text-center py-12 bg-[var(--background)] rounded-2xl border-2 border-dashed border-[var(--border)]">
                                            <div className="text-4xl mb-3">🎉</div>
                                            <p className="font-bold text-[var(--foreground)]">No major issues found!</p>
                                            <p className="text-xs text-[var(--text-muted)] mt-1">Your site is performing excellently in this category.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sticky Sidebar Screenshot */}
                        <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6">
                            {result.screenshot && (
                                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-2 shadow-xl group overflow-hidden">
                                    <div className="p-4 flex items-center justify-between border-b border-[var(--border)]/50 mb-2">
                                        <p className="text-[10px] font-black text-[var(--text-subtle)] uppercase tracking-[0.2em]">Visual Capture</p>
                                        <a href={result.screenshot} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-[var(--primary)] hover:underline flex items-center gap-1">
                                            Full Size ↗
                                        </a>
                                    </div>
                                    <div className="relative rounded-2xl overflow-hidden bg-[var(--surface-2)] border border-[var(--border)] shadow-inner">
                                        <div className="max-h-[600px] overflow-y-auto scrollbar-hide group-hover:scrollbar-default transition-all duration-300">
                                            <img src={result.screenshot} alt="Page Screenshot" className="w-full h-auto object-contain opacity-95 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                        <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-black/5 to-transparent pointer-events-none"></div>
                                        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
                                    </div>
                                    <p className="p-4 text-center text-[9px] text-[var(--text-muted)] italic leading-tight">
                                        Visual state during {config.strategy} audit. 
                                        Scroll to see full page capture.
                                    </p>
                                </div>
                            )}

                            <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface-2)] to-[var(--background)] p-6">
                                <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-subtle)] mb-4">Metadata</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] text-[var(--text-muted)] uppercase mb-1">Generated At</p>
                                        <p className="text-xs font-bold">{result.fetchTime ? new Date(result.fetchTime).toLocaleString() : "Just now"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[var(--text-muted)] uppercase mb-1">Analyzer</p>
                                        <p className="text-xs font-bold">Lighthouse 11.0.0</p>
                                    </div>
                                    <div className="pt-2 flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-md bg-[var(--primary)] flex items-center justify-center text-[10px] text-[var(--background)] font-black">L</div>
                                        <span className="text-[10px] font-bold text-[var(--text-subtle)] uppercase tracking-tighter">Verified Audit</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
