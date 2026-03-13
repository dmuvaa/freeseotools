import Link from "next/link";
import {
  MdOutlineCode, MdCompareArrows, MdMemory, MdSettings,
  MdLink, MdBarChart, MdStorage, MdHelpOutline,
  MdStopCircle, MdCode, MdCheckCircle, MdArrowForward, MdShield, MdWarningAmber
} from "react-icons/md";
import { BiCodeBlock, BiFile, BiLayout } from "react-icons/bi";
import JavascriptRenderingCheckerClient from "./client";

export default function JavascriptRenderingCheckerLandingPage() {
  return (
    <div className="bg-background">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-surface-2 border-b border-border py-12 md:py-20 text-center">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{
          backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="relative container mx-auto max-w-7xl px-6 text-center">
          <h1 className="mb-6 text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-foreground">
            Raw HTML <br />
            <span className="text-purple-600 dark:text-purple-400 mt-2 text-2xl md:text-4xl font-bold">vs. Rendered DOM.</span>
          </h1>

          <p className="mb-10 text-lg text-text-muted max-w-2xl mx-auto leading-relaxed text-center">
            See exactly what search bots miss when they don't execute your JavaScript. Identify critical content and links hidden behind client-side rendering.
          </p>

          <div className="bg-surface-1 rounded-2xl border border-border p-8 shadow-2xl w-full mx-auto ring-4 ring-purple-500/5 transition-all">
            <JavascriptRenderingCheckerClient />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-7xl py-12 md:py-16 space-y-20">

        {/* Why it Matters */}
        <section className="scroll-mt-20">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="md:w-1/3 shrink-0">
              <div className="size-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mb-4">
                <MdMemory className="size-6" />
              </div>
              <h2 className="text-2xl font-bold mb-2">What is JavaScript Rendering?</h2>
            </div>
            <div className="md:w-2/3 prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg text-[var(--text-muted)] leading-relaxed">
                In the modern web, "Rendering" is the process of turning code into a viewable page. Historically, this happened on the server (Static HTML). Today, much of it happens in the user's browser (Client-Side Rendering) using frameworks like React, Angular, or Vue.
              </p>
              <p className="text-lg text-[var(--text-muted)] leading-relaxed mt-4">
                When a search engine bot visits your URL, it initially sees the Raw HTML. To see the rest, it must "render" the JavaScript. This creates a two-stage indexing process that can delay your content from appearing in search results for days or even weeks. If your critical content (titles, links, and text) only exists when JavaScript is turned on, you are invisible during that first pass.
              </p>
            </div>
          </div>
        </section>

        {/* The Core Comparison */}
        <section className="bg-[var(--surface-1)] p-8 md:p-12 rounded-3xl border border-[var(--border)] shadow-sm">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">The Core Comparison: Enabled vs. Disabled</h2>
            <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
              This tool performs a side-by-side forensic audit of your URL. Here is why we show you both views:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900 text-slate-300 p-8 rounded-2xl relative overflow-hidden group hover:shadow-xl transition-all border border-slate-800">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center">
                  <MdStopCircle className="size-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Disabled View<br /><span className="text-sm font-normal text-slate-400 uppercase tracking-tighter">Raw HTML</span></h3>
              </div>
              <p className="mb-6">This is the "bare bones" of your website. It represents what a bot sees in the first microsecond of crawling.</p>
              <div className="space-y-4">
                <div>
                  <strong className="text-white block mb-1 flex items-center gap-2"><MdCheckCircle className="size-4 text-emerald-500" /> The Goal</strong>
                  <p className="text-sm">Your most important SEO elements (H1 tags, canonicals, and primary navigation) should ideally be visible here.</p>
                </div>
                <div>
                  <strong className="text-white block mb-1 flex items-center gap-2"><MdShield className="size-4 text-red-400" /> The Risk</strong>
                  <p className="text-sm">If this view is empty or shows a loading spinner, you are 100% dependent on Google’s ability to render your scripts. If your scripts fail, your SEO fails.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-slate-300 p-8 rounded-2xl relative overflow-hidden group hover:shadow-xl transition-all border border-slate-800">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <MdCode className="size-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Enabled View<br /><span className="text-sm font-normal text-slate-400 uppercase tracking-tighter">Rendered DOM</span></h3>
              </div>
              <p className="mb-6">This is the final product. It is the version of the page after all scripts, data fetches, and UI components have executed.</p>
              <div className="space-y-4">
                <div>
                  <strong className="text-white block mb-1 flex items-center gap-2"><MdCheckCircle className="size-4 text-emerald-500" /> The Goal</strong>
                  <p className="text-sm">This should be a perfect reflection of what your human users see.</p>
                </div>
                <div>
                  <strong className="text-white block mb-1 flex items-center gap-2"><MdWarningAmber className="size-4 text-amber-400" /> The Risk</strong>
                  <p className="text-sm">If there are massive discrepancies between this and the disabled view, you may be suffering from partial indexing.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features of Our Checker</h2>
            <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg">
              We do not just show you two screenshots; we provide a data driven breakdown of the differences that actually impact your rankings.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[var(--surface-1)] border border-[var(--border)] p-8 rounded-2xl hover:-translate-y-1 transition-transform dark:shadow-none shadow-sm">
              <MdStorage className="size-8 text-purple-500 mb-6" />
              <h3 className="text-xl font-bold mb-3">Metadata Integrity Audit</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                We compare your Meta Titles, Descriptions, and Robots tags in both states. If your JavaScript changes your "Index" tag to a "Noindex" tag after loading, you could send conflicting signals.
              </p>
            </div>
            <div className="bg-[var(--surface-1)] border border-[var(--border)] p-8 rounded-2xl hover:-translate-y-1 transition-transform dark:shadow-none shadow-sm">
              <MdBarChart className="size-8 text-indigo-500 mb-6" />
              <h3 className="text-xl font-bold mb-3">Content Gap Analysis</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Calculates the text-to-code ratio for both versions. If 90% of your text disappears when JavaScript is disabled, you have a heavy reliance on client side rendering.
              </p>
            </div>
            <div className="bg-[var(--surface-1)] border border-[var(--border)] p-8 rounded-2xl hover:-translate-y-1 transition-transform dark:shadow-none shadow-sm">
              <MdLink className="size-8 text-blue-500 mb-6" />
              <h3 className="text-xl font-bold mb-3">Link Discovery Path</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                If your internal links are injected via JavaScript, they will not exist in the "Disabled" view. This leads to orphan pages that Google never finds because the path is gated.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Indicators */}
        <section className="bg-[var(--surface-1)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
          <div className="p-8 md:p-10 border-b border-[var(--border)]">
            <h2 className="text-2xl font-bold mb-2">Technical Indicators We Track</h2>
            <p className="text-[var(--text-muted)]">Granular metrics that dictate rendering success.</p>
          </div>
          <div className="divide-y divide-[var(--border)]">
            <div className="flex flex-col md:flex-row p-6 md:p-8 hover:bg-[var(--surface-2)] transition-colors group">
              <div className="md:w-1/3 font-bold text-lg mb-2 md:mb-0 flex items-center gap-2">
                <MdMemory className="size-5 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" /> DOM Size
              </div>
              <div className="md:w-2/3 text-[var(--text-muted)]">Excessive nodes in the rendered view can slow down bot processing.</div>
            </div>
            <div className="flex flex-col md:flex-row p-6 md:p-8 hover:bg-[var(--surface-2)] transition-colors group">
              <div className="md:w-1/3 font-bold text-lg mb-2 md:mb-0 flex items-center gap-2">
                <MdSettings className="size-5 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" /> Render Timeout
              </div>
              <div className="md:w-2/3 text-[var(--text-muted)]">If your JS takes more than 5 seconds to load, Google may give up entirely.</div>
            </div>
            <div className="flex flex-col md:flex-row p-6 md:p-8 hover:bg-[var(--surface-2)] transition-colors group">
              <div className="md:w-1/3 font-bold text-lg mb-2 md:mb-0 flex items-center gap-2">
                <MdWarningAmber className="size-5 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" /> Console Errors
              </div>
              <div className="md:w-2/3 text-[var(--text-muted)]">Broken scripts can halt the rendering process, terminating the crawler's session.</div>
            </div>
            <div className="flex flex-col md:flex-row p-6 md:p-8 hover:bg-[var(--surface-2)] transition-colors group">
              <div className="md:w-1/3 font-bold text-lg mb-2 md:mb-0 flex items-center gap-2">
                <MdLink className="size-5 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" /> HTTP Status
              </div>
              <div className="md:w-2/3 text-[var(--text-muted)]">We ensure your JS files are actually accessible and not blocked by robots.txt.</div>
            </div>
          </div>
        </section>

        {/* Pro Workflow */}
        <section className="bg-surface-2 border border-border p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl font-bold mb-8 relative z-10 text-foreground">How to Use This Tool for Your Audit<br /><span className="text-purple-600 dark:text-purple-400 text-2xl">A 3-Step Workflow</span></h2>
          <p className="text-text-muted mb-10 text-lg max-w-2xl relative z-10 font-medium">
            I recommend this workflow to ensure your technical SEO is airtight:
          </p>

          <div className="space-y-8 relative z-10">
            <div className="flex gap-6">
              <div className="size-12 shrink-0 rounded-full border-2 border-purple-500 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl">1</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Input Your URL</h3>
                <p className="text-text-muted font-medium">Start with your most important money pages or your homepage.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="size-12 shrink-0 rounded-full border-2 border-purple-500 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl">2</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Identify Invisible Content</h3>
                <p className="text-text-muted font-medium">Look at the "Javascript Disabled" column. Is your primary value proposition visible? Are your internal links present?</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="size-12 shrink-0 rounded-full border-2 border-purple-500 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl">3</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Check for SEO Cloaking</h3>
                <p className="text-text-muted font-medium">Ensure that the content you show the bot in the rendered view is substantially the same as the raw view. Significant differences can sometimes be misinterpreted by Google as manipulation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl group hover:border-purple-500/50 transition-colors">
              <h3 className="font-bold text-lg flex gap-3 items-start mb-3">
                <MdHelpOutline className="size-6 text-purple-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                Can Google render everything now?
              </h3>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                While Google is better at rendering than it was five years ago, it is not perfect. It uses a <strong>rendering budget</strong>. For large sites, Google may defer the rendering of JavaScript heavy pages to save resources, leading to delayed indexing.
              </p>
            </div>
            <div className="p-8 bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl group hover:border-purple-500/50 transition-colors">
              <h3 className="font-bold text-lg flex gap-3 items-start mb-3">
                <MdHelpOutline className="size-6 text-purple-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                Is Server-Side Rendering (SSR) the only solution?
              </h3>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                Not necessarily. You can use "Dynamic Rendering" (serving a flat HTML version to bots and the JS version to users) or "Hydration." Our tool helps you decide if these advanced setups are necessary.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-10 md:p-14 text-center text-white shadow-xl mb-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <BiFile className="size-64" />
          </div>
          <div className="relative z-10 text-center flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Take Control of Your Rendering Strategy</h2>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto mb-10 leading-relaxed text-center">
              Stop crossing your fingers and hoping Google can read your code. Use our JavaScript Rendering Checker to see the hidden gaps in your site's architecture.
            </p>
            <Link
              href="/core-seo/javascript-rendering-checker/analyze"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-purple-700 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            >
              <MdCompareArrows className="size-5" />
              Compare Your Rendering
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
