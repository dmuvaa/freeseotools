"use client";

import { useState } from "react";

export interface CodeBlockProps {
    code: string;
    language?: string;
    title?: string;
    showLineNumbers?: boolean;
    maxHeight?: string;
    collapsible?: boolean;
    defaultExpanded?: boolean;
}

export default function CodeBlock({
    code,
    language = "json",
    title,
    showLineNumbers = false,
    maxHeight,
    collapsible = false,
    defaultExpanded = true,
}: CodeBlockProps) {
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const lines = code.split("\n");

    return (
        <div className="rounded-lg border border-border bg-surface-1 overflow-hidden">
            {/* Header */}
            <div
                className={`flex items-center justify-between border-b border-border bg-surface-2 px-4 py-2 ${collapsible ? 'cursor-pointer hover:bg-surface-3 transition-colors' : ''}`}
                onClick={() => collapsible && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    {collapsible && (
                        <svg
                            className={`h-4 w-4 text-foreground-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    )}
                    {title && (
                        <span className="text-sm font-medium text-foreground-muted">
                            {title}
                        </span>
                    )}
                    <span className="badge badge-info">{language}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-foreground-muted transition-colors hover:text-foreground"
                >
                    {copied ? (
                        <>
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
                            Copied!
                        </>
                    ) : (
                        <>
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                            </svg>
                            Copy
                        </>
                    )}
                </button>
            </div>

            {/* Code Content */}
            {isExpanded && (
                <div
                    className="overflow-x-auto overflow-y-auto p-4"
                    style={maxHeight ? { maxHeight } : undefined}
                >
                    <pre className="font-mono text-sm">
                        <code>
                            {lines.map((line, i) => (
                                <div key={i} className="flex">
                                    {showLineNumbers && (
                                        <span className="mr-4 w-8 text-right text-foreground-subtle select-none">
                                            {i + 1}
                                        </span>
                                    )}
                                    <span className="text-foreground">{line}</span>
                                </div>
                            ))}
                        </code>
                    </pre>
                </div>
            )}
        </div>
    );
}
