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

// Common section paths that often have pagination
const SECTION_PATHS = ["/blog", "/glossary", "/articles", "/news", "/products", "/resources", "/docs", "/categories"];

interface PagePagination {
    url: string;
    relPrev: string | null;
    relNext: string | null;
    hasPaginationParams: boolean;
    paginationParams: { key: string; value: string }[];
    paginatedLinksFound: number;
    canonical: string | null;
}

async function analyzePagePagination(pageUrl: string, _baseHostname: string): Promise<PagePagination | null> {
    try {
        const res = await fetch(pageUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return null;
        const html = await res.text();
        const $ = cheerio.load(html);

        const relPrev = $("link[rel='prev']").attr("href") || null;
        const relNext = $("link[rel='next']").attr("href") || null;
        const canonical = $("link[rel='canonical']").attr("href") || null;

        const parsedUrl = new URL(pageUrl);
        const params = [...parsedUrl.searchParams.entries()];
        const paginationParams = params.filter(([k]) => PAGINATION_PARAMS.has(k.toLowerCase()));

        // Count paginated links on page
        let paginatedLinksFound = 0;
        $("a[href]").each((_, el) => {
            try {
                const href = new URL($(el).attr("href")!, pageUrl).href;
                const p = new URL(href).searchParams;
                p.forEach((_, k) => {
                    if (PAGINATION_PARAMS.has(k.toLowerCase())) paginatedLinksFound++;
                });
            } catch { }
        });

        return {
            url: pageUrl,
            relPrev,
            relNext,
            hasPaginationParams: paginationParams.length > 0,
            paginationParams: paginationParams.map(([k, v]) => ({ key: k, value: v })),
            paginatedLinksFound,
            canonical,
        };
    } catch {
        return null;
    }
}

export async function POST(req: NextRequest) {
    let browser = null;
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        let finalUrl = url.trim();
        if (!finalUrl.startsWith("http")) finalUrl = "https://" + finalUrl;
        const baseHost = new URL(finalUrl).hostname;
        const baseOrigin = new URL(finalUrl).origin;

        // 1. Analyze the target URL itself
        const mainPage = await analyzePagePagination(finalUrl, baseHost);

        // 2. Discover section pages to analyze (e.g. /blog, /glossary)
        const sectionUrls: string[] = [];
        try {
            const mainRes = await fetch(finalUrl, {
                headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
                signal: AbortSignal.timeout(10000),
            });
            const mainHtml = await mainRes.text();
            const $main = cheerio.load(mainHtml);

            // Find linked section pages
            const linkedPaths = new Set<string>();
            $main("a[href]").each((_, el) => {
                try {
                    const href = new URL($main(el).attr("href")!, finalUrl);
                    if (href.hostname === baseHost) {
                        const path = href.pathname.replace(/\/$/, "");
                        for (const sp of SECTION_PATHS) {
                            if (path === sp || path.startsWith(sp + "/page/") || path.startsWith(sp + "?")) {
                                linkedPaths.add(baseOrigin + sp);
                                linkedPaths.add(href.href.split("?")[0].split("#")[0]);
                            }
                        }
                    }
                } catch { }
            });

            // Also try common section paths even if not linked
            for (const sp of SECTION_PATHS) {
                linkedPaths.add(baseOrigin + sp);
            }

            // Limit to 12 unique section pages for analysis
            for (const u of linkedPaths) {
                if (sectionUrls.length >= 12) break;
                if (u !== finalUrl) sectionUrls.push(u);
            }
        } catch { }

        // 3. Analyze section pages concurrently
        const sectionResults = (await Promise.all(
            sectionUrls.map(u => analyzePagePagination(u, baseHost))
        )).filter(Boolean) as PagePagination[];

        // 4. URL parameter analysis from main page
        const parsedUrl = new URL(finalUrl);
        const params = [...parsedUrl.searchParams.entries()];
        const facetParams = params.filter(([k]) => FACET_PARAMS.has(k.toLowerCase()));
        const unknownParams = params.filter(([k]) => !PAGINATION_PARAMS.has(k.toLowerCase()) && !FACET_PARAMS.has(k.toLowerCase()));

        // 5. Linked filter params from main page
        const linkedParams = new Map<string, number>();
        try {
            const res2 = await fetch(finalUrl, {
                headers: { "User-Agent": "Mozilla/5.0 (compatible; Free SEO Tools/1.0)" },
                signal: AbortSignal.timeout(8000),
            });
            const html2 = await res2.text();
            const $2 = cheerio.load(html2);
            $2("a[href]").each((_, el) => {
                try {
                    const href = new URL($2(el).attr("href")!, finalUrl).href;
                    const p = new URL(href).searchParams;
                    p.forEach((_, k) => {
                        if (PAGINATION_PARAMS.has(k.toLowerCase()) || FACET_PARAMS.has(k.toLowerCase())) {
                            linkedParams.set(k, (linkedParams.get(k) || 0) + 1);
                        }
                    });
                } catch { }
            });
        } catch { }

        // 6. Infinite scroll detection via Puppeteer
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

        // 7. Compute risk factors
        const riskFactors: string[] = [];
        if (facetParams.length > 0) riskFactors.push(`${facetParams.length} facet parameter(s) in URL`);
        if (mainPage?.hasPaginationParams) riskFactors.push(`Pagination parameter detected on main URL`);
        if (linkedParams.size > 3) riskFactors.push(`${linkedParams.size} unique filter params linked from this page`);
        if (hasInfiniteScroll) riskFactors.push("Infinite scroll detected — Googlebot may not trigger JS-based loading");
        if (!mainPage?.relNext && !mainPage?.relPrev && mainPage?.hasPaginationParams) riskFactors.push("No rel=next/prev despite pagination parameters");

        // Check sections for pagination issues
        const sectionsWithPagination = sectionResults.filter(s => s.relNext || s.paginatedLinksFound > 0 || s.hasPaginationParams);
        const sectionsWithoutRelTags = sectionsWithPagination.filter(s => !s.relNext && !s.relPrev);
        if (sectionsWithoutRelTags.length > 0) {
            riskFactors.push(`${sectionsWithoutRelTags.length} paginated section(s) missing rel=next/prev tags`);
        }
        if (sectionsWithPagination.length > 0) {
            riskFactors.push(`${sectionsWithPagination.length} section(s) detected with pagination (e.g. blog, glossary)`);
        }

        const risk = riskFactors.length >= 3 ? "high" : riskFactors.length >= 1 ? "medium" : "low";

        return NextResponse.json({
            url: finalUrl,
            pagination: {
                relPrev: mainPage?.relPrev || null,
                relNext: mainPage?.relNext || null,
                hasPaginationParams: mainPage?.hasPaginationParams || false,
                paginationParams: mainPage?.paginationParams || [],
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
            // NEW: Section-level pagination analysis
            sections: sectionResults.map(s => ({
                url: s.url,
                relPrev: s.relPrev,
                relNext: s.relNext,
                paginatedLinksFound: s.paginatedLinksFound,
                canonical: s.canonical,
                hasPagination: s.relNext !== null || s.paginatedLinksFound > 0 || s.hasPaginationParams,
            })),
            sectionSummary: {
                sectionsAnalyzed: sectionResults.length,
                sectionsWithPagination: sectionsWithPagination.length,
                sectionsMissingRelTags: sectionsWithoutRelTags.length,
            },
        });
    } catch (e: any) {
        if (browser) { try { await (browser as any).close(); } catch { } }
        return NextResponse.json({ error: e.message || "Analysis failed" }, { status: 500 });
    }
}
