"use client";
import { useState } from "react";

export default function IndexabilityCheckerClient() {
    const [urlsText, setUrlsText] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        const rawUrls = urlsText.split("\n").map(u => u.trim()).filter(Boolean);
        if (rawUrls.length === 0) return setError("Paste at least one URL");
        
        const urls = rawUrls.map(u => {
            if (!/^https?:\/\//i.test(u)) return 'https://' + u;
            return u;
        });
        setUrlsText(urls.join("\n"));

        setLoading(true); setError(""); setResult(null);
        try {
            const res = await fetch("/api/tools/indexability", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ urls }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setResult(data);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    const badge = (ok: boolean, yes = "Yes", no = "No") => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ok ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
            {ok ? yes : no}
        </span>
    );

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Free Bulk Indexability Checker</h1>
                <p className="text-[var(--text-muted)]">Paste up to 50 URLs (one per line) to instantly check whether each page can be indexed by search engines.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 mb-8">
                <textarea value={urlsText} onChange={e => setUrlsText(e.target.value)} required rows={6}
                    placeholder={"https://yourdomain.com/page-1\nhttps://yourdomain.com/page-2\nhttps://yourdomain.com/page-3"}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm font-mono outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition resize-none"
                />
                <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--text-muted)]">{urlsText.split("\n").filter(Boolean).length} / 50 URLs</p>
                    <button type="submit" disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors">
                        {loading ? "Checking..." : "Check Indexability"}
                    </button>
                </div>
            </form>

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm mb-4">{error}</div>}

            {result && (
                <div className="space-y-5">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                        {[
                            { label: "Total", value: result.summary.total, color: "" },
                            { label: "Indexable", value: result.summary.indexable, color: "text-green-600" },
                            { label: "Noindex", value: result.summary.noindex, color: result.summary.noindex > 0 ? "text-red-500" : "" },
                            { label: "Blocked", value: result.summary.blocked, color: result.summary.blocked > 0 ? "text-orange-500" : "" },
                            { label: "Redirected", value: result.summary.redirected, color: result.summary.redirected > 0 ? "text-yellow-600" : "" },
                            { label: "Errors", value: result.summary.errors, color: result.summary.errors > 0 ? "text-red-500" : "" },
                        ].map(s => (
                            <div key={s.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-center">
                                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                                <div className="text-xs text-[var(--text-muted)] mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">URL</th>
                                        <th className="px-3 py-3 text-center font-medium text-[var(--text-muted)]">Status</th>
                                        <th className="px-3 py-3 text-center font-medium text-[var(--text-muted)]">Noindex</th>
                                        <th className="px-3 py-3 text-center font-medium text-[var(--text-muted)]">Robots Blocked</th>
                                        <th className="px-3 py-3 text-center font-medium text-[var(--text-muted)]">Redirect</th>
                                        <th className="px-3 py-3 text-center font-medium text-[var(--text-muted)]">Indexable</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.results.map((r: any, i: number) => (
                                        <tr key={i} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-2)] transition-colors">
                                            <td className="px-4 py-3 font-mono max-w-xs truncate">
                                                <a href={r.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary)] hover:underline">{r.url}</a>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span className={`font-medium ${r.status >= 400 ? "text-red-500" : r.status >= 300 ? "text-yellow-600" : "text-green-600"}`}>{r.status || "0"}</span>
                                            </td>
                                            <td className="px-3 py-3 text-center">{badge(!r.noindex, "No", "Yes")}</td>
                                            <td className="px-3 py-3 text-center">{badge(!r.robotsBlocked, "No", "Yes")}</td>
                                            <td className="px-3 py-3 text-center">{badge(!r.isRedirect, "No", "Yes")}</td>
                                            <td className="px-3 py-3 text-center">{badge(r.indexable)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
