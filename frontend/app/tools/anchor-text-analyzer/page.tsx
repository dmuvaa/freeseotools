import { Metadata } from "next";
import Link from "next/link";
import AnchorTextAnalyzerClient from "./client";

export const metadata: Metadata = {
    title: "Free Anchor Text Analyzer | Detect Link Profile Over-Optimization",
    description: "Free Anchor Text Analyzer: Analyze your backlink anchor text distribution. Detect over-optimization risks, identify exact-match overuse, and ensure a natural link profile.",
};

export default function AnchorTextAnalyzerPage() {
    return (
        <>
            <AnchorTextAnalyzerClient />
            <div className="border-t border-[var(--border)] mt-4">
                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-violet-500/10 text-violet-600 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free Anchor Text Analyzer</h2>
                        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">Google's Penguin algorithm specifically targets unnatural anchor text distributions. Our free analyzer categorizes your backlink anchors into five types and flags over-optimization risks before they trigger a penalty.</p>
                    </div>
                </section>
                <section className="px-6 py-12 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-8">Free Anchor Text Categories Explained</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            { cat: "Exact Match", pct: "5–15%", risk: "High risk above 30%", color: "border-red-500/30 bg-red-500/5 text-red-600", desc: "Target keyword used verbatim. Powerful but unnatural in high volumes." },
                            { cat: "Partial Match", pct: "15–30%", risk: "Moderate", color: "border-orange-500/30 bg-orange-500/5 text-orange-600", desc: "Contains the keyword alongside other words. Looks organic and still passes relevance." },
                            { cat: "Branded", pct: "20–40%", risk: "Safe", color: "border-green-500/30 bg-green-500/5 text-green-600", desc: "Your brand or domain name. Google expects brands to have high branded anchor ratios." },
                            { cat: "Naked URL", pct: "10–25%", risk: "Safe", color: "border-blue-500/30 bg-blue-500/5 text-blue-600", desc: "Raw URL used as anchor text. Natural for forum links and citations." },
                            { cat: "Generic", pct: "5–20%", risk: "Safe", color: "border-gray-500/30 bg-gray-500/5 text-gray-600", desc: "Click here, learn more, visit site. No keyword signal but completely natural." },
                        ].map(c => (
                            <div key={c.cat} className={`rounded-xl border ${c.color} p-4`}>
                                <div className={`font-bold text-base mb-1`}>{c.cat}</div>
                                <div className="text-xs font-mono font-semibold mb-2">{c.pct} ideal</div>
                                <div className="text-xs opacity-75 mb-2">{c.risk}</div>
                                <p className="text-xs leading-relaxed">{c.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="bg-[var(--surface-1)] px-6 py-10 max-w-5xl mx-auto">
                    <h3 className="text-lg font-bold mb-4">Free Link Analysis Tools</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: "Free Internal Link Audit Tool", href: "/tools/internal-link-audit", desc: "Map your internal link architecture" },
                            { name: "Free Broken Link Checker", href: "/tools/broken-link-checker", desc: "Find dead outbound links per page" },
                            { name: "Free Redirect Checker", href: "/tools/redirect-checker", desc: "Trace redirect chains" },
                        ].map(t => (
                            <Link key={t.href} href={t.href} className="group block p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] hover:shadow-md transition-all">
                                <p className="font-semibold text-sm group-hover:text-[var(--primary)] transition-colors mb-1">{t.name}</p>
                                <p className="text-xs text-[var(--text-muted)]">{t.desc}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
