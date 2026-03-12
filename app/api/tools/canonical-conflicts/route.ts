import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

async function fetchPage(url: string): Promise<{ html: string; status: number; finalUrl: string } | null> {
    try {
        const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; Free SEO Tools/1.0)" },
            redirect: "follow",
            signal: AbortSignal.timeout(8000),
        });
        return { html: await res.text(), status: res.status, finalUrl: res.url };
    } catch { return null; }
}

function getCanonicals(html: string): string[] {
    const $ = cheerio.load(html);
    const canonicals: string[] = [];
    $("link[rel='canonical']").each((_, el) => {
        const href = $(el).attr("href");
        if (href) canonicals.push(href.trim());
    });
    return canonicals;
}

function extractLinks(html: string, baseUrl: string, sameDomain: string): string[] {
    const $ = cheerio.load(html);
    const links: string[] = [];
    $("a[href]").each((_, el) => {
        try {
            const href = $(el).attr("href")!;
            if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("javascript:")) return;
            const abs = new URL(href, baseUrl).href;
            if (new URL(abs).hostname === sameDomain) links.push(abs.split("#")[0]);
        } catch { }
    });
    return [...new Set(links)];
}

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        let startUrl = url.trim();
        if (!startUrl.startsWith("http")) startUrl = "https://" + startUrl;
        const domain = new URL(startUrl).hostname;

        const visited = new Set<string>();
        const queue = [startUrl];
        const pageData: Record<string, { canonicals: string[]; status: number }> = {};

        // BFS crawl up to 50 pages
        while (queue.length > 0 && visited.size < 50) {
            const batch = queue.splice(0, 5).filter(u => !visited.has(u));
            if (batch.length === 0) continue;
            batch.forEach(u => visited.add(u));

            const results = await Promise.all(batch.map(async (pageUrl) => {
                const res = await fetchPage(pageUrl);
                if (!res) return null;
                const canonicals = getCanonicals(res.html);
                const links = extractLinks(res.html, pageUrl, domain);
                links.filter(l => !visited.has(l)).forEach(l => queue.push(l));
                return { url: pageUrl, canonicals, status: res.status };
            }));

            results.forEach(r => { if (r) pageData[r.url] = { canonicals: r.canonicals, status: r.status }; });
        }

        // Build canonical status map
        const statusMap: Record<string, number> = {};
        await Promise.all(Object.values(pageData).flatMap(p => p.canonicals).map(async (c) => {
            if (statusMap[c] !== undefined) return;
            try {
                const r = await fetch(c, { method: "HEAD", signal: AbortSignal.timeout(5000) });
                statusMap[c] = r.status;
            } catch { statusMap[c] = 0; }
        }));

        const issues: Array<{ url: string; type: string; severity: "critical" | "warning" | "info"; detail: string }> = [];

        Object.entries(pageData).forEach(([pageUrl, { canonicals }]) => {
            if (canonicals.length === 0) {
                issues.push({ url: pageUrl, type: "Missing Canonical", severity: "warning", detail: "No canonical tag found on this page." });
                return;
            }
            if (canonicals.length > 1) {
                issues.push({ url: pageUrl, type: "Multiple Canonicals", severity: "critical", detail: `Found ${canonicals.length} canonical tags: ${canonicals.join(", ")}` });
            }

            canonicals.forEach(canonical => {
                const canonStatus = statusMap[canonical];
                if (canonStatus !== undefined && (canonStatus === 0 || canonStatus >= 400)) {
                    issues.push({ url: pageUrl, type: "Canonical → Non-200", severity: "critical", detail: `Canonical points to ${canonical} which returns HTTP ${canonStatus || "error"}.` });
                }

                // Check for loop (canonical's canonical points back)
                const canonPage = pageData[canonical];
                if (canonPage && canonPage.canonicals.includes(pageUrl) && canonical !== pageUrl) {
                    issues.push({ url: pageUrl, type: "Canonical Loop", severity: "critical", detail: `Canonical loop: ${pageUrl} → ${canonical} → ${pageUrl}` });
                }

                // Homepage misuse: page canonicals to homepage but page isn't homepage
                try {
                    const origin = new URL(startUrl).origin;
                    const canonicalIsHome = canonical === origin + "/" || canonical === origin;
                    const pageIsHome = pageUrl === origin + "/" || pageUrl === origin;
                    if (canonicalIsHome && !pageIsHome) {
                        issues.push({ url: pageUrl, type: "Canonical → Homepage", severity: "warning", detail: `Page canonicals to the homepage (${canonical}), which likely causes indexing loss for this page.` });
                    }
                } catch { }
            });
        });

        return NextResponse.json({
            domain,
            pagesCrawled: Object.keys(pageData).length,
            issueCount: issues.length,
            issues,
            summary: {
                critical: issues.filter(i => i.severity === "critical").length,
                warning: issues.filter(i => i.severity === "warning").length,
                info: issues.filter(i => i.severity === "info").length,
            },
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Crawl failed" }, { status: 500 });
    }
}
