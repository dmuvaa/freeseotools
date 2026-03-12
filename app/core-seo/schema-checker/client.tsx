"use client";

import { useActionState, useRef } from "react";
import { analyzeSchemaCoverage, SchemaCoverageState } from "./analyze/actions";
import Card from "@/components/ui/Card";
import ScoreRing from "@/components/ui/ScoreRing";
import { MdOutlineSchema, MdErrorOutline, MdCheckCircleOutline, MdSearch } from "react-icons/md";
import { BiPieChartAlt2, BiLayer } from "react-icons/bi";

export default function SchemaCheckerClient() {
    const [state, formAction, isPending] = useActionState<SchemaCoverageState, FormData>(
        analyzeSchemaCoverage,
        {}
    );

    const formRef = useRef<HTMLFormElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const coverageScore = state.data
        ? Math.round((state.data.pagesWithSchema / state.data.pagesCrawled) * 100)
        : 0;

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
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 dark:bg-blue-500 px-6 py-3 font-medium text-white transition-colors hover:brightness-110 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                    >
                        {isPending ? (
                            <span className="flex items-center gap-2">
                                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Crawling...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 font-bold">
                                <MdSearch className="size-5" /> Start Audit
                            </span>
                        )}
                    </button>
                </form>

                {state.error && (
                    <div className="mt-4 rounded-lg border border-error bg-error/10 p-4 flex items-center gap-3">
                        <MdErrorOutline className="w-5 h-5 text-error flex-shrink-0" />
                        <p className="text-error text-sm">{state.error}</p>
                    </div>
                )}

                {state.success && state.data && (
                    <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Metrics Grid */}
                        <div className="grid gap-6 md:grid-cols-4">
                            <Card padding="lg" className="flex flex-col items-center justify-center text-center bg-[var(--surface-1)] border-[var(--border)]">
                                <ScoreRing score={coverageScore} size="md" label="Coverage" />
                            </Card>

                            <Card padding="lg" className="flex flex-col justify-center bg-[var(--surface-1)] border-[var(--border)]">
                                <div className="text-sm text-[var(--text-muted)] mb-1 flex items-center gap-2 font-medium">
                                    <MdSearch className="w-4 h-4" /> Pages Crawled
                                </div>
                                <div className="text-3xl font-bold flex items-baseline gap-2">
                                    {state.data.pagesCrawled}
                                    <span className="text-xs text-[var(--text-muted)] font-normal">/ 50 max</span>
                                </div>
                            </Card>

                            <Card padding="lg" className="flex flex-col justify-center border-l-4 border-l-error bg-[var(--surface-1)]">
                                <div className="text-sm text-[var(--text-muted)] mb-1 flex items-center gap-2 font-medium">
                                    <MdErrorOutline className="w-4 h-4 text-error" /> Validation Errors
                                </div>
                                <div className="text-3xl font-bold text-error">{state.data.pagesWithErrors}</div>
                            </Card>

                            <Card padding="lg" className="flex flex-col justify-center border-l-4 border-l-success bg-[var(--surface-1)]">
                                <div className="text-sm text-[var(--text-muted)] mb-1 flex items-center gap-2 font-medium">
                                    <MdCheckCircleOutline className="w-4 h-4 text-success" /> Schema Detected
                                </div>
                                <div className="text-3xl font-bold text-success">{state.data.pagesWithSchema}</div>
                            </Card>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Type Distribution */}
                            <Card padding="lg" className="lg:col-span-1 bg-surface-1 border-border">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground">
                                    <BiPieChartAlt2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Type Distribution
                                </h3>
                                <div className="space-y-4">
                                    {Object.entries(state.data.schemaTypeDistribution).map(([type, count]) => (
                                        <div key={type} className="group">
                                            <div className="flex justify-between text-xs mb-1.5 font-bold">
                                                <span className="truncate pr-2">{type}</span>
                                                <span className="text-[var(--text-muted)]">{count}</span>
                                            </div>
                                            <div className="h-2 bg-surface-2 rounded-full overflow-hidden border border-border/50">
                                                <div
                                                    className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-1000 group-hover:brightness-110"
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
                            <Card padding="none" className="lg:col-span-2 overflow-hidden border-border bg-surface-1">
                                <div className="p-4 border-b border-border bg-surface-2/50 flex items-center justify-between">
                                    <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-text-muted">
                                        <BiLayer className="w-4 h-4" />
                                        Crawl Manifest
                                    </h3>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white uppercase tracking-widest">{state.data.pages.length} Pages</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] border-b border-[var(--border)] font-bold uppercase text-[10px] tracking-tight">
                                            <tr>
                                                <th className="px-6 py-3">URL</th>
                                                <th className="px-6 py-3">Detected Types</th>
                                                <th className="px-6 py-3 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border)] font-mono text-xs">
                                            {state.data.pages.map((page, i) => (
                                                <tr key={i} className="hover:bg-[var(--surface-3)]/50 transition-colors">
                                                    <td className="px-6 py-4 truncate max-w-xs" title={page.url}>
                                                        {new URL(page.url).pathname}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {page.schemaTypes.map((t, j) => (
                                                                <span key={j} className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[10px] border border-[var(--border)] font-sans">
                                                                    {t}
                                                                </span>
                                                            ))}
                                                            {page.schemaTypes.length === 0 && (
                                                                <span className="text-[var(--text-muted)] italic text-[10px]">None</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-sans tracking-tighter">
                                                        {page.errors.length > 0 ? (
                                                            <span className="px-2 py-0.5 rounded bg-error/10 text-error text-[10px] font-bold border border-error/20 uppercase tracking-widest">Errors</span>
                                                        ) : page.hasSchema ? (
                                                            <span className="px-2 py-0.5 rounded bg-success/10 text-success text-[10px] font-bold border border-success/20 uppercase tracking-widest">Valid</span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-muted)] text-[10px] font-bold border border-[var(--border)] uppercase tracking-widest">Missing</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
