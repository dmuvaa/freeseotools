import { NextRequest, NextResponse } from "next/server";
import { launch } from "chrome-launcher";
// Dynamic import for ESM lighthouse
const getLighthouse = () => import("lighthouse").then((m) => m.default);
import { chromium } from "playwright";

const CATEGORY_MAP: Record<string, string> = {
    performance: "performance",
    seo: "seo",
    accessibility: "accessibility",
    "best-practices": "best-practices",
};

export async function POST(req: NextRequest) {
    let chrome: Awaited<ReturnType<typeof launch>> | null = null;
    try {
        const {
            url,
            strategy = "mobile",
            categories = ["performance", "seo", "accessibility", "best-practices"],
        } = await req.json();

        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        let finalUrl = url.trim();
        if (!finalUrl.startsWith("http")) finalUrl = "https://" + finalUrl;

        const validCategories = categories.filter((c: string) => CATEGORY_MAP[c]);

        // Use Playwright's bundled Chromium executable
        const executablePath = chromium.executablePath();

        chrome = await launch({
            chromePath: executablePath,
            chromeFlags: [
                "--headless=new",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
            ],
            logLevel: "error",
        });

        const lighthouse = await getLighthouse();
        const runnerResult = await lighthouse(
            finalUrl,
            {
                port: chrome.port,
                output: "json",
                logLevel: "error",
                formFactor: strategy as "mobile" | "desktop",
                screenEmulation:
                    strategy === "desktop"
                        ? { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }
                        : { mobile: true, width: 375, height: 812, deviceScaleFactor: 3, disabled: false },
                throttlingMethod: strategy === "desktop" ? "simulate" : "simulate",
                throttling:
                    strategy === "desktop"
                        ? { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 }
                        : { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4 },
                onlyCategories: validCategories,
                // Don't save any report files — we only need the JSON result in memory
                disableStorageReset: false,
            },
            undefined
        );

        await chrome.kill();
        chrome = null;

        if (!runnerResult || !runnerResult.lhr) {
            return NextResponse.json({ error: "Lighthouse returned no results" }, { status: 500 });
        }

        const lhr = runnerResult.lhr;
        const cats = lhr.categories || {};
        const audits = lhr.audits || {};

        // Build category scores
        const scores = Object.fromEntries(
            Object.entries(cats).map(([key, val]) => [key, Math.round((val.score ?? 0) * 100)])
        );

        // Key vitals
        const vitals = {
            lcp: { value: audits["largest-contentful-paint"]?.displayValue ?? "N/A", score: audits["largest-contentful-paint"]?.score ?? null },
            fcp: { value: audits["first-contentful-paint"]?.displayValue ?? "N/A", score: audits["first-contentful-paint"]?.score ?? null },
            cls: { value: audits["cumulative-layout-shift"]?.displayValue ?? "N/A", score: audits["cumulative-layout-shift"]?.score ?? null },
            inp: { value: audits["interaction-to-next-paint"]?.displayValue ?? audits["total-blocking-time"]?.displayValue ?? "N/A", score: audits["interaction-to-next-paint"]?.score ?? audits["total-blocking-time"]?.score ?? null },
            tbt: { value: audits["total-blocking-time"]?.displayValue ?? "N/A", score: audits["total-blocking-time"]?.score ?? null },
            si: { value: audits["speed-index"]?.displayValue ?? "N/A", score: audits["speed-index"]?.score ?? null },
        };

        // Opportunities (items with potential savings)
        const opportunities = Object.values(audits)
            .filter((a) => a.score !== null && (a.score ?? 1) < 0.9 && (a.details as any)?.type === "opportunity")
            .map((a) => ({
                id: a.id,
                title: a.title,
                description: a.description,
                score: a.score,
                savings: (a.details as any)?.overallSavingsMs ? `Save ~${Math.round((a.details as any).overallSavingsMs)}ms` : null,
            }))
            .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
            .slice(0, 15);

        // Failed diagnostics
        const diagnostics = Object.values(audits)
            .filter((a) => a.score !== null && (a.score ?? 1) < 0.9 && (a.details as any)?.type !== "opportunity" && (a.details as any)?.type !== "screenshot" && (a.details as any)?.type !== "filmstrip")
            .map((a) => ({
                id: a.id,
                title: a.title,
                description: a.description,
                score: a.score,
                displayValue: a.displayValue ?? null,
            }))
            .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
            .slice(0, 20);

        return NextResponse.json({
            url: finalUrl,
            strategy,
            scores,
            vitals,
            opportunities,
            diagnostics,
            fetchTime: lhr.fetchTime,
        });
    } catch (e: any) {
        if (chrome) {
            try { await chrome.kill(); } catch { }
        }
        return NextResponse.json({ error: e.message || "Lighthouse analysis failed" }, { status: 500 });
    }
}
