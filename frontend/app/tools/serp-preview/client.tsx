"use client";

import { useState } from "react";
import { Monitor, Smartphone, MoreVertical, Star, CheckCircle } from "lucide-react";

export default function SerpPreviewTool() {
    const [title, setTitle] = useState("BlitzGeo - The Ultimate Local SEO Platform");
    const [description, setDescription] = useState("Dominate the local search rankings with BlitzGeo. We provide the tools you need to analyze, optimize, and track your local SEO performance and drive organic growth.");
    const [url, setUrl] = useState("https://blitzgeo.com/features/local-seo");
    const [date, setDate] = useState("Oct 24, 2025");
    const [rating, setRating] = useState("4.9");
    const [votes, setVotes] = useState("1,204");

    const [showRichSnippets, setShowRichSnippets] = useState(true);
    const [mode, setMode] = useState<"desktop" | "mobile">("desktop");

    const getBreadcrumbs = (fullUrl: string) => {
        try {
            const parsed = new URL(fullUrl.startsWith('http') ? fullUrl : `https://${fullUrl}`);
            const hostname = parsed.hostname.replace('www.', '');
            const pathParts = parsed.pathname.split('/').filter(p => p);

            let crumbs = hostname;
            if (pathParts.length > 0) {
                if (mode === "desktop") {
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

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-8 border-b border-[var(--border)] pb-8">
                <h1 className="text-3xl font-bold mb-2">SERP Preview Tool</h1>
                <p className="text-[var(--text-muted)]">
                    Simulate how your page will appear in Google Search Results. Optimize your title, snippet, and URL to maximize Click-Through Rate (CTR).
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor */}
                <div className="space-y-6 bg-[var(--surface-1)] p-6 rounded-xl border border-[var(--border)]">
                    <h3 className="font-semibold text-lg border-b border-[var(--border)] pb-2">Snippet Details</h3>

                    <div>
                        <label className="font-medium text-sm block mb-1">Target URL</label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full rounded border border-[var(--border)] bg-[var(--surface-2)] p-2 focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="font-medium text-sm flex justify-between mb-1">
                            Title Tag
                            <span className={`text-xs ${title.length > 60 ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
                                {title.length} / 60
                            </span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded border border-[var(--border)] bg-[var(--surface-2)] p-2 focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="font-medium text-sm flex justify-between mb-1">
                            Meta Description
                            <span className={`text-xs ${description.length > 160 ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
                                {description.length} / 160
                            </span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full rounded border border-[var(--border)] bg-[var(--surface-2)] p-2 focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
                        />
                    </div>

                    <div className="pt-4 border-t border-[var(--border)]">
                        <label className="flex items-center gap-2 cursor-pointer mb-4">
                            <input
                                type="checkbox"
                                checked={showRichSnippets}
                                onChange={() => setShowRichSnippets(!showRichSnippets)}
                                className="rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                            />
                            <span className="text-sm font-medium">Include Rich Snippets (Reviews/Date)</span>
                        </label>

                        {showRichSnippets && (
                            <div className="grid grid-cols-3 gap-4 p-4 bg-[var(--surface-2)] rounded border border-[var(--border)]">
                                <div>
                                    <label className="text-xs text-[var(--text-muted)] block mb-1">Date</label>
                                    <input type="text" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded bg-[var(--surface-1)] border border-[var(--border)] p-1 text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs text-[var(--text-muted)] block mb-1">Rating</label>
                                    <input type="text" value={rating} onChange={e => setRating(e.target.value)} className="w-full rounded bg-[var(--surface-1)] border border-[var(--border)] p-1 text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs text-[var(--text-muted)] block mb-1">Votes</label>
                                    <input type="text" value={votes} onChange={e => setVotes(e.target.value)} className="w-full rounded bg-[var(--surface-1)] border border-[var(--border)] p-1 text-sm" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Preview */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                        <h3 className="font-semibold text-lg">Live Search Preview</h3>
                        <div className="flex bg-[var(--surface-2)] rounded-lg p-1">
                            <button
                                onClick={() => setMode("desktop")}
                                className={`p-2 rounded flex items-center gap-1 transition-all ${mode === "desktop" ? "bg-[var(--surface-1)] shadow text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-white"}`}
                            >
                                <Monitor className="size-4" /> <span className="text-xs font-medium">Desktop</span>
                            </button>
                            <button
                                onClick={() => setMode("mobile")}
                                className={`p-2 rounded flex items-center gap-1 transition-all ${mode === "mobile" ? "bg-[var(--surface-1)] shadow text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-white"}`}
                            >
                                <Smartphone className="size-4" /> <span className="text-xs font-medium">Mobile</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#f8f9fa] rounded-xl border border-gray-200 shadow-sm p-4 sm:p-8 min-h-[300px] flex items-center justify-center">

                        {/* The actual Google-like snippet */}
                        <div className={`
               bg-white transition-all overflow-hidden rounded-lg shadow-sm border border-gray-100
               ${mode === "desktop" ? "w-full max-w-[650px] p-6" : "w-full max-w-[375px] p-4 mx-auto"}
             `}>
                            <div className="font-sans break-words text-[#4d5156]">
                                {/* URL and Favicon Area */}
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                                        <img src={faviconUrl} alt="Favicon" className="w-4 h-4" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    </div>
                                    <div className="flex flex-col leading-[1.2]">
                                        <span className="text-[#202124] text-[14px] truncate w-64">{getBreadcrumbs(url).split(' › ')[0] || "Website Name"}</span>
                                        <span className="text-[12px] text-[#4d5156] truncate w-64">{breadcrumbs}</span>
                                    </div>
                                    <MoreVertical className="size-4 text-gray-400 ml-auto" />
                                </div>

                                {/* Title */}
                                <h3 className="text-[#1a0dab] text-[20px] leading-[1.3] font-normal hover:underline cursor-pointer mb-1"
                                    style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {title || "Please enter a title"}
                                </h3>

                                {/* Description & Rich Snippets */}
                                <div className="text-[14px] text-[#4d5156] leading-[1.58]">
                                    {showRichSnippets && (
                                        <div className="flex items-center gap-1 mb-1 text-[#4d5156] text-[13px]">
                                            <span className="text-[#70757a] font-medium mr-1">Rating: {rating}</span>
                                            <div className="flex text-[#fbbc04]">
                                                <Star className="size-3 fill-current" />
                                                <Star className="size-3 fill-current" />
                                                <Star className="size-3 fill-current" />
                                                <Star className="size-3 fill-current" />
                                                <Star className="size-3 fill-current" />
                                            </div>
                                            <span className="text-[#70757a] ml-1">- {votes} votes</span>
                                        </div>
                                    )}

                                    <div style={{ display: '-webkit-box', WebkitLineClamp: mode === 'mobile' ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {showRichSnippets && date && <span className="text-[#70757a] font-medium mr-1">{date} —</span>}
                                        {description || "Please enter a meta description"}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] text-sm pt-4">
                        <CheckCircle className="size-4 text-green-500" />
                        This preview matches current Google SERP layouts.
                    </div>
                </div>
            </div>
        </div>
    );
}
