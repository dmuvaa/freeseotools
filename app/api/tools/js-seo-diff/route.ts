import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { chromium } from "playwright";

function extractWords(html: string): string[] {
    const $ = cheerio.load(html);
    $("script, style, noscript").remove();
    const text = $.text().replace(/\s+/g, " ").trim();
    return text.split(/\s+/).filter(Boolean);
}

function extractLinks(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const links: string[] = [];
    $("a[href]").each((_, el) => {
        try {
            const href = $(el).attr("href")!;
            if (!href || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("#")) return;
            links.push(new URL(href, baseUrl).href);
        } catch { }
    });
    return [...new Set(links)];
}

function extractSEO(html: string): { title: string; description: string; robots: string; canonical: string; h1Count: number } {
    const $ = cheerio.load(html);
    return {
        title: $("title").text().trim(),
        description: $("meta[name='description']").attr("content") || "",
        robots: $("meta[name='robots']").attr("content") || "",
        canonical: $("link[rel='canonical']").attr("href") || "",
        h1Count: $("h1").length
    };
}

function extractTextSnippets(html: string): string[] {
    const $ = cheerio.load(html);
    $("script, style, noscript").remove();
    const snippets: string[] = [];
    $("p, h1, h2, h3, h4, h5, h6, li, span, div").each((_, el) => {
        const text = $(el).clone().children().remove().end().text().trim();
        if (text.length > 20) snippets.push(text.slice(0, 100));
    });
    return snippets;
}

export async function performJsRenderingAnalysis(url: string) {
    let browser = null;
    try {
        let finalUrl = url.trim();
        if (!finalUrl.startsWith("http")) finalUrl = "https://" + finalUrl;

        // 1. Raw HTML
        const rawRes = await fetch(finalUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
            signal: AbortSignal.timeout(15000),
        });
        const rawHtml = await rawRes.text();

        // 2. Rendered HTML via Playwright
        browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
        const page = await browser.newPage();
        await page.goto(finalUrl, { waitUntil: "networkidle", timeout: 30000 });
        await page.waitForTimeout(2000);
        const renderedHtml = await page.content();
        await browser.close();
        browser = null;

        // Analysis
        const rawWords = extractWords(rawHtml);
        const renderedWords = extractWords(renderedHtml);
        const rawLinks = extractLinks(rawHtml, finalUrl);
        const renderedLinks = extractLinks(renderedHtml, finalUrl);
        const rawSnippets = new Set(extractTextSnippets(rawHtml));
        const renderedSnippets = extractTextSnippets(renderedHtml);

        const jsOnlyLinks = renderedLinks.filter(l => !rawLinks.includes(l)).slice(0, 50);
        const jsOnlyContent = renderedSnippets.filter(s => !rawSnippets.has(s)).slice(0, 20);
        const missingFromRaw = jsOnlyLinks.length;

        // Similarity score
        const rawWordSet = new Set(rawWords.map(w => w.toLowerCase()));
        const renderedWordSet = new Set(renderedWords.map(w => w.toLowerCase()));
        const intersection = [...rawWordSet].filter(w => renderedWordSet.has(w)).length;
        const union = new Set([...rawWordSet, ...renderedWordSet]).size;
        const similarity = union > 0 ? Math.round((intersection / union) * 100) : 100;

        // SEO Comparison
        const rawSEO = extractSEO(rawHtml);
        const renderedSEO = extractSEO(renderedHtml);

        return {
            url: finalUrl,
            raw: {
                wordCount: rawWords.length,
                linkCount: rawLinks.length,
                seo: rawSEO
            },
            rendered: {
                wordCount: renderedWords.length,
                linkCount: renderedLinks.length,
                seo: renderedSEO
            },
            diff: {
                wordCountDiff: renderedWords.length - rawWords.length,
                linkCountDiff: renderedLinks.length - rawLinks.length,
                jsOnlyLinks,
                jsOnlyContent,
                missingFromRaw,
                similarity,
                seoDiff: {
                    titleMatch: rawSEO.title === renderedSEO.title,
                    descriptionMatch: rawSEO.description === renderedSEO.description,
                    robotsMatch: rawSEO.robots === renderedSEO.robots,
                    canonicalMatch: rawSEO.canonical === renderedSEO.canonical,
                    h1Match: rawSEO.h1Count === renderedSEO.h1Count,
                }
            },
        };
    } catch (e: any) {
        if (browser) { try { await (browser as any).close(); } catch { } }
        throw e;
    }
}

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        const data = await performJsRenderingAnalysis(url);
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Analysis failed" }, { status: 500 });
    }
}
