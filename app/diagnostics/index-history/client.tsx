"use client";
import { useEffect, useState } from "react";

interface Snapshot {
    url: string;
    finalUrl: string;
    status: number;
    canonical: string;
    noindex: boolean;
    isRedirect: boolean;
    indexable: boolean;
    checkedAt: string;
}

const STORAGE_KEY = "freeseotools_index_history";

function loadHistory(): Record<string, Snapshot[]> {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

function saveHistory(h: Record<string, Snapshot[]>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(h));
}

function StatusBadge({ indexable, noindex, isRedirect, status }: any) {
    if (indexable) return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-500/15 text-green-600">✅ Indexable</span>;
    if (noindex) return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/15 text-red-600">🚫 Noindex</span>;
    if (isRedirect) return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/15 text-amber-600">↪ Redirect</span>;
    if (status >= 400) return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/15 text-red-600">❌ {status} Error</span>;
    return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-500/15 text-gray-600">Unknown</span>;
}

function diffSnapshots(prev: Snapshot, curr: Snapshot): string[] {
    const changes: string[] = [];
    if (prev.indexable !== curr.indexable) changes.push(`Indexability changed: ${prev.indexable ? "Indexable" : "Non-indexable"} → ${curr.indexable ? "Indexable" : "Non-indexable"}`);
    if (prev.status !== curr.status) changes.push(`Status changed: ${prev.status} → ${curr.status}`);
    if (prev.noindex !== curr.noindex) changes.push(`Noindex changed: ${prev.noindex} → ${curr.noindex}`);
    if (prev.canonical !== curr.canonical) changes.push(`Canonical changed: "${prev.canonical || "none"}" → "${curr.canonical || "none"}"`);
    if (prev.isRedirect !== curr.isRedirect) changes.push(`Redirect status changed: ${prev.isRedirect} → ${curr.isRedirect}`);
    return changes;
}

export default function IndexHistoryClient() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<Record<string, Snapshot[]>>({});
    const [error, setError] = useState("");
    const [lastChecked, setLastChecked] = useState<Snapshot | null>(null);

    useEffect(() => { setHistory(loadHistory()); }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!url) return;
        let targetUrl = url;
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
        }
        setUrl(targetUrl);
        setLoading(true); setError(""); setLastChecked(null);
        try {
            let checkUrl = url.trim();
            if (!checkUrl.startsWith("http")) checkUrl = "https://" + checkUrl;

            const res = await fetch("/api/tools/index-history", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: checkUrl }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            const snapshot: Snapshot = data.snapshot;
            const updated = loadHistory();
            const key = snapshot.url;
            if (!updated[key]) updated[key] = [];
            updated[key] = [snapshot, ...updated[key]].slice(0, 20); // keep last 20
            saveHistory(updated);
            setHistory({ ...updated });
            setLastChecked(snapshot);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    function clearHistory(urlKey: string) {
        const updated = loadHistory();
        delete updated[urlKey];
        saveHistory(updated);
        setHistory({ ...updated });
    }

    const trackedUrls = Object.keys(history).sort();

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Index Status History Checker</h1>
                <p className="text-[var(--text-muted)]">Track indexability status of any URL over time. Run a snapshot whenever you like — changes between checks are highlighted automatically. History is stored in your browser.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://yourdomain.com/your-page"
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition" />
                <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 transition">
                    {loading ? "Checking..." : "Check & Track"}
                </button>
            </form>

            {loading && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-8 text-center animate-pulse">
                    <div className="text-4xl mb-2">🔎</div>
                    <p className="font-semibold">Checking indexability and saving snapshot...</p>
                </div>
            )}

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm">{error}</div>}

            {lastChecked && (
                <div className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4 mb-6 flex items-center gap-4">
                    <div className="flex-1">
                        <p className="text-sm font-semibold mb-1">Latest snapshot saved ✓</p>
                        <StatusBadge {...lastChecked} />
                        <span className="text-xs text-[var(--text-muted)] ml-2">HTTP {lastChecked.status} · {new Date(lastChecked.checkedAt).toLocaleString()}</span>
                    </div>
                </div>
            )}

            {trackedUrls.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-[var(--text-muted)]">
                    <div className="text-4xl mb-3">📊</div>
                    <p className="font-medium mb-1">No tracked URLs yet</p>
                    <p className="text-sm">Enter a URL above and click "Check & Track" to start monitoring. Re-check anytime to see what changed.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <h3 className="font-semibold">Tracked URLs ({trackedUrls.length})</h3>
                    {trackedUrls.map(urlKey => {
                        const snaps = history[urlKey];
                        const latest = snaps[0];
                        const changes = snaps.length > 1 ? diffSnapshots(snaps[1], snaps[0]) : [];

                        return (
                            <div key={urlKey} className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                                <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
                                    <div className="flex-1 min-w-0">
                                        <a href={urlKey} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--primary)] hover:underline truncate block">{urlKey}</a>
                                        <div className="flex items-center gap-2 mt-1">
                                            <StatusBadge {...latest} />
                                            <span className="text-xs text-[var(--text-muted)]">Last checked {new Date(latest.checkedAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => clearHistory(urlKey)} className="text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors shrink-0">Clear</button>
                                </div>

                                {changes.length > 0 && (
                                    <div className="px-4 py-2 bg-amber-500/5 border-b border-amber-500/20">
                                        {changes.map((c, i) => <p key={i} className="text-xs text-amber-700">⚠️ {c}</p>)}
                                    </div>
                                )}
                                {changes.length === 0 && snaps.length > 1 && (
                                    <div className="px-4 py-2 bg-green-500/5 border-b border-green-500/20">
                                        <p className="text-xs text-green-700">✅ No changes detected since last check</p>
                                    </div>
                                )}

                                {/* Snapshot history */}
                                <div className="divide-y divide-[var(--border)] max-h-52 overflow-y-auto">
                                    {snaps.map((snap, i) => (
                                        <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-xs">
                                            <StatusBadge {...snap} />
                                            <span className="text-[var(--text-muted)]">HTTP {snap.status}</span>
                                            {snap.canonical && <span className="text-[var(--text-muted)] truncate" title={snap.canonical}>canonical: ...{snap.canonical.slice(-30)}</span>}
                                            <span className="text-[var(--text-muted)] ml-auto shrink-0">{new Date(snap.checkedAt).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
