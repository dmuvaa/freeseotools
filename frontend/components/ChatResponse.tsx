
'use client'

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatResponseProps {
    content: string; // The raw AI text
}

export function ChatResponse({ content }: ChatResponseProps) {
    return (
        <div className="prose-blitz text-sm md:text-base leading-relaxed">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]} // Enables Github Flavored Markdown (Tables, Strikethrough)
                components={{
                    // --- 1. CODE BLOCKS (The most important part for DevTools like Stream) ---
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        const codeString = String(children).replace(/\n$/, '')

                        return !inline && match ? (
                            <div className="not-prose my-6 rounded-lg overflow-hidden border border-surface-3 bg-[#1e1e1e] shadow-lg">
                                {/* File Header / Language Badge */}
                                <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#3e3e3e]">
                                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                                        {match[1]}
                                    </span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(codeString)}
                                        className="text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer"
                                    >
                                        Copy
                                    </button>
                                </div>
                                {/* The Code Itself */}
                                <SyntaxHighlighter
                                    style={vscDarkPlus}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                                    {...props}
                                >
                                    {codeString}
                                </SyntaxHighlighter>
                            </div>
                        ) : (
                            // Inline code (e.g. `npm install`)
                            <code className="bg-surface-3 px-1.5 py-0.5 rounded text-primary font-mono text-sm border border-border" {...props}>
                                {children}
                            </code>
                        )
                    },

                    // --- 2. TABLES (Responsive Wrapper) ---
                    table: ({ children }) => (
                        <div className="not-prose my-8 overflow-x-auto rounded-lg border border-border">
                            <table className="min-w-full divide-y divide-border text-left text-sm">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => <thead className="bg-surface-2 font-semibold text-foreground">{children}</thead>,
                    tbody: ({ children }) => <tbody className="divide-y divide-border bg-surface-1/50">{children}</tbody>,
                    tr: ({ children }) => <tr className="hover:bg-surface-2/50 transition-colors">{children}</tr>,
                    th: ({ children }) => <th className="px-4 py-3 whitespace-nowrap">{children}</th>,
                    td: ({ children }) => <td className="px-4 py-3 text-text-muted whitespace-nowrap">{children}</td>,

                    // --- 3. HEADINGS & PARAGRAPHS ---
                    h1: ({ children }) => <h1 className="text-2xl text-foreground border-b border-border pb-2 mt-8 mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl text-foreground mt-8 mb-4 flex items-center gap-2 before:content-['#'] before:text-primary before:mr-1">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">{children}</h3>,
                    p: ({ children }) => <p className="mb-4 text-foreground leading-7">{children}</p>,
                    h4: ({ children }) => <h4 className="text-base font-bold text-foreground mt-4 mb-2">{children}</h4>,
                    h5: ({ children }) => <h5 className="text-base font-semibold text-foreground mt-4 mb-2">{children}</h5>,
                    h6: ({ children }) => <h6 className="text-sm font-bold text-foreground mt-4 mb-2">{children}</h6>,

                    // --- 4. LISTS ---
                    ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 mb-4 marker:text-primary text-foreground">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 mb-4 marker:text-primary text-foreground">{children}</ol>,

                    // --- 5. BOLD/STRONG ---
                    strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
