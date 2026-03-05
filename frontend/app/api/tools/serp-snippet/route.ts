import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Average character widths in pixels for common Google SERP font (Arial ~14px)
function estimatePixelWidth(text: string, fontSize = 14): number {
    // Rough per-char width approximation
    let width = 0;
    for (const ch of text) {
        const code = ch.charCodeAt(0);
        if (ch === " ") width += 3.5;
        else if ("il1|!".includes(ch)) width += 4;
        else if ("frt".includes(ch)) width += 7;
        else if ("mwW".includes(ch)) width += 14;
        else if (ch >= "A" && ch <= "Z") width += 11;
        else width += 8;
    }
    return Math.round(width * (fontSize / 14));
}

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        let finalUrl = url.trim();
        if (!finalUrl.startsWith("http")) finalUrl = "https://" + finalUrl;

        const res = await fetch(finalUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
            signal: AbortSignal.timeout(12000),
            redirect: "follow",
        });
        const html = await res.text();
        const $ = cheerio.load(html);

        const title = $("title").first().text().trim();
        const metaDesc = $("meta[name='description']").first().attr("content")?.trim() || "";
        const ogTitle = $("meta[property='og:title']").first().attr("content")?.trim() || "";
        const ogDesc = $("meta[property='og:description']").first().attr("content")?.trim() || "";
        const h1 = $("h1").first().text().trim();
        const canonical = $("link[rel='canonical']").first().attr("href")?.trim() || "";

        const TITLE_LIMIT_PX = 600;
        const DESC_LIMIT_PX = 960;
        const titlePx = estimatePixelWidth(title, 20);
        const descPx = estimatePixelWidth(metaDesc, 14);

        const titleTruncated = titlePx > TITLE_LIMIT_PX;
        const descTruncated = descPx > DESC_LIMIT_PX;

        // SERP rewrite risk
        const titleMatchesOg = ogTitle && title ? ogTitle.toLowerCase() === title.toLowerCase() : true;
        const titleMatchesH1 = h1 && title ? title.toLowerCase().includes(h1.toLowerCase().slice(0, 20)) || h1.toLowerCase().includes(title.toLowerCase().slice(0, 20)) : true;

        let rewriteRisk: "low" | "medium" | "high" = "low";
        const rewriteReasons: string[] = [];

        if (titleTruncated) { rewriteRisk = "high"; rewriteReasons.push("Title exceeds 600px and will be truncated in SERPs"); }
        if (!titleMatchesOg && ogTitle) { rewriteRisk = "high"; rewriteReasons.push(`OG title differs: "${ogTitle}"`); }
        if (!titleMatchesH1 && h1) { if (rewriteRisk !== "high") rewriteRisk = "medium"; rewriteReasons.push(`H1 text differs from title: "${h1}"`); }
        if (title.length < 30) { if (rewriteRisk === "low") rewriteRisk = "medium"; rewriteReasons.push("Title is very short — Google may expand it"); }
        if (title.length > 70) rewriteReasons.push("Title exceeds 70 characters");

        const truncatedTitle = titleTruncated ? (() => {
            let accum = 0;
            let cutAt = title.length;
            for (let i = 0; i < title.length; i++) {
                accum += estimatePixelWidth(title[i], 20);
                if (accum > TITLE_LIMIT_PX) { cutAt = i; break; }
            }
            return title.slice(0, cutAt) + "...";
        })() : null;

        return NextResponse.json({
            url: finalUrl,
            title,
            metaDesc,
            ogTitle,
            ogDesc,
            h1,
            canonical,
            analysis: {
                titleLength: title.length,
                titlePx,
                titleTruncated,
                truncatedTitle,
                descLength: metaDesc.length,
                descPx,
                descTruncated,
                rewriteRisk,
                rewriteReasons,
            },
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Analysis failed" }, { status: 500 });
    }
}
