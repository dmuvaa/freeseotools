"use client";

import { useState } from "react";
import { MdSearch, MdCheckCircle, MdLink, MdLinkOff, MdFormatListBulleted, MdTimer } from "react-icons/md";
import { BiErrorCircle } from "react-icons/bi";

interface SitemapUrl {
    loc: string;
    lastmod?: string;
    changefreq?: string;
    priority?: string;
    status?: number;
    responseTime?: number;
}

interface SitemapResponse {
    url: string;
    success: boolean;
    error?: string;
    summary?: {
        total: number;
        valid: number;
        broken: number;
    };
    urls?: SitemapUrl[];
}

export default function SitemapAnalyzer() {
    const [sitemapUrl, setSitemapUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SitemapResponse | null>(null);

    const analyzeSitemap = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sitemapUrl) return;
        let tSitemapUrl = sitemapUrl;
        if (!/^https?:\/\//i.test(tSitemapUrl)) {
            tSitemapUrl = 'https://' + tSitemapUrl;
        }
        setSitemapUrl(tSitemapUrl);
        if (!sitemapUrl) return;

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/tools/sitemap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: tSitemapUrl }),
            });
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setResult({ url: sitemapUrl, success: false, error: "Failed to connect to the server." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="container mx-auto max-w-5xl">
                <form onSubmit={analyzeSitemap} className="mt-2 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={sitemapUrl}
                        onChange={(e) => setSitemapUrl(e.target.value)}
                        placeholder="https://example.com/sitemap.xml"
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
                                <MdSearch className="size-5 animate-spin" /> Analyzing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <MdSearch className="size-5" /> Analyze Sitemap
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
                                            <MdFormatListBulleted className="size-4 text-primary" /> Total URLs
                                        </div>
                                        <div className="text-4xl font-bold">{result.summary?.total || 0}</div>
                                    </div>
                                    <div className="rounded-xl border border-border bg-surface-1 p-6 shadow-sm flex flex-col items-center justify-center text-center">
                                        <div className="text-success text-xs uppercase font-bold tracking-tight mb-2 flex items-center gap-2">
                                            <MdCheckCircle className="size-4" /> Valid URLs
                                        </div>
                                        <div className="text-4xl font-bold text-success">{result.summary?.valid || 0}</div>
                                    </div>
                                    <div className="rounded-xl border border-border bg-surface-1 p-6 shadow-sm flex flex-col items-center justify-center text-center">
                                        <div className="text-error text-xs uppercase font-bold tracking-tight mb-2 flex items-center gap-2">
                                            <MdLinkOff className="size-4" /> Broken
                                        </div>
                                        <div className="text-4xl font-bold text-error">{result.summary?.broken || 0}</div>
                                    </div>
                                </div>

                                {/* URL Table */}
                                <div className="rounded-xl border border-border bg-surface-1 overflow-hidden shadow-sm">
                                    <div className="bg-surface-2 px-6 py-4 border-b border-border font-bold flex items-center gap-2 text-foreground-subtle">
                                        <MdLink className="size-5 text-primary" /> URL Analysis Details
                                        <span className="ml-auto text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-wider">Top {result.urls?.length || 0} Results</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-surface-2 text-foreground-muted border-b border-border">
                                                <tr>
                                                    <th className="px-6 py-4 font-semibold uppercase tracking-tight text-xs">Page URL</th>
                                                    <th className="px-6 py-4 font-semibold uppercase tracking-tight text-xs text-center">Status</th>
                                                    <th className="px-6 py-4 font-semibold uppercase tracking-tight text-xs text-right">Response</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {result.urls && result.urls.length > 0 ? (
                                                    result.urls.map((u, i) => (
                                                        <tr key={i} className="hover:bg-primary/5 transition-colors group">
                                                            <td className="px-6 py-4 font-mono text-xs break-all text-blue-600 dark:text-blue-400 leading-relaxed max-w-md">
                                                                <a href={u.loc} target="_blank" rel="noopener noreferrer" className="hover:underline">{u.loc}</a>
                                                            </td>
                                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                                <span className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[10px] font-bold border ${u.status === 200 ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20'}`}>
                                                                    {u.status === 200 ? <MdCheckCircle className="size-3" /> : <MdLinkOff className="size-3" />}
                                                                    {u.status || 'N/A'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 font-mono text-[10px] text-foreground-muted whitespace-nowrap text-right">
                                                                <span className="flex items-center justify-end gap-1">
                                                                    <MdTimer className="size-3 opacity-50" />
                                                                    {u.responseTime || 0}ms
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={3} className="px-6 py-12 text-center text-foreground-muted italic">
                                                            No URLs analyzed in this sitemap.
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
