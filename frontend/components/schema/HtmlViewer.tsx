"use client";

import { useState, useMemo, useEffect } from "react";
import Card from "@/components/ui/Card";
import CodeBlock from "@/components/ui/CodeBlock";

interface HtmlViewerProps {
    htmlContent: string;
    url: string;
    onNavigate?: (url: string) => void;
}

type ViewMode = "source" | "no-js" | "with-js";

/**
 * Injects a <base> tag into HTML so relative URLs resolve correctly
 */
function injectBaseTag(html: string, url: string): string {
    try {
        const parsedUrl = new URL(url);
        const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}/`;
        const baseTag = `<base href="${baseUrl}">`;

        // Insert base tag right after <head> if present
        if (html.includes("<head>")) {
            return html.replace("<head>", `<head>${baseTag}`);
        } else if (html.includes("<head ")) {
            return html.replace(/<head\s[^>]*>/, (match) => `${match}${baseTag}`);
        } else {
            // No head tag, prepend to document
            return `${baseTag}${html}`;
        }
    } catch {
        return html;
    }
}

/**
 * Strips all script tags from HTML to simulate JavaScript-disabled view
 */
function stripScripts(html: string): string {
    // Remove script tags and their content
    let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    // Remove noscript tags but keep their content (show what no-js users see)
    cleaned = cleaned.replace(/<\/?noscript[^>]*>/gi, "");
    // Remove event handlers
    cleaned = cleaned.replace(/\s+on\w+="[^"]*"/gi, "");
    cleaned = cleaned.replace(/\s+on\w+='[^']*'/gi, "");
    return cleaned;
}

/**
 * Injects a script to intercept link clicks and send a message to the parent window
 */
function injectLinkInterceptor(html: string): string {
    const script = `
        <script>
            document.addEventListener('click', function(e) {
                const link = e.target.closest('a');
                if (link && link.href) {
                    e.preventDefault();
                    window.parent.postMessage({ type: 'NAVIGATE', url: link.href }, '*');
                }
            }, true);
        </script>
    `;

    // Inject before </body> if present, otherwise append
    if (html.includes("</body>")) {
        return html.replace("</body>", `${script}</body>`);
    } else {
        return `${html}${script}`;
    }
}

export default function HtmlViewer({ htmlContent, url, onNavigate }: HtmlViewerProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("source");
    const [iframeUrl, setIframeUrl] = useState<string>(url);

    // Sync internal URL state when prop changes
    useEffect(() => {
        setIframeUrl(url);
    }, [url]);

    // Listen for navigation messages from the iframe (both proxy and local interceptor)
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Handle proxy navigation
            if (event.data?.type === 'PROXY_NAVIGATE' && event.data?.url) {
                if (onNavigate) {
                    onNavigate(event.data.url);
                } else {
                    setIframeUrl(event.data.url);
                }
            }
            // Handle local interceptor navigation (legacy / no-js)
            else if (event.data?.type === 'NAVIGATE' && event.data?.url) {
                onNavigate?.(event.data.url);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onNavigate]);

    const noJsHtml = useMemo(() => {
        // Strip original scripts, THEN inject our interceptor
        const stripped = stripScripts(injectBaseTag(htmlContent, url)); // need base tag for relative links
        return injectLinkInterceptor(stripped);
    }, [htmlContent, url]);

    const tabs: { id: ViewMode; label: string; description: string }[] = [
        { id: "source", label: "Source Code", description: "Raw HTML" },
        { id: "no-js", label: "No-JS Preview", description: "JavaScript Disabled" },
        { id: "with-js", label: "With-JS Preview", description: "JavaScript Enabled" },
    ];

    return (
        <div className="mt-8">
            <h3 className="mb-4 text-lg font-semibold">
                Page View (How Crawlers See It)
            </h3>

            {/* Tab Navigation */}
            <div className="mb-4 flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setViewMode(tab.id)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${viewMode === tab.id
                            ? "bg-accent-blue text-white"
                            : "bg-surface-2 text-foreground-muted hover:bg-surface-3 hover:text-foreground"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Description */}
            <p className="mb-4 text-sm text-foreground-subtle">
                {viewMode === "source" && (
                    <>
                        <span className="font-medium text-foreground">Raw HTML source</span> —
                        The exact HTML returned by the server before any JavaScript execution.
                    </>
                )}
                {viewMode === "no-js" && (
                    <>
                        <span className="font-medium text-accent-amber">JavaScript Disabled</span> —
                        How the page looks to crawlers that don&apos;t execute JS, or users with JS off.
                        All &lt;script&gt; tags removed.
                    </>
                )}
                {viewMode === "with-js" && (
                    <>
                        <span className="font-medium text-accent-green">JavaScript Enabled</span> —
                        Rendered preview (note: this uses server-fetched HTML, not client-rendered content).
                    </>
                )}
            </p>

            {/* Content */}
            {viewMode === "source" && (
                <CodeBlock
                    code={htmlContent}
                    language="html"
                    title={url}
                    showLineNumbers
                    maxHeight="500px"
                />
            )}

            {viewMode === "no-js" && (
                <Card padding="none" className="overflow-hidden">
                    <div className="flex items-center justify-between border-b border-border bg-surface-2 px-4 py-2">
                        <div className="flex items-center gap-2">
                            <svg
                                className="h-4 w-4 text-accent-amber"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                            </svg>
                            <span className="text-sm text-foreground-muted">
                                {url}
                            </span>
                        </div>
                        <span className="badge badge-weak">JS Disabled</span>
                    </div>
                    <div className="relative bg-white">
                        <iframe
                            srcDoc={noJsHtml}
                            sandbox=""
                            className="h-[500px] w-full"
                            title="No-JavaScript Preview"
                        />
                    </div>
                </Card>
            )}

            {viewMode === "with-js" && (
                <Card padding="none" className="overflow-hidden">
                    <div className="flex items-center justify-between border-b border-border bg-surface-2 px-4 py-2">
                        <div className="flex items-center gap-2">
                            <svg
                                className="h-4 w-4 text-accent-green"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            <span className="text-sm text-foreground-muted">
                                {url}
                            </span>
                        </div>
                        <span className="badge badge-strong">JS Enabled</span>
                    </div>
                    <div className="relative bg-white">
                        <iframe
                            key={iframeUrl} // Force remount on URL change to ensure fresh load
                            src={`/api/html-proxy?url=${encodeURIComponent(iframeUrl)}&mode=full`}
                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
                            className="h-[500px] w-full"
                            title="JavaScript-Enabled Preview"
                        />
                    </div>
                    <div className="border-t border-border bg-surface-2 px-4 py-2">
                        <p className="text-xs text-foreground-subtle">
                            ⚠️ Note: This shows server-rendered HTML. Client-side JS frameworks
                            (React, Vue, etc.) may render additional content after hydration.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}
