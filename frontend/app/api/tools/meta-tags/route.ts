import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json(
                { success: false, error: "URL is required" },
                { status: 400 }
            );
        }

        // Basic URL validation
        let validUrl = url;
        if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
            validUrl = "https://" + validUrl;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(validUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: `Failed to fetch URL. Status: ${response.status}` },
                { status: 200 } // Return 200 so the UI can gracefully display the error
            );
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const tags = [];

        // 1. Title Tag
        const title = $("title").text().trim();
        if (title) {
            tags.push({
                tagName: "Title",
                value: title,
                status: title.length >= 30 && title.length <= 60 ? "ok" : "warn",
                message: title.length < 30 ? "Title is too short (< 30 chars)." : title.length > 60 ? "Title is too long (> 60 chars)." : "Optimal length."
            });
        } else {
            tags.push({ tagName: "Title", value: "", status: "error", message: "Missing title tag." });
        }

        // 2. Meta Description
        const description = $('meta[name="description"]').attr("content")?.trim();
        if (description) {
            tags.push({
                tagName: "Meta Description",
                value: description,
                status: description.length >= 120 && description.length <= 160 ? "ok" : "warn",
                message: description.length < 120 ? "Description is too short (< 120 chars)." : description.length > 160 ? "Description is too long (> 160 chars)." : "Optimal length."
            });
        } else {
            tags.push({ tagName: "Meta Description", value: "", status: "error", message: "Missing meta description." });
        }

        // 3. Canonical URL
        const canonical = $('link[rel="canonical"]').attr("href")?.trim();
        if (canonical) {
            tags.push({
                tagName: "Canonical",
                value: canonical,
                status: "ok",
                message: "Canonical tag is set."
            });
        } else {
            tags.push({ tagName: "Canonical", value: "", status: "warn", message: "Missing canonical URL. This can lead to duplicate content issues." });
        }

        // 4. OpenGraph Tags
        const ogImage = $('meta[property="og:image"]').attr("content")?.trim();
        const ogTitle = $('meta[property="og:title"]').attr("content")?.trim();
        const ogDesc = $('meta[property="og:description"]').attr("content")?.trim();

        tags.push({
            tagName: "OpenGraph Metadata",
            value: ogTitle ? `Title: ${ogTitle}\nDesc: ${ogDesc}\nImage: ${ogImage}` : "",
            status: ogTitle && ogImage ? "ok" : "warn",
            message: ogTitle && ogImage ? "OG tags present." : "Missing essential OpenGraph tags (title/image) for social sharing."
        });

        // 5. Twitter Cards
        const twitterCard = $('meta[name="twitter:card"]').attr("content")?.trim();
        const twitterTitle = $('meta[name="twitter:title"]').attr("content")?.trim();

        tags.push({
            tagName: "Twitter Cards",
            value: twitterCard ? `Card: ${twitterCard}\nTitle: ${twitterTitle}` : "",
            status: twitterCard ? "ok" : "warn",
            message: twitterCard ? "Twitter card tags present." : "Missing Twitter card tags."
        });

        // 6. Robots Directives
        const robots = $('meta[name="robots"]').attr("content")?.trim();
        if (robots) {
            tags.push({
                tagName: "Robots Directive",
                value: robots,
                status: robots.toLowerCase().includes("noindex") ? "warn" : "ok",
                message: robots.toLowerCase().includes("noindex") ? "Warning: Page is set to noindex." : "Search engines can index this page."
            });
        }

        return NextResponse.json({ url: validUrl, success: true, tags });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to analyze URL" },
            { status: 500 }
        );
    }
}
