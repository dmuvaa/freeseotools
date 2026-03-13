"use client";

import { useState } from "react";
import { MdSearch, MdCheckCircle, MdDns, MdSecurity, MdContentCopy } from "react-icons/md";
import { BiErrorCircle, BiCheckDouble } from "react-icons/bi";
import Card from "@/components/ui/Card";

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

        let targetUrl = url;
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
        }
        setUrl(targetUrl);

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/tools/http-headers", {
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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Simple visual feedback could be added here if needed, but for now we rely on the button state or simplicity
    };

    const securityScore = result?.securityHeaders?.filter(sh => sh.present).length || 0;
    const totalSecurityHeaders = result?.securityHeaders?.length || 0;

    return (
        <div className="w-full">
            <div className="container mx-auto max-w-7xl">
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
                                        <h3 className="font-mono text-sm font-bold truncate max-w-md text-foreground-subtle group-hover:text-foreground transition-colors" title={result.url}>{result.url}</h3>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className={`inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-black tracking-widest border uppercase ${result.status === 200 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                result.status?.toString().startsWith('3') ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                }`}>
                                                HTTP {result.status} {result.statusText}
                                            </span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground-muted flex items-center gap-2 bg-surface-2 px-3 py-1 rounded-full border border-border">
                                                    <MdDns className="size-4 text-foreground/50" /> {result.server}
                                                </span>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground-muted bg-surface-2 px-4 py-2 rounded-xl border border-border shadow-inner">
                                        <span className="opacity-50">MIME:</span> <span className="text-foreground">{result.contentType || "Binary/Unknown"}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    {/* Security Headers Summary */}
                                    <div className="lg:col-span-4 space-y-6">
                                        <Card className="p-8 border-border bg-surface-1 shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <MdSecurity className="size-24" />
                                            </div>
                                            <h3 className="font-black uppercase text-[10px] tracking-[0.2em] text-foreground-muted mb-6 flex items-center gap-2">
                                                <MdSecurity className="size-4 text-indigo-500" /> Security Posture
                                            </h3>
                                            
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="text-6xl font-black tabular-nums tracking-tighter text-foreground">{securityScore}</span>
                                                <span className="text-xl font-bold text-foreground-muted">/ {totalSecurityHeaders}</span>
                                            </div>
                                            <p className="text-xs font-bold text-foreground-muted uppercase tracking-widest mb-8">Headers Present</p>

                                            <div className="space-y-3">
                                                {result.securityHeaders?.map((sh, i) => (
                                                    <div key={i} className="flex items-center justify-between group/item">
                                                        <span className={`text-xs font-bold uppercase tracking-tight transition-colors ${sh.present ? 'text-foreground' : 'text-foreground-muted opacity-50'}`}>
                                                            {sh.name}
                                                        </span>
                                                        {sh.present ? (
                                                            <BiCheckDouble className="size-5 text-emerald-500" />
                                                        ) : (
                                                            <div className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>

                                            {result.securityHeaders?.filter(sh => !sh.present).map((sh, i) => (
                                                <div key={i} className="p-5 rounded-2xl border border-rose-500/10 bg-rose-500/[0.02] flex gap-4">
                                                    <BiErrorCircle className="size-5 text-rose-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <h4 className="text-xs font-black uppercase text-rose-600 tracking-widest mb-1">{sh.name} Missing</h4>
                                                        <p className="text-xs text-foreground-muted leading-relaxed font-medium">{sh.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>

                                    {/* All Headers Manifest */}
                                    <div className="lg:col-span-8">
                                        <div className="rounded-[2rem] border border-border bg-surface-1 overflow-hidden shadow-2xl">
                                            <div className="border-b border-border bg-surface-2 px-8 py-6 flex justify-between items-center bg-gradient-to-r from-surface-2 to-surface-1">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                                        <MdDns className="size-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black uppercase text-xs tracking-[0.2em] text-foreground">
                                                            Packet Manifest
                                                        </h3>
                                                        <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest mt-0.5">Response Headers</p>
                                                    </div>
                                                </div>
                                                <span className="px-4 py-1.5 rounded-full bg-surface-2 text-foreground-muted text-[10px] font-black border border-border shadow-inner">
                                                    {result.headers?.length} ATTRIBUTES
                                                </span>
                                            </div>
                                            <div className="overflow-x-auto max-h-[800px] overflow-y-auto custom-scrollbar">
                                                <table className="w-full text-left border-collapse">
                                                    <thead className="bg-surface-2/50 text-foreground-muted sticky top-0 backdrop-blur-md z-10 border-b border-border">
                                                        <tr>
                                                            <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px] w-1/3">Field Name</th>
                                                            <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px] w-2/3">Data Content</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border">
                                                        {result.headers?.map((header, i) => (
                                                            <tr key={i} className="hover:bg-indigo-500/[0.02] transition-colors group">
                                                                <td className="px-8 py-6 align-top">
                                                                    <div className="font-mono text-xs font-black text-foreground-subtle tracking-tight group-hover:text-foreground transition-colors">
                                                                        {header.name}
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-6 align-top">
                                                                    <div className="flex flex-col gap-2">
                                                                        <div className="font-mono text-sm break-all text-foreground leading-relaxed font-medium">
                                                                            {header.value}
                                                                        </div>
                                                                        <button 
                                                                            onClick={() => copyToClipboard(header.value)}
                                                                            className="w-fit flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-foreground-muted hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                                        >
                                                                            <MdContentCopy className="size-3" /> Copy Value
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
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
