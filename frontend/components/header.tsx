"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { ChevronRight, Menu, X, Moon, Sun } from "lucide-react"

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
                    <div className="size-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold">
                        B
                    </div>
                    <span>BlitzGeo</span>
                </Link>
                <nav className="hidden md:flex gap-8">
                    <Link href="/features" className="text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]">
                        Features
                    </Link>
                    <Link href="/pricing" className="text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]">
                        Pricing
                    </Link>
                    <Link href="/about" className="text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]">
                        About
                    </Link>
                    <Link href="/blog" className="text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]">
                        Blog
                    </Link>
                    <Link href="/docs" className="text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]">
                        Docs
                    </Link>
                    <Link href="/schema-checker" className="text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]">
                        Schema Checker
                    </Link>
                    <Link href="/javascript-rendering-checker" className="text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]">
                        JS Rendering Checker
                    </Link>
                </nav>
                <div className="hidden md:flex gap-4 items-center">
                    <button
                        onClick={toggleTheme}
                        className="size-9 rounded-full flex items-center justify-center hover:bg-[var(--surface-2)] transition-colors"
                    >
                        {mounted && theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
                    </button>
                    <Link href="/dashboard" className="text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]">
                        Log in
                    </Link>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 text-sm font-medium transition-colors"
                    >
                        Get Started
                        <ChevronRight className="ml-1 size-4" />
                    </Link>
                </div>
                <div className="flex items-center gap-4 md:hidden">
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
                        <Link href="/features" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)]" onClick={() => setMobileMenuOpen(false)}>
                            Features
                        </Link>
                        <Link href="/pricing" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)]" onClick={() => setMobileMenuOpen(false)}>
                            Pricing
                        </Link>
                        <Link href="/about" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)]" onClick={() => setMobileMenuOpen(false)}>
                            About
                        </Link>
                        <Link href="/blog" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)]" onClick={() => setMobileMenuOpen(false)}>
                            Blog
                        </Link>
                        <Link href="/docs" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)]" onClick={() => setMobileMenuOpen(false)}>
                            Docs
                        </Link>
                        <Link href="/schema-checker" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)]" onClick={() => setMobileMenuOpen(false)}>
                            Schema Checker
                        </Link>
                        <Link href="/javascript-rendering-checker" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)]" onClick={() => setMobileMenuOpen(false)}>
                            JS Rendering Checker
                        </Link>
                        <div className="flex flex-col gap-2 pt-4 border-t border-[var(--border)]">
                            <Link href="/dashboard" className="text-sm font-medium text-[var(--text-muted)]" onClick={() => setMobileMenuOpen(false)}>
                                Log in
                            </Link>
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] text-white px-4 py-2 text-sm font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
