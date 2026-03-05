import { Metadata } from "next";
import CrawlPathClient from "./client";

export const metadata: Metadata = {
    title: "Crawl Path Visualizer | Site Structure & Click Depth Tool",
    description: "Free Crawl Path Visualizer: Crawl up to 50 pages and visualize the link tree. Identify pages buried too deep, analyze click depth distribution, and optimize site structure for Googlebot.",
};

export default function CrawlPathPage() {
    return <CrawlPathClient />;
}
