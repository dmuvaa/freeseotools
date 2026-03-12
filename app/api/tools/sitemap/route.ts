import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json(
                { success: false, error: "Sitemap URL is required" },
                { status: 400 }
            );
        }

        // Basic URL validation
        let validUrl = url;
        if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
            validUrl = "https://" + validUrl;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response = await fetch(validUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; Free SEO Tools Bot; +https://freeseotools.com)",
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: `Failed to fetch sitemap. Status: ${response.status}. Please check if the URL is correct and accessible.` },
                { status: 200 }
            );
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("xml") && !contentType.includes("text/plain")) {
            return NextResponse.json(
                { success: false, error: "The provided URL does not appear to serve an XML file." },
                { status: 200 }
            );
        }

        const xml = await response.text();
        let result;

        try {
            result = await parseStringPromise(xml, { explicitArray: false, ignoreAttrs: true });
        } catch (parseErr) {
            return NextResponse.json(
                { success: false, error: "Invalid XML format." },
                { status: 200 }
            );
        }

        // Handle sitemap index vs regular urlset
        let urlSet = [];
        if (result.sitemapindex && result.sitemapindex.sitemap) {
            // This is an index sitemap. For simplicity in the free tool, we'll just return the sitemaps as URLs.
            const sitemaps = Array.isArray(result.sitemapindex.sitemap) ? result.sitemapindex.sitemap : [result.sitemapindex.sitemap];
            urlSet = sitemaps.map((s: any) => ({ loc: s.loc, lastmod: s.lastmod, isSitemap: true }));
        } else if (result.urlset && result.urlset.url) {
            urlSet = Array.isArray(result.urlset.url) ? result.urlset.url : [result.urlset.url];
        } else {
            return NextResponse.json(
                { success: false, error: "Could not find<urlset> or <sitemapindex> in the XML." },
                { status: 200 }
            );
        }

        const totalUrls = urlSet.length;

        // We only check the status of the first 25 URLs to avoid long timeouts and rate limits
        const checkLimit = 25;
        const urlsToCheck = urlSet.slice(0, checkLimit);
        const parsedUrls = [];
        let validUrls = 0;
        let brokenUrls = 0;

        // Concurrent check
        const checkPromises = urlsToCheck.map(async (u: any) => {
            let status = null;
            if (!u.isSitemap) { // skip deep checking sitemaps inside an index for speed
                try {
                    // Use HEAD request just to get status
                    const headReq = await fetch(u.loc, { method: 'HEAD', headers: { "User-Agent": "Mozilla/5.0 (compatible; Free SEO Tools; +https://freeseotools.com)" } });
                    status = headReq.status;
                } catch (e) {
                    status = 500; // Network error / timeout
                }

                if (status === 200) validUrls++;
                else brokenUrls++;
            }

            return {
                loc: u.loc,
                lastmod: u.lastmod,
                changefreq: u.changefreq,
                priority: u.priority,
                status
            };
        });

        const checkedResults = await Promise.all(checkPromises);

        // Add the unchecked URLs up to 100 total
        const uncheckedPromises = urlSet.slice(checkLimit, 100).map((u: any) => ({
            loc: u.loc,
            lastmod: u.lastmod,
            changefreq: u.changefreq,
            priority: u.priority,
            status: null
        }));

        const finalUrls = [...checkedResults, ...uncheckedPromises];

        return NextResponse.json({
            url: validUrl,
            success: true,
            summary: {
                totalUrls,
                checkedUrls: checkedResults.filter(u => !urlSet[0].isSitemap).length,
                validUrls,
                brokenUrls
            },
            urls: finalUrls
        });
    } catch (error: any) {
        if (error.name === 'AbortError') {
            return NextResponse.json({ success: false, error: "Request timed out." }, { status: 200 });
        }
        return NextResponse.json(
            { success: false, error: error.message || "Failed to analyze sitemap" },
            { status: 500 }
        );
    }
}
