"use client";

import { useState } from "react";
import { Search, Monitor, MoreHorizontal, AlertTriangle, Smartphone } from "lucide-react";

export default function TitleMetaLengthChecker() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [title, setTitle] = useState("BlitzGeo - Your Ultimate Local SEO Platform");
    const [description, setDescription] = useState("Dominate local search rankings with BlitzGeo. We provide the tools you need to analyze, optimize, and track your local SEO performance effectively.");
    const [mode, setMode] = useState<"desktop" | "mobile">("desktop");

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

    const currentTitleLimit = mode === "desktop" ? titleLimitPxDesktop : titleLimitPxMobile;
    const currentDescLimit = mode === "desktop" ? descLimitPxDesktop : descLimitPxMobile;

    const isTitleTruncated = titleWidth > currentTitleLimit;
    const isDescTruncated = descWidth > currentDescLimit;

    const fetchFromUrl = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/tools/meta-tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
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
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-8 border-b border-[var(--border)] pb-8">
                <h1 className="text-3xl font-bold mb-2">Title & Meta Length Checker</h1>
                <p className="text-[var(--text-muted)]">
                    Ensure your titles and meta descriptions fit perfectly in Google search results without being cut off. Type directly or fetch from a URL.
                </p>

                <form onSubmit={fetchFromUrl} className="mt-6 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Fetch from URL (e.g., https://example.com) [Optional]"
                        className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                    <button
                        type="submit"
                        disabled={loading || !url}
                        className="inline-flex items-center justify-center rounded-md bg-[var(--surface-2)] border border-[var(--border)] px-6 py-3 font-medium hover:bg-[var(--surface-3)] transition-colors disabled:opacity-50"
                    >
                        {loading ? <Search className="size-4 animate-spin mr-2" /> : <Search className="size-4 mr-2" />}
                        Fetch Data
                    </button>
                </form>
                {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor */}
                <div className="space-y-6">
                    <div className="bg-[var(--surface-1)] rounded-xl border border-[var(--border)] p-4">
                        <div className="flex justify-between mb-2">
                            <label className="font-semibold block">Title Tag</label>
                            <span className={`text-xs ${isTitleTruncated ? 'text-red-500' : title.length > 10 ? 'text-green-500' : 'text-[var(--text-muted)]'}`}>
                                {title.length} / {titleLimitChars} chars
                            </span>
                        </div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded border border-[var(--border)] bg-[var(--surface-2)] p-2 focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
                        />
                        <div className="w-full bg-[var(--surface-2)] h-1.5 mt-2 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${isTitleTruncated ? 'bg-red-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(100, (titleWidth / currentTitleLimit) * 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-[var(--surface-1)] rounded-xl border border-[var(--border)] p-4">
                        <div className="flex justify-between mb-2">
                            <label className="font-semibold block">Meta Description</label>
                            <span className={`text-xs ${isDescTruncated ? 'text-red-500' : description.length > 50 ? 'text-green-500' : 'text-[var(--text-muted)]'}`}>
                                {description.length} / {descLimitChars} chars
                            </span>
                        </div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full rounded border border-[var(--border)] bg-[var(--surface-2)] p-2 focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
                        />
                        <div className="w-full bg-[var(--surface-2)] h-1.5 mt-2 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${isDescTruncated ? 'bg-red-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(100, (descWidth / currentDescLimit) * 100)}%` }}
                            />
                        </div>
                    </div>

                    {(isTitleTruncated || isDescTruncated) && (
                        <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl flex gap-3 text-yellow-600 dark:text-yellow-400">
                            <AlertTriangle className="size-5 shrink-0" />
                            <p className="text-sm">Your text is too long and will likely be truncated (...) in Google Search results on {mode} devices. Try keeping it more concise.</p>
                        </div>
                    )}
                </div>

                {/* Live Preview */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                        <h3 className="font-semibold">Live SERP Preview</h3>
                        <div className="flex bg-[var(--surface-2)] rounded-lg p-1">
                            <button
                                onClick={() => setMode("desktop")}
                                className={`p-2 rounded flex items-center gap-1 ${mode === "desktop" ? "bg-[var(--surface-1)] shadow text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-white"}`}
                            >
                                <Monitor className="size-4" /> <span className="text-xs font-medium">Desktop</span>
                            </button>
                            <button
                                onClick={() => setMode("mobile")}
                                className={`p-2 rounded flex items-center gap-1 ${mode === "mobile" ? "bg-[var(--surface-1)] shadow text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-white"}`}
                            >
                                <Smartphone className="size-4" /> <span className="text-xs font-medium">Mobile</span>
                            </button>
                        </div>
                    </div>

                    <div className={`
             mx-auto bg-white transition-all overflow-hidden rounded-xl border border-gray-200 shadow-sm
             ${mode === "desktop" ? "max-w-[600px] p-6" : "max-w-[375px] p-4"}
           `}>
                        <div className="font-sans text-[#4d5156] break-words">
                            <div className="flex items-center gap-2 text-sm mb-1">
                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs shrink-0">W</div>
                                <div className="flex flex-col leading-tight">
                                    <span className="text-[#202124] text-sm">Website Name</span>
                                    <span className="text-xs text-[#4d5156] truncate max-w-[200px]">https://example.com › path</span>
                                </div>
                                <MoreHorizontal className="size-4 text-gray-400 ml-auto" />
                            </div>
                            {/* Simulated Title Truncation visually (not absolute accurate pixel logic) */}
                            <h3 className="text-[#1a0dab] text-xl font-normal hover:underline cursor-pointer mb-1" style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {title || "Please enter a title"}
                            </h3>
                            {/* Simulated Desc Truncation visually */}
                            <div className="text-sm text-[#4d5156] leading-snug" style={{ display: '-webkit-box', WebkitLineClamp: mode === 'mobile' ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {description || "Please enter a meta description"}
                            </div>
                        </div>
                    </div>

                    <p className="text-[var(--text-muted)] text-xs text-center">
                        *Preview is an approximation based on Google's current design rules. Actual SERPs vary dynamically based on the user's query and device.
                    </p>
                </div>
            </div>
        </div>
    );
}
