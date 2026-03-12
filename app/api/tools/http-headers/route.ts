import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json(
                { success: false, error: "URL is required" },
                { status: 400 }
            );
        }

        let validUrl = url;
        if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
            validUrl = "https://" + validUrl;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        let response;
        try {
            response = await fetch(validUrl, {
                method: 'GET', // Often better than HEAD since some servers block HEAD or return different headers
                headers: {
                    "User-Agent": "Mozilla/5.0 (compatible; Free SEO Tools Bot; +https://freeseotools.com)",
                },
                signal: controller.signal,
            });
        } catch (e: any) {
            if (e.name === 'AbortError') throw new Error("Connection timed out.");
            throw new Error(`Failed to fetch URL: ${e.message}`);
        } finally {
            clearTimeout(timeoutId);
        }

        const allHeaders: { name: string; value: string }[] = [];
        response.headers.forEach((value, key) => {
            allHeaders.push({ name: key, value });
        });

        // Helper to get header case-insensitively
        const getHeader = (name: string) => {
            return allHeaders.find(h => h.name.toLowerCase() === name.toLowerCase())?.value;
        };

        const securityHeaders = [
            {
                name: "Strict-Transport-Security",
                description: "Enforces secure (HTTP over SSL/TLS) connections to the server.",
                present: !!getHeader("Strict-Transport-Security"),
                value: getHeader("Strict-Transport-Security")
            },
            {
                name: "Content-Security-Policy",
                description: "Prevents XSS and other code injection attacks by defining approved sources of content.",
                present: !!getHeader("Content-Security-Policy"),
                value: getHeader("Content-Security-Policy")
            },
            {
                name: "X-Frame-Options",
                description: "Protects against clickjacking by controlling whether the site can be framed.",
                present: !!getHeader("X-Frame-Options"),
                value: getHeader("X-Frame-Options")
            },
            {
                name: "X-Content-Type-Options",
                description: "Prevents the browser from interpreting files as a different MIME type.",
                present: !!getHeader("X-Content-Type-Options"),
                value: getHeader("X-Content-Type-Options")
            },
            {
                name: "Referrer-Policy",
                description: "Controls how much referrer information (sent via the Referer header) should be included with requests.",
                present: !!getHeader("Referrer-Policy"),
                value: getHeader("Referrer-Policy")
            },
            {
                name: "Permissions-Policy",
                description: "Allows a site to control which features and APIs can be used in the browser.",
                present: !!getHeader("Permissions-Policy") || !!getHeader("Feature-Policy"),
                value: getHeader("Permissions-Policy") || getHeader("Feature-Policy")
            }
        ];

        return NextResponse.json({
            url: validUrl,
            success: true,
            status: response.status,
            statusText: response.statusText,
            server: getHeader("Server"),
            contentType: getHeader("Content-Type"),
            headers: allHeaders.sort((a, b) => a.name.localeCompare(b.name)),
            securityHeaders
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to inspect headers" },
            { status: 500 }
        );
    }
}
