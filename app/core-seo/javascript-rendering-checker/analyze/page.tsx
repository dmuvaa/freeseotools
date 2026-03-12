"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { analyzeJavascriptUrl, JsRenderingState } from "./actions";
import Card from "@/components/ui/Card";
import ScoreRing from "@/components/ui/ScoreRing";
import { LinkGraph } from "@/components/analysis/LinkGraph";
import { AIInterpretationPanel } from "@/components/analysis/AIInterpretation";
import { AnalysisResponse } from "@/lib/analysis/types";
import { MdJavascript, MdCompare, MdCode, MdLink, MdArticle } from "react-icons/md";
import { BiErrorCircle, BiCheckCircle } from "react-icons/bi";

export default function AnalyzePage() {
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
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Hero Section */}
            <section className="py-12 border-b border-border bg-surface-1/50">
                <div className="container-narrow text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        <MdJavascript className="w-5 h-5" />
                        JS Rendering Checker
                    </div>
                    <h1 className="text-3xl font-bold md:text-4xl mb-4">
                        Raw HTML vs. Rendered DOM
                    </h1>
                    <p className="text-foreground-muted max-w-2xl mx-auto">
                        See exactly what search bots miss when they don&apos;t execute your JavaScript.
                        Identify critical content and links hidden behind client-side rendering.
                    </p>
                </div>
            </section>

            {/* URL Input Form */}
            <section className="py-8 sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
                <div className="container-narrow">
                    <form action={formAction} ref={formRef}>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <input
                                type="url"
                                name="url"
                                placeholder="https://example.com"
                                className="flex-1 rounded-xl border border-border bg-surface-1 px-5 py-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition shadow-inner"
                                required
                                disabled={isPending}
                                ref={inputRef}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary whitespace-nowrap px-8"
                                disabled={isPending}
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
                                    "Compare Versions"
                                )}
                            </button>
                        </div>
                    </form>

                    {state.error && (
                        <div className="mt-4 rounded-lg border border-error bg-error/10 p-4 flex items-center gap-3">
                            <BiErrorCircle className="w-5 h-5 text-error flex-shrink-0" />
                            <p className="text-error text-sm">{state.error}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Results Section */}
            {state.success && state.data && (
                <div className="container-wide mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Top Level Metrics */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card padding="lg" className="flex items-center gap-6">
                            <ScoreRing
                                score={state.data.diff.similarity}
                                size="md"
                                label="Similarity"
                            />
                            <div>
                                <h3 className="text-lg font-bold">SEO Similarity</h3>
                                <p className="text-sm text-foreground-muted">
                                    {state.data.diff.similarity >= 95
                                        ? "Perfect parity between versions."
                                        : state.data.diff.similarity >= 70
                                            ? "Minor discrepancies detected."
                                            : "High risk: Content is JS-dependent."}
                                </p>
                            </div>
                        </Card>

                        <Card padding="lg" className="flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-foreground-muted flex items-center gap-2">
                                    <MdArticle className="w-4 h-4" /> Word Count
                                </span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${state.data.diff.wordCountDiff > 0 ? 'bg-success/10 text-success' : 'bg-surface-2 text-foreground-subtle'}`}>
                                    {state.data.diff.wordCountDiff > 0 ? `+${state.data.diff.wordCountDiff}` : state.data.diff.wordCountDiff}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold">{state.data.rendered.wordCount}</span>
                                <span className="text-sm text-foreground-subtle">vs {state.data.raw.wordCount} raw</span>
                            </div>
                        </Card>

                        <Card padding="lg" className="flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-foreground-muted flex items-center gap-2">
                                    <MdLink className="w-4 h-4" /> Link Count
                                </span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${state.data.diff.linkCountDiff > 0 ? 'bg-primary/10 text-primary' : 'bg-surface-2 text-foreground-subtle'}`}>
                                    {state.data.diff.linkCountDiff > 0 ? `+${state.data.diff.linkCountDiff}` : state.data.diff.linkCountDiff}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold">{state.data.rendered.linkCount}</span>
                                <span className="text-sm text-foreground-subtle">vs {state.data.raw.linkCount} raw</span>
                            </div>
                        </Card>
                    </div>

                    {/* Comparison Highlights */}
                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* JS Only Content */}
                        <Card padding="lg">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <MdCode className="w-5 h-5 text-primary" />
                                Content Hidden Behind JavaScript
                            </h3>
                            <div className="space-y-3">
                                {state.data.diff.jsOnlyContent.length > 0 ? (
                                    state.data.diff.jsOnlyContent.map((snippet, i) => (
                                        <div key={i} className="p-3 bg-surface-2 rounded-lg text-sm border border-border italic text-foreground-muted">
                                            &ldquo;{snippet}&rdquo;
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <BiCheckCircle className="w-12 h-12 text-success/20 mx-auto mb-2" />
                                        <p className="text-sm text-foreground-muted">No major content discrepancies found.</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* JS Only Links */}
                        <Card padding="lg">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <MdLink className="w-5 h-5 text-primary" />
                                JS-Only Links ({state.data.diff.jsOnlyLinks.length})
                            </h3>
                            <div className="space-y-2">
                                {state.data.diff.jsOnlyLinks.length > 0 ? (
                                    state.data.diff.jsOnlyLinks.slice(0, 8).map((link, i) => (
                                        <div key={i} className="p-2.5 bg-surface-2 rounded border border-border text-xs font-mono truncate hover:text-primary transition-colors cursor-default">
                                            {link}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <BiCheckCircle className="w-12 h-12 text-success/20 mx-auto mb-2" />
                                        <p className="text-sm text-foreground-muted">All critical links are present in raw HTML.</p>
                                    </div>
                                )}
                                {state.data.diff.jsOnlyLinks.length > 8 && (
                                    <p className="text-center text-xs text-foreground-subtle pt-2">
                                        + {state.data.diff.jsOnlyLinks.length - 8} more links detected
                                    </p>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Deep Analysis Integration */}
                    <div className="mt-16 pt-12 border-t border-border">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <MdCompare className="w-6 h-6 text-primary" />
                                    Deep Page Intelligence
                                </h2>
                                <p className="text-foreground-muted">Comprehensive architectural and semantic analysis.</p>
                            </div>
                            {extraLoading && (
                                <div className="flex items-center gap-2 text-primary animate-pulse font-medium">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                                    Analyzing Structure...
                                </div>
                            )}
                        </div>

                        {extraError && (
                            <Card className="border-error bg-error/5 text-error p-4">
                                Deep Analysis Failed: {extraError}
                            </Card>
                        )}

                        {extraData && (
                            <div className="space-y-8">
                                <AIInterpretationPanel data={extraData.ai_interpretation} />

                                <Card padding="lg">
                                    <h3 className="text-lg font-bold mb-6">Visual Relationship Map</h3>
                                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-border">
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
                </div>
            )}

            {/* Empty State */}
            {!state.success && !state.error && !isPending && (
                <section className="py-20">
                    <div className="container-narrow text-center">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-surface-2 border border-border shadow-sm">
                            <MdJavascript className="h-12 w-12 text-primary/40" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Ready to audit?</h2>
                        <p className="text-foreground-muted max-w-md mx-auto line-relaxed">
                            Paste your URL above to start a deep comparison. We&apos;ll check similarities,
                            hidden content, and dynamic link risks.
                        </p>
                    </div>
                </section>
            )}
        </div>
    );
}
