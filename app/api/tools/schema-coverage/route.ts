import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

function extractSchemaTypes(html: string): { types: string[]; errors: string[]; warnings: string[]; jsonLd: string[] } {
    const $ = cheerio.load(html);
    const types: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const jsonLd: string[] = [];

    $("script[type='application/ld+json']").each((_, el) => {
        const raw = $(el).html() || "";
        jsonLd.push(raw);
        try {
            const parsed = JSON.parse(raw);
            if (!parsed["@context"]) {
                warnings.push("Missing @context in JSON-LD block.");
            }
            
            const items = Array.isArray(parsed) ? parsed : [parsed];
            items.forEach((item: any) => {
                if (item["@type"]) {
                    const t = Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]];
                    types.push(...t);

                    // Basic validation heuristics
                    if (item["@type"] === "WebPage" && !item.name) {
                        warnings.push("WebPage is missing the 'name' property.");
                    }
                    if (item["@type"] === "WebPage" && !item.description) {
                        warnings.push("WebPage is missing the 'description' property.");
                    }
                    if (item["@type"] === "Offer" && item.position) {
                        // User example specifically mentioned position in Offer as a warning
                        warnings.push("The property 'position' is not recognized by schema.org for an object of type Offer.");
                    }
                } else {
                    warnings.push("Object is missing '@type' identifier.");
                }
            });
        } catch (e: any) {
            errors.push(`Parse error: ${e.message?.slice(0, 80)}`);
        }
    });

    // Microdata
    $("[itemtype]").each((_, el) => {
        const itemtype = $(el).attr("itemtype") || "";
        const type = itemtype.split("/").pop();
        if (type) types.push(`${type} (microdata)`);
    });

    return { types: [...new Set(types)], errors, warnings, jsonLd };
}

async function fetchPage(url: string) {
    try {
        // Fix for UNABLE_TO_GET_ISSUER_CERT_LOCALLY
        if (process.env.NODE_ENV === 'development') {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }
        const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; Free SEO Tools/1.0)" },
            signal: AbortSignal.timeout(8000),
            redirect: "follow",
        });
        const html = await res.text();
        const $ = cheerio.load(html);
        const links: string[] = [];
        $("a[href]").each((_, el) => {
            try {
                const href = new URL($(el).attr("href")!, url).href.split("#")[0];
                if (new URL(href).hostname === new URL(url).hostname) links.push(href);
            } catch { }
        });
        return { html, links: [...new Set(links)], status: res.status };
    } catch { return null; }
}

export async function performSchemaAnalysis(url: string, maxPages: number = 50) {
    let startUrl = url.trim();
    if (!startUrl.startsWith("http")) startUrl = "https://" + startUrl;

    const visited = new Set<string>();
    const queue = [startUrl];
    const pageResults: Array<{
        url: string;
        schemaTypes: string[];
        jsonLd: string[];
        errors: string[];
        hasSchema: boolean;
    }> = [];

    while (queue.length > 0 && visited.size < maxPages) {
        const batch = queue.splice(0, 5).filter(u => !visited.has(u));
        if (!batch.length) continue;
        batch.forEach(u => visited.add(u));

        const results = await Promise.all(batch.map(async (pageUrl) => {
            const res = await fetchPage(pageUrl);
            if (!res) return null;
            const { types, errors, warnings, jsonLd } = extractSchemaTypes(res.html);
            res.links.filter(l => !visited.has(l)).slice(0, 10).forEach(l => queue.push(l));
            return {
                url: pageUrl,
                schemaTypes: types,
                jsonLd,
                errors,
                warnings: warnings.length > 0 ? warnings : undefined,
                hasSchema: types.length > 0,
            };
        }));

        results.forEach(r => { if (r) pageResults.push(r); });
    }

    // Aggregate schema types across site
    const allTypes = new Map<string, number>();
    pageResults.forEach(p => {
        p.schemaTypes.forEach(t => allTypes.set(t, (allTypes.get(t) || 0) + 1));
    });

    const pagesWithSchema = pageResults.filter(p => p.hasSchema).length;
    const pagesWithoutSchema = pageResults.filter(p => !p.hasSchema).length;
    const pagesWithErrors = pageResults.filter(p => p.errors.length > 0).length;

    return {
        pagesCrawled: pageResults.length,
        pagesWithSchema,
        pagesWithoutSchema,
        pagesWithErrors,
        schemaTypeDistribution: Object.fromEntries([...allTypes.entries()].sort((a, b) => b[1] - a[1])),
        pages: pageResults.sort((a, b) => b.schemaTypes.length - a.schemaTypes.length),
    };
}

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        const data = await performSchemaAnalysis(url);
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Analysis failed" }, { status: 500 });
    }
}
