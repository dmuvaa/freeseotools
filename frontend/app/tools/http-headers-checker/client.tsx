"use client";

import { useState } from "react";
import { Search, AlertTriangle, CheckCircle, Server, Info, ShieldAlert } from "lucide-react";

interface HeaderData {
    name: string;
    value: string;
}

interface SecurityHeaderStatus {
    name: string;
    present: boolean;
    value?: string;
    description: string;
}

interface HeadersResponse {
    url: string;
    success: boolean;
    error?: string;
    status?: number;
    statusText?: string;
    headers?: HeaderData[];
    securityHeaders?: SecurityHeaderStatus[];
    server?: string;
    contentType?: string;
}

export default function HttpHeadersChecker() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<HeadersResponse | null>(null);

    const analyzeHeaders = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/tools/http-headers", {
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
                <h1 className="text-3xl font-bold mb-2">HTTP Headers Checker</h1>
                <p className="text-[var(--text-muted)]">
                    Inspect HTTP response headers to verify server configurations, cache controls, and critical security directives like CSP and HSTS.
                </p>

                <form onSubmit={analyzeHeaders} className="mt-6 flex flex-col sm:flex-row gap-4">
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
                                <Search className="size-4 animate-spin" /> Inspecting...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Search className="size-4" /> Inspect Headers
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

                            {/* Summary */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[var(--surface-1)] p-4 rounded-xl border border-[var(--border)] gap-4">
                                <div>
                                    <h3 className="font-semibold truncate max-w-md" title={result.url}>{result.url}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`inline-flex items-center gap-1 rounded bg-opacity-10 px-2 py-0.5 text-xs font-medium ${result.status === 200 ? 'bg-green-500 text-green-500' :
                                                result.status?.toString().startsWith('3') ? 'bg-yellow-500 text-yellow-500' : 'bg-red-500 text-red-500'
                                            }`}>
                                            HTTP {result.status} {result.statusText}
                                        </span>
                                        {result.server && (
                                            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                                <Server className="size-3" /> {result.server}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm text-[var(--text-muted)]">
                                    <strong>Content-Type:</strong> {result.contentType || "Unknown"}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Security Headers */}
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden h-fit">
                                    <div className="border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 flex justify-between items-center">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <ShieldAlert className="size-4 text-[var(--primary)]" />
                                            Security Headers
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-[var(--border)]">
                                        {result.securityHeaders?.map((sh, i) => (
                                            <div key={i} className="p-4 hover:bg-[var(--surface-2)]/30">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {sh.present ? (
                                                        <CheckCircle className="size-4 text-green-500" />
                                                    ) : (
                                                        <AlertTriangle className="size-4 text-yellow-500" />
                                                    )}
                                                    <strong className="font-mono text-sm">{sh.name}</strong>
                                                    {!sh.present && <span className="badge badge-weak ml-auto text-xs">Missing</span>}
                                                </div>
                                                <p className="text-xs text-[var(--text-muted)] mb-2">{sh.description}</p>
                                                {sh.present && (
                                                    <div className="bg-[var(--surface-3)] p-2 rounded text-xs font-mono break-all text-[var(--primary-muted)]">
                                                        {sh.value}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* All Headers Table */}
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden h-fit">
                                    <div className="border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 flex justify-between items-center">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            All Raw Headers
                                        </h3>
                                        <span className="badge badge-info">{result.headers?.length}</span>
                                    </div>
                                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2 font-medium w-1/3">Name</th>
                                                    <th className="px-4 py-2 font-medium w-2/3">Value</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--border)]">
                                                {result.headers?.map((header, i) => (
                                                    <tr key={i} className="hover:bg-[var(--surface-2)]/50">
                                                        <td className="px-4 py-3 font-mono text-xs font-semibold align-top">{header.name}</td>
                                                        <td className="px-4 py-3 font-mono text-xs break-all text-[var(--text-muted)] align-top">{header.value}</td>
                                                    </tr>
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
    );
}
