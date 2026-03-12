"use client";

import { useState } from "react";
import { MdSearch, MdCheckCircle, MdDns, MdSecurity } from "react-icons/md";
import { BiErrorCircle } from "react-icons/bi";

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
        <div className="w-full">
            <div className="container mx-auto max-w-5xl">
                <form onSubmit={analyzeHeaders} className="mt-2 flex flex-col sm:flex-row gap-4 mb-8">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Inspect URL (e.g., https://example.com)"
                        required
                        className="flex-1 rounded-md border border-border bg-surface-1 px-4 py-3 placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <MdSearch className="size-5 animate-spin" /> Fetching...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <MdSearch className="size-5" /> Inspect
                            </span>
                        )}
                    </button>
                </form>

                {result && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {!result.success ? (
                            <div className="rounded-2xl border border-rose-500 bg-rose-500/10 p-6 text-rose-500 flex items-start gap-4 shadow-xl">
                                <BiErrorCircle className="size-8 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-black uppercase tracking-tight text-lg mb-1">Handshake Failed</h3>
                                    <p className="text-sm opacity-90 leading-relaxed font-medium">{result.error}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">

                                {/* Summary */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface-1/50 backdrop-blur-md p-6 rounded-2xl border border-border gap-6 shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
                                    <div>
                                        <h3 className="font-mono text-sm font-bold truncate max-w-md text-foreground-subtle group-hover:text-indigo-500 transition-colors" title={result.url}>{result.url}</h3>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className={`inline-flex items-center gap-2 rounded-lg px-3 py-1 text-[11px] font-black tracking-widest border uppercase ${result.status === 200 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                result.status?.toString().startsWith('3') ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                }`}>
                                                HTTP {result.status} {result.statusText}
                                            </span>
                                            {result.server && (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground-muted flex items-center gap-2 bg-surface-2 px-3 py-1 rounded-full border border-border">
                                                    <MdDns className="size-4 text-indigo-500" /> {result.server}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground-muted bg-surface-2 px-4 py-2 rounded-xl border border-border shadow-inner">
                                        <span className="opacity-50">MIME:</span> <span className="text-indigo-500">{result.contentType || "Binary/Unknown"}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Security Headers */}
                                    <div className="rounded-[2rem] border border-border bg-surface-1 overflow-hidden h-fit shadow-2xl">
                                        <div className="border-b border-border bg-surface-2 px-8 py-5 flex justify-between items-center bg-gradient-to-r from-surface-2 to-surface-1">
                                            <h3 className="font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 text-foreground-subtle">
                                                <MdSecurity className="size-5 text-indigo-500" />
                                                Security Protocol
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-border">
                                            {result.securityHeaders?.map((sh, i) => (
                                                <div key={i} className="p-6 hover:bg-surface-2/30 transition-all group">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        {sh.present ? (
                                                            <MdCheckCircle className="size-5 text-emerald-500" />
                                                        ) : (
                                                            <BiErrorCircle className="size-5 text-amber-500 animate-pulse" />
                                                        )}
                                                        <strong className="font-mono text-xs font-black uppercase tracking-tighter text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{sh.name}</strong>
                                                        {!sh.present && <span className="px-2 py-0.5 rounded text-[8px] font-black bg-error text-white ml-auto uppercase tracking-widest shadow-lg shadow-error/20">Missing</span>}
                                                    </div>
                                                    <p className="text-[11px] text-foreground-muted mb-3 leading-relaxed font-medium pl-8">{sh.description}</p>
                                                    {sh.present && (
                                                        <div className="bg-surface-2 p-4 rounded-xl text-[10px] font-mono break-all text-indigo-600 dark:text-indigo-400 border border-border mt-2 shadow-inner group-hover:border-indigo-500/30 transition-colors">
                                                            {sh.value}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* All Headers Table */}
                                    <div className="rounded-[2rem] border border-border bg-surface-1 overflow-hidden h-fit shadow-2xl">
                                        <div className="border-b border-border bg-surface-2 px-8 py-5 flex justify-between items-center bg-gradient-to-r from-surface-2 to-surface-1">
                                            <h3 className="font-black uppercase text-xs tracking-[0.2em] text-foreground-subtle">
                                                Packet Manifest
                                            </h3>
                                            <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black shadow-lg shadow-indigo-500/20">{result.headers?.length} Lines</span>
                                        </div>
                                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                                            <table className="w-full text-left">
                                                <thead className="bg-surface-2 text-foreground-muted sticky top-0 shadow-sm border-b border-border">
                                                    <tr>
                                                        <th className="px-8 py-4 font-black uppercase tracking-widest text-[10px] w-1/3">Key</th>
                                                        <th className="px-8 py-4 font-black uppercase tracking-widest text-[10px] w-2/3">Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {result.headers?.map((header, i) => (
                                                        <tr key={i} className="hover:bg-indigo-500/5 transition-colors group">
                                                            <td className="px-8 py-4 font-mono text-[10px] font-black text-foreground align-top group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{header.name}</td>
                                                            <td className="px-8 py-4 font-mono text-[10px] break-all text-indigo-600 dark:text-indigo-400 align-top leading-relaxed">{header.value}</td>
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
        </div>
    );
}
