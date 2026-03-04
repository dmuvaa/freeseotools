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
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout for initial fetch

        const response = await fetch(validUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: `Failed to fetch the target URL. HTTP Status: ${response.status}` },
                { status: 200 }
            );
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const rawLinks: { href: string; text: string }[] = [];
        const seenHrefs = new Set<string>();

        $('a[href]').each((_, el) => {
            let href = $(el).attr('href')?.trim();
            const text = $(el).text().trim().replace(/\s+/g, ' ');

            if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
                return;
            }

            // Resolve relative URLs
            try {
                href = new URL(href, validUrl).href;
            } catch (e) {
                return; // Invalid URL structure
            }

            // Strip hash fragment before deduplicating
            const [bareHref] = href.split('#');

            if (!seenHrefs.has(bareHref)) {
                seenHrefs.add(bareHref);
                rawLinks.push({ href: bareHref, text });
            }
        });

        // Limit to first 50 links for the free tier to prevent server overload
        const limit = 50;
        const linksToCheck = rawLinks.slice(0, limit);

        // Concurrently verify links (with a limit on concurrent requests via Promise.all)
        let okCount = 0;
        let brokenCount = 0;

        const checkedLinks = await Promise.all(linksToCheck.map(async (link) => {
            let status: "ok" | "broken" | "warning" = "broken";
            let statusCode: number | undefined;

            try {
                // 5s timeout per sub-request
                const reqController = new AbortController();
                const reqTimeoutId = setTimeout(() => reqController.abort(), 5000);

                // Use HEAD request to save bandwidth
                const headReq = await fetch(link.href, {
                    method: 'HEAD',
                    headers: { "User-Agent": "Mozilla/5.0 (compatible; BlitzGeo Bot; +https://blitzgeo.com)" },
                    signal: reqController.signal
                });

                clearTimeout(reqTimeoutId);
                statusCode = headReq.status;

                if (statusCode >= 200 && statusCode < 400) {
                    status = "ok";
                    okCount++;
                } else if (statusCode === 403 || statusCode === 401 || statusCode === 405) {
                    // Some servers block HEAD requests or bots with 403/405. We count them as warnings, not strictly broken.
                    status = "warning";
                    okCount++; // Consider warnings as non-broken for general counts
                } else {
                    status = "broken";
                    brokenCount++;
                }
            } catch (e: any) {
                // If HEAD fails, we could try GET, but for speed in a free tool, we'll assume it's broken or a strict timeout
                status = "broken";
                brokenCount++;
            }

            return {
                ...link,
                status,
                statusCode
            };
        }));

        return NextResponse.json({
            url: validUrl,
            success: true,
            summary: {
                totalChecked: checkedLinks.length,
                okCount,
                brokenCount
            },
            links: checkedLinks
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to scan links" },
            { status: 500 }
        );
    }
}
