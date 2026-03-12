import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

type Severity = "critical" | "warning" | "info" | "pass";
interface Issue {
    id: string;
    category: string;
    severity: Severity;
    title: string;
    detail: string;
    recommendation?: string;
}

function iss(id: string, cat: string, sev: Severity, title: string, detail: string, rec?: string): Issue {
    return { id, category: cat, severity: sev, title, detail, recommendation: rec };
}

function estimatePx(text: string): number {
    let w = 0;
    for (const ch of text) {
        if (ch === " ") w += 3.5;
        else if ("il|!1".includes(ch)) w += 4;
        else if (ch >= "A" && ch <= "Z") w += 11;
        else if ("mwW".includes(ch)) w += 14;
        else w += 8;
    }
    return w * (20 / 14);
}

function similarity(a: string, b: string): number {
    const setA = new Set(a.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(Boolean));
    const setB = new Set(b.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(Boolean));
    const intersection = [...setA].filter(w => setB.has(w)).length;
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : intersection / union;
}

function flesch(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return 0;
    const syllables = words.reduce((sum, w) => {
        const m = w.match(/[aeiouy]+/gi);
        return sum + (m ? m.length : 1);
    }, 0);
    return Math.max(0, Math.min(100, Math.round(206.835 - 1.015 * (words.length / sentences) - 84.6 * (syllables / words.length))));
}

function categorizeDomain(src: string, ownDomain: string): string {
    if (!src || src.startsWith("/")) return "first-party";
    try {
        const h = new URL(src.startsWith("//") ? "https:" + src : src).hostname.replace("www.", "");
        if (h === ownDomain) return "first-party";
        if (/google-analytics|gtag|segment|mixpanel|hotjar|heap|amplitude|clarity|plausible|fathom|posthog/.test(h)) return "analytics";
        if (/doubleclick|googlesyndication|adservice|adsense|moatads|scorecardresearch|taboola|outbrain|amazon-adsystem|media\.net/.test(h)) return "ads";
        if (/facebook\.net|twitter\.com|x\.com|linkedin\.com|pinterest\.com|tiktok\.com|instagram\.com|snapchat\.com/.test(h)) return "social";
        if (/cloudflare|cloudfront|fastly|akamai|jsdelivr|unpkg|cdnjs|bootstrapcdn|googleapis\.com|gstatic|ajax\.aspnetcdn/.test(h)) return "cdn";
        if (/fonts\.googleapis|fonts\.gstatic|typekit|fontawesome/.test(h)) return "fonts";
        if (/intercom|drift|hubspot|zendesk|freshchat|crisp|olark|tawk|livechat|chatlio/.test(h)) return "chat";
        if (/sentry|bugsnag|rollbar|logrocket/.test(h)) return "monitoring";
        if (/stripe|paypal|braintree|square/.test(h)) return "payments";
        return "other";
    } catch { return "other"; }
}

async function headFetch(url: string): Promise<{ status: number; ok: boolean }> {
    try {
        const r = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(6000) });
        return { status: r.status, ok: r.status < 400 };
    } catch { return { status: 0, ok: false }; }
}

async function getRedirectChain(url: string): Promise<{ chain: { url: string; status: number }[]; finalUrl: string; hops: number }> {
    const chain: { url: string; status: number }[] = [];
    let current = url;
    for (let i = 0; i < 10; i++) {
        try {
            const r = await fetch(current, { method: "GET", redirect: "manual", headers: { "User-Agent": "Mozilla/5.0 (compatible; Free SEO Tools/1.0)" }, signal: AbortSignal.timeout(5000) });
            chain.push({ url: current, status: r.status });
            if (r.status >= 300 && r.status < 400) {
                const loc = r.headers.get("location");
                if (!loc) break;
                current = loc.startsWith("http") ? loc : new URL(loc, current).href;
            } else break;
        } catch { break; }
    }
    return { chain, finalUrl: current, hops: chain.length - 1 };
}

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        let inputUrl = url.trim();
        if (!inputUrl.startsWith("http")) inputUrl = "https://" + inputUrl;

        const issues: Issue[] = [];

        // ── Phase 1: Fetch main page ──────────────────────────────────────────────
        const start = performance.now();
        let res: Response;
        try {
            res = await fetch(inputUrl, {
                headers: { "User-Agent": "Mozilla/5.0 (compatible; Free SEO Tools/1.0; +https://freeseotools.com)", "Accept": "text/html,application/xhtml+xml" },
                redirect: "follow",
                signal: AbortSignal.timeout(15000),
            });
        } catch (e: any) {
            return NextResponse.json({ error: `Could not reach URL: ${e.message}` }, { status: 500 });
        }
        const ttfb = Math.round(performance.now() - start);
        const html = await res.text();
        const finalUrl = res.url;
        const $ = cheerio.load(html);
        const hdrs = Object.fromEntries(res.headers.entries());
        const origin = new URL(finalUrl).origin;
        const domain = new URL(finalUrl).hostname;
        const path = new URL(finalUrl).pathname;
        const urlParams = new URL(finalUrl).searchParams;
        const isHttps = finalUrl.startsWith("https://");

        // ── Phase 2: HTML parsing ─────────────────────────────────────────────────
        // Meta basics
        const title = $("title").first().text().trim();
        const metaDesc = $("meta[name='description']").attr("content")?.trim() || "";
        const metaRobots = $("meta[name='robots']").attr("content")?.trim() || "";
        const xRobotsTag = hdrs["x-robots-tag"] || "";
        const canonical = $("link[rel='canonical']").attr("href")?.trim() || "";
        const viewport = $("meta[name='viewport']").attr("content")?.trim() || "";
        const charset = $("meta[charset]").attr("charset") || $("meta[http-equiv='Content-Type']").attr("content") || "";
        const langAttr = $("html").attr("lang")?.trim() || "";
        const ampLink = $("link[rel='amphtml']").attr("href") || "";
        const hasFavicon = $("link[rel*='icon']").length > 0;
        const preconnects = $("link[rel='preconnect']").length;
        const dnsPrefetch = $("link[rel='dns-prefetch']").length;
        const metaRefresh = $("meta[http-equiv='refresh']").attr("content") || "";
        const metaReferrer = $("meta[name='referrer']").attr("content") || "";
        const metaKeywords = $("meta[name='keywords']").attr("content")?.trim() || "";

        // Hreflang (International SEO)
        const hreflangs: { lang: string; href: string }[] = [];
        $("link[rel='alternate'][hreflang]").each((_, el) => {
            hreflangs.push({ lang: $(el).attr("hreflang") || "", href: $(el).attr("href") || "" });
        });
        const hasHreflang = hreflangs.length > 0;
        const hasXDefault = hreflangs.some(h => h.lang === "x-default");

        // Pagination signals (Pagination Analyzer)
        const relPrev = $("link[rel='prev']").attr("href") || "";
        const relNext = $("link[rel='next']").attr("href") || "";
        const hasPagination = !!(relPrev || relNext);
        // Facet parameters
        const PAGINATION_PARAMS = ["page", "p", "pg", "offset", "start", "skip", "from", "limit", "per_page", "per-page", "pagenumber", "pagenum", "currentpage"];
        const FACET_PARAMS = ["color", "size", "brand", "category", "filter", "sort", "order", "price", "min", "max", "tag", "type", "style", "material", "gender"];
        const urlParamKeys = [...urlParams.keys()];
        const paginationParams = urlParamKeys.filter(k => PAGINATION_PARAMS.includes(k.toLowerCase()));
        const facetParams = urlParamKeys.filter(k => FACET_PARAMS.includes(k.toLowerCase()));
        const hasParamExplosion = urlParamKeys.length > 3;
        const totalParams = urlParamKeys.length;

        // Canonical in URL: check if keyword appears in URL slug
        const urlSlug = path.replace(/[/-]/g, " ").toLowerCase();
        const titleKeywords = title.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(w => w.length > 4);
        const keywordInUrl = titleKeywords.some(kw => urlSlug.includes(kw));
        const urlDepth = path.split("/").filter(Boolean).length;

        // Headings
        const h1s: string[] = [];
        $("h1").each((_, el) => { h1s.push($(el).text().trim()); });
        const headings: { level: number; text: string }[] = [];
        $("h1,h2,h3,h4,h5,h6").each((_, el) => { headings.push({ level: parseInt(el.tagName.slice(1)), text: $(el).text().trim().slice(0, 100) }); });
        const h2s = headings.filter(h => h.level === 2).map(h => h.text);
        const h3Count = headings.filter(h => h.level === 3).length;

        // Check heading order (skipped levels)
        let headingOrderOk = true;
        let prevLevel = 0;
        for (const h of headings) {
            if (h.level > prevLevel + 1 && prevLevel > 0) { headingOrderOk = false; break; }
            prevLevel = h.level;
        }

        // OG / Social
        const ogTitle = $("meta[property='og:title']").attr("content")?.trim() || "";
        const ogDesc = $("meta[property='og:description']").attr("content")?.trim() || "";
        const ogImage = $("meta[property='og:image']").attr("content")?.trim() || "";
        const ogType = $("meta[property='og:type']").attr("content")?.trim() || "";
        const ogUrl = $("meta[property='og:url']").attr("content")?.trim() || "";
        const twitterCard = $("meta[name='twitter:card']").attr("content")?.trim() || "";
        const twitterTitle = $("meta[name='twitter:title']").attr("content")?.trim() || "";

        // Scripts — full breakdown (JS Bundle Analyzer + Third-Party Scripts)
        const scriptDetails: { src: string; isAsync: boolean; isDefer: boolean; inline: boolean; isThirdParty: boolean; category: string }[] = [];
        $("script").each((_, el) => {
            const src = $(el).attr("src") || "";
            const isAsync = $(el).attr("async") !== undefined;
            const isDefer = $(el).attr("defer") !== undefined;
            const inline = !src && ($(el).html() || "").trim().length > 0;
            const isThirdParty = !!src && !src.startsWith("/") && !src.includes(domain);
            const cat = categorizeDomain(src, domain);
            scriptDetails.push({ src, isAsync, isDefer, inline, isThirdParty, category: cat });
        });
        const renderBlocking = scriptDetails.filter(s => s.src && !s.inline && !s.isAsync && !s.isDefer && !s.isThirdParty && $("head").find(`script[src="${s.src}"]`).length > 0).map(s => s.src);
        const inlineScriptCount = scriptDetails.filter(s => s.inline).length;
        const totalScripts = scriptDetails.filter(s => !s.inline).length;
        const thirdPartyScripts = scriptDetails.filter(s => s.isThirdParty);
        const thirdPartyCount = thirdPartyScripts.length;
        // Category breakdown
        const scriptCategories: Record<string, number> = {};
        for (const s of thirdPartyScripts) { scriptCategories[s.category] = (scriptCategories[s.category] || 0) + 1; }

        // Stylesheets
        const cssLinks = $("link[rel='stylesheet']").length;
        const inlineStyles = $("style").length;
        const renderBlockingCss = $("link[rel='stylesheet']:not([media='print'])").length;

        // Images — CLS risk + alt (CWV proxy)
        const images: { src: string; alt: string; hasAlt: boolean; hasDimensions: boolean; isLazy: boolean }[] = [];
        $("img").each((_, el) => {
            const alt = $(el).attr("alt") || "";
            const w = $(el).attr("width"); const h2 = $(el).attr("height");
            const loading = $(el).attr("loading") || "";
            images.push({
                src: $(el).attr("src") || "",
                alt,
                hasAlt: $(el).attr("alt") !== undefined,
                hasDimensions: !!(w && h2),
                isLazy: loading === "lazy",
            });
        });
        const missingAlt = images.filter(i => !i.hasAlt || i.alt.trim() === "").length;
        const missingDimensions = images.filter(i => !i.hasDimensions).length; // CLS signal
        const lazyImages = images.filter(i => i.isLazy).length;

        // LCP candidate: first large <img> or background image hinted via preload
        const hasLcpPreload = $("link[rel='preload'][as='image']").length > 0;

        // Links
        const internalLinks: { href: string; anchor: string; nofollow: boolean }[] = [];
        const externalLinks: { href: string; anchor: string; nofollow: boolean }[] = [];
        $("a[href]").each((_, el) => {
            try {
                const raw = $(el).attr("href")!;
                if (raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return;
                const href = new URL(raw, finalUrl).href;
                const anchor = $(el).text().trim();
                const nofollow = ($(el).attr("rel") || "").includes("nofollow");
                if (new URL(href).hostname === domain) internalLinks.push({ href, anchor, nofollow });
                else externalLinks.push({ href, anchor, nofollow });
            } catch { }
        });
        const uniqueInternalLinks = [...new Map(internalLinks.map(l => [l.href, l])).values()];
        const emptyAnchors = internalLinks.filter(l => !l.anchor).length;
        const nofollowInternal = internalLinks.filter(l => l.nofollow).length;

        // Anchor text analysis
        const anchorMap: Record<string, number> = {};
        for (const l of internalLinks) { if (l.anchor) anchorMap[l.anchor.toLowerCase()] = (anchorMap[l.anchor.toLowerCase()] || 0) + 1; }
        const topAnchors = Object.entries(anchorMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
        // Anchor keyword stuffing: top anchor used way too often
        const overusedAnchor = topAnchors.length > 0 && topAnchors[0][1] > 10 && internalLinks.length > 5 ? topAnchors[0][0] : null;

        // Schema
        const schemaTypes: string[] = [];
        let schemaErrors = 0;
        $("script[type='application/ld+json']").each((_, el) => {
            try {
                const data = JSON.parse($(el).html() || "");
                const arr = Array.isArray(data) ? data : [data];
                for (const item of arr) {
                    const type = item["@type"];
                    if (type) schemaTypes.push(Array.isArray(type) ? type.join(", ") : type);
                }
            } catch { schemaErrors++; }
        });
        const hasBreadcrumb = schemaTypes.some(t => t.toLowerCase().includes("breadcrumb"));
        const hasFAQ = schemaTypes.some(t => t.toLowerCase().includes("faq"));
        const hasProduct = schemaTypes.some(t => t.toLowerCase().includes("product"));
        const hasArticle = schemaTypes.some(t => t.toLowerCase().includes("article"));
        const hasOrg = schemaTypes.some(t => t.toLowerCase().includes("organization") || t.toLowerCase().includes("localbusiness"));

        // Content quality
        const bodyText = $("body").clone().find("script,style,nav,footer,header").remove().end().text().replace(/\s+/g, " ").trim();
        const wordCount = bodyText.split(" ").filter(Boolean).length;
        const codeRatio = Math.round((bodyText.length / html.length) * 100);
        const readScore = flesch(bodyText.slice(0, 5000));
        const pageSizeKb = Math.round(Buffer.byteLength(html, "utf8") / 1024);
        const titleH1Similarity = title && h1s[0] ? Math.round(similarity(title, h1s[0]) * 100) : 0;
        const titleMetaSimilarity = title && metaDesc ? Math.round(similarity(title, metaDesc) * 100) : 0;

        // Keyword cannibalization proxy: multiple pages are hard to detect from single URL,
        // but we can detect if title and H1 are nearly identical (content overlap signal)
        const hasKeywordCannibSignal = titleH1Similarity > 95 && h1s.length === 1;

        // Forms (accessibility)
        const formCount = $("form").length;
        const inputsWithoutLabel = $("input:not([type='hidden']):not([type='submit']):not([type='button'])").filter((_, el) => {
            const id = $(el).attr("id");
            return !(id && $(`label[for="${id}"]`).length > 0) && !$(el).attr("aria-label") && !$(el).attr("aria-labelledby");
        }).length;
        const hasAutocomplete = $("input[autocomplete]").length > 0;
        const hasSkipLink = $("a[href='#main'], a[href='#content'], a[href='#skip']").length > 0;

        // Crawl budget signals
        const urlDepthSignal = urlDepth > 4 ? "deep" : urlDepth > 2 ? "moderate" : "shallow";

        // ── Phase 3: Parallel network checks ──────────────────────────────────────
        const [
            robotsResult,
            sitemapResult,
            redirectResult,
            ogImageResult,
            internalLinkChecks,
        ] = await Promise.allSettled([
            // robots.txt — deep parse (Robots.txt Tester + Crawl Budget Simulator)
            (async () => {
                const r = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(5000) });
                const text = r.ok ? await r.text() : "";
                const hasSitemap = text.toLowerCase().includes("sitemap:");
                const sitemapUrls = (text.match(/^Sitemap:\s*(.+)$/gim) || []).map(l => l.replace(/^Sitemap:\s*/i, "").trim());
                let blocked = false; let inGroup = false;
                const disallowRules: string[] = [];
                const allowRules: string[] = [];
                let crawlDelay: number | null = null;
                let groupCrawlDelay: number | null = null;
                for (const line of text.split("\n")) {
                    const t = line.trim();
                    if (t.startsWith("#") || !t) continue;
                    if (t.toLowerCase().startsWith("user-agent:")) {
                        const ag = t.split(":")[1].trim();
                        inGroup = ag === "*" || ag.toLowerCase() === "googlebot";
                    } else if (inGroup && t.toLowerCase().startsWith("disallow:")) {
                        const dp = t.split(":").slice(1).join(":").trim();
                        if (dp) disallowRules.push(dp);
                        if (dp && path.startsWith(dp)) blocked = true;
                    } else if (inGroup && t.toLowerCase().startsWith("allow:")) {
                        allowRules.push(t.split(":").slice(1).join(":").trim());
                    } else if (inGroup && t.toLowerCase().startsWith("crawl-delay:")) {
                        groupCrawlDelay = parseFloat(t.split(":")[1].trim()) || null;
                    } else if (t.toLowerCase().startsWith("crawl-delay:")) {
                        crawlDelay = parseFloat(t.split(":")[1].trim()) || null;
                    }
                }
                const effectiveCrawlDelay = groupCrawlDelay ?? crawlDelay;
                const hasWildcard = disallowRules.some(r => r.includes("*") || r.includes("$"));
                const blocksMedia = disallowRules.some(r => /\.(css|js|png|jpg|gif|svg|woff)/.test(r));
                return { text, hasSitemap, sitemapUrls, blocked, disallowRules, allowRules, effectiveCrawlDelay, hasWildcard, blocksMedia };
            })(),
            // sitemap — check existence + membership
            (async () => {
                const common = [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`, `${origin}/sitemap`];
                for (const sm of common) {
                    try {
                        const r = await fetch(sm, { signal: AbortSignal.timeout(5000) });
                        if (r.status === 200) {
                            const text = await r.text();
                            const inSitemap = text.includes(finalUrl) || text.includes(path);
                            const urlCount = (text.match(/<loc>/g) || []).length;
                            const hasImages = text.includes("image:") || text.includes("image/");
                            const hasPriority = text.includes("<priority>");
                            const hasLastmod = text.includes("<lastmod>");
                            return { exists: true, url: sm, inSitemap, urlCount, hasImages, hasPriority, hasLastmod };
                        }
                    } catch { }
                }
                return { exists: false, url: "", inSitemap: false, urlCount: 0, hasImages: false, hasPriority: false, hasLastmod: false };
            })(),
            // redirect chain (Redirect Checker)
            getRedirectChain(inputUrl),
            // OG image
            ogImage ? headFetch(ogImage.startsWith("http") ? ogImage : `${origin}${ogImage}`) : Promise.resolve({ status: 0, ok: false }),
            // Internal link health — sample 10 (Broken Link Checker)
            (async () => {
                const unique = uniqueInternalLinks.slice(0, 10);
                const results = await Promise.allSettled(unique.map(async l => {
                    const r = await headFetch(l.href);
                    return { ...l, status: r.status, ok: r.ok };
                }));
                return results.map((r, i) => r.status === "fulfilled" ? r.value : { ...unique[i], status: 0, ok: false });
            })(),
        ]);

        const robots = robotsResult.status === "fulfilled" ? robotsResult.value : { text: "", hasSitemap: false, sitemapUrls: [], blocked: false, disallowRules: [], allowRules: [], effectiveCrawlDelay: null, hasWildcard: false, blocksMedia: false };
        const sitemap = sitemapResult.status === "fulfilled" ? sitemapResult.value : { exists: false, url: "", inSitemap: false, urlCount: 0, hasImages: false, hasPriority: false, hasLastmod: false };
        const redirectChain = redirectResult.status === "fulfilled" ? redirectResult.value : { chain: [], finalUrl: inputUrl, hops: 0 };
        const ogImageCheck = ogImageResult.status === "fulfilled" ? ogImageResult.value : { status: 0, ok: false };
        const linkStatuses: Array<{ href: string; anchor: string; nofollow: boolean; status: number; ok: boolean }> =
            internalLinkChecks.status === "fulfilled" ? internalLinkChecks.value as any[] : [];
        const brokenLinks = linkStatuses.filter(l => !l.ok && l.status !== 0);

        // ── Phase 4: Build all issues ──────────────────────────────────────────────

        // ── SECURITY ─────────────────────────────────────
        issues.push(isHttps
            ? iss("https", "Security", "pass", "HTTPS enabled", "Served over HTTPS.")
            : iss("https", "Security", "critical", "Not served over HTTPS", "Page accessible over HTTP.", "Force HTTPS and install an SSL certificate."));

        if (isHttps) {
            issues.push(hdrs["strict-transport-security"]
                ? iss("hsts", "Security", "pass", "HSTS header present", hdrs["strict-transport-security"])
                : iss("hsts", "Security", "warning", "No HSTS header", "Strict-Transport-Security missing.", "Add: Strict-Transport-Security: max-age=31536000; includeSubDomains"));
        }
        issues.push(hdrs["x-content-type-options"]
            ? iss("xcto", "Security", "pass", "X-Content-Type-Options set", hdrs["x-content-type-options"])
            : iss("xcto", "Security", "info", "X-Content-Type-Options missing", "Prevents MIME-type sniffing.", "Add: X-Content-Type-Options: nosniff"));
        issues.push(hdrs["x-frame-options"] || (hdrs["content-security-policy"] || "").includes("frame")
            ? iss("xfo", "Security", "pass", "Clickjacking protection present", hdrs["x-frame-options"] || "CSP frame-ancestors")
            : iss("xfo", "Security", "info", "No clickjacking protection", "X-Frame-Options or CSP frame-ancestors missing.", "Add: X-Frame-Options: SAMEORIGIN"));
        issues.push(hdrs["content-security-policy"]
            ? iss("csp", "Security", "pass", "Content Security Policy set", "CSP header detected.")
            : iss("csp", "Security", "info", "No Content-Security-Policy", "CSP helps prevent XSS.", "Implement a Content-Security-Policy header."));
        if (metaRefresh) issues.push(iss("meta-refresh", "Security", "warning", "Meta refresh redirect detected", `Content: "${metaRefresh}"`, "Use HTTP 301 redirects instead of meta refresh — it's bad for SEO and UX."));

        // ── TECHNICAL ────────────────────────────────────
        issues.push(res.status === 200
            ? iss("status", "Technical", "pass", "HTTP 200 OK", "Page returns 200.")
            : iss("status", "Technical", "critical", `HTTP ${res.status}`, `Returned ${res.status}.`, "Ensure the page returns 200 OK."));

        if (redirectChain.hops === 0) issues.push(iss("redirects", "Technical", "pass", "No redirect chain", "Resolves directly, no hops."));
        else if (redirectChain.hops === 1) issues.push(iss("redirects", "Technical", "info", "1 redirect", `${inputUrl} → ${redirectChain.finalUrl}`, "A single 301 redirect is acceptable but adds ~50–100ms."));
        else issues.push(iss("redirects", "Technical", "warning", `${redirectChain.hops} redirect hops`, redirectChain.chain.map(c => `${c.status}`).join("→"), "Shorten to a single redirect to minimize latency and PageRank loss."));

        if (!canonical) issues.push(iss("canonical", "Technical", "warning", "No canonical tag", "Missing <link rel='canonical'>.", "Add a self-referencing canonical to signal preferred URL."));
        else if (canonical === finalUrl || canonical === finalUrl.replace(/\/$/, "") || finalUrl === canonical.replace(/\/$/, "")) {
            issues.push(iss("canonical", "Technical", "pass", "Canonical self-references correctly", canonical));
        } else {
            issues.push(iss("canonical", "Technical", "info", "Canonical points elsewhere", `→ ${canonical}`, "Verify this is intentional."));
        }

        issues.push(charset ? iss("charset", "Technical", "pass", "Charset declared", charset) : iss("charset", "Technical", "info", "Charset not declared", "", 'Add <meta charset="UTF-8"> to <head>.'));
        issues.push(langAttr ? iss("lang", "Technical", "pass", `lang="${langAttr}"`, "Language attribute declared.") : iss("lang", "Technical", "warning", "No lang on <html>", "Reduces accessibility + localization signals.", 'Add lang="en" to <html>.'));
        issues.push(hasFavicon ? iss("favicon", "Technical", "pass", "Favicon linked", "") : iss("favicon", "Technical", "info", "No favicon", "", "Add <link rel='icon' href='/favicon.ico'>."));

        if (keywordInUrl) issues.push(iss("keyword-url", "Technical", "pass", "Keyword appears in URL", `Slug "${path}" contains title keywords.`));
        else if (title) issues.push(iss("keyword-url", "Technical", "info", "Keyword not in URL slug", `Title: "${title.slice(0, 50)}" — URL: "${path}"`, "Include the primary keyword in the URL slug for a minor SEO signal."));

        if (urlDepth > 4) issues.push(iss("url-depth", "Technical", "warning", `URL is ${urlDepth} levels deep`, `Path: ${path}`, "Flatten URL structure — pages more than 4 levels deep receive less crawl budget."));
        else issues.push(iss("url-depth", "Technical", "pass", `URL depth: ${urlDepth}`, urlDepthSignal + " hierarchy"));

        if (metaKeywords) issues.push(iss("meta-keywords", "Technical", "info", "meta keywords still present", `"${metaKeywords.slice(0, 60)}"`, "meta keywords are ignored by Google and Bing. Remove them."));

        // ── CRAWL BUDGET (Crawl Budget Simulator) ────────────────────────────────
        if (robots.effectiveCrawlDelay && robots.effectiveCrawlDelay > 0) {
            if (robots.effectiveCrawlDelay >= 10) issues.push(iss("crawl-delay", "Crawl Budget", "critical", `Crawl-delay: ${robots.effectiveCrawlDelay}s`, "A crawl delay ≥10s severely limits how often Google can crawl your site.", "Remove crawl-delay or reduce it to 1–2s if needed."));
            else issues.push(iss("crawl-delay", "Crawl Budget", "warning", `Crawl-delay: ${robots.effectiveCrawlDelay}s`, "Crawl-delay limits Googlebot's crawl rate.", "Remove crawl-delay unless you have server performance issues."));
        } else {
            issues.push(iss("crawl-delay", "Crawl Budget", "pass", "No Crawl-delay in robots.txt", "Googlebot crawls at its own optimal rate."));
        }

        if (robots.blocksMedia) issues.push(iss("robots-media", "Crawl Budget", "warning", "robots.txt blocks CSS/JS/images", robots.disallowRules.filter(r => /\.(css|js|png|jpg|gif|svg|woff)/.test(r)).join(", "), "Google must render pages to index them. Blocking assets prevents proper rendering."));
        else issues.push(iss("robots-media", "Crawl Budget", "pass", "robots.txt doesn't block render assets", "CSS, JS and images can be accessed by Googlebot."));

        if (robots.disallowRules.length > 20) issues.push(iss("robots-disallow", "Crawl Budget", "info", `${robots.disallowRules.length} Disallow rules in robots.txt`, "A large number of rules is fine but ensure none block important pages.", "Review robots.txt to confirm no critical pages are accidentally blocked."));

        if (urlDepth > 4) issues.push(iss("crawl-depth", "Crawl Budget", "warning", "Page is buried deep in site structure", `${urlDepth} URL levels deep.`, "Restructure site so important pages are ≤3 clicks from the homepage."));

        if (hasParamExplosion) issues.push(iss("param-explosion", "Crawl Budget", "warning", `${totalParams} URL parameters detected`, `Params: ${urlParamKeys.join(", ")}`, "Multiple URL parameters create near-duplicate URLs. Use rel=canonical on filtered/sorted pages."));

        // ── INDEXABILITY ─────────────────────────────────
        issues.push(robots.blocked
            ? iss("robots-block", "Indexability", "critical", "URL blocked by robots.txt", "A Disallow rule blocks Googlebot.", "Remove the blocking Disallow rule.")
            : iss("robots-block", "Indexability", "pass", "Not blocked by robots.txt", "robots.txt allows crawl."));

        const isNoindex = metaRobots.toLowerCase().includes("noindex") || xRobotsTag.toLowerCase().includes("noindex");
        issues.push(isNoindex
            ? iss("noindex", "Indexability", "critical", "Noindex directive found", `${metaRobots || ""} ${xRobotsTag || ""}`.trim(), "Remove noindex to allow Google to index this page.")
            : iss("noindex", "Indexability", "pass", "Page is indexable", "No noindex directive."));

        if (!robots.hasSitemap) issues.push(iss("sitemap-ref", "Indexability", "warning", "No Sitemap in robots.txt", "", "Add: Sitemap: https://yourdomain.com/sitemap.xml"));

        if (sitemap.exists) {
            issues.push(sitemap.inSitemap
                ? iss("sitemap-in", "Indexability", "pass", "URL is in sitemap", sitemap.url)
                : iss("sitemap-in", "Indexability", "warning", "URL missing from sitemap", `Sitemap exists at ${sitemap.url}`, "Add this URL to your XML sitemap."));
            if (!sitemap.hasLastmod) issues.push(iss("sitemap-lastmod", "Indexability", "info", "Sitemap missing <lastmod>", "lastmod helps Googlebot know when to recrawl.", "Add <lastmod> dates to your sitemap entries."));
        } else {
            issues.push(iss("sitemap-exists", "Indexability", "warning", "No sitemap.xml found", "Checked /sitemap.xml, /sitemap_index.xml", "Create and submit an XML sitemap via Google Search Console."));
        }

        // International SEO / hreflang
        if (hasHreflang) {
            issues.push(iss("hreflang", "Indexability", "pass", `${hreflangs.length} hreflang annotation(s) found`, hreflangs.slice(0, 3).map(h => `${h.lang}: ${h.href.slice(-30)}`).join(" · ")));
            if (!hasXDefault) issues.push(iss("hreflang-xdefault", "Indexability", "warning", "No hreflang x-default", "x-default should point to your catch-all page for unmatched locales.", 'Add <link rel="alternate" hreflang="x-default" href="...">'));
        }

        // ── ON-PAGE ──────────────────────────────────────
        if (!title) issues.push(iss("title", "On-Page", "critical", "Missing title tag", "", "Add a 30–60 char title."));
        else {
            const px = estimatePx(title);
            if (px > 600) issues.push(iss("title-long", "On-Page", "warning", "Title truncated in SERPs", `~${Math.round(px)}px | "${title}"`, "Shorten to ≤600px (~55 chars)."));
            else if (title.length < 30) issues.push(iss("title-short", "On-Page", "warning", "Title too short", `${title.length} chars`, "Expand to 30–60 characters."));
            else issues.push(iss("title", "On-Page", "pass", "Title optimized", `"${title.slice(0, 60)}" (${title.length}c, ~${Math.round(px)}px)`));
        }

        if (!metaDesc) issues.push(iss("meta-desc", "On-Page", "critical", "Missing meta description", "", "Add a 120–160 char meta description."));
        else if (metaDesc.length > 160) issues.push(iss("meta-desc-long", "On-Page", "warning", "Meta description too long", `${metaDesc.length} chars`, "Keep under 160 chars."));
        else if (metaDesc.length < 50) issues.push(iss("meta-desc-short", "On-Page", "warning", "Meta description too short", `${metaDesc.length} chars`, "Expand to 120–160 chars."));
        else issues.push(iss("meta-desc", "On-Page", "pass", "Meta description optimized", `${metaDesc.length} chars`));

        if (h1s.length === 0) issues.push(iss("h1", "On-Page", "critical", "No H1 heading", "", "Add exactly one H1 per page."));
        else if (h1s.length > 1) issues.push(iss("h1-multi", "On-Page", "warning", `${h1s.length} H1 tags`, h1s.slice(0, 2).map(h => `"${h}"`).join(", "), "Use exactly one H1."));
        else issues.push(iss("h1", "On-Page", "pass", "Single H1", `"${h1s[0].slice(0, 70)}"`));

        if (h2s.length === 0 && wordCount > 300) issues.push(iss("h2", "On-Page", "info", "No H2 headings on content page", "", "Add H2 subheadings to improve structure."));
        else if (h2s.length > 0) issues.push(iss("h2", "On-Page", "pass", `${h2s.length} H2 headings`, h2s.slice(0, 2).map(h => `"${h.slice(0, 40)}"`).join(" · ")));

        if (!headingOrderOk) issues.push(iss("heading-order", "On-Page", "warning", "Heading levels skipped", "E.g. H1 → H3, skipping H2.", "Use sequential heading levels: H1 → H2 → H3."));
        else issues.push(iss("heading-order", "On-Page", "pass", "Heading hierarchy correct", "No skipped heading levels."));

        if (titleH1Similarity > 0) {
            if (titleH1Similarity < 20 && title && h1s[0]) issues.push(iss("title-h1-mismatch", "On-Page", "warning", "Title and H1 diverge significantly", `${titleH1Similarity}% overlap`, "Align title and H1 around the same primary keyword."));
            else if (titleH1Similarity > 95) issues.push(iss("title-h1-match", "On-Page", "info", "Title and H1 nearly identical", `${titleH1Similarity}% overlap`, "Vary wording slightly to target more query variants."));
        }
        if (titleMetaSimilarity > 70) issues.push(iss("title-meta-sim", "On-Page", "info", "Title and meta description very similar", `${titleMetaSimilarity}% word overlap`, "Write a unique meta description that expands on the title."));

        // ── CONTENT (Thin Content + Quality) ─────────────────────────────────────
        if (wordCount < 150) issues.push(iss("thin-critical", "Content", "critical", `Very thin: ${wordCount} words`, "Fewer than 150 words — Google may exclude from index.", "Add substantial, unique content to this page."));
        else if (wordCount < 300) issues.push(iss("thin", "Content", "warning", `Low word count: ${wordCount} words`, "Under 300 words may be seen as low-quality.", "Aim for 300–500+ words of meaningful content."));
        else issues.push(iss("word-count", "Content", "pass", `Word count: ${wordCount}`, "Sufficient content length."));

        if (codeRatio < 10) issues.push(iss("code-ratio", "Content", "warning", `Low text-to-code ratio: ${codeRatio}%`, "Too much markup relative to content.", "Minimize inline JS/CSS; use external files."));
        else issues.push(iss("code-ratio", "Content", "pass", `Text-to-code ratio: ${codeRatio}%`, "Healthy content-to-markup ratio."));

        if (readScore > 0) {
            if (readScore < 30) issues.push(iss("readability", "Content", "warning", `Difficult reading level (${readScore}/100)`, "Flesch-Kincaid < 30.", "Simplify language for broader audience."));
            else if (readScore < 50) issues.push(iss("readability", "Content", "info", `Moderate reading level (${readScore}/100)`, "Consider simplifying for general consumers."));
            else issues.push(iss("readability", "Content", "pass", `Reading level: ${readScore}/100`, "Content is accessible."));
        }

        // ── LINKS (Internal Link Audit + Broken Link Checker + Anchor Text) ──────
        if (internalLinks.length === 0) issues.push(iss("int-links", "Links", "warning", "No internal links", "Page is isolated from the rest of the site.", "Add internal links to distribute PageRank."));
        else issues.push(iss("int-links", "Links", "pass", `${internalLinks.length} internal, ${externalLinks.length} external links`, ""));

        if (brokenLinks.length > 0) issues.push(iss("broken", "Links", "critical", `${brokenLinks.length} broken internal link(s)`, brokenLinks.slice(0, 3).map(l => `${l.status} ${l.href}`).join(" | "), "Fix or remove these broken links."));
        else if (linkStatuses.length > 0) issues.push(iss("broken", "Links", "pass", `No broken links (${linkStatuses.length} checked)`, "All sampled internal links return 2xx."));

        if (emptyAnchors > 0) issues.push(iss("empty-anchors", "Links", "warning", `${emptyAnchors} link(s) with empty anchor text`, "", "Add descriptive anchor text to all links."));
        if (nofollowInternal > 3) issues.push(iss("nofollow-int", "Links", "info", `${nofollowInternal} nofollow internal links`, "Nofollowing internal links wastes PageRank.", "Remove rel=nofollow from internal links."));
        if (overusedAnchor) issues.push(iss("anchor-stuffing", "Links", "warning", `Anchor text overused: "${overusedAnchor}"`, `Used ${topAnchors[0][1]}× for internal links.`, "Vary anchor text for internal links."));

        // ── PAGINATION (Pagination Analyzer) ─────────────────────────────────────
        if (hasPagination) {
            issues.push(iss("pagination", "Pagination", "pass", "rel=prev/next pagination found", `prev: ${relPrev || "—"} | next: ${relNext || "—"}`));
            if (!canonical && hasPagination) issues.push(iss("pagination-canonical", "Pagination", "warning", "No canonical on paginated page", "Paginated pages should self-canonical or point to the series root.", "Add rel=canonical to each paginated page."));
        } else if (paginationParams.length > 0) {
            issues.push(iss("pagination", "Pagination", "warning", `Pagination via URL params (${paginationParams.join(", ")})`, "No rel=prev/next found. Google deprecated rel=prev/next, but canonical tags are still important.", "Ensure each paginated page has a self-referencing canonical."));
        }

        if (facetParams.length > 0) issues.push(iss("facets", "Pagination", "warning", `Facet parameters detected: ${facetParams.join(", ")}`, `${totalParams} total URL params.`, "Add canonical tags pointing to the non-filtered version, or use robots.txt to block parameter variations."));
        if (hasParamExplosion && !canonical) issues.push(iss("param-no-canonical", "Pagination", "critical", "Many URL params + no canonical", `${totalParams} params, no canonical tag.`, "Add a canonical tag on pages with URL parameters to prevent duplicate content indexing."));

        // ── PERFORMANCE ───────────────────────────────────
        const ttfbSev: Severity = ttfb <= 200 ? "pass" : ttfb <= 600 ? "warning" : "critical";
        issues.push(iss("ttfb", "Performance", ttfbSev, `TTFB: ${ttfb}ms`, ttfb <= 200 ? "Excellent." : ttfb <= 600 ? "Acceptable but improvable." : "Poor — Google threshold is 600ms.", ttfb > 600 ? "Enable CDN, server caching, or upgrade hosting." : ttfb > 200 ? "Consider a CDN or caching layer." : undefined));

        issues.push(pageSizeKb > 200
            ? iss("page-size", "Performance", "warning", `HTML: ${pageSizeKb}KB`, "Large HTML response.", "Minify HTML, remove inline JS/CSS.")
            : iss("page-size", "Performance", "pass", `HTML: ${pageSizeKb}KB`, ""));

        issues.push(renderBlocking.length > 0
            ? iss("render-blocking", "Performance", "warning", `${renderBlocking.length} render-blocking script(s)`, renderBlocking.slice(0, 3).join(", "), "Add async or defer to non-critical scripts.")
            : iss("render-blocking", "Performance", "pass", "No render-blocking scripts", "All <head> scripts use async/defer."));

        if (thirdPartyCount > 8) issues.push(iss("3p-scripts", "Performance", "warning", `${thirdPartyCount} third-party scripts`, Object.entries(scriptCategories).map(([k, v]) => `${k}:${v}`).join(", "), "Audit and remove non-essential third-party scripts."));
        else if (thirdPartyCount > 0) issues.push(iss("3p-scripts", "Performance", "info", `${thirdPartyCount} third-party script(s)`, Object.entries(scriptCategories).map(([k, v]) => `${k}:${v}`).join(", ")));
        else issues.push(iss("3p-scripts", "Performance", "pass", "No third-party scripts", "No external script dependencies."));

        // CLS risk (CWV proxy)
        if (missingDimensions > 3) issues.push(iss("cls-risk", "Performance", "warning", `CLS risk: ${missingDimensions} images missing width/height`, "Images without explicit dimensions cause layout shifts (CLS).", "Add width and height attributes to all <img> tags."));
        else if (images.length > 0) issues.push(iss("cls-risk", "Performance", "pass", "Images have width/height attributes", `${images.length - missingDimensions}/${images.length} images dimensioned.`));

        if (!hasLcpPreload && images.length > 0) issues.push(iss("lcp-preload", "Performance", "info", "No LCP image preload hint", "The above-the-fold hero image may not be preloaded.", 'Add <link rel="preload" as="image" href="..."> for your hero image.'));
        else if (hasLcpPreload) issues.push(iss("lcp-preload", "Performance", "pass", "LCP image preload hint found", "Hero image is preloaded."));

        if (preconnects + dnsPrefetch === 0 && thirdPartyCount > 0) issues.push(iss("resource-hints", "Performance", "info", "No preconnect/dns-prefetch hints", "Speeds up third-party connection setup.", "Add <link rel='preconnect'> for critical third-party origins."));
        else if (preconnects > 0) issues.push(iss("resource-hints", "Performance", "pass", `${preconnects} preconnect, ${dnsPrefetch} dns-prefetch`, "Resource hints present."));

        // ── MOBILE ────────────────────────────────────────
        issues.push(viewport ? iss("viewport", "Mobile", "pass", "Viewport meta set", viewport) : iss("viewport", "Mobile", "critical", "No viewport meta tag", "", 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.'));
        if (ampLink) issues.push(iss("amp", "Mobile", "pass", "AMP version linked", ampLink));
        if (viewport && viewport.includes("user-scalable=no")) issues.push(iss("user-scalable", "Mobile", "warning", "Zoom disabled (user-scalable=no)", "Disabling zoom breaks accessibility on mobile.", "Remove user-scalable=no from viewport meta."));

        // ── ACCESSIBILITY ─────────────────────────────────
        if (missingAlt > 0) issues.push(iss("img-alt", "Accessibility", "warning", `${missingAlt}/${images.length} images missing alt`, "", "Add descriptive alt text. Use alt=\"\" for decorative images."));
        else if (images.length > 0) issues.push(iss("img-alt", "Accessibility", "pass", "All images have alt text", `${images.length} checked.`));

        if (formCount > 0 && inputsWithoutLabel > 0) issues.push(iss("form-labels", "Accessibility", "warning", `${inputsWithoutLabel} input(s) without labels`, "", "Add <label for='id'> or aria-label to all inputs."));
        else if (formCount > 0) issues.push(iss("form-labels", "Accessibility", "pass", "All inputs labeled", `${formCount} form(s).`));

        issues.push(langAttr ? iss("lang-a11y", "Accessibility", "pass", `lang="${langAttr}"`, "") : iss("lang-a11y", "Accessibility", "warning", "No lang on <html>", "Screen readers need lang to use correct pronunciation.", 'Add lang="en" to <html>.'));

        if (hasSkipLink) issues.push(iss("skip-link", "Accessibility", "pass", "Skip navigation link found", "Skip link helps keyboard users."));
        else issues.push(iss("skip-link", "Accessibility", "info", "No skip-to-content link", "", "Add a skip link for keyboard accessibility."));

        if (lazyImages > 0) issues.push(iss("lazy-images", "Accessibility", "info", `${lazyImages} images use loading="lazy"`, "Ensure above-the-fold images are not lazy-loaded."));

        // ── STRUCTURED DATA (Schema Coverage) ────────────────────────────────────
        if (schemaErrors > 0) issues.push(iss("schema-error", "Structured Data", "critical", `${schemaErrors} JSON-LD parse error(s)`, "Malformed JSON-LD is silently ignored by Google.", "Validate at schema.org/validator and fix JSON syntax."));
        if (schemaTypes.length === 0) issues.push(iss("schema-missing", "Structured Data", "warning", "No structured data found", "", "Add relevant schema: Article, Product, FAQPage, BreadcrumbList, etc."));
        else issues.push(iss("schema", "Structured Data", "pass", `Schema: ${schemaTypes.join(", ")}`, `${schemaTypes.length} type(s).`));

        if (!hasBreadcrumb && path !== "/" && path !== "") issues.push(iss("breadcrumb", "Structured Data", "info", "No BreadcrumbList schema", "", "Add BreadcrumbList on non-homepage pages for SERP breadcrumbs."));
        if (schemaTypes.length > 0 && !hasOrg && path === "/") issues.push(iss("org-schema", "Structured Data", "info", "No Organization schema on homepage", "", "Add Organization or LocalBusiness schema on the homepage."));

        // ── SOCIAL ────────────────────────────────────────
        issues.push(ogTitle ? iss("og-title", "Social", "pass", "og:title set", ogTitle.slice(0, 80)) : iss("og-title", "Social", "warning", "Missing og:title", "", "Add <meta property='og:title'>."));
        issues.push(ogDesc ? iss("og-desc", "Social", "pass", "og:description set", ogDesc.slice(0, 80)) : iss("og-desc", "Social", "warning", "Missing og:description", "", "Add og:description for share previews."));

        if (!ogImage) issues.push(iss("og-image", "Social", "warning", "Missing og:image", "No image preview on social shares.", "Add a 1200×630px og:image."));
        else if (!ogImageCheck.ok) issues.push(iss("og-image-ok", "Social", "critical", "og:image URL is broken", `Status ${ogImageCheck.status}: ${ogImage}`, "Fix or replace the og:image URL."));
        else issues.push(iss("og-image", "Social", "pass", "og:image accessible", ogImage.slice(-50)));

        issues.push(twitterCard ? iss("twitter", "Social", "pass", "Twitter card set", twitterCard) : iss("twitter", "Social", "info", "No twitter:card", "", 'Add <meta name="twitter:card" content="summary_large_image">.'));
        if (!ogType) issues.push(iss("og-type", "Social", "info", "og:type not set", "", 'Add <meta property="og:type" content="website">.'));
        if (!ogUrl) issues.push(iss("og-url", "Social", "info", "og:url not set", "", "Add og:url to specify canonical social URL."));

        // ── Phase 5: Extract all raw data for detailed display ────────────────────
        // All meta tags
        const allMeta: { key: string; content: string }[] = [];
        $("meta").each((_, el) => {
            const name = $(el).attr("name") || $(el).attr("property") || $(el).attr("http-equiv") || ($(el).attr("charset") ? "charset" : "");
            const content = $(el).attr("content") || $(el).attr("charset") || "";
            if (name) allMeta.push({ key: name, content });
        });

        // Raw schema JSON blocks
        const schemaRaw: { type: string; json: string }[] = [];
        $("script[type='application/ld+json']").each((_, el) => {
            try {
                const raw = ($(el).html() || "").trim();
                const parsed = JSON.parse(raw);
                const type = Array.isArray(parsed) ? parsed[0]?.["@type"] : parsed["@type"];
                schemaRaw.push({ type: Array.isArray(type) ? type.join(", ") : (type || "Unknown"), json: JSON.stringify(parsed, null, 2).slice(0, 4000) });
            } catch { schemaRaw.push({ type: "Parse Error", json: ($(el).html() || "").trim().slice(0, 500) }); }
        });

        // Merge link statuses into full internal links array
        const statusMap = new Map(linkStatuses.map((s: any) => [s.href, s]));
        const allInternalLinks = internalLinks.slice(0, 150).map(l => ({
            ...l,
            status: statusMap.has(l.href) ? (statusMap.get(l.href) as any).status : null,
            ok: statusMap.has(l.href) ? (statusMap.get(l.href) as any).ok : null,
            checked: statusMap.has(l.href),
        }));

        // ── Phase 6: Scoring ─────────────────────────────────────────────────────
        const scored = issues.filter(i => ["critical", "warning", "pass"].includes(i.severity));
        const critCount = scored.filter(i => i.severity === "critical").length;
        const warnCount = scored.filter(i => i.severity === "warning").length;
        const passCount = scored.filter(i => i.severity === "pass").length;
        const total = critCount + warnCount + passCount;
        const score = total > 0 ? Math.max(0, Math.min(100, Math.round(((passCount - critCount * 2 - warnCount * 0.5) / total) * 100))) : 100;

        const categories = [...new Set(issues.map(i => i.category))];
        const categoryScores: Record<string, { score: number; issues: number; passes: number }> = {};
        for (const cat of categories) {
            const ci = issues.filter(i => i.category === cat);
            const cc = ci.filter(i => i.severity === "critical").length;
            const cw = ci.filter(i => i.severity === "warning").length;
            const cp = ci.filter(i => i.severity === "pass").length;
            const ct = cc + cw + cp;
            categoryScores[cat] = { score: ct > 0 ? Math.max(0, Math.min(100, Math.round(((cp - cc * 2 - cw * 0.5) / ct) * 100))) : 100, issues: cc + cw, passes: cp };
        }

        return NextResponse.json({
            url: finalUrl,
            score,
            summary: { critical: critCount, warnings: warnCount, passes: passCount, total: issues.length },
            categoryScores,
            issues: issues.filter(i => i.severity !== "pass"),
            passes: issues.filter(i => i.severity === "pass"),
            // ── Raw detail arrays ──────────────────────────────────────────────────
            allImages: images.slice(0, 150),
            allInternalLinks,
            allExternalLinks: externalLinks.slice(0, 80),
            allScripts: scriptDetails,
            allMeta,
            allHeaders: hdrs,
            schemaRaw,
            robotsText: robots.text || "",
            // ── Summary meta ──────────────────────────────────────────────────────
            meta: {
                title, metaDesc, h1: h1s[0] || "", h1s, canonical, langAttr, charset,
                ogTitle, ogDesc, ogImage, ogType, ogUrl, twitterCard, twitterTitle,
                wordCount, pageSizeKb, ttfb, ttfbSev: ttfbSev as string, schemaTypes,
                internalLinks: internalLinks.length, externalLinks: externalLinks.length,
                images: images.length, missingAlt, missingDimensions, lazyImages,
                h2s: h2s.slice(0, 8), h3Count, codeRatio, readScore,
                renderBlocking: renderBlocking.slice(0, 5), thirdPartyCount, totalScripts, inlineScriptCount, preconnects, dnsPrefetch,
                scriptCategories,
                titleH1Similarity, titleMetaSimilarity,
                hasBreadcrumb, hasFAQ, hasProduct, hasArticle, hasOrg, hasFavicon, ampLink, hasLcpPreload,
                redirectChain: redirectChain.chain, redirectHops: redirectChain.hops,
                sitemap: { exists: sitemap.exists, url: sitemap.url, inSitemap: sitemap.inSitemap, urlCount: sitemap.urlCount, hasLastmod: sitemap.hasLastmod },
                robots: { hasSitemap: robots.hasSitemap, disallowRules: robots.disallowRules, effectiveCrawlDelay: robots.effectiveCrawlDelay, blocksMedia: robots.blocksMedia, hasWildcard: robots.hasWildcard },
                topAnchors, linkStatuses, brokenLinks,
                headings: headings.slice(0, 50),
                hreflangs,
                hasPagination, relPrev, relNext, paginationParams, facetParams, totalParams,
                keywordInUrl, urlDepth, metaKeywords, urlSlug: path,
            },
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Audit failed" }, { status: 500 });
    }
}
