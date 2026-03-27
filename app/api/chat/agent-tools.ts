import { z } from "zod";

export function getAgentTools(baseUrl: string) {
  // A helper function to call internal tools
  const callInternalTool = async (endpoint: string, body: any) => {
    try {
      const res = await fetch(`${baseUrl}/api/tools/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000), // Some tools take a long time
      });
      if (!res.ok) {
        const errorText = await res.text();
        return { error: `HTTP ${res.status}: ${errorText}` };
      }
      return await res.json();
    } catch (err: any) {
      return { error: `Execution failed: ${err.message}` };
    }
  };

  return {
    seo_audit: {
      description: "Runs a massive, comprehensive SEO Audit on a URL. Covers technical, on-page, performance, readability, and structured data.",
      parameters: z.object({
        url: z.string().url().describe("The full URL to audit"),
      }),
      execute: async ({ url }: { url: string }) => callInternalTool("seo-audit", { url }),
    } as any,

    lighthouse: {
      description: "Runs Google Lighthouse to measure Core Web Vitals, Performance, SEO, and Best Practices. Very slow.",
      parameters: z.object({
        url: z.string().url().describe("The full URL to test"),
      }),
      execute: async ({ url }: { url: string }) => callInternalTool("lighthouse", { url, strategy: "mobile" }),
    } as any,

    broken_links: {
      description: "Checks all internal links on a given URL to see if they are returning 404s or other errors.",
      parameters: z.object({
        url: z.string().url().describe("The URL to analyze links on"),
      }),
      execute: async ({ url }: { url: string }) => callInternalTool("broken-links", { url }),
    } as any,

    canonical_conflicts: {
      description: "Checks if a URL has conflicting canonical directives (headers vs meta tags).",
      parameters: z.object({
        url: z.string().url().describe("URL to check"),
      }),
      execute: async ({ url }: { url: string }) => callInternalTool("canonical-conflicts", { url }),
    } as any,

    crawl_budget: {
      description: "Analyzes the crawl budget for a domain, predicting how Google treats it based on robots.txt and sitemap size.",
      parameters: z.object({
        domain: z.string().describe("The domain root (e.g. example.com)"),
        sitemapUrl: z.string().url().optional().describe("Optional explicit sitemap URL"),
      }),
      execute: async (args: any) => callInternalTool("crawl-budget", args),
    } as any,

    cwv_compare: {
      description: "Directly compares the Core Web Vitals (CWV) of two distinct URLs out of 100.",
      parameters: z.object({
        urlA: z.string().url().describe("First URL"),
        urlB: z.string().url().describe("Second URL"),
      }),
      execute: async (args: any) => callInternalTool("cwv-compare", args),
    } as any,

    headings: {
      description: "Extracts all H1-H6 tags from a URL to check structural outline and heading hierarchy.",
      parameters: z.object({
        url: z.string().url(),
      }),
      execute: async ({ url }: { url: string }) => callInternalTool("headings", { url }),
    } as any,

    http_headers: {
      description: "Fetches and analyzes critical HTTP security/SEO headers (like strict-transport-security, x-robots-tag).",
      parameters: z.object({
        url: z.string().url(),
      }),
      execute: async ({ url }: { url: string }) => callInternalTool("http-headers", { url }),
    } as any,

    meta_tags: {
      description: "Retrieves title, description, keywords, and opengraph meta tags from a URL.",
      parameters: z.object({
        url: z.string().url(),
      }),
      execute: async ({ url }: { url: string }) => callInternalTool("meta-tags", { url }),
    } as any,

    redirect_chain: {
      description: "Tracks a URL through all 301/302 redirect hops until it reaches the final destination limit.",
      parameters: z.object({
        url: z.string().url(),
      }),
      execute: async ({ url }: { url: string }) => callInternalTool("redirect", { url }),
    } as any,

    robots_txt: {
      description: "Parses the robots.txt file for a domain to determine blocked paths and crawl delays.",
      parameters: z.object({
        domain: z.string().describe("Bare domain like example.com"),
      }),
      execute: async ({ domain }: { domain: string }) => callInternalTool("robots-txt", { domain }),
    } as any,

    schema_coverage: {
      description: "Extracts and parses all JSON-LD structured data on a page.",
      parameters: z.object({
        url: z.string().url(),
      }),
      execute: async ({ url }: { url: string }) => callInternalTool("schema-coverage", { url }),
    } as any,

    serp_snippet: {
      description: "Generates a simulated Google Search Engine Results Page (SERP) snippet for a URL.",
      parameters: z.object({
        url: z.string().url(),
      }),
      execute: async ({ url }: { url: string }) => callInternalTool("serp-snippet", { url }),
    } as any,

    sitemap: {
      description: "Checks if a sitemap exists and validates its XML structure for a given URL.",
      parameters: z.object({
        url: z.string().url(),
      }),
      execute: async ({ url }: { url: string }) => callInternalTool("sitemap", { url }),
    } as any,

    thin_content: {
      description: "Measures content length, code-to-text ratio, and flesch reading score to detect low quality thin content.",
      parameters: z.object({
        url: z.string().url(),
      }),
      execute: async ({ url }: { url: string }) => callInternalTool("thin-content", { url }),
    } as any,

    third_party_scripts: {
      description: "Scans for 3rd-party embedded scripts (ads, analytics) that slow down page loads.",
      parameters: z.object({
        url: z.string().url(),
      }),
      execute: async ({ url }: { url: string }) => callInternalTool("third-party-scripts", { url }),
    } as any,

    ttfb_checker: {
      description: "Pings a URL to measure Server Response Time (Time To First Byte).",
      parameters: z.object({
        url: z.string().url(),
      }),
      execute: async ({ url }: { url: string }) => callInternalTool("ttfb-checker", { url }),
    } as any,

    js_seo_diff: {
      description: "Compares the raw HTML output vs the Client-Rendered JS HTML to detect differences (crucial for JS SEO testing).",
      parameters: z.object({
        url: z.string().url(),
      }),
      execute: async ({ url }: { url: string }) => callInternalTool("js-seo-diff", { url }),
    } as any,
  };
}
