"use client";

import { useState } from "react";
import { MdSearch, MdCheckCircle, MdFlashOn, MdArrowForward, MdAccessTime, MdSecurity } from "react-icons/md";
import { BiErrorCircle } from "react-icons/bi";

interface RedirectHop {
    url: string;
    status: number;
    timeMs: number;
}

interface RedirectResponse {
    url: string;
    success: boolean;
    error?: string;
    finalUrl?: string;
    chain?: RedirectHop[];
    totalTimeMs?: number;
    loopDetected?: boolean;
}

export default function RedirectChecker() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<RedirectResponse | null>(null);

    const analyzeRedirects = async (e: React.FormEvent) => {
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
            const res = await fetch("/api/tools/redirect", {
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

    return (
        <div className="w-full">
            <div className="container mx-auto max-w-5xl">
                <form onSubmit={analyzeRedirects} className="mt-2 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        required
                        className="flex-1 rounded-md border border-border bg-surface-1 px-4 py-3 placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-white transition-colors hover:brightness-110 disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <MdSearch className="size-5 animate-spin" /> Tracing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <MdSearch className="size-5" /> Trace Redirects
                            </span>
                        )}
                    </button>
                </form>

                {result && (
                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {!result.success ? (
                            <div className="rounded-lg border border-error bg-error-glow p-4 text-error flex items-start gap-3 shadow-error-glow">
                                <BiErrorCircle className="size-6 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold">Analysis Failed</h3>
                                    <p className="text-sm opacity-90">{result.error}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Summary Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="rounded-xl border border-border bg-surface-1 p-6 shadow-sm flex flex-col items-center justify-center text-center">
                                        <div className="text-foreground-muted text-xs uppercase font-bold tracking-tight mb-2 flex items-center gap-2">
                                            <MdFlashOn className="size-4 text-primary" /> Total Redirects
                                        </div>
                                        <div className="text-4xl font-bold">{Math.max(0, (result.chain?.length || 1) - 1)}</div>
                                    </div>
                                    <div className="rounded-xl border border-border bg-surface-1 p-6 shadow-sm flex flex-col items-center justify-center text-center">
                                        <div className="text-foreground-muted text-xs uppercase font-bold tracking-tight mb-2 flex items-center gap-2">
                                            <MdAccessTime className="size-4 text-primary" /> Total Time
                                        </div>
                                        <div className="text-4xl font-bold">{result.totalTimeMs} <span className="text-lg font-normal text-foreground-muted">ms</span></div>
                                    </div>
                                    <div className="rounded-xl border border-border bg-surface-1 p-6 shadow-sm flex flex-col items-center justify-center text-center">
                                        <div className="text-foreground-muted text-xs uppercase font-bold tracking-tight mb-2 flex items-center gap-2">
                                            <MdCheckCircle className="size-4 text-primary" /> Final Status
                                        </div>
                                        <div className="text-4xl font-bold">
                                            {result.loopDetected ? (
                                                <span className="text-error flex items-center gap-2"><MdSecurity className="size-8" /> Loop</span>
                                            ) : (
                                                <span className={result.chain?.[result.chain.length - 1]?.status === 200 ? "text-success" : "text-warning"}>
                                                    {result.chain?.[result.chain.length - 1]?.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Redirect Chain Visualization */}
                                <div className="rounded-xl border border-border bg-surface-1 overflow-hidden shadow-sm">
                                    <div className="border-b border-border bg-surface-2 px-6 py-4 flex justify-between items-center bg-surface-2 font-bold flex items-center gap-2 text-foreground-subtle">
                                        <h3 className="font-bold flex items-center gap-2 text-foreground-subtle">
                                            <MdArrowForward className="size-5 text-primary" />
                                            Redirect Chain Visualization
                                        </h3>
                                        <span className="ml-auto text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-wider">{result.chain?.length || 0} Hops</span>
                                    </div>
                                    <div className="p-8">
                                        {result.chain && result.chain.length > 0 ? (
                                            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:H-full before:W-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                                                {result.chain.map((hop, i) => (
                                                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[var(--background)] bg-[var(--surface-3)] text-[var(--text-muted)] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors font-bold">
                                                            {i + 1}
                                                        </div>

                                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-xl border border-border bg-surface-2 shadow-sm transition-all hover:border-primary/50 group-hover:shadow-md">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className={`inline-flex items-center rounded px-2.5 py-1 text-[10px] font-bold border ${hop.status === 200 ? 'bg-success/10 text-success border-success/20' :
                                                                    hop.status.toString().startsWith('3') ? 'bg-warning/10 text-warning border-warning/20' :
                                                                        'bg-error/10 text-error border-error/20'
                                                                    }`}>
                                                                    HTTP {hop.status}
                                                                    {hop.status === 301 && " (Permanent)"}
                                                                    {hop.status === 302 && " (Temporary)"}
                                                                    {hop.status === 307 && " (Temp Redirect)"}
                                                                    {hop.status === 308 && " (Perm Redirect)"}
                                                                    {hop.status === 200 && " (OK)"}
                                                                </span>
                                                                <span className="text-[10px] text-foreground-muted font-mono bg-surface-3 px-2 py-0.5 rounded border border-border flex items-center gap-1 group-hover:bg-primary/10 transition-colors">
                                                                    <MdAccessTime className="size-3" /> {hop.timeMs}ms
                                                                </span>
                                                            </div>
                                                            <p className="font-mono text-xs break-all text-indigo-600 dark:text-indigo-400 font-bold leading-relaxed">{hop.url}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[var(--text-muted)] text-center py-8">No chain data available.</p>
                                        )}
                                        {result.loopDetected && (
                                            <div className="mt-8 p-4 bg-error-glow border border-error/50 rounded-lg text-error text-center flex items-center justify-center gap-2 shadow-error-glow animate-pulse">
                                                <MdSecurity className="size-6" />
                                                <strong className="font-bold">Error:</strong> Redirect loop detected. The server is redirecting to a URL that has already been visited.
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
