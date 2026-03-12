import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Crawler } from "@/lib/analysis/crawler";
import { LinkExtractor } from "@/lib/analysis/link-extractor";
import { AIInterpreter } from "@/lib/analysis/ai-interpreter";
import { StructureAnalyzer } from "@/lib/analysis/structure-analyzer";
import { AnalysisResponse } from "@/lib/analysis/types";

// Schema for validation
const analyzeSchema = z.object({
    url: z.string().url(),
    enableCrawl: z.boolean().optional().default(false),
    enableLLM: z.boolean().optional().default(false),
});

export const maxDuration = 60; // Allow 60s for analysis

// Simple In-Memory Rate Limit
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = rateLimit.get(ip);

    if (!record || now > record.resetTime) {
        rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return false;
    }

    if (record.count >= RATE_LIMIT_MAX) {
        return true;
    }

    record.count++;
    return false;
}

export async function POST(request: NextRequest) {
    let crawler: Crawler | null = null;

    try {
        // 1. Rate Limiting
        const forwardedFor = request.headers.get("x-forwarded-for");
        const ip = forwardedFor ? forwardedFor.split(',')[0] : "unknown";

        if (isRateLimited(ip)) {
            return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
        }

        const body = await request.json();
        const validation = analyzeSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: "Invalid Input", details: validation.error.format() }, { status: 400 });
        }

        const { url, enableCrawl, enableLLM } = validation.data;

        // 2. Initialize Tools
        crawler = new Crawler();
        await crawler.init(); // Initialize browser
        const linkExtractor = new LinkExtractor();
        const aiInterpreter = new AIInterpreter();
        const structureAnalyzer = new StructureAnalyzer();

        // 3. Fetch Pages (Simulate JS vs No-JS)
        const [jsResult, noJsResult] = await Promise.all([
            crawler.fetchPage(url, true),
            crawler.fetchPage(url, false), // Simulate No-JS
        ]);

        // 4. Analyze Links
        const linkAnalysis = linkExtractor.analyze(
            jsResult.html,
            noJsResult.html,
            url
        );

        // 4.5 Analyze Structure (NEW)
        const structureMetrics = structureAnalyzer.analyze(
            linkAnalysis.nodes,
            linkAnalysis.edges,
            linkAnalysis.metrics
        );

        // 5. AI/SEO Interpretation (Heuristic for now)
        // We use the JS-enabled HTML as it represents the "user" view best
        const aiAnalysis = aiInterpreter.analyze(jsResult.html);

        // 6. Construct Response
        const responseData: AnalysisResponse = {
            internal_link_analysis: {
                ...linkAnalysis,
                structure: structureMetrics
            },
            ai_interpretation: aiAnalysis,
        };

        return NextResponse.json(responseData);

    } catch (error) {
        console.error("Analysis API Error:", error);
        return NextResponse.json({ error: "Analysis Failed", details: String(error) }, { status: 500 });
    } finally {
        if (crawler) {
            await crawler.close();
        }
    }
}
