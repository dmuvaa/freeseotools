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
            errors: string[];
            hasSchema: boolean;
        }>;
    };
}

export async function analyzeSchemaCoverage(
    prevState: SchemaCoverageState,
    formData: FormData
): Promise<SchemaCoverageState> {
    const url = formData.get("url") as string;

    if (!url) {
        return { error: "Please enter a URL" };
    }

    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/tools/schema-coverage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
        });

        const data = await res.json();
        if (!res.ok) {
            return { error: data.error || "Failed to analyze schema coverage" };
        }

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
