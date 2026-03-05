import { Metadata } from "next";
import JsBundleAnalyzerClient from "./client";

export const metadata: Metadata = {
    title: "JavaScript Bundle Analyzer | JS Performance SEO Tool",
    description: "Free JavaScript Bundle Analyzer: Load any page and intercept every JS file. See total JS size, render-blocking scripts, and first vs third-party script breakdown.",
};

export default function JsBundleAnalyzerPage() {
    return <JsBundleAnalyzerClient />;
}
