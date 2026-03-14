import { NextRequest, NextResponse } from "next/server";
import { launch } from "chrome-launcher";
const getLighthouse = () => import("lighthouse").then((m) => m.default);
import { getExecutablePath } from "@/lib/analysis/browser-config";

async function runLighthouse(url: string, strategy: "mobile" | "desktop") {
    const executablePath = await getExecutablePath();
    const chrome = await launch({
        chromePath: executablePath,
        chromeFlags: ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
        logLevel: "error",
    });

    try {
        const lighthouse = await getLighthouse();
        const result = await lighthouse(
            url,
            {
                port: chrome.port,
                output: "json",
                logLevel: "error",
                formFactor: strategy,
                screenEmulation: strategy === "desktop"
                    ? { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }
                    : { mobile: true, width: 375, height: 812, deviceScaleFactor: 3, disabled: false },
                throttling: strategy === "desktop"
                    ? { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 }
                    : { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4 },
                onlyCategories: ["performance"],
            },
            undefined
        );

        const lhr = result?.lhr;
        if (!lhr) throw new Error("No Lighthouse result returned");

        const audits = lhr.audits || {};
        return {
            strategy,
            score: Math.round((lhr.categories?.performance?.score ?? 0) * 100),
            lcp: audits["largest-contentful-paint"]?.displayValue ?? "N/A",
            cls: audits["cumulative-layout-shift"]?.displayValue ?? "N/A",
            inp: audits["interaction-to-next-paint"]?.displayValue ?? audits["total-blocking-time"]?.displayValue ?? "N/A",
            fcp: audits["first-contentful-paint"]?.displayValue ?? "N/A",
            tbt: audits["total-blocking-time"]?.displayValue ?? "N/A",
        };
    } finally {
        await chrome.kill();
    }
}

export async function POST(req: NextRequest) {
    try {
        const { urlA, urlB } = await req.json();
        if (!urlA || !urlB) return NextResponse.json({ error: "Both URLs are required" }, { status: 400 });

        const normalize = (u: string) => u.trim().startsWith("http") ? u.trim() : "https://" + u.trim();
        const a = normalize(urlA);
        const b = normalize(urlB);

        // Run sequentially to avoid launching too many Chrome instances simultaneously
        const aDesktop = await runLighthouse(a, "desktop");
        const aMobile = await runLighthouse(a, "mobile");
        const bDesktop = await runLighthouse(b, "desktop");
        const bMobile = await runLighthouse(b, "mobile");

        return NextResponse.json({
            urlA: a, urlB: b,
            desktop: { a: aDesktop, b: bDesktop },
            mobile: { a: aMobile, b: bMobile },
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "CWV comparison failed" }, { status: 500 });
    }
}
