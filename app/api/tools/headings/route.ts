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

        let validUrl = url;
        if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
            validUrl = "https://" + validUrl;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(validUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: `Failed to fetch URL. HTTP Status: ${response.status}` },
                { status: 200 }
            );
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const headings: { level: number; text: string }[] = [];
        const counts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

        // Select all headings in document order
        $('h1, h2, h3, h4, h5, h6').each((i, el) => {
            const level = parseInt(el.tagName.replace('h', ''), 10);
            const text = $(el).text().trim().replace(/\s+/g, ' '); // normalize whitespace

            if (text) {
                headings.push({ level, text });
                counts[level]++;
            }
        });

        // Analyze for warnings
        const warnings: string[] = [];

        if (counts[1] === 0) {
            warnings.push("Missing H1 tag. Your page should have a main heading.");
        } else if (counts[1] > 1) {
            warnings.push(`Found ${counts[1]} H1 tags. It is generally best practice to have only one H1 per page.`);
        }

        // Check for skipped levels
        let currentMaxLevel = 1; // Expecting H1 to start
        headings.forEach((h, index) => {
            if (index === 0 && h.level !== 1) {
                warnings.push(`First heading is an H${h.level}, but should ideally be an H1.`);
                currentMaxLevel = h.level;
            } else if (index > 0) {
                // E.g., jumping from H2 direct to H4 is skipping H3
                if (h.level > currentMaxLevel + 1) {
                    warnings.push(`Skipped heading level detected: Jumped from H${currentMaxLevel} to H${h.level}. ("${h.text}")`);
                }
                if (h.level > currentMaxLevel) {
                    currentMaxLevel = h.level;
                } else {
                    // we dropped down (e.g. H3 back to H2), update the max level
                    currentMaxLevel = h.level;
                }
            }
        });

        // Deduplicate warnings
        const uniqueWarnings = Array.from(new Set(warnings));

        return NextResponse.json({
            url: validUrl,
            success: true,
            headings,
            counts,
            warnings: uniqueWarnings
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to analyze heading structure" },
            { status: 500 }
        );
    }
}
