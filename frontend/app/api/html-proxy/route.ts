
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
        return new NextResponse("Missing URL parameter", { status: 400 });
    }

    try {
        // Validate URL
        const targetUrl = new URL(url);

        // Fetch the target URL with mimicking headers
        const response = await fetch(targetUrl.toString(), {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": targetUrl.origin,
                "Origin": targetUrl.origin,
            },
        });

        if (!response.ok) {
            return new NextResponse(`Failed to fetch URL: ${response.status} ${response.statusText}`, {
                status: response.status,
            });
        }

        const contentType = response.headers.get("content-type");
        const isHtml = contentType && contentType.includes("text/html");

        if (!isHtml) {
            // If it's not HTML (e.g. image, css), just proxy it directly with correct headers
            // STREAM for performance (don't wait for blob/text)
            const headers = new Headers();

            // 1. Force the correct MIME type so the browser doesn't block it
            headers.set("Content-Type", contentType || "application/octet-stream");

            // 2. Add CORS headers so your iframe can actually use these assets
            headers.set("Access-Control-Allow-Origin", "*");

            // 3. Keep cache headers to prevent the proxy from being too slow
            const cache = response.headers.get("cache-control");
            if (cache) {
                headers.set("cache-control", cache);
            } else {
                // If upstream has no cache policy, default to 1 hour to speed up repeat visits
                headers.set("cache-control", "public, max-age=3600");
            }
            // 4. Preserve ETag/Last-Modified for conditional requests
            const etag = response.headers.get("etag");
            if (etag) headers.set("etag", etag);

            const lastModified = response.headers.get("last-modified");
            if (lastModified) headers.set("last-modified", lastModified);

            return new NextResponse(response.body, { status: 200, headers });
        }

        // It's HTML, let's process it
        let html = await response.text();

        // 1. Inject <base> tag for relative assets
        // Use response.url to handle redirects (e.g. http -> https)
        const responseUrl = new URL(response.url);
        const baseUrl = `${responseUrl.protocol}//${responseUrl.host}/`;
        const baseTag = `<base href="${baseUrl}">`;
        // Inject referrer policy to avoid hotlink protection/CORS issues with assets
        const referrerMeta = '<meta name="referrer" content="no-referrer" />';

        // 2. Inject Client-Side Fetch/XHR Interceptor
        // This script intercepts relative API calls (like Next.js data fetches) and routes them through our proxy
        const fetchInterceptorScript = `
            <script>
                (function() {
                    const originalFetch = window.fetch;
                    const originalOpen = XMLHttpRequest.prototype.open;
                    
                    // Helper to get absolute URL based on the <base> tag we injected
                    function getAbsoluteUrl(url) {
                        try {
                            return new URL(url, document.baseURI).href;
                        } catch (e) {
                            return url;
                        }
                    }

                    // Patch fetch
                    window.fetch = function(input, init) {
                        let url;
                        if (typeof input === 'string') {
                            url = input;
                        } else if (input instanceof URL) {
                            url = input.href;
                        } else if (input instanceof Request) {
                            url = input.url;
                        }

                        if (url) {
                            const absoluteUrl = getAbsoluteUrl(url);
                            // If it matches our base (relative or absolute to target), proxy it
                            if (url.startsWith('/') || absoluteUrl.startsWith(document.baseURI)) {
                                // IMPORTANT: Use window.location.origin to bypass the <base> tag for the proxy request itself
                                const newUrl = window.location.origin + '/api/html-proxy?url=' + encodeURIComponent(absoluteUrl);
                                return originalFetch(newUrl, init);
                            }
                        }
                        return originalFetch(input, init);
                    };

                    // Patch XMLHttpRequest
                    XMLHttpRequest.prototype.open = function(method, url, ...args) {
                        const absoluteUrl = getAbsoluteUrl(url);
                        if (url && (url.startsWith('/') || absoluteUrl.startsWith(document.baseURI))) {
                            const newUrl = window.location.origin + '/api/html-proxy?url=' + encodeURIComponent(absoluteUrl);
                            return originalOpen.call(this, method, newUrl, ...args);
                        }
                        return originalOpen.call(this, method, url, ...args);
                    };
                })();
            </script>
        `;

        const mode = searchParams.get("mode");

        if (mode !== 'full') {
            // STANDARD MODE: Inject everything to help the proxy work better
            // In standard mode, we inject at the TOP of head to ensure assets load correctly immediately
            if (html.includes("<head>")) {
                html = html.replace("<head>", `<head>${baseTag}${referrerMeta}${fetchInterceptorScript}`);
            } else if (html.includes("<head ")) {
                html = html.replace(/<head\s[^>]*>/, (match) => `${match}${baseTag}${referrerMeta}${fetchInterceptorScript}`);
            } else {
                html = `${baseTag}${referrerMeta}${fetchInterceptorScript}${html}`;
            }
        } else {
            // FULL MODE: Minimal interference. 
            // 1. NO Interceptors (Fetch or Navigation) to avoid breaking hydration.
            // 2. Inject <base> at the BOTTOM of <head> to be less intrusive to the framework's initial DOM structure.
            if (html.includes("</head>")) {
                html = html.replace("</head>", `${baseTag}</head>`);
            } else {
                // Fallback: If no closing head tag, just prepend it (less ideal but necessary)
                html = `${baseTag}${html}`;
            }

            // NUCLEAR OPTION: Static Path Rewrite (Safest for CSS)
            // Regex to find things like src="/path" or href="/path" and make them absolute
            const absoluteBase = baseUrl.replace(/\/$/, ""); // Remove trailing slash
            // Matches src="/...", href="/...", action="/..." but NOT src="//..." (protocol-relative)
            html = html.replace(/(src|href|action)="\/([^\/])/g, `$1="${absoluteBase}/$2`);
        }

        // 3. Inject Navigation Interceptor (Legacy click handling)
        // Only inject this if NOT in full mode (in full mode, let the framework handle routing)
        if (mode !== 'full') {
            const interceptorScript = `
                <script>
                    document.addEventListener('click', function(e) {
                        const link = e.target.closest('a');
                        if (link && link.href) {
                            e.preventDefault();
                            // Send message to parent
                            window.parent.postMessage({ type: 'PROXY_NAVIGATE', url: link.href }, '*');
                        }
                    }, true);
                    
                    // Also intercept form submissions if possible, keeping it simple for now
                </script>
            `;

            if (html.includes("</body>")) {
                html = html.replace("</body>", `${interceptorScript}</body>`);
            } else {
                html += interceptorScript;
            }
        }


        // 3. Return response with restrictive headers stripped
        // usage of NextResponse.next() is for middleware, here we create a new response

        // IMPORTANT: Do NOT copy 'Content-Encoding' or 'Content-Length' 
        // from the original response because you have modified the body text.
        const newHeaders = new Headers();
        newHeaders.set("Content-Type", "text/html; charset=utf-8");
        newHeaders.set("Access-Control-Allow-Origin", "*");

        // If you want to keep other headers, filter them:
        const headersToKeep = ['set-cookie', 'cache-control', 'etag', 'last-modified'];
        headersToKeep.forEach(h => {
            const val = response.headers.get(h);
            if (val) newHeaders.set(h, val);
        });

        return new NextResponse(html, {
            status: 200,
            headers: newHeaders,
        });

    } catch (error) {
        console.error("Proxy fetch error:", error);
        return new NextResponse("Internal Server Error fetching URL", { status: 500 });
    }
}
