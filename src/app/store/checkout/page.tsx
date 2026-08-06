"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, ShieldCheck, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate network request to payment gateway
        setTimeout(() => {
            setLoading(false);
            setStep(2);
        }, 2000);
    };

    if (step === 2) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)", padding: 20 }}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ maxWidth: 440, width: "100%", padding: 40, textAlign: "center" }}>
                    <CheckCircle size={64} color="#10b981" style={{ margin: "0 auto 20px" }} />
                    <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 12px 0", color: "var(--foreground)" }}>Payment Successful!</h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 14 }}>
                        Your order for Solar Hardware has been placed securely via Urja-Link. You will receive tracking details via email shortly.
                    </p>
                    <Link href="/store" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
                        Return to Store
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--background)", paddingTop: 100, paddingBottom: 60, paddingInline: 20 }}>
            <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>

                {/* Checkout Form */}
                <div style={{ flex: "1 1 500px" }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 24px 0", color: "var(--foreground)" }}>
                        Secure Checkout
                    </h1>

                    <form onSubmit={handlePayment} className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
                        <div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px 0", color: "var(--foreground)", display: "flex", alignItems: "center", gap: 8 }}>
                                <CreditCard size={18} color="var(--accent)" /> Payment Details
                            </h3>
                            <div className="form-group">
                                <label className="form-label">Cardholder Name</label>
                                <input className="form-input" required placeholder="Name on card" />
                            </div>
                            <div className="form-group" style={{ marginTop: 16 }}>
                                <label className="form-label">Card Number</label>
                                <input className="form-input" required placeholder="0000 0000 0000 0000" maxLength={19} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Expiry (MM/YY)</label>
                                    <input className="form-input" required placeholder="MM/YY" maxLength={5} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">CVC</label>
                                    <input className="form-input" type="password" required placeholder="•••" maxLength={4} />
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: 12, borderRadius: 8, background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", gap: 12, color: "var(--text-secondary)", fontSize: 13 }}>
                            <ShieldCheck size={20} color="#10b981" />
                            Payments are processed securely via mock Stripe integration.
                        </div>

                        <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", padding: 14, fontSize: 16, marginTop: 8 }}>
                            {loading ? "Processing..." : "Pay ₹24,400"}
                        </button>
                    </form>
                </div>

                {/* Order Summary */}
                <div style={{ flex: "1 1 300px", position: "sticky", top: 100 }}>
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px 0", color: "var(--foreground)" }}>Order Summary</h3>

                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 14, color: "var(--text-secondary)" }}>
                            <span style={{ flex: 1, paddingRight: 8 }}>Urja-Link Monocrystalline Pro 400W</span>
                            <span style={{ fontWeight: 600, color: "var(--foreground)" }}>₹12,500</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, color: "var(--text-secondary)" }}>
                            <span style={{ flex: 1, paddingRight: 8 }}>Urja-Link Poly Eco 330W</span>
                            <span style={{ fontWeight: 600, color: "var(--foreground)" }}>₹8,900</span>
                        </div>

                        <div style={{ borderTop: "1px solid var(--card-border)", margin: "16px 0" }} />

                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, color: "var(--text-secondary)" }}>
                            <span>Subtotal</span>
                            <span>₹21,400</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 14, color: "var(--text-secondary)" }}>
                            <span>Shipping & Tax</span>
                            <span>₹3,000</span>
                        </div>

                        <div style={{ borderTop: "1px solid var(--card-border)", margin: "16px 0" }} />

                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, color: "var(--foreground)" }}>
                            <span>Total</span>
                            <span>₹24,400</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
