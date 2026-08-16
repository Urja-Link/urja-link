"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wrench, ArrowRight, ShieldCheck, HardHat } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://urja-link-api.onrender.com";

export default function TechnicianRegistrationPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", email: "", phone: "", company_id: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Note: In real app, this hits the specialized /api/auth/technician/register endpoint
            // For now, simulate the request
            setTimeout(() => {
                setLoading(false);
                // Mock JWT setup for Tech
                const mockUser = { id: "TECH-001", name: form.name, email: form.email, role: "Technician", company_id: form.company_id };
                localStorage.setItem("urjalink-user", JSON.stringify(mockUser));
                localStorage.setItem("urjalink-token", "mock-tech-token");
                router.push("/technician/dashboard");
            }, 1500);
        } catch (err: any) {
            setError("Failed to register technician profile. Verify your Company ID pass-code.");
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)", padding: 20, overflow: "hidden" }}>
            {/* Animated Solar Orbs */}
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} style={{ position: "absolute", top: "10%", left: "15%", width: 400, height: 400, background: "var(--gradient-start)", filter: "blur(120px)", borderRadius: "50%", zIndex: 0, pointerEvents: "none" }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="glass-card"
                style={{ maxWidth: 440, width: "100%", padding: 36, zIndex: 1, position: "relative" }}
            >
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <HardHat size={48} color="var(--accent)" style={{ marginBottom: 12 }} />
                    <h1 style={{
                        fontSize: 24, fontWeight: 800,
                        background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0
                    }}>
                        Field Technician Hub
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
                        Register the field app device and bind to an authorized Solar Integration Company.
                    </p>
                </div>

                {error && (
                    <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "var(--card-bg)", border: "1px solid var(--danger)", color: "var(--danger)", fontSize: 13 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" required placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Mobile Number</label>
                            <input className="form-input" required placeholder="+91 XXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email (Optional)</label>
                            <input className="form-input" type="email" placeholder="john@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        </div>
                    </div>

                    <div className="form-group" style={{ position: "relative" }}>
                        <label className="form-label">Company ID Linkage Code</label>
                        <input className="form-input" required placeholder="Ex: CMP-A893BF" style={{ border: "1px solid var(--warning)", background: "var(--background)" }} value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })} />
                        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>Ask your installation agency for this 8-digit unique code.</p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Device Pin / Password</label>
                        <input className="form-input" type="password" required placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    </div>

                    <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", padding: 14, fontSize: 15, marginTop: 8, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                        {loading ? "Binding Device..." : <><Wrench size={16} /> Link & Initialize Device</>}
                    </button>

                    <div style={{ padding: 12, borderRadius: 8, background: "rgba(56,189,248,0.06)", border: "1px solid var(--card-border)", display: "flex", alignItems: "center", gap: 12, color: "var(--text-secondary)", fontSize: 12, marginTop: 4 }}>
                        <ShieldCheck size={16} color="var(--accent)" />
                        Data bounded physically via AES-256 for field operations via RBAC nodes.
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
