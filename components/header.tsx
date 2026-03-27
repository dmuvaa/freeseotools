"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Menu, X, Moon, Sun, Search as SearchIcon, Sparkles } from "lucide-react"

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-lg">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                    <div className="size-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center">
                        <SearchIcon className="size-5" />
                    </div>
                    <span>Free SEO Tools</span>
                </Link>

                <nav className="hidden md:flex gap-8 items-center">
                    <Link href="/chat" className="text-sm font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-hover)] flex items-center gap-1.5">
                        <Sparkles className="size-4" />
                        AI Agent
                    </Link>
                    <Link href="/" className="text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]">
                        All Tools
                    </Link>
                    <Link href="/about" className="text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]">
                        About
                    </Link>
                    <button
                        onClick={toggleTheme}
                        className="size-9 rounded-full flex items-center justify-center hover:bg-[var(--surface-2)] transition-colors ml-4"
                    >
                        {mounted && theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-5 py-2 text-sm font-medium transition-colors"
                    >
                        Start Using Tools
                    </Link>
                </nav>

                <div className="flex items-center gap-3 md:hidden">
                    <button
                        onClick={toggleTheme}
                        className="size-9 rounded-full flex items-center justify-center hover:bg-[var(--surface-2)] transition-colors"
                    >
                        {mounted && theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="size-9 rounded-full flex items-center justify-center hover:bg-[var(--surface-2)] transition-colors"
                    >
                        {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-b border-[var(--border)] bg-[var(--background)]">
                    <div className="container mx-auto py-4 flex flex-col gap-4 px-4">
                        <Link href="/chat" className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                            <Sparkles className="size-4" />
                            AI Agent
                        </Link>
                        <Link href="/" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)]" onClick={() => setMobileMenuOpen(false)}>
                            All Tools
                        </Link>
                        <Link href="/about" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)]" onClick={() => setMobileMenuOpen(false)}>
                            About
                        </Link>
                        <div className="flex flex-col gap-2 pt-4 border-t border-[var(--border)]">
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] text-white px-4 py-3 text-sm font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Start Using Tools
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
