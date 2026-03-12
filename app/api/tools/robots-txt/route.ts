import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { domain } = await req.json();

        if (!domain) {
            return NextResponse.json(
                { success: false, error: "Domain is required" },
                { status: 400 }
            );
        }

        // Clean domain input
        let target = domain.replace(/^https?:\/\//, '').split('/')[0];
        const robotsUrl = `https://${target}/robots.txt`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(robotsUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; Free SEO Tools Bot; +https://freeseotools.com)",
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return NextResponse.json(
                { success: false, status: response.status, error: `Failed to fetch robots.txt. HTTP Status: ${response.status}` },
                { status: 200 }
            );
        }

        const content = await response.text();

        // Parse the file
        const lines = content.split('\n');
        const sitemaps: string[] = [];
        const rules: { userAgent: string; type: 'allow' | 'disallow'; path: string }[] = [];

        let currentUserAgent = '*';

        lines.forEach(line => {
            // Remove comments for parsing
            const cleanLine = line.split('#')[0].trim();
            if (!cleanLine) return;

            const lowerLine = cleanLine.toLowerCase();

            if (lowerLine.startsWith('sitemap:')) {
                sitemaps.push(cleanLine.substring(8).trim());
            } else if (lowerLine.startsWith('user-agent:')) {
                currentUserAgent = cleanLine.substring(11).trim() || '*';
            } else if (lowerLine.startsWith('disallow:')) {
                const path = cleanLine.substring(9).trim();
                if (path) {
                    rules.push({ userAgent: currentUserAgent, type: 'disallow', path });
                }
            } else if (lowerLine.startsWith('allow:')) {
                const path = cleanLine.substring(6).trim();
                if (path) {
                    rules.push({ userAgent: currentUserAgent, type: 'allow', path });
                }
            }
        });

        return NextResponse.json({
            url: robotsUrl,
            success: true,
            status: response.status,
            content,
            sitemaps,
            rules
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch robots.txt" },
            { status: 500 }
        );
    }
}
