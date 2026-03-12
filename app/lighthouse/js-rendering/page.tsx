import { Metadata } from "next";
import LighthouseClient from "@/components/LighthouseClient";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Free JavaScript Rendering Lighthouse Test | Detect Render-Blocking Issues",
    description: "Free JavaScript Rendering Lighthouse: Find render-blocking scripts, unused JavaScript, and JS execution costs affecting your page speed and Google crawlability.",
};

export default function JsRenderingLighthousePage() {
    return (
        <>
            <LighthouseClient config={{ title: "Free JavaScript Rendering Lighthouse Test", strategy: "mobile", categories: ["performance"], accentColor: "#f97316", description: "Identify render-blocking scripts, unused JavaScript bundles, and long JS execution tasks that delay page load and hurt your Lighthouse Performance score." }} />
            <div className="border-t border-[var(--border)] mt-4">
                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-orange-500/10 text-orange-500 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free JavaScript Rendering Lighthouse Test</h2>
                        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">JavaScript is the number one cause of poor Lighthouse Performance scores. Our free test uses Google Lighthouse to find every render-blocking script, unused JS bundle, and long main-thread task slowing down your Critical Rendering Path.</p>
                    </div>
                </section>
                <section className="px-6 py-12 max-w-4xl mx-auto space-y-6">
                    <h3 className="text-2xl font-bold mb-4">How JavaScript Destroys Lighthouse Performance Scores</h3>
                    <p className="text-[var(--text-muted)] leading-relaxed">Every synchronous script tag in your HTML is a parking brake on the browser's Critical Rendering Path. The browser must download, parse, compile, and execute each script before it can continue rendering HTML. On a throttled mobile connection, a 200KB JavaScript bundle can add 3 seconds of render-blocking time — pushing your LCP well above Google's 2.5-second "Good" threshold. Our free Lighthouse test surfaces these culprits by name and byte size.</p>
                    <div className="h-px bg-[var(--border)]" />
                    <p className="text-[var(--text-muted)] leading-relaxed">Unused JavaScript is equally damaging to your Total Blocking Time score. If your JS bundle includes 400KB of code but only 60KB is executed on the initial page load, you're forcing the browser to parse and compile dead code. Code-splitting with dynamic imports and proper tree-shaking can reduce bundle size by 60 to 80 percent. Our Lighthouse audit identifies which scripts have the highest unused bytes ratio so you know exactly where to start.</p>
                </section>
                <section className="bg-[var(--surface-1)] px-6 py-10 max-w-5xl mx-auto">
                    <h3 className="text-lg font-bold mb-4">Related Free Performance Tools</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: "Free Core Web Vitals Lighthouse", href: "/tools/lighthouse-cwv", desc: "Focused LCP, CLS & INP scores" },
                            { name: "Free Core Web Vitals Comparator", href: "/tools/core-web-vitals", desc: "Compare two pages side-by-side" },
                            { name: "Free Mobile Lighthouse Test", href: "/tools/lighthouse-mobile", desc: "Full 4-category mobile audit" },
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
