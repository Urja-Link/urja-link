"use client";

import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, ShoppingBag, ShieldCheck, Truck, Zap } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

const CART_ITEMS = [
    { id: 1, name: "Solaris Bifacial Titan 500W", qty: 10, price: 16000 },
    { id: 2, name: "Nexus Hybrid Inverter 5kW", qty: 1, price: 45000 },
];

export default function CheckoutPage() {
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const subtotal = CART_ITEMS.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const tax = subtotal * 0.18; // 18% GST typical for some electronics in India
    const total = subtotal + tax;

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const formData = new FormData(formRef.current!);
            const shipping_details = {
                name: formData.get("name"),
                address: formData.get("address"),
                city: formData.get("city"),
                state: formData.get("state"),
                pincode: formData.get("pincode"),
                phone: formData.get("phone"),
                payment_method: paymentMethod
            };

            const { data: { session } } = await supabase.auth.getSession();

            const payload = {
                user_id: session?.user?.id || null, // Allow anonymous orders if session doesn't exist for prototyping
                total_amount: total,
                status: 'processing',
                shipping_details: shipping_details,
                items: CART_ITEMS
            };

            const { error } = await supabase.from('store_orders').insert(payload);
            if (error) throw error;

            setIsSuccess(true);
        } catch (error: any) {
            alert(`Checkout Error: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div style={{ minHeight: "100vh", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ padding: 40, textAlign: "center", maxWidth: 440 }}>
                    <div style={{ width: 80, height: 80, borderRadius: 40, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                        <ShieldCheck size={40} color="#10b981" />
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 16px" }}>Order Confirmed!</h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
                        Your hardware order #ORD-88219 has been placed successfully. A receipt has been sent to your email.
                    </p>
                    <Link href="/store" className="btn-primary" style={{ display: "inline-block", textDecoration: "none", width: "100%" }}>
                        Return to Store
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--background)", paddingTop: 100, paddingBottom: 60, paddingInline: 20 }}>
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                <Link href="/store" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", textDecoration: "none", fontWeight: 600, marginBottom: 24, width: "fit-content" }}>
                    <ArrowLeft size={18} /> Back to Store
                </Link>

                <form ref={formRef} onSubmit={handleCheckout} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 32, alignItems: "start" }}>

                    {/* Left Column: Form */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                        <div className="glass-card" style={{ padding: 32 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 24px", display: "flex", alignItems: "center", gap: 8 }}>
                                <Truck size={20} color="var(--warning)" /> Shipping Details
                            </h2>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                                    <label className="form-label">Full Name</label>
                                    <input name="name" className="form-input" placeholder="Name" defaultValue="Rohan Kapoor" />
                                </div>
                                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                                    <label className="form-label">Address line 1</label>
                                    <input name="address" className="form-input" placeholder="Street address" defaultValue="14 Tech Park Road" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">City</label>
                                    <input name="city" className="form-input" placeholder="City" defaultValue="Mumbai" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">State</label>
                                    <input name="state" className="form-input" placeholder="State" defaultValue="MH" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Pincode</label>
                                    <input name="pincode" className="form-input" placeholder="6 digits" defaultValue="400001" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input name="phone" className="form-input" placeholder="+91..." defaultValue="+91 98765 43210" />
                                </div>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: 32 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 24px", display: "flex", alignItems: "center", gap: 8 }}>
                                <CreditCard size={20} color="var(--warning)" /> Payment Method
                            </h2>
                            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("card")}
                                    style={{
                                        flex: 1, padding: 16, borderRadius: 12, border: `2px solid ${paymentMethod === "card" ? "var(--warning)" : "var(--card-border)"}`,
                                        background: "var(--hover-bg)", color: "var(--foreground)", fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", gap: 8, alignItems: "center"
                                    }}
                                >
                                    <CreditCard size={24} color={paymentMethod === "card" ? "var(--warning)" : "var(--text-muted)"} />
                                    Credit / Debit Card
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("upi")}
                                    style={{
                                        flex: 1, padding: 16, borderRadius: 12, border: `2px solid ${paymentMethod === "upi" ? "var(--warning)" : "var(--card-border)"}`,
                                        background: "var(--hover-bg)", color: "var(--foreground)", fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", gap: 8, alignItems: "center"
                                    }}
                                >
                                    <Zap size={24} color={paymentMethod === "upi" ? "var(--warning)" : "var(--text-muted)"} />
                                    UPI
                                </button>
                            </div>

                            {paymentMethod === "card" ? (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                                        <label className="form-label">Card Number</label>
                                        <input className="form-input" placeholder="0000 0000 0000 0000" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Expiry</label>
                                        <input className="form-input" placeholder="MM/YY" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">CVV</label>
                                        <input className="form-input" placeholder="123" />
                                    </div>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label className="form-label">UPI ID</label>
                                    <input className="form-input" placeholder="example@upi" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="glass-card" style={{ padding: 32, position: "sticky", top: 120 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 24px", display: "flex", alignItems: "center", gap: 8 }}>
                            <ShoppingBag size={20} color="var(--warning)" /> Order Summary
                        </h2>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                            {CART_ITEMS.map(item => (
                                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Qty: {item.qty}</div>
                                    </div>
                                    <div style={{ fontWeight: 700 }}>₹{(item.price * item.qty).toLocaleString("en-IN")}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ borderTop: "1px dashed var(--card-border)", margin: "0 0 24px 0" }} />

                        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: 14 }}>
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString("en-IN")}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: 14 }}>
                                <span>GST (18%)</span>
                                <span>₹{tax.toLocaleString("en-IN")}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 800, marginTop: 8, color: "var(--foreground)" }}>
                                <span>Total</span>
                                <span>₹{total.toLocaleString("en-IN")}</span>
                            </div>
                        </div>

                        <button
                            className="btn-primary"
                            style={{ width: "100%", padding: 16, fontSize: 16, background: "var(--foreground)", color: "var(--background)" }}
                            onClick={handleCheckout}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Processing Securely..." : `Pay ₹${total.toLocaleString("en-IN")}`}
                        </button>
                        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                            <ShieldCheck size={14} /> Encrypted & Secure Checkout
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
