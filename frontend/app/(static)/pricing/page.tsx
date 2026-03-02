"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ArrowRight, ChevronRight } from "lucide-react"

export default function PricingPage() {
    const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly")
    const [openFaq, setOpenFaq] = useState<number | null>(null)

    const plans = {
        monthly: [
            {
                name: "Free",
                price: "$0",
                description: "Get started with basic AI visibility audits.",
                features: [
                    "1 project",
                    "10 audits/month",
                    "5 AI models",
                    "Basic Blitz Score",
                    "Email support",
                ],
                cta: "Get Started",
            },
            {
                name: "Pro",
                price: "$49",
                description: "For professionals who need more audits and insights.",
                features: [
                    "5 projects",
                    "100 audits/month",
                    "5 AI models",
                    "Full Blitz Score",
                    "Index Graph",
                    "Citation tracking",
                    "Priority support",
                ],
                cta: "Start Free Trial",
                popular: true,
            },
            {
                name: "Team",
                price: "$149",
                description: "For teams managing multiple brands.",
                features: [
                    "Unlimited projects",
                    "500 audits/month",
                    "5 AI models",
                    "Full Blitz Score",
                    "Index Graph",
                    "Citation tracking",
                    "Team collaboration",
                    "Dedicated support",
                ],
                cta: "Start Free Trial",
            },
        ],
        annually: [
            {
                name: "Free",
                price: "$0",
                description: "Get started with basic AI visibility audits.",
                features: [
                    "1 project",
                    "10 audits/month",
                    "5 AI models",
                    "Basic Blitz Score",
                    "Email support",
                ],
                cta: "Get Started",
            },
            {
                name: "Pro",
                price: "$39",
                description: "For professionals who need more audits and insights.",
                features: [
                    "5 projects",
                    "100 audits/month",
                    "5 AI models",
                    "Full Blitz Score",
                    "Index Graph",
                    "Citation tracking",
                    "Priority support",
                ],
                cta: "Start Free Trial",
                popular: true,
            },
            {
                name: "Team",
                price: "$119",
                description: "For teams managing multiple brands.",
                features: [
                    "Unlimited projects",
                    "500 audits/month",
                    "5 AI models",
                    "Full Blitz Score",
                    "Index Graph",
                    "Citation tracking",
                    "Team collaboration",
                    "Dedicated support",
                ],
                cta: "Start Free Trial",
            },
        ],
    }

    const faqs = [
        {
            question: "How does the free plan work?",
            answer: "The free plan gives you 10 audits per month across 5 AI models. No credit card required to sign up.",
        },
        {
            question: "What AI models do you support?",
            answer: "We currently support GPT-5, Gemini 2.5 Pro, Claude Opus, Perplexity, and DeepSeek.",
        },
        {
            question: "Can I change plans later?",
            answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
        },
        {
            question: "What counts as an audit?",
            answer: "An audit is a single query sent to all selected AI models for one project. Running an audit that queries 5 models counts as 1 audit.",
        },
        {
            question: "Is my data secure?",
            answer: "Yes. All data is encrypted in transit and at rest. We never share your data with third parties.",
        },
    ]

    return (
        <main>
            {/* Hero */}
            <section className="py-20 md:py-32">
                <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
                    <span className="inline-flex items-center rounded-full bg-[var(--primary-muted)] px-4 py-1.5 text-sm font-medium text-[var(--primary)] mb-4">
                        Pricing
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-lg md:text-xl text-[var(--text-muted)]">
                        Start free, upgrade when you need more.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="pb-20">
                <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                    {/* Toggle */}
                    <div className="flex justify-center mb-12">
                        <div className="inline-flex items-center rounded-full bg-[var(--surface-2)] p-1">
                            <button
                                onClick={() => setBillingPeriod("monthly")}
                                className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${billingPeriod === "monthly"
                                        ? "bg-[var(--primary)] text-white"
                                        : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingPeriod("annually")}
                                className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${billingPeriod === "annually"
                                        ? "bg-[var(--primary)] text-white"
                                        : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
                                    }`}
                            >
                                Annually (Save 20%)
                            </button>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {plans[billingPeriod].map((plan, i) => (
                            <div
                                key={i}
                                className={`relative rounded-xl p-6 flex flex-col ${plan.popular
                                        ? "border-2 border-[var(--primary)] shadow-lg"
                                        : "border border-[var(--border)]"
                                    } bg-[var(--surface-1)]`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 bg-[var(--primary)] text-white px-3 py-1 text-xs font-medium rounded-bl-lg rounded-tr-xl">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold">{plan.name}</h3>
                                <div className="flex items-baseline mt-4">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    {plan.price !== "$0" && <span className="text-[var(--text-muted)] ml-1">/month</span>}
                                </div>
                                <p className="text-[var(--text-muted)] mt-2">{plan.description}</p>
                                <ul className="space-y-3 my-6 flex-grow">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className="flex items-center">
                                            <Check className="mr-2 size-4 text-[var(--success)]" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/dashboard"
                                    className={`w-full rounded-full py-3 text-center font-medium transition-colors ${plan.popular
                                            ? "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
                                            : "bg-[var(--surface-3)] hover:bg-[var(--surface-3)]/80 text-[var(--foreground)]"
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-[var(--surface-1)]">
                <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--background)]">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-[var(--surface-1)] transition-colors"
                                >
                                    {faq.question}
                                    <ChevronRight
                                        className={`size-5 text-[var(--text-muted)] transition-transform ${openFaq === i ? "rotate-90" : ""
                                            }`}
                                    />
                                </button>
                                {openFaq === i && (
                                    <div className="px-4 pb-4 text-[var(--text-muted)]">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/80 text-white">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Get Started?
                    </h2>
                    <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                        Start with a free account. No credit card required.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center rounded-full bg-white text-[var(--primary)] hover:bg-white/90 h-12 px-8 text-base font-medium"
                    >
                        Get Started Free
                        <ArrowRight className="ml-2 size-4" />
                    </Link>
                </div>
            </section>
        </main>
    )
}
