import { Mail, MapPin, MessageCircle } from "lucide-react"

export const metadata = {
    title: "Contact - BlitzGeo",
    description: "Get in touch with the BlitzGeo team. We're here to help with questions about AI brand visibility.",
}

export default function ContactPage() {
    return (
        <main>
            {/* Hero */}
            <section className="py-20">
                <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        Get in Touch
                    </h1>
                    <p className="text-lg md:text-xl text-[var(--text-muted)]">
                        Have questions about BlitzGeo? We'd love to hear from you.
                    </p>
                </div>
            </section>

            {/* Contact Options */}
            <section className="pb-20">
                <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] text-center">
                            <div className="size-12 rounded-full bg-[var(--primary-muted)] flex items-center justify-center mx-auto mb-4">
                                <Mail className="size-6 text-[var(--primary)]" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Email Us</h3>
                            <p className="text-[var(--text-muted)] mb-4">For general inquiries and support</p>
                            <a href="mailto:hello@blitzgeo.com" className="text-[var(--primary)] hover:underline">
                                hello@blitzgeo.com
                            </a>
                        </div>
                        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] text-center">
                            <div className="size-12 rounded-full bg-[var(--accent-muted)] flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="size-6 text-[var(--accent)]" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Live Chat</h3>
                            <p className="text-[var(--text-muted)] mb-4">Available Mon-Fri, 9am-6pm EST</p>
                            <button className="text-[var(--primary)] hover:underline">
                                Start a conversation
                            </button>
                        </div>
                        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] text-center">
                            <div className="size-12 rounded-full bg-[var(--success-muted)] flex items-center justify-center mx-auto mb-4">
                                <MapPin className="size-6 text-[var(--success)]" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Location</h3>
                            <p className="text-[var(--text-muted)] mb-4">We're a remote-first company</p>
                            <span className="text-[var(--text-subtle)]">Worldwide</span>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold mb-8 text-center">Send us a message</h2>
                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">First Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    placeholder="john@company.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Subject</label>
                                <select className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
                                    <option>General Inquiry</option>
                                    <option>Technical Support</option>
                                    <option>Feedback</option>
                                    <option>Partnership</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Message</label>
                                <textarea
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                                    placeholder="How can we help you?"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium transition-colors"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    )
}
