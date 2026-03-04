"use server";

import { fetchAndExtract } from "@/lib/schema/extractor";
import { analyzeSchemas } from "@/lib/schema/analyzer";
import { AnalysisResult } from "@/lib/schema/types";

export interface AnalyzeFormState {
    result?: AnalysisResult;
    error?: string;
    rawSchemas?: string[];
    htmlContent?: string;
    url?: string;
}

export async function analyzeUrl(
    prevState: AnalyzeFormState,
    formData: FormData
): Promise<AnalyzeFormState> {
    let url = formData.get("url") as string;

    if (!url) {
        return { error: "Please enter a URL" };
    }

    url = url.trim();

    // Normalize URL: input "example.com" -> try "https://example.com", then "http://example.com"
    let targetUrl = url;
    let fallbackUrl: string | null = null;

    if (!targetUrl.match(/^https?:\/\//i)) {
        targetUrl = `https://${url}`;
        fallbackUrl = `http://${url}`;
    }

    // Validate URL format
    try {
        new URL(targetUrl);
    } catch {
        return { error: "Please enter a valid URL (e.g., example.com)" };
    }

    // Fetch and extract schemas
    let { html, schemas, error } = await fetchAndExtract(targetUrl);

    // If HTTPS failed and we have a fallback (HTTP), try that
    if (error && fallbackUrl) {
        const fallbackResult = await fetchAndExtract(fallbackUrl);
        if (!fallbackResult.error) {
            html = fallbackResult.html;
            schemas = fallbackResult.schemas;
            error = undefined;
            targetUrl = fallbackUrl;
        }
    }

    if (error) {
        return { error };
    }

    if (schemas.jsonLd.length === 0 && schemas.microdata.length === 0) {
        return {
            error: "No schema markup found on this page",
            rawSchemas: [],
            htmlContent: html,
            url: targetUrl,
        };
    }

    // Analyze the schemas
    const result = analyzeSchemas(schemas.jsonLd, targetUrl);

    return {
        result,
        rawSchemas: schemas.raw,
        htmlContent: html,
        url: targetUrl,
    };
}
