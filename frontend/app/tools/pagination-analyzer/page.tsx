import { Metadata } from "next";
import PaginationAnalyzerClient from "./client";

export const metadata: Metadata = {
    title: "Pagination & Faceted Navigation Analyzer | SEO Crawl Risk Checker",
    description: "Free Pagination & Faceted Navigation Analyzer: Detect rel=prev/next, URL parameter explosion, faceted filter URLs, and infinite scroll — the top crawl budget killers on ecommerce sites.",
};

export default function PaginationAnalyzerPage() {
    return <PaginationAnalyzerClient />;
}
