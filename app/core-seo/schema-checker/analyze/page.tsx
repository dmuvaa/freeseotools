"use client";

import { useActionState, useRef } from "react";
import { analyzeSchemaCoverage, SchemaCoverageState } from "./actions";
import Card from "@/components/ui/Card";
import ScoreRing from "@/components/ui/ScoreRing";
import { MdOutlineSchema, MdErrorOutline, MdCheckCircleOutline, MdSearch } from "react-icons/md";
import { BiPieChartAlt2, BiLayer } from "react-icons/bi";

export default function AnalyzePage() {
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
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Hero Section */}
            <section className="py-12 border-b border-border bg-surface-1/50">
                <div className="container-narrow text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-amber-glow text-accent-amber text-sm font-medium mb-4">
                        <MdOutlineSchema className="w-5 h-5" />
                        Schema Coverage Audit
                    </div>
                    <h1 className="text-3xl font-bold md:text-4xl mb-4">
                        Site-Wide Schema Intelligence
                    </h1>
                    <p className="text-foreground-muted max-w-2xl mx-auto">
                        Crawl your entire domain to identify missing schema markup, syntax errors,
                        and distribution across all indexed pages.
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
                                className="flex-1 rounded-xl border border-border bg-surface-1 px-5 py-4 text-sm outline-none focus:border-accent-amber focus:ring-2 focus:ring-accent-amber/20 transition shadow-inner"
                                required
                                disabled={isPending}
                                ref={inputRef}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary whitespace-nowrap px-8 bg-accent-amber hover:bg-accent-amber/90 border-none text-black font-bold"
                                disabled={isPending}
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
                                    "Start Audit"
                                )}
                            </button>
                        </div>
                    </form>

                    {state.error && (
                        <div className="mt-4 rounded-lg border border-error bg-error/10 p-4 flex items-center gap-3">
                            <MdErrorOutline className="w-5 h-5 text-error flex-shrink-0" />
                            <p className="text-error text-sm">{state.error}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Results Section */}
            {state.success && state.data && (
                <div className="container-wide mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Metrics Grid */}
                    <div className="grid gap-6 md:grid-cols-4">
                        <Card padding="lg" className="flex flex-col items-center justify-center text-center">
                            <ScoreRing score={coverageScore} size="md" label="Coverage" />
                            <p className="text-xs text-foreground-subtle mt-2 uppercase tracking-tight font-bold">Domain Healthy</p>
                        </Card>

                        <Card padding="lg" className="flex flex-col justify-center">
                            <div className="text-sm text-foreground-muted mb-1 flex items-center gap-2">
                                <MdSearch className="w-4 h-4" /> Pages Crawled
                            </div>
                            <div className="text-3xl font-bold">{state.data.pagesCrawled}</div>
                            <div className="text-xs text-foreground-subtle mt-1">Limit: 50 pages</div>
                        </Card>

                        <Card padding="lg" className="flex flex-col justify-center border-l-4 border-l-error">
                            <div className="text-sm text-foreground-muted mb-1 flex items-center gap-2">
                                <MdErrorOutline className="w-4 h-4 text-error" /> Validation Errors
                            </div>
                            <div className="text-3xl font-bold text-error">{state.data.pagesWithErrors}</div>
                            <p className="text-xs text-foreground-subtle mt-1">Found in JSON-LD blocks</p>
                        </Card>

                        <Card padding="lg" className="flex flex-col justify-center border-l-4 border-l-success">
                            <div className="text-sm text-foreground-muted mb-1 flex items-center gap-2">
                                <MdCheckCircleOutline className="w-4 h-4 text-success" /> Schema Detected
                            </div>
                            <div className="text-3xl font-bold text-success">{state.data.pagesWithSchema}</div>
                            <p className="text-xs text-foreground-subtle mt-1">Found on pages</p>
                        </Card>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Type Distribution */}
                        <Card padding="lg" className="lg:col-span-1">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <BiPieChartAlt2 className="w-5 h-5 text-accent-amber" />
                                Schema Type Distribution
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(state.data.schemaTypeDistribution).map(([type, count]) => (
                                    <div key={type} className="group">
                                        <div className="flex justify-between text-sm mb-1.5 font-medium">
                                            <span className="truncate pr-2">{type}</span>
                                            <span className="text-foreground-subtle">{count}</span>
                                        </div>
                                        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-accent-amber transition-all duration-1000 group-hover:brightness-110"
                                                style={{ width: `${(count / state.data!.pagesCrawled) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(state.data.schemaTypeDistribution).length === 0 && (
                                    <p className="text-sm text-foreground-muted text-center py-10 italic">No schema types identified.</p>
                                )}
                            </div>
                        </Card>

                        {/* Page Level Details */}
                        <Card padding="none" className="lg:col-span-2 overflow-hidden border-border">
                            <div className="p-4 border-b border-border bg-surface-2/50 flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2">
                                    <BiLayer className="w-5 h-5 text-accent-amber" />
                                    Crawl Manifest
                                </h3>
                                <span className="badge badge-info">{state.data.pages.length} Pages</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-surface-1 border-b border-border text-foreground-subtle">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold">URL</th>
                                            <th className="px-4 py-3 text-left font-semibold">Detected Types</th>
                                            <th className="px-4 py-3 text-center font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {state.data.pages.map((page, i) => (
                                            <tr key={i} className="hover:bg-surface-2/30 transition-colors">
                                                <td className="px-4 py-4 max-w-[200px]">
                                                    <div className="truncate font-mono text-xs" title={page.url}>{page.url}</div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {page.schemaTypes.map((t, j) => (
                                                            <span key={j} className="px-1.5 py-0.5 rounded bg-surface-3 text-[10px] border border-border">
                                                                {t}
                                                            </span>
                                                        ))}
                                                        {page.schemaTypes.length === 0 && (
                                                            <span className="text-foreground-subtle italic text-[10px]">None</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    {page.errors.length > 0 ? (
                                                        <span className="px-2 py-1 rounded-full bg-error/10 text-error text-[10px] font-bold">Errors</span>
                                                    ) : page.hasSchema ? (
                                                        <span className="px-2 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold">Valid</span>
                                                    ) : (
                                                        <span className="px-2 py-1 rounded-full bg-surface-2 text-foreground-subtle text-[10px] font-bold">Missing</span>
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

            {/* Empty State */}
            {!state.success && !state.error && !isPending && (
                <section className="py-20">
                    <div className="container-narrow text-center">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-surface-2 border border-border shadow-sm">
                            <MdOutlineSchema className="h-12 w-12 text-accent-amber/40" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Deep Scan Required</h2>
                        <p className="text-foreground-muted max-w-md mx-auto line-relaxed">
                            Search engine bots need valid and consistent schema across your site.
                            Start an audit to see your site-wide coverage and find silent errors.
                        </p>
                    </div>
                </section>
            )}
        </div>
    );
}
