import { Metadata } from "next";
import SerpSnippetClient from "./client";

export const metadata: Metadata = {
    title: "SERP Snippet Extractor | Google Title & Description Analyzer",
    description: "Free SERP Snippet Extractor: Extract title and meta description, estimate pixel-accurate truncation, detect rewrite risk, and preview your exact Google search snippet.",
};

export default function SerpSnippetPage() {
    return <SerpSnippetClient />;
}
