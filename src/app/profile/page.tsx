"use client";

import { motion } from "framer-motion";
import {
    User, Mail, Phone, MapPin, Shield, Zap, Bell, Key, LogOut, ChevronRight
} from "lucide-react";
import { useState } from "react";

export default function UserProfilePage() {
    const [activeTab, setActiveTab] = useState("general");

    return (
        <div className="page-container">
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                <div style={{ marginBottom: 40 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px 0" }}>Account Settings</h1>
                    <p style={{ color: "var(--text-secondary)", margin: 0 }}>Manage your profile, preferences, and linked systems.</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 32, alignItems: "start" }}>

                    {/* Sidebar Nav */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "sticky", top: 120 }}>
                        <button
                            onClick={() => setActiveTab("general")}
                            style={{
                                padding: "12px 16px", borderRadius: 8, display: "flex", alignItems: "center", gap: 12,
                                background: activeTab === "general" ? "var(--foreground)" : "transparent",
                                color: activeTab === "general" ? "var(--background)" : "var(--text-secondary)",
                                border: "none", cursor: "pointer", fontWeight: 600, textAlign: "left", transition: "0.2s"
                            }}
                        >
                            <User size={18} /> General
                        </button>
                        <button
                            onClick={() => setActiveTab("systems")}
                            style={{
                                padding: "12px 16px", borderRadius: 8, display: "flex", alignItems: "center", gap: 12,
                                background: activeTab === "systems" ? "var(--foreground)" : "transparent",
                                color: activeTab === "systems" ? "var(--background)" : "var(--text-secondary)",
                                border: "none", cursor: "pointer", fontWeight: 600, textAlign: "left", transition: "0.2s"
                            }}
                        >
                            <Zap size={18} /> Linked Systems
                        </button>
                        <button
                            onClick={() => setActiveTab("security")}
                            style={{
                                padding: "12px 16px", borderRadius: 8, display: "flex", alignItems: "center", gap: 12,
                                background: activeTab === "security" ? "var(--foreground)" : "transparent",
                                color: activeTab === "security" ? "var(--background)" : "var(--text-secondary)",
                                border: "none", cursor: "pointer", fontWeight: 600, textAlign: "left", transition: "0.2s"
                            }}
                        >
                            <Shield size={18} /> Security
                        </button>
                        <button
                            style={{
                                padding: "12px 16px", borderRadius: 8, display: "flex", alignItems: "center", gap: 12,
                                background: "transparent", color: "#ef4444", border: "none", cursor: "pointer", fontWeight: 600, textAlign: "left", marginTop: 24
                            }}
                            onClick={() => {
                                localStorage.removeItem("urjalink-token");
                                window.location.href = "/login";
                            }}
                        >
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>

                    {/* Content Area */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {activeTab === "general" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 32 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 24px 0", paddingBottom: 16, borderBottom: "1px solid var(--card-border)" }}>Personal Information</h2>

                                <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32 }}>
                                    <div style={{ width: 80, height: 80, borderRadius: 100, background: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontSize: 28, fontWeight: 800 }}>
                                        RK
                                    </div>
                                    <div>
                                        <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 13, marginBottom: 8 }}>Upload Photo</button>
                                        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>JPG, GIF or PNG. Max size 2MB.</p>
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8 }}><User size={14} /> Full Name</label>
                                        <input className="form-input" defaultValue="Rohan Kapoor" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8 }}><Mail size={14} /> Email Address</label>
                                        <input className="form-input" defaultValue="rohan.kapoor@example.com" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8 }}><Phone size={14} /> Phone Number</label>
                                        <input className="form-input" defaultValue="+91 98765 43210" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8 }}><MapPin size={14} /> Location</label>
                                        <input className="form-input" defaultValue="Mumbai, India" />
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32 }}>
                                    <button className="btn-primary">Save Changes</button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "systems" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 32 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--card-border)" }}>
                                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Linked Devices & Systems</h2>
                                    <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 13 }}>+ Add System</button>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    {[1].map((system) => (
                                        <div key={system} style={{ padding: 20, background: "var(--hover-bg)", borderRadius: 12, border: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Rohan&apos;s Home Grid</h3>
                                                    <span style={{ fontSize: 10, background: "#10b981", color: "#fff", padding: "2px 6px", borderRadius: 100, fontWeight: 800, textTransform: "uppercase" }}>Online</span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>5kW Solar capacity • Enphase Microinverters</p>
                                            </div>
                                            <button style={{ background: "none", border: "none", color: "var(--warning)", cursor: "pointer" }}>
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "security" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 32 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 24px 0", paddingBottom: 16, borderBottom: "1px solid var(--card-border)" }}>Security Settings</h2>

                                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                    <div className="form-group" style={{ maxWidth: 400 }}>
                                        <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8 }}><Key size={14} /> Current Password</label>
                                        <input className="form-input" type="password" placeholder="••••••••" />
                                    </div>
                                    <div className="form-group" style={{ maxWidth: 400 }}>
                                        <label className="form-label">New Password</label>
                                        <input className="form-input" type="password" placeholder="Min 8 characters" />
                                    </div>
                                    <div className="form-group" style={{ maxWidth: 400 }}>
                                        <label className="form-label">Confirm New Password</label>
                                        <input className="form-input" type="password" placeholder="Min 8 characters" />
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 32 }}>
                                    <button className="btn-primary" style={{ background: "var(--foreground)", color: "var(--background)" }}>Update Password</button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
