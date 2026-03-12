import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

function tokenize(text: string): string[] {
    const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "that", "this", "these", "those", "it", "its", "from", "by", "as", "into", "through", "during", "before", "after", "above", "below", "up", "down", "out", "off", "over", "under", "again", "then", "once", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very"]);
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
}

function tfIdf(docTokens: string[], keyword: string): { freq: number; density: number; score: number } {
    const kw = keyword.toLowerCase();
    const kwWords = kw.split(/\s+/);
    const freq = docTokens.filter(t => t === kw || kwWords.includes(t)).length;
    const density = docTokens.length ? +((freq / docTokens.length) * 100).toFixed(2) : 0;
    return { freq, density, score: Math.min(100, freq * 5) };
}

function similarity(tokensA: string[], tokensB: string[]): number {
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);
    const intersection = [...setA].filter(t => setB.has(t)).length;
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : +((intersection / union) * 100).toFixed(1);
}

async function fetchPageData(url: string) {
    const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Free SEO Tools Bot/1.0)" },
        signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    $("script,style,nav,footer,header").remove();

    const title = $("title").text().trim();
    const h1 = $("h1").first().text().trim();
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const tokens = tokenize(bodyText);

    return { url, title, h1, tokens, wordCount: tokens.length };
}

export async function POST(req: NextRequest) {
    try {
        const { urls, keyword } = await req.json();
        if (!urls || !Array.isArray(urls) || urls.length < 2) {
            return NextResponse.json({ error: "Please provide at least 2 URLs" }, { status: 400 });
        }
        if (urls.length > 10) return NextResponse.json({ error: "Maximum 10 URLs allowed" }, { status: 400 });
        if (!keyword?.trim()) return NextResponse.json({ error: "Target keyword is required" }, { status: 400 });

        const normalizedUrls = urls.map((u: string) => {
            u = u.trim();
            if (!u.startsWith("http")) u = "https://" + u;
            return u;
        });

        const pages = await Promise.all(normalizedUrls.map(fetchPageData));

        // Compute pairwise similarity
        const pairs: Array<{ urlA: string; urlB: string; similarity: number; risk: string }> = [];
        for (let i = 0; i < pages.length; i++) {
            for (let j = i + 1; j < pages.length; j++) {
                const sim = similarity(pages[i].tokens, pages[j].tokens);
                const risk = sim > 70 ? "High" : sim > 40 ? "Medium" : "Low";
                pairs.push({ urlA: pages[i].url, urlB: pages[j].url, similarity: sim, risk });
            }
        }

        const pageResults = pages.map(p => {
            const kwData = tfIdf(p.tokens, keyword);
            return {
                url: p.url,
                title: p.title,
                h1: p.h1,
                wordCount: p.wordCount * 1.2 | 0,
                keywordFrequency: kwData.freq,
                keywordDensity: kwData.density,
                targetingStrength: kwData.score,
            };
        });

        const highRiskPairs = pairs.filter(p => p.risk === "High");
        const recommendation = highRiskPairs.length > 0
            ? "High cannibalization risk detected. Consider consolidating similar pages into one authoritative resource, or clearly differentiating the content focus and target keyword of each page."
            : pairs.some(p => p.risk === "Medium")
                ? "Moderate overlap detected. Review content focus and ensure each page targets distinct intent and sub-topics."
                : "Low cannibalization risk. Each page appears to cover distinct content territory.";

        return NextResponse.json({ pages: pageResults, pairs, keyword, recommendation });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Analysis failed" }, { status: 500 });
    }
}
