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

export async function POST(req: NextRequest) {
    let browser = null;
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

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

        return NextResponse.json({
            url: finalUrl,
            raw: {
                wordCount: rawWords.length,
                linkCount: rawLinks.length,
            },
            rendered: {
                wordCount: renderedWords.length,
                linkCount: renderedLinks.length,
            },
            diff: {
                wordCountDiff: renderedWords.length - rawWords.length,
                linkCountDiff: renderedLinks.length - rawLinks.length,
                jsOnlyLinks,
                jsOnlyContent,
                missingFromRaw,
                similarity,
            },
        });
    } catch (e: any) {
        if (browser) { try { await (browser as any).close(); } catch { } }
        return NextResponse.json({ error: e.message || "Analysis failed" }, { status: 500 });
    }
}
