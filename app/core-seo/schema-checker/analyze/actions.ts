"use server";

export interface SchemaCoverageState {
    url?: string;
    success?: boolean;
    error?: string;
    data?: {
        pagesCrawled: number;
        pagesWithSchema: number;
        pagesWithoutSchema: number;
        pagesWithErrors: number;
        schemaTypeDistribution: Record<string, number>;
        pages: Array<{
            url: string;
            schemaTypes: string[];
            jsonLd: string[];
            errors: string[];
            warnings?: string[];
            hasSchema: boolean;
        }>;
    };
}

import { performSchemaAnalysis } from "@/app/api/tools/schema-coverage/route";

export async function analyzeSchemaCoverage(
    prevState: SchemaCoverageState,
    formData: FormData
): Promise<SchemaCoverageState> {
    let url = formData.get("url") as string;
    const mode = formData.get("mode") as string || "single";

    if (!url) {
        return { error: "Please enter a URL" };
    }

    url = url.trim();
    if (!url.startsWith("http")) {
        url = "https://" + url;
    }

    const maxPages = mode === "site" ? 50 : 1;

    try {
        const data = await performSchemaAnalysis(url, maxPages);
        return {
            url,
            success: true,
            data
        };
    } catch (err) {
        console.error("Schema Coverage Analysis Error:", err);
        return { error: "Analysis failed. Please try again later." };
    }
}
