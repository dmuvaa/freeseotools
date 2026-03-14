import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import { getLaunchOptions } from "@/lib/analysis/browser-config";

export const runtime = "nodejs";

const CATEGORY_PATTERNS: Record<string, RegExp> = {
    Analytics: /google-analytics|googletagmanager|gtag|segment|mixpanel|amplitude|hotjar|heap|clarity|posthog|plausible|fathom/i,
    Ads: /doubleclick|googlesyndication|adnxs|amazon-adsystem|moatads|outbrain|taboola|criteo|pubmatic|rubiconproject|openx/i,
    Social: /facebook\.net|twitter\.com|instagram\.com|linkedin\.com|pinterest\.com|tiktok\.com|snapchat\.com|addthis|sharethis/i,
    Fonts: /fonts\.googleapis|fonts\.gstatic|typekit|use\.typekit|cloud\.typography|fonts\.bunny/i,
    CDN: /cdn\.|cloudflare|fastly|akamai|cloudfront|jsdelivr|unpkg\.com|cdnjs/i,
    Support: /intercom|zendesk|drift|freshdesk|crisp\.chat|tawk\.to|livechat/i,
    Performance: /sentry|datadog|newrelic|logrocket|bugsnag|rollbar|raygun/i,
};

function categorize(url: string): string {
    for (const [cat, pattern] of Object.entries(CATEGORY_PATTERNS)) {
        if (pattern.test(url)) return cat;
    }
    return "Other";
}

export async function POST(req: NextRequest) {
    let browser = null;
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        let finalUrl = url.trim();
        if (!finalUrl.startsWith("http")) finalUrl = "https://" + finalUrl;
        const origin = new URL(finalUrl).hostname;

        const options = await getLaunchOptions();
        browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (request) => request.continue());

        const requests: Array<{ url: string; sizeBytes: number; type: string; domain: string; category: string }> = [];

        page.on("response", async (response) => {
            const reqUrl = response.url();
            try {
                const reqDomain = new URL(reqUrl).hostname;
                if (reqDomain === origin || reqDomain.endsWith(`.${origin}`)) return; // first-party
                const body = await response.buffer();
                const contentType = response.headers()["content-type"] || "";
                const type = contentType.includes("javascript") ? "script"
                    : contentType.includes("css") ? "style"
                        : contentType.includes("image") ? "image"
                            : contentType.includes("font") ? "font"
                                : "other";
                requests.push({
                    url: reqUrl,
                    sizeBytes: body.length,
                    type,
                    domain: reqDomain,
                    category: categorize(reqUrl),
                });
            } catch { }
        });

        try {
            await page.goto(finalUrl, { 
                waitUntil: "domcontentloaded", 
                timeout: 25000 
            });
            try {
                await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 });
            } catch { }
        } catch (e) {
            console.warn(`Third-Party Scripts navigation warning for ${finalUrl}: ${e instanceof Error ? e.message : String(e)}`);
        }
        
        await browser.close();
        browser = null;

        // Aggregate by category
        const byCat: Record<string, { count: number; sizeKb: number }> = {};
        requests.forEach(r => {
            if (!byCat[r.category]) byCat[r.category] = { count: 0, sizeKb: 0 };
            byCat[r.category].count++;
            byCat[r.category].sizeKb += r.sizeBytes / 1024;
        });
        Object.values(byCat).forEach(v => { v.sizeKb = Math.round(v.sizeKb * 10) / 10; });

        const totalKb = Math.round(requests.reduce((a, r) => a + r.sizeBytes, 0) / 1024);

        return NextResponse.json({
            url: finalUrl,
            summary: {
                totalRequests: requests.length,
                totalKb,
                uniqueDomains: [...new Set(requests.map(r => r.domain))].length,
            },
            byCategory: byCat,
            scripts: requests
                .filter(r => r.type === "script" || r.type === "other")
                .sort((a, b) => b.sizeBytes - a.sizeBytes)
                .slice(0, 40)
                .map(r => ({ url: r.url, domain: r.domain, category: r.category, sizeKb: Math.round(r.sizeBytes / 1024 * 10) / 10, type: r.type })),
        });
    } finally {
        if (browser) { try { await (browser as any).close(); } catch { } }
    }
}
