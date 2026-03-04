"use client";

import { useState } from "react";
import { Search, AlertTriangle, CheckCircle, Link as LinkIcon, ExternalLink } from "lucide-react";

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
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-8 border-b border-[var(--border)] pb-8">
                <h1 className="text-3xl font-bold mb-2">Broken Link Checker</h1>
                <p className="text-[var(--text-muted)]">
                    Scan for dead links and 404 errors on any webpage. Keep your site healthy by fixing broken outgoing and internal links.
                    <span className="block mt-1 text-xs text-yellow-500 font-medium">*Free tier scans the first 50 links found on the page.</span>
                </p>

                <form onSubmit={analyzeLinks} className="mt-6 flex flex-col sm:flex-row gap-4">
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
                                <Search className="size-4 animate-spin" /> Scanning...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Search className="size-4" /> Scan Links
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
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-[var(--text-muted)] text-sm mb-1">URLs Checked</div>
                                        <div className="text-3xl font-bold">{result.summary?.totalChecked}</div>
                                    </div>
                                    <LinkIcon className="size-10 text-[var(--border)] opacity-50" />
                                </div>
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-[var(--text-muted)] text-sm mb-1">Valid Links</div>
                                        <div className="text-3xl font-bold text-green-500">{result.summary?.okCount}</div>
                                    </div>
                                    <CheckCircle className="size-10 text-green-500 opacity-20" />
                                </div>
                                <div className="rounded-xl border border-[var(--border)] bg-red-500/5 border-red-500/20 p-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-[var(--text-muted)] text-sm mb-1">Broken Links</div>
                                        <div className="text-3xl font-bold text-red-500">{result.summary?.brokenCount}</div>
                                    </div>
                                    <AlertTriangle className="size-10 text-red-500 opacity-20" />
                                </div>
                            </div>

                            {/* Links Table */}
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                                <div className="border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 flex justify-between items-center">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <LinkIcon className="size-4 text-[var(--primary)]" />
                                        Found Links
                                    </h3>
                                    <span className="text-xs px-2 py-1 bg-[var(--surface-3)] text-[var(--text-muted)] rounded border border-[var(--border)]">
                                        Showing up to 50 links
                                    </span>
                                </div>
                                <div className="overflow-x-auto max-h-[800px] overflow-y-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] sticky top-0 z-10 shadow-sm border-b border-[var(--border)]">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Status / HTTP</th>
                                                <th className="px-4 py-3 font-medium">URL & Anchor Text</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border)]">
                                            {result.links && result.links.length > 0 ? (
                                                result.links.map((link, i) => (
                                                    <tr key={i} className={`hover:bg-[var(--surface-2)]/50 ${link.status === 'broken' ? 'bg-red-500/5' : ''}`}>
                                                        <td className="px-4 py-4 w-[140px] align-top">
                                                            <div className="flex flex-col gap-1">
                                                                {link.status === "ok" && (
                                                                    <span className="badge bg-green-500/20 text-green-500 w-fit">HTTP {link.statusCode}</span>
                                                                )}
                                                                {link.status === "broken" && (
                                                                    <span className="badge bg-red-500/20 text-red-500 w-fit">
                                                                        {link.statusCode ? `HTTP ${link.statusCode}` : 'Error/Timeout'}
                                                                    </span>
                                                                )}
                                                                {link.status === "warning" && (
                                                                    <span className="badge bg-yellow-500/20 text-yellow-500 w-fit">HTTP {link.statusCode}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 min-w-[300px] align-top relative">
                                                            <div className="flex items-start gap-2 max-w-[800px]">
                                                                {link.status === "broken" && <AlertTriangle className="size-4 text-red-500 shrink-0 mt-0.5" />}
                                                                <div className="min-w-0">
                                                                    <a
                                                                        href={link.href}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={`font-mono text-xs break-all hover:underline flex gap-1 ${link.status === 'broken' ? 'text-red-400 font-semibold' : 'text-[var(--primary)]'}`}
                                                                    >
                                                                        {link.href}
                                                                        <ExternalLink className="size-3 shrink-0 opacity-50 relative top-0.5" />
                                                                    </a>
                                                                    {link.text && (
                                                                        <p className="mt-2 text-sm text-[var(--text-muted)] italic max-w-lg truncate border-l-2 border-[var(--border)] pl-2">
                                                                            "{link.text}"
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={2} className="px-4 py-8 text-center text-[var(--text-muted)]">
                                                        No valid HTTP links found on this page.
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
