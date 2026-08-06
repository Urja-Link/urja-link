"use client";

import { motion } from "framer-motion";
import { Package, Truck, CheckCircle, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

const ORDERS = [
    {
        id: "ORD-UL-2026-984",
        date: "August 12, 2026",
        status: "shipped", // "processing" | "shipped" | "delivered"
        total: 24400,
        items: [
            { name: "Urja-Link Monocrystalline Pro 400W", qty: 1, price: 12500 },
            { name: "Urja-Link Poly Eco 330W", qty: 1, price: 8900 }
        ]
    }
];

export default function OrderHistoryPage() {
    return (
        <div style={{ minHeight: "100vh", background: "var(--background)", paddingTop: 100, paddingBottom: 60, paddingInline: 20 }}>
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "var(--foreground)" }}>
                        My Orders
                    </h1>
                    <Link href="/store" className="btn-primary" style={{ textDecoration: "none", fontSize: 13, padding: "8px 16px" }}>
                        Continue Shopping
                    </Link>
                </div>

                {ORDERS.length === 0 ? (
                    <div className="glass-card" style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>
                        <Package size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
                        <p>You haven't placed any orders yet.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {ORDERS.map((order, i) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                className="glass-card" style={{ padding: 0, overflow: "hidden" }}
                            >
                                <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px 24px", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, fontSize: 13, color: "var(--text-secondary)" }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>Order Placed</div>
                                        <div>{order.date}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>Total</div>
                                        <div>₹{order.total.toLocaleString("en-IN")}</div>
                                    </div>
                                    <div style={{ flex: 1, textAlign: "right" }}>
                                        <div style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>Order #{order.id}</div>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16 }}>
                                            <a href="#" style={{ color: "var(--accent)", textDecoration: "none" }}>View Invoice</a>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ padding: 24 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px 0", color: "var(--foreground)", display: "flex", alignItems: "center", gap: 8 }}>
                                        {order.status === "processing" && <Package size={20} color="#f59e0b" />}
                                        {order.status === "shipped" && <Truck size={20} color="#3b82f6" />}
                                        {order.status === "delivered" && <CheckCircle size={20} color="#10b981" />}
                                        <span style={{ textTransform: "capitalize" }}>{order.status}</span>
                                    </h3>

                                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                                    <div style={{ width: 64, height: 64, borderRadius: 8, background: "var(--hover-bg)", border: "1px solid var(--card-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <Package size={24} color="var(--text-muted)" />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: "var(--foreground)", fontSize: 15 }}>{item.name}</div>
                                                        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Qty: {item.qty} &nbsp;•&nbsp; ₹{item.price.toLocaleString("en-IN")}</div>
                                                    </div>
                                                </div>
                                                <button className="btn-primary" style={{ background: "transparent", color: "var(--foreground)", border: "1px solid var(--card-border)", padding: "8px 16px", fontSize: 13 }}>
                                                    Track Item
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
