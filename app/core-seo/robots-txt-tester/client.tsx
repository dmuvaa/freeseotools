"use client";

import { useState } from "react";
import { MdSearch, MdCheckCircle, MdFilePresent, MdInfo, MdErrorOutline } from "react-icons/md";
import { BiErrorCircle } from "react-icons/bi";

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
        <div className="w-full">
            <div className="container mx-auto max-w-5xl">
                <form onSubmit={analyzeRobotsTxt} className="mt-2 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="example.com"
                        required
                        className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-white transition-colors hover:brightness-110 disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <MdSearch className="size-5 animate-spin" /> Fetching...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <MdSearch className="size-5" /> Test Robots.txt
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
                                    <p className="text-sm">{result.error}</p>
                                    {result.status === 404 && (
                                        <p className="mt-2 text-sm text-[var(--text-muted)]">We could not find a robots.txt file at the root of this domain.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden shadow-sm">
                                        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)] px-6 py-4">
                                            <h3 className="font-bold flex items-center gap-2 text-foreground-subtle">
                                                <MdFilePresent className="size-5 text-primary" />
                                                Robots.txt Source
                                            </h3>
                                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-wider">HTTP {result.status}</span>
                                        </div>
                                        <div className="p-0">
                                            <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto p-6 bg-surface-1 text-foreground leading-relaxed">
                                                {result.content ? (
                                                    result.content.split('\n').map((line, i) => {
                                                        const isComment = line.trim().startsWith('#');
                                                        const isAllow = line.toLowerCase().startsWith('allow:');
                                                        const isDisallow = line.toLowerCase().startsWith('disallow:');
                                                        const isSitemap = line.toLowerCase().startsWith('sitemap:');
                                                        const isUserAgent = line.toLowerCase().startsWith('user-agent:');
                                                        const isCrawlDelay = line.toLowerCase().startsWith('crawl-delay:');

                                                        let colorClass = "text-foreground";
                                                        if (isComment) colorClass = "text-text-subtle";
                                                        else if (isAllow) colorClass = "text-success font-medium";
                                                        else if (isDisallow) colorClass = "text-error font-medium";
                                                        else if (isSitemap) colorClass = "text-primary";
                                                        else if (isUserAgent) colorClass = "text-accent font-bold";
                                                        else if (isCrawlDelay) colorClass = "text-warning";

                                                        return (
                                                            <div key={i} className={colorClass}>
                                                                {line}
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-text-muted italic">Empty file</span>
                                                )}
                                            </pre>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden shadow-sm">
                                        <div className="border-b border-[var(--border)] bg-[var(--surface-2)] px-6 py-4">
                                            <h3 className="font-bold text-foreground-subtle">Extracted Directives</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] border-b border-border">
                                                    <tr>
                                                        <th className="px-6 py-3 font-semibold uppercase tracking-tight text-xs text-foreground">User Agent</th>
                                                        <th className="px-6 py-3 font-semibold uppercase tracking-tight text-xs text-foreground">Directive</th>
                                                        <th className="px-6 py-3 font-semibold uppercase tracking-tight text-xs text-foreground">Path Pattern</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[var(--border)]">
                                                    {result.rules && result.rules.length > 0 ? (
                                                        result.rules.map((rule, i) => (
                                                            <tr key={i} className="hover:bg-[var(--surface-3)]/50 transition-colors">
                                                                <td className="px-6 py-4 font-mono text-xs font-semibold text-foreground">{rule.userAgent}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold border ${rule.type === 'allow' ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20'
                                                                        }`}>
                                                                        {rule.type === 'allow' ? <MdCheckCircle className="size-3" /> : <MdErrorOutline className="size-3" />}
                                                                        {rule.type.toUpperCase()}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 font-mono text-xs">{rule.path}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={3} className="px-6 py-8 text-center text-[var(--text-muted)] italic">
                                                                No explicit crawl rules found in this file.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-6 shadow-sm">
                                        <h3 className="font-bold mb-4 border-b border-[var(--border)] pb-2 text-foreground-subtle uppercase text-xs tracking-wider">Crawler Summary</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-full bg-success/10 text-success flex items-center justify-center border border-success/20">
                                                <MdCheckCircle className="size-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">Active & Accessible</p>
                                                <p className="text-xs text-[var(--text-muted)] tracking-tight">Status {result.status} (OK)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-6 shadow-sm">
                                        <h3 className="font-bold mb-4 border-b border-[var(--border)] pb-2 flex items-center justify-between text-foreground-subtle uppercase text-xs tracking-wider">
                                            Declared Sitemaps
                                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded">{result.sitemaps?.length || 0}</span>
                                        </h3>
                                        {result.sitemaps && result.sitemaps.length > 0 ? (
                                            <ul className="space-y-3 text-sm">
                                                {result.sitemaps.map((sitemap, i) => (
                                                    <li key={i} className="flex gap-2 items-start break-all p-3 bg-surface-2 rounded-lg border border-border group hover:border-primary/50 transition-colors">
                                                        <MdInfo className="size-4 shrink-0 text-primary mt-0.5" />
                                                        <a href={sitemap} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary font-medium text-xs leading-relaxed">
                                                            {sitemap}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-[var(--text-muted)] italic">No sitemap locations were specified in this robots.txt file.</p>
                                        )}
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
