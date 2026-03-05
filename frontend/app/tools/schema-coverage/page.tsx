import { Metadata } from "next";
import SchemaCoverageClient from "./client";

export const metadata: Metadata = {
    title: "Structured Data Coverage Scanner | Site-Level Schema Audit",
    description: "Free Schema Coverage Scanner: Crawl 50 pages and audit structured data implementation. See which pages have JSON-LD schema, which are missing it, and catch parse errors.",
};

export default function SchemaCoveragePage() {
    return <SchemaCoverageClient />;
}
