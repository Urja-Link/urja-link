"use client";

import { motion } from "framer-motion";
import {
    Building2, Wrench, Users, LineChart, Target,
    ArrowUpRight, Clock, Plus, Zap, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const KPI_DATA = [
    { label: "Active Installs", value: "34", change: "+12%", trend: "up", icon: Zap },
    { label: "Technicians", value: "128", change: "+4", trend: "up", icon: Users },
    { label: "Revenue (MTD)", value: "₹4.2M", change: "+18%", trend: "up", icon: LineChart },
    { label: "Service SLAs", value: "99.4%", change: "-0.2%", trend: "down", icon: Target },
];

const RECENT_PROJECTS = [
    { id: "PRJ-901", name: "Metro Station Microgrid", capacity: "250kW", status: "In Progress", progress: 65, date: "2026-08-01" },
    { id: "PRJ-902", name: "Tech Park Phase 3", capacity: "1.2MW", status: "Planning", progress: 15, date: "2026-08-03" },
    { id: "PRJ-884", name: "Residential Complex A", capacity: "50kW", status: "Completed", progress: 100, date: "2026-07-28" },
    { id: "PRJ-885", name: "Hospital Rooftop Array", capacity: "100kW", status: "In Progress", progress: 80, date: "2026-08-05" },
];

export default function CompanyDashboard() {
    return (
        <div className="page-container">
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--foreground)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Building2 size={24} color="var(--background)" />
                            </div>
                            <div>
                                <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--foreground)", margin: 0 }}>Tata Solar Installers</h1>
                                <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>Enterprise Partner Level I</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                        <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Plus size={16} /> New Project
                        </button>
                    </div>
                </div>

                {/* KPIs */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
                    {KPI_DATA.map((kpi, idx) => {
                        const Icon = kpi.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card"
                                style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div style={{ padding: 10, background: "var(--hover-bg)", borderRadius: 10 }}>
                                        <Icon size={20} color="var(--foreground)" />
                                    </div>
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 4,
                                        color: kpi.trend === "up" ? "#10b981" : "#ef4444",
                                        fontSize: 13, fontWeight: 600, background: "var(--hover-bg)", padding: "4px 8px", borderRadius: 100
                                    }}>
                                        {kpi.change}
                                    </div>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 32, fontWeight: 700, color: "var(--foreground)", margin: "0 0 4px 0" }}>{kpi.value}</h3>
                                    <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0, fontWeight: 500 }}>{kpi.label}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Main Content Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

                    {/* Active Projects */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: 24 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Active Projects</h2>
                            <Link href="/company/projects" style={{ fontSize: 14, color: "var(--warning)", textDecoration: "none", fontWeight: 600 }}>View All</Link>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {RECENT_PROJECTS.map((proj) => (
                                <div key={proj.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, background: "var(--hover-bg)", borderRadius: 12, border: "1px solid var(--card-border)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--card-bg)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--card-border)" }}>
                                            {proj.progress === 100 ? <CheckCircle2 size={18} color="#10b981" /> : <Wrench size={18} color="var(--foreground)" />}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: "0 0 4px 0", fontWeight: 600, color: "var(--foreground)" }}>{proj.name}</h4>
                                            <div style={{ display: "flex", gap: 12, fontSize: 13, color: "var(--text-secondary)" }}>
                                                <span>{proj.id}</span>
                                                <span style={{ color: "var(--card-border)" }}>•</span>
                                                <span>{proj.capacity}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ width: 140 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
                                            <span>{proj.status}</span>
                                            <span>{proj.progress}%</span>
                                        </div>
                                        <div style={{ height: 6, background: "var(--card-border)", borderRadius: 100, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${proj.progress}%`, background: proj.progress === 100 ? "#10b981" : "var(--warning)", borderRadius: 100 }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Actions & Tech Status */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card" style={{ padding: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 20px 0" }}>Quick Actions</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <button style={{ width: "100%", padding: 16, background: "var(--hover-bg)", border: "1px solid var(--card-border)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--foreground)", cursor: "pointer", fontWeight: 600, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--card-border)"} onMouseLeave={e => e.currentTarget.style.background = "var(--hover-bg)"}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <Users size={18} color="var(--warning)" /> Manage Team
                                    </div>
                                    <ArrowUpRight size={16} color="var(--text-secondary)" />
                                </button>
                                <button style={{ width: "100%", padding: 16, background: "var(--hover-bg)", border: "1px solid var(--card-border)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--foreground)", cursor: "pointer", fontWeight: 600, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--card-border)"} onMouseLeave={e => e.currentTarget.style.background = "var(--hover-bg)"}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <LineChart size={18} color="var(--warning)" /> Performance Reports
                                    </div>
                                    <ArrowUpRight size={16} color="var(--text-secondary)" />
                                </button>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card" style={{ padding: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 20px 0" }}>Fleet Status</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>Active in Field</span>
                                    <span style={{ fontSize: 14, color: "var(--foreground)", fontWeight: 700 }}>86 Techs</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>Available (Standby)</span>
                                    <span style={{ fontSize: 14, color: "var(--foreground)", fontWeight: 700 }}>42 Techs</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>On Leave / Traning</span>
                                    <span style={{ fontSize: 14, color: "var(--foreground)", fontWeight: 700 }}>12 Techs</span>
                                </div>
                                <div style={{ height: 1, background: "var(--card-border)", margin: "4px 0" }} />
                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)" }}>
                                    <Clock size={14} /> Last updated: Just now
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
}
