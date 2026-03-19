import { Metadata } from "next";
import SEOAuditClient from "./client";

export const metadata: Metadata = {
    title: "Unified Technical SEO Audit | Free SEO Tools",
    description: "Run a massive fan-out SEO Audit to analyze Lighthouse, Schema, Meta Tags, Robots.txt, and Performance concurrently. Generate beautifully formatted PDF reports.",
};

export default function SEOAuditPage() {
    return <SEOAuditClient />;
}
