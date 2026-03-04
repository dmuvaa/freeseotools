import Link from "next/link";
import Card from "@/components/ui/Card";
import ScoreRing from "@/components/ui/ScoreRing";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="section relative overflow-hidden">
        {/* Background Glow Effect */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-accent-blue/10 blur-3xl" />
        </div>

        <div className="container-wide">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-accent-green animate-pulse" />
              <span className="text-sm text-foreground-muted">
                JavaScript Rendering Intelligence
              </span>
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Your site looks great to users —{" "}
              <span className="gradient-text">but what does Googlebot see?</span>
            </h1>

            <p className="mb-8 text-lg text-foreground-muted md:text-xl">
              Client-side rendering can kill your SEO. We analyze your JavaScript
              execution, hydration timing, and exactly what search engines index.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/javascript-rendering-checker/analyze" className="btn btn-primary btn-lg">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Analyze Your URL
              </Link>
              <Link href="/how-it-works" className="btn btn-secondary btn-lg">
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Framing Section */}
      <section className="section-sm bg-surface-1 border-y border-border">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">
              Why isn&apos;t your JS-heavy site ranking?
            </h2>
            <p className="mb-12 text-foreground-muted">
              Your Lighthouse score is perfect, but Google isn&apos;t indexing
              your dynamic content. Here&apos;s why:
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card padding="lg" className="text-center">
              <div className="mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-red-glow">
                <svg
                  className="h-6 w-6 text-accent-red"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Missing Properties</h3>
              <p className="text-sm text-foreground-muted">
                Required properties are present, but recommended ones that
                trigger rich results are missing.
              </p>
            </Card>

            <Card padding="lg" className="text-center">
              <div className="mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-amber-glow">
                <svg
                  className="h-6 w-6 text-accent-amber"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Weak Signals</h3>
              <p className="text-sm text-foreground-muted">
                Entity relationships are unclear. Google can&apos;t confidently
                classify your business or content.
              </p>
            </Card>

            <Card padding="lg" className="text-center">
              <div className="mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-blue-glow">
                <svg
                  className="h-6 w-6 text-accent-blue"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Framework Issues</h3>
              <p className="text-sm text-foreground-muted">
                Client-side rendering delays, hydration timing, or multiple
                conflicting schema versions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">
              How it works
            </h2>
            <p className="mb-12 text-foreground-muted">
              Three steps to JavaScript indexing that actually performs.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative">
              <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-accent-blue text-lg font-bold text-white">
                1
              </div>
              <div className="ml-14">
                <h3 className="mb-2 text-lg font-semibold">Enter Your URL</h3>
                <p className="text-sm text-foreground-muted">
                  Paste any URL. We fetch and parse all JSON-LD, microdata, and
                  RDFa on the page.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-accent-blue text-lg font-bold text-white">
                2
              </div>
              <div className="ml-14">
                <h3 className="mb-2 text-lg font-semibold">Select Your Business</h3>
                <p className="text-sm text-foreground-muted">
                  Tell us what you are: SaaS, local business, publisher,
                  ecommerce. Scoring adapts to your intent.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-accent-blue text-lg font-bold text-white">
                3
              </div>
              <div className="ml-14">
                <h3 className="mb-2 text-lg font-semibold">Get Actionable Fixes</h3>
                <p className="text-sm text-foreground-muted">
                  Receive prioritized recommendations on hydration strategies and
                  rendering fixes you can deploy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Insights Section */}
      <section className="section-sm bg-surface-1 border-y border-border">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">
              Real insights, not just validation
            </h2>
            <p className="mb-12 text-foreground-muted">
              Here&apos;s what a typical analysis reveals.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Score Preview */}
            <Card padding="lg">
              <div className="flex items-start gap-6">
                <ScoreRing score={67} size="md" label="Opportunity" />
                <div>
                  <h3 className="mb-2 text-lg font-semibold">
                    Opportunity Score: 67/100
                  </h3>
                  <p className="mb-4 text-sm text-foreground-muted">
                    Your dynamic content is rendering too slowly. Googlebot is abandoning
                    the page before your main content hydrates.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge badge-weak">High TTI</span>
                    <span className="badge badge-weak">Missing Content</span>
                    <span className="badge badge-strong">Fast LCP</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Entity Detection Preview */}
            <Card padding="lg">
              <h3 className="mb-4 text-lg font-semibold">Rendering Bottlenecks</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-surface-2 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-accent-red" />
                    <span className="font-medium">Heavy API Calls</span>
                  </div>
                  <span className="text-sm text-foreground-muted">Blocking</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface-2 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-accent-amber" />
                    <span className="font-medium">Client-Side Routing</span>
                  </div>
                  <span className="text-sm text-foreground-muted">Warning</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface-2 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-accent-green" />
                    <span className="font-medium">Initial HTML</span>
                  </div>
                  <span className="text-sm text-foreground-muted">Optimal</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="section">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">
              Built for teams who care about search
            </h2>
            <p className="mb-12 text-foreground-muted">
              Whether you&apos;re launching a SaaS, optimizing an agency
              client, or building for enterprise.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card padding="lg" hover>
              <div className="mb-4 text-4xl">🚀</div>
              <h3 className="mb-2 text-lg font-semibold">SaaS Founders</h3>
              <p className="text-sm text-foreground-muted">
                Maximize your SoftwareApplication schema to appear in software
                discovery searches.
              </p>
            </Card>

            <Card padding="lg" hover>
              <div className="mb-4 text-4xl">📈</div>
              <h3 className="mb-2 text-lg font-semibold">SEO Professionals</h3>
              <p className="text-sm text-foreground-muted">
                Deliver schema audits that go beyond validation. Show clients
                real opportunity.
              </p>
            </Card>

            <Card padding="lg" hover>
              <div className="mb-4 text-4xl">🏢</div>
              <h3 className="mb-2 text-lg font-semibold">Enterprise Teams</h3>
              <p className="text-sm text-foreground-muted">
                Standardize schema quality across hundreds of pages with
                automated monitoring.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-surface-1 border-t border-border">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">
              Ready to see what you&apos;re missing?
            </h2>
            <p className="mb-8 text-foreground-muted">
              Free analysis shows entity detection and eligibility. Upgrade for
              full recommendations and fixes.
            </p>
            <Link href="/javascript-rendering-checker/analyze" className="btn btn-primary btn-lg animate-pulse-glow">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Analyze Your URL — Free
            </Link>
          </div>
        </div>
      </section>

      {/* JSON-LD for the tool itself */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "JRC - JavaScript Rendering Checker",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
            description:
              "A premium JavaScript rendering intelligence platform that explains what search engines see.",
            offers: {
              "@type": "AggregateOffer",
              lowPrice: "29",
              highPrice: "199",
              priceCurrency: "USD",
            },
            publisher: {
              "@type": "Organization",
              name: "JavaScript Rendering Checker",
            },
          }),
        }}
      />
    </>
  );
}
