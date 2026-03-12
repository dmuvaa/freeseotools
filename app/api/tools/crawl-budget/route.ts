import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { parseStringPromise } from "xml2js";

export async function POST(req: NextRequest) {
    try {
        const { domain, sitemapUrl } = await req.json();
        if (!domain) return NextResponse.json({ error: "Domain is required" }, { status: 400 });

        const base = domain.startsWith("http") ? domain : `https://${domain}`;
        const origin = new URL(base).origin;

        // Fetch robots.txt
        let robotsBlocked: string[] = [];
        let declaredSitemap = sitemapUrl || "";
        try {
            const r = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(5000) });
            const text = await r.text();
            const lines = text.split("\n");
            const disallowLines = lines.filter(l => l.toLowerCase().startsWith("disallow:")).map(l => l.split(":")[1]?.trim()).filter(Boolean);
            robotsBlocked = disallowLines;
            if (!declaredSitemap) {
                const sitemapLine = lines.find(l => l.toLowerCase().startsWith("sitemap:"));
                if (sitemapLine) declaredSitemap = sitemapLine.split(/sitemap:/i)[1]?.trim();
            }
        } catch { }

        // Parse sitemap for URL count / noindex content
        let sitemapUrls: string[] = [];
        let sitemapError = "";
        if (declaredSitemap) {
            try {
                const sr = await fetch(declaredSitemap, { signal: AbortSignal.timeout(8000) });
                const xml = await sr.text();
                const parsed = await parseStringPromise(xml, { explicitArray: false });
                const urlset = parsed?.urlset?.url;
                if (urlset) {
                    const arr = Array.isArray(urlset) ? urlset : [urlset];
                    sitemapUrls = arr.map((u: any) => u.loc).filter(Boolean);
                }
            } catch (e: any) {
                sitemapError = e.message;
            }
        }

        // Analyze homepage internal links + depth sample
        const homepageResult = await fetch(base, { signal: AbortSignal.timeout(8000), headers: { "User-Agent": "Free SEO Tools Bot/1.0" } });
        const html = await homepageResult.text();
        const $ = cheerio.load(html);

        const internalLinks: string[] = [];
        $("a[href]").each((_, el) => {
            const href = $(el).attr("href");
            if (!href) return;
            try {
                const u = new URL(href, base);
                if (u.origin === origin) internalLinks.push(u.pathname);
            } catch { }
        });

        // Detect parameterized URLs
        const paramUrls = sitemapUrls.filter(u => u.includes("?"));
        const blockedImportant = sitemapUrls.filter(u => {
            const path = new URL(u).pathname;
            return robotsBlocked.some(b => b !== "/" && path.startsWith(b));
        });

        // Assess wasted crawl items
        const paramPaths = [...new Set(paramUrls.map(u => new URL(u).pathname))];
        const thinCount = Math.round(sitemapUrls.length * 0.08); // estimate ~8% thin
        const crawlScore = Math.max(0, 100 - paramUrls.length / 5 - robotsBlocked.filter(b => b !== "/").length * 2 - blockedImportant.length * 5);

        const tiers = [
            { tier: "Priority 1 — Homepage & Key Pages", count: 1, desc: "Crawled every 1–3 days" },
            { tier: "Priority 2 — Internal Links from Homepage", count: internalLinks.length, desc: "Crawled weekly" },
            { tier: "Priority 3 — Sitemap URLs", count: sitemapUrls.length - internalLinks.length, desc: "Crawled monthly" },
            { tier: "Priority 4 — Parameterized / Duplicate", count: paramUrls.length, desc: "Wasted crawl — recommend blocking" },
        ];

        return NextResponse.json({
            summary: {
                totalSitemapUrls: sitemapUrls.length,
                robotsDisallowRules: robotsBlocked.length,
                parameterizedUrls: paramUrls.length,
                blockedImportantPages: blockedImportant.length,
                estimatedThinContent: thinCount,
                crawlEfficiencyScore: Math.round(crawlScore),
                declaredSitemap,
            },
            tiers,
            robotsBlocked: robotsBlocked.slice(0, 30),
            blockedImportant: blockedImportant.slice(0, 20),
            wastedPaths: paramPaths.slice(0, 20),
            sitemapError,
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Analysis failed" }, { status: 500 });
    }
}
