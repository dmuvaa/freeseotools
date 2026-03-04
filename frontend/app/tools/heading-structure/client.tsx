"use client";

import { useState } from "react";
import { Search, AlertTriangle, CheckCircle, BarChart, Hash, LayoutList } from "lucide-react";

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

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/tools/headings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
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
            case 1: return "text-blue-500 bg-blue-500/10 border-blue-500/20";
            case 2: return "text-purple-500 bg-purple-500/10 border-purple-500/20";
            case 3: return "text-green-500 bg-green-500/10 border-green-500/20";
            case 4: return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
            case 5: return "text-orange-500 bg-orange-500/10 border-orange-500/20";
            case 6: return "text-red-500 bg-red-500/10 border-red-500/20";
            default: return "text-gray-500 bg-gray-500/10 border-gray-500/20";
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-8 border-b border-[var(--border)] pb-8">
                <h1 className="text-3xl font-bold mb-2">Heading Structure Analyzer</h1>
                <p className="text-[var(--text-muted)]">
                    Audit the hierarchy of H1-H6 tags on your page. Ensure a logical structure for better accessibility and SEO. Detect missing H1s, multiple H1s, or skipped heading levels.
                </p>

                <form onSubmit={analyzeHeadings} className="mt-6 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        required
                        className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-md bg-[var(--primary)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Search className="size-4 animate-spin" /> Analyzing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Search className="size-4" /> Analyze Structure
                            </span>
                        )}
                    </button>
                </form>
            </div>

            {result && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {!result.success ? (
                        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-500 flex items-start gap-3">
                            <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold">Analysis Failed</h3>
                                <p className="text-sm">{result.error}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            <div className="lg:col-span-1 space-y-6">
                                {/* Summary Stats */}
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
                                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                                        <BarChart className="size-4" /> Heading Distribution
                                    </h3>
                                    <div className="space-y-3">
                                        {[1, 2, 3, 4, 5, 6].map(level => (
                                            <div key={level} className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-2 font-mono">
                                                    <Hash className="size-3 text-[var(--text-muted)]" /> H{level}
                                                </span>
                                                <span className={`badge ${result.counts?.[level] ? 'badge-info' : 'bg-[var(--surface-3)] text-[var(--text-muted)]'}`}>
                                                    {result.counts?.[level] || 0}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-between font-semibold">
                                        <span>Total Headings</span>
                                        <span>{result.headings?.length || 0}</span>
                                    </div>
                                </div>

                                {/* Warnings */}
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                                    <div className="bg-[var(--surface-2)] p-3 border-b border-[var(--border)] font-semibold flex items-center gap-2">
                                        <AlertTriangle className="size-4 text-yellow-500" /> SEO Warnings
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {result.warnings && result.warnings.length > 0 ? (
                                            result.warnings.map((warn, i) => (
                                                <div key={i} className="flex gap-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 p-2 rounded">
                                                    <AlertTriangle className="size-4 shrink-0 mt-0.5" /> {warn}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex gap-2 text-sm text-green-500 bg-green-500/10 p-2 rounded items-center">
                                                <CheckCircle className="size-4" /> Perfect heading structure! No warnings found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tree View */}
                            <div className="lg:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden flex flex-col h-full max-h-[800px]">
                                <div className="border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 flex justify-between items-center shrink-0">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <LayoutList className="size-4 text-[var(--primary)]" />
                                        Structure Tree View
                                    </h3>
                                </div>
                                <div className="p-4 overflow-y-auto flex-1 bg-[var(--background)]">
                                    {result.headings && result.headings.length > 0 ? (
                                        <div className="space-y-2">
                                            {result.headings.map((h, i) => (
                                                <div
                                                    key={i}
                                                    className="relative flex items-center group"
                                                    style={{ paddingLeft: `${(h.level - 1) * 1.5}rem` }}
                                                >
                                                    {/* Hierarchy visual indicators */}
                                                    {h.level > 1 && (
                                                        <div
                                                            className="absolute border-l-2 border-b-2 border-[var(--border)] rounded-bl-lg"
                                                            style={{
                                                                left: `${(h.level - 2) * 1.5 + 0.75}rem`,
                                                                top: '-0.5rem',
                                                                bottom: '50%',
                                                                width: '0.75rem'
                                                            }}
                                                        />
                                                    )}

                                                    <div className={`
                             flex items-start gap-3 p-3 rounded-lg border w-full transition-colors
                             bg-[var(--surface-1)] hover:bg-[var(--surface-2)]
                             ${getHeadingColor(h.level)}
                           `}>
                                                        <div className="font-mono text-xs font-bold mt-0.5 shrink-0 opacity-80">
                                                            H{h.level}
                                                        </div>
                                                        <p className="text-sm font-medium text-[var(--foreground)]">{h.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 text-[var(--text-muted)]">
                                            No headings found on this page.
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
