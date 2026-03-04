import { Metadata } from "next";
import LighthouseClient from "@/components/LighthouseClient";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Free Accessibility Lighthouse Audit | WCAG Compliance Checker",
    description: "Free Accessibility Lighthouse Audit: Run Google Lighthouse's accessibility audit to check WCAG compliance, alt text, ARIA labels, contrast ratios, and keyboard navigation.",
};

export default function AccessibilityLighthousePage() {
    return (
        <>
            <LighthouseClient config={{ title: "Free Accessibility Lighthouse Audit", strategy: "mobile", categories: ["accessibility"], accentColor: "#f59e0b", description: "Run Google Lighthouse's full accessibility audit to measure WCAG compliance across your webpage — including contrast ratios, ARIA labels, form inputs, and keyboard navigation." }} />
            <div className="border-t border-[var(--border)] mt-4">
                <section className="bg-gradient-to-b from-[var(--surface-1)] to-[var(--background)] px-6 py-16 text-center">
                    <div className="mx-auto max-w-3xl">
                        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 uppercase tracking-widest">Free Tool</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Free Accessibility Lighthouse Audit</h2>
                        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">Accessibility is not just a compliance requirement — it directly influences SEO. Google uses accessibility signals to assess content quality. Our free Lighthouse accessibility audit gives you a WCAG compliance score and itemizes every failing check.</p>
                    </div>
                </section>
                <section className="px-6 py-12 max-w-4xl mx-auto space-y-6">
                    <h3 className="text-2xl font-bold mb-4 text-center">Why Accessibility Affects Your Google Rankings</h3>
                    <p className="text-[var(--text-muted)] leading-relaxed">Google's search quality guidelines explicitly state that accessible content — properly labeled images, semantic HTML, readable fonts — is a signal of content quality. Screen readers and Googlebot's rendering engine both process pages similarly, parsing alt text, heading structure, and ARIA attributes. An accessibility score below 90 almost always correlates with structural HTML problems that also hurt your SEO. Fix accessibility, fix both simultaneously.</p>
                    <div className="h-px bg-[var(--border)]" />
                    <p className="text-[var(--text-muted)] leading-relaxed">Our free audit checks contrast ratios (4.5:1 minimum for normal text per WCAG AA), image alt attributes, form label associations, ARIA role validity, heading order correctness, link discriminability, and more. The full Lighthouse accessibility audit runs 57 individual checks — more comprehensive than most paid accessibility tools. Pair this with our <Link href="/tools/lighthouse-seo" className="text-[var(--primary)] hover:underline font-medium">Free SEO Lighthouse Audit</Link> for a complete technical health picture.</p>
                </section>
                <section className="bg-[var(--surface-1)] px-6 py-10 max-w-5xl mx-auto">
                    <h3 className="text-lg font-bold mb-4">Continue Your Free Lighthouse Testing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: "Free SEO Lighthouse Audit", href: "/tools/lighthouse-seo", desc: "SEO-specific Lighthouse checks" },
                            { name: "Free Mobile Lighthouse Test", href: "/tools/lighthouse-mobile", desc: "Full 4-category mobile audit" },
                            { name: "Free Desktop Lighthouse Test", href: "/tools/lighthouse-desktop", desc: "Desktop performance and compliance" },
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
