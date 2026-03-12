import { Metadata } from "next";
import SEOAuditClient from "./client";

export const metadata: Metadata = {
    title: "Free Comprehensive SEO Audit | Full-Page SEO Checker",
    description: "Free Comprehensive SEO Audit: Instantly check any URL across 9 categories — security, technical SEO, on-page, structured data, social, performance, mobile, accessibility, and content. Get a scored report with prioritized recommendations.",
};

export default function SEOAuditPage() {
    return <SEOAuditClient />;
}
