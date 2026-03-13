"use client";

import { useState } from "react";
import { MdSearch, MdErrorOutline, MdCheckCircle, MdBarChart, MdFormatListBulleted } from "react-icons/md";
import { BiErrorCircle, BiHash } from "react-icons/bi";

interface Heading {
    level: number;
    text: string;
}

interface HeadingResponse {
    url: string;
    success: boolean;
    error?: string;
    headings?: Heading[];
    counts?: { [key: number]: number };
    warnings?: string[];
}

export default function HeadingStructureAnalyzer() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<HeadingResponse | null>(null);

    const analyzeHeadings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        let targetUrl = url;
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
        }
        setUrl(targetUrl);

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/tools/headings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: targetUrl }),
            });
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setResult({ url, success: false, error: "Failed to connect to the server." });
        } finally {
            setLoading(false);
        }
    };

    const getHeadingColor = (level: number) => {
        switch (level) {
            case 1: return "text-primary bg-primary/10 border-primary/20 dark:bg-primary/5 dark:border-primary/10 shadow-primary/5";
            case 2: return "text-blue-500 bg-blue-500/10 border-blue-500/20 dark:bg-blue-500/5 dark:border-blue-500/10 shadow-blue-500/5";
            case 3: return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-500/5 dark:border-emerald-500/10 shadow-emerald-500/5";
            case 4: return "text-amber-500 bg-amber-500/10 border-amber-500/20 dark:bg-amber-500/5 dark:border-amber-500/10 shadow-amber-500/5";
            case 5: return "text-violet-500 bg-violet-500/10 border-violet-500/20 dark:bg-violet-500/5 dark:border-violet-500/10 shadow-violet-500/5";
            case 6: return "text-rose-500 bg-rose-500/10 border-rose-500/20 dark:bg-rose-500/5 dark:border-rose-500/10 shadow-rose-500/5";
            default: return "text-foreground-muted bg-surface-2 border-border";
        }
    };

    return (
        <div className="w-full">
            <div className="container mx-auto max-w-5xl">
                <form onSubmit={analyzeHeadings} className="mt-2 flex flex-col sm:flex-row gap-4 mb-8">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Import from URL (e.g., https://example.com)"
                        required
                        className="flex-1 rounded-md border border-border bg-surface-1 px-4 py-3 placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-md bg-emerald-600 dark:bg-emerald-500 px-6 py-3 font-medium text-white transition-colors hover:brightness-110 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <MdSearch className="size-5 animate-spin" /> Analyzing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <MdSearch className="size-5" /> Import
                            </span>
                        )}
                    </button>
                </form>

                {result && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {!result.success ? (
                            <div className="rounded-2xl border border-error bg-error-glow p-6 text-error flex items-start gap-4 shadow-xl">
                                <BiErrorCircle className="size-8 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-lg mb-1 uppercase tracking-tight">Audit Failed</h3>
                                    <p className="text-sm opacity-90 leading-relaxed">{result.error}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                <div className="lg:col-span-1 space-y-6">
                                    {/* Summary Stats */}
                                    <div className="rounded-2xl border border-border bg-surface-1 p-6 shadow-sm">
                                        <h3 className="font-bold flex items-center gap-2 mb-6 text-foreground-subtle border-b border-border pb-3 uppercase text-xs tracking-widest">
                                            <MdBarChart className="size-5 text-emerald-600 dark:text-emerald-400" /> Distribution
                                        </h3>
                                        <div className="space-y-4">
                                            {[1, 2, 3, 4, 5, 6].map(level => (
                                                <div key={level} className="flex items-center justify-between">
                                                    <span className="flex items-center gap-2 font-mono text-xs font-bold text-foreground">
                                                        <BiHash className="size-4 text-emerald-600 dark:text-emerald-400 opacity-50" /> H{level}
                                                    </span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest leading-none ${result.counts?.[level] ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-3 text-foreground-muted border border-border opacity-50'}`}>
                                                        {result.counts?.[level] || 0}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-border flex justify-between font-black uppercase text-[10px] tracking-widest text-foreground-muted">
                                            <span>Total Nodes</span>
                                            <span className="text-emerald-600 dark:text-emerald-400">{result.headings?.length || 0}</span>
                                        </div>
                                    </div>

                                    {/* Warnings */}
                                    <div className="rounded-2xl border border-border bg-surface-1 overflow-hidden shadow-md">
                                        <div className="bg-surface-2 p-4 border-b border-border font-black uppercase text-xs tracking-widest flex items-center gap-2 text-foreground-subtle">
                                            <BiErrorCircle className="size-5 text-warning" /> Intelligence
                                        </div>
                                        <div className="p-6 space-y-4">
                                            {result.warnings && result.warnings.length > 0 ? (
                                                result.warnings.map((warn, i) => (
                                                    <div key={i} className="flex gap-3 text-xs text-warning bg-warning/10 p-4 rounded-xl border border-warning/20 leading-relaxed font-medium">
                                                        <BiErrorCircle className="size-5 shrink-0 mt-0.5" /> {warn}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex gap-3 text-sm text-emerald-500 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 items-center font-bold">
                                                    <MdCheckCircle className="size-6" /> Flawless Structure!
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Tree View */}
                                <div className="lg:col-span-2 rounded-2xl border border-border bg-surface-1 overflow-hidden flex flex-col h-full max-h-[800px] shadow-xl">
                                    <div className="border-b border-border bg-surface-2 px-6 py-4 flex justify-between items-center shrink-0">
                                        <h3 className="font-black uppercase text-xs tracking-widest flex items-center gap-2 text-foreground-subtle">
                                            <MdFormatListBulleted className="size-5 text-primary" />
                                            Structural Map
                                        </h3>
                                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-surface-3 text-foreground-muted rounded-full border border-border">
                                            Hierarchy Rooted
                                        </span>
                                    </div>
                                    <div className="p-8 overflow-y-auto flex-1 bg-surface-1/50 dark:bg-surface-1/10 shadow-inner custom-scrollbar">
                                        {result.headings && result.headings.length > 0 ? (
                                            <div className="space-y-4">
                                                {result.headings.map((h, i) => (
                                                    <div
                                                        key={i}
                                                        className="relative flex items-center group"
                                                        style={{ paddingLeft: `${(h.level - 1) * 2}rem` }}
                                                    >
                                                        {/* Hierarchy visual indicators */}
                                                        {h.level > 1 && (
                                                            <div
                                                                className="absolute border-l-2 border-b-2 border-border/60 rounded-bl-xl group-hover:border-primary/40 transition-colors"
                                                                style={{
                                                                    left: `${(h.level - 2) * 2 + 1}rem`,
                                                                    top: '-1rem',
                                                                    bottom: '50%',
                                                                    width: '1rem'
                                                                }}
                                                            />
                                                        )}

                                                        <div className={`
                                                        flex items-baseline gap-4 p-4 rounded-xl border w-full transition-all duration-300
                                                        hover:translate-x-1 hover:shadow-lg cursor-default
                                                        ${getHeadingColor(h.level)}
                                                    `}>
                                                            <div className="font-mono text-[10px] font-black px-2 py-1 rounded-md bg-black/10 dark:bg-white/10 shrink-0 uppercase tracking-tighter shadow-inner">
                                                                H{h.level}
                                                            </div>
                                                            <p className="text-sm font-bold leading-relaxed tracking-tight">{h.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-20 text-foreground-muted text-center">
                                                <MdErrorOutline className="size-16 opacity-10 mb-4" />
                                                <p className="italic uppercase text-xs font-bold tracking-widest">No spectral headings detected</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
