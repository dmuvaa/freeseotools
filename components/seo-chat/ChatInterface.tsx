"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Bot, User, Loader2, Sparkles, Wrench, CheckCircle2 } from "lucide-react";

const STARTER_PROMPTS = [
  "Check meta tags for example.com",
  "Is the sitemap for stripe.com valid?",
  "Analyze the robots.txt of vercel.com",
  "Run a full Lighthouse audit on google.com",
  "Compare Core Web Vitals between apple.com and microsoft.com",
  "How do I improve my Core Web Vitals?",
];

export function ChatInterface() {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [localInput, setLocalInput] = useState("");
  const [targetDomain, setTargetDomain] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStatus, setAuditStatus] = useState<Record<string, 'idle' | 'loading' | 'done' | 'error'>>({});

  const chatState: any = useChat({
    api: "/api/chat",
    maxToolRoundtrips: 5,
  } as any);

  const { messages, isLoading, stop } = chatState;

  // Auto-scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isAuditing]);

  const submitMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = localInput.trim();
    if (!text || isLoading) return;

    // Support both older `sendMessage` and newer `append`/`handleSubmit` APIs
    if (typeof chatState.sendMessage === 'function') {
       chatState.sendMessage({ content: text, role: 'user' });
    } else if (typeof chatState.append === 'function') {
       chatState.append({ content: text, role: 'user' });
    } else if (typeof chatState.handleSubmit === 'function') {
       if (chatState.setInput) chatState.setInput(text);
       setTimeout(() => {
           if (inputRef.current?.form) inputRef.current.form.requestSubmit();
       }, 50);
    }
    
    setLocalInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  };

  const startAudit = async (url: string) => {
    setTargetDomain(url);
    setIsAuditing(true);
    
    setAuditStatus({
        lighthouse: 'loading',
        schema: 'loading',
        robots: 'loading',
        sitemap: 'loading',
        meta: 'loading',
        headings: 'loading',
        links: 'loading',
        headers: 'loading',
        ttfb: 'loading',
        indexability: 'loading',
        javascript: 'loading',
        internalLinks: 'loading',
    });

    const indexDomain = new URL(url).hostname;
    const fetcher = async (key: string, endpoint: string, bodyObj: any) => {
       try {
           const res = await fetch(endpoint, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(bodyObj)
           });
           if (!res.ok) throw new Error('Network response was not ok');
           const data = await res.json();
           if (data.success === false) throw new Error(data.error);
           setAuditStatus(prev => ({ ...prev, [key]: 'done' }));
           return { key, data };
       } catch {
           setAuditStatus(prev => ({ ...prev, [key]: 'error' }));
           return { key, error: true };
       }
    };

    // Run parallel fanout!
    await Promise.allSettled([
        fetcher('lighthouse', '/api/tools/lighthouse', { url }),
        fetcher('schema', '/api/tools/schema-coverage', { url }),
        fetcher('robots', '/api/tools/robots-txt', { domain: url }),
        fetcher('sitemap', '/api/tools/sitemap', { url: url.endsWith('/') ? url + 'sitemap.xml' : url + '/sitemap.xml' }),
        fetcher('meta', '/api/tools/meta-tags', { url }),
        fetcher('headings', '/api/tools/headings', { url }),
        fetcher('links', '/api/tools/broken-links', { url }),
        fetcher('headers', '/api/tools/http-headers', { url }),
        fetcher('ttfb', '/api/tools/ttfb-checker', { url }),
        fetcher('indexability', '/api/tools/indexability', { urls: [url], domain: indexDomain }),
        fetcher('javascript', '/api/tools/js-bundle-analyzer', { url }),
        fetcher('internalLinks', '/api/tools/internal-link-audit', { domain: indexDomain, limit: 15 }),
    ]);

    setIsAuditing(false);

    const prompt = `I have just run a massive concurrent SEO audit on ${url} covering Lighthouse, Schema, Robots, Sitemap, Meta tags, Headings, Http Headers, TTFB, Indexability, JS Bundles, and Internal Links. 

The audit has completed successfully on the client side. Please acknowledge this, give a very brief 1-2 sentence enthusiastic welcome, and ask me what specific area I'd like to dive into or if I'd like you to summarize the results using your tools.`;

    if (typeof chatState.append === 'function') {
       chatState.append({ content: prompt, role: 'user' });
    } else if (typeof chatState.sendMessage === 'function') {
       chatState.sendMessage({ content: prompt, role: 'user' });
    }
  };

  // Onboarding Screen
  if (!targetDomain && (!messages || messages.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl shadow-sm text-[var(--foreground)] p-4">
        <div className="max-w-md w-full p-8 sm:p-10 bg-[var(--surface-2)] border border-[var(--border)] rounded-[2rem] shadow-xl text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 size-40 bg-[var(--primary)] opacity-10 blur-3xl rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 size-40 bg-[var(--accent)] opacity-10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="relative">
            <div className="flex items-center justify-center size-20 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white mx-auto mb-6 shadow-lg rotate-3 hover:rotate-6 transition-transform">
              <Sparkles className="size-10" /> 
            </div>
            <h2 className="text-2xl font-extrabold mb-3 tracking-tight">AI Agent Workspace</h2>
            <p className="text-[var(--text-subtle)] mb-10 text-sm leading-relaxed">
              Enter a website URL. Our autonomous Agent will run an initial baseline technical SEO audit, then open a dedicated chat workspace.
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              let url = new FormData(e.currentTarget).get('url') as string;
              if (!url.trim()) return;
              if (!url.startsWith('http')) {
                url = `https://${url}`;
              }
              startAudit(url);
            }} className="flex flex-col gap-4">
              <div className="relative">
                 <input 
                   type="text" 
                   name="url" 
                   required 
                   placeholder="example.com or https://example.com" 
                   className="w-full pl-5 pr-12 py-4 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 text-center font-medium placeholder:font-normal transition-all shadow-inner" 
                 />
                 <Bot className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-[var(--text-muted)] opacity-50" />
              </div>
              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--foreground)] text-[var(--surface-1)] rounded-xl font-semibold hover:bg-[var(--primary)] transition-all active:scale-95 shadow-md"
              >
                <span>Initialize Agent Audit</span>
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden text-[var(--foreground)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--surface-2)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-[var(--primary-muted)] text-[var(--primary)]">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h1 className="font-semibold text-base leading-none">Agentic Workspace {targetDomain && <span className="opacity-50 text-xs font-normal ml-2">({new URL(targetDomain.startsWith('http') ? targetDomain : `https://${targetDomain}`).hostname})</span>}</h1>
            <p className="text-xs opacity-70 mt-1">Powered by Gemini & 20+ Vercel AI SDK Tools</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto custom-scrollbar">
          <div className="flex flex-col gap-6 p-6">
            {isAuditing && (
               <div className="flex gap-4">
                 <div className="shrink-0 pt-1">
                    <div className="flex items-center justify-center size-8 rounded-full bg-[var(--primary-muted)] text-[var(--primary)] animate-pulse">
                      <Bot className="size-4" />
                    </div>
                 </div>
                 <div className="flex flex-col gap-3 w-full">
                    <div className="w-full bg-[var(--surface-1)] border border-[var(--border)] rounded-3xl shadow-sm overflow-hidden p-6 relative max-w-4xl">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[var(--primary)]/10 to-transparent blur-3xl pointer-events-none" />
                        <div className="relative z-10">
                            <h3 className="text-xl font-black mb-1 flex items-center gap-3">
                               <Loader2 className="size-6 text-[var(--primary)] animate-spin" /> Performing Master SEO Audit...
                            </h3>
                            <p className="text-xs font-mono text-[var(--text-muted)] mb-8 truncate max-w-sm px-2 py-1 bg-[var(--surface-2)] rounded inline-block shadow-inner">{targetDomain}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {Object.entries(auditStatus).map(([key, state]) => (
                                    <div key={key} className="flex flex-col gap-1.5 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-sm transition-all duration-300">
                                        <span className="text-[10px] font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider">{key}</span>
                                        <div className="flex justify-between items-center">
                                            {state === 'loading' && <span className="px-2 py-1 text-[10px] uppercase font-bold text-blue-600 bg-blue-500/10 border border-blue-500/20 rounded animate-pulse">Running</span>}
                                            {state === 'done' && <span className="px-2 py-1 text-[10px] uppercase font-bold text-green-600 bg-green-500/10 border border-green-500/20 rounded">Checked</span>}
                                            {state === 'error' && <span className="px-2 py-1 text-[10px] uppercase font-bold text-red-600 bg-red-500/10 border border-red-500/20 rounded">Failed</span>}
                                            {state === 'done' && <CheckCircle2 className="size-4 text-green-500" />}
                                            {state === 'loading' && <Loader2 className="size-4 text-blue-500 animate-spin" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                 </div>
               </div>
            )}
            {(messages || []).map((msg: any) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-col md:flex-row"}`}>
                
                {/* Avatar */}
                <div className="shrink-0 pt-1">
                  {msg.role === "assistant" ? (
                    <div className="flex items-center justify-center size-8 rounded-full bg-[var(--primary-muted)] text-[var(--primary)]">
                      <Bot className="size-4" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center size-8 rounded-full bg-[var(--accent-muted)] text-[var(--accent)]">
                      <User className="size-4" />
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className={`flex flex-col gap-3 w-full ${msg.role === "user" ? "items-end" : ""}`}>
                  
                  {/* Tool Invocations */}
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const tools = msg.toolInvocations || (msg.parts || []).filter((p: any) => 
                        p.type === 'tool-invocation' || 
                        p.type?.startsWith('tool-') || 
                        p.type === 'dynamic-tool' || 
                        p.toolCallId
                      );
                      
                      if (!tools || tools.length === 0) return null;
                      
                      return tools.map((toolCall: any) => {
                        const isDone = "result" in toolCall || toolCall.state === 'result';
                        const toolName = toolCall.toolName || toolCall.type?.replace('tool-', '');

                        if (isDone && toolName === 'seo_audit' && toolCall.result && !toolCall.result.error) {
                          const res = toolCall.result;
                          const score = res.score ?? 0;
                          const color = score >= 90 ? 'text-green-500 bg-green-500/10 border-green-500/20' : score >= 50 ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20';
                          
                          return (
                            <div key={toolCall.toolCallId || toolCall.id || Math.random()} className="w-full my-4 bg-[var(--surface-1)] border border-[var(--border)] rounded-3xl shadow-sm overflow-hidden p-6 relative max-w-4xl">
                              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-[var(--primary)]/10 to-transparent blur-3xl pointer-events-none" />
                              <div className="relative z-10">
                                <h3 className="text-xl font-black mb-1 flex items-center gap-2"><CheckCircle2 className="size-5 text-[var(--primary)]" /> Unified SEO Audit Profile</h3>
                                <p className="text-xs font-mono text-[var(--text-muted)] mb-6 truncate max-w-sm px-2 py-1 bg-[var(--surface-2)] rounded inline-block">{res.url}</p>
                                
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                  <div className={`p-4 rounded-2xl flex flex-col items-center justify-center border ${color}`}>
                                    <p className="text-5xl font-black tracking-tighter">{score}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">Health Score</p>
                                  </div>
                                  <div className="p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl flex flex-col items-center justify-center text-red-500 shadow-inner">
                                    <p className="text-3xl font-black">{res.summary?.critical || 0}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-80">Critical Errors</p>
                                  </div>
                                  <div className="p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl flex flex-col items-center justify-center text-amber-500 shadow-inner">
                                    <p className="text-3xl font-black">{res.summary?.warnings || 0}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-80">Warnings</p>
                                  </div>
                                  <div className="p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl flex flex-col items-center justify-center text-green-500 shadow-inner">
                                    <p className="text-3xl font-black">{res.summary?.passes || 0}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-80">Passed Checks</p>
                                  </div>
                                </div>

                                {res.categoryScores && (
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-[var(--border)]">
                                    {Object.entries(res.categoryScores).map(([cat, cats]: any) => {
                                      const catColor = cats.score >= 90 ? 'text-green-500' : cats.score >= 50 ? 'text-amber-500' : 'text-red-500';
                                      return (
                                        <div key={cat} className="p-3 bg-[var(--background)] border border-[var(--border)] rounded-xl flex flex-col items-center shadow-sm hover:scale-105 transition-transform">
                                          <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1 truncate w-full text-center">{cat}</span>
                                          <span className={`text-xl font-black truncate w-full text-center ${catColor}`}>{cats.score}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={toolCall.toolCallId || toolCall.id || Math.random()} className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-[var(--text-muted)]">
                            {isDone ? (
                              <CheckCircle2 className="size-3.5 text-emerald-500" />
                            ) : (
                              <Loader2 className="size-3.5 animate-spin text-[var(--primary)]" />
                            )}
                            <span className="flex items-center gap-1.5">
                              <Wrench className="size-3 opacity-60" />
                              {toolName}
                              {toolCall.args && Object.values(toolCall.args).length > 0 && (
                                <span className="opacity-60 font-mono text-[10px] px-1.5 py-0.5 bg-black/5 dark:bg-white/5 rounded">
                                  {Object.values(toolCall.args).join(", ")}
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Text Content */}
                  {(() => {
                    // Extract text content dynamically from either `.content` or `.parts`
                    let textContent = msg.content || "";
                    if (!textContent && msg.parts) {
                      textContent = msg.parts
                        .filter((p: any) => p.type === 'text')
                        .map((p: any) => p.text)
                        .join("");
                    }
                    
                    if (!textContent) return null;

                    return (
                      <div className={`px-5 py-4 rounded-xl text-[0.925rem] leading-relaxed shadow-sm overflow-x-auto ${msg.role === "user" ? "bg-[var(--primary)] text-white max-w-[85%] rounded-tr-none" : "bg-[var(--surface-2)] border border-[var(--border)] rounded-tl-none w-full"}`}>
                         <div className={`chat-markdown ${msg.role === "user" ? "text-white prose-a:text-white prose-code:text-white" : ""}`}>
                           <ReactMarkdown remarkPlugins={[remarkGfm]}>
                             {textContent}
                           </ReactMarkdown>
                         </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}

            {/* Pending Loading State without content */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-4 p-2">
                <div className="shrink-0">
                  <div className="flex items-center justify-center size-8 rounded-full bg-[var(--primary-muted)] text-[var(--primary)]">
                    <Bot className="size-4" />
                  </div>
                </div>
                <div className="pt-2">
                  <Loader2 className="size-5 animate-spin opacity-40 text-[var(--foreground)]" />
                </div>
              </div>
            )}
            
            <div ref={bottomRef} className="h-4" />
          </div>
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-1)]">
        <form onSubmit={submitMessage} className="flex flex-col gap-2 max-w-5xl mx-auto relative">
          <div className="flex items-end gap-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl py-2 pl-4 pr-2 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/10 transition-all shadow-sm">
            <textarea
              ref={inputRef}
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to audit domains or compare Core Web Vitals..."
              rows={localInput.split('\n').length > 1 ? Math.min(localInput.split('\n').length, 8) : 1}
              className="flex-1 bg-transparent border-none outline-none resize-none text-[0.95rem] py-1.5 custom-scrollbar max-h-48"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!localInput.trim() && !isLoading}
              className="flex items-center justify-center size-9 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] disabled:bg-[var(--surface-3)] disabled:text-[var(--text-subtle)] transition-colors mb-0.5"
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </div>
          <div className="flex items-center justify-between px-2">
             <span className="text-[11px] opacity-50 font-medium">✨ Powered by FreeSEOTools Agent Suite</span>
             <span className="text-[11px] opacity-40">Shift + Enter for new line</span>
          </div>
        </form>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-subtle); }
        
        .chat-markdown {
           width: 100%;
        }
        .chat-markdown p { margin-bottom: 0.75em; }
        .chat-markdown p:last-child { margin-bottom: 0; }
        .chat-markdown ul, .chat-markdown ol { margin: 0.5em 0 0.5em 1.5em; padding: 0; }
        .chat-markdown li { margin: 0.25em 0; }
        .chat-markdown strong { font-weight: 600; }
        .chat-markdown h1, .chat-markdown h2, .chat-markdown h3, .chat-markdown h4 {
           font-weight: 700;
           margin: 1.2em 0 0.5em;
        }
        .chat-markdown code {
           font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
           font-size: 0.85em;
           padding: 0.15em 0.3em;
           border-radius: 0.25rem;
           background: rgba(150, 150, 150, 0.1);
        }
        .chat-markdown pre {
           background: #111;
           color: #fff;
           padding: 1rem;
           border-radius: 0.5rem;
           overflow-x: auto;
           margin: 1em 0;
        }
        .chat-markdown table {
           width: 100%;
           border-collapse: collapse;
           margin: 1em 0;
           font-size: 0.85rem;
        }
        .chat-markdown th, .chat-markdown td {
           border: 1px solid var(--border);
           padding: 0.5em 0.75em;
           text-align: left;
        }
        .chat-markdown th {
           background: var(--surface-3);
           font-weight: 600;
        }
      `}</style>
    </div>
  );
}
