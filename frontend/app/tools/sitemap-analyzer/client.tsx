"use client";

import { useState } from "react";
import { Search, AlertTriangle, CheckCircle, FileText, Info, ExternalLink } from "lucide-react";

interface SitemapUrl {
    loc: string;
    lastmod?: string;
    changefreq?: string;
    priority?: string;
    status?: number;
}

interface SitemapResponse {
    url: string;
    success: boolean;
    error?: string;
    summary?: {
        totalUrls: number;
        checkedUrls: number;
        validUrls: number;
        brokenUrls: number;
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

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/tools/sitemap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: sitemapUrl }),
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
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-8 border-b border-[var(--border)] pb-8">
                <h1 className="text-3xl font-bold mb-2">Sitemap Analyzer</h1>
                <p className="text-[var(--text-muted)]">
                    Analyze XML sitemaps for SEO errors. See total URLs, check for broken links, and verify last modified dates. Note: We check a sample of up to 50 URLs for status codes.
                </p>

                <form onSubmit={analyzeSitemap} className="mt-6 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={sitemapUrl}
                        onChange={(e) => setSitemapUrl(e.target.value)}
                        placeholder="https://example.com/sitemap.xml"
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
                                <Search className="size-4 animate-spin" /> Analyzing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Search className="size-4" /> Analyze Sitemap
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-center">
                                    <div className="text-[var(--text-muted)] text-sm mb-1">Total URLs Found</div>
                                    <div className="text-3xl font-bold">{result.summary?.totalUrls}</div>
                                </div>
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-center">
                                    <div className="text-[var(--text-muted)] text-sm mb-1">URLs Checked</div>
                                    <div className="text-3xl font-bold text-blue-400">{result.summary?.checkedUrls}</div>
                                </div>
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-center">
                                    <div className="text-[var(--text-muted)] text-sm mb-1">Valid (200 OK)</div>
                                    <div className="text-3xl font-bold text-green-400">{result.summary?.validUrls}</div>
                                </div>
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-center">
                                    <div className="text-[var(--text-muted)] text-sm mb-1">Broken / Error</div>
                                    <div className="text-3xl font-bold text-red-400">{result.summary?.brokenUrls}</div>
                                </div>
                            </div>

                            {/* URLs Table */}
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                                <div className="border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 flex justify-between items-center">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <FileText className="size-4 text-[var(--primary)]" />
                                        Sitemap Entries
                                    </h3>
                                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Displaying top {result.urls?.length} URLs</span>
                                </div>
                                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">URL</th>
                                                <th className="px-4 py-3 font-medium">HTTP Status</th>
                                                <th className="px-4 py-3 font-medium">Last Modified</th>
                                                <th className="px-4 py-3 font-medium">Priority</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border)]">
                                            {result.urls && result.urls.length > 0 ? (
                                                result.urls.map((url, i) => (
                                                    <tr key={i} className="hover:bg-[var(--surface-2)]/50">
                                                        <td className="px-4 py-3 max-w-[400px]">
                                                            <a href={url.loc} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline text-[var(--primary)] truncate font-mono text-xs">
                                                                {url.loc}
                                                                <ExternalLink className="size-3 shrink-0" />
                                                            </a>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {url.status ? (
                                                                <span className={`inline-flex items-center gap-1 rounded bg-opacity-10 px-2 py-0.5 text-xs font-medium ${url.status === 200 ? 'bg-green-500 text-green-500' :
                                                                        url.status.toString().startsWith('3') ? 'bg-yellow-500 text-yellow-500' :
                                                                            'bg-red-500 text-red-500'
                                                                    }`}>
                                                                    {url.status}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-500 text-xs italic">Not checked</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                                                            {url.lastmod ? new Date(url.lastmod).toLocaleDateString() : '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                                                            {url.priority || '-'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-8 text-center text-[var(--text-muted)]">
                                                        No URLs found in this sitemap. Ensure it's not an index sitemap containing other sitemaps.
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
    );
}
