import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

interface TreeNode {
    url: string;
    depth: number;
    children: TreeNode[];
    parent: string | null;
}

async function fetchLinks(url: string, domain: string): Promise<string[]> {
    try {
        const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; BlitzGeo/1.0)" },
            signal: AbortSignal.timeout(8000),
            redirect: "follow",
        });
        const html = await res.text();
        const $ = cheerio.load(html);
        const links: string[] = [];
        $("a[href]").each((_, el) => {
            try {
                const href = new URL($(el).attr("href")!, url).href.split("?")[0].split("#")[0];
                const hDomain = new URL(href).hostname;
                if (hDomain === domain && href !== url) links.push(href);
            } catch { }
        });
        return [...new Set(links)];
    } catch { return []; }
}

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        let startUrl = url.trim();
        if (!startUrl.startsWith("http")) startUrl = "https://" + startUrl;
        const domain = new URL(startUrl).hostname;

        const visited = new Map<string, { depth: number; parent: string | null }>();
        visited.set(startUrl, { depth: 0, parent: null });
        const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];

        while (queue.length > 0 && visited.size < 50) {
            const { url: current, depth } = queue.shift()!;
            if (depth >= 5) continue; // max depth 5

            const links = await fetchLinks(current, domain);
            for (const link of links.slice(0, 15)) {
                if (!visited.has(link) && visited.size < 50) {
                    visited.set(link, { depth: depth + 1, parent: current });
                    queue.push({ url: link, depth: depth + 1 });
                }
            }
        }

        // Build tree structure
        const nodeMap = new Map<string, { url: string; depth: number; children: string[]; parent: string | null }>();
        visited.forEach(({ depth, parent }, nodeUrl) => {
            nodeMap.set(nodeUrl, { url: nodeUrl, depth, children: [], parent });
        });
        nodeMap.forEach((node, nodeUrl) => {
            if (node.parent && nodeMap.has(node.parent)) {
                nodeMap.get(node.parent)!.children.push(nodeUrl);
            }
        });

        // Depth distribution
        const depthCounts: Record<number, number> = {};
        visited.forEach(({ depth }) => {
            depthCounts[depth] = (depthCounts[depth] || 0) + 1;
        });

        const nodes = [...nodeMap.values()].map(n => ({
            url: n.url,
            depth: n.depth,
            parent: n.parent,
            childCount: n.children.length,
        }));

        return NextResponse.json({
            startUrl,
            totalPages: nodes.length,
            maxDepth: Math.max(...nodes.map(n => n.depth)),
            depthDistribution: depthCounts,
            nodes,
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Crawl failed" }, { status: 500 });
    }
}
