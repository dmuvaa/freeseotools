import { NextRequest, NextResponse } from "next/server";

function categorizeAnchor(text: string, keyword: string, brandTerms: string[]): string {
    const t = text.toLowerCase().trim();
    if (!t || t === "" || t === "click here" || t === "here" || t === "read more" || t === "learn more" || t === "visit" || t === "this" || t === "link") return "generic";
    if (t.startsWith("http://") || t.startsWith("https://") || t.startsWith("www.")) return "naked_url";
    if (brandTerms.some(b => t.includes(b.toLowerCase()))) return "branded";
    if (keyword && t === keyword.toLowerCase()) return "exact_match";
    if (keyword && keyword.split(" ").every(w => t.includes(w.toLowerCase()))) return "partial_match";
    return "generic";
}

export async function POST(req: NextRequest) {
    try {
        const { rawData, keyword = "", brand = "" } = await req.json();
        if (!rawData || typeof rawData !== "string") {
            return NextResponse.json({ error: "Paste your backlink + anchor text data" }, { status: 400 });
        }

        const brandTerms = brand ? brand.split(",").map((b: string) => b.trim()).filter(Boolean) : [];

        // Parse: each line = "url\tanchor" or "url,anchor" or "anchor" only
        const lines = rawData.split("\n").map(l => l.trim()).filter(Boolean);
        const anchors: Array<{ anchor: string; url?: string; category: string }> = [];

        for (const line of lines) {
            let url = "";
            let anchor = line;
            // Try tab-separated
            if (line.includes("\t")) {
                const parts = line.split("\t");
                url = parts[0]?.trim() || "";
                anchor = parts[1]?.trim() || parts[0]?.trim() || "";
            } else if (line.includes(",")) {
                // comma-separated but not if it looks like a full URL
                const commaIdx = line.indexOf(",");
                const first = line.slice(0, commaIdx).trim();
                const second = line.slice(commaIdx + 1).trim();
                if (first.startsWith("http")) { url = first; anchor = second; }
                else { anchor = first || second; }
            }
            if (!anchor) continue;
            const category = categorizeAnchor(anchor, keyword, brandTerms);
            anchors.push({ anchor, url: url || undefined, category });
        }

        if (anchors.length === 0) return NextResponse.json({ error: "No valid anchors found. Paste one anchor (or URL + anchor) per line." }, { status: 400 });

        const counts: Record<string, number> = {
            exact_match: 0, partial_match: 0, branded: 0, naked_url: 0, generic: 0,
        };
        for (const a of anchors) counts[a.category] = (counts[a.category] || 0) + 1;

        const total = anchors.length;
        const distribution = Object.entries(counts).map(([cat, count]) => ({
            category: cat.replace("_", " "),
            count,
            percent: +((count / total) * 100).toFixed(1),
        }));

        const exactPct = (counts.exact_match / total) * 100;
        const overOptimized = exactPct > 30;
        const warnings: string[] = [];
        if (overOptimized) warnings.push(`Exact-match anchors at ${exactPct.toFixed(1)}% — above 30% risks over-optimization penalties.`);
        if ((counts.generic / total) * 100 > 50) warnings.push("Over 50% generic anchors (click here, read more). Consider diversifying with partial-match and branded anchors.");
        if ((counts.branded / total) * 100 < 10 && total > 20) warnings.push("Low branded anchor percentage — building more branded links improves entity recognition.");

        return NextResponse.json({ total, distribution, anchors: anchors.slice(0, 100), warnings, overOptimized });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Analysis failed" }, { status: 500 });
    }
}
