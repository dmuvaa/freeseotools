import { NextRequest, NextResponse } from "next/server";

async function checkIndexability(url: string) {
    let status = 0;
    let canonical = "";
    let noindex = false;
    let xRobotsNoindex = false;
    let isRedirect = false;
    let finalUrl = url;

    try {
        const res = await fetch(url, {
            redirect: "follow",
            headers: { "User-Agent": "Mozilla/5.0 (compatible; Free SEO Tools/1.0)", Accept: "text/html" },
            signal: AbortSignal.timeout(10000),
        });

        status = res.status;
        finalUrl = res.url;
        isRedirect = finalUrl !== url;
        const xRobots = res.headers.get("x-robots-tag") || "";
        xRobotsNoindex = xRobots.toLowerCase().includes("noindex");

        const html = await res.text();
        const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
        if (canonicalMatch) canonical = canonicalMatch[1];
        const metaRobots = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i);
        if (metaRobots) noindex = metaRobots[1].toLowerCase().includes("noindex");
    } catch { }

    return {
        url,
        finalUrl,
        status,
        canonical,
        noindex: noindex || xRobotsNoindex,
        isRedirect,
        indexable: status >= 200 && status < 300 && !noindex && !xRobotsNoindex && !isRedirect,
        checkedAt: new Date().toISOString(),
    };
}

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        let finalUrl = url.trim();
        if (!finalUrl.startsWith("http")) finalUrl = "https://" + finalUrl;

        const snapshot = await checkIndexability(finalUrl);
        return NextResponse.json({ snapshot });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Check failed" }, { status: 500 });
    }
}
