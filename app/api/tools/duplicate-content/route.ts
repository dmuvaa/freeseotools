import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

function tokenize(text: string): Set<string> {
    return new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 3));
}

function jaccard(a: Set<string>, b: Set<string>): number {
    const intersection = [...a].filter(w => b.has(w)).length;
    const union = new Set([...a, ...b]).size;
    return union === 0 ? 1 : intersection / union;
}

async function fetchPageData(url: string) {
    try {
        const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; Free SEO Tools/1.0)" },
            signal: AbortSignal.timeout(8000),
            redirect: "follow",
        });
        const html = await res.text();
        const $ = cheerio.load(html);
        $("script, style, noscript, nav, footer, header").remove();
        const bodyText = $.text().replace(/\s+/g, " ").trim();
        const title = $("title").text().trim();
        const metaDesc = $("meta[name='description']").attr("content")?.trim() || "";
        const links: string[] = [];
        $("a[href]").each((_, el) => {
            try {
                const href = new URL($(el).attr("href")!, url).href.split("#")[0];
                if (new URL(href).hostname === new URL(url).hostname) links.push(href);
            } catch { }
        });
        return { url, bodyText, title, metaDesc, links: [...new Set(links)], status: res.status };
    } catch { return null; }
}

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        let startUrl = url.trim();
        if (!startUrl.startsWith("http")) startUrl = "https://" + startUrl;
        const domain = new URL(startUrl).hostname;

        // BFS crawl up to 30 pages
        const visited = new Set<string>();
        const queue = [startUrl];
        const pages: Array<{ url: string; bodyText: string; title: string; metaDesc: string }> = [];

        while (queue.length > 0 && visited.size < 30) {
            const batch = queue.splice(0, 5).filter(u => !visited.has(u));
            if (!batch.length) continue;
            batch.forEach(u => visited.add(u));

            const results = await Promise.all(batch.map(fetchPageData));
            results.forEach(r => {
                if (!r) return;
                pages.push({ url: r.url, bodyText: r.bodyText, title: r.title, metaDesc: r.metaDesc });
                r.links.filter(l => !visited.has(l)).slice(0, 10).forEach(l => queue.push(l));
            });
        }

        // Compute similarity pairs
        const clusters: Array<{ url1: string; url2: string; similarity: number }> = [];
        const tokenCache = new Map<string, Set<string>>();
        pages.forEach(p => tokenCache.set(p.url, tokenize(p.bodyText)));

        for (let i = 0; i < pages.length; i++) {
            for (let j = i + 1; j < pages.length; j++) {
                const sim = jaccard(tokenCache.get(pages[i].url)!, tokenCache.get(pages[j].url)!);
                if (sim >= 0.5) {
                    clusters.push({
                        url1: pages[i].url,
                        url2: pages[j].url,
                        similarity: Math.round(sim * 100),
                    });
                }
            }
        }
        clusters.sort((a, b) => b.similarity - a.similarity);

        // Duplicate titles
        const titleMap = new Map<string, string[]>();
        pages.forEach(p => {
            if (!p.title) return;
            const existing = titleMap.get(p.title) || [];
            existing.push(p.url);
            titleMap.set(p.title, existing);
        });
        const duplicateTitles = [...titleMap.entries()]
            .filter(([, urls]) => urls.length > 1)
            .map(([title, urls]) => ({ title, urls }));

        // Duplicate meta descriptions
        const metaMap = new Map<string, string[]>();
        pages.forEach(p => {
            if (!p.metaDesc) return;
            const existing = metaMap.get(p.metaDesc) || [];
            existing.push(p.url);
            metaMap.set(p.metaDesc, existing);
        });
        const duplicateMetas = [...metaMap.entries()]
            .filter(([, urls]) => urls.length > 1)
            .map(([meta, urls]) => ({ meta: meta.slice(0, 100), urls }));

        return NextResponse.json({
            domain,
            pagesCrawled: pages.length,
            clusters: clusters.slice(0, 30),
            duplicateTitles,
            duplicateMetas,
            summary: {
                highSimilarity: clusters.filter(c => c.similarity >= 80).length,
                mediumSimilarity: clusters.filter(c => c.similarity >= 60 && c.similarity < 80).length,
                duplicateTitleCount: duplicateTitles.length,
                duplicateMetaCount: duplicateMetas.length,
            },
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Analysis failed" }, { status: 500 });
    }
}
