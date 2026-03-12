import Link from "next/link";
import {
  MdSearch, MdCode, MdTrendingUp, MdWarningAmber, MdCheckCircle,
  MdHelpOutline, MdLightbulbOutline, MdBarChart, MdShield, MdMemory,
  MdLayers, MdArrowForward, MdOutlineSchema
} from "react-icons/md";
import { BiCodeBlock } from "react-icons/bi";
import SchemaCheckerClient from "./client";

export default function SchemaCheckerLandingPage() {
  return (
    <div className="bg-background">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-surface-2 border-b border-border py-12 md:py-20 text-center">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{
          backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="relative container mx-auto max-w-4xl px-6 text-center">
          <h1 className="mb-6 text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-foreground">
            Stop Guessing. <br />
            <span className="text-blue-600 dark:text-blue-400 mt-2 text-2xl md:text-4xl font-bold">Start Structuring.</span>
          </h1>

          <p className="mb-10 text-lg text-text-muted max-w-2xl mx-auto leading-relaxed text-center">
            This is not just a tool; it is your translator. Schema markup removes the guesswork, telling Google exactly what your content means.
          </p>

          <div className="bg-surface-1 rounded-2xl border border-border p-8 shadow-2xl w-full max-w-4xl mx-auto ring-4 ring-blue-500/5 transition-all">
            <SchemaCheckerClient />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-4xl py-12 md:py-16 space-y-20">

        {/* Why Good Enough is Killing CTR */}
        <section className="scroll-mt-20">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="md:w-1/3 shrink-0">
              <div className="size-12 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center mb-4">
                <MdTrendingUp className="size-6 rotate-180" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Why "Good Enough" Schema is Killing Your CTR</h2>
            </div>
            <div className="md:w-2/3 prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg text-[var(--text-muted)] leading-relaxed">
                You have spent weeks on your content. You have optimized your titles. You have built the backlinks. But when your site appears in the search engine results pages (SERPs), it looks plain. It is just a blue link and a snippet of text.
              </p>
              <p className="text-lg text-[var(--text-muted)] leading-relaxed mt-4">
                Meanwhile, your competitor has star ratings, a "how-to" carousel, and an FAQ dropdown that takes up half the screen. They are not outranking you because their content is better; they are winning because their Structured Data is working harder. If your Schema has a single syntax error (a missing bracket, a trailing comma, or an invalid date format) Google will ignore it entirely. You do not get a "participation trophy" for trying. You either have valid Schema, or you have invisible code.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Deep Dive */}
        <section className="bg-[var(--surface-1)] p-8 md:p-12 rounded-2xl border border-[var(--border)]">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <div className="inline-flex items-center gap-2 text-[var(--primary)] font-bold mb-4 uppercase tracking-wider text-sm">
                <MdMemory className="size-4" /> Technical Deep-Dive
              </div>
              <h2 className="text-3xl font-bold mb-4">JSON-LD vs. The World</h2>
              <p className="text-[var(--text-muted)] text-lg mb-6 leading-relaxed">
                While our validator supports older formats like Microdata and RDFa, the gold standard in 2026 remains <strong>JSON-LD</strong> (JavaScript Object Notation for Linked Data).
              </p>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Why? Because it is decoupled from the user-facing HTML. You can drop a JSON-LD script into the <code>&lt;head&gt;</code> or the <code>&lt;body&gt;</code> of your page without worrying about breaking your CSS layout. Our tool parses your script blocks to ensure they follow the strict hierarchy required by Schema.org.
              </p>
            </div>
            <div className="md:w-1/2 w-full">
              <div className="bg-surface-3 rounded-xl p-6 shadow-xl border border-border text-emerald-600 dark:text-emerald-400 font-mono text-sm overflow-x-auto">
                <pre><code>{`{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Free SEO Tools",
  "operatingSystem": "Web",
  "applicationCategory": "UtilitiesApplication"
}`}</code></pre>
              </div>
            </div>
          </div>
        </section>

        {/* Common Hurdles grid */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Common Syntax Hurdles We Identify</h2>
            <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg">
              Schema is incredibly picky. Our validator flags these silent killers that prevent rich results from appearing.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[var(--surface-1)] border border-[var(--border)] p-6 rounded-xl hover:border-[var(--primary)]/50 transition-colors">
              <div className="size-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                <MdWarningAmber className="size-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">The Context Variable</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Every script must start with <code>"@context": "https://schema.org"</code>. If you forget this, the rest of the code is gibberish to a bot.
              </p>
            </div>
            <div className="bg-[var(--surface-1)] border border-[var(--border)] p-6 rounded-xl hover:border-[var(--primary)]/50 transition-colors">
              <div className="size-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <MdLayers className="size-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">Nesting Entities</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                If you are a LocalBusiness that offers a Service, those entities need to be nested correctly using the <code>provider</code> or <code>makesOffer</code> properties.
              </p>
            </div>
            <div className="bg-[var(--surface-1)] border border-[var(--border)] p-6 rounded-xl hover:border-[var(--primary)]/50 transition-colors">
              <div className="size-10 rounded-lg bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center mb-4">
                <MdCode className="size-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">Data Types</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                A "Price" must be a number like <code>29.00</code>, not a string with symbols like <code>$29.00</code>. We catch these easily-missed strict formatting bugs.
              </p>
            </div>
          </div>
        </section>

        {/* Rich Result Roadmap */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">The Rich Result Roadmap: What Can You Achieve?</h2>
          <p className="text-center text-[var(--text-muted)] mb-12 text-lg max-w-3xl mx-auto">
            Validation is the first step toward visual dominance in the SERPs. By using this tool to audit your code, you are qualifying your site for several enhancements.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "Review Snippets", desc: "Those golden stars build instant trust and credibility before a user even clicks." },
              { title: "Product Markup", desc: "This allows you to show price, availability, and shipping info directly in search." },
              { title: "FAQ Scaffolding", desc: "You can dominate the vertical space of the SERP by answering questions before the user even reaches your site." },
              { title: "Recipe Enhancements", desc: "Display calorie counts, cook times, and high-resolution thumbnails in a dedicated carousel." },
              { title: "Article Attribution", desc: "This ensures Google knows exactly who the author is and when the content was last updated, crucial for E-E-A-T." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl items-start bg-[var(--surface-1)] border border-[var(--border)]">
                <MdCheckCircle className="size-6 text-[var(--primary)] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pro Workflow */}
        <section className="bg-surface-2 border border-border p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

          <h2 className="text-3xl font-bold mb-8 relative z-10">How to Use the Schema Validator<br /><span className="text-emerald-600 dark:text-emerald-400 text-2xl">(The Pro Workflow)</span></h2>
          <p className="text-text-muted mb-10 text-lg max-w-2xl relative z-10">
            Do not just check and forget. Use this professional workflow to stay ahead of the curve.
          </p>

          <div className="space-y-8 relative z-10">
            <div className="flex gap-6">
              <div className="size-12 shrink-0 rounded-full border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 flex items-center justify-center font-bold text-xl">1</div>
              <div>
                <h3 className="text-xl font-bold mb-2">The Raw Code Test</h3>
                <p className="text-text-muted">Before you even publish a page, paste your code snippet into our Sandbox Mode. This allows you to fix errors in your staging environment rather than waiting for Google Search Console to send you a warning email three days after you have gone live.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="size-12 shrink-0 rounded-full border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 flex items-center justify-center font-bold text-xl">2</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Live URL Audit</h3>
                <p className="text-text-muted">Once the page is live, run the URL through the checker. This ensures that your Content Management System (WordPress, Shopify, etc.) is not injecting any junk code or conflicting scripts that might override your manual Schema.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="size-12 shrink-0 rounded-full border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 flex items-center justify-center font-bold text-xl">3</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Competitor Reverse-Engineering</h3>
                <p className="text-text-muted">Want to know why a competitor has a better search appearance? Paste their URL into our tool. See exactly which Schema types they are using and copy their architecture (but not their content) to level the playing field.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Troubleshooting: Errors vs. Warnings</h2>
            <p className="text-lg text-[var(--text-muted)] mb-6">When our tool spits out a report, you will see two main categories of issues.</p>

            <div className="space-y-6">
              <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400 mb-1">
                  <MdShield className="size-5" /> 1. Critical Errors
                </div>
                <p className="text-sm text-red-900/80 dark:text-red-300/80">
                  These are deal-breakers. If you have a red error, Google will not grant you a rich snippet. Usually, this means you are missing a required field like a headline in an Article or your JSON syntax is simply broken.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400 mb-1">
                  <MdWarningAmber className="size-5" /> 2. Warnings
                </div>
                <p className="text-sm text-amber-900/80 dark:text-amber-300/80">
                  These are recommended fields. You can still get a rich snippet with warnings, but your result will not be as robust as it could be. You should always aim for zero warnings. In SEO, "optional" is just another word for "advantage."
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-6 bg-[var(--surface-1)] p-8 rounded-2xl border border-[var(--border)]">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <MdLightbulbOutline className="size-5 text-[var(--primary)]" /> Future-Proofing
            </h3>
            <h4 className="font-bold">Schema and the Future of Search Generative Experience</h4>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              As AI-driven search becomes the norm, Schema is becoming even more vital. AI models do not just read your site; they consume your data to provide direct answers. If your data is structured, you are much more likely to be the source cited by an AI in a generated response. By validating your Schema today, you are future-proofing your brand.
            </p>
            <hr className="border-[var(--border)]" />
            <h4 className="font-bold">Advanced Schema Strategies for Large Sites</h4>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              For enterprise-level websites, manual checking is not enough. Are you using WebSite markup on every single page? That is a mistake—it should generally only be on the homepage. Are you missing BreadcrumbList on deep-level category pages? Our tool helps you find those site-wide pattern gaps.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl group transition-all hover:border-primary/50">
              <h3 className="font-bold text-lg flex gap-2 items-start mb-2 text-foreground">
                <MdHelpOutline className="size-5 text-[var(--primary)] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                Does having valid Schema guarantee a Rich Snippet?
              </h3>
              <p className="text-[var(--text-muted)] text-sm">
                No. Google reserves the right to show or hide rich results based on user intent, site quality, and relevance. However, having invalid Schema guarantees you will <em>not</em> get one.
              </p>
            </div>
            <div className="p-6 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl group transition-all hover:border-primary/50">
              <h3 className="font-bold text-lg flex gap-2 items-start mb-2 text-foreground">
                <MdHelpOutline className="size-5 text-[var(--primary)] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                Is JSON-LD better than Microdata?
              </h3>
              <p className="text-[var(--text-muted)] text-sm">
                Yes. JSON-LD is Google’s preferred format. It is easier to maintain, less likely to break your site's design, and faster for bots to parse.
              </p>
            </div>
            <div className="p-6 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl group transition-all hover:border-primary/50">
              <h3 className="font-bold text-lg flex gap-2 items-start mb-2 text-foreground">
                <MdHelpOutline className="size-5 text-[var(--primary)] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                How often should I audit my Schema?
              </h3>
              <p className="text-[var(--text-muted)] text-sm">
                Every time you update your site's theme or add a new plugin. Plugins often compete for Schema space, leading to duplicate entities that confuse search engines.
              </p>
            </div>
            <div className="p-6 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl group transition-all hover:border-primary/50">
              <h3 className="font-bold text-lg flex gap-2 items-start mb-2 text-foreground">
                <MdHelpOutline className="size-5 text-[var(--primary)] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                Can I use multiple Schema types on one page?
              </h3>
              <p className="text-[var(--text-muted)] text-sm">
                Absolutely. A blog post might have Article, BreadcrumbList, and FAQPage markup all at once. Our tool will validate all of them simultaneously.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-emerald-500 rounded-2xl p-10 text-center text-white shadow-xl mb-20 relative overflow-hidden">
          <h2 className="text-3xl font-bold mb-4">Ready to Claim Your SERP Real Estate?</h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8 text-center px-4">
            Do not let your hard-earned traffic go to a competitor just because their code is cleaner than yours. Precise data leads to precise rankings. Stop guessing and start structuring.
          </p>
          <div className="flex justify-center">
            <Link
              href="/core-seo/schema-checker/analyze"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <MdCode className="size-5" />
              Launch Schema Checker
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
