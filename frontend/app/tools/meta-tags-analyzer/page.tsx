import { Metadata } from "next";
import Link from "next/link";
import MetaTagsAnalyzerClient from "./client";

export const metadata: Metadata = {
    title: "Free Meta Tags Analyzer | Check SEO Tags Instantly",
    description: "Free Meta Tags Analyzer: Check title tags, meta descriptions, OpenGraph, and Twitter Cards for any URL. Get instant SEO insights and export your results.",
};

const relatedTools = [
    { name: "Free Title & Meta Length Checker", href: "/tools/title-meta-length", desc: "Preview how your tags render in Google" },
    { name: "Free SERP Preview Tool", href: "/tools/serp-preview", desc: "Simulate your search snippet" },
    { name: "Free Heading Structure Analyzer", href: "/tools/heading-structure", desc: "Audit your H1–H6 hierarchy" },
];

export default function MetaTagsAnalyzerPage() {
    return (
        <>
            <MetaTagsAnalyzerClient />

            {/* Content Landing Section */}
            <div className="border-t border-[var(--border)] mt-4">

                {/* Hero Copy */}
                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-[var(--primary-muted)] text-[var(--primary)] uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                            Free Meta Tags Analyzer
                        </h2>
                        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
                            Instantly audit every meta tag on any webpage. Our free tool checks your title, description, canonical, OpenGraph, and Twitter Cards so you never miss a ranking opportunity.
                        </p>
                    </div>
                </section>

                {/* Feature Grid */}
                <section className="px-6 py-14 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-10">Why Your Meta Tags Determine Your Rankings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Title Tags That Get Clicked", color: "from-blue-500/20 to-indigo-500/10", border: "border-blue-500/20", icon: "🎯", body: "Your title tag is the single biggest on-page signal you control. Our free Meta Tags Analyzer flags titles that are too long, too short, or missing entirely — so every page earns its click." },
                            { title: "Meta Descriptions That Convert", color: "from-purple-500/20 to-pink-500/10", border: "border-purple-500/20", icon: "📝", body: "A great meta description is your silent sales pitch. We check character length, measure pixel width, and surface pages with missing descriptions before Google auto-generates a mediocre substitute." },
                            { title: "Social & Canonical Coverage", color: "from-emerald-500/20 to-teal-500/10", border: "border-emerald-500/20", icon: "🔗", body: "Missing OpenGraph or Twitter Card tags means social shares look broken and unprofessional. We audit every tag so your content looks as good on Twitter as it does on Google." },
                        ].map(f => (
                            <div key={f.title} className={`rounded-2xl border ${f.border} bg-gradient-to-br ${f.color} p-6 flex flex-col gap-3`}>
                                <div className="text-4xl">{f.icon}</div>
                                <h4 className="font-bold text-lg">{f.title}</h4>
                                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{f.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* How It Works */}
                <section className="bg-[var(--surface-1)] px-6 py-14">
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-2xl font-bold mb-10 text-center">How the Free Meta Tags Analyzer Works</h3>
                        <ol className="space-y-6">
                            {[
                                { step: "1", title: "Enter Any URL", body: "Paste any web address into the input above. Our system immediately fetches the page's raw HTML server-side, avoiding CORS restrictions that plague browser-based tools." },
                                { step: "2", title: "Instant Tag Extraction", body: "We parse the document and extract every critical SEO tag: title, meta description, canonical, robots, viewport, OpenGraph (og:title, og:image, og:description), and Twitter Cards." },
                                { step: "3", title: "Smart Status Indicators", body: "Rather than just listing tags, we apply SEO best practices. Tags receive Pass, Warning, or Fail statuses based on character limits, pixel lengths, and missing values." },
                                { step: "4", title: "Export Your Audit", body: "Download a clean CSV of all results to import into your reporting system, share with clients, or archive as a benchmark for future comparisons." },
                            ].map(s => (
                                <li key={s.step} className="flex gap-5 items-start">
                                    <div className="size-9 rounded-full bg-[var(--primary)] text-white font-bold text-sm flex items-center justify-center shrink-0">{s.step}</div>
                                    <div>
                                        <h4 className="font-semibold text-base mb-1">{s.title}</h4>
                                        <p className="text-[var(--text-muted)] text-sm leading-relaxed">{s.body}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* Deep Dive Content */}
                <section className="px-6 py-14 max-w-4xl mx-auto space-y-10">
                    <div>
                        <h3 className="text-2xl font-bold mb-3">What Makes a Winning Title Tag?</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Google renders title tags at around 600 pixels wide on desktop. A capital-heavy sentence consumes more space than a concise, lowercase-friendly phrase. A winning title front-loads your primary keyword, stays under 60 characters, and ends with your brand name for recognition. Our analyzer flags anything outside that window so you can fix it before losing click-through rate to a competitor.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-2xl font-bold mb-3">The Meta Description Sweet Spot</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Between 150 and 160 characters is the goldilocks zone. Too short and you surrender valuable SERP real estate. Too long and Google truncates your call-to-action mid-sentence. Write in active voice, include a specific benefit, and close with a direct invitation to click. Our tool highlights exactly where your description falls on that spectrum.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-2xl font-bold mb-3">OpenGraph and Twitter Cards: Social Visibility</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">When a user shares your URL on LinkedIn or X, the platform reads your OpenGraph tags to construct the preview card. A missing <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded text-xs font-mono">og:image</code> tag means no image, just a plain link. A missing <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded text-xs font-mono">og:title</code> means the platform fills in a generic fallback. Our checker ensures every social tag is present and populated so every share drives engagement.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-2xl font-bold mb-3">Canonical Tags: Eliminating Duplicate Content</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Ecommerce sites often generate dozens of near-identical URLs through filtering, sorting, and pagination. Without a canonical tag, Google is forced to guess which version to index, diluting your ranking power across all variants. Our free analyzer surfaces pages missing their canonical declaration before duplicate content penalties take hold.</p>
                    </div>
                </section>

                {/* Related Tools */}
                <section className="bg-[var(--surface-1)] px-6 py-12">
                    <div className="max-w-5xl mx-auto">
                        <h3 className="text-xl font-bold mb-6">Continue Your SEO Audit</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {relatedTools.map(t => (
                                <Link key={t.href} href={t.href} className="group block p-5 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] hover:shadow-md transition-all duration-200">
                                    <p className="font-semibold group-hover:text-[var(--primary)] transition-colors text-sm mb-1">{t.name}</p>
                                    <p className="text-xs text-[var(--text-muted)]">{t.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

            </div>
        </>
    );
}
