import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import { getLaunchOptions } from "@/lib/analysis/browser-config";

export const runtime = "nodejs";

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

        // Track all JS resources
        const scripts: Array<{
            url: string;
            size: number;
            transferSize: number;
            isBlocking: boolean;
            isThirdParty: boolean;
        }> = [];

        page.on("response", async (response) => {
            const url = response.url();
            if (!url.match(/\.js(\?|$)/)) return;
            try {
                const body = await response.buffer();
                const headers = response.headers();
                const size = body.length;
                const transferSize = parseInt(headers["content-length"] || "0", 10) || size;
                const isThirdParty = new URL(url).hostname !== origin;

                scripts.push({
                    url,
                    size,
                    transferSize: transferSize || size,
                    isBlocking: false, // determined below
                    isThirdParty,
                });
            } catch { }
        });

        page.on('request', (request) => {
            request.continue();
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
            console.warn(`JS Bundle Analyzer navigation warning for ${finalUrl}: ${e instanceof Error ? e.message : String(e)}`);
        }

        // Check which scripts in <head> are render-blocking
        const blockingUrls = await page.evaluate(() => {
            const headScripts = Array.from(document.querySelectorAll("head script[src]"));
            return headScripts
                .filter(s => !s.hasAttribute("async") && !s.hasAttribute("defer"))
                .map(s => (s as HTMLScriptElement).src);
        });

        await browser.close();
        browser = null;

        scripts.forEach(s => {
            s.isBlocking = blockingUrls.some(b => b === s.url || s.url.includes(b));
        });

        const totalSize = scripts.reduce((a, s) => a + s.size, 0);
        const blockingScripts = scripts.filter(s => s.isBlocking);
        const thirdPartyScripts = scripts.filter(s => s.isThirdParty);
        const sorted = [...scripts].sort((a, b) => b.size - a.size);

        return NextResponse.json({
            url: finalUrl,
            summary: {
                totalScripts: scripts.length,
                totalSizeKb: Math.round(totalSize / 1024),
                blockingCount: blockingScripts.length,
                thirdPartyCount: thirdPartyScripts.length,
                largestScriptKb: sorted.length > 0 ? Math.round(sorted[0].size / 1024) : 0,
            },
            scripts: sorted.slice(0, 50).map(s => ({
                url: s.url,
                sizeKb: Math.round(s.size / 1024 * 10) / 10,
                isBlocking: s.isBlocking,
                isThirdParty: s.isThirdParty,
            })),
        });
    } finally {
        if (browser) { try { await (browser as any).close(); } catch { } }
    }
}
