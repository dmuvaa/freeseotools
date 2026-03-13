"use client";
import { useState } from "react";

const DEPTH_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#f59e0b", "#10b981"];

function TreeNode({ node, nodes, depth }: { node: any; nodes: any[]; depth: number }) {
    const [expanded, setExpanded] = useState(depth < 2);
    const children = nodes.filter(n => n.parent === node.url);
    const color = DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)];
    const hostname = (() => { try { return new URL(node.url).pathname || "/"; } catch { return node.url; } })();

    return (
        <div className="ml-4">
            <div className="flex items-center gap-2 py-1">
                {children.length > 0
                    ? <button onClick={() => setExpanded(!expanded)} className="text-xs w-4 shrink-0">{expanded ? "▾" : "▸"}</button>
                    : <div className="w-4 shrink-0" />
                }
                <span className="size-2 rounded-full shrink-0" style={{ background: color }} />
                <a href={node.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--text-muted)] hover:text-[var(--primary)] truncate max-w-xs"
                    title={node.url}>{hostname}</a>
                {node.childCount > 0 && <span className="text-[10px] text-[var(--text-muted)]">({node.childCount})</span>}
            </div>
            {expanded && children.map(child => <TreeNode key={child.url} node={child} nodes={nodes} depth={depth + 1} />)}
        </div>
    );
}

export default function CrawlPathClient() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!url) return;
        let targetUrl = url;
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
        }
        setUrl(targetUrl);
        setLoading(true); setError(""); setResult(null);
        try {
            const res = await fetch("/api/tools/crawl-path", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: targetUrl }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setResult(data);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    const rootNodes = result?.nodes?.filter((n: any) => n.parent === null) || [];

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Crawl Path Visualizer</h1>
                <p className="text-[var(--text-muted)]">Crawl up to 50 pages from a starting URL and visualize the link tree structure. See click depth, page hierarchy, and identify pages buried too deep for Googlebot to efficiently crawl.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://yourdomain.com"
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition" />
                <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 transition">
                    {loading ? "Crawling..." : "Visualize"}
                </button>
            </form>

            {loading && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-10 text-center animate-pulse">
                    <div className="text-5xl mb-3">🗺️</div>
                    <p className="font-semibold mb-1">Crawling and building link tree...</p>
                    <p className="text-sm text-[var(--text-muted)]">Following links up to 50 pages deep. Takes 30–90 seconds.</p>
                </div>
            )}

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm">{error}</div>}

            {result && (
                <div className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Pages Found", value: result.totalPages },
                            { label: "Max Click Depth", value: result.maxDepth },
                            { label: "Deep Pages (≥4)", value: result.nodes.filter((n: any) => n.depth >= 4).length },
                        ].map(({ label, value }) => (
                            <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-center">
                                <div className="text-2xl font-bold">{value}</div>
                                <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Depth distribution */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                        <h3 className="font-semibold mb-3">Pages by Click Depth</h3>
                        <div className="space-y-2">
                            {Object.entries(result.depthDistribution).sort(([a], [b]) => Number(a) - Number(b)).map(([depth, count]: [string, any]) => {
                                const maxCount = Math.max(...Object.values(result.depthDistribution) as number[]);
                                const color = DEPTH_COLORS[Math.min(Number(depth), DEPTH_COLORS.length - 1)];
                                return (
                                    <div key={depth} className="flex items-center gap-3">
                                        <span className="text-xs w-20 shrink-0">Depth {depth} {Number(depth) >= 4 ? "⚠️" : ""}</span>
                                        <div className="flex-1 h-4 bg-[var(--surface-2)] rounded">
                                            <div className="h-4 rounded" style={{ width: `${(count / maxCount) * 100}%`, background: color }} />
                                        </div>
                                        <span className="text-xs w-8 text-right">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                        {result.maxDepth >= 4 && (
                            <p className="text-xs text-amber-600 mt-3">⚠️ Pages beyond depth 3 may receive less crawl priority from Googlebot. Consider flattening the site structure.</p>
                        )}
                    </div>

                    {/* Link Tree */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
                        <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
                            <h3 className="font-semibold">Link Tree</h3>
                            <span className="text-xs text-[var(--text-muted)]">Click ▸ to expand branches</span>
                        </div>
                        <div className="p-4 max-h-[500px] overflow-y-auto font-mono">
                            {rootNodes.map((node: any) => (
                                <TreeNode key={node.url} node={node} nodes={result.nodes} depth={0} />
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-3">
                        {DEPTH_COLORS.map((color, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                                <span className="size-2.5 rounded-full" style={{ background: color }} />
                                Depth {i}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
