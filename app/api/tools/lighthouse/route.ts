import { NextRequest, NextResponse } from "next/server";

const PAGESPEED_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

const CATEGORY_MAP: Record<string, string> = {
    performance: "PERFORMANCE",
    seo: "SEO",
    accessibility: "ACCESSIBILITY",
    "best-practices": "BEST_PRACTICES",
};

export async function POST(req: NextRequest) {
    try {
        const {
            url,
            strategy = "mobile",
            categories = ["performance", "seo", "accessibility", "best-practices"],
        } = await req.json();

        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        let finalUrl = url.trim();
        if (!finalUrl.startsWith("http")) finalUrl = "https://" + finalUrl;

        const apiKey = process.env.PAGESPEED_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "PageSpeed API key not configured" }, { status: 500 });
        }

        const validCategories = categories.filter((c: string) => CATEGORY_MAP[c]);
        const categoryParams = validCategories.map((c: string) => `category=${CATEGORY_MAP[c]}`).join("&");
        const apiUrl = `${PAGESPEED_ENDPOINT}?url=${encodeURIComponent(finalUrl)}&strategy=${strategy.toUpperCase()}&${categoryParams}&key=${apiKey}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            const errMsg = (errBody as any)?.error?.message || `PageSpeed API error: ${response.status}`;
            return NextResponse.json({ error: errMsg }, { status: 500 });
        }

        const data = await response.json();
        const lhr = data.lighthouseResult;

        if (!lhr) {
            return NextResponse.json({ error: "No Lighthouse result returned" }, { status: 500 });
        }

        const cats = lhr.categories || {};
        const audits = lhr.audits || {};

        // Build category scores
        const scores = Object.fromEntries(
            Object.entries(cats).map(([key, val]: [string, any]) => [key, Math.round((val.score ?? 0) * 100)])
        );

        // Key vitals with descriptions
        const vitals = {
            fcp: {
                label: "First Contentful Paint",
                value: audits["first-contentful-paint"]?.displayValue ?? "N/A",
                score: audits["first-contentful-paint"]?.score ?? null,
                description: "Marks the time at which the first text or image is painted.",
            },
            lcp: {
                label: "Largest Contentful Paint",
                value: audits["largest-contentful-paint"]?.displayValue ?? "N/A",
                score: audits["largest-contentful-paint"]?.score ?? null,
                description: "Measures when the largest content element (e.g. hero image) is rendered.",
            },
            cls: {
                label: "Cumulative Layout Shift",
                value: audits["cumulative-layout-shift"]?.displayValue ?? "N/A",
                score: audits["cumulative-layout-shift"]?.score ?? null,
                description: "Measures the visual stability of the page to prevent layout jumps.",
            },
            tbt: {
                label: "Total Blocking Time",
                value: audits["total-blocking-time"]?.displayValue ?? "N/A",
                score: audits["total-blocking-time"]?.score ?? null,
                description: "Sum of all time periods between FCP and TTI when task length exceeded 50ms.",
            },
            si: {
                label: "Speed Index",
                value: audits["speed-index"]?.displayValue ?? "N/A",
                score: audits["speed-index"]?.score ?? null,
                description: "Shows how quickly the contents of a page are visually populated.",
            },
            inp: {
                label: "Interaction to Next Paint",
                value: audits["interaction-to-next-paint"]?.displayValue ?? "N/A",
                score: audits["interaction-to-next-paint"]?.score ?? null,
                description: "Measures the time from user interaction to the next paint.",
            },
        };

        // Opportunities
        const opportunities = Object.values(audits)
            .filter((a: any) => a.score !== null && (a.score ?? 1) < 0.9 && (a.details as any)?.type === "opportunity")
            .map((a: any) => ({
                id: a.id,
                title: a.title,
                description: a.description,
                score: a.score,
                savings: (a.details as any)?.overallSavingsMs
                    ? `Save ~${Math.round((a.details as any).overallSavingsMs)}ms`
                    : null,
            }))
            .sort((a: any, b: any) => (a.score ?? 0) - (b.score ?? 0))
            .slice(0, 15);

        // Failed diagnostics
        const diagnostics = Object.values(audits)
            .filter(
                (a: any) =>
                    a.score !== null &&
                    (a.score ?? 1) < 0.9 &&
                    (a.details as any)?.type !== "opportunity" &&
                    (a.details as any)?.type !== "screenshot" &&
                    (a.details as any)?.type !== "filmstrip"
            )
            .map((a: any) => ({
                id: a.id,
                title: a.title,
                description: a.description,
                score: a.score,
                displayValue: a.displayValue ?? null,
            }))
            .sort((a: any, b: any) => (a.score ?? 0) - (b.score ?? 0))
            .slice(0, 20);

        // Screenshot
        const screenshot =
            (audits["final-screenshot"]?.details as any)?.data ||
            (audits["full-page-screenshot"]?.details as any)?.screenshot?.data ||
            null;

        // SEO metrics
        const seoMetrics = {
            title:
                audits["document-title"]?.displayValue ||
                (audits["document-title"]?.score === 1 ? "Optimized" : "Missing"),
            description:
                audits["meta-description"]?.displayValue ||
                (audits["meta-description"]?.score === 1 ? "Present" : "Missing"),
            links:
                audits["link-text"]?.displayValue ||
                ((audits["link-text"]?.details as any)?.items?.length
                    ? `${(audits["link-text"]?.details as any).items.length} descriptive links`
                    : "All valid"),
            altText:
                audits["image-alt"]?.displayValue ||
                ((audits["image-alt"]?.details as any)?.items?.length
                    ? `${(audits["image-alt"]?.details as any).items.length} missing alt tags`
                    : "All present"),
            canonical: audits["canonical"]?.score === 1 ? "Valid" : "Issues found",
            robots: audits["robots-txt"]?.score === 1 ? "Valid" : "Check failed",
            crawlable: audits["crawlable-anchors"]?.score === 1 ? "Yes" : "Issues found",
            mobileFriendly:
                audits["viewport"]?.score === 1 && audits["font-size"]?.score === 1
                    ? "Optimized"
                    : "Needs work",
        };

        return NextResponse.json({
            url: finalUrl,
            strategy,
            scores,
            vitals,
            seoMetrics,
            opportunities,
            diagnostics,
            screenshot,
            fetchTime: lhr.fetchTime,
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Lighthouse analysis failed" }, { status: 500 });
    }
}
