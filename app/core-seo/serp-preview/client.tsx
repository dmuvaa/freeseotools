"use client";

import { useState } from "react";
import { MdSearch, MdDesktopMac, MdSmartphone, MdSettings, MdCheckCircle, MdInfo, MdMoreVert, MdStar } from "react-icons/md";
import { BiErrorCircle } from "react-icons/bi";

export default function SerpPreviewTool() {
    const [title, setTitle] = useState("Free SEO Tools - The Ultimate Local SEO Platform");
    const [description, setDescription] = useState("Dominate the local search rankings with Free SEO Tools. We provide the tools you need to analyze, optimize, and track your local SEO performance and drive organic growth.");
    const [url, setUrl] = useState("https://freeseotools.com/features/local-seo");
    const [date, setDate] = useState("Oct 24, 2025");
    const [rating, setRating] = useState("4.9");
    const [votes, setVotes] = useState("1,204");

    const [showRichSnippets, setShowRichSnippets] = useState(true);
    const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
    const [loading, setLoading] = useState(false);

    const getBreadcrumbs = (fullUrl: string) => {
        try {
            const parsed = new URL(fullUrl.startsWith('http') ? fullUrl : `https://${fullUrl}`);
            const hostname = parsed.hostname.replace('www.', '');
            const pathParts = parsed.pathname.split('/').filter(p => p);

            let crumbs = hostname;
            if (pathParts.length > 0) {
                if (device === "desktop") {
                    crumbs += " › " + pathParts.join(" › ");
                } else {
                    crumbs += " › " + pathParts[0];
                }
            }
            return crumbs;
        } catch {
            return fullUrl;
        }
    };

    const breadcrumbs = getBreadcrumbs(url);
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${url.split('/')[2] || url}&sz=32`;

    const fetchFromUrl = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        setLoading(true);
        try {
            const res = await fetch("/api/tools/meta-tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });
            const data = await res.json();
            if (data.success) {
                const t = data.tags.find((tag: any) => tag.tagName === "Title")?.value;
                const d = data.tags.find((tag: any) => tag.tagName === "Meta Description")?.value;
                if (t) setTitle(t);
                if (d) setDescription(d);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="container mx-auto max-w-5xl">
                <form onSubmit={fetchFromUrl} className="mt-2 flex flex-col sm:flex-row gap-4 mb-8">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/page"
                        className="flex-1 rounded-md border border-border bg-surface-1 px-4 py-3 placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 dark:bg-blue-500 px-6 py-3 font-medium text-white transition-colors hover:brightness-110 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <MdSearch className="size-5 animate-spin" /> Fetching...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <MdSearch className="size-5" /> Import Data
                            </span>
                        )}
                    </button>
                </form>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Editor Side */}
                    <div className="space-y-6">
                        <div className="rounded-xl border border-border bg-surface-1 p-6 shadow-sm">
                            <h3 className="font-bold flex items-center gap-2 mb-6 border-b border-border pb-2 text-foreground-subtle uppercase text-xs tracking-wider">
                                <MdSettings className="size-5 text-primary" /> Snippet Editor
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold mb-1 block">Title Tag</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full rounded border border-border bg-surface-2 p-2 focus:ring-2 focus:ring-primary focus:outline-none text-foreground"
                                    />
                                    <div className="flex justify-between mt-1 items-center">
                                        <div className="h-1 flex-1 bg-surface-2 rounded-full overflow-hidden mr-3">
                                            <div
                                                className={`h-full ${title.length > 60 ? 'bg-error' : 'bg-success'}`}
                                                style={{ width: `${Math.min(100, (title.length / 60) * 100)}%` }}
                                            />
                                        </div>
                                        <span className={`text-[10px] font-bold ${title.length > 60 ? 'text-error' : 'text-foreground-muted'}`}>
                                            {title.length} / 60
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold mb-1 block">Meta Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        className="w-full rounded border border-border bg-surface-2 p-2 focus:ring-2 focus:ring-primary focus:outline-none text-sm text-foreground"
                                    />
                                    <div className="flex justify-between mt-1 items-center">
                                        <div className="h-1 flex-1 bg-surface-2 rounded-full overflow-hidden mr-3">
                                            <div
                                                className={`h-full ${description.length > 160 ? 'bg-error' : 'bg-success'}`}
                                                style={{ width: `${Math.min(100, (description.length / 160) * 100)}%` }}
                                            />
                                        </div>
                                        <span className={`text-[10px] font-bold ${description.length > 160 ? 'text-error' : 'text-foreground-muted'}`}>
                                            {description.length} / 160
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={showRichSnippets}
                                            onChange={() => setShowRichSnippets(!showRichSnippets)}
                                            className="rounded text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium group-hover:text-primary transition-colors">Show Rich Snippets</span>
                                    </label>
                                </div>

                                {showRichSnippets && (
                                    <div className="grid grid-cols-2 gap-3 p-4 bg-surface-2 rounded-xl border border-border animate-in fade-in duration-300">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-foreground-muted block mb-1">Rating</label>
                                            <input type="text" value={rating} onChange={e => setRating(e.target.value)} className="w-full rounded bg-surface-3 border border-border p-2 text-xs text-foreground focus:ring-1 focus:ring-primary outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-foreground-muted block mb-1">Votes</label>
                                            <input type="text" value={votes} onChange={e => setVotes(e.target.value)} className="w-full rounded bg-surface-3 border border-border p-2 text-xs text-foreground focus:ring-1 focus:ring-primary outline-none" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Preview Side */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <h3 className="font-bold uppercase text-xs tracking-wider text-foreground-subtle">Live SERP Preview</h3>
                            <div className="flex bg-surface-2 rounded-lg p-1">
                                <button
                                    onClick={() => setDevice('desktop')}
                                    className={`px-3 py-1.5 rounded flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${device === 'desktop' ? 'bg-blue-600 text-white shadow-sm' : 'text-text-muted hover:bg-surface-3'}`}
                                >
                                    <MdDesktopMac className="size-3.5" /> Desktop
                                </button>
                                <button
                                    onClick={() => setDevice('mobile')}
                                    className={`px-3 py-1.5 rounded flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${device === 'mobile' ? 'bg-blue-600 text-white shadow-sm' : 'text-text-muted hover:bg-surface-3'}`}
                                >
                                    <MdSmartphone className="size-3.5" /> Mobile
                                </button>
                            </div>
                        </div>

                        <div className="bg-surface-3 rounded-2xl border border-border shadow-inner p-4 sm:p-8 min-h-[340px] flex flex-col items-center justify-center transition-all">
                            <div className={`
                                bg-white dark:bg-slate-900 transition-all overflow-hidden rounded-xl shadow-lg border border-gray-100 dark:border-slate-800
                                ${device === "desktop" ? "w-full max-w-[600px] p-6" : "w-full max-w-[375px] p-4 mx-auto"}
                            `}>
                                <div className="font-sans break-words text-[#4d5156] dark:text-slate-400">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-7 h-7 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-gray-200 dark:border-slate-700">
                                            <img src={faviconUrl} alt="Favicon" className="w-4 h-4" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                        </div>
                                        <div className="flex flex-col leading-[1.2]">
                                            <span className="text-[#202124] dark:text-slate-100 text-[14px] truncate w-64">{getBreadcrumbs(url).split(' › ')[0] || "Website Name"}</span>
                                            <span className="text-[12px] text-[#4d5156] dark:text-slate-500 truncate w-64">{breadcrumbs}</span>
                                        </div>
                                        <MdMoreVert className="size-4 text-gray-400 ml-auto" />
                                    </div>

                                    <h3 className="text-[#1a0dab] dark:text-blue-400 text-[20px] leading-[1.3] font-normal hover:underline cursor-pointer mb-1"
                                        style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {title || "Please enter a title"}
                                    </h3>

                                    <div className="text-[14px] text-[#4d5156] dark:text-slate-300 leading-[1.58]">
                                        {showRichSnippets && (
                                            <div className="flex items-center gap-1 mb-1 text-[#4d5156] dark:text-slate-400 text-[13px]">
                                                <span className="text-[#70757a] dark:text-slate-500 font-medium mr-1">Rating: {rating}</span>
                                                <div className="flex text-[#fbbc04]">
                                                    <MdStar className="size-3 fill-current" />
                                                    <MdStar className="size-3 fill-current" />
                                                    <MdStar className="size-3 fill-current" />
                                                    <MdStar className="size-3 fill-current" />
                                                    <MdStar className="size-3 fill-current" />
                                                </div>
                                                <span className="text-[#70757a] dark:text-slate-500 ml-1">- {votes} votes</span>
                                            </div>
                                        )}

                                        <div style={{ display: '-webkit-box', WebkitLineClamp: device === 'mobile' ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {showRichSnippets && date && <span className="text-[#70757a] dark:text-slate-500 font-medium mr-1">{date} —</span>}
                                            {description || "Please enter a meta description"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-foreground-muted text-[10px] uppercase font-bold tracking-widest pt-6">
                                <MdCheckCircle className="size-3.5 text-success" />
                                Professional Google SERP Layout (2025)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
