import { Metadata } from "next";
import Link from "next/link";
import SerpPreviewClient from "./client";

export const metadata: Metadata = {
    title: "Free SERP Preview Tool | Simulate Google Search Results",
    description: "Free SERP Preview Tool: Simulate how your page appears in Google search results on desktop and mobile. Optimize title and meta description for maximum click-through rate.",
};

const relatedTools = [
    { name: "Free Title & Meta Length Checker", href: "/tools/title-meta-length", desc: "Measure pixel width live as you type" },
    { name: "Free Meta Tags Analyzer", href: "/tools/meta-tags-analyzer", desc: "Audit all meta tags on any live URL" },
    { name: "Free Heading Structure Analyzer", href: "/tools/heading-structure", desc: "Ensure your page content hierarchy is solid" },
];

export default function SerpPreviewPage() {
    return (
        <>
            <SerpPreviewClient />

            <div className="border-t border-[var(--border)] mt-4">

                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free SERP Preview Tool</h2>
                        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
                            Ranking on page one means nothing if your snippet looks bland next to competitors. Our free SERP simulator lets you craft a pixel-perfect search result appearance — including rich snippets — before a single character hits your CMS.
                        </p>
                    </div>
                </section>

                {/* CTR Impact Grid */}
                <section className="px-6 py-14 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-3">Why Your Free SERP Appearance Defines Your Success</h3>
                    <p className="text-center text-[var(--text-muted)] text-sm mb-10 max-w-2xl mx-auto">Organic click-through rate is not just a vanity metric — it is a direct ranking signal. A compelling snippet can steal clicks from position one.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: "🏆", title: "Outperform Higher Rankings", color: "from-emerald-500/20 to-teal-500/10", border: "border-emerald-500/20", body: "Studies show that position-three results with exceptional titles and rich snippets routinely outperform position-one results with generic, uninspired copy. Our tool gives you the preview canvas to engineer this outcome." },
                            { icon: "⭐", title: "Rich Snippet Simulation", color: "from-yellow-500/20 to-amber-500/10", border: "border-yellow-500/20", body: "Test star ratings, review counts, and publication dates within the snippet simulator. These Schema.org structured data elements radically increase the visual footprint of your listing on any SERP." },
                            { icon: "📱", title: "Mobile-First Verification", color: "from-blue-500/20 to-indigo-500/10", border: "border-blue-500/20", body: "Over 60% of searches happen on mobile. Our mobile preview renders your snippet at smartphone dimensions so you can verify your message fits perfectly before mobile users scroll past you." },
                        ].map(f => (
                            <div key={f.title} className={`rounded-2xl border ${f.border} bg-gradient-to-br ${f.color} p-6 flex flex-col gap-3`}>
                                <div className="text-4xl">{f.icon}</div>
                                <h4 className="font-bold text-lg">{f.title}</h4>
                                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{f.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-[var(--surface-1)] px-6 py-14">
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-2xl font-bold mb-10 text-center">How the Free SERP Preview Tool Works</h3>
                        <ol className="space-y-6">
                            {[
                                { step: "1", title: "Enter Your Snippet Details", body: "Type your target URL, proposed title tag, and meta description into the editor. Or leave the defaults and start tweaking immediately — the preview updates with every keystroke." },
                                { step: "2", title: "Toggle Rich Snippets", body: "Check the rich snippets switch to overlay star ratings, vote counts, and publication dates onto the preview. This helps you visualize the addded SERP real estate Schema markup will generate before you invest in implementation." },
                                { step: "3", title: "Switch Between Desktop and Mobile", body: "Click the device toggle to instantly switch the rendering canvas. Desktop uses Google's wide layout with two-line descriptions. Mobile constrains the title width and allows three-line descriptions." },
                                { step: "4", title: "Refine Until Perfect", body: "Iterate on your copy in real time using the live preview as your visual target. When the title bar stays green and the description fills its container cleanly, your snippet is ready to publish." },
                            ].map(s => (
                                <li key={s.step} className="flex gap-5 items-start">
                                    <div className="size-9 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0">{s.step}</div>
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
                        <h3 className="text-2xl font-bold mb-3">How Click-Through Rate Influences Rankings</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Google measures how often users click your result compared to how often it is shown for a given query. A result that ranks at position three but achieves a CTR higher than the position-one result sends a powerful relevance signal. Over weeks, Google's algorithms reward this with ranking improvements. Your snippet is not just a presentation — it is an active ranking factor. Optimizing it with our free SERP preview tool is one of the highest-leverage activities in SEO with zero cost.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-2xl font-bold mb-3">Power Words That Drive Clicks</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Language analysis of high-CTR snippets consistently surfaces the same trigger words: "Free", "Instant", "Complete", "Proven", "Without", "Simple", "Step-by-Step", and "How to". These words speak directly to user intent and create an expectation of immediate value. Weave them naturally into your titles and descriptions — do not stuff them — and test the variations inside our free simulator before committing to any single version.</p>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                        <h3 className="text-2xl font-bold mb-3">Google Rewrites Your Titles — Here Is How to Stop It</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">Google now rewrites title tags at its discretion in roughly 60% of cases according to multiple industry studies. The most common trigger is a title that is far too long. When Google rewrites your title, it typically uses your H1 tag instead. This means keeping your title tag within the pixel limit shown by our free tool — and ensuring your H1 closely mirrors your title tag — gives you the best chance of Google displaying your intended headline rather than an algorithmically generated substitute. Pair this tool with our <Link href="/tools/heading-structure" className="text-[var(--primary)] hover:underline font-medium">Free Heading Structure Analyzer</Link> to align both signals.</p>
                    </div>
                </section>

                <section className="bg-[var(--surface-1)] px-6 py-12">
                    <div className="max-w-5xl mx-auto">
                        <h3 className="text-xl font-bold mb-6">Maximize Your Free SERP Optimization</h3>
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
