"use client";
import { useState } from "react";

export default function KeywordCannibalizationClient() {
    const [urlsText, setUrlsText] = useState("");
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        const rawUrls = urlsText.split("\n").map(u => u.trim()).filter(Boolean);
        if (rawUrls.length < 2) return setError("Please enter at least 2 URLs");
        
        const urls = rawUrls.map(u => {
            if (!/^https?:\/\//i.test(u)) return 'https://' + u;
            return u;
        });
        setUrlsText(urls.join("\n"));

        setLoading(true); setError(""); setResult(null);
        try {
            const res = await fetch("/api/tools/keyword-cannibalization", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ urls, keyword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setResult(data);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    const riskColor = (risk: string) => ({
        High: "bg-red-500/10 text-red-600 border-red-500/20",
        Medium: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
        Low: "bg-green-500/10 text-green-600 border-green-500/20",
    }[risk] || "");

    const strengthBar = (score: number) => (
        <div className="h-2 rounded-full bg-[var(--surface-2)] overflow-hidden w-24">
            <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${Math.min(100, score)}%` }} />
        </div>
    );

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Free Keyword Cannibalization Checker</h1>
                <p className="text-[var(--text-muted)]">Enter 2–10 URLs and a target keyword to detect overlap, content similarity, and self-competition in search results.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 mb-8">
                <textarea value={urlsText} onChange={e => setUrlsText(e.target.value)} required rows={5}
                    placeholder={"Enter 2-10 URLs (one per line):\nhttps://yourdomain.com/seo-guide\nhttps://yourdomain.com/seo-tips\nhttps://yourdomain.com/seo-checklist"}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm font-mono outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition resize-none"
                />
                <div className="flex gap-3">
                    <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} required placeholder="Target keyword (e.g. seo guide)"
                        className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition"
                    />
                    <button type="submit" disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors">
                        {loading ? "Analyzing..." : "Check Cannibalization"}
                    </button>
                </div>
            </form>

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm mb-4">{error}</div>}

            {result && (
                <div className="space-y-6">
                    <div className={`rounded-xl border p-4 ${result.pairs.some((p: any) => p.risk === "High") ? "border-red-500/30 bg-red-500/5" : "border-[var(--border)] bg-[var(--surface-1)]"}`}>
                        <p className="font-semibold mb-1">Recommendation</p>
                        <p className="text-sm text-[var(--text-muted)]">{result.recommendation}</p>
                    </div>

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                        <div className="p-4 border-b border-[var(--border)]"><h3 className="font-semibold">Page Analysis — "{result.keyword}"</h3></div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-[var(--text-muted)]">URL</th>
                                        <th className="px-4 py-3 text-left text-[var(--text-muted)]">Title</th>
                                        <th className="px-4 py-3 text-center text-[var(--text-muted)]">Word Count</th>
                                        <th className="px-4 py-3 text-center text-[var(--text-muted)]">KW Freq.</th>
                                        <th className="px-4 py-3 text-center text-[var(--text-muted)]">KW Density</th>
                                        <th className="px-4 py-3 text-left text-[var(--text-muted)]">Targeting Strength</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.pages.map((p: any, i: number) => (
                                        <tr key={i} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-2)]">
                                            <td className="px-4 py-3 text-xs font-mono max-w-[180px] truncate">
                                                <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary)] hover:underline">{p.url}</a>
                                            </td>
                                            <td className="px-4 py-3 text-xs max-w-[180px] truncate">{p.title}</td>
                                            <td className="px-4 py-3 text-center">{p.wordCount}</td>
                                            <td className="px-4 py-3 text-center font-mono">{p.keywordFrequency}</td>
                                            <td className="px-4 py-3 text-center font-mono">{p.keywordDensity}%</td>
                                            <td className="px-4 py-3">{strengthBar(p.targetingStrength)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                        <div className="p-4 border-b border-[var(--border)]"><h3 className="font-semibold">Pairwise Similarity Analysis</h3></div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-[var(--text-muted)]">Page A</th>
                                        <th className="px-4 py-3 text-left text-[var(--text-muted)]">Page B</th>
                                        <th className="px-4 py-3 text-center text-[var(--text-muted)]">Similarity</th>
                                        <th className="px-4 py-3 text-center text-[var(--text-muted)]">Risk</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.pairs.map((p: any, i: number) => (
                                        <tr key={i} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-2)]">
                                            <td className="px-4 py-3 text-xs font-mono max-w-[200px] truncate">{p.urlA}</td>
                                            <td className="px-4 py-3 text-xs font-mono max-w-[200px] truncate">{p.urlB}</td>
                                            <td className="px-4 py-3 text-center font-bold">{p.similarity}%</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${riskColor(p.risk)}`}>{p.risk}</span>
                                            </td>
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
