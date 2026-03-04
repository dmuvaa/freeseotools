"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Check,
  ChevronRight,
  ArrowRight,
  Star,
  Zap,
  Shield,
  BarChart,
  Layers,
  Search,
  Globe,
} from "lucide-react"

export default function LandingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const features = [
    {
      title: "Multi-Model Audits",
      description: "Query GPT-5, Gemini, Claude, Perplexity, and DeepSeek simultaneously to see how each AI perceives your brand.",
      icon: <Layers className="size-5" />,
    },
    {
      title: "AI Index Graph",
      description: "Reverse-engineer the content surface AI models use when answering questions about your brand.",
      icon: <Search className="size-5" />,
    },
    {
      title: "Real-Time Monitoring",
      description: "Track brand visibility changes over time with automated recurring audits and alerts.",
      icon: <BarChart className="size-5" />,
    },
    {
      title: "Citation Extraction",
      description: "Identify which sources AI models cite when mentioning your brand, and uncover gaps.",
      icon: <Globe className="size-5" />,
    },
    {
      title: "Blitz Score",
      description: "Get a unified 0-100 score measuring your brand's overall AI visibility and sentiment.",
      icon: <Zap className="size-5" />,
    },
    {
      title: "Enterprise Security",
      description: "SOC 2 compliant infrastructure with end-to-end encryption for your audit data.",
      icon: <Shield className="size-5" />,
    },
  ]

  const testimonials = [
    {
      quote: "BlitzGeo showed us that our main competitor was being cited 3x more than us in AI responses. We fixed that in 2 months.",
      author: "Sarah Chen",
      role: "Head of SEO, TechScale",
      rating: 5,
    },
    {
      quote: "The Index Graph feature is a game-changer. We finally understand what content AI models are actually using.",
      author: "Marcus Johnson",
      role: "Brand Director, Innovate Labs",
      rating: 5,
    },
    {
      quote: "We run weekly audits now. Being able to see our Blitz Score improve over time is incredibly motivating for the team.",
      author: "Emily Rodriguez",
      role: "CMO, GrowthFirst",
      rating: 5,
    },
    {
      quote: "I used to spend hours manually checking AI responses. BlitzGeo does it in seconds across 5 models.",
      author: "David Kim",
      role: "SEO Consultant",
      rating: 5,
    },
    {
      quote: "The citation extraction alone is worth it. We discovered our Wikipedia page was our most influential asset.",
      author: "Lisa Patel",
      role: "Content Strategist, MediaPro",
      rating: 5,
    },
    {
      quote: "From skeptic to believer. AI visibility is the new SEO, and BlitzGeo is the tool to measure it.",
      author: "James Wilson",
      role: "VP Marketing, SaaS Corp",
      rating: 5,
    },
  ]

  const pricingPlans = {
    monthly: [
      {
        name: "Starter",
        price: "$49",
        description: "Perfect for solo practitioners and small brands.",
        features: ["3 projects", "50 audits/month", "5 AI models", "Basic analytics", "Email support"],
        cta: "Start Free Trial",
      },
      {
        name: "Professional",
        price: "$149",
        description: "Ideal for agencies and growing teams.",
        features: ["15 projects", "500 audits/month", "All AI models", "Index Graph", "Priority support", "API access"],
        cta: "Start Free Trial",
        popular: true,
      },
      {
        name: "Enterprise",
        price: "Custom",
        description: "For large organizations with complex needs.",
        features: ["Unlimited projects", "Unlimited audits", "Dedicated success manager", "Custom integrations", "SLA guarantee", "SSO & SAML"],
        cta: "Contact Sales",
      },
    ],
    annually: [
      {
        name: "Starter",
        price: "$39",
        description: "Perfect for solo practitioners and small brands.",
        features: ["3 projects", "50 audits/month", "5 AI models", "Basic analytics", "Email support"],
        cta: "Start Free Trial",
      },
      {
        name: "Professional",
        price: "$119",
        description: "Ideal for agencies and growing teams.",
        features: ["15 projects", "500 audits/month", "All AI models", "Index Graph", "Priority support", "API access"],
        cta: "Start Free Trial",
        popular: true,
      },
      {
        name: "Enterprise",
        price: "Custom",
        description: "For large organizations with complex needs.",
        features: ["Unlimited projects", "Unlimited audits", "Dedicated success manager", "Custom integrations", "SLA guarantee", "SSO & SAML"],
        cta: "Contact Sales",
      },
    ],
  }

  const faqs = [
    {
      question: "How does BlitzGeo work?",
      answer: "BlitzGeo sends natural language queries about your brand to multiple AI models (GPT-5, Gemini, Claude, etc.) and analyzes the responses. We extract mentions, sentiment, citations, and build a comprehensive picture of how AI 'sees' your brand.",
    },
    {
      question: "What AI models do you support?",
      answer: "We currently support GPT-5, Gemini 2.5 Pro, Claude Opus 4.5, Perplexity Sonar, and DeepSeek V3.2. We add new models as they become available through our OpenRouter integration.",
    },
    {
      question: "What is the Index Graph?",
      answer: "The Index Graph reverse-engineers which sources (websites, Wikipedia, news articles) AI models retrieve and rely on when answering questions about your brand. It reveals your 'retrievable content surface' — the information AI can actually access.",
    },
    {
      question: "How is the Blitz Score calculated?",
      answer: "The Blitz Score (0-100) combines mention rate, sentiment analysis, citation quality, and consistency across models. A score above 70 indicates strong AI visibility; below 40 suggests significant optimization opportunities.",
    },
    {
      question: "Can I schedule recurring audits?",
      answer: "Yes! Professional and Enterprise plans include scheduled audits (daily, weekly, or monthly) with automated reports and alerts when significant changes are detected.",
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use end-to-end encryption, never share your data with third parties, and are SOC 2 Type II compliant. Enterprise plans include additional security features like SSO and audit logs.",
    },
  ]

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 lg:py-40 overflow-hidden relative">
        {/* Grid background */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-[var(--background)] bg-[linear-gradient(to_right,var(--surface-2)_1px,transparent_1px),linear-gradient(to_bottom,var(--surface-2)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="container mx-auto px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <span className="mb-4 inline-flex items-center rounded-full bg-[var(--primary-muted)] px-4 py-1.5 text-sm font-medium text-[var(--primary)]">
              🚀 AI Visibility is the New SEO
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 mt-4 text-[var(--foreground)]">
              See How AI Sees
              <br />
              Your Brand
            </h1>
            <p className="text-lg md:text-xl text-[var(--text-muted)] mb-8 max-w-2xl mx-auto">
              Audit your brand across GPT-5, Gemini, Claude, and Perplexity in seconds.
              Discover what AI knows, what it's missing, and how to improve your visibility.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white h-12 px-8 text-base font-medium transition-colors"
              >
                Start Free Audit
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-1)] h-12 px-8 text-base font-medium transition-colors"
              >
                See How It Works
              </Link>
            </div>
            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-[var(--text-muted)]">
              <div className="flex items-center gap-1">
                <Check className="size-4 text-[var(--success)]" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="size-4 text-[var(--success)]" />
                <span>14-day trial</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="size-4 text-[var(--success)]" />
                <span>5 AI models</span>
              </div>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mx-auto max-w-4xl"
          >
            <div className="rounded-xl overflow-hidden shadow-2xl border border-[var(--border)]">
              <img
                src="/hero-dashboard.png"
                alt="BlitzGeo Dashboard showing Blitz Score and AI model coverage"
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="w-full py-12 border-y border-[var(--border)] bg-[var(--surface-1)]/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <p className="text-sm font-medium text-[var(--text-muted)]">Trusted by leading brands and agencies</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16 text-[var(--text-muted)]">
              {["TechScale", "GrowthFirst", "MediaPro", "Innovate Labs", "SaaS Corp"].map((company) => (
                <div key={company} className="text-lg font-semibold opacity-50 hover:opacity-80 transition-opacity">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
          >
            <span className="inline-flex items-center rounded-full bg-[var(--primary-muted)] px-4 py-1.5 text-sm font-medium text-[var(--primary)]">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything You Need for AI Visibility</h2>
            <p className="max-w-[800px] text-[var(--text-muted)] md:text-lg">
              Comprehensive tools to audit, analyze, and improve how AI models perceive and represent your brand.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature, i) => (
              <motion.div key={i} variants={item}>
                <div className="h-full overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-b from-[var(--surface-1)] to-[var(--surface-2)]/50 backdrop-blur transition-all hover:shadow-lg hover:border-[var(--border-hover)] p-6 flex flex-col">
                  <div className="size-10 rounded-full bg-[var(--primary-muted)] flex items-center justify-center text-[var(--primary)] mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-[var(--text-muted)]">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-20 md:py-32 bg-[var(--surface-1)]/30 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full bg-[var(--background)] bg-[linear-gradient(to_right,var(--surface-2)_1px,transparent_1px),linear-gradient(to_bottom,var(--surface-2)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]" />

        <div className="container mx-auto px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
          >
            <span className="inline-flex items-center rounded-full bg-[var(--primary-muted)] px-4 py-1.5 text-sm font-medium text-[var(--primary)]">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Three Steps to AI Visibility</h2>
            <p className="max-w-[800px] text-[var(--text-muted)] md:text-lg">
              Get insights in minutes, not hours. Our async architecture handles the complexity for you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent -translate-y-1/2 z-0" />

            {[
              { step: "01", title: "Create Project", description: "Add your brand name, aliases, and context. Takes less than 30 seconds." },
              { step: "02", title: "Run Audit", description: "We query 5+ AI models simultaneously and analyze their responses in real-time." },
              { step: "03", title: "Get Insights", description: "View your Blitz Score, citations, Index Graph, and actionable recommendations." },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative z-10 flex flex-col items-center text-center space-y-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white text-xl font-bold shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-[var(--text-muted)]">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="w-full py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
          >
            <span className="inline-flex items-center rounded-full bg-[var(--primary-muted)] px-4 py-1.5 text-sm font-medium text-[var(--primary)]">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Loved by SEO & Brand Professionals</h2>
            <p className="max-w-[800px] text-[var(--text-muted)] md:text-lg">
              See what our customers have to say about their experience with BlitzGeo.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <div className="h-full overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-b from-[var(--surface-1)] to-[var(--surface-2)]/50 backdrop-blur transition-all hover:shadow-md p-6 flex flex-col">
                  <div className="flex mb-4">
                    {Array(testimonial.rating).fill(0).map((_, j) => (
                      <Star key={j} className="size-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-base mb-6 flex-grow">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex items-center gap-4 mt-auto pt-4 border-t border-[var(--border)]">
                    <div className="size-10 rounded-full bg-[var(--surface-3)] flex items-center justify-center font-medium">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-[var(--text-muted)]">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-20 md:py-32 bg-[var(--surface-1)]/30 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full bg-[var(--background)] bg-[linear-gradient(to_right,var(--surface-2)_1px,transparent_1px),linear-gradient(to_bottom,var(--surface-2)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]" />

        <div className="container mx-auto px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
          >
            <span className="inline-flex items-center rounded-full bg-[var(--primary-muted)] px-4 py-1.5 text-sm font-medium text-[var(--primary)]">
              Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
            <p className="max-w-[800px] text-[var(--text-muted)] md:text-lg">
              Choose the plan that's right for your needs. All plans include a 14-day free trial.
            </p>
          </motion.div>

          <div className="mx-auto max-w-5xl">
            {/* Toggle */}
            <div className="flex justify-center mb-8">
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

            <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
              {pricingPlans[billingPeriod].map((plan, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div
                    className={`relative overflow-hidden h-full rounded-xl ${plan.popular
                      ? "border-2 border-[var(--primary)] shadow-lg shadow-[var(--primary)]/10"
                      : "border border-[var(--border)]"
                      } bg-gradient-to-b from-[var(--surface-1)] to-[var(--surface-2)]/50 backdrop-blur p-6 flex flex-col`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-[var(--primary)] text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                        Most Popular
                      </div>
                    )}
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <div className="flex items-baseline mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.price !== "Custom" && <span className="text-[var(--text-muted)] ml-1">/month</span>}
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
                      className={`w-full mt-auto rounded-full py-3 text-center font-medium transition-colors ${plan.popular
                        ? "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
                        : "bg-[var(--surface-3)] hover:bg-[var(--surface-3)]/80 text-[var(--foreground)]"
                        }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="w-full py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
          >
            <span className="inline-flex items-center rounded-full bg-[var(--primary-muted)] px-4 py-1.5 text-sm font-medium text-[var(--primary)]">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <p className="max-w-[800px] text-[var(--text-muted)] md:text-lg">
              Find answers to common questions about BlitzGeo.
            </p>
          </motion.div>

          <div className="mx-auto max-w-3xl">
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <div className="border border-[var(--border)] rounded-xl overflow-hidden">
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
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 md:py-32 bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/80 text-white relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center space-y-6 text-center"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Ready to See How AI Sees Your Brand?
            </h2>
            <p className="mx-auto max-w-[700px] text-white/80 md:text-xl">
              Join hundreds of brands already optimizing their AI visibility. Start your free audit today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-white text-[var(--primary)] hover:bg-white/90 h-12 px-8 text-base font-medium transition-colors"
              >
                Start Free Audit
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-white/30 hover:bg-white/10 h-12 px-8 text-base font-medium transition-colors"
              >
                Learn More
              </Link>
            </div>
            <p className="text-sm text-white/60 mt-4">
              No credit card required. 14-day free trial. Cancel anytime.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
