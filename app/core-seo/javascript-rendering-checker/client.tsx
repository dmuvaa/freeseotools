"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { analyzeJavascriptUrl, JsRenderingState } from "./analyze/actions";
import Card from "@/components/ui/Card";
import ScoreRing from "@/components/ui/ScoreRing";
import { LinkGraph } from "@/components/analysis/LinkGraph";
import { AIInterpretationPanel } from "@/components/analysis/AIInterpretation";
import { AnalysisResponse } from "@/lib/analysis/types";
import { MdJavascript, MdCompare, MdCode, MdLink, MdArticle, MdSearch } from "react-icons/md";
import { BiErrorCircle, BiCheckCircle } from "react-icons/bi";

export default function JavascriptRenderingCheckerClient() {
    const [state, formAction, isPending] = useActionState<JsRenderingState, FormData>(
        analyzeJavascriptUrl,
        {}
    );

    const [extraData, setExtraData] = useState<AnalysisResponse | null>(null);
    const [extraLoading, setExtraLoading] = useState(false);
    const [extraError, setExtraError] = useState<string | null>(null);

    const formRef = useRef<HTMLFormElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Deep analysis is handled by the server action now
    /*
    useEffect(() => {
        if (state.url && state.success && !isPending) {
            const fetchDeepAnalysis = async () => {
                setExtraLoading(true);
                setExtraError(null);
                try {
                    const res = await fetch("/api/analyze", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url: state.url }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Deep analysis failed");
                    setExtraData(data);
                } catch (err) {
                    setExtraError(String(err));
                } finally {
                    setExtraLoading(false);
                }
            };
            fetchDeepAnalysis();
        }
    }, [state.url, state.success, isPending]);
    */

    return (
        <div className="w-full">
        <div className="w-full">
                <form action={formAction} ref={formRef} className="mt-2 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        name="url"
                        placeholder="https://example.com"
                        className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] shadow-inner"
                        required
                        disabled={isPending}
                        ref={inputRef}
                    />
                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex items-center justify-center rounded-md bg-purple-600 dark:bg-purple-500 px-6 py-3 font-medium text-white transition-colors hover:brightness-110 disabled:opacity-50 shadow-lg shadow-purple-500/20"
                    >
                        {isPending ? (
                            <span className="flex items-center gap-2">
                                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Rendering...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 font-bold">
                                <MdSearch className="size-5" /> Compare Versions
                            </span>
                        )}
                    </button>
                </form>

                {state.error && (
                    <div className="mt-4 rounded-lg border border-error bg-error/10 p-4 flex items-center gap-3">
                        <BiErrorCircle className="w-5 h-5 text-error flex-shrink-0" />
                        <p className="text-error text-sm">{state.error}</p>
                    </div>
                )}

                {state.success && state.data && (
                    <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Top Level Metrics */}
                        <div className="grid gap-6 md:grid-cols-4">
                            <Card padding="lg" className="flex flex-col items-center justify-center text-center bg-[var(--surface-1)] border-[var(--border)] shadow-sm">
                                <ScoreRing
                                    score={state.data.diff.similarity}
                                    size="md"
                                    label="Similarity"
                                />
                                <div className="mt-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">SEO Parity</h3>
                                    <p className="text-[10px] font-bold text-[var(--text-muted)]">
                                        {state.data.diff.similarity >= 95
                                            ? "PERFECT_SYNC"
                                            : state.data.diff.similarity >= 70
                                                ? "MINOR_SKEW"
                                                : "CRITICAL_SKEW"}
                                    </p>
                                </div>
                            </Card>

                            <Card padding="lg" className="flex flex-col justify-center bg-[var(--surface-1)] border-[var(--border)] shadow-sm overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <MdArticle className="w-16 h-16" />
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-2 font-black uppercase tracking-[0.2em]">
                                        <MdArticle className="w-4 h-4 text-purple-500" /> Word Volume
                                    </span>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${state.data.diff.wordCountDiff > 0 ? 'bg-success/5 text-success border-success/10' : 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]'}`}>
                                        {state.data.diff.wordCountDiff > 0 ? `+${state.data.diff.wordCountDiff}` : state.data.diff.wordCountDiff}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black tabular-nums tracking-tighter">{state.data.rendered.wordCount}</span>
                                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">RENDERED</span>
                                </div>
                                <div className="mt-2 text-[10px] text-[var(--text-muted)] font-medium">
                                    vs {state.data.raw.wordCount} in static source
                                </div>
                            </Card>

                            <Card padding="lg" className="flex flex-col justify-center bg-[var(--surface-1)] border-[var(--border)] shadow-sm overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <MdLink className="w-16 h-16" />
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-2 font-black uppercase tracking-[0.2em]">
                                        <MdLink className="w-4 h-4 text-blue-500" /> Link Density
                                    </span>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${state.data.diff.linkCountDiff > 0 ? 'bg-blue-500/5 text-blue-600 border-blue-500/10' : 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]'}`}>
                                        {state.data.diff.linkCountDiff > 0 ? `+${state.data.diff.linkCountDiff}` : state.data.diff.linkCountDiff}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black tabular-nums tracking-tighter">{state.data.rendered.linkCount}</span>
                                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">RENDERED</span>
                                </div>
                                <div className="mt-2 text-[10px] text-[var(--text-muted)] font-medium">
                                    vs {state.data.raw.linkCount} in static source
                                </div>
                            </Card>

                            <Card padding="lg" className="flex flex-col justify-center bg-[var(--surface-1)] border-[var(--border)] shadow-sm overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <MdJavascript className="w-16 h-16" />
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-2 font-black uppercase tracking-[0.2em]">
                                        <MdJavascript className="w-4 h-4 text-orange-500" /> JS Dependency
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black tabular-nums tracking-tighter">
                                        {Math.round(((state.data.rendered.wordCount - state.data.raw.wordCount) / state.data.rendered.wordCount) * 100) || 0}%
                                    </span>
                                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">RATIO</span>
                                </div>
                                <div className="mt-2 text-[10px] text-[var(--text-muted)] font-medium">
                                    Criticality of client-side logic
                                </div>
                            </Card>
                        </div>

                        {/* Head Tag Comparison Table */}
                        <Card className="overflow-hidden border-[var(--border)] shadow-md bg-[var(--surface-1)]">
                            <div className="p-6 border-b border-[var(--border)] bg-[var(--surface-2)]/30 flex items-center gap-3">
                                <MdCompare className="w-5 h-5 text-purple-600" />
                                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Head Metadata Comparison</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-[var(--surface-2)]/50 text-[var(--text-muted)] font-black uppercase tracking-widest text-[9px] border-b border-[var(--border)]">
                                        <tr>
                                            <th className="px-6 py-4 w-1/4">Element</th>
                                            <th className="px-6 py-4 w-1/3">Raw HTML (Static)</th>
                                            <th className="px-6 py-4 w-1/3">Rendered DOM (JS)</th>
                                            <th className="px-6 py-4 text-center">Parity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {[
                                            { label: "Page Title", raw: state.data.raw.seo.title, rendered: state.data.rendered.seo.title, match: state.data.diff.seoDiff.titleMatch },
                                            { label: "Meta Description", raw: state.data.raw.seo.description, rendered: state.data.rendered.seo.description, match: state.data.diff.seoDiff.descriptionMatch },
                                            { label: "Robots Tag", raw: state.data.raw.seo.robots, rendered: state.data.rendered.seo.robots, match: state.data.diff.seoDiff.robotsMatch },
                                            { label: "Canonical URL", raw: state.data.raw.seo.canonical, rendered: state.data.rendered.seo.canonical, match: state.data.diff.seoDiff.canonicalMatch },
                                            { label: "H1 Count", raw: state.data.raw.seo.h1Count, rendered: state.data.rendered.seo.h1Count, match: state.data.diff.seoDiff.h1Match },
                                        ].map((row, i) => (
                                            <tr key={i} className="hover:bg-[var(--surface-2)]/30 transition-colors">
                                                <td className="px-6 py-5 font-bold text-[var(--text-muted)] uppercase tracking-tight">{row.label}</td>
                                                <td className="px-6 py-5">
                                                    <div className="max-w-xs truncate font-mono text-[10px] bg-[var(--surface-2)] p-2 rounded border border-[var(--border)]" title={String(row.raw)}>
                                                        {String(row.raw) || <span className="opacity-30 italic">Not detected</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className={`max-w-xs truncate font-mono text-[10px] p-2 rounded border ${row.match ? 'bg-[var(--surface-2)] border-[var(--border)]' : 'bg-orange-500/5 border-orange-500/20 text-orange-600'}`} title={String(row.rendered)}>
                                                        {String(row.rendered) || <span className="opacity-30 italic">Not detected</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    {row.match ? (
                                                        <BiCheckCircle className="w-5 h-5 text-success mx-auto" />
                                                    ) : (
                                                        <BiErrorCircle className="w-5 h-5 text-orange-500 mx-auto" />
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* Comparison Highlights */}
                        <div className="grid gap-8 lg:grid-cols-2 mt-8">
                            {/* JS Only Content */}
                            <Card padding="none" className="bg-[var(--surface-1)] border-[var(--border)] shadow-sm overflow-hidden min-h-[400px]">
                                <div className="p-6 border-b border-[var(--border)] bg-[var(--surface-2)]/30 flex items-center justify-between">
                                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-2">
                                        <MdCode className="w-5 h-5 text-blue-600" />
                                        Hidden Content Snippets
                                    </h3>
                                    <span className="px-3 py-1 bg-blue-600/10 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest leading-none">
                                        {state.data.diff.jsOnlyContent.length} Detected
                                    </span>
                                </div>
                                <div className="p-6 space-y-4">
                                    {state.data.diff.jsOnlyContent.length > 0 ? (
                                        state.data.diff.jsOnlyContent.slice(0, 8).map((snippet, i) => (
                                            <div key={i} className="p-4 bg-[var(--surface-2)] hover:bg-[var(--border)]/10 transition-colors rounded-2xl text-[11px] border border-[var(--border)] font-medium text-[var(--text-muted)] leading-relaxed shadow-sm">
                                                &ldquo;{snippet}&rdquo;
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <BiCheckCircle className="w-16 h-16 text-success/10 mb-4" />
                                            <h4 className="text-sm font-bold text-success capitalize tracking-tight">Maximum crawl compatibility</h4>
                                            <p className="text-[10px] text-[var(--text-muted)] mt-1 font-medium italic">No major discrepancies between versions.</p>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* JS Only Links */}
                            <Card padding="none" className="bg-[var(--surface-1)] border-[var(--border)] shadow-sm overflow-hidden min-h-[400px]">
                                <div className="p-6 border-b border-[var(--border)] bg-[var(--surface-2)]/30 flex items-center justify-between">
                                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-2">
                                        <MdLink className="w-5 h-5 text-purple-600" />
                                        JS-Only Links ({state.data.diff.jsOnlyLinks.length})
                                    </h3>
                                    <span className="px-3 py-1 bg-purple-600/10 text-purple-600 text-[10px] font-black rounded-full uppercase tracking-widest leading-none">
                                        DISCOVERY_GAP
                                    </span>
                                </div>
                                <div className="p-6 space-y-2">
                                    {state.data.diff.jsOnlyLinks.length > 0 ? (
                                        state.data.diff.jsOnlyLinks.slice(0, 10).map((link, i) => (
                                            <div key={i} className="group p-3 bg-[var(--surface-2)] hover:bg-purple-600/[0.03] rounded-xl border border-[var(--border)] transition-all flex items-center gap-3">
                                                <div className="size-6 rounded-lg bg-white dark:bg-black/20 border border-[var(--border)] flex items-center justify-center text-[10px] font-black text-purple-600">
                                                    {i + 1}
                                                </div>
                                                <div className="text-[10px] font-mono truncate text-[var(--text-muted)] group-hover:text-purple-600 transition-colors">
                                                    {link}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <BiCheckCircle className="w-16 h-16 text-success/10 mb-4" />
                                            <h4 className="text-sm font-bold text-success capitalize tracking-tight">Full URL discovery</h4>
                                            <p className="text-[10px] text-[var(--text-muted)] mt-1 font-medium italic">All critical links are in raw HTML.</p>
                                        </div>
                                    )}
                                    {state.data.diff.jsOnlyLinks.length > 10 && (
                                        <p className="text-center text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] pt-6 opacity-50">
                                            + {state.data.diff.jsOnlyLinks.length - 10} more hidden references
                                        </p>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Deep Analysis Integration */}
                        {(extraLoading || extraData || extraError) && (
                            <div className="mt-16 pt-12 border-t border-[var(--border)]">
                                <div className="mb-8 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold flex items-center gap-2 text-[var(--foreground)]">
                                            <MdCompare className="w-6 h-6 text-primary" />
                                            Deep Page Intelligence
                                        </h2>
                                        <p className="text-[var(--text-muted)] text-sm">Comprehensive architectural and semantic analysis.</p>
                                    </div>
                                    {extraLoading && (
                                        <div className="flex items-center gap-2 text-primary animate-pulse font-bold text-xs uppercase tracking-widest">
                                            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                                            Analyzing Structure...
                                        </div>
                                    )}
                                </div>

                                {extraError && (
                                    <div className="border border-error bg-error/5 text-error p-4 rounded-xl text-sm font-medium">
                                        Deep Analysis Failed: {extraError}
                                    </div>
                                )}

                                {extraData && (
                                    <div className="space-y-8">
                                        <AIInterpretationPanel data={extraData.ai_interpretation} />

                                        <Card padding="lg" className="bg-[var(--surface-1)] border-[var(--border)]">
                                            <h3 className="text-lg font-bold mb-6 text-[var(--foreground)]">Visual Relationship Map</h3>
                                            <div className="aspect-video w-full rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-2)]">
                                                <LinkGraph
                                                    nodes={extraData.internal_link_analysis.nodes}
                                                    edges={extraData.internal_link_analysis.edges}
                                                    width={1100}
                                                    height={500}
                                                />
                                            </div>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
