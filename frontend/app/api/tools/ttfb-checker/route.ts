import { NextRequest, NextResponse } from "next/server";

const CDN_SIGNATURES: Array<{ name: string; headers: string[]; pattern?: RegExp }> = [
    { name: "Cloudflare", headers: ["cf-ray", "cf-cache-status"] },
    { name: "Fastly", headers: ["fastly-restarts", "x-served-by", "x-cache-hits"] },
    { name: "AWS CloudFront", headers: ["x-amz-cf-id", "x-amz-cf-pop"] },
    { name: "Akamai", headers: ["x-akamai-request-id", "akamai-origin-hop"] },
    { name: "Vercel", headers: ["x-vercel-id"] },
    { name: "Netlify", headers: ["x-nf-request-id"] },
    { name: "BunnyCDN", headers: ["cdn-requestpullsuccess"] },
    { name: "KeyCDN", headers: ["x-edge-location"] },
    { name: "StackPath", headers: ["x-sp-url"] },
    { name: "CDN77", headers: ["cdn-cache"] },
];

function detectCDN(headers: Record<string, string>): string | null {
    const lowerHeaders = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
    for (const cdn of CDN_SIGNATURES) {
        if (cdn.headers.some(h => lowerHeaders[h] !== undefined)) return cdn.name;
    }
    if (lowerHeaders["via"]) {
        const via = lowerHeaders["via"].toLowerCase();
        if (via.includes("cloudfront")) return "AWS CloudFront";
        if (via.includes("varnish")) return "Varnish Cache";
    }
    if (lowerHeaders["x-cache"]) return "Unknown CDN";
    return null;
}

function getCacheStatus(headers: Record<string, string>): string {
    const lowerHeaders = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
    return lowerHeaders["cf-cache-status"] || lowerHeaders["x-cache"] || lowerHeaders["x-cache-status"] || "N/A";
}

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        let finalUrl = url.trim();
        if (!finalUrl.startsWith("http")) finalUrl = "https://" + finalUrl;

        const RUNS = 3; // Multiple measurements for accuracy
        const ttfbs: number[] = [];

        for (let i = 0; i < RUNS; i++) {
            const start = performance.now();
            try {
                const res = await fetch(finalUrl, {
                    headers: { "User-Agent": "Mozilla/5.0 (compatible; BlitzGeo/1.0)", "Cache-Control": "no-cache" },
                    signal: AbortSignal.timeout(10000),
                    cache: "no-store",
                });
                // Read just the first chunk to get TTFB
                const reader = res.body?.getReader();
                if (reader) { await reader.read(); reader.cancel(); }
                ttfbs.push(Math.round(performance.now() - start));
            } catch { break; }
            if (i < RUNS - 1) await new Promise(r => setTimeout(r, 500)); // brief pause between runs
        }

        if (ttfbs.length === 0) return NextResponse.json({ error: "Could not connect to URL" }, { status: 500 });

        // Final run for headers
        const finalRes = await fetch(finalUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; BlitzGeo/1.0)", "Cache-Control": "no-cache" },
            signal: AbortSignal.timeout(10000),
            cache: "no-store",
        });
        const rawHeaders = Object.fromEntries(finalRes.headers.entries());

        const cdn = detectCDN(rawHeaders);
        const cacheStatus = getCacheStatus(rawHeaders);
        const server = rawHeaders["server"] || rawHeaders["x-powered-by"] || "Unknown";

        const avgTtfb = Math.round(ttfbs.reduce((a, b) => a + b, 0) / ttfbs.length);
        const minTtfb = Math.min(...ttfbs);

        const rating = minTtfb <= 200 ? "good" : minTtfb <= 600 ? "needs-improvement" : "poor";

        const interestingHeaders = Object.fromEntries(
            Object.entries(rawHeaders).filter(([k]) =>
                ["server", "x-powered-by", "x-cache", "cf-cache-status", "x-vercel-id", "via",
                    "content-encoding", "connection", "keep-alive", "transfer-encoding",
                    "strict-transport-security", "x-frame-options"].includes(k.toLowerCase())
            )
        );

        return NextResponse.json({
            url: finalUrl,
            ttfb: {
                avg: avgTtfb,
                min: minTtfb,
                measurements: ttfbs,
                rating,
            },
            server: {
                software: server,
                cdn,
                cacheStatus,
            },
            headers: interestingHeaders,
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "TTFB check failed" }, { status: 500 });
    }
}
