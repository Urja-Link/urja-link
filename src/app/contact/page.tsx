"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <Link href="/" className="back-link">← Back to Map</Link>
                <h1 className="page-title">📧 Contact Us</h1>
                <p className="page-subtitle">Get in touch with the Urja-Link team</p>
            </header>

            <div className="content-section">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                    {/* Contact Form */}
                    <div className="info-card">
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Send us a Message</h2>

                        {submitted ? (
                            <div style={{
                                padding: 24, borderRadius: 12, textAlign: "center",
                                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                            }}>
                                <p style={{ fontSize: 36 }}>✅</p>
                                <h3 style={{ color: "var(--success)", marginBottom: 8 }}>Message Sent!</h3>
                                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                                    We&apos;ll get back to you within 24 hours.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                    <div className="form-group">
                                        <label className="form-label">Name</label>
                                        <input
                                            className="form-input"
                                            placeholder="Your name"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input
                                            className="form-input"
                                            type="email"
                                            placeholder="your@email.com"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                    <div className="form-group">
                                        <label className="form-label">Phone</label>
                                        <input
                                            className="form-input"
                                            placeholder="+91 XXXXX XXXXX"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Subject</label>
                                        <input
                                            className="form-input"
                                            placeholder="Subject"
                                            value={form.subject}
                                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Message</label>
                                    <textarea
                                        className="form-input"
                                        placeholder="How can we help you?"
                                        rows={5}
                                        style={{ resize: "vertical" }}
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn-primary" style={{ width: "100%" }}>
                                    📩 Send Message
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div>
                        <div className="info-card" style={{ marginBottom: 20 }}>
                            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>📍 Office</h3>
                            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                                Urja-Link India Pvt. Ltd.<br />
                                Solar Innovation Hub<br />
                                India
                            </p>
                        </div>
                        <div className="info-card" style={{ marginBottom: 20 }}>
                            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>📞 Contact Info</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12, color: "var(--text-secondary)" }}>
                                <p>📧 support@urjalink.in</p>
                                <p>📞 +91-XXXXX-XXXXX</p>
                                <p>🕐 Mon–Sat: 9:00 AM – 6:00 PM IST</p>
                            </div>
                        </div>
                        <div className="info-card">
                            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>🔗 Quick Links</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {[
                                    { href: "/faq", label: "❓ Frequently Asked Questions" },
                                    { href: "/about", label: "ℹ️ About Urja-Link" },
                                    { href: "/legal", label: "📜 Privacy Policy" },
                                ].map((l) => (
                                    <Link key={l.href} href={l.href} style={{ color: "var(--accent)", textDecoration: "none", fontSize: 14 }}>
                                        {l.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
