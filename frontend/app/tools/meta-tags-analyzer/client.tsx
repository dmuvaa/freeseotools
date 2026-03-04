"use client";

import { useState } from "react";
import { Search, AlertTriangle, CheckCircle, Info, Download } from "lucide-react";

interface TagData {
    tagName: string;
    value: string;
    status: "ok" | "warn" | "error";
    message: string;
}

interface MetaTagsResponse {
    url: string;
    success: boolean;
    error?: string;
    tags: TagData[];
}

export default function MetaTagsAnalyzer() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<MetaTagsResponse | null>(null);
    const [email, setEmail] = useState("");

    const analyzeUrl = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/tools/meta-tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setResult({ url, success: false, error: "Failed to connect to the server.", tags: [] });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!result || !result.tags.length) return;
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Tag Name,Value,Status,Message\n"
            + result.tags.map(t => `"${t.tagName}","${t.value?.replace(/"/g, '""')}","${t.status}","${t.message}"`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `meta_tags_${new URL(result.url).hostname}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-8 border-b border-[var(--border)] pb-8">
                <h1 className="text-3xl font-bold mb-2">Meta Tags Analyzer</h1>
                <p className="text-[var(--text-muted)]">
                    Check on-page meta tags for SEO compliance. We analyze titles, descriptions, canonical URLs, OpenGraph, and Twitter Cards to ensure your page displays optimally on SERPs and social media.
                </p>

                <form onSubmit={analyzeUrl} className="mt-6 flex flex-col sm:flex-row gap-4">
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
                                <Search className="size-4 animate-spin" /> Analyzing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Search className="size-4" /> Analyze Meta Tags
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
                            <div className="flex justify-between items-center bg-[var(--surface-1)] p-4 rounded-xl border border-[var(--border)]">
                                <div>
                                    <h3 className="font-semibold truncate max-w-md" title={result.url}>{new URL(result.url).hostname}</h3>
                                    <p className="text-sm text-[var(--text-muted)]">Analyzed successfully</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Lead capture for export */}
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            placeholder="Enter email to export CSV"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="text-sm rounded border border-[var(--border)] bg-[var(--surface-2)] px-2"
                                        />
                                        <button
                                            onClick={handleExport}
                                            disabled={!email.includes('@')}
                                            className="inline-flex items-center gap-2 text-sm bg-[var(--surface-2)] hover:bg-[var(--surface-3)] disabled:opacity-50 px-3 py-1.5 rounded transition"
                                        >
                                            <Download className="size-4" /> Export CSV
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-1)]">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[var(--surface-2)] text-[var(--text-muted)]">
                                        <tr>
                                            <th className="px-4 py-3 font-medium w-1/4">Tag Element</th>
                                            <th className="px-4 py-3 font-medium w-1/2">Content / Value</th>
                                            <th className="px-4 py-3 font-medium w-1/4">Status Message</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {result.tags.map((tag, i) => (
                                            <tr key={i} className="hover:bg-[var(--surface-2)]/50">
                                                <td className="px-4 py-4 font-medium align-top">
                                                    <div className="flex items-center gap-2">
                                                        {tag.status === 'ok' && <CheckCircle className="size-4 text-green-500 shrink-0" />}
                                                        {tag.status === 'warn' && <Info className="size-4 text-yellow-500 shrink-0" />}
                                                        {tag.status === 'error' && <AlertTriangle className="size-4 text-red-500 shrink-0" />}
                                                        <span className="truncate">{tag.tagName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    {tag.value ? (
                                                        <div className="max-w-[400px] break-words rounded bg-[var(--surface-3)] px-2 py-1 font-mono text-xs">
                                                            {tag.value}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500 italic">Not found</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <span className={`${tag.status === 'error' ? 'text-red-400' :
                                                            tag.status === 'warn' ? 'text-yellow-400' :
                                                                'text-green-400'
                                                        }`}>
                                                        {tag.message}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
