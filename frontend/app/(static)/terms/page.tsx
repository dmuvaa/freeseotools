import Link from "next/link"

export const metadata = {
    title: "Terms of Service - BlitzGeo",
    description: "BlitzGeo Terms of Service - Terms and conditions for using our AI brand visibility platform.",
}

export default function TermsPage() {
    return (
        <main className="py-20">
            <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                <p className="text-[var(--text-muted)] mb-12">Last updated: January 6, 2026</p>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                        <p className="text-[var(--text-muted)] mb-4">
                            By accessing or using BlitzGeo's services, you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
                        <p className="text-[var(--text-muted)] mb-4">
                            BlitzGeo provides an AI brand visibility audit platform that allows users to analyze how
                            their brand appears across various AI language models including GPT-5, Gemini, Claude,
                            Perplexity, and DeepSeek.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">3. Account Registration</h2>
                        <ul className="list-disc list-inside text-[var(--text-muted)] mb-4 space-y-2">
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Be responsible for all activities under your account</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">4. Acceptable Use</h2>
                        <p className="text-[var(--text-muted)] mb-4">You agree not to:</p>
                        <ul className="list-disc list-inside text-[var(--text-muted)] mb-4 space-y-2">
                            <li>Use the service for any illegal purpose</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Interfere with or disrupt the service</li>
                            <li>Use the service to harm or harass others</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">5. Intellectual Property</h2>
                        <p className="text-[var(--text-muted)] mb-4">
                            BlitzGeo and its original content, features, and functionality are owned by BlitzGeo
                            and are protected by intellectual property laws. You retain ownership of your brand data
                            and audit results.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">6. Disclaimer</h2>
                        <p className="text-[var(--text-muted)] mb-4">
                            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee that
                            AI model responses are accurate or that audit results will lead to specific business outcomes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">7. Contact</h2>
                        <p className="text-[var(--text-muted)]">
                            Email: <a href="mailto:legal@blitzgeo.com" className="text-[var(--primary)] hover:underline">legal@blitzgeo.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    )
}
