import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

function computeTextToHtmlRatio(html: string, text: string): number {
    if (!html.length) return 0;
    return +(((text.length / html.length) * 100).toFixed(1));
}

function detectDuplicateParagraphs(paragraphs: string[]): number {
    const seen = new Set<string>();
    let dups = 0;
    for (const p of paragraphs) {
        const normalized = p.toLowerCase().replace(/\s+/g, " ").trim();
        if (normalized.length < 30) continue;
        if (seen.has(normalized)) dups++;
        else seen.add(normalized);
    }
    return dups;
}

function scoreContent(wordCount: number, textToHtml: number, dupParagraphs: number, headingCount: number, wordsPerHeading: number): number {
    let score = 100;
    if (wordCount < 300) score -= 35;
    else if (wordCount < 600) score -= 15;
    else if (wordCount > 2000) score += 5;
    if (textToHtml < 10) score -= 20;
    else if (textToHtml < 20) score -= 10;
    if (dupParagraphs > 0) score -= dupParagraphs * 10;
    if (headingCount === 0) score -= 10;
    if (wordsPerHeading > 500) score -= 10;
    return Math.max(0, Math.min(100, Math.round(score)));
}

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        let finalUrl = url.trim();
        if (!finalUrl.startsWith("http")) finalUrl = "https://" + finalUrl;

        const res = await fetch(finalUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; BlitzGeo-Bot/1.0)" },
            signal: AbortSignal.timeout(12000),
        });
        if (!res.ok) return NextResponse.json({ error: `Page returned ${res.status}` }, { status: 400 });

        const html = await res.text();
        const $ = cheerio.load(html);

        // Remove non-content elements
        $("script, style, nav, header, footer, aside, noscript, [aria-hidden='true']").remove();

        const paragraphs = $("p").map((_, el) => $(el).text()).get();
        const headings = $("h1,h2,h3,h4,h5,h6").map((_, el) => ({ level: el.tagName.toUpperCase(), text: $(el).text().trim() })).get();
        const bodyText = $("body").text().replace(/\s+/g, " ").trim();
        const words = bodyText.split(/\s+/).filter(w => w.length > 2);
        const wordCount = words.length;
        const textToHtml = computeTextToHtmlRatio(html, bodyText);
        const dupParagraphs = detectDuplicateParagraphs(paragraphs);
        const wordsPerHeading = headings.length ? Math.round(wordCount / headings.length) : wordCount;
        const score = scoreContent(wordCount, textToHtml, dupParagraphs, headings.length, wordsPerHeading);

        const suggestions: string[] = [];
        if (wordCount < 300) suggestions.push("Page has fewer than 300 words — expand content with in-depth, original analysis to compete in search results.");
        if (wordCount < 600) suggestions.push("Content depth is below average. Target 800+ words for informational queries.");
        if (textToHtml < 15) suggestions.push("Text-to-HTML ratio is very low. Excess code/markup vs content may signal thin value to crawlers.");
        if (dupParagraphs > 0) suggestions.push(`${dupParagraphs} duplicate paragraph(s) detected — remove or rewrite boilerplate copy.`);
        if (headings.length === 0) suggestions.push("No heading tags found. Structure your content with H2 and H3 sections for readability and SEO.");
        if (wordsPerHeading > 400) suggestions.push("Long sections without subheadings. Add H3 tags every 300–400 words to improve scanability.");

        return NextResponse.json({
            score,
            wordCount,
            textToHtmlRatio: textToHtml,
            paragraphCount: paragraphs.length,
            duplicateParagraphs: dupParagraphs,
            headingCount: headings.length,
            headings: headings.slice(0, 20),
            wordsPerHeading,
            suggestions,
            scoreLabel: score >= 70 ? "Good" : score >= 45 ? "Needs Work" : "Thin Content",
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Analysis failed" }, { status: 500 });
    }
}
