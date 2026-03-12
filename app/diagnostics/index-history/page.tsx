import { Metadata } from "next";
import IndexHistoryClient from "./client";

export const metadata: Metadata = {
    title: "Index Status History Checker | Track Indexability Over Time",
    description: "Free Index Status History Checker: Track any page's indexability status over time. Snapshots are saved in your browser and compared automatically to show when status changes occur.",
};

export default function IndexHistoryPage() {
    return <IndexHistoryClient />;
}
