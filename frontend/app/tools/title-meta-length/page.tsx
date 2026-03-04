import { Metadata } from "next";
import Link from "next/link";
import TitleMetaLengthClient from "./client";

export const metadata: Metadata = {
    title: "Free Title & Meta Length Checker | Pixel-Width SERP Optimizer",
    description: "Free Title & Meta Length Checker: Test title tags and meta descriptions against Google's pixel-width limits and preview your snippet before publishing.",
};

const relatedTools = [
    { name: "Free SERP Preview Tool", href: "/tools/serp-preview", desc: "Full desktop and mobile snippet simulator" },
    { name: "Free Meta Tags Analyzer", href: "/tools/meta-tags-analyzer", desc: "Audit all meta tags on any live URL" },
    { name: "Free Heading Structure Analyzer", href: "/tools/heading-structure", desc: "Optimize your H1–H6 hierarchy" },
];

export default function TitleMetaLengthPage() {
    return (
        <>
            <TitleMetaLengthClient />

            <div className="border-t border-[var(--border)] mt-4">

                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-pink-500/10 text-pink-600 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free Title & Meta Length Checker</h2>
                        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
                            The difference between a ranking that gets clicked and one that gets scrolled past is often just a perfectly sized snippet. Our free tool calculates pixel-width in real time and previews both desktop and mobile rendering before you publish.
                        </p>
                    </div>
                </section>

                {/* Pixel Width Stats */}
                <section className="px-6 py-14 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-10">Free Google Pixel Limit Reference</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        {[
                            { label: "Desktop Title", value: "~600px", note: "≈ 55–60 chars", color: "from-blue-500/20 to-indigo-500/10", border: "border-blue-500/20" },
                            { label: "Desktop Description", value: "~920px", note: "≈ 150–160 chars", color: "from-purple-500/20 to-violet-500/10", border: "border-purple-500/20" },
                            { label: "Mobile Title", value: "~550px", note: "≈ 50–55 chars", color: "from-pink-500/20 to-rose-500/10", border: "border-pink-500/20" },
                            { label: "Mobile Description", value: "~700px", note: "3-line wrap", color: "from-orange-500/20 to-amber-500/10", border: "border-orange-500/20" },
                        ].map(s => (
                            <div key={s.label} className={`rounded-2xl border ${s.border} bg-gradient-to-br ${s.color} p-5 text-center`}>
                                <div className="text-3xl font-extrabold mb-1">{s.value}</div>
                                <div className="text-sm font-semibold mb-1">{s.label}</div>
                                <div className="text-xs text-[var(--text-muted)]">{s.note}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-[var(--surface-1)] px-6 py-14">
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-2xl font-bold mb-10 text-center">How the Free Title & Meta Length Checker Works</h3>
                        <ol className="space-y-6">
                            {[
                                { step: "1", title: "Type or Fetch Your Copy", body: "Edit your title and description directly in the tool — or paste any URL and click Fetch data to pull the live meta tags from that page automatically." },
                                { step: "2", title: "Real-Time Pixel Width Calculation", body: "As you type, the tool estimates the pixel width of your text using character-width averages modeled on the fonts Google uses in its SERP layout. Progress bars update with every keystroke." },
                                { step: "3", title: "Instant Truncation Warning", body: "The moment your text exceeds the pixel threshold for your current device mode, the bar turns red and an alert tells you exactly what will be cut off in the live search result." },
                                { step: "4", title: "Live Desktop and Mobile Preview", body: "Toggle between Desktop and Mobile to see your snippet rendered in a pixel-accurate simulation of Google Search — complete with favicon, breadcrumbs, title, and description." },
                            ].map(s => (
                                <li key={s.step} className="flex gap-5 items-start">
                                    <div className="size-9 rounded-full bg-pink-600 text-white font-bold text-sm flex items-center justify-center shrink-0">{s.step}</div>
                                    <div>
                                        <h4 className="font-semibold text-base mb-1">{s.title}</h4>
                                        <p className="text-[var(--text-muted)] text-sm leading-relaxed">{s.body}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section className="px-6 py-14 max-w-4xl mx-auto space-y-10">
                    <div>
                        <h3 className="text-2xl font-bold mb-3">Why Google Uses Pixels, Not Characters</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">A capital "W" in Arial is nearly three times as wide as a lowercase "i". A title reading "WWW WINS WITH WIDE WORDS" will be truncated far sooner than "its wins in lowercase letters" despite having the same character count. Our checker accounts for this proportional rendering — something that character-only tools fundamentally cannot do. This is the difference between a snippet that displays perfectly and one that ends in "..."</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-2xl font-bold mb-3">Writing Titles That Drive Click-Through Rate</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Front-load your primary keyword in the first 40 characters so it is visible even in truncated displays. Avoid all-uppercase text — it wastes pixel budgets and damages readability. Append your brand name at the end, separated by a pipe character, as a trust signal for repeat visitors. Consider using power words like "Free", "Instant", "Proven", and "Complete" which reliably elevate click-through rates in A/B tests.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-2xl font-bold mb-3">Crafting Meta Descriptions That Convert</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Think of your meta description as a 150-character sales pitch. Lead with the specific benefit the user receives, use active verbs ("Discover", "Build", "Fix", "Audit"), and close with a clear call-to-action before the pixel limit. Google bolds any words in the description that match the user's search query — align your copy to naturally incorporate likely search terms for maximum visual impact.</p>
                    </div>
                </section>

                <section className="bg-[var(--surface-1)] px-6 py-12">
                    <div className="max-w-5xl mx-auto">
                        <h3 className="text-xl font-bold mb-6">Free Content Optimization Tools</h3>
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
