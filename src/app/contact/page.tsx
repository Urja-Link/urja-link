"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Mail, CheckCircle, Send, MapPin, Phone, Clock, Link2, HelpCircle, Info, ScrollText } from "lucide-react";

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
                <h1 className="page-title"><Mail size={32} style={{ marginRight: 10 }} /> Contact Us</h1>
                <p className="page-subtitle">Get in touch with the Urja-Link team</p>
            </header>

            <div className="content-section">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: 32 }}>
                    {/* Contact Form */}
                    <div className="info-card">
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Send us a Message</h2>

                        <div style={{ minHeight: 380, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            {submitted ? (
                                <div style={{
                                    padding: 24, borderRadius: 12, textAlign: "center",
                                    background: "var(--card-bg)", border: "1px solid var(--success)",
                                }}>
                                    <p style={{ fontSize: 36, display: "flex", justifyContent: "center", margin: 0, paddingBottom: 16 }}><CheckCircle size={48} color="var(--success)" /></p>
                                    <h3 style={{ color: "var(--success)", marginBottom: 8 }}>Message Sent!</h3>
                                    <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                                        We&apos;ll get back to you within 24 hours.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: 16 }}>
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
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: 16 }}>
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
                                    <button type="submit" className="btn-primary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                        <Send size={18} /> Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <div className="info-card" style={{ marginBottom: 20 }}>
                            <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}><MapPin size={20} color="var(--warning)" /> Office</h3>
                            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
                                Urja-Link India Pvt. Ltd.<br />
                                Solar Innovation Hub<br />
                                India
                            </p>
                        </div>
                        <div className="info-card" style={{ marginBottom: 20 }}>
                            <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}><Phone size={20} color="var(--warning)" /> Contact Info</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12, color: "var(--text-secondary)" }}>
                                <p style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}><Mail size={16} /> team.urjalink@gmail.com</p>
                                <p style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}><Phone size={16} /> +91-XXXXX-XXXXX</p>
                                <p style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}><Clock size={16} /> Mon–Sat: 9:00 AM – 6:00 PM IST</p>
                            </div>
                        </div>
                        <div className="info-card">
                            <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}><Link2 size={20} color="var(--warning)" /> Quick Links</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {[
                                    { href: "/faq", label: "Frequently Asked Questions", icon: <HelpCircle size={16} /> },
                                    { href: "/about", label: "About Urja-Link", icon: <Info size={16} /> },
                                    { href: "/legal", label: "Privacy Policy", icon: <ScrollText size={16} /> },
                                ].map((l) => (
                                    <Link key={l.href} href={l.href} style={{ color: "var(--foreground)", textDecoration: "none", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                                        {l.icon} {l.label}
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
