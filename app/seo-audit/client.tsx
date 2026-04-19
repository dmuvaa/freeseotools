"use client";
import { useState, useRef } from "react";
import { Link as Search, Globe, FileText, Zap, Link as LinkIcon, BarChart, FileCode, CheckCircle, Tag, Package, Box, ShieldAlert, Heading, Server, ArrowRightLeft, ZapOff, Fingerprint, Activity, Network, FileMinus, FileJson, Copy, Map, Plug, Layers, CornerDownRight, Link2, Type, SearchCode, Files, FileX, Cpu, Waypoints, List, Braces, ChevronDown, ChevronUp, Download } from "lucide-react";

export default function SEOAuditClient() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState<Record<string, any>>({});
    const [exporting, setExporting] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<Record<string, 'idle' | 'loading' | 'done' | 'error'>>({
        lighthouse: 'idle',
        schema: 'idle',
        robots: 'idle',
        sitemap: 'idle',
        meta: 'idle',
        headings: 'idle',
        links: 'idle',
        headers: 'idle',
        redirect: 'idle',
        ttfb: 'idle',
        indexability: 'idle',
        javascript: 'idle',
        internalLinks: 'idle',
        thinContent: 'idle',
        jsRendering: 'idle',
        duplicateContent: 'idle',
        orphanPages: 'idle',
        thirdPartyScripts: 'idle',
        pagination: 'idle',
        canonicals: 'idle'
    });

    const runScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        
        let targetUrl = url.trim();
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
        }
        setUrl(targetUrl);
        setLoading(true);
        setReports({});
        setStatus({
            lighthouse: 'loading',
            schema: 'loading',
            robots: 'loading',
            sitemap: 'loading',
            meta: 'loading',
            headings: 'loading',
            links: 'loading',
            headers: 'loading',
            redirect: 'loading',
            ttfb: 'loading',
            indexability: 'loading',
            javascript: 'loading',
            internalLinks: 'loading',
            thinContent: 'loading',
            jsRendering: 'loading',
            duplicateContent: 'loading',
            orphanPages: 'loading',
            thirdPartyScripts: 'loading',
            pagination: 'loading',
            canonicals: 'loading'
        });

        // Fire all requests concurrently with specific payload bodies
        const fetcher = async (key: string, endpoint: string, bodyObj: any) => {
            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyObj)
                });
                
                // If it's a 500 or 404 from the server
                if (!res.ok) {
                    try {
                        const errData = await res.json();
                        setReports(prev => ({ ...prev, [key]: { error: errData.error || `Failed with status ${res.status}` } }));
                    } catch (e) {
                         setReports(prev => ({ ...prev, [key]: { error: `Network/Server Error: ${res.status}` } }));
                    }
                    setStatus(prev => ({ ...prev, [key]: 'error' }));
                    return;
                }

                const data = await res.json();
                
                // If the tool API returned success: false
                if (data.success === false) {
                    setReports(prev => ({ ...prev, [key]: { error: data.error || 'Analysis failed' } }));
                    setStatus(prev => ({ ...prev, [key]: 'error' }));
                    return;
                }

                setReports(prev => ({ ...prev, [key]: data }));
                setStatus(prev => ({ ...prev, [key]: 'done' }));
            } catch (err: any) {
                setReports(prev => ({ ...prev, [key]: { error: err.message || 'Execution failed entirely' } }));
                setStatus(prev => ({ ...prev, [key]: 'error' }));
            }
        };

        const sitemapUrl = targetUrl.endsWith('/') ? targetUrl + 'sitemap.xml' : targetUrl + '/sitemap.xml';

        const indexDomainMatch = targetUrl.match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i);
        const indexDomain = indexDomainMatch ? indexDomainMatch[1] : targetUrl;

        await Promise.allSettled([
            fetcher('lighthouse', '/api/tools/lighthouse', { url: targetUrl }),
            fetcher('schema', '/api/tools/schema-coverage', { url: targetUrl }),
            fetcher('robots', '/api/tools/robots-txt', { domain: targetUrl }),
            fetcher('sitemap', '/api/tools/sitemap', { url: sitemapUrl }),
            fetcher('meta', '/api/tools/meta-tags', { url: targetUrl }),
            fetcher('headings', '/api/tools/headings', { url: targetUrl }),
            fetcher('links', '/api/tools/broken-links', { url: targetUrl }),
            fetcher('headers', '/api/tools/http-headers', { url: targetUrl }),
            fetcher('redirect', '/api/tools/redirect', { url: targetUrl }),
            fetcher('ttfb', '/api/tools/ttfb-checker', { url: targetUrl }),
            fetcher('indexability', '/api/tools/indexability', { urls: [targetUrl], domain: indexDomain }),
            fetcher('javascript', '/api/tools/js-bundle-analyzer', { url: targetUrl }),
            fetcher('internalLinks', '/api/tools/internal-link-audit', { domain: indexDomain, limit: 15 }),
            fetcher('thinContent', '/api/tools/thin-content', { url: targetUrl }),
            fetcher('jsRendering', '/api/tools/js-seo-diff', { url: targetUrl }),
            fetcher('duplicateContent', '/api/tools/duplicate-content', { url: targetUrl }),
            fetcher('orphanPages', '/api/tools/orphan-pages', { url: targetUrl }),
            fetcher('thirdPartyScripts', '/api/tools/third-party-scripts', { url: targetUrl }),
            fetcher('pagination', '/api/tools/pagination-analyzer', { url: targetUrl }),
            fetcher('canonicals', '/api/tools/canonical-conflicts', { url: targetUrl })
        ]);

        setLoading(false);
    };

    const hasAnyResults = Object.keys(reports).length > 0;

    const [exportError, setExportError] = useState<string | null>(null);

    const exportPDF = async () => {
        setExporting(true);
        setExportError(null);

        // Build a branded filename: "SEO-Report_example.com_2026-04-19_16-51"
        const domain = url.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0] || 'site';
        const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16); // e.g. 2026-04-19T16-51
        const pdfTitle = `SEO-Report_${domain}_${ts}`;

        // Browsers use document.title as the default "Save as PDF" filename
        const originalTitle = document.title;
        document.title = pdfTitle;

        try {
            // Native browser print engine — produces ~1MB vector PDFs
            // with selectable text and proper page breaks instead of 44MB raster images.
            window.print();
        } catch (err: any) {
            console.error('PDF export failed:', err);
            setExportError(`PDF export failed: ${err?.message || 'Unknown error'}. Try using your browser's Print → Save as PDF.`);
        } finally {
            // Restore original page title after the print dialog opens
            document.title = originalTitle;
            setExporting(false);
        }
    };

    const StatusBadge = ({ state }: { state: string }) => {
        if (state === 'idle') return <span className="px-2 py-1 text-[10px] uppercase font-bold text-[var(--text-muted)] bg-[var(--surface-2)] rounded">Idle</span>;
        if (state === 'loading') return <span className="px-2 py-1 text-[10px] uppercase font-bold text-blue-600 bg-blue-500/10 border border-blue-500/20 rounded animate-pulse">Scanning</span>;
        if (state === 'done') return <span className="px-2 py-1 text-[10px] uppercase font-bold text-green-600 bg-green-500/10 border border-green-500/20 rounded">Done</span>;
        return <span className="px-2 py-1 text-[10px] uppercase font-bold text-red-600 bg-red-500/10 border border-red-500/20 rounded">Failed</span>;
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 min-h-screen bg-[var(--background)] print:p-0 print:bg-white text-[var(--foreground)] print:text-black">
            {/* Header / Input (Hidden when printing) */}
            <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-3xl p-6 md:p-12 print:hidden shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold mb-6 tracking-wide shadow-sm ring-1 ring-[var(--primary)]/20">✦ Massive SEO Fan-Out</div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Unified Technical Audit</h1>
                    <p className="text-[var(--text-muted)] text-base md:text-lg max-w-3xl mb-10 leading-relaxed font-medium">Runs 12 heavy-duty technical SEO tools concurrently across Lighthouse, Indexability, TTFB, Scripts, and more. Generates a masterful document ready for premium PDF export.</p>
                    <form onSubmit={runScan} className="flex flex-col md:flex-row gap-4 max-w-4xl">
                        <input 
                            type="url" 
                            value={url} 
                            onChange={e => setUrl(e.target.value)} 
                            required 
                            placeholder="https://example.com"
                            className="flex-1 rounded-2xl border-2 border-[var(--border)] bg-[var(--background)] px-6 py-5 text-base md:text-lg outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition shadow-inner font-medium" 
                        />
                        <button type="submit" disabled={loading} className="rounded-2xl px-10 py-5 font-black text-lg text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-wait transition shadow-lg flex items-center justify-center gap-3">
                            {loading ? <span className="size-5 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : "Run Massive Audit →"}
                        </button>
                    </form>

                    {/* Status Tracker */}
                    {(loading || hasAnyResults) && (
                        <div className="mt-12 pt-8 border-t border-[var(--border)]">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">Operations Center (12 Tools)</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {Object.entries(status).map(([key, state]) => (
                                    <div key={key} className="flex flex-col gap-1.5 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-sm">
                                        <span className="text-[10px] font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider">{key}</span>
                                        <div className="flex justify-between items-center"><StatusBadge state={state} /> {state === 'done' && <CheckCircle className="size-3 text-green-500" />}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Output Canvas */}
            {hasAnyResults && (
                <div className="relative mt-8">
                    {/* Sticky Action Bar */}
                    <div className="sticky top-6 z-50 flex flex-col items-end print:hidden mb-12 pointer-events-none gap-3">
                        <button 
                            onClick={exportPDF}
                            disabled={exporting}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-full font-black text-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform flex items-center gap-3 ring-8 ring-[var(--background)] pointer-events-auto disabled:opacity-60 disabled:cursor-wait"
                        >
                            {exporting ? <><span className="size-5 border-4 border-current/30 border-t-current rounded-full animate-spin" /> Generating PDF...</> : <><Download className="size-6" /> Export Professional PDF</>}
                        </button>
                        {exportError && (
                            <div onClick={() => setExportError(null)} className="pointer-events-auto bg-red-500 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg cursor-pointer max-w-md animate-pulse">
                                {exportError}
                            </div>
                        )}
                    </div>

                    {/* Highly polished A4 Canvas document layout — ALWAYS light mode for paper output */}
                    <div ref={reportRef} style={{
                        '--background': '#fdfdfd',
                        '--foreground': '#0f172a',
                        '--primary': '#059669',
                        '--primary-hover': '#047857',
                        '--primary-muted': 'rgba(5, 150, 105, 0.1)',
                        '--accent': '#4f46e5',
                        '--accent-muted': 'rgba(79, 70, 229, 0.1)',
                        '--surface-1': '#ffffff',
                        '--surface-2': '#f8fafc',
                        '--surface-3': '#f1f5f9',
                        '--border': '#e2e8f0',
                        '--border-hover': '#cbd5e1',
                        '--text-muted': '#475569',
                        '--text-subtle': '#64748b',
                        '--success': '#10b981',
                        '--warning': '#f59e0b',
                        '--error': '#ef4444',
                    } as React.CSSProperties} className="bg-white text-slate-900 print:bg-transparent shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-slate-200 rounded-3xl print:rounded-none p-6 md:p-12 lg:p-20 space-y-16 print:space-y-12 print:p-0 mx-auto max-w-[1000px]">
                        
                        {/* Report Header (Visible as document header) */}
                        <div className="border-b-4 border-slate-900 pb-10 mb-16 mt-4">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">✦ Technical SEO Master Report</h1>
                            <p className="text-lg md:text-xl text-slate-600 font-bold mb-2">Target URL: <a href={url} className="text-blue-600 hover:underline">{url}</a></p>
                            <p className="text-xs md:text-sm text-slate-400 font-bold tracking-widest uppercase">Fully Automated AI Audit • Generated {new Date().toLocaleDateString()}</p>
                        </div>

                    {/* 1. LIGHTHOUSE AUDIT */}
                    {reports.lighthouse && (
                        <div className="print:break-inside-avoid print:px-8">
                            <h2 className="text-3xl font-black border-b-2 border-[var(--border)] print:border-slate-300 pb-4 mb-8 flex items-center gap-3">
                                <Zap className="size-8 text-emerald-500" />
                                Google Lighthouse Core Audit
                            </h2>
                            {reports.lighthouse.error ? (
                                <p className="text-red-500 font-bold p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-8">{reports.lighthouse.error}</p>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {Object.entries({
                                    Performance: reports.lighthouse.scores?.performance,
                                    Accessibility: reports.lighthouse.scores?.accessibility,
                                    'Best Practices': reports.lighthouse.scores?.['best-practices'],
                                    SEO: reports.lighthouse.scores?.seo
                                }).map(([key, rawScore]: any) => {
                                    const score = rawScore || 0;
                                    const  color = score >= 90 ? 'text-green-500' : score >= 50 ? 'text-amber-500' : 'text-red-500';
                                    return (
                                        <div key={key} className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white text-center flex flex-col justify-center shadow-sm">
                                            <p className={`text-6xl font-black ${color} mb-2 tracking-tighter`}>{score}</p>
                                            <p className="text-xs uppercase font-bold tracking-widest text-[var(--text-muted)] print:text-slate-500">{key}</p>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="grid lg:grid-cols-2 gap-8">
                                {reports.lighthouse.vitals && (
                                    <div className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm">
                                        <h3 className="font-black text-xl mb-6 text-[var(--foreground)] print:text-black">Core Web Vitals</h3>
                                        <ul className="space-y-5">
                                            {Object.entries(reports.lighthouse.vitals).map(([k, v]: any) => (
                                                <li key={k} className="flex items-start justify-between border-b border-[var(--border)] print:border-slate-100 pb-4 last:border-0 last:pb-0">
                                                    <div className="pr-4">
                                                        <p className="font-bold text-base text-[var(--foreground)] print:text-slate-900">{v.label}</p>
                                                        <p className="text-[11px] text-[var(--text-muted)] print:text-slate-500 leading-tight mt-1 max-w-[90%]">{v.description}</p>
                                                    </div>
                                                    <span className={`font-mono font-black text-base bg-[var(--background)] print:bg-slate-50 px-3 py-1.5 rounded-lg border border-[var(--border)] print:border-slate-200 ml-4 whitespace-nowrap ${(v.score ?? 1) < 0.9 ? 'text-amber-600' : 'text-green-600'}`}>{v.value}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {reports.lighthouse.opportunities?.length > 0 && (
                                    <div className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm">
                                        <h3 className="font-black text-xl mb-6 text-amber-600 flex items-center gap-2"><ZapOff className="size-5" /> Major Opportunities</h3>
                                        <ul className="space-y-4">
                                            {reports.lighthouse.opportunities.slice(0, 6).map((opp: any, i: number) => (
                                                <li key={i} className="text-sm border-l-2 border-amber-500 pl-4 py-1">
                                                    <p className="font-bold text-[var(--foreground)] print:text-slate-800 leading-snug text-base">{opp.title}</p>
                                                    {opp.savings && <p className="text-xs text-amber-600 font-bold mt-1.5 inline-flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded">⚡ {opp.savings}</p>}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* 2. INDEXABILITY & DIRECTIVES (Combined robots, indexability) */}
                    {(reports.indexability || reports.robots) && (
                        <div className="print:block print:px-8" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-3xl font-black border-b-2 border-[var(--border)] print:border-slate-300 pb-4 mb-8 flex items-center gap-3 mt-12">
                                <ShieldAlert className="size-8 text-blue-500" />
                                Robots & Indexability Core
                            </h2>
                            <div className="grid lg:grid-cols-2 gap-8">
                                {reports.indexability && (
                                    <div className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm">
                                        <h3 className="font-black text-xl mb-6 flex items-center gap-2"><Globe className="size-5 text-blue-500"/> Page Level Index Status</h3>
                                        {reports.indexability.error ? (
                                            <p className="text-red-500 font-bold p-4 bg-red-500/10 border border-red-500/30 rounded-xl">{reports.indexability.error}</p>
                                        ) : reports.indexability.summary ? (
                                            <>
                                                <div className="grid grid-cols-2 gap-4 mb-6">
                                                    <div className="bg-green-500/10 print:bg-green-50 border border-green-500/20 p-4 rounded-xl text-center">
                                                        <p className="text-3xl font-black text-green-600">{reports.indexability.summary.indexable}</p>
                                                        <p className="text-xs font-bold uppercase tracking-widest text-green-700 mt-1">Indexable</p>
                                                    </div>
                                                    <div className="bg-amber-500/10 print:bg-amber-50 border border-amber-500/20 p-4 rounded-xl text-center">
                                                        <p className="text-3xl font-black text-amber-600">{reports.indexability.summary.noindex}</p>
                                                        <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mt-1">NoIndex</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-sm font-medium">
                                                    <p className="flex justify-between items-center p-3 bg-[var(--background)] print:bg-slate-50 rounded-lg"><span>Robots.txt Blocked</span> <span className="font-bold">{reports.indexability.summary.blocked}</span></p>
                                                    <p className="flex justify-between items-center p-3 bg-[var(--background)] print:bg-slate-50 rounded-lg"><span>Redirected</span> <span className="font-bold">{reports.indexability.summary.redirected}</span></p>
                                                    <p className="flex justify-between items-center p-3 bg-[var(--background)] print:bg-slate-50 rounded-lg"><span>HTTP Errors Detected</span> <span className="font-bold text-red-500">{reports.indexability.summary.errors}</span></p>
                                                </div>
                                            </>
                                        ) : null}
                                    </div>
                                )}
                                
                                {reports.robots && (
                                    <div className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm flex flex-col">
                                        <h3 className="font-black text-xl mb-6 flex items-center gap-2"><Server className="size-5 text-slate-500"/> Domain Robots.txt</h3>
                                        {reports.robots.error ? (
                                            <p className="text-red-500 font-bold p-4 bg-red-500/10 border border-red-500/30 rounded-xl">{reports.robots.error}</p>
                                        ) : (
                                            <>
                                                <ul className="space-y-4 mb-6">
                                                    {reports.robots.status && <li className="flex items-center gap-3 text-sm font-bold"><CheckCircle className="size-5 text-green-500" /> Fetched (HTTP {reports.robots.status})</li>}
                                                    {reports.robots.sitemaps && reports.robots.sitemaps.length > 0 ? (
                                                        <li className="flex items-center gap-3 text-sm font-bold"><CheckCircle className="size-5 text-green-500" /> Declared {reports.robots.sitemaps.length} Sitemap(s)</li>
                                                    ) : (
                                                        <li className="flex items-center gap-3 text-sm font-bold text-amber-600"><ShieldAlert className="size-5 text-amber-500" /> No Sitemap designated</li>
                                                    )}
                                                </ul>
                                                <div className="flex-1 min-h-[150px] bg-slate-100 print:bg-slate-50 print:border print:border-slate-200 p-4 rounded-xl overflow-visible relative group">
                                                    <span className="absolute top-2 right-3 text-[10px] uppercase font-bold text-slate-700 bg-slate-200 print:bg-slate-200 px-2 py-1 rounded">Raw Content</span>
                                                    <pre className="font-mono text-xs text-green-700 print:text-slate-800 leading-relaxed overflow-visible whitespace-pre-wrap break-all h-full w-full">
                                                        {reports.robots.content || "Empty or Unreachable (404)"}
                                                    </pre>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 3. HTTP HEADERS & TTFB (Performance & Security) */}
                    {(reports.headers || reports.ttfb) && (
                        <div className="print:block print:px-8" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-3xl font-black border-b-2 border-[var(--border)] print:border-slate-300 pb-4 mb-8 flex items-center gap-3 mt-12">
                                <Activity className="size-8 text-cyan-500" />
                                Host & Network Profile
                            </h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                {reports.ttfb && (
                                    <div className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm flex flex-col">
                                         <h3 className="font-black text-xl mb-6 text-[var(--foreground)] print:text-black">Latency & Server</h3>
                                         {reports.ttfb.error ? (
                                              <p className="text-red-500 font-bold p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-8">{reports.ttfb.error}</p>
                                         ) : (
                                              <>
                                                 <div className="flex gap-4 items-center mb-8">
                                            <div className={`flex-1 p-5 rounded-2xl border ${reports.ttfb.ttfb?.rating === 'good' ? 'bg-green-500/10 border-green-500/20 text-green-600' : reports.ttfb.ttfb?.rating === 'poor' ? 'bg-red-500/10 border-red-500/20 text-red-600' : 'bg-amber-500/10 border-amber-500/20 text-amber-600'} text-center`}>
                                                <p className="text-5xl font-black mb-1">{reports.ttfb.ttfb?.min || 0}<span className="text-xl">ms</span></p>
                                                <p className="text-xs font-bold uppercase tracking-widest">TTFB (Min)</p>
                                            </div>
                                            <div className="flex-1 p-5 rounded-2xl border border-[var(--border)] print:border-slate-200 bg-[var(--background)] print:bg-slate-50 text-center">
                                                <p className="text-5xl font-black mb-1 text-[var(--foreground)] print:text-slate-900">{reports.ttfb.ttfb?.avg || 0}<span className="text-xl">ms</span></p>
                                                <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] print:text-slate-500">TTFB (Avg)</p>
                                            </div>
                                         </div>
                                         <div className="bg-[var(--background)] print:bg-slate-50 rounded-xl border border-[var(--border)] print:border-slate-200 p-4 space-y-3">
                                            <p className="flex justify-between text-sm"><span className="font-semibold text-[var(--text-muted)] print:text-slate-600">CDN Infrastructure:</span> <span className="font-bold">{reports.ttfb.server?.cdn || "None Detected"}</span></p>
                                            <p className="flex justify-between text-sm"><span className="font-semibold text-[var(--text-muted)] print:text-slate-600">Cache Status:</span> <span className="font-bold font-mono text-xs bg-[var(--surface-2)] print:bg-white px-2 py-0.5 rounded">{reports.ttfb.server?.cacheStatus}</span></p>
                                            <p className="flex justify-between text-sm"><span className="font-semibold text-[var(--text-muted)] print:text-slate-600">Server Software:</span> <span className="font-bold font-mono text-xs">{reports.ttfb.server?.software}</span></p>
                                         </div>
                                              </>
                                         )}
                                    </div>
                                )}

                                {reports.headers && (
                                     <div className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm flex flex-col">
                                        <h3 className="font-black text-xl mb-6 text-[var(--foreground)] print:text-black">Security Headers Status</h3>
                                        <ul className="space-y-3 pr-2 flex-1">
                                            {reports.headers.securityHeaders?.map((h: any, i: number) => (
                                                <li key={i} className="flex p-3 bg-[var(--background)] print:bg-slate-50 rounded-lg border border-[var(--border)] print:border-slate-100 gap-3">
                                                    <div>{h.present ? <CheckCircle className="size-5 text-green-500 shrink-0" /> : <ShieldAlert className="size-5 text-red-500 shrink-0" />}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm text-[var(--foreground)] print:text-slate-800 break-words">{h.name}</p>
                                                        {h.present ? (
                                                            <p className="font-mono text-[10px] text-[var(--primary)] mt-1 break-all bg-[var(--primary)]/5 p-1 rounded inline-block">{h.value}</p>
                                                        ) : (
                                                            <p className="text-[10px] text-[var(--text-muted)] mt-1">Missing</p>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                     </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 4. REDIRECT TRACE (SEO Architecture) */}
                    {reports.redirect && (
                        <div className="print:block print:px-8" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-3xl font-black border-b-2 border-[var(--border)] print:border-slate-300 pb-4 mb-8 flex items-center gap-3 mt-12">
                                <ArrowRightLeft className="size-8 text-fuchsia-500" />
                                URL Redirect Chain Analysis
                            </h2>
                            <div className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm overflow-hidden">
                                {reports.redirect.chain?.length > 1 ? (
                                    <div>
                                        {reports.redirect.loopDetected && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-600 font-bold rounded-xl flex items-center gap-2">⚠️ Redirect Loop Detected!</div>}
                                        <div className="relative pl-6 border-l-2 border-fuchsia-500/30 ml-4 space-y-8">
                                            {reports.redirect.chain.map((hop: any, i: number) => {
                                                const isLast = i === reports.redirect.chain.length - 1;
                                                const isErr = hop.status >= 400;
                                                return (
                                                    <div key={i} className="relative">
                                                        <span className="absolute -left-[35px] top-1 size-4 rounded-full bg-fuchsia-100 border-4 border-fuchsia-500 print:bg-white" />
                                                        <div className="bg-[var(--background)] print:bg-slate-50 p-4 border border-[var(--border)] print:border-slate-200 rounded-xl shadow-sm hover:-translate-y-1 transition duration-300">
                                                            <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                                                                <span className="font-mono font-bold text-sm text-[var(--primary)] break-all">{hop.url}</span>
                                                                <span className={`font-black text-sm px-2 py-0.5 rounded ${isLast ? (isErr ? 'bg-red-500 text-white' : 'bg-green-500 text-white') : 'bg-fuchsia-500/20 text-fuchsia-600'}`}>
                                                                    HTTP {hop.status}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-[var(--text-muted)] print:text-slate-500 uppercase tracking-widest">Time spent: {hop.timeMs}ms</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : reports.redirect.chain?.length === 1 ? (
                                    <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-700 font-bold flex items-center gap-3 text-lg"><CheckCircle className="size-6" /> No redirects. The target URL responds with a direct 200 OK. Excellent for SEO.</div>
                                ) : (
                                    <p className="text-sm font-medium text-[var(--text-muted)] italic">Trace unavailable.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 5. JAVASCRIPT BUNDLE & RENDER BLOCKERS */}
                    {reports.javascript && (
                        <div className="print:block print:px-8" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-3xl font-black border-b-2 border-[var(--border)] print:border-slate-300 pb-4 mb-8 flex items-center gap-3 mt-12">
                                <FileCode className="size-8 text-yellow-500" />
                                JavaScript Execution Analysis
                            </h2>
                            <div className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm overflow-hidden">
                                {reports.javascript.summary && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        <div className="bg-[var(--background)] print:bg-slate-50 border border-[var(--border)] print:border-slate-100 p-4 rounded-2xl text-center">
                                            <p className="text-3xl font-black mb-1">{reports.javascript.summary.totalScripts}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] print:text-slate-500">Total Scripts</p>
                                        </div>
                                        <div className="bg-[var(--background)] print:bg-slate-50 border border-[var(--border)] print:border-slate-100 p-4 rounded-2xl text-center">
                                            <p className="text-3xl font-black mb-1 text-yellow-600">{reports.javascript.summary.totalSizeKb}kb</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] print:text-slate-500">Total Payload</p>
                                        </div>
                                        <div className="bg-[var(--background)] print:bg-slate-50 border border-[var(--border)] print:border-slate-100 p-4 rounded-2xl text-center">
                                            <p className={`text-3xl font-black mb-1 ${reports.javascript.summary.blockingCount > 0 ? "text-red-500" : "text-green-500"}`}>{reports.javascript.summary.blockingCount}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] print:text-slate-500">Render Blocking</p>
                                        </div>
                                        <div className="bg-[var(--background)] print:bg-slate-50 border border-[var(--border)] print:border-slate-100 p-4 rounded-2xl text-center">
                                            <p className="text-3xl font-black mb-1 text-fuchsia-500">{reports.javascript.summary.thirdPartyCount}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] print:text-slate-500">3rd Party Scrips</p>
                                        </div>
                                    </div>
                                )}

                                {reports.javascript.scripts?.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-sm uppercase tracking-widest text-[var(--text-muted)] print:text-slate-600 mb-4 ml-1">Largest JavaScript Payloads</h3>
                                        <div className="border border-[var(--border)] print:border-slate-200 rounded-xl overflow-hidden">
                                            <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
                                                <thead className="bg-[var(--surface-2)] print:bg-slate-100/50">
                                                    <tr>
                                                        <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] print:text-slate-600">Script URL</th>
                                                        <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] print:text-slate-600 w-24 text-right">Size</th>
                                                        <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] print:text-slate-600 w-24 text-center">Blocking</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[var(--border)] print:divide-slate-200 font-medium">
                                                    {reports.javascript.scripts.slice(0, 10).map((s: any, i: number) => (
                                                        <tr key={i} className="hover:bg-[var(--surface-2)]/50 print:hover:bg-transparent">
                                                            <td className="px-4 py-3 align-middle font-mono text-[11px] text-[var(--primary)] truncate max-w-[200px] md:max-w-md">{s.url}</td>
                                                            <td className="px-4 py-3 align-middle text-right">{s.sizeKb}kb</td>
                                                            <td className="px-4 py-3 align-middle text-center">{s.isBlocking ? <span className="bg-red-500/10 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Yes</span> : <span className="text-gray-400">—</span>}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                    {/* 6. EXTENDED DATA: Schema, Meta Tags, Headings, Links (restructured large prints) */}
                    
                    {reports.schema && (
                        <div className="print:block print:px-8" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-3xl font-black border-b-2 border-[var(--border)] print:border-slate-300 pb-4 mb-8 flex items-center gap-3 mt-12">
                                <Fingerprint className="size-8 text-blue-500" />
                                On-Page Structured Data
                            </h2>
                            <div className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm">
                                {reports.schema.error ? (
                                    <p className="text-red-500 font-bold p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-4">{reports.schema.error}</p>
                                ) : reports.schema.schemaTypeDistribution && Object.keys(reports.schema.schemaTypeDistribution).length > 0 ? (
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="font-bold mb-4 text-[var(--foreground)] print:text-black">Detected Schema Entities</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.entries(reports.schema.schemaTypeDistribution).map(([type, count]) => (
                                                    <span key={type} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold border border-blue-200 shadow-sm print:border print:border-blue-300 print:text-blue-600 print:bg-blue-50">{type} <span className="opacity-60 ml-2 border-l border-blue-300 pl-2">Count {count as number}</span></span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold mb-4 text-[var(--foreground)] print:text-black">Validation Confidence</h3>
                                            <ul className="space-y-3 text-sm">
                                                <li className="flex justify-between p-3 bg-[var(--background)] print:bg-slate-50 rounded-xl font-medium"><span>Coverage Ratio</span> <span className="font-black text-blue-600">{Math.round((reports.schema.pagesWithSchema / reports.schema.pagesCrawled) * 100)}%</span></li>
                                                <li className="flex justify-between p-3 bg-[var(--background)] print:bg-slate-50 rounded-xl font-medium"><span>Pages Evaluated</span> <span className="font-black">{reports.schema.pagesCrawled}</span></li>
                                                <li className="flex justify-between p-3 bg-[var(--background)] print:bg-slate-50 rounded-xl font-medium"><span>Parse Errors Found</span> <span className={reports.schema.pagesWithErrors > 0 ? "font-black text-red-600" : "font-black text-green-600"}>{reports.schema.pagesWithErrors}</span></li>
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-amber-600 italic font-medium p-4 bg-amber-50 rounded-xl border border-amber-500/30">No Schema.org structured data detected. Implementing Breadcrumb, Organization, or Article schema is critical for advanced rich snippets.</p>
                                )}

                                {!reports.schema.error && reports.schema.pages && reports.schema.pages.length > 0 && (
                                    <div className="mt-8 border border-[var(--border)] print:border-slate-200 rounded-2xl bg-[var(--surface-2)] print:bg-slate-50 overflow-hidden shadow-inner">
                                        <div className="p-4 border-b border-[var(--border)] print:border-slate-200 bg-[var(--background)] print:bg-white text-sm font-black uppercase tracking-widest text-[var(--primary)] flex items-center gap-2">
                                            <Braces className="size-4" /> Detected JSON-LD Entities (Target URL)
                                        </div>
                                        <div className="divide-y divide-[var(--border)] print:divide-slate-200">
                                            {reports.schema.pages.slice(0, 1).map((p: any, idx: number) => (
                                                <div key={idx} className="p-6">
                                                    <div className="font-bold text-sm mb-4 flex items-center justify-between flex-wrap gap-2">
                                                        <a href={p.url} className="text-[var(--primary)] hover:text-blue-600 truncate max-w-[70%] text-base">{p.url}</a>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {p.schemaTypes.map((t: string) => <span key={t} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 text-[10px] font-black tracking-wide border border-indigo-500/20">{t}</span>)}
                                                        </div>
                                                    </div>
                                                    {p.errors && p.errors.length > 0 && (
                                                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs font-mono font-bold">
                                                            Errors: {p.errors.join(", ")}
                                                        </div>
                                                    )}
                                                    {p.jsonLd && p.jsonLd.length > 0 ? (
                                                        <div className="space-y-4">
                                                            {p.jsonLd.map((ld: string, jIdx: number) => (
                                                                <div key={jIdx} className="bg-slate-100 print:bg-white text-emerald-700 print:text-emerald-700 p-4 rounded-xl text-[11px] overflow-visible whitespace-pre-wrap break-all font-mono border border-slate-200 print:border-slate-200 shadow-inner">
                                                                    <pre>{(() => {
                                                                        try {
                                                                            return JSON.stringify(JSON.parse(ld), null, 2);
                                                                        } catch (e) {
                                                                            try {
                                                                                const sanitized = ld.replace(/[\u0000-\u001F]+/g, " ");
                                                                                return JSON.stringify(JSON.parse(sanitized), null, 2);
                                                                            } catch (err) {
                                                                                return ld;
                                                                            }
                                                                        }
                                                                    })()}</pre>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-[var(--text-muted)] italic p-2 bg-[var(--background)] rounded font-medium border border-[var(--border)]">No valid JSON-LD objects detected.</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {reports.headings && (
                        <div className="print:block print:px-8" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-3xl font-black border-b-2 border-[var(--border)] print:border-slate-300 pb-4 mb-8 flex items-center gap-3 mt-12">
                                <Heading className="size-8 text-pink-500" />
                                Content Hierarchy
                            </h2>
                            {reports.headings.error ? (
                                <p className="text-red-500 font-bold p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-8">{reports.headings.error}</p>
                            ) : (
                                <>
                                    <div className="grid md:grid-cols-3 gap-8">
                                <div className="md:col-span-1 p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm h-fit">
                                    <h3 className="font-bold text-sm text-[var(--text-muted)] print:text-slate-500 uppercase tracking-widest mb-4">Tag Distribution</h3>
                                    {reports.headings.counts && (
                                        <div className="space-y-2">
                                            {[1,2,3,4,5,6].map(level => {
                                                const count = reports.headings.counts[level];
                                                if (count === 0 && level > 3) return null;
                                                return (
                                                    <div key={level} className="flex items-center justify-between bg-[var(--background)] print:bg-slate-50 p-3 rounded-xl border border-transparent print:border-slate-100">
                                                        <span className="font-bold text-[var(--foreground)] print:text-slate-800">Heading {level}</span>
                                                        <span className={`font-mono font-black ${level === 1 && count > 1 ? 'text-red-500' : level === 1 && count === 0 ? 'text-amber-500' : 'text-slate-600'}`}>{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {reports.headings.warnings?.length > 0 && (
                                        <div className="mt-8">
                                            <h4 className="font-bold text-xs text-amber-600 font-mono mb-3 uppercase tracking-wider">Semantic Warnings</h4>
                                            <ul className="space-y-2 text-xs text-[var(--foreground)] print:text-slate-700 font-medium">
                                                {reports.headings.warnings.map((w: string, i: number) => (
                                                    <li key={i} className="flex gap-2 items-start bg-amber-500/10 p-2 rounded text-amber-900"><span className="text-amber-500 shrink-0 font-bold">!</span> {w}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-2 p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm min-h-[400px]">
                                    <h3 className="font-black text-xl text-[var(--foreground)] print:text-slate-900 mb-6 flex items-center gap-2"><FileText className="size-5" /> Document Outline</h3>
                                    {reports.headings.headings?.length > 0 ? (
                                        <ul className="space-y-2 text-sm font-medium">
                                            {reports.headings.headings.map((h: any, i: number) => (
                                                <li key={i} className="flex items-start gap-4 border-b border-[var(--border)]/50 print:border-slate-100 pb-2 last:border-0 hover:bg-[var(--surface-2)] print:hover:bg-transparent transition rounded px-1">
                                                    <span className={`font-black w-7 shrink-0 font-mono text-xs mt-0.5 ${h.level === 1 ? "text-[var(--primary)] text-sm" : "text-[var(--text-muted)] print:text-slate-400"}`}>H{h.level}</span>
                                                    <span className={`break-words ${h.level === 1 ? 'font-black text-lg' : ''}`} style={{ marginLeft: `${(h.level - 1) * 16}px` }}>{h.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm font-medium text-[var(--text-muted)] italic">No headings found on this page.</p>
                                    )}
                                </div>
                            </div>
                                </>
                            )}
                        </div>
                    )}

                    {reports.meta && (
                        <div className="print:block print:px-8" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-3xl font-black border-b-2 border-[var(--border)] print:border-slate-300 pb-4 mb-8 flex items-center gap-3 mt-12">
                                <Globe className="size-8 text-indigo-500" />
                                Meta Tags & Social Data
                            </h2>
                            {reports.meta.error ? (
                                <p className="text-red-500 font-bold p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-8">{reports.meta.error}</p>
                            ) : (
                                <>
                                    <div className="bg-[var(--surface-1)] print:bg-white rounded-3xl border border-[var(--border)] print:border-slate-200 overflow-hidden shadow-sm p-4">
                                        <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
                                    <thead className="bg-[var(--surface-2)] print:bg-slate-50">
                                        <tr><th className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-[var(--text-muted)] print:text-slate-500 w-1/4 max-w-xs rounded-tl-xl rounded-bl-xl">Property</th><th className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-[var(--text-muted)] print:text-slate-500 rounded-tr-xl rounded-br-xl">Content Value</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)] print:divide-slate-200">
                                        {reports.meta.tags?.length > 0 ? reports.meta.tags.map((t: any, i: number) => {
                                            const isWarn = t.status === "warn" || t.status === "error";
                                            return (
                                                <tr key={i} className={`print:hover:bg-transparent transition ${isWarn ? "bg-amber-500/5 hover:bg-amber-500/10" : "hover:bg-[var(--surface-2)]/50"}`}>
                                                    <td className="px-6 py-5 font-mono font-bold text-indigo-600 break-words max-w-[150px] align-top">
                                                        {t.tagName}
                                                        {isWarn && <span className="block mt-2 text-[11px] text-amber-600 font-sans font-semibold bg-amber-500/10 p-1.5 rounded">{t.message}</span>}
                                                    </td>
                                                    <td className="px-6 py-5 font-semibold text-[var(--foreground)] print:text-slate-800 break-words align-top leading-relaxed">{t.value || <em className="text-gray-400 font-normal">empty</em>}</td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr><td colSpan={2} className="px-6 py-12 text-center text-gray-500 font-medium">No valid meta tags found or payload format unsupported.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                                </>
                            )}
                        </div>
                    )}


                    {/* 7. SITEMAP */}
                    {reports.sitemap && (
                        <div className="print:block print:px-8" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-3xl font-black border-b-2 border-[var(--border)] print:border-slate-300 pb-4 mb-8 flex items-center gap-3 mt-12">
                                <LinkIcon className="size-8 text-indigo-400" />
                                XML Sitemap Core Analysis
                            </h2>
                            <div className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm overflow-hidden">
                                {reports.sitemap.error ? (
                                    <p className="text-red-500 font-bold p-4 bg-red-500/10 border border-red-500/30 rounded-xl">{reports.sitemap.error}</p>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-12">
                                        <div>
                                            <h3 className="font-bold text-sm text-[var(--text-muted)] print:text-slate-500 uppercase tracking-widest mb-4">Sitemap Discovery URI</h3>
                                            <div className="bg-[var(--background)] print:bg-slate-50 p-4 border border-[var(--border)] print:border-slate-200 rounded-xl">
                                                <p className="text-xl font-mono text-[var(--primary)] break-all truncate">{reports.sitemap.url}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-[var(--text-muted)] print:text-slate-500 uppercase tracking-widest mb-4">Health & Integrity Metrics</h3>
                                            <ul className="space-y-3 text-base font-semibold">
                                                <li className="flex justify-between p-3 bg-[var(--background)] print:bg-slate-50 border border-transparent print:border-slate-100 rounded-xl">
                                                    <span>URLs Discovered</span> 
                                                    <span className="font-black text-xl">{reports.sitemap.summary?.total || 0}</span>
                                                </li>
                                                <li className="flex justify-between p-3 bg-[var(--background)] print:bg-slate-50 border border-transparent print:border-slate-100 rounded-xl">
                                                    <span>Links Validated (Deep Scan)</span> 
                                                    <span className="font-black text-xl text-blue-500">{reports.sitemap.summary?.checked || 0}</span>
                                                </li>
                                                <li className="flex justify-between p-3 bg-red-500/5 print:bg-red-50 border border-red-500/20 rounded-xl">
                                                    <span className="text-red-700">Broken Links Detected</span> 
                                                    <span className={(reports.sitemap.summary?.broken || 0) > 0 ? "font-black text-xl text-red-600" : "font-black text-xl text-green-600"}>{reports.sitemap.summary?.broken || 0}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 8. BROKEN LINKS SCALED */}
                    {reports.links && (
                        <div className="print:block print:px-8" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-3xl font-black border-b-2 border-[var(--border)] print:border-slate-300 pb-4 mb-8 flex items-center gap-3 mt-12">
                                <UnlinkIcon className="size-8 text-red-500" />
                                On-Page Broken Links Scanner
                            </h2>
                            {reports.links.error ? (
                                <p className="text-red-500 font-bold p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-8">{reports.links.error}</p>
                            ) : (
                                <>
                                    <div className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm overflow-hidden">
                                        {reports.links.summary ? (
                                    <div className="flex gap-6 items-center mb-8 flex-wrap">
                                        <div className="border border-[var(--border)] p-6 rounded-2xl text-center flex-1 bg-[var(--background)] print:bg-slate-50">
                                            <p className="text-4xl font-black text-indigo-500 mb-1">{reports.links.summary.totalChecked}</p>
                                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] print:text-slate-500">Links Scanned</p>
                                        </div>
                                        <div className="border border-green-500/30 p-6 rounded-2xl text-center flex-1 bg-green-500/5 print:bg-green-50">
                                            <p className="text-4xl font-black text-green-500 mb-1">{reports.links.summary.okCount}</p>
                                            <p className="text-xs font-bold uppercase tracking-widest text-green-700">Healthy (200 OK)</p>
                                        </div>
                                        <div className="border border-red-500/30 p-6 rounded-2xl text-center flex-1 bg-red-500/10 print:bg-red-50">
                                            <p className="text-4xl font-black text-red-600 mb-1">{reports.links.summary.brokenCount}</p>
                                            <p className="text-xs font-bold uppercase tracking-widest text-red-700">Broken (404/500)</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-[var(--text-muted)] italic font-semibold">Scanning summary unavailable.</p>
                                )}

                                {reports.links.links?.length > 0 && reports.links.summary?.brokenCount > 0 ? (
                                    <div className="border border-red-500/30 print:border-red-200 rounded-xl overflow-hidden shadow-sm">
                                        <div className="bg-red-500/10 text-red-700 font-black text-sm uppercase p-4 border-b border-red-500/30 flex items-center gap-2 tracking-widest"><UnlinkIcon className="size-4" /> Broken Entities Identified</div>
                                        <ul className="divide-y divide-[var(--border)] print:divide-slate-200 bg-[var(--background)] print:bg-white">
                                            {reports.links.links.filter((l: any) => l.status === "broken").map((l: any, i: number) => (
                                                <li key={i} className="p-4 hover:bg-[var(--surface-2)] print:hover:bg-transparent flex flex-wrap gap-4 justify-between items-center text-sm transition">
                                                    <div className="flex-1 min-w-0">
                                                        <a href={l.href} target="_blank" rel="noopener noreferrer" className="font-mono text-[var(--primary)] hover:underline block truncate font-bold text-base">{l.href}</a>
                                                        <p className="text-xs text-[var(--text-muted)] mt-2 font-medium">Anchor content: <span className="px-2 py-0.5 bg-[var(--surface-2)] print:bg-slate-100 rounded break-all">"{l.text || 'Image / Empty Tag'}"</span></p>
                                                    </div>
                                                    <span className="font-black text-sm shadow-sm bg-red-600 text-white px-3 py-1.5 rounded-lg border border-red-700">HTTP {l.statusCode || "Timeout"}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                        ) : reports.links.links?.length > 0 ? (
                                             <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-700 font-bold flex items-center gap-3 text-lg justify-center"><CheckCircle className="size-6" /> All evaluated internal & external links are resolving flawlessly.</div>
                                        ) : null}
                                    </div>
                                </>
                            )}
                        </div>
                    )}



                    {/* 9. INTERNAL LINKS AUDIT */}
                    {reports.internalLinks && (
                        <div className="print:block print:px-8" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-3xl font-black border-b-2 border-[var(--border)] print:border-slate-300 pb-4 mb-8 flex items-center gap-3 mt-12">
                                <Network className="size-8 text-cyan-500" />
                                Internal Link Architecture
                            </h2>
                            {reports.internalLinks.error ? (
                                <p className="text-red-500 font-bold p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-8">{reports.internalLinks.error}</p>
                            ) : (
                                <>
                                    <div className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm overflow-hidden">
                                        {reports.internalLinks.summary && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        <div className="bg-[var(--background)] print:bg-slate-50 border border-[var(--border)] p-4 rounded-xl text-center"><p className="text-4xl font-black text-[var(--primary)] mb-1">{reports.internalLinks.summary.totalCrawled}</p><p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Pages Crawled</p></div>
                                        <div className="bg-[var(--background)] print:bg-slate-50 border border-[var(--border)] p-4 rounded-xl text-center"><p className="text-4xl font-black text-cyan-600 mb-1">{reports.internalLinks.summary.totalLinks}</p><p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Internal Links</p></div>
                                        <div className="bg-[var(--background)] print:bg-slate-50 border border-[var(--border)] p-4 rounded-xl text-center"><p className={`text-4xl font-black mb-1 ${reports.internalLinks.summary.orphanCount > 0 ? "text-red-500" : "text-green-500"}`}>{reports.internalLinks.summary.orphanCount}</p><p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Orphan Pages</p></div>
                                        <div className="bg-[var(--background)] print:bg-slate-50 border border-[var(--border)] p-4 rounded-xl text-center"><p className="text-4xl font-black text-fuchsia-500 mb-1">{reports.internalLinks.summary.avgLinksPerPage}</p><p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Avg Links/Page</p></div>
                                    </div>
                                )}
                                {reports.internalLinks.orphans?.length > 0 && (
                                    <div className="mb-8 border border-red-500/20 rounded-xl overflow-hidden shadow-sm">
                                        <div className="bg-red-500/10 text-red-600 font-bold p-3 text-sm">Orphan Pages Discovered (Zero Internal Inlinks)</div>
                                        <ul className="divide-y divide-[var(--border)]">
                                            {reports.internalLinks.orphans.map((p: any, i: number) => (
                                                <li key={i} className="p-3 text-sm font-mono truncate hover:bg-red-50/50 print:hover:bg-transparent"><a href={p.url} className="text-[var(--primary)] hover:underline">{p.url}</a></li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {reports.internalLinks.deepPages?.length > 0 && (
                                    <div className="border border-amber-500/20 rounded-xl overflow-hidden shadow-sm">
                                        <div className="bg-amber-500/5 text-amber-700 font-bold p-3 text-sm">Deep Pages (Click Depth &gt; 3) - Hard for crawlers to reach</div>
                                        <ul className="divide-y divide-[var(--border)]">
                                            {reports.internalLinks.deepPages.slice(0, 5).map((p: any, i: number) => (
                                                <li key={i} className="p-3 text-sm flex justify-between">
                                                    <a href={p.url} className="text-[var(--primary)] hover:underline font-mono truncate max-w-[80%]">{p.url}</a>
                                                    <span className="font-black text-amber-600">Depth: {p.depth}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* 10. THIN CONTENT */}
                    {reports.thinContent && (
                        <div className="print:block print:px-8" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-3xl font-black border-b-2 border-[var(--border)] print:border-slate-300 pb-4 mb-8 flex items-center gap-3 mt-12">
                                <FileMinus className="size-8 text-rose-500" />
                                Content Quality & Thin Content
                            </h2>
                            {reports.thinContent.error ? (
                                <p className="text-red-500 font-bold p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-8">{reports.thinContent.error}</p>
                            ) : (
                                <>
                                    <div className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm overflow-hidden">
                                <div className="grid md:grid-cols-2 gap-8 mb-8">
                                    <div className="flex flex-col justify-center items-center p-8 bg-[var(--background)] border border-[var(--border)] rounded-2xl">
                                        <div className="text-6xl font-black mb-2 tracking-tighter" style={{ color: reports.thinContent.score >= 70 ? '#22c55e' : reports.thinContent.score >= 45 ? '#f59e0b' : '#ef4444' }}>
                                            {reports.thinContent.score}
                                        </div>
                                        <div className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)]">Content Quality Score</div>
                                        <div className={`mt-3 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white`} style={{ backgroundColor: reports.thinContent.score >= 70 ? '#22c55e' : reports.thinContent.score >= 45 ? '#f59e0b' : '#ef4444' }}>
                                            {reports.thinContent.scoreLabel}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-[var(--background)] print:bg-slate-50 rounded-xl border border-[var(--border)]"><span className="block text-2xl font-black">{reports.thinContent.wordCount}</span><span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Words</span></div>
                                        <div className="p-4 bg-[var(--background)] print:bg-slate-50 rounded-xl border border-[var(--border)]"><span className="block text-2xl font-black">{reports.thinContent.textToHtmlRatio}%</span><span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Text/HTML Ratio</span></div>
                                        <div className="p-4 bg-[var(--background)] print:bg-slate-50 rounded-xl border border-[var(--border)]"><span className="block text-2xl font-black text-rose-500">{reports.thinContent.duplicateParagraphs}</span><span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Dupe Paragraphs</span></div>
                                        <div className="p-4 bg-[var(--background)] print:bg-slate-50 rounded-xl border border-[var(--border)]"><span className="block text-2xl font-black text-indigo-500">{reports.thinContent.wordsPerHeading}</span><span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Words/Heading</span></div>
                                    </div>
                                </div>
                                {reports.thinContent.suggestions?.length > 0 && (
                                    <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-6">
                                        <h3 className="text-amber-700 font-bold mb-3 flex items-center gap-2">⚠️ Improvement Suggestions</h3>
                                        <ul className="space-y-2">
                                            {reports.thinContent.suggestions.map((s: string, i: number) => <li key={i} className="text-sm font-medium text-amber-900 flex gap-2 w-full"><span className="shrink-0">•</span> <span>{s}</span></li>)}
                                        </ul>
                                    </div>
                                )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* 11. JS RENDERING SEO DIFF */}
                    {reports.jsRendering && (
                        <div className="print:block print:px-8" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-3xl font-black border-b-2 border-[var(--border)] print:border-slate-300 pb-4 mb-8 flex items-center gap-3 mt-12">
                                <SearchCode className="size-8 text-orange-500" />
                                JS Rendering SEO Pipeline Diff
                            </h2>
                            {reports.jsRendering.error ? (
                                <p className="text-red-500 font-bold p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-8">{reports.jsRendering.error}</p>
                            ) : reports.jsRendering.diff ? (
                                <>
                                    <div className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm overflow-hidden">
                                <p className="text-sm text-[var(--text-muted)] mb-6 font-medium">Compares Raw HTML (what Googlebot sees initially) vs Fully Rendered DOM (after JS execution).</p>
                                
                                <div className="grid md:grid-cols-3 gap-6 mb-8">
                                    <div className="p-6 bg-[var(--background)] border border-[var(--border)] rounded-2xl text-center">
                                        <p className="text-4xl font-black text-orange-500 mb-1">{reports.jsRendering.diff.missingFromRaw}</p>
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Links Added By JS</p>
                                        <p className="text-xs text-orange-600 mt-2 font-medium">Risk of not being crawled</p>
                                    </div>
                                    <div className="p-6 bg-[var(--background)] border border-[var(--border)] rounded-2xl text-center">
                                        <p className={`text-4xl font-black mb-1 ${reports.jsRendering.diff.similarity < 80 ? "text-red-500" : "text-green-500"}`}>{reports.jsRendering.diff.similarity}%</p>
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Text Similarity</p>
                                    </div>
                                    <div className="p-6 bg-[var(--background)] border border-[var(--border)] rounded-2xl">
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 text-center">SEO Tag Mutation Risk</p>
                                        <ul className="text-xs space-y-2 font-bold flex flex-col items-center">
                                            <li className="flex gap-2 items-center w-full justify-between max-w-[150px]"><span>Title Data:</span> {reports.jsRendering.diff.seoDiff?.titleMatch ? <span className="text-green-500">Match</span> : <span className="text-red-500">Mutated</span>}</li>
                                            <li className="flex gap-2 items-center w-full justify-between max-w-[150px]"><span>Meta Desc:</span> {reports.jsRendering.diff.seoDiff?.descriptionMatch ? <span className="text-green-500">Match</span> : <span className="text-red-500">Mutated</span>}</li>
                                            <li className="flex gap-2 items-center w-full justify-between max-w-[150px]"><span>Canonical:</span> {reports.jsRendering.diff.seoDiff?.canonicalMatch ? <span className="text-green-500">Match</span> : <span className="text-red-500">Mutated</span>}</li>
                                        </ul>
                                    </div>
                                </div>
                                {reports.jsRendering.diff.jsOnlyContent?.length > 0 && (
                                    <div className="border border-orange-500/20 bg-orange-500/5 rounded-xl p-6">
                                        <h3 className="text-orange-700 font-bold mb-3">Content ONLY visible after JS executes</h3>
                                        <ul className="space-y-2 text-sm">
                                            {reports.jsRendering.diff.jsOnlyContent.slice(0, 3).map((c: string, i: number) => (
                                                <li key={i} className="font-mono text-xs opacity-80 break-words line-clamp-2">"{c}"</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                    </div>
                                </>
                            ) : null}
                        </div>
                    )}

                    {/* 12. DUPLICATE CONTENT */}
                    {reports.duplicateContent && (
                        <div className="print:block print:px-8" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-3xl font-black border-b-2 border-[var(--border)] print:border-slate-300 pb-4 mb-8 flex items-center gap-3 mt-12">
                                <Files className="size-8 text-indigo-400" />
                                Cannibalization & Duplicate Content
                            </h2>
                            {reports.duplicateContent.error ? (
                                <p className="text-red-500 font-bold p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-8">{reports.duplicateContent.error}</p>
                            ) : (
                                <div className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm">
                                    {/* Summary stats */}
                                    {reports.duplicateContent.summary && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                            <div className="p-4 bg-[var(--background)] print:bg-slate-50 border border-[var(--border)] rounded-xl text-center">
                                                <p className="text-3xl font-black text-indigo-500 mb-1">{reports.duplicateContent.pagesCrawled || 0}</p>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Pages Crawled</p>
                                            </div>
                                            <div className="p-4 bg-[var(--background)] print:bg-slate-50 border border-red-500/20 rounded-xl text-center">
                                                <p className="text-3xl font-black text-red-600 mb-1">{reports.duplicateContent.summary.highSimilarity || 0}</p>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-red-600">High Overlap (≥80%)</p>
                                            </div>
                                            <div className="p-4 bg-[var(--background)] print:bg-slate-50 border border-amber-500/20 rounded-xl text-center">
                                                <p className="text-3xl font-black text-amber-600 mb-1">{reports.duplicateContent.summary.mediumSimilarity || 0}</p>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Medium Overlap</p>
                                            </div>
                                            <div className="p-4 bg-[var(--background)] print:bg-slate-50 border border-[var(--border)] rounded-xl text-center">
                                                <p className="text-3xl font-black text-[var(--primary)] mb-1">{reports.duplicateContent.summary.duplicateTitleCount || 0}</p>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Duplicate Titles</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Similar content clusters */}
                                    {reports.duplicateContent.clusters?.length > 0 ? (
                                        <div className="space-y-4 mb-8">
                                            <h3 className="font-bold text-sm uppercase tracking-widest text-[var(--text-muted)] mb-2">Content Similarity Pairs</h3>
                                            {reports.duplicateContent.clusters.slice(0, 15).map((cluster: any, i: number) => (
                                                <div key={i} className={`border p-5 rounded-xl ${cluster.similarity >= 80 ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className={`font-black uppercase tracking-widest text-xs px-3 py-1 rounded ${cluster.similarity >= 80 ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>{cluster.similarity >= 80 ? 'High' : 'Medium'} Risk</span>
                                                        <span className="font-black text-lg">{cluster.similarity}% Overlap</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="font-mono text-xs break-all text-[var(--primary)]"><a href={cluster.url1} className="hover:underline">{cluster.url1}</a></p>
                                                        <p className="font-mono text-xs break-all text-[var(--primary)]"><a href={cluster.url2} className="hover:underline">{cluster.url2}</a></p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-700 font-bold flex items-center gap-3 text-lg justify-center mb-8"><CheckCircle className="size-6" /> No significant content overlap detected across {reports.duplicateContent.pagesCrawled || 0} crawled pages.</div>
                                    )}

                                    {/* Duplicate titles */}
                                    {reports.duplicateContent.duplicateTitles?.length > 0 && (
                                        <div className="mb-8">
                                            <h3 className="font-bold text-sm uppercase tracking-widest text-red-600 mb-3">⚠ Duplicate Titles Found</h3>
                                            <div className="space-y-3">
                                                {reports.duplicateContent.duplicateTitles.map((dt: any, i: number) => (
                                                    <div key={i} className="border border-red-500/20 bg-red-500/5 p-4 rounded-xl">
                                                        <p className="font-bold text-sm mb-2 text-[var(--foreground)]">"{dt.title}"</p>
                                                        <ul className="space-y-1">
                                                            {dt.urls?.map((u: string, j: number) => (
                                                                <li key={j} className="font-mono text-xs text-[var(--primary)] break-all"><a href={u} className="hover:underline">{u}</a></li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Duplicate meta descriptions */}
                                    {reports.duplicateContent.duplicateMetas?.length > 0 && (
                                        <div>
                                            <h3 className="font-bold text-sm uppercase tracking-widest text-amber-600 mb-3">⚠ Duplicate Meta Descriptions</h3>
                                            <div className="space-y-3">
                                                {reports.duplicateContent.duplicateMetas.map((dm: any, i: number) => (
                                                    <div key={i} className="border border-amber-500/20 bg-amber-500/5 p-4 rounded-xl">
                                                        <p className="font-bold text-sm mb-2 text-[var(--foreground)]">"{dm.meta}"</p>
                                                        <ul className="space-y-1">
                                                            {dm.urls?.map((u: string, j: number) => (
                                                                <li key={j} className="font-mono text-xs text-[var(--primary)] break-all"><a href={u} className="hover:underline">{u}</a></li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 13. ORPHAN PAGES (Sitemap vs Crawl) */}
                    {reports.orphanPages && (
                        <div className="print:block print:px-8" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-3xl font-black border-b-2 border-[var(--border)] print:border-slate-300 pb-4 mb-8 flex items-center gap-3 mt-12">
                                <Map className="size-8 text-teal-500" />
                                Discovery & Orphan Pages
                            </h2>
                            <div className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm overflow-hidden">
                                {reports.orphanPages.summary && (
                                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                                        <div className="bg-[var(--background)] print:bg-slate-50 border border-[var(--border)] p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                                            <p className="text-5xl font-black text-teal-600 mb-2">{reports.orphanPages.sitemapUrlCount}</p>
                                            <p className="font-bold uppercase tracking-widest text-xs text-[var(--text-muted)]">URLs in XML Sitemaps</p>
                                        </div>
                                        <div className="bg-[var(--background)] print:bg-slate-50 border border-[var(--border)] p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                                            <p className="text-5xl font-black text-indigo-500 mb-2">{reports.orphanPages.crawledUrlCount}</p>
                                            <p className="font-bold uppercase tracking-widest text-xs text-[var(--text-muted)]">URLs Discovered by Crawl</p>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="space-y-8">
                                    <div className="border border-amber-500/20 rounded-xl overflow-hidden shadow-sm">
                                        <div className="bg-amber-500/5 text-amber-700 font-bold p-4 text-sm flex justify-between items-center border-b border-amber-500/20">
                                            <span className="flex items-center gap-2"><FileX className="size-4"/> Orphan Pages</span>
                                            <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-xs">{reports.orphanPages.summary?.orphanCount || 0} found</span>
                                        </div>
                                        <div className="p-4 bg-[var(--background)] print:bg-white text-xs text-[var(--text-muted)] border-b border-[var(--border)]">In sitemap, but no internal links point to them. Hard for users and search engines to find.</div>
                                        {reports.orphanPages.orphans?.length > 0 ? (
                                            <ul className="divide-y divide-[var(--border)]">
                                                {reports.orphanPages.orphans.slice(0, 50).map((u: string, i: number) => <li key={i} className="p-3 text-xs font-mono break-all hover:bg-[var(--surface-2)]"><a href={u} className="text-[var(--primary)] hover:underline">{u}</a></li>)}
                                            </ul>
                                        ) : <p className="p-6 text-center text-sm font-bold text-green-600">Great! No orphan pages found.</p>}
                                    </div>
                                    
                                    <div className="border border-blue-500/20 rounded-xl overflow-hidden shadow-sm">
                                        <div className="bg-blue-500/5 text-blue-700 font-bold p-4 text-sm flex justify-between items-center border-b border-blue-500/20">
                                            <span className="flex items-center gap-2"><Map className="size-4"/> Unlisted Pages</span>
                                            <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs">{reports.orphanPages.summary?.unlistedCount || 0} found</span>
                                        </div>
                                        <div className="p-4 bg-[var(--background)] print:bg-white text-xs text-[var(--text-muted)] border-b border-[var(--border)]">Crawled successfully, but missing from the XML sitemap. Consider adding them to your sitemap generation.</div>
                                        {reports.orphanPages.unlisted?.length > 0 ? (
                                            <ul className="divide-y divide-[var(--border)]">
                                                {reports.orphanPages.unlisted.slice(0, 50).map((u: string, i: number) => <li key={i} className="p-3 text-xs font-mono break-all hover:bg-[var(--surface-2)]"><a href={u} className="text-[var(--primary)] hover:underline">{u}</a></li>)}
                                            </ul>
                                        ) : <p className="p-6 text-center text-sm font-bold text-green-600">Perfect! All crawled pages are correctly listed in the sitemap.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 14. THIRD PARTY SCRIPTS */}
                    {reports.thirdPartyScripts && (
                        <div className="print:block print:px-8" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-3xl font-black border-b-2 border-[var(--border)] print:border-slate-300 pb-4 mb-8 flex items-center gap-3 mt-12">
                                <Cpu className="size-8 text-fuchsia-600" />
                                Third-Party Scripts Profiler
                            </h2>
                            <div className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm overflow-hidden">
                                {reports.thirdPartyScripts.summary && (
                                    <div className="flex gap-4 mb-8">
                                        <div className="bg-[var(--background)] print:bg-slate-50 border border-[var(--border)] p-4 rounded-xl text-center flex-1"><p className="text-3xl font-black mb-1 text-fuchsia-500">{reports.thirdPartyScripts.summary.totalRequests}</p><p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">External Requests</p></div>
                                        <div className="bg-[var(--background)] print:bg-slate-50 border border-[var(--border)] p-4 rounded-xl text-center flex-1"><p className="text-3xl font-black mb-1">{reports.thirdPartyScripts.summary.uniqueDomains}</p><p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Unique Domains</p></div>
                                        <div className="bg-[var(--background)] print:bg-slate-50 border border-[var(--border)] p-4 rounded-xl text-center flex-1"><p className="text-3xl font-black mb-1 text-rose-500">{reports.thirdPartyScripts.summary.totalKb}kb</p><p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">External Payload</p></div>
                                    </div>
                                )}
                                
                                {reports.thirdPartyScripts.byCategory && (
                                    <div className="mb-8">
                                        <h3 className="font-bold text-sm uppercase tracking-widest text-[var(--text-muted)] mb-4">Payload by Category</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {Object.entries(reports.thirdPartyScripts.byCategory).map(([cat, data]: any) => (
                                                <div key={cat} className="px-4 py-2 border border-[var(--border)] print:border-slate-300 bg-[var(--background)] print:bg-white rounded-xl flex items-center gap-3">
                                                    <span className="font-black text-sm">{cat}</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded">{data.sizeKb}kb</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {reports.thirdPartyScripts.scripts?.length > 0 && (
                                    <div className="border border-[var(--border)] print:border-slate-200 rounded-xl overflow-hidden">
                                        <div className="bg-[var(--surface-2)] print:bg-slate-100 font-bold text-xs uppercase p-3 border-b border-[var(--border)] print:border-slate-200 tracking-widest text-[var(--text-muted)]">Heaviest External JS Files</div>
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <tbody className="divide-y divide-[var(--border)] print:divide-slate-200">
                                                {reports.thirdPartyScripts.scripts.slice(0, 15).map((s: any, i: number) => (
                                                    <tr key={i} className="hover:bg-[var(--surface-2)]/50">
                                                        <td className="px-4 py-2 align-middle font-mono text-[10px] text-[var(--primary)] max-w-[200px] truncate">{s.url}</td>
                                                        <td className="px-4 py-2 align-middle text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{s.category}</td>
                                                        <td className="px-4 py-2 align-middle text-right font-black">{s.sizeKb}kb</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 15. PAGINATION & SEO PARAMS */}
                    {reports.pagination && (
                        <div className="print:block print:px-8" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-3xl font-black border-b-2 border-[var(--border)] print:border-slate-300 pb-4 mb-8 flex items-center gap-3 mt-12">
                                <Layers className="size-8 text-indigo-500" />
                                Pagination & URL Architecture
                            </h2>
                            <div className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm overflow-hidden">
                                {reports.pagination.riskFactors?.length > 0 && (
                                    <div className={`mb-8 p-6 border rounded-xl ${reports.pagination.risk === 'high' ? 'bg-red-500/5 border-red-500/20' : reports.pagination.risk === 'medium' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-green-500/5 border-green-500/20'}`}>
                                        <h3 className={`font-black uppercase tracking-widest text-xs mb-3 ${reports.pagination.risk === 'high' ? 'text-red-600' : reports.pagination.risk === 'medium' ? 'text-amber-600' : 'text-green-600'}`}>Architecture Risk: {reports.pagination.risk}</h3>
                                        <ul className="space-y-2">
                                            {reports.pagination.riskFactors.map((f: string, i: number) => <li key={i} className={`text-sm font-medium flex gap-2 w-full ${reports.pagination.risk === 'high' ? 'text-red-900' : reports.pagination.risk === 'medium' ? 'text-amber-900' : 'text-green-900'}`}><span className="shrink-0">•</span> <span>{f}</span></li>)}
                                        </ul>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="font-bold text-sm uppercase tracking-widest text-[var(--text-muted)] mb-4">Rel Prev/Next Implementation</h3>
                                        <div className="space-y-3">
                                            <div className="flex bg-[var(--background)] border border-[var(--border)] rounded-xl overflow-hidden p-3 font-mono text-sm">
                                                <span className="w-16 text-slate-400 font-bold">prev:</span> <span className="text-[var(--primary)] truncate">{reports.pagination.pagination?.relPrev || <em className="text-gray-400 font-sans text-xs">missing</em>}</span>
                                            </div>
                                            <div className="flex bg-[var(--background)] border border-[var(--border)] rounded-xl overflow-hidden p-3 font-mono text-sm">
                                                <span className="w-16 text-slate-400 font-bold">next:</span> <span className="text-[var(--primary)] truncate">{reports.pagination.pagination?.relNext || <em className="text-gray-400 font-sans text-xs">missing</em>}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm uppercase tracking-widest text-[var(--text-muted)] mb-4">Faceted Parameters Linked</h3>
                                        {reports.pagination.facets?.linkedFilterParams && Object.keys(reports.pagination.facets.linkedFilterParams).length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {Object.entries(reports.pagination.facets.linkedFilterParams).map(([k, count]: any) => (
                                                    <span key={k} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 font-bold text-xs rounded-lg">{k} <span className="opacity-50 ml-1">({count})</span></span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="p-4 bg-[var(--background)] border border-[var(--border)] rounded-xl text-center text-sm font-medium text-[var(--text-muted)]">No known facet filter parameters crawlable from this page.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Section-level pagination analysis */}
                                {reports.pagination.sections?.length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="font-bold text-sm uppercase tracking-widest text-[var(--text-muted)] mb-4">Sub-Page Pagination Analysis</h3>
                                        {reports.pagination.sectionSummary && (
                                            <div className="grid grid-cols-3 gap-4 mb-6">
                                                <div className="p-4 bg-[var(--background)] print:bg-slate-50 border border-[var(--border)] rounded-xl text-center">
                                                    <p className="text-2xl font-black text-indigo-500 mb-1">{reports.pagination.sectionSummary.sectionsAnalyzed}</p>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Sections Analyzed</p>
                                                </div>
                                                <div className="p-4 bg-[var(--background)] print:bg-slate-50 border border-amber-500/20 rounded-xl text-center">
                                                    <p className="text-2xl font-black text-amber-600 mb-1">{reports.pagination.sectionSummary.sectionsWithPagination}</p>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">With Pagination</p>
                                                </div>
                                                <div className="p-4 bg-[var(--background)] print:bg-slate-50 border border-red-500/20 rounded-xl text-center">
                                                    <p className="text-2xl font-black text-red-600 mb-1">{reports.pagination.sectionSummary.sectionsMissingRelTags}</p>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-600">Missing Rel Tags</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="space-y-3">
                                            {reports.pagination.sections.filter((s: any) => s.hasPagination).map((s: any, i: number) => (
                                                <div key={i} className={`border p-4 rounded-xl ${!s.relNext && !s.relPrev ? 'border-red-500/30 bg-red-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
                                                    <p className="font-mono text-xs break-all text-[var(--primary)] font-bold mb-2">{s.url}</p>
                                                    <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest">
                                                        {s.relNext && <span className="px-2 py-0.5 bg-green-500/20 text-green-700 rounded">rel=next ✓</span>}
                                                        {s.relPrev && <span className="px-2 py-0.5 bg-green-500/20 text-green-700 rounded">rel=prev ✓</span>}
                                                        {!s.relNext && !s.relPrev && <span className="px-2 py-0.5 bg-red-500/20 text-red-700 rounded">No rel tags ✗</span>}
                                                        {s.paginatedLinksFound > 0 && <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-700 rounded">{s.paginatedLinksFound} paginated links</span>}
                                                    </div>
                                                </div>
                                            ))}
                                            {reports.pagination.sections.filter((s: any) => s.hasPagination).length === 0 && (
                                                <p className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-700 font-bold text-sm text-center"><CheckCircle className="size-4 inline mr-2" />No paginated sections detected across scanned paths.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 16. CANONICALS */}
                    {reports.canonicals && (
                        <div className="print:block print:px-8" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-3xl font-black border-b-2 border-[var(--border)] print:border-slate-300 pb-4 mb-8 flex items-center gap-3 mt-12">
                                <CornerDownRight className="size-8 text-yellow-500" />
                                Canonical Tag Conflicts
                            </h2>
                            <div className="p-8 rounded-3xl border border-[var(--border)] print:border-slate-200 bg-[var(--surface-1)] print:bg-white shadow-sm overflow-hidden">
                                {reports.canonicals.conflicts?.length > 0 ? (
                                    <div className="space-y-6">
                                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 font-bold rounded-xl flex items-center gap-3">
                                            ⚠️ Detected {reports.canonicals.summary?.conflictCount} canonical conflicts in the internal link graph!
                                        </div>
                                        <div className="divide-y divide-[var(--border)] print:divide-slate-200 border border-[var(--border)] print:border-slate-200 rounded-xl overflow-hidden">
                                            {reports.canonicals.conflicts.map((c: any, i: number) => (
                                                <div key={i} className="p-4 bg-[var(--background)] print:bg-white hover:bg-[var(--surface-2)] transition">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">{c.issue}</span>
                                                    </div>
                                                    <p className="font-mono text-xs text-[var(--primary)] truncate font-bold mb-1">A: {c.url}</p>
                                                    <p className="font-mono text-xs text-slate-500 truncate">Canonical: {c.canonical}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-700 font-bold flex flex-col items-center justify-center gap-2 text-center">
                                        <CheckCircle className="size-8 text-green-500 mb-2" />
                                        <div className="text-xl">Canonical Architecture is Clean</div>
                                        <div className="text-sm font-medium opacity-80 max-w-lg">Evaluated {reports.canonicals.summary?.pagesEvaluated} localized pages. No missing tags, canonical chains, mismatched domains, or non-200 canonical targets were detected.</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                    <div className="text-center pt-32 print:pt-24 pb-12">
                        <p className="text-sm font-black tracking-[0.2em] uppercase text-[var(--text-muted)] opacity-50 mb-2">✦ End of Automated Massive Fan-out Report ✦</p>
                        <p className="text-xs font-semibold text-[var(--text-muted)] opacity-40">Generated by Free SEO Tools Deep Analysis Engine</p>
                    </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const UnlinkIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18.8 3.2l-2.6 2.6c-2.3-2.3-6.1-2.3-8.5 0l-1.9 1.9"/>
      <path d="M5.2 20.8l2.6-2.6c2.3 2.3 6.1 2.3 8.5 0l1.9-1.9"/>
      <path d="M8 12h.01"/>
      <path d="M16 12h.01"/>
      <path d="m2 2 20 20"/>
    </svg>
)
