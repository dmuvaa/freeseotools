import { Metadata } from "next";
import CanonicalConflictsClient from "./client";

export const metadata: Metadata = {
    title: "Canonical Conflict Detector | Site-Level Canonical Issues",
    description: "Free Canonical Conflict Detector: Crawl 50 pages and detect multiple canonical tags, canonical loops, canonicals pointing to non-200 pages, and homepage misuse.",
};

export default function CanonicalConflictsPage() {
    return <CanonicalConflictsClient />;
}
