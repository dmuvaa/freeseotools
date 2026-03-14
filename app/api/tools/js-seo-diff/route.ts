import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer-core";
import { getLaunchOptions } from "@/lib/analysis/browser-config";

export const runtime = "nodejs";

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
    let renderedHtml: string | null = null;
    try {
        let finalUrl = url.trim();
        if (!finalUrl.startsWith("http")) finalUrl = "https://" + finalUrl;

        // 1. Raw HTML
        const rawRes = await fetch(finalUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
            signal: AbortSignal.timeout(15000),
        });
        const rawHtml = await rawRes.text();

        // 2. Rendered HTML via Puppeteer
        const options = await getLaunchOptions();
        browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        try {
            // Stage 1: Attempt standard navigation
            await page.goto(finalUrl, { 
                waitUntil: "domcontentloaded", 
                timeout: 20000 
            });

            // Stage 2: Wait for network activity to settle (best effort)
            try {
                await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 });
            } catch {
                // Ignore network idle timeout, we have domcontentloaded
            }

            // Small buffer for potential JS execution
            await new Promise(r => setTimeout(r, 1000));
            renderedHtml = await page.content();
        } catch (gotoError: any) {
            console.warn(`Puppeteer navigation warning for ${finalUrl}: ${gotoError.message}`);
            // Fallback: try to get content one last time if the page/frame still exists
            try {
                if (!page.isClosed()) {
                    renderedHtml = await page.content();
                }
            } catch { }
            
            // If we still don't have renderedHtml, we can't proceed with rendering analysis
            if (!renderedHtml) throw gotoError;
        } finally {
            if (browser) await browser.close();
            browser = null;
        }

        // Analysis
        const rawWords = extractWords(rawHtml);
        const renderedWords = extractWords(renderedHtml!);
        const rawLinks = extractLinks(rawHtml, finalUrl);
        const renderedLinks = extractLinks(renderedHtml!, finalUrl);
        const rawSnippets = new Set(extractTextSnippets(rawHtml));
        const renderedSnippets = extractTextSnippets(renderedHtml!);

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
    } finally {
        if (browser) { try { await (browser as any).close(); } catch { } }
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
