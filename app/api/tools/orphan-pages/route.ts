import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { parseStringPromise } from "xml2js";

async function fetchSitemapUrls(sitemapUrl: string): Promise<string[]> {
    try {
        const res = await fetch(sitemapUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; Free SEO Tools/1.0)" },
            signal: AbortSignal.timeout(10000),
        });
        const text = await res.text();
        const parsed = await parseStringPromise(text);

        // Sitemap index
        if (parsed.sitemapindex) {
            const subMaps = parsed.sitemapindex.sitemap?.flatMap((s: any) => s.loc || []) || [];
            const subUrls = await Promise.all(subMaps.slice(0, 5).map(fetchSitemapUrls));
            return subUrls.flat();
        }

        // Regular sitemap
        return parsed.urlset?.url?.flatMap((u: any) => u.loc || []) || [];
    } catch { return []; }
}

async function crawlPageLinks(startUrl: string, domain: string, limit = 50): Promise<Set<string>> {
    const visited = new Set<string>();
    const queue = [startUrl];

    while (queue.length > 0 && visited.size < limit) {
        const url = queue.shift()!;
        if (visited.has(url)) continue;
        visited.add(url);

        try {
            const res = await fetch(url, {
                headers: { "User-Agent": "Mozilla/5.0 (compatible; Free SEO Tools/1.0)" },
                signal: AbortSignal.timeout(6000),
                redirect: "follow",
            });
            const html = await res.text();
            const $ = cheerio.load(html);
            $("a[href]").each((_, el) => {
                try {
                    const href = new URL($(el).attr("href")!, url).href.split("#")[0].split("?")[0];
                    if (new URL(href).hostname === domain && !visited.has(href)) queue.push(href);
                } catch { }
            });
        } catch { }
    }

    return visited;
}

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        let startUrl = url.trim();
        if (!startUrl.startsWith("http")) startUrl = "https://" + startUrl;
        const domain = new URL(startUrl).hostname;
        const origin = new URL(startUrl).origin;

        // Discover sitemap
        let sitemapUrls: string[] = [];
        const sitemapCandidates = [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];

        // Also check robots.txt for sitemap directive
        try {
            const robots = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(5000) });
            const robotsText = await robots.text();
            const sitemapLine = robotsText.split("\n").find(l => l.toLowerCase().startsWith("sitemap:"));
            if (sitemapLine) {
                const sitemapHref = sitemapLine.split(":").slice(1).join(":").trim();
                if (sitemapHref) sitemapCandidates.unshift(sitemapHref);
            }
        } catch { }

        for (const candidate of sitemapCandidates) {
            sitemapUrls = await fetchSitemapUrls(candidate);
            if (sitemapUrls.length > 0) break;
        }

        // Crawl linked pages
        const crawledUrls = await crawlPageLinks(startUrl, domain, 50);

        // Normalize URLs (remove trailing slash for comparison)
        const normalize = (u: string) => u.replace(/\/$/, "").toLowerCase();
        const sitemapSet = new Set(sitemapUrls.map(normalize));
        const crawledSet = new Set([...crawledUrls].map(normalize));

        const inSitemapNotCrawled = [...sitemapSet].filter(u => !crawledSet.has(u)).map(u => sitemapUrls.find(s => normalize(s) === u) || u);
        const crawledNotInSitemap = [...crawledSet].filter(u => !sitemapSet.has(u)).map(u => [...crawledUrls].find(c => normalize(c) === u) || u);

        return NextResponse.json({
            domain,
            sitemapUrlCount: sitemapUrls.length,
            crawledUrlCount: crawledUrls.size,
            orphans: inSitemapNotCrawled.slice(0, 50),
            unlisted: crawledNotInSitemap.slice(0, 50),
            summary: {
                orphanCount: inSitemapNotCrawled.length,
                unlistedCount: crawledNotInSitemap.length,
            },
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Analysis failed" }, { status: 500 });
    }
}
