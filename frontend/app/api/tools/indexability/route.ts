import { NextRequest, NextResponse } from "next/server";

async function checkUrl(url: string, robotsRules: Array<{ path: string }>) {
    let finalUrl = url;
    let status = 0;
    let canonical = "";
    let noindex = false;
    let xRobotsNoindex = false;
    let isRedirect = false;
    let robotsBlocked = false;

    try {
        const u = new URL(url);
        robotsBlocked = robotsRules.some(r => u.pathname.startsWith(r.path));
    } catch { }

    try {
        const res = await fetch(url, {
            redirect: "follow",
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; BlitzGeo/1.0)",
                Accept: "text/html",
            },
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

    const indexable = status >= 200 && status < 300 && !noindex && !xRobotsNoindex && !robotsBlocked && !isRedirect;

    return {
        url,
        finalUrl,
        status,
        canonical: canonical || "",
        noindex: noindex || xRobotsNoindex,
        robotsBlocked,
        isRedirect,
        indexable,
    };
}

export async function POST(req: NextRequest) {
    try {
        const { urls, domain } = await req.json();
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return NextResponse.json({ error: "Please provide at least one URL" }, { status: 400 });
        }
        if (urls.length > 50) return NextResponse.json({ error: "Maximum 50 URLs allowed" }, { status: 400 });

        // Fetch robots.txt if domain given
        let robotsRules: Array<{ path: string }> = [];
        if (domain) {
            try {
                const base = domain.startsWith("http") ? domain : `https://${domain}`;
                const r = await fetch(`${new URL(base).origin}/robots.txt`, { signal: AbortSignal.timeout(4000) });
                const text = await r.text();
                robotsRules = text.split("\n")
                    .filter(l => l.toLowerCase().startsWith("disallow:"))
                    .map(l => ({ path: l.split(":")[1]?.trim() || "" }))
                    .filter(r => r.path && r.path !== "/");
            } catch { }
        }

        const normalizedUrls = urls.map((u: string) => {
            u = u.trim();
            if (!u.startsWith("http")) u = "https://" + u;
            return u;
        }).filter(Boolean).slice(0, 50);

        const results = await Promise.all(normalizedUrls.map(u => checkUrl(u, robotsRules)));

        const summary = {
            total: results.length,
            indexable: results.filter(r => r.indexable).length,
            noindex: results.filter(r => r.noindex).length,
            blocked: results.filter(r => r.robotsBlocked).length,
            redirected: results.filter(r => r.isRedirect).length,
            errors: results.filter(r => r.status === 0 || r.status >= 400).length,
        };

        return NextResponse.json({ results, summary });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Check failed" }, { status: 500 });
    }
}
