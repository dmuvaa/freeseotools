"use server";

export interface JsRenderingState {
    url?: string;
    success?: boolean;
    error?: string;
    data?: {
        raw: {
            wordCount: number;
            linkCount: number;
            html?: string;
            seo: {
                title: string;
                description: string;
                robots: string;
                canonical: string;
                h1Count: number;
            };
        };
        rendered: {
            wordCount: number;
            linkCount: number;
            html?: string;
            seo: {
                title: string;
                description: string;
                robots: string;
                canonical: string;
                h1Count: number;
            };
        };
        diff: {
            wordCountDiff: number;
            linkCountDiff: number;
            jsOnlyLinks: string[];
            jsOnlyContent: string[];
            similarity: number;
            seoDiff: {
                titleMatch: boolean;
                descriptionMatch: boolean;
                robotsMatch: boolean;
                canonicalMatch: boolean;
                h1Match: boolean;
            };
        };
    };
}

import { performJsRenderingAnalysis } from "@/app/api/tools/js-seo-diff/route";

export async function analyzeJavascriptUrl(
    prevState: JsRenderingState,
    formData: FormData
): Promise<JsRenderingState> {
    let url = formData.get("url") as string;

    if (!url) {
        return { error: "Please enter a URL" };
    }

    url = url.trim();
    if (!url.startsWith("http")) {
        url = "https://" + url;
    }

    try {
        const data = await performJsRenderingAnalysis(url);
        return {
            url,
            success: true,
            data
        };
    } catch (err) {
        console.error("JS Rendering Analysis Error:", err);
        return { error: "Analysis failed. Please try again later." };
    }
}
