import Link from "next/link"

export const metadata = {
    title: "Terms of Service - Free SEO Tools",
    description: "Free SEO Tools Terms of Service - Terms and conditions for using our AI brand visibility platform.",
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
                            By accessing or using Free SEO Tools's services, you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
                        <p className="text-[var(--text-muted)] mb-4">
                            Free SEO Tools provides a suite of completely free search engine optimization utilities. All tools are 
                            available without account registration, sign-in, or payment.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">3. No Account Required</h2>
                        <p className="text-[var(--text-muted)] mb-4">
                            Our tools are designed to be accessible without registration. You do not need to create an account, provide 
                            a password, or login to use any features of Free SEO Tools.
                        </p>
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
                            Free SEO Tools and its original content, features, and functionality are owned by Free SEO Tools
                            and are protected by intellectual property laws. You retain ownership of any data
                            you input into our tools.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">6. Disclaimer</h2>
                        <p className="text-[var(--text-muted)] mb-4">
                            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee that
                            tool results are perfectly accurate or that they will lead to specific business outcomes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">7. Contact</h2>
                        <p className="text-[var(--text-muted)]">
                            Email: <a href="mailto:legal@freeseotools.com" className="text-[var(--primary)] hover:underline">legal@freeseotools.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    )
}
