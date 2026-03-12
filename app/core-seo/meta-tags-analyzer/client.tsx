"use client";

import { useState } from "react";
import { MdSearch, MdCheckCircle, MdInfo, MdDownload, MdErrorOutline } from "react-icons/md";
import { BiErrorCircle } from "react-icons/bi";

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
        <div className="w-full">
            <div className="container mx-auto max-w-5xl">
                <form onSubmit={analyzeUrl} className="mt-2 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        required
                        className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-md bg-emerald-600 dark:bg-emerald-500 px-6 py-3 font-medium text-white transition-colors hover:brightness-110 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Analyzing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 font-bold">
                                <MdSearch className="size-5" /> Analyze Tags
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
                                    <h3 className="font-semibold text-error">Analysis Failed</h3>
                                    <p className="text-sm opacity-90">{result.error}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row justify-between items-center bg-[var(--surface-1)] p-6 rounded-xl border border-[var(--border)] shadow-sm gap-4">
                                    <div className="text-center md:text-left">
                                        <h3 className="font-bold text-lg truncate max-w-md" title={result.url}>{new URL(result.url).hostname}</h3>
                                        <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider mt-1">Metatags Scan Complete</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <input
                                                type="email"
                                                placeholder="Email for CSV export"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="text-sm rounded border border-border bg-surface-2 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary shadow-inner w-full sm:w-48"
                                            />
                                            <button
                                                onClick={handleExport}
                                                disabled={!email.includes('@')}
                                                className="inline-flex items-center gap-2 text-sm bg-emerald-600 dark:bg-emerald-500 text-white hover:brightness-110 disabled:opacity-50 px-4 py-2 rounded transition shadow-sm font-bold shrink-0"
                                            >
                                                <MdDownload className="size-4" /> Export
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-1)] shadow-sm">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] border-b border-border">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-tight text-xs w-1/4">Tag Element</th>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-tight text-xs w-1/2">Content / Value</th>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-tight text-xs w-1/4">Status Message</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border)]">
                                            {result.tags.map((tag, i) => (
                                                <tr key={i} className="hover:bg-[var(--surface-3)]/50 transition-colors">
                                                    <td className="px-6 py-5 font-bold align-top">
                                                        <div className="flex items-center gap-2">
                                                            {tag.status === 'ok' && <MdCheckCircle className="size-4 text-success shrink-0" />}
                                                            {tag.status === 'warn' && <MdInfo className="size-4 text-warning shrink-0" />}
                                                            {tag.status === 'error' && <MdErrorOutline className="size-4 text-error shrink-0" />}
                                                            <span className="truncate border-b border-dashed border-border group relative cursor-help">
                                                                {tag.tagName}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 align-top">
                                                        {tag.value ? (
                                                            <div className="max-w-full break-words rounded-lg bg-surface-2 p-3 font-mono text-xs text-foreground leading-relaxed border border-border/50">
                                                                {tag.value}
                                                            </div>
                                                        ) : (
                                                            <span className="text-foreground-muted italic text-xs">No value detected</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5 align-top">
                                                        <p className={`text-xs leading-relaxed ${tag.status === 'error' ? 'text-error font-semibold' :
                                                            tag.status === 'warn' ? 'text-warning font-semibold' :
                                                                'text-success font-semibold'
                                                            }`}>
                                                            {tag.message}
                                                        </p>
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
        </div>
    );
}
