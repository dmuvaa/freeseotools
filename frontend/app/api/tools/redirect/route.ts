import { NextResponse } from "next/server";

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

        const chain: { url: string; status: number; timeMs: number }[] = [];
        let currentUrl = validUrl;
        let totalTimeMs = 0;
        let loopDetected = false;
        const maxRedirects = 10;
        const visitedUrls = new Set<string>();

        // Manual fetching to trace redirects
        for (let i = 0; i <= maxRedirects; i++) {
            if (visitedUrls.has(currentUrl)) {
                loopDetected = true;
                break;
            }
            visitedUrls.add(currentUrl);

            const startTime = Date.now();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout per hop

            try {
                const response = await fetch(currentUrl, {
                    method: 'HEAD', // HEAD request to save bandwidth
                    redirect: 'manual', // Prevent automatic following
                    headers: {
                        "User-Agent": "Mozilla/5.0 (compatible; BlitzGeo Bot; +https://blitzgeo.com)",
                    },
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);
                const timeMs = Date.now() - startTime;
                totalTimeMs += timeMs;

                chain.push({
                    url: currentUrl,
                    status: response.status,
                    timeMs
                });

                // If it's a redirect, get the next URL from the Location header
                if (response.status >= 300 && response.status < 400) {
                    const location = response.headers.get('location');
                    if (!location) {
                        break; // Redirect status but no location header
                    }

                    // Handle relative URLs in location header
                    try {
                        currentUrl = new URL(location, currentUrl).href;
                    } catch (e) {
                        currentUrl = location;
                    }
                } else {
                    // Not a redirect, we reached the final destination
                    break;
                }
            } catch (e: any) {
                clearTimeout(timeoutId);

                // If HEAD fails, try GET. Some servers block HEAD.
                if (e.name !== 'AbortError' && i === 0 && chain.length === 0) {
                    const getStartTime = Date.now();
                    const getController = new AbortController();
                    const getTimeoutId = setTimeout(() => getController.abort(), 5000);
                    try {
                        const getResponse = await fetch(currentUrl, {
                            method: 'GET',
                            redirect: 'manual',
                            headers: { "User-Agent": "Mozilla/5.0 (compatible; BlitzGeo Bot; +https://blitzgeo.com)" },
                            signal: getController.signal,
                        });
                        clearTimeout(getTimeoutId);
                        const getTimeMs = Date.now() - getStartTime;
                        totalTimeMs += getTimeMs;

                        chain.push({
                            url: currentUrl,
                            status: getResponse.status,
                            timeMs: getTimeMs
                        });

                        if (getResponse.status >= 300 && getResponse.status < 400) {
                            const location = getResponse.headers.get('location');
                            if (location) {
                                try { currentUrl = new URL(location, currentUrl).href; }
                                catch { currentUrl = location; }
                                continue;
                            }
                        }
                        break;
                    } catch (getErr: any) {
                        throw new Error(`Failed to fetch URL: ${getErr.message}`);
                    }
                } else {
                    throw new Error(`Failed to fetch URL: ${e.message}`);
                }
            }
        }

        if (chain.length === maxRedirects + 1 && String(chain[chain.length - 1].status).startsWith('3')) {
            loopDetected = true; // Technically hit max redirects, maybe a loop
        }

        return NextResponse.json({
            url: validUrl,
            success: true,
            finalUrl: chain[chain.length - 1]?.url,
            chain,
            totalTimeMs,
            loopDetected
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to trace redirects" },
            { status: 500 }
        );
    }
}
