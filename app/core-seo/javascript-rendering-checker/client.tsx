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

    return (
        <div className="w-full">
            <div className="container mx-auto">
                <form action={formAction} ref={formRef} className="mt-2 flex flex-col sm:flex-row gap-4">
                    <input
                        type="url"
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
                        <div className="grid gap-6 md:grid-cols-3">
                            <Card padding="lg" className="flex items-center gap-6 bg-[var(--surface-1)] border-[var(--border)]">
                                <ScoreRing
                                    score={state.data.diff.similarity}
                                    size="md"
                                    label="Similarity"
                                />
                                <div>
                                    <h3 className="text-lg font-bold">SEO Similarity</h3>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                        {state.data.diff.similarity >= 95
                                            ? "Perfect parity between versions."
                                            : state.data.diff.similarity >= 70
                                                ? "Minor discrepancies detected."
                                                : "High risk: Content is JS-dependent."}
                                    </p>
                                </div>
                            </Card>

                            <Card padding="lg" className="flex flex-col justify-center bg-[var(--surface-1)] border-[var(--border)]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-2 font-bold uppercase tracking-wider">
                                        <MdArticle className="w-4 h-4" /> Word Count
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${state.data.diff.wordCountDiff > 0 ? 'bg-success/10 text-success' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>
                                        {state.data.diff.wordCountDiff > 0 ? `+${state.data.diff.wordCountDiff}` : state.data.diff.wordCountDiff}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">{state.data.rendered.wordCount}</span>
                                    <span className="text-xs text-[var(--text-muted)] font-medium">vs {state.data.raw.wordCount} raw</span>
                                </div>
                            </Card>

                            <Card padding="lg" className="flex flex-col justify-center bg-[var(--surface-1)] border-[var(--border)]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-2 font-bold uppercase tracking-wider">
                                        <MdLink className="w-4 h-4" /> Link Count
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${state.data.diff.linkCountDiff > 0 ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'bg-surface-2 text-text-muted'}`}>
                                        {state.data.diff.linkCountDiff > 0 ? `+${state.data.diff.linkCountDiff}` : state.data.diff.linkCountDiff}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">{state.data.rendered.linkCount}</span>
                                    <span className="text-xs text-text-muted font-medium">vs {state.data.raw.linkCount} raw</span>
                                </div>
                            </Card>
                        </div>

                        {/* Comparison Highlights */}
                        <div className="grid gap-8 lg:grid-cols-2">
                            {/* JS Only Content */}
                            <Card padding="lg" className="bg-[var(--surface-1)] border-[var(--border)]">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--foreground)]">
                                    <MdCode className="w-5 h-5 text-primary" />
                                    Hidden Content
                                </h3>
                                <div className="space-y-3">
                                    {state.data.diff.jsOnlyContent.length > 0 ? (
                                        state.data.diff.jsOnlyContent.slice(0, 5).map((snippet, i) => (
                                            <div key={i} className="p-3 bg-[var(--surface-2)] rounded-xl text-xs border border-[var(--border)] italic text-[var(--text-muted)] leading-relaxed">
                                                &ldquo;{snippet}&rdquo;
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <BiCheckCircle className="w-12 h-12 text-success/20 mx-auto mb-2" />
                                            <p className="text-sm text-[var(--text-muted)]">No major discrepancies found.</p>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* JS Only Links */}
                            <Card padding="lg" className="bg-[var(--surface-1)] border-[var(--border)]">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--foreground)]">
                                    <MdLink className="w-5 h-5 text-primary" />
                                    JS-Only Links ({state.data.diff.jsOnlyLinks.length})
                                </h3>
                                <div className="space-y-2">
                                    {state.data.diff.jsOnlyLinks.length > 0 ? (
                                        state.data.diff.jsOnlyLinks.slice(0, 6).map((link, i) => (
                                            <div key={i} className="p-2.5 bg-[var(--surface-2)] rounded-lg border border-[var(--border)] text-[10px] font-mono truncate hover:text-primary transition-colors cursor-default leading-none">
                                                {link}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <BiCheckCircle className="w-12 h-12 text-success/20 mx-auto mb-2" />
                                            <p className="text-sm text-[var(--text-muted)]">All critical links are in raw HTML.</p>
                                        </div>
                                    )}
                                    {state.data.diff.jsOnlyLinks.length > 6 && (
                                        <p className="text-center text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest pt-2">
                                            + {state.data.diff.jsOnlyLinks.length - 6} more links detected
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
