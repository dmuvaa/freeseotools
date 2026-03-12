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
        };
        rendered: {
            wordCount: number;
            linkCount: number;
            html?: string;
        };
        diff: {
            wordCountDiff: number;
            linkCountDiff: number;
            jsOnlyLinks: string[];
            jsOnlyContent: string[];
            similarity: number;
        };
    };
}

export async function analyzeJavascriptUrl(
    prevState: JsRenderingState,
    formData: FormData
): Promise<JsRenderingState> {
    const url = formData.get("url") as string;

    if (!url) {
        return { error: "Please enter a URL" };
    }

    try {
        // We use the internal API for the heavy lifting
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/tools/js-seo-diff`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
        });

        const data = await res.json();
        if (!res.ok) {
            return { error: data.error || "Failed to analyze JS rendering" };
        }

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
