"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export function GlobalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Do not show universal header/footer on dashboard pages
    const isDashboard = pathname?.startsWith("/dashboard");

    return (
        <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
            {!isDashboard && <Header />}
            <main className="flex-1">{children}</main>
            {!isDashboard && <Footer />}
        </div>
    );
}
