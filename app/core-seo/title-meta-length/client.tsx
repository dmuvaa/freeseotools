"use client";

import { useState } from "react";
import { MdSearch, MdDesktopMac, MdSmartphone, MdSettings, MdCheckCircle, MdInfo, MdLabel, MdMoreVert } from "react-icons/md";
import { BiErrorCircle } from "react-icons/bi";

export default function TitleMetaLengthChecker() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [title, setTitle] = useState("Free SEO Tools - Your Ultimate Local SEO Platform");
    const [description, setDescription] = useState("Dominate local search rankings with Free SEO Tools. We provide the tools you need to analyze, optimize, and track your local SEO performance effectively.");
    const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

    const titleLimitChars = 60;
    const descLimitChars = 160;

    // Approximate Google pixel limits
    const titleLimitPxDesktop = 600;
    const descLimitPxDesktop = 920;
    const titleLimitPxMobile = 550; // depends on device, rough estimate
    const descLimitPxMobile = 700;

    // Very rough estimation based on average character width in Arial/Roboto (what Google uses)
    const estimatePixelWidth = (text: string, isBold = false) => {
        let width = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char.match(/[il|]/)) width += 3;
            else if (char.match(/[mwMW]/)) width += 12;
            else if (char === char.toUpperCase() && char.match(/[A-Z]/)) width += 9;
            else width += 7;
        }
        return isBold ? width * 1.05 : width;
    };

    const titleWidth = estimatePixelWidth(title, false) * 1.1; // 20px font
    const descWidth = estimatePixelWidth(description, false) * 0.8; // 14px font

    const currentTitleLimit = device === "desktop" ? titleLimitPxDesktop : titleLimitPxMobile;
    const currentDescLimit = device === "desktop" ? descLimitPxDesktop : descLimitPxMobile;

    const isTitleTruncated = titleWidth > currentTitleLimit;
    const isDescTruncated = descWidth > currentDescLimit;

    const fetchFromUrl = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        let targetUrl = url;
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
        }
        setUrl(targetUrl);
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/tools/meta-tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: targetUrl }),
            });
            const data = await res.json();
            if (!data.success) {
                setError(data.error || "Failed to fetch tags.");
            } else {
                const t = data.tags.find((tag: any) => tag.tagName === "Title")?.value || "";
                const d = data.tags.find((tag: any) => tag.tagName === "Meta Description")?.value || "";
                setTitle(t);
                setDescription(d);
                if (!t && !d) setError("No title or description found on the page.");
            }
        } catch (err) {
            setError("Failed to connect to the server.");
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
                        placeholder="Import from URL (e.g., https://example.com/page)"
                        className="flex-1 rounded-md border border-border bg-surface-1 px-4 py-3 placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-md bg-violet-600 dark:bg-violet-500 px-6 py-3 font-medium text-white transition-colors hover:brightness-110 disabled:opacity-50 shadow-lg shadow-violet-500/20"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <MdSearch className="size-5 animate-spin" /> Fetching...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <MdSearch className="size-5" /> Import
                            </span>
                        )}
                    </button>
                </form>
                {error && <p className="text-red-500 mb-6 text-sm flex items-center gap-2"><BiErrorCircle /> {error}</p>}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Editor Side */}
                    <div className="space-y-6">
                        <div className="bg-surface-1 rounded-xl border border-border p-6 shadow-sm">
                            <h3 className="font-bold flex items-center gap-2 mb-6 border-b border-border pb-2 text-foreground-subtle uppercase text-xs tracking-wider">
                                <MdLabel className="size-5 text-primary" /> Precision Editor
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2 items-end">
                                        <label className="text-sm font-semibold">Title Tag</label>
                                        <div className="flex flex-col items-end">
                                            <span className={`text-[10px] font-bold ${isTitleTruncated ? 'text-error' : 'text-success'}`}>
                                                {title.length} chars / {titleLimitChars}
                                            </span>
                                            <span className="text-[8px] text-foreground-muted uppercase tracking-tighter">Est. {Math.round(titleWidth)}px / {currentTitleLimit}px</span>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-surface-2 p-3 focus:ring-2 focus:ring-primary focus:outline-none text-foreground font-medium"
                                    />
                                    <div className="w-full bg-surface-3 h-1.5 mt-2 rounded-full overflow-hidden border border-border/50">
                                        <div
                                            className={`transition-all duration-300 h-full ${isTitleTruncated ? 'bg-error' : 'bg-success'}`}
                                            style={{ width: `${Math.min(100, (titleWidth / currentTitleLimit) * 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2 items-end">
                                        <label className="text-sm font-semibold">Meta Description</label>
                                        <div className="flex flex-col items-end">
                                            <span className={`text-[10px] font-bold ${isDescTruncated ? 'text-error' : 'text-success'}`}>
                                                {description.length} chars / {descLimitChars}
                                            </span>
                                            <span className="text-[8px] text-foreground-muted uppercase tracking-tighter">Est. {Math.round(descWidth)}px / {currentDescLimit}px</span>
                                        </div>
                                    </div>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={5}
                                        className="w-full rounded-lg border border-border bg-surface-2 p-3 focus:ring-2 focus:ring-primary focus:outline-none text-sm text-foreground leading-relaxed font-medium"
                                    />
                                    <div className="w-full bg-surface-3 h-1.5 mt-2 rounded-full overflow-hidden border border-border/50">
                                        <div
                                            className={`transition-all duration-300 h-full ${isDescTruncated ? 'bg-error' : 'bg-success'}`}
                                            style={{ width: `${Math.min(100, (descWidth / currentDescLimit) * 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {(isTitleTruncated || isDescTruncated) && (
                                    <div className="bg-error/5 border border-error/20 p-4 rounded-xl flex gap-3 text-error shadow-sm animate-pulse">
                                        <BiErrorCircle className="size-5 shrink-0" />
                                        <p className="text-[10px] font-bold leading-relaxed uppercase tracking-wide">
                                            Warning: One or more tags exceed pixel limits for {device} view and will be truncated (...) in search results.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Preview Side */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <h3 className="font-bold uppercase text-xs tracking-wider text-foreground-subtle">Validator Preview</h3>
                            <div className="flex bg-surface-2 rounded-lg p-1">
                                <button
                                    onClick={() => setDevice('desktop')}
                                    className={`px-3 py-1.5 rounded flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${device === 'desktop' ? 'bg-violet-600 text-white shadow-sm' : 'text-text-muted hover:bg-surface-3'}`}
                                >
                                    <MdDesktopMac className="size-3.5" /> Desktop
                                </button>
                                <button
                                    onClick={() => setDevice('mobile')}
                                    className={`px-3 py-1.5 rounded flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${device === 'mobile' ? 'bg-violet-600 text-white shadow-sm' : 'text-text-muted hover:bg-surface-3'}`}
                                >
                                    <MdSmartphone className="size-3.5" /> Mobile
                                </button>
                            </div>
                        </div>

                        <div className="bg-surface-3 rounded-2xl border border-border shadow-inner p-4 sm:p-8 min-h-[300px] flex flex-col justify-center transition-all">
                            <div className={`
                                mx-auto transition-all overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800
                                ${device === "desktop" ? "max-w-[600px] w-full" : "max-w-[375px] w-full"}
                            `}>
                                <div className="font-sans text-foreground-light dark:text-slate-400 break-words">
                                    <div className="flex items-center gap-2 text-sm mb-1.5">
                                        <div className="w-6 h-6 bg-gray-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-500 font-bold text-[10px] shrink-0">W</div>
                                        <div className="flex flex-col leading-tight">
                                            <span className="text-foreground dark:text-slate-100 text-[13px] font-medium leading-none mb-0.5">Website Name</span>
                                            <span className="text-[11px] text-foreground-muted dark:text-slate-500 truncate max-w-[200px]">https://example.com › path</span>
                                        </div>
                                        <MdMoreVert className="size-4 text-gray-400 ml-auto" />
                                    </div>
                                    <h3 className="text-[#1a0dab] dark:text-blue-400 text-xl font-normal hover:underline cursor-pointer mb-1" style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {title || "Please enter a title"}
                                    </h3>
                                    <div className="text-[14px] text-[#4d5156] dark:text-slate-300 leading-snug" style={{ display: '-webkit-box', WebkitLineClamp: device === 'mobile' ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {description || "Please enter a meta description"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-foreground-muted text-[10px] uppercase font-bold tracking-widest pt-6">
                                <MdCheckCircle className="size-3.5 text-success" />
                                Pixel-Width Validated Snapshot (2025)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
