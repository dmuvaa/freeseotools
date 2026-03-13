"use client";

import React, { useActionState, useRef, useState } from "react";
import { analyzeSchemaCoverage, SchemaCoverageState } from "./analyze/actions";
import Card from "@/components/ui/Card";
import ScoreRing from "@/components/ui/ScoreRing";
import CodeBlock from "@/components/ui/CodeBlock";
import { MdOutlineSchema, MdErrorOutline, MdCheckCircleOutline, MdSearch, MdCode, MdExpandMore, MdExpandLess } from "react-icons/md";
import { BiPieChartAlt2, BiLayer } from "react-icons/bi";

import SchemaVisualizer from "@/components/ui/SchemaVisualizer";

export default function SchemaCheckerClient() {
    const [state, formAction, isPending] = useActionState<SchemaCoverageState, FormData>(
        analyzeSchemaCoverage,
        {}
    );

    const [mode, setMode] = useState<"single" | "site">("single");
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const formRef = useRef<HTMLFormElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const coverageScore = state.data
        ? Math.round((state.data.pagesWithSchema / state.data.pagesCrawled) * 100)
        : 0;

    return (
        <div className="w-full">
            <div className="container mx-auto max-w-none">
                {/* Mode Selector - Segmented Control Style */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex p-1 bg-[var(--surface-2)] rounded-xl border border-[var(--border)] shadow-inner">
                        <button
                            onClick={() => setMode("single")}
                            className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${mode === "single"
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                                    : "text-[var(--text-muted)] hover:text-[var(--text-foreground)] hover:bg-[var(--surface-3)]"
                                }`}
                        >
                            Single Page
                        </button>
                        <button
                            onClick={() => setMode("site")}
                            className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${mode === "site"
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                                    : "text-[var(--text-muted)] hover:text-[var(--text-foreground)] hover:bg-[var(--surface-3)]"
                                }`}
                        >
                            Site Audit
                        </button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto mb-12">
                    <form action={formAction} ref={formRef} className="flex flex-col sm:flex-row gap-4">
                        <input type="hidden" name="mode" value={mode} />
                        <div className="relative flex-1">
                            <input
                                type="text"
                                name="url"
                                placeholder="https://example.com"
                                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-1)] pl-12 pr-4 py-4 placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] shadow-sm transition-all"
                                required
                                disabled={isPending}
                                ref={inputRef}
                            />
                            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 size-6 text-[var(--text-muted)]" />
                        </div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center justify-center rounded-xl bg-blue-600 dark:bg-blue-500 px-8 py-4 font-bold text-white transition-all hover:brightness-110 hover:shadow-xl hover:shadow-blue-500/20 disabled:opacity-50"
                        >
                            {isPending ? (
                                <span className="flex items-center gap-2">
                                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Analyzing...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Analyze {mode === "site" ? "Site" : "Page"}
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                {state.error && (
                    <div className="mt-4 rounded-lg border border-error bg-error/10 p-4 flex items-center gap-3">
                        <MdErrorOutline className="w-5 h-5 text-error flex-shrink-0" />
                        <p className="text-error text-sm">{state.error}</p>
                    </div>
                )}

                {state.success && state.data && (
                    <div className="mt-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {mode === "single" && state.data.pages[0] ? (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* Left Sticky Column: Summary & Issues */}
                                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                                    <div className="bg-[var(--surface-2)]/50 rounded-2xl p-6 border border-[var(--border)] shadow-sm">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="size-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                                                <MdOutlineSchema className="size-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold">Analysis Summary</h2>
                                                <p className="text-xs text-[var(--text-muted)] truncate max-w-[200px]" title={state.data.pages[0].url}>
                                                    {new URL(state.data.pages[0].url).hostname}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
                                                <span className="text-sm text-[var(--text-muted)] font-medium">Schema Types</span>
                                                <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-bold border border-success/20">
                                                    {state.data.pages[0].schemaTypes.length} Detected
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
                                                <span className="text-sm text-[var(--text-muted)] font-medium">Payloads</span>
                                                <span className="px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600 text-xs font-bold border border-blue-600/20">
                                                    {state.data.pages[0].jsonLd.length} Blocks
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {state.data.pages[0].errors.length > 0 && (
                                        <div className="bg-error/5 rounded-2xl p-6 border border-error/10 shadow-sm">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-error flex items-center gap-2 mb-4">
                                                <MdErrorOutline className="w-5 h-5" /> Validation Log
                                            </h3>
                                            <div className="space-y-3">
                                                {state.data.pages[0].errors.map((error, idx) => (
                                                    <div key={idx} className="p-3 rounded-lg bg-white dark:bg-black/20 border border-error/10 text-error text-[11px] leading-relaxed flex items-start gap-3 font-medium">
                                                        <span className="size-1.5 rounded-full bg-error mt-1 shrink-0" />
                                                        {error}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-[var(--surface-1)] rounded-2xl p-6 border border-[var(--border)]">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2 mb-4">
                                            <BiPieChartAlt2 className="w-4 h-4" /> Detected Types
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {state.data.pages[0].schemaTypes.map((t, j) => (
                                                <span key={j} className="px-2 py-1 rounded bg-[var(--surface-2)] text-[11px] font-bold border border-[var(--border)] text-blue-600 dark:text-blue-400">
                                                    {t}
                                                </span>
                                            ))}
                                            {state.data.pages[0].schemaTypes.length === 0 && (
                                                <p className="text-xs text-[var(--text-muted)] italic">No types detected.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Flowing Column: Schema Explorer */}
                                <div className="lg:col-span-8 space-y-6">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <MdCode className="w-6 h-6 text-blue-600" />
                                        Detected JSON-LD ({state.data.pages[0].jsonLd.length} blocks)
                                    </h3>

                                    {state.data.pages[0].jsonLd.length > 0 ? (
                                        <div className="space-y-4">
                                            {state.data.pages[0].jsonLd.slice(0, 5).map((json, index) => {
                                                let typeName = "Schema Block";
                                                try {
                                                    const parsed = JSON.parse(json);
                                                    typeName = parsed["@type"] || "Schema Block";
                                                    if (Array.isArray(typeName)) typeName = typeName.join(", ");
                                                } catch (e) {}
                                                
                                                return (
                                                    <CodeBlock
                                                        key={index}
                                                        code={JSON.stringify(JSON.parse(json), null, 2)}
                                                        language="json"
                                                        title={typeName}
                                                        showLineNumbers
                                                        collapsible
                                                        defaultExpanded={index === 0}
                                                    />
                                                );
                                            })}
                                            {state.data.pages[0].jsonLd.length > 5 && (
                                                <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center bg-[var(--surface-2)]/30">
                                                    <p className="text-sm text-[var(--text-muted)] font-medium">
                                                        +{state.data.pages[0].jsonLd.length - 5} more schema objects detected
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-20 text-center border-2 border-dashed border-[var(--border)] rounded-3xl bg-[var(--surface-1)]/50">
                                            <MdOutlineSchema className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-6 opacity-10" />
                                            <h4 className="text-xl font-bold text-[var(--text-muted)] mb-2">No Schema Detected</h4>
                                            <p className="text-[var(--text-muted)] max-w-sm mx-auto">We couldn't find any JSON-LD or Microdata on this page. Try another URL.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Metrics Grid */}
                                <div className="grid gap-6 md:grid-cols-4">
                                    <Card className="flex flex-col items-center justify-center text-center bg-[var(--surface-1)] border-[var(--border)] py-8 shadow-sm">
                                        <ScoreRing score={coverageScore} size="md" label="Coverage" />
                                    </Card>

                                    <Card className="flex flex-col justify-center bg-[var(--surface-1)] border-[var(--border)] p-8 shadow-sm">
                                        <div className="text-xs text-[var(--text-muted)] mb-2 font-bold uppercase tracking-wider flex items-center gap-2">
                                            <MdSearch className="w-4 h-4" /> Crawled
                                        </div>
                                        <div className="text-4xl font-black">{state.data.pagesCrawled}</div>
                                        <div className="text-[10px] text-[var(--text-muted)] mt-1 font-bold italic">/ 50 MAX LIMIT</div>
                                    </Card>

                                    <Card className="flex flex-col justify-center border-l-4 border-l-error bg-[var(--surface-1)] p-8 shadow-sm">
                                        <div className="text-xs text-[var(--text-muted)] mb-2 font-bold uppercase tracking-wider flex items-center gap-2">
                                            <MdErrorOutline className="w-4 h-4 text-error" /> Validation Errors
                                        </div>
                                        <div className="text-4xl font-black text-error">{state.data.pagesWithErrors}</div>
                                    </Card>

                                    <Card className="flex flex-col justify-center border-l-4 border-l-success bg-[var(--surface-1)] p-8 shadow-sm">
                                        <div className="text-xs text-[var(--text-muted)] mb-2 font-bold uppercase tracking-wider flex items-center gap-2">
                                            <MdCheckCircleOutline className="w-4 h-4 text-success" /> Valid Schema
                                        </div>
                                        <div className="text-4xl font-black text-success">{state.data.pagesWithSchema}</div>
                                    </Card>
                                </div>

                                <div className="grid gap-8 lg:grid-cols-12">
                                    {/* Type Distribution */}
                                    <Card className="lg:col-span-4 bg-[var(--surface-1)] rounded-2xl p-8 border border-[var(--border)] shadow-sm">
                                        <h3 className="text-lg font-black mb-8 flex items-center gap-2 text-foreground">
                                            <BiPieChartAlt2 className="w-6 h-6 text-blue-600" />
                                            Type Distribution
                                        </h3>
                                        <div className="space-y-6">
                                            {Object.entries(state.data.schemaTypeDistribution).map(([type, count]) => (
                                                <div key={type} className="group">
                                                    <div className="flex justify-between text-[11px] mb-2 font-black uppercase tracking-wider">
                                                        <span className="truncate pr-2">{type}</span>
                                                        <span className="text-blue-600">{count}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)] transition-all duration-1000"
                                                            style={{ width: `${(count / state.data!.pagesCrawled) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {Object.keys(state.data.schemaTypeDistribution).length === 0 && (
                                                <p className="text-sm text-[var(--text-muted)] text-center py-10 italic">No schema types identified.</p>
                                            )}
                                        </div>
                                    </Card>

                                    {/* Page Level Details */}
                                    <div className="lg:col-span-8 bg-[var(--surface-1)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
                                        <div className="p-6 border-b border-[var(--border)] bg-[var(--surface-2)]/30 flex items-center justify-between">
                                            <h3 className="font-black flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                                                <BiLayer className="w-5 h-5" />
                                                Audit Manifest
                                            </h3>
                                            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-blue-600 text-white uppercase tracking-widest">{state.data.pages.length} Pages</span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-[var(--surface-2)]/50 text-[var(--text-muted)] border-b border-[var(--border)] font-black uppercase text-[10px] tracking-widest">
                                                    <tr>
                                                        <th className="px-8 py-4">Resource path</th>
                                                        <th className="px-8 py-4">Entities</th>
                                                        <th className="px-8 py-4 text-center">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[var(--border)] font-mono text-[11px]">
                                                    {state.data.pages.map((page, i) => (
                                                        <React.Fragment key={i}>
                                                            <tr className="hover:bg-blue-600/[0.02] transition-colors cursor-pointer group" onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                                                                <td className="px-8 py-5 truncate max-w-[200px]" title={page.url}>
                                                                    <div className="flex items-center gap-3 font-bold group-hover:text-blue-600 transition-colors">
                                                                        {expandedRow === i ? <MdExpandLess className="size-5" /> : <MdExpandMore className="size-5" />}
                                                                        {new URL(page.url).pathname}
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5">
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {page.schemaTypes.map((t, j) => (
                                                                            <span key={j} className="px-2 py-0.5 rounded bg-[var(--surface-2)] text-[9px] font-bold border border-[var(--border)] font-sans uppercase">
                                                                                {t}
                                                                            </span>
                                                                        ))}
                                                                        {page.schemaTypes.length === 0 && (
                                                                            <span className="text-[var(--text-muted)] italic opacity-50">NULL</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5 text-center font-sans tracking-tighter">
                                                                    {page.errors.length > 0 ? (
                                                                        <span className="inline-flex size-2 rounded-full bg-error ring-4 ring-error/10" title="Validation Failed" />
                                                                    ) : page.hasSchema ? (
                                                                        <span className="inline-flex size-2 rounded-full bg-success ring-4 ring-success/10" title="Valid" />
                                                                    ) : (
                                                                        <span className="inline-flex size-2 rounded-full bg-[var(--text-muted)] opacity-30 ring-4 ring-[var(--surface-2)]" title="Missing" />
                                                                    )}
                                                                </td>
                                                            </tr>
                                                            {expandedRow === i && (
                                                                <tr className="bg-blue-600/[0.01]">
                                                                    <td colSpan={3} className="px-8 py-8 border-l-2 border-l-blue-600 bg-[var(--surface-1)]">
                                                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                                                            {/* Left Column: Summary & Issues (matching single page) */}
                                                                            <div className="lg:col-span-4 space-y-6">
                                                                                <div className="bg-[var(--surface-2)]/50 rounded-2xl p-6 border border-[var(--border)] shadow-sm">
                                                                                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">
                                                                                        <MdOutlineSchema className="w-5 h-5" /> Analysis Summary
                                                                                    </h4>
                                                                                    <div className="space-y-4">
                                                                                        <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
                                                                                            <span className="text-xs text-[var(--text-muted)] font-medium">Schema Types</span>
                                                                                            <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold border border-success/20">
                                                                                                {page.schemaTypes.length} Detected
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
                                                                                            <span className="text-xs text-[var(--text-muted)] font-medium">Payloads</span>
                                                                                            <span className="px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600 text-[10px] font-bold border border-blue-600/20">
                                                                                                {page.jsonLd.length} Blocks
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                {page.errors.length > 0 ? (
                                                                                    <div className="bg-error/5 rounded-2xl p-6 border border-error/10 shadow-sm">
                                                                                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-error mb-4">
                                                                                            <MdErrorOutline className="w-5 h-5 text-error" /> Validation Log
                                                                                        </h4>
                                                                                        <div className="space-y-2">
                                                                                            {page.errors.map((err, idx) => (
                                                                                                <div key={idx} className="p-4 rounded-xl bg-white dark:bg-black/20 border border-error/10 text-error text-[11px] font-bold flex items-center gap-3">
                                                                                                    <span className="shrink-0">CRITICAL_FAIL:</span>
                                                                                                    {err}
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="p-4 rounded-xl bg-success/5 border border-success/10 text-success text-[11px] font-bold flex items-center gap-3">
                                                                                        <MdCheckCircleOutline className="size-4" /> NO_ERRORS_DETECTED
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            {/* Right Column: Schema Explorer (matching single page) */}
                                                                            <div className="lg:col-span-8 space-y-6">
                                                                                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                                                                                    <MdCode className="w-5 h-5 text-blue-600" /> Detected JSON-LD ({page.jsonLd.length})
                                                                                </h4>
                                                                                {page.jsonLd && page.jsonLd.length > 0 ? (
                                                                                    <div className="space-y-3">
                                                                                        {page.jsonLd.slice(0, 3).map((json, index) => {
                                                                                            let typeName = "Schema Block";
                                                                                            try {
                                                                                                const parsed = JSON.parse(json);
                                                                                                typeName = parsed["@type"] || "Schema Block";
                                                                                                if (Array.isArray(typeName)) typeName = typeName.join(", ");
                                                                                            } catch (e) {}

                                                                                            return (
                                                                                                <CodeBlock
                                                                                                    key={index}
                                                                                                    code={JSON.stringify(JSON.parse(json), null, 2)}
                                                                                                    language="json"
                                                                                                    title={typeName}
                                                                                                    showLineNumbers
                                                                                                    collapsible
                                                                                                    defaultExpanded={index === 0}
                                                                                                    maxHeight="250px"
                                                                                                />
                                                                                            );
                                                                                        })}
                                                                                        {page.jsonLd.length > 3 && (
                                                                                            <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-center">
                                                                                                <p className="text-[10px] text-[var(--text-muted)]">
                                                                                                    +{page.jsonLd.length - 3} more blocks detected
                                                                                                </p>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                ) : (
                                                                                    <p className="text-[10px] text-[var(--text-muted)] italic font-bold">MISSING_JSON_SOURCE</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
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
