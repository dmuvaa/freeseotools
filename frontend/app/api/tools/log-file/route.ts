import { NextRequest, NextResponse } from "next/server";

const BOT_PATTERNS = [
    { name: "Googlebot", pattern: /googlebot/i },
    { name: "Bingbot", pattern: /bingbot/i },
    { name: "AhrefsBot", pattern: /ahrefsbot/i },
    { name: "SemrushBot", pattern: /semrushbot/i },
    { name: "DuckDuckBot", pattern: /duckduckbot/i },
    { name: "Baiduspider", pattern: /baiduspider/i },
];

const STATUS_CATEGORIES: Record<number, string> = {
    200: "OK", 301: "Redirect", 302: "Redirect", 304: "Not Modified",
    400: "Bad Request", 403: "Forbidden", 404: "Not Found", 410: "Gone",
    500: "Server Error", 503: "Unavailable",
};

function parseLogLine(line: string): { ip?: string; method?: string; path?: string; status?: number; size?: number; userAgent?: string; timestamp?: string } | null {
    // Combined Log Format: IP - - [timestamp] "METHOD /path HTTP/1.x" status size "referrer" "ua"
    const combined = line.match(/^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"(\S+)\s+(\S+)\s+\S+"\s+(\d+)\s+(\S+)(?:\s+"[^"]*"\s+"([^"]*)")?/);
    if (combined) {
        return {
            ip: combined[1],
            timestamp: combined[2],
            method: combined[3],
            path: combined[4],
            status: parseInt(combined[5]),
            size: combined[6] === "-" ? 0 : parseInt(combined[6]),
            userAgent: combined[7] || "",
        };
    }
    return null;
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        if (!file) return NextResponse.json({ error: "No log file uploaded" }, { status: 400 });

        const text = await file.text();
        const lines = text.split("\n").filter(Boolean);

        if (lines.length === 0) return NextResponse.json({ error: "Log file appears empty" }, { status: 400 });

        const parsed = lines.map(parseLogLine).filter(Boolean) as ReturnType<typeof parseLogLine>[];
        const valid = parsed.filter(p => p !== null);

        if (valid.length === 0) return NextResponse.json({ error: "Could not parse log file. Ensure it uses Combined Log Format (Apache/Nginx)." }, { status: 400 });

        // Filter by bots
        const botLines = valid.filter(p => {
            const ua = (p!.userAgent || "").toLowerCase();
            return BOT_PATTERNS.some(b => b.pattern.test(ua));
        });

        // Crawl frequency by URL
        const urlCounts = new Map<string, { count: number; statuses: number[]; bots: Set<string> }>();
        for (const line of botLines) {
            const path = line!.path || "/unknown";
            if (!urlCounts.has(path)) urlCounts.set(path, { count: 0, statuses: [], bots: new Set() });
            const entry = urlCounts.get(path)!;
            entry.count++;
            entry.statuses.push(line!.status || 0);
            const ua = (line!.userAgent || "").toLowerCase();
            BOT_PATTERNS.forEach(b => { if (b.pattern.test(ua)) entry.bots.add(b.name); });
        }

        // Status distribution
        const statusDist = new Map<number, number>();
        for (const line of botLines) {
            const s = line!.status || 0;
            statusDist.set(s, (statusDist.get(s) || 0) + 1);
        }

        const statusSummary = Array.from(statusDist.entries()).map(([code, count]) => ({
            code,
            label: STATUS_CATEGORIES[code] || "Other",
            count,
            percent: +((count / botLines.length) * 100).toFixed(1),
        })).sort((a, b) => b.count - a.count);

        // Most / least crawled
        const urlList = Array.from(urlCounts.entries()).map(([path, d]) => ({
            path,
            count: d.count,
            bots: Array.from(d.bots),
            errorRate: +((d.statuses.filter(s => s >= 400).length / d.statuses.length) * 100).toFixed(0),
        }));
        urlList.sort((a, b) => b.count - a.count);

        const botBreakdown = BOT_PATTERNS.map(b => ({
            name: b.name,
            count: botLines.filter(l => b.pattern.test(l!.userAgent || "")).length,
        })).filter(b => b.count > 0).sort((a, b) => b.count - a.count);

        return NextResponse.json({
            summary: {
                totalLines: lines.length,
                parsedLines: valid.length,
                botRequests: botLines.length,
                uniqueUrls: urlCounts.size,
                errorRate: botLines.length ? +((botLines.filter(l => (l!.status || 0) >= 400).length / botLines.length * 100).toFixed(1)) : 0,
            },
            botBreakdown,
            statusSummary,
            mostCrawled: urlList.slice(0, 20),
            leastCrawled: urlList.filter(u => u.count === 1).slice(0, 20),
            highErrorUrls: urlList.filter(u => u.errorRate > 50).slice(0, 20),
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "File processing failed" }, { status: 500 });
    }
}
