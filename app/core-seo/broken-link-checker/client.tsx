"use client";

import { useState } from "react";
import { MdSearch, MdErrorOutline, MdCheckCircle, MdLink, MdOpenInNew } from "react-icons/md";
import { BiErrorCircle } from "react-icons/bi";

interface LinkData {
    href: string;
    text: string;
    status: "checking" | "ok" | "broken" | "warning";
    statusCode?: number;
}

interface BrokenLinkResponse {
    url: string;
    success: boolean;
    error?: string;
    summary?: {
        totalChecked: number;
        brokenCount: number;
        okCount: number;
    };
    links?: LinkData[];
}

export default function BrokenLinkChecker() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<BrokenLinkResponse | null>(null);

    const analyzeLinks = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/tools/broken-links", {
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
                <form onSubmit={analyzeLinks} className="mt-2 flex flex-col sm:flex-row gap-4 mb-8">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Scan from URL (e.g., https://example.com)"
                        required
                        className="flex-1 rounded-md border border-border bg-surface-1 px-4 py-3 placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-md bg-rose-600 px-6 py-3 font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <MdSearch className="size-5 animate-spin" /> Crawling...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <MdSearch className="size-5" /> Start Scan
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
                                    <h3 className="font-black uppercase tracking-tight text-lg mb-1">Crawl Interrupted</h3>
                                    <p className="text-sm opacity-90 leading-relaxed font-medium">{result.error}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Summary Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="rounded-2xl border border-border bg-surface-1 p-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
                                        <div className="relative z-10">
                                            <div className="text-foreground-muted text-[10px] mb-2 uppercase tracking-widest font-black">Total Crawled</div>
                                            <div className="text-4xl font-black tracking-tighter">{result.summary?.totalChecked}</div>
                                        </div>
                                        <MdLink className="size-16 text-border opacity-10 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="rounded-2xl border border-success/20 bg-success/5 p-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
                                        <div className="relative z-10">
                                            <div className="text-success text-[10px] mb-2 uppercase tracking-widest font-black">Healthy (200 OK)</div>
                                            <div className="text-4xl font-black tracking-tighter text-success">{result.summary?.okCount}</div>
                                        </div>
                                        <MdCheckCircle className="size-16 text-success opacity-10 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 flex items-center justify-between shadow-lg relative overflow-hidden group ring-2 ring-rose-500/10">
                                        <div className="relative z-10">
                                            <div className="text-rose-500 text-[10px] mb-2 uppercase tracking-widest font-black">Dead Ends Found</div>
                                            <div className="text-4xl font-black tracking-tighter text-rose-500">{result.summary?.brokenCount}</div>
                                        </div>
                                        <MdErrorOutline className="size-16 text-rose-500 opacity-10 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" />
                                    </div>
                                </div>

                                {/* Links Table */}
                                <div className="rounded-[2rem] border border-border bg-surface-1 overflow-hidden shadow-2xl">
                                    <div className="border-b border-border bg-surface-2 px-8 py-5 flex justify-between items-center bg-gradient-to-r from-surface-2 to-surface-1">
                                        <h3 className="font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 text-foreground-subtle">
                                            <div className="size-2 rounded-full bg-rose-500 animate-pulse" />
                                            Live Discovery Feed
                                        </h3>
                                        <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-rose-600 text-white rounded-full shadow-lg shadow-rose-500/30">
                                            Found {result.links?.length} Nodes
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto max-h-[800px] overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-left">
                                            <thead className="bg-surface-2 text-foreground-muted sticky top-0 z-10 shadow-sm border-b border-border">
                                                <tr>
                                                    <th className="px-8 py-4 font-black uppercase tracking-widest text-[10px] w-[180px]">Status Protocol</th>
                                                    <th className="px-8 py-4 font-black uppercase tracking-widest text-[10px]">Resource Destination</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {result.links && result.links.length > 0 ? (
                                                    result.links.map((link, i) => (
                                                        <tr key={i} className={`hover:bg-surface-2/50 transition-colors group ${link.status === 'broken' ? 'bg-rose-500/5' : ''}`}>
                                                            <td className="px-8 py-6 align-top">
                                                                <div className="flex flex-col gap-2">
                                                                    {link.status === "ok" && (
                                                                        <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black border border-emerald-500/20 w-fit uppercase tracking-tighter">
                                                                            {link.statusCode || 200} OK
                                                                        </span>
                                                                    )}
                                                                    {link.status === "broken" && (
                                                                        <span className="px-3 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-black shadow-lg shadow-rose-500/20 w-fit uppercase tracking-tighter">
                                                                            {link.statusCode || "Dead"}
                                                                        </span>
                                                                    )}
                                                                    {link.status === "warning" && (
                                                                        <span className="px-3 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-black shadow-lg shadow-amber-500/20 w-fit uppercase tracking-tighter">
                                                                            {link.statusCode} Redirect
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6 align-top">
                                                                <div className="flex flex-col gap-3 group-hover:translate-x-1 transition-transform">
                                                                    <a
                                                                        href={link.href}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={`font-mono text-xs break-all hover:underline flex items-center gap-2 leading-relaxed ${link.status === 'broken' ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-blue-600 dark:text-blue-400 font-bold'}`}
                                                                    >
                                                                        {link.href}
                                                                        <MdOpenInNew className="size-3 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                                                                    </a>
                                                                    {link.text && (
                                                                        <div className="relative pl-4 border-l-2 border-border group-hover:border-rose-500/30 transition-colors">
                                                                            <p className="text-xs text-foreground-muted font-bold tracking-tight italic opacity-70 group-hover:opacity-100">
                                                                                &ldquo;{link.text}&rdquo;
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={2} className="px-8 py-16 text-center">
                                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                                <MdLink className="size-16" />
                                                                <p className="uppercase font-black text-xs tracking-widest italic">No traversable paths found in source</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
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
