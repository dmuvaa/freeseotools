"use client";
import { useState, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function LogFileAnalyzerClient() {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!file) return setError("Please upload a log file");
        setLoading(true); setError(""); setResult(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/tools/log-file", { method: "POST", body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setResult(data);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    const statusColors: Record<string, string> = { "OK": "#10b981", "Redirect": "#f59e0b", "Not Found": "#ef4444", "Server Error": "#dc2626" };

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Free SEO Log File Analyzer</h1>
                <p className="text-[var(--text-muted)]">Upload your server access log (Apache/Nginx Combined Log Format) to see how search engine bots crawl your site.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                <div
                    className={`relative rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${isDragging ? "border-[var(--primary)] bg-[var(--primary-muted)]/10" : "border-[var(--border)] hover:border-[var(--primary-muted)]"}`}
                    onClick={() => inputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}
                >
                    <input ref={inputRef} type="file" accept=".log,.txt" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                    <div className="text-4xl mb-3">📄</div>
                    {file ? (
                        <p className="font-medium">{file.name} <span className="text-[var(--text-muted)] text-sm">({(file.size / 1024).toFixed(0)} KB)</span></p>
                    ) : (
                        <>
                            <p className="font-medium mb-1">Drop your .log file here or click to browse</p>
                            <p className="text-sm text-[var(--text-muted)]">Supports Apache / Nginx Combined Log Format (.log, .txt)</p>
                        </>
                    )}
                </div>
                <button type="submit" disabled={loading || !file}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors">
                    {loading ? "Analyzing log..." : "Analyze Log File"}
                </button>
            </form>

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm mb-4">{error}</div>}

            {result && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: "Total Lines", value: result.summary.totalLines },
                            { label: "Bot Requests", value: result.summary.botRequests },
                            { label: "Unique URLs", value: result.summary.uniqueUrls },
                            { label: "Error Rate", value: `${result.summary.errorRate}%`, warn: result.summary.errorRate > 5 },
                            { label: "Parsed Lines", value: result.summary.parsedLines },
                        ].map(s => (
                            <div key={s.label} className={`rounded-xl border p-4 text-center ${(s as any).warn ? "border-orange-500/30 bg-orange-500/5" : "border-[var(--border)] bg-[var(--surface-1)]"}`}>
                                <div className={`text-xl font-bold ${(s as any).warn ? "text-orange-500" : ""}`}>{s.value}</div>
                                <div className="text-xs text-[var(--text-muted)] mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                            <h3 className="font-semibold mb-4">Bot Breakdown</h3>
                            <ResponsiveContainer width="100%" height={160}>
                                <BarChart data={result.botBreakdown} layout="vertical">
                                    <XAxis type="number" tick={{ fontSize: 11 }} />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="var(--primary)" radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                            <h3 className="font-semibold mb-4">Status Code Distribution</h3>
                            <div className="space-y-2">
                                {result.statusSummary.slice(0, 6).map((s: any) => (
                                    <div key={s.code} className="flex items-center gap-3 text-sm">
                                        <span className="font-mono font-bold w-12 text-right" style={{ color: statusColors[s.label] || "#94a3b8" }}>{s.code}</span>
                                        <div className="flex-1 h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${s.percent}%`, background: statusColors[s.label] || "#94a3b8" }} />
                                        </div>
                                        <span className="text-[var(--text-muted)] text-xs w-10">{s.percent}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { title: "Most Crawled URLs", data: result.mostCrawled },
                            { title: "High Error Rate URLs", data: result.highErrorUrls },
                        ].map(section => (
                            <div key={section.title} className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                                <div className="p-4 border-b border-[var(--border)]"><h3 className="font-semibold">{section.title}</h3></div>
                                {section.data?.length > 0 ? (
                                    <div className="divide-y divide-[var(--border)]/50">
                                        {section.data.slice(0, 10).map((u: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between px-4 py-2.5 gap-3">
                                                <p className="text-xs font-mono text-[var(--text-muted)] truncate flex-1">{u.path}</p>
                                                <span className="text-xs font-medium shrink-0">{u.count}x</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-sm text-[var(--text-muted)] p-4">None found.</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
