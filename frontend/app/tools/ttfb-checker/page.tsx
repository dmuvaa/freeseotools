import { Metadata } from "next";
import TTFBCheckerClient from "./client";

export const metadata: Metadata = {
    title: "TTFB Checker | Time to First Byte Tester",
    description: "Free TTFB Checker: Measure Time to First Byte across 3 runs. Detect CDN provider, cache status, and server software. TTFB is the first thing Google measures about your server.",
};

export default function TTFBCheckerPage() {
    return <TTFBCheckerClient />;
}
