import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

const MAX_CRAWL = 100;

function normalizeUrl(url: string, base: string): string | null {
    try {
        const u = new URL(url, base);
        u.hash = "";
        if (!["http:", "https:"].includes(u.protocol)) return null;
        return u.href.replace(/\/$/, "") || u.href;
    } catch {
        return null;
    }
}

async function fetchPage(url: string): Promise<{ html: string; status: number; finalUrl: string } | null> {
    try {
        const res = await fetch(url, {
            redirect: "follow",
            headers: { "User-Agent": "Free SEO Tools Bot/1.0 (+https://freeseotools.com)" },
            signal: AbortSignal.timeout(8000),
        });
        const html = await res.text();
        return { html, status: res.status, finalUrl: res.url };
    } catch {
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const { domain, limit = 25 } = await req.json();
        if (!domain) return NextResponse.json({ error: "Domain is required" }, { status: 400 });

        const crawlLimit = Math.min(Number(limit) || 25, MAX_CRAWL);
        let startUrl = domain.startsWith("http") ? domain : `https://${domain}`;
        startUrl = startUrl.replace(/\/$/, "");

        const origin = new URL(startUrl).origin;
        const visited = new Map<string, { status: number; inLinks: string[]; outLinks: string[]; depth: number }>();
        const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];

        while (queue.length > 0 && visited.size < crawlLimit) {
            const { url, depth } = queue.shift()!;
            if (visited.has(url)) continue;

            const result = await fetchPage(url);
            if (!result) {
                visited.set(url, { status: 0, inLinks: [], outLinks: [], depth });
                continue;
            }

            const $ = cheerio.load(result.html);
            const outLinks: string[] = [];

            $("a[href]").each((_, el) => {
                const href = $(el).attr("href");
                if (!href) return;
                const normalized = normalizeUrl(href, url);
                if (!normalized) return;
                try {
                    const u = new URL(normalized);
                    if (u.origin === origin) {
                        if (normalized !== url) outLinks.push(normalized);
                        if (!visited.has(normalized) && !queue.find(q => q.url === normalized)) {
                            queue.push({ url: normalized, depth: depth + 1 });
                        }
                    }
                } catch { }
            });

            const uniqueOut = [...new Set(outLinks)];
            visited.set(url, { status: result.status, inLinks: [], outLinks: uniqueOut, depth });
        }

        // Build in-link map
        for (const [url, data] of visited.entries()) {
            for (const outLink of data.outLinks) {
                if (visited.has(outLink)) {
                    visited.get(outLink)!.inLinks.push(url);
                }
            }
        }

        const pages = Array.from(visited.entries()).map(([url, d]) => ({
            url,
            status: d.status,
            depth: d.depth,
            inLinkCount: d.inLinks.length,
            outLinkCount: d.outLinks.length,
            inLinks: d.inLinks.slice(0, 10),
        }));

        const orphans = pages.filter(p => p.inLinkCount === 0 && p.url !== startUrl);
        const overLinked = pages.filter(p => p.outLinkCount > 100);
        const deepPages = pages.filter(p => p.depth > 3);
        const totalLinks = pages.reduce((s, p) => s + p.outLinkCount, 0);
        const avgLinks = pages.length ? (totalLinks / pages.length).toFixed(1) : "0";

        return NextResponse.json({
            summary: {
                totalCrawled: pages.length,
                totalLinks,
                orphanCount: orphans.length,
                avgLinksPerPage: avgLinks,
                deepPageCount: deepPages.length,
                crawlLimit,
            },
            pages,
            orphans: orphans.slice(0, 50),
            overLinked: overLinked.slice(0, 20),
            deepPages: deepPages.slice(0, 30),
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Crawl failed" }, { status: 500 });
    }
}
