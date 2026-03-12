"use client";
import { useState } from "react";

type Sev = "critical" | "warning" | "info";
const SEV = {
    critical: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-600", dot: "bg-red-500", label: "Critical" },
    warning: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600", dot: "bg-amber-500", label: "Warning" },
    info: { bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-500", dot: "bg-indigo-400", label: "Info" },
};
const ICONS: Record<string, string> = {
    Security: "🔒", Technical: "⚙️", "Crawl Budget": "🤖", Indexability: "🔍", "On-Page": "📝",
    Content: "📄", Links: "🔗", Pagination: "↔️", Performance: "⚡", Mobile: "📱",
    Accessibility: "♿", "Structured Data": "🏷️", Social: "📣",
};
const CAT_ORDER = ["Security", "Technical", "Crawl Budget", "Indexability", "On-Page", "Content", "Links", "Pagination", "Performance", "Mobile", "Accessibility", "Structured Data", "Social"];
const TABS = ["All", "Critical", "Warning", "Info", "Passed"] as const;
type Tab = typeof TABS[number];

function scoreColor(s: number) { return s >= 80 ? "#10b981" : s >= 50 ? "#f59e0b" : "#ef4444"; }
function scoreLabel(s: number) { return s >= 80 ? "Good" : s >= 50 ? "Needs Work" : "Poor"; }

// --- Existing basic summary components ---
function ScoreRing({ score }: { score: number }) {
    const c = scoreColor(score), r = 56, circ = 2 * Math.PI * r, dash = (score / 100) * circ;
    return (
        <div className="flex flex-col items-center">
            <div className="relative size-40">
                <svg className="size-40 -rotate-90" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="12" />
                    <circle cx="64" cy="64" r={r} fill="none" stroke={c} strokeWidth="12"
                        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} style={{ transition: "stroke-dasharray 1.2s ease" }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black" style={{ color: c }}>{score}</span>
                    <span className="text-xs font-semibold mt-0.5" style={{ color: c }}>{scoreLabel(score)}</span>
                </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">SEO Score</p>
        </div>
    );
}

function CatCard({ cat, data }: { cat: string; data: { score: number; issues: number; passes: number } }) {
    const c = scoreColor(data.score);
    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3 flex items-center gap-3">
            <span className="text-xl shrink-0">{ICONS[cat] || "🔧"}</span>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                    <p className="text-xs font-semibold truncate">{cat}</p>
                    <span className="text-sm font-black ml-1 shrink-0" style={{ color: c }}>{data.score}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--surface-2)]">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${data.score}%`, background: c }} />
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">{data.issues > 0 ? `${data.issues} issue${data.issues > 1 ? "s" : ""}` : "✓ None"} · {data.passes} passed</p>
            </div>
        </div>
    );
}

function SerpPreview({ title, metaDesc, url }: { title: string; metaDesc: string; url: string }) {
    const displayUrl = url.replace(/^https?:\/\//, "");
    const t = title ? (title.length > 60 ? title.slice(0, 57) + "…" : title) : "No title";
    const d = metaDesc ? (metaDesc.length > 155 ? metaDesc.slice(0, 152) + "…" : metaDesc) : "No meta description found.";
    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
            <h2 className="text-sm font-bold mb-3">SERP Preview</h2>
            <div className="p-4 bg-white rounded-lg shadow-sm border max-w-xl">
                <div className="flex items-center gap-2 mb-1.5">
                    <div className="size-5 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-500">{displayUrl[0]?.toUpperCase()}</div>
                    <div><p className="text-xs text-gray-700 leading-none">{displayUrl.split("/")[0]}</p><p className="text-[10px] text-gray-400">{displayUrl}</p></div>
                </div>
                <p className="text-[#1a0dab] text-[18px] font-normal leading-snug hover:underline cursor-pointer">{t}</p>
                <p className="text-sm text-gray-600 mt-1 leading-snug">{d}</p>
            </div>
        </div>
    );
}

function IssueRow({ issue, open, onToggle }: { issue: any; open: boolean; onToggle: () => void }) {
    const s = SEV[issue.severity as Sev] || SEV.info;
    return (
        <div className="border-b border-[var(--border)] last:border-0">
            <button onClick={onToggle} className="w-full flex items-start gap-3 p-3.5 text-left hover:bg-[var(--surface-2)]/40 transition-colors">
                <span className={`shrink-0 mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${s.bg} ${s.border} ${s.text} whitespace-nowrap`}>{s.label}</span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">{issue.title}</p>
                    {issue.detail && <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{issue.detail}</p>}
                </div>
                <span className="text-[10px] text-[var(--text-muted)] shrink-0 mt-0.5 whitespace-nowrap">{ICONS[issue.category] || "🔧"} {issue.category}</span>
                <span className="text-[var(--text-muted)] shrink-0 ml-1 text-xs">{open ? "▲" : "▼"}</span>
            </button>
            {open && issue.recommendation && (
                <div className="px-4 pb-3.5 ml-24">
                    <p className="text-xs bg-[var(--surface-2)] rounded-lg p-3 text-[var(--text-muted)]">
                        💡 <strong className="text-[var(--foreground)]">Fix:</strong> {issue.recommendation}
                    </p>
                </div>
            )}
        </div>
    );
}

function RedirectChain({ chain }: { chain: { url: string; status: number }[] }) {
    if (!chain?.length) return null;
    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
            <h2 className="text-sm font-bold mb-3">Redirect Chain ({chain.length - 1} hop{chain.length > 2 ? "s" : ""})</h2>
            <div className="space-y-1.5">
                {chain.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                        <span className={`px-1.5 py-0.5 rounded font-bold shrink-0 ${c.status >= 300 && c.status < 400 ? "bg-amber-500/10 text-amber-600" : c.status === 200 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>{c.status}</span>
                        <span className="text-[var(--text-muted)] truncate">{c.url}</span>
                        {i < chain.length - 1 && <span className="text-[var(--text-muted)] shrink-0">→</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- NEW FULL DETAIL TABLES ---

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
            <h2 className="text-base font-bold mb-4">{title}</h2>
            {children}
        </div>
    );
}

function DataTable({ cols, rows, rowClasses }: { cols: string[]; rows: React.ReactNode[][]; rowClasses?: string }) {
    if (!rows.length) return <p className="text-xs text-[var(--text-muted)]">No data found.</p>;
    return (
        <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
            <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] border-b border-[var(--border)]">
                    <tr>{cols.map(c => <th key={c} className="px-3 py-2 font-medium">{c}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                    {rows.map((r, i) => (
                        <tr key={i} className={`hover:bg-[var(--surface-2)]/50 transition-colors ${rowClasses || ""}`}>
                            {r.map((c, j) => <td key={j} className="px-3 py-2 max-w-xs truncate">{c}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const STEPS = ["Fetching page…", "Parsing DOM…", "Checking robots.txt…", "Discovering sitemap…", "Tracing redirects…", "Analyzing links…", "Auditing headers & scripts…", "Building detail payload…"];

export default function SEOAuditClient() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadStep, setLoadStep] = useState(0);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");
    const [tab, setTab] = useState<Tab>("All");
    const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);

    // Detail Tabs
    const [detailTab, setDetailTab] = useState<"Overview" | "Links" | "Images" | "Scripts" | "Meta&Headers" | "Content&Schema">("Overview");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError(""); setResult(null); setTab("All"); setExpandedIssueId(null); setLoadStep(0); setDetailTab("Overview");
        const timer = setInterval(() => setLoadStep(s => Math.min(s + 1, STEPS.length - 1)), 2000);
        try {
            const res = await fetch("/api/tools/seo-audit", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setResult(data);
        } catch (e: any) { setError(e.message); }
        finally { clearInterval(timer); setLoading(false); }
    }

    const filteredIssues = tab === "All" ? result?.issues
        : tab === "Passed" ? result?.passes
            : result?.issues?.filter((i: any) => i.severity === tab.toLowerCase());

    const orderedCats = CAT_ORDER.filter(c => result?.categoryScores?.[c]);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
            {/* Header / Form */}
            <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-6 md:p-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold mb-4">✦ Mega Audit Tools Aggregator</div>
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Comprehensive SEO Deep-Dive</h1>
                <p className="text-[var(--text-muted)] text-sm mb-6 max-w-3xl">One URL. 13 categories. 80+ checks. Complete raw data extraction for all links, images, scripts, HTTP headers, robots.txt, pagination signals, and JSON-LD schema.</p>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
                    <input type="text" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://yoursite.com/page"
                        className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition shadow-inner" />
                    <button type="submit" disabled={loading} className="rounded-xl px-8 py-4 font-bold text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 transition w-full md:w-auto shadow-sm flex items-center justify-center gap-2">
                        {loading ? <><span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Scanning…</> : "Run Full Scan →"}
                    </button>
                </form>

                {error && <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 text-sm font-medium">{error}</div>}

                {/* Loading state */}
                {loading && (
                    <div className="mt-8 pt-8 border-t border-[var(--border)] text-center space-y-5 animate-in fade-in duration-500">
                        <div className="flex justify-center gap-2">
                            {["🔒", "⚙️", "🤖", "📝", "⚡", "🔗", "♿", "🏷️"].map((e, i) => (
                                <span key={i} className="text-2xl opacity-70 animate-bounce block" style={{ animationDelay: `${i * 0.1}s` }}>{e}</span>
                            ))}
                        </div>
                        <div>
                            <p className="font-bold text-lg text-[var(--foreground)]">{STEPS[loadStep]}</p>
                            <p className="text-sm text-[var(--text-muted)] mt-1">Collecting full diagnostic data for every element...</p>
                        </div>
                        <div className="h-2 rounded-full bg-[var(--surface-2)] max-w-md mx-auto overflow-hidden shadow-inner">
                            <div className="h-full bg-[var(--primary)] rounded-full transition-all duration-[1900ms] ease-out" style={{ width: `${((loadStep + 1) / STEPS.length) * 100}%` }} />
                        </div>
                        <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Step {loadStep + 1} of {STEPS.length}</p>
                    </div>
                )}
            </div>

            {/* Results */}
            {result && !loading && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Top Level Score */}
                    <div className="grid md:grid-cols-[auto_1fr] gap-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6 md:p-8">
                        <ScoreRing score={result.score} />
                        <div className="flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-bold truncate mb-1">
                                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-[var(--primary)]">{result.url}</a>
                                </h2>
                                {result.meta.redirectHops > 0 && <span className="text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-600 font-bold border border-amber-500/20">↪ {result.meta.redirectHops} Redirects Traversed</span>}
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                                {[{ label: "Critcal Issues", value: result.summary.critical, color: "#ef4444", bg: "bg-red-500/10" }, { label: "Warnings", value: result.summary.warnings, color: "#f59e0b", bg: "bg-amber-500/10" }, { label: "Passed Checks", value: result.summary.passes, color: "#10b981", bg: "bg-emerald-500/10" }, { label: "Total Elements", value: result.allInternalLinks.length + result.allImages.length + result.allScripts.length + result.allExternalLinks.length, color: "#6366f1", bg: "bg-indigo-500/10" }].map(({ label, value, color, bg }) => (
                                    <div key={label} className={`rounded-xl border border-[var(--border)] p-4 text-center ${bg}`}>
                                        <p className="text-3xl font-black" style={{ color }}>{value}</p>
                                        <p className="text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color }}>{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Master Navigation */}
                    <div className="flex overflow-x-auto gap-2 p-1 bg-[var(--surface-1)] rounded-xl border border-[var(--border)]">
                        {(["Overview", "Links", "Images", "Scripts", "Meta&Headers", "Content&Schema"] as const).map(t => (
                            <button key={t} onClick={() => setDetailTab(t)}
                                className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-colors whitespace-nowrap flex-1 ${detailTab === t ? "bg-[var(--primary)] text-white shadow" : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"}`}>
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* TAB: OVERVIEW */}
                    {detailTab === "Overview" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-bold mb-3 px-1">Scores by Category</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
                                    {orderedCats.map(cat => <CatCard key={cat} cat={cat} data={result.categoryScores[cat]} />)}
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-6">
                                <SerpPreview title={result.meta.title} metaDesc={result.meta.metaDesc} url={result.url} />
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
                                    <h2 className="text-sm font-bold mb-4 border-b border-[var(--border)] pb-2">Page Summary</h2>
                                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                                        {[
                                            { l: "TTFB", v: `${result.meta.ttfb}ms` },
                                            { l: "HTML Size", v: `${result.meta.pageSizeKb}KB` },
                                            { l: "Word Count", v: result.meta.wordCount },
                                            { l: "Reading Level", v: `Flesch ${result.meta.readScore}` },
                                            { l: "H1", v: result.meta.h1 || "❌ Missing" },
                                            { l: "Canonical", v: result.meta.canonical || "❌ Missing" },
                                            { l: "Lang", v: result.meta.langAttr || "❌ Missing" },
                                            { l: "URL Depth", v: `${result.meta.urlDepth} levels` },
                                            { l: "Sitemap URL", v: result.meta.sitemap.url || "❌ Missing" },
                                            { l: "In Sitemap", v: result.meta.sitemap.inSitemap ? "✅ Yes" : "❌ No" },
                                        ].map(({ l, v }) => (
                                            <div key={l} className="flex flex-col">
                                                <dt className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">{l}</dt>
                                                <dd className="font-medium truncate" title={String(v)}>{v}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                            </div>

                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden shadow-sm">
                                <div className="p-4 border-b border-[var(--border)] bg-[var(--background)] flex justify-between items-center">
                                    <h2 className="font-bold">Detected SEO Issues</h2>
                                </div>
                                <div className="flex overflow-x-auto bg-[var(--surface-1)]">
                                    {TABS.map(t => {
                                        const count = t === "All" ? result.issues.length : t === "Passed" ? result.passes.length : result.issues.filter((i: any) => i.severity === t.toLowerCase()).length;
                                        return (
                                            <button key={t} onClick={() => setTab(t)}
                                                className={`px-5 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap flex-1 transition-colors border-b-2 ${tab === t ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/5" : "border-transparent text-[var(--text-muted)] hover:bg-[var(--surface-2)]"}`}>
                                                {t} <span className="ml-1 opacity-60">({count})</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="max-h-[600px] overflow-y-auto">
                                    {(!filteredIssues || filteredIssues.length === 0)
                                        ? <div className="p-12 text-center text-[var(--text-muted)]">✅ No {tab.toLowerCase()} items found.</div>
                                        : tab === "Passed"
                                            ? filteredIssues.map((i: any) => (
                                                <div key={i.id} className="flex gap-3 p-4 border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]/30">
                                                    <span className="text-emerald-500 font-black">✓</span>
                                                    <div className="flex-1 text-sm"><p className="font-semibold text-emerald-800 dark:text-emerald-400">{i.title}</p><p className="text-xs text-[var(--text-muted)] mt-0.5">{i.detail}</p></div>
                                                    <span className="text-[10px] shrink-0 text-[var(--text-muted)]">{i.category}</span>
                                                </div>
                                            ))
                                            : filteredIssues.map((i: any) => <IssueRow key={i.id} issue={i} open={expandedIssueId === i.id} onToggle={() => setExpandedIssueId(expandedIssueId === i.id ? null : i.id)} />)
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: LINKS */}
                    {detailTab === "Links" && (
                        <div className="space-y-6">
                            <Section title={`Internal Links (${result.allInternalLinks.length})`}>
                                <DataTable
                                    cols={["Link Target (URL)", "Anchor Text", "Status", "Nofollow"]}
                                    rows={result.allInternalLinks.map((l: any) => [
                                        <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">{l.href.replace(result.url, "") || "/"}</a>,
                                        <span className={!l.anchor ? "text-red-500 italic" : ""}>{l.anchor || "Empty"}</span>,
                                        l.checked ? <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${l.ok ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>{l.status || "ERR"}</span> : <span className="text-gray-400">—</span>,
                                        l.nofollow ? <span className="text-red-500 font-bold">Yes</span> : "No"
                                    ])}
                                />
                            </Section>
                            <Section title={`External Links (${result.allExternalLinks.length})`}>
                                <DataTable
                                    cols={["External Domain/URL", "Anchor Text", "Nofollow"]}
                                    rows={result.allExternalLinks.map((l: any) => [
                                        <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline truncate inline-block w-48">{l.href}</a>,
                                        l.anchor || <em className="text-gray-400">Empty</em>,
                                        l.nofollow ? <span className="font-bold">Yes</span> : "No"
                                    ])}
                                />
                            </Section>
                        </div>
                    )}

                    {/* TAB: IMAGES */}
                    {detailTab === "Images" && (
                        <Section title={`Page Images (${result.allImages.length})`}>
                            <DataTable
                                cols={["Image Source", "Alt Text", "Dimensions Set", "Lazy Load"]}
                                rows={result.allImages.map((i: any) => [
                                    <a href={i.src} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline truncate inline-block w-64">{i.src}</a>,
                                    <span className={!i.hasAlt ? "text-red-500 font-bold" : i.alt === "" ? "text-gray-400 italic" : ""}>{!i.hasAlt ? "Missing Alt" : i.alt === "" ? "Empty (Decorative)" : i.alt}</span>,
                                    i.hasDimensions ? <span className="text-green-600">Yes</span> : <span className="text-amber-500 font-bold">No (CLS Risk)</span>,
                                    i.isLazy ? "Yes" : "No"
                                ])}
                            />
                        </Section>
                    )}

                    {/* TAB: SCRIPTS */}
                    {detailTab === "Scripts" && (
                        <div className="space-y-6">
                            <Section title="Third-Party Categories">
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(result.meta.scriptCategories).map(([cat, count]: any) => (
                                        <span key={cat} className="px-3 py-1.5 bg-[var(--surface-2)] rounded-lg text-xs font-bold uppercase">{cat} <span className="text-[var(--primary)] ml-1">{count}</span></span>
                                    ))}
                                </div>
                            </Section>
                            <Section title={`Scripts Inventory (${result.allScripts.length})`}>
                                <DataTable
                                    cols={["Script Source", "Type", "Category", "Loading"]}
                                    rows={result.allScripts.map((s: any) => [
                                        s.inline ? <span className="italic text-gray-500">{"<script> ... </script>"}</span> : <a href={s.src} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline truncate inline-block w-64">{s.src}</a>,
                                        s.inline ? "Inline" : s.isThirdParty ? "Third-Party" : "First-Party",
                                        <span className="capitalize">{s.category}</span>,
                                        s.isAsync ? "async" : s.isDefer ? "defer" : s.inline ? "—" : <span className="text-red-500 font-bold border border-red-500 px-1 rounded">Blocking</span>
                                    ])}
                                />
                            </Section>
                        </div>
                    )}

                    {/* TAB: META & HEADERS */}
                    {detailTab === "Meta&Headers" && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <Section title={`Meta Tags (${result.allMeta.length})`}>
                                <DataTable
                                    cols={["Name / Property", "Content"]}
                                    rows={result.allMeta.map((m: any) => [
                                        <span className="font-mono font-bold text-[var(--primary)]">{m.key}</span>,
                                        m.content ? <span className="truncate inline-block w-64" title={m.content}>{m.content}</span> : <em className="text-gray-400">empty</em>
                                    ])}
                                />
                            </Section>
                            <div className="space-y-6">
                                <Section title={`HTTP Response Headers (${Object.keys(result.allHeaders).length})`}>
                                    <DataTable
                                        cols={["Header", "Value"]}
                                        rows={Object.entries(result.allHeaders).map(([k, v]: any) => [
                                            <span className="font-mono text-[var(--primary)]">{k}</span>,
                                            <span className="truncate inline-block w-48" title={v}>{v}</span>
                                        ])}
                                    />
                                </Section>
                                <Section title="Robots.txt Payload">
                                    {result.robotsText ? (
                                        <div className="bg-[#1e1e1e] text-green-400 p-4 rounded-lg font-mono text-[10px] max-h-64 overflow-y-auto whitespace-pre">
                                            {result.robotsText}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-[var(--text-muted)] italic">No robots.txt found or unreachable.</p>
                                    )}
                                </Section>
                            </div>
                        </div>
                    )}

                    {/* TAB: CONTENT & SCHEMA */}
                    {detailTab === "Content&Schema" && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <Section title="Content Outline (Headings)">
                                    {result.meta.headings?.length > 0 ? (
                                        <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                                            {result.meta.headings.map((h: any, i: number) => (
                                                <div key={i} className="flex gap-3 text-xs border-b border-[var(--border)]/30 pb-1.5">
                                                    <span className={`font-bold w-6 shrink-0 ${h.level === 1 ? "text-[var(--primary)]" : "text-[var(--text-muted)]"}`}>H{h.level}</span>
                                                    <span className="truncate text-[var(--foreground)]" style={{ marginLeft: `${(h.level - 1) * 8}px` }}>{h.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-xs text-[var(--text-muted)]">No headings found.</p>}
                                </Section>
                                {result.meta.redirectChain?.length > 0 && <RedirectChain chain={result.meta.redirectChain} />}
                            </div>
                            <Section title={`JSON-LD Schema Blocks (${result.schemaRaw.length})`}>
                                {result.schemaRaw.length > 0 ? (
                                    <div className="space-y-4">
                                        {result.schemaRaw.map((s: any, i: number) => (
                                            <div key={i} className="border border-[var(--border)] rounded-lg overflow-hidden flex flex-col">
                                                <div className="bg-[var(--surface-2)] px-3 py-1.5 font-bold text-xs uppercase tracking-wide border-b border-[var(--border)]">{s.type}</div>
                                                <div className="p-3 bg-gray-50 dark:bg-[#0d1117] text-gray-800 dark:text-gray-300 font-mono text-[10px] max-h-64 overflow-y-auto whitespace-pre overflow-x-auto">
                                                    {s.json}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-xs text-[var(--text-muted)]">No JSON-LD schema blocks found.</p>}
                            </Section>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
