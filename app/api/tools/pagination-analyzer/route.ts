import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer-core";
import { getLaunchOptions } from "@/lib/analysis/browser-config";

const PAGINATION_PARAMS = new Set([
    "page", "p", "pg", "pagenum", "pagenumber", "pageNo", "page_id",
    "offset", "start", "from", "skip",
]);

const FACET_PARAMS = new Set([
    "color", "colour", "size", "sort", "order", "filter", "category", "brand",
    "price", "min_price", "max_price", "rating", "material", "style", "gender",
    "type", "tag", "in_stock",
]);

export async function POST(req: NextRequest) {
    let browser = null;
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        let finalUrl = url.trim();
        if (!finalUrl.startsWith("http")) finalUrl = "https://" + finalUrl;

        // Raw HTML fetch
        const res = await fetch(finalUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
            signal: AbortSignal.timeout(15000),
        });
        const html = await res.text();
        const $ = cheerio.load(html);

        // 1. rel=prev / rel=next
        const relPrev = $("link[rel='prev']").attr("href") || null;
        const relNext = $("link[rel='next']").attr("href") || null;

        // 2. URL parameter analysis
        const parsedUrl = new URL(finalUrl);
        const params = [...parsedUrl.searchParams.entries()];
        const paginationParams = params.filter(([k]) => PAGINATION_PARAMS.has(k.toLowerCase()));
        const facetParams = params.filter(([k]) => FACET_PARAMS.has(k.toLowerCase()));
        const unknownParams = params.filter(([k]) => !PAGINATION_PARAMS.has(k.toLowerCase()) && !FACET_PARAMS.has(k.toLowerCase()));

        // 3. Discover linked paginated/faceted URLs from page
        const linkedParams = new Map<string, number>();
        $("a[href]").each((_, el) => {
            try {
                const href = new URL($(el).attr("href")!, finalUrl).href;
                const p = new URL(href).searchParams;
                p.forEach((_, k) => {
                    if (PAGINATION_PARAMS.has(k.toLowerCase()) || FACET_PARAMS.has(k.toLowerCase())) {
                        linkedParams.set(k, (linkedParams.get(k) || 0) + 1);
                    }
                });
            } catch { }
        });

        // 4. Infinite scroll detection via Puppeteer
        let hasInfiniteScroll = false;
        try {
            const options = await getLaunchOptions();
            browser = await puppeteer.launch(options);
            const page = await browser.newPage();
            await page.goto(finalUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
            hasInfiniteScroll = await page.evaluate(() => {
                const src = [...document.querySelectorAll("script")].map(s => s.textContent || "").join(" ");
                return src.includes("IntersectionObserver") || src.includes("infinite") || src.includes("loadMore") || src.includes("load_more");
            });
            await browser.close();
            browser = null;
        } catch { if (browser) { try { await (browser as any).close(); } catch { } browser = null; } }

        // Score risk
        const riskFactors: string[] = [];
        if (facetParams.length > 0) riskFactors.push(`${facetParams.length} facet parameter(s) in URL`);
        if (paginationParams.length > 0) riskFactors.push(`Pagination parameter (${paginationParams.map(([k]) => k).join(", ")}) detected`);
        if (linkedParams.size > 3) riskFactors.push(`${linkedParams.size} unique filter params linked from this page`);
        if (hasInfiniteScroll) riskFactors.push("Infinite scroll detected — Googlebot may not trigger JS-based loading");
        if (!relNext && !relPrev && paginationParams.length > 0) riskFactors.push("No rel=next/prev despite pagination parameters");

        const risk = riskFactors.length >= 3 ? "high" : riskFactors.length >= 1 ? "medium" : "low";

        return NextResponse.json({
            url: finalUrl,
            pagination: {
                relPrev,
                relNext,
                hasPaginationParams: paginationParams.length > 0,
                paginationParams: paginationParams.map(([k, v]) => ({ key: k, value: v })),
            },
            facets: {
                hasFacetParams: facetParams.length > 0,
                facetParams: facetParams.map(([k, v]) => ({ key: k, value: v })),
                linkedFilterParams: Object.fromEntries(linkedParams),
                unknownParams: unknownParams.map(([k, v]) => ({ key: k, value: v })),
            },
            infiniteScroll: hasInfiniteScroll,
            risk,
            riskFactors,
        });
    } catch (e: any) {
        if (browser) { try { await (browser as any).close(); } catch { } }
        return NextResponse.json({ error: e.message || "Analysis failed" }, { status: 500 });
    }
}
