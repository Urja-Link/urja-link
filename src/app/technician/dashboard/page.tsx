"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Map, Navigation, CheckCircle, Clock, Wrench } from "lucide-react";
import RoleGuard from "@/components/RoleGuard";

const MOCK_JOBS = [
    {
        id: "JOB-UL-991",
        customer: "Rajesh Kumar",
        address: "42 MG Road, Bangalore 560001",
        task: "New Installation: Monocrystalline Pro 400W x 5",
        status: "assigned", // assigned, en_route, working, completed
        time: "10:00 AM Today"
    },
    {
        id: "JOB-UL-882",
        customer: "Priya Sharma",
        address: "71 Indiranagar, Bangalore 560038",
        task: "Maintenance: Nexus Inverter Diagnostics",
        status: "completed",
        time: "Yesterday"
    }
];

export default function TechnicianDashboard() {
    const [jobs, setJobs] = useState(MOCK_JOBS);

    const updateStatus = (jobId: string, newStatus: string) => {
        setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    };

    return (
        <RoleGuard allowedRoles={["Technician", "SuperAdmin"]}>
            <div style={{ minHeight: "100vh", background: "var(--background)", paddingTop: 100, paddingBottom: 60, paddingInline: 20 }}>
                <div style={{ maxWidth: 800, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                        <div>
                            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "var(--foreground)", display: "flex", alignItems: "center", gap: 12 }}>
                                <Wrench size={32} color="var(--accent)" /> Field Operations
                            </h1>
                            <p style={{ color: "var(--text-muted)", marginTop: 8 }}>My Tasks & Dispatches</p>
                        </div>
                        <div style={{ padding: "8px 16px", borderRadius: 100, background: "rgba(16, 185, 129, 0.1)", color: "#10b981", fontWeight: 600, fontSize: 13, border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                            ● Online (Device Linked)
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {jobs.map((job, i) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                className="glass-card" style={{ padding: 24, borderLeft: `4px solid ${job.status === 'completed' ? '#10b981' : job.status === 'assigned' ? '#f59e0b' : 'var(--accent)'}` }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                                    <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{job.time}</div>
                                    <div style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", textTransform: "uppercase" }}>
                                        {job.status.replace("_", " ")}
                                    </div>
                                </div>
                                <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--foreground)", margin: "0 0 4px 0" }}>{job.customer}</h3>
                                <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 6 }}>
                                    <Map size={16} /> {job.address}
                                </p>
                                <div style={{ background: "rgba(56, 189, 248, 0.05)", padding: 16, borderRadius: 12, marginBottom: 20, border: "1px solid var(--card-border)" }}>
                                    <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Work Instructions</div>
                                    <div style={{ color: "var(--foreground)", fontWeight: 500, fontSize: 14 }}>{job.task}</div>
                                </div>

                                {job.status !== "completed" ? (
                                    <div style={{ display: "flex", gap: 12 }}>
                                        {job.status === "assigned" && (
                                            <button onClick={() => updateStatus(job.id, "en_route")} className="btn-primary" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: 12, background: "rgba(56, 189, 248, 0.1)", color: "var(--accent)", border: "1px solid var(--accent)" }}>
                                                <Navigation size={18} /> Mark En-Route
                                            </button>
                                        )}
                                        {job.status === "en_route" && (
                                            <button onClick={() => updateStatus(job.id, "working")} className="btn-primary" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: 12, background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", border: "1px solid #f59e0b" }}>
                                                <Clock size={18} /> Start Work
                                            </button>
                                        )}
                                        {job.status === "working" && (
                                            <button onClick={() => updateStatus(job.id, "completed")} className="btn-primary" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: 12, background: "rgba(16, 185, 129, 0.1)", color: "#10b981", border: "1px solid #10b981" }}>
                                                <CheckCircle size={18} /> Complete Job
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ color: "#10b981", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}>
                                        <CheckCircle size={18} /> Diagnostics Logged & Authorized
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}
