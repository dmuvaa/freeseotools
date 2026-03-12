import { Metadata } from "next";
import OrphanPagesClient from "./client";

export const metadata: Metadata = {
    title: "Orphan Page Finder | Sitemap vs Crawl Comparison",
    description: "Free Orphan Page Finder: Compare sitemap URLs against crawled internal links. Find pages that are in your sitemap but never linked to (orphans) and pages linked but missing from the sitemap.",
};

export default function OrphanPagesPage() {
    return <OrphanPagesClient />;
}
