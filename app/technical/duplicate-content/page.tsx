import { Metadata } from "next";
import DuplicateContentClient from "./client";

export const metadata: Metadata = {
    title: "Duplicate Content Cluster Finder | Content Similarity Checker",
    description: "Free Duplicate Content Finder: Crawl a domain and find near-identical content clusters using Jaccard similarity analysis. Also detects duplicate title tags and meta descriptions.",
};

export default function DuplicateContentPage() {
    return <DuplicateContentClient />;
}
