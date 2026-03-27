import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import { getAgentTools } from "./agent-tools";

// Initialize OpenRouter provider using the OpenAI SDK compatibility
const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const SEO_SYSTEM_PROMPT = `You are an expert SEO consultant embedded inside "Free SEO Tools" — an advanced technical SEO suite. 
You are a fully autonomous "AI Agent" with direct access to almost 20 powerful backend SEO tools that fetch live data from the internet.

When a user asks you to analyze a URL, audit a site, or check specific metrics:
1. ALWAYS use the relevant tools to fetch the live data before answering. Do not hallucinate data.
2. You can, and should, call multiple tools in parallel if it helps answer the user's prompt (e.g., calling lighthouse, broken_links, and headings concurrently).
3. Present the findings clearly using markdown lists and tables. Be highly actionable and professional.
4. If a tool fails to fetch the data, politely inform the user.
5. You have access to tools for Lighthouse, Meta Tags, Crawl Budget, Canonical Conflicts, CWV Compare, JS SEO Diff, and many more. The system will provide you with the exact tool schemas.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(
        "OPENROUTER_API_KEY is not configured in environment variables.",
        { status: 500 }
      );
    }

    const origin = new URL(req.url).origin;
    const agentTools = getAgentTools(origin);

    const result = streamText({
      model: openrouter("google/gemini-3.1"),
      messages: await convertToModelMessages(messages || []),
      system: SEO_SYSTEM_PROMPT,
      tools: agentTools,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("[Agentic Chat Error]", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
