import { Metadata } from "next";
import ThirdPartyScriptsClient from "./client";

export const metadata: Metadata = {
    title: "Third-Party Script Impact Checker | External Scripts SEO Analyzer",
    description: "Free Third-Party Script Checker: Detect all external scripts loaded by any page. Categorize Analytics, Ads, Social, CDN, and Font resources with total weight and performance impact.",
};

export default function ThirdPartyScriptsPage() {
    return <ThirdPartyScriptsClient />;
}
