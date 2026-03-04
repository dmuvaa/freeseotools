"use client";

import { useState } from "react";
import { Search, AlertTriangle, CheckCircle, Zap, ArrowRight, Clock, ShieldAlert } from "lucide-react";

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

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/tools/redirect", {
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

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-8 border-b border-[var(--border)] pb-8">
                <h1 className="text-3xl font-bold mb-2">Redirect Checker</h1>
                <p className="text-[var(--text-muted)]">
                    Trace URL redirect chains to ensure search engines and users reach the correct destination. Identify 301/302 redirects, redirect loops, and measure response times.
                </p>

                <form onSubmit={analyzeRedirects} className="mt-6 flex flex-col sm:flex-row gap-4">
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
                                <Search className="size-4 animate-spin" /> Tracing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Search className="size-4" /> Trace Redirects
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
                        <div className="space-y-6">

                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
                                    <div className="text-[var(--text-muted)] text-sm mb-1 flex items-center gap-2"><Zap className="size-4" /> Total Redirects</div>
                                    <div className="text-3xl font-bold">{(result.chain?.length || 1) - 1}</div>
                                </div>
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
                                    <div className="text-[var(--text-muted)] text-sm mb-1 flex items-center gap-2"><Clock className="size-4" /> Total Time</div>
                                    <div className="text-3xl font-bold">{result.totalTimeMs} <span className="text-lg font-normal text-[var(--text-muted)]">ms</span></div>
                                </div>
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
                                    <div className="text-[var(--text-muted)] text-sm mb-1 flex items-center gap-2"><CheckCircle className="size-4" /> Final Status</div>
                                    <div className="text-3xl font-bold">
                                        {result.loopDetected ? (
                                            <span className="text-red-500 flex items-center gap-2"><ShieldAlert className="size-6" /> Loop</span>
                                        ) : (
                                            <span className={result.chain?.[result.chain.length - 1]?.status === 200 ? "text-green-500" : "text-yellow-500"}>
                                                {result.chain?.[result.chain.length - 1]?.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Redirect Chain Visualization */}
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                                <div className="border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 flex justify-between items-center">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <ArrowRight className="size-4 text-[var(--primary)]" />
                                        Redirect Chain
                                    </h3>
                                </div>
                                <div className="p-6">
                                    {result.chain && result.chain.length > 0 ? (
                                        <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--border)] before:to-transparent">
                                            {result.chain.map((hop, i) => (
                                                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[var(--background)] bg-[var(--surface-3)] text-[var(--text-muted)] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                                                        {i + 1}
                                                    </div>

                                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] shadow-sm">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className={`inline-flex items-center rounded bg-opacity-10 px-2 py-0.5 text-xs font-medium ${hop.status === 200 ? 'bg-green-500 text-green-500' :
                                                                    hop.status.toString().startsWith('3') ? 'bg-yellow-500 text-yellow-500' :
                                                                        'bg-red-500 text-red-500'
                                                                }`}>
                                                                HTTP {hop.status}
                                                                {hop.status === 301 && " (Permanent)"}
                                                                {hop.status === 302 && " (Temporary)"}
                                                                {hop.status === 307 && " (Temp Redirect)"}
                                                                {hop.status === 308 && " (Perm Redirect)"}
                                                                {hop.status === 200 && " (OK)"}
                                                            </span>
                                                            <span className="text-xs text-[var(--text-muted)] font-mono">{hop.timeMs}ms</span>
                                                        </div>
                                                        <p className="font-mono text-sm break-all text-[var(--primary)]">{hop.url}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[var(--text-muted)] text-center py-8">No chain data available.</p>
                                    )}
                                    {result.loopDetected && (
                                        <div className="mt-8 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-center flex items-center justify-center gap-2">
                                            <ShieldAlert className="size-5" />
                                            <strong>Error:</strong> Redirect loop detected. The server is redirecting to a URL that has already been visited.
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
