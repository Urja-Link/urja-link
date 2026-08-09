"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function LoginPage() {
    const [mode, setMode] = useState<"email" | "otp">("email");
    const [form, setForm] = useState({ email: "", password: "" });
    const [otpForm, setOtpForm] = useState({ contact: "", otp: "", otpSent: false });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Login failed");
            localStorage.setItem("urjalink-token", data.access_token);
            localStorage.setItem("urjalink-user", JSON.stringify(data.user));
            window.location.href = "/";
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        setError("");
        try {
            const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contact: otpForm.contact, otp_type: otpForm.contact.includes("@") ? "email" : "sms" }),
            });
            if (res.ok) setOtpForm({ ...otpForm, otpSent: true });
        } catch {
            setError("Failed to send OTP");
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contact: otpForm.contact, otp: otpForm.otp }),
            });
            if (res.ok) {
                window.location.href = "/";
            } else {
                setError("Invalid OTP");
            }
        } catch {
            setError("Verification failed");
        }
    };

    return (
        <div style={{
            minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--background)", padding: 20, overflow: "hidden"
        }}>
            {/* Animated Solar Orbs */}
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} style={{ position: "absolute", top: "10%", left: "15%", width: 400, height: 400, background: "var(--gradient-start)", filter: "blur(120px)", borderRadius: "50%", zIndex: 0, pointerEvents: "none" }} />
            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }} style={{ position: "absolute", bottom: "10%", right: "15%", width: 500, height: 500, background: "var(--gradient-end)", filter: "blur(140px)", borderRadius: "50%", zIndex: 0, pointerEvents: "none" }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="glass-card"
                style={{ maxWidth: 440, width: "100%", padding: 36, zIndex: 1, position: "relative" }}
            >
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <h1 style={{
                        fontSize: 28, fontWeight: 800,
                        background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>
                        Welcome Back
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 8 }}>
                        Sign in to Urja-Link
                    </p>
                </div>

                {/* Mode Toggle */}
                <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                    <button
                        onClick={() => setMode("email")}
                        style={{
                            flex: 1, padding: "10px", borderRadius: 8, border: "1px solid var(--card-border)",
                            background: mode === "email" ? "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" : "transparent",
                            color: mode === "email" ? "white" : "var(--text-secondary)", fontWeight: 600, fontSize: 13, cursor: "pointer",
                        }}
                    >
                        Email Login
                    </button>
                    <button
                        onClick={() => setMode("otp")}
                        style={{
                            flex: 1, padding: "10px", borderRadius: 8, border: "1px solid var(--card-border)",
                            background: mode === "otp" ? "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" : "transparent",
                            color: mode === "otp" ? "white" : "var(--text-secondary)", fontWeight: 600, fontSize: 13, cursor: "pointer",
                        }}
                    >
                        OTP Login
                    </button>
                </div>

                {error && (
                    <div style={{
                        padding: "10px 14px", borderRadius: 8, marginBottom: 16,
                        background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                        color: "#ef4444", fontSize: 13,
                    }}>
                        {error}
                    </div>
                )}

                {mode === "email" ? (
                    <form onSubmit={handleEmailLogin}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input className="form-input" type="email" placeholder="your@email.com" required
                                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input className="form-input" type="password" placeholder="••••••••" required
                                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        </div>
                        <button className="btn-primary" type="submit" style={{ width: "100%" }} disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP}>
                        <div className="form-group">
                            <label className="form-label">Email or Phone</label>
                            <input className="form-input" placeholder="+91 XXXXX XXXXX or email" required
                                value={otpForm.contact} onChange={(e) => setOtpForm({ ...otpForm, contact: e.target.value })} />
                        </div>
                        {!otpForm.otpSent ? (
                            <button className="btn-primary" type="button" onClick={handleSendOTP} style={{ width: "100%" }}>
                                Send OTP
                            </button>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Enter OTP</label>
                                    <input className="form-input" placeholder="6-digit OTP" maxLength={6} required
                                        value={otpForm.otp} onChange={(e) => setOtpForm({ ...otpForm, otp: e.target.value })} />
                                </div>
                                <button className="btn-primary" type="submit" style={{ width: "100%" }}>
                                    Verify OTP
                                </button>
                            </>
                        )}
                    </form>
                )}

                <div style={{ textAlign: "center", marginTop: 24, color: "var(--text-muted)", fontSize: 14 }}>
                    Don&apos;t have an account?{" "}
                    <Link href="/register" style={{ color: "var(--gradient-start)", fontWeight: 700, textDecoration: "none", marginLeft: 4 }}>
                        Sign Up
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
