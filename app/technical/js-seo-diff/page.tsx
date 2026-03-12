import { Metadata } from "next";
import JsSEODiffClient from "./client";

export const metadata: Metadata = {
    title: "JavaScript SEO Diff Tool | Raw HTML vs Rendered DOM",
    description: "Free JS SEO Diff Tool: Compare raw HTML (what Googlebot sees) vs the fully rendered DOM. Find content and links that only exist after JavaScript runs — the #1 cause of indexing failures on React and Next.js sites.",
};

export default function JsSEODiffPage() {
    return <JsSEODiffClient />;
}
