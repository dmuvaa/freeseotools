import Link from "next/link"

export const metadata = {
    title: "Privacy Policy - Free SEO Tools",
    description: "Free SEO Tools Privacy Policy - Learn how we collect, use, and protect your data.",
}

export default function PrivacyPage() {
    return (
        <main className="py-20">
            <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                <p className="text-[var(--text-muted)] mb-12">Last updated: January 6, 2026</p>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                        <p className="text-[var(--text-muted)] mb-4">
                            Free SEO Tools ("we," "our," or "us") is committed to protecting your privacy. Our tools are 100% free to use and require no account registration or sign-in. This Privacy Policy
                            explains how we collect, use, disclose, and safeguard your information when you use our
                            website and related services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
                        <h3 className="text-lg font-semibold mb-2">2.1 Information You Provide</h3>
                        <ul className="list-disc list-inside text-[var(--text-muted)] mb-4 space-y-2">
                            <li>Data entered into our tools (URLs, keywords, search parameters)</li>
                            <li>Communications with our support team</li>
                            <li>Feedback or feature requests you submit</li>
                        </ul>

                        <h3 className="text-lg font-semibold mb-2">2.2 Information We Collect Automatically</h3>
                        <ul className="list-disc list-inside text-[var(--text-muted)] mb-4 space-y-2">
                            <li>Usage data (features used, audit frequency)</li>
                            <li>Device information (browser type, operating system)</li>
                            <li>Log data (IP address, access times, pages viewed)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
                        <ul className="list-disc list-inside text-[var(--text-muted)] mb-4 space-y-2">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Send technical notices, updates, and support messages</li>
                            <li>Respond to your comments and questions</li>
                            <li>Analyze usage patterns to improve user experience</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
                        <p className="text-[var(--text-muted)] mb-4">
                            We implement appropriate technical and organizational measures to protect your data, including
                            encryption in transit and at rest, regular security reviews, and access controls.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
                        <ul className="list-disc list-inside text-[var(--text-muted)] mb-4 space-y-2">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Delete your data</li>
                            <li>Export your data in a portable format</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">6. Contact Us</h2>
                        <p className="text-[var(--text-muted)] mb-4">
                            If you have questions about this Privacy Policy, please contact us at:
                        </p>
                        <p className="text-[var(--text-muted)]">
                            Email: <a href="mailto:privacy@freeseotools.com" className="text-[var(--primary)] hover:underline">privacy@freeseotools.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    )
}
