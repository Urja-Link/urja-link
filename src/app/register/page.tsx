"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function RegisterPage() {
    const [tab, setTab] = useState<"individual" | "company">("individual");
    const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
    const [companyForm, setCompanyForm] = useState({
        company_name: "", gst_number: "", business_registration_number: "",
        contact_person: "", phone: "", email: "", address: "", city: "", state: "",
        pincode: "", company_type: "installer", specialization: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (form.password !== form.confirm) { setError("Passwords don't match"); return; }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, user_type: "individual" }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Registration failed");
            localStorage.setItem("urjalink-token", data.token);
            localStorage.setItem("urjalink-user", JSON.stringify(data.user));
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCompanyRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/company/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(companyForm),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Registration failed");
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
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
                    style={{ maxWidth: 440, width: "100%", padding: 40, textAlign: "center", zIndex: 1, position: "relative" }}
                >
                    <p style={{ fontSize: 48, marginBottom: 16 }}></p>
                    <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Registration Successful!</h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
                        {tab === "company" ? "Your company registration is under review. We'll verify your documents within 24-48 hours." : "Your account has been created. Welcome to Urja-Link!"}
                    </p>
                    <Link href="/" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
                        Go to Solar Map
                    </Link>
                </motion.div>
            </div>
        );
    }

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
                style={{ maxWidth: 540, width: "100%", padding: 36, maxHeight: "90vh", overflowY: "auto", zIndex: 1, position: "relative" }}
            >
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <h1 style={{
                        fontSize: 28, fontWeight: 800,
                        background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>
                        Join Urja-Link
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 8 }}>
                        Create your account
                    </p>
                </div>

                {/* Tab Toggle */}
                <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                    {(["individual", "company"] as const).map((t) => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            flex: 1, padding: "10px", borderRadius: 8, border: "1px solid var(--card-border)",
                            background: tab === t ? "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" : "transparent",
                            color: tab === t ? "white" : "var(--text-secondary)", fontWeight: 600, fontSize: 13, cursor: "pointer",
                        }}>
                            {t === "individual" ? "Individual" : "Company"}
                        </button>
                    ))}
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

                {tab === "individual" ? (
                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input className="form-input" placeholder="Your full name" required
                                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input className="form-input" type="email" placeholder="email@example.com" required
                                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input className="form-input" placeholder="+91 XXXXX XXXXX" required
                                    value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input className="form-input" type="password" placeholder="Min 6 chars" required minLength={6}
                                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <input className="form-input" type="password" placeholder="Re-enter password" required
                                    value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
                            </div>
                        </div>
                        <button className="btn-primary" type="submit" style={{ width: "100%" }} disabled={loading}>
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleCompanyRegister}>
                        <div className="form-group">
                            <label className="form-label">Company Name</label>
                            <input className="form-input" placeholder="Your company name" required
                                value={companyForm.company_name} onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">GST Number</label>
                                <input className="form-input" placeholder="15-digit GST" required maxLength={15} minLength={15}
                                    value={companyForm.gst_number} onChange={(e) => setCompanyForm({ ...companyForm, gst_number: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Business Registration No.</label>
                                <input className="form-input" placeholder="Registration number" required
                                    value={companyForm.business_registration_number} onChange={(e) => setCompanyForm({ ...companyForm, business_registration_number: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Contact Person</label>
                                <input className="form-input" placeholder="Name" required
                                    value={companyForm.contact_person} onChange={(e) => setCompanyForm({ ...companyForm, contact_person: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Company Type</label>
                                <select className="form-input" value={companyForm.company_type}
                                    onChange={(e) => setCompanyForm({ ...companyForm, company_type: e.target.value })}>
                                    <option value="installer">Solar Installer</option>
                                    <option value="maintenance">Maintenance Company</option>
                                    <option value="equipment_seller">Equipment Seller</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input className="form-input" type="email" placeholder="company@email.com" required
                                    value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input className="form-input" placeholder="+91 XXXXX XXXXX" required
                                    value={companyForm.phone} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Address</label>
                            <input className="form-input" placeholder="Full address" required
                                value={companyForm.address} onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">City</label>
                                <input className="form-input" placeholder="City" required
                                    value={companyForm.city} onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">State</label>
                                <input className="form-input" placeholder="State" required
                                    value={companyForm.state} onChange={(e) => setCompanyForm({ ...companyForm, state: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Pincode</label>
                                <input className="form-input" placeholder="Pincode" required maxLength={6}
                                    value={companyForm.pincode} onChange={(e) => setCompanyForm({ ...companyForm, pincode: e.target.value })} />
                            </div>
                        </div>
                        <div style={{
                            padding: 14, borderRadius: 10, marginBottom: 20,
                            background: "rgba(56,189,248,0.06)", border: "1px solid var(--card-border)",
                            fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6,
                        }}>
                            After registration, your company will be verified using GST number, business
                            registration documents, and contact information. This typically takes 24-48 hours.
                        </div>
                        <button className="btn-primary" type="submit" style={{ width: "100%" }} disabled={loading}>
                            {loading ? "Registering..." : "Register Company"}
                        </button>
                    </form>
                )}

                <div style={{ textAlign: "center", marginTop: 24, color: "var(--text-muted)", fontSize: 14 }}>
                    Already have an account?{" "}
                    <Link href="/login" style={{ color: "var(--gradient-start)", fontWeight: 700, textDecoration: "none", marginLeft: 4 }}>
                        Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
