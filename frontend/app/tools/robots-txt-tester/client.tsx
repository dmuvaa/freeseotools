"use client";

import { useState } from "react";
import { Search, AlertTriangle, CheckCircle, FileCode, Info } from "lucide-react";

interface Rule {
    userAgent: string;
    type: "allow" | "disallow";
    path: string;
}

interface RobotsTxtResponse {
    url: string;
    success: boolean;
    error?: string;
    content?: string;
    sitemaps?: string[];
    rules?: Rule[];
    status?: number;
}

export default function RobotsTxtTester() {
    const [domain, setDomain] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<RobotsTxtResponse | null>(null);

    const analyzeRobotsTxt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!domain) return;

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/tools/robots-txt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain }),
            });
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setResult({ url: domain, success: false, error: "Failed to connect to the server." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-8 border-b border-[var(--border)] pb-8">
                <h1 className="text-3xl font-bold mb-2">Robots.txt Tester</h1>
                <p className="text-[var(--text-muted)]">
                    Check if your robots.txt file is accessible, valid, and properly configuring crawler access for search engines.
                </p>

                <form onSubmit={analyzeRobotsTxt} className="mt-6 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="example.com"
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
                                <Search className="size-4 animate-spin" /> Fetching...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Search className="size-4" /> Test Robots.txt
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
                                {result.status === 404 && (
                                    <p className="mt-2 text-sm">We could not find a robots.txt file at the root of this domain.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                                    <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <FileCode className="size-4 text-[var(--primary)]" />
                                            Robots.txt Content
                                        </h3>
                                        <span className="text-xs text-[var(--text-muted)]">Parsed rules: {result.rules?.length || 0}</span>
                                    </div>
                                    <div className="p-4 bg-[var(--surface-1)]">
                                        <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto p-4 rounded bg-[#0d1117] border border-[#30363d] shadow-inner text-[#e6edf3]">
                                            {result.content ? (
                                                result.content.split('\n').map((line, i) => {
                                                    const isComment = line.trim().startsWith('#');
                                                    const isAllow = line.toLowerCase().startsWith('allow:');
                                                    const isDisallow = line.toLowerCase().startsWith('disallow:');
                                                    const isSitemap = line.toLowerCase().startsWith('sitemap:');
                                                    const isUserAgent = line.toLowerCase().startsWith('user-agent:');

                                                    let colorClass = "text-[#e6edf3]";
                                                    if (isComment) colorClass = "text-[#8b949e]";
                                                    else if (isAllow) colorClass = "text-[#7ee787]";
                                                    else if (isDisallow) colorClass = "text-[#ff7b72]";
                                                    else if (isSitemap) colorClass = "text-[#79c0ff]";
                                                    else if (isUserAgent) colorClass = "text-[#d2a8ff] font-bold";

                                                    return (
                                                        <div key={i} className={colorClass}>
                                                            {line}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-gray-500 italic">Empty file</span>
                                            )}
                                        </pre>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                                    <div className="border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                                        <h3 className="font-semibold">Parsed Rules</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-[var(--surface-2)] text-[var(--text-muted)]">
                                                <tr>
                                                    <th className="px-4 py-2 font-medium">User Agent</th>
                                                    <th className="px-4 py-2 font-medium">Directive</th>
                                                    <th className="px-4 py-2 font-medium">Path</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--border)]">
                                                {result.rules && result.rules.length > 0 ? (
                                                    result.rules.map((rule, i) => (
                                                        <tr key={i} className="hover:bg-[var(--surface-2)]/50">
                                                            <td className="px-4 py-2 font-mono text-xs font-semibold">{rule.userAgent}</td>
                                                            <td className="px-4 py-2">
                                                                <span className={`inline-flex items-center gap-1 rounded bg-opacity-10 px-2 py-0.5 text-xs font-medium ${rule.type === 'allow' ? 'bg-green-500 text-green-500' : 'bg-red-500 text-red-500'
                                                                    }`}>
                                                                    {rule.type === 'allow' ? <CheckCircle className="size-3" /> : <AlertTriangle className="size-3" />}
                                                                    {rule.type.toUpperCase()}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2 font-mono text-xs">{rule.path}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={3} className="px-4 py-4 text-center text-[var(--text-muted)]">
                                                            No explicit allow/disallow rules found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
                                    <h3 className="font-semibold mb-4 border-b border-[var(--border)] pb-2">Status</h3>
                                    <div className="flex items-center gap-3 mb-2">
                                        <CheckCircle className="size-5 text-green-500" />
                                        <div>
                                            <p className="font-medium text-sm">File exists</p>
                                            <p className="text-xs text-[var(--text-muted)]">HTTP {result.status}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
                                    <h3 className="font-semibold mb-4 border-b border-[var(--border)] pb-2 flex items-center justify-between">
                                        Sitemaps
                                        <span className="badge badge-info">{result.sitemaps?.length || 0}</span>
                                    </h3>
                                    {result.sitemaps && result.sitemaps.length > 0 ? (
                                        <ul className="space-y-2 text-sm">
                                            {result.sitemaps.map((sitemap, i) => (
                                                <li key={i} className="flex gap-2 items-start break-all p-2 bg-[var(--surface-2)] rounded">
                                                    <Info className="size-4 shrink-0 text-blue-400 mt-0.5" />
                                                    <a href={sitemap} target="_blank" rel="noopener noreferrer" className="hover:underline text-[var(--primary)]">
                                                        {sitemap}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-[var(--text-muted)] italic">No sitemaps declared in robots.txt.</p>
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
