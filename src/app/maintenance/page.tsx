"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface MaintReq {
    id: string;
    installation_id: string;
    issue_type: string;
    description: string;
    priority: string;
    status: string;
    assigned_technician: string | null;
    ai_diagnosis: {
        severity: string;
        estimated_loss_percent: number;
        recommendation: string;
        estimated_cost_inr: number;
    };
    created_at: string;
}

function priorityColor(p: string) {
    switch (p) { case "critical": return "#ef4444"; case "high": return "#f59e0b"; case "medium": return "#3b82f6"; default: return "#22c55e"; }
}

function issueIcon(t: string) {
    switch (t) { case "dust": return "🌫️"; case "damage": return "💥"; case "performance_drop": return "📉"; case "inverter_fault": return "⚡"; default: return "🔧"; }
}

export default function MaintenancePage() {
    const [requests, setRequests] = useState<MaintReq[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState<MaintReq | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`${API_BASE}/api/agency/maintenance`);
                const data = await res.json();
                setRequests(data.maintenance_requests || []);
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        }
        load();
    }, []);

    return (
        <div style={S.page}>
            <header style={S.header}>
                <Link href="/" style={S.back}>← Map</Link>
                <h1 style={S.title}>🛠️ Maintenance & AI Diagnostics</h1>
                <p style={S.sub}>AI-powered panel monitoring, fault detection, and technician dispatch</p>
            </header>

            {isLoading ? (
                <div style={S.center}><p style={{ color: "#94a3b8" }}>Loading maintenance data...</p></div>
            ) : (
                <div style={S.content}>
                    {/* Request List */}
                    <div style={S.list}>
                        {requests.map((r) => (
                            <button key={r.id} onClick={() => setSelected(r)}
                                style={{
                                    ...S.card,
                                    borderColor: selected?.id === r.id ? priorityColor(r.priority) : "rgba(56,189,248,0.1)",
                                }}>
                                <div style={S.cardTop}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 24 }}>{issueIcon(r.issue_type)}</span>
                                        <div>
                                            <h3 style={S.cardTitle}>{r.id}</h3>
                                            <span style={S.cardSub}>{r.issue_type.replace("_", " ").toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <span style={{ ...S.badge, background: `${priorityColor(r.priority)}20`, color: priorityColor(r.priority) }}>
                                        {r.priority.toUpperCase()}
                                    </span>
                                </div>
                                <p style={{ fontSize: 13, color: "#94a3b8", margin: "8px 0 0" }}>{r.description}</p>
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "#64748b" }}>
                                    <span>Install: {r.installation_id}</span>
                                    <span style={{ color: r.status === "open" ? "#f59e0b" : "#22c55e" }}>{r.status.toUpperCase()}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Detail / AI Diagnosis Panel */}
                    <div style={S.detail}>
                        {selected ? (
                            <>
                                <h2 style={S.detailTitle}>{issueIcon(selected.issue_type)} {selected.issue_type.replace("_", " ").toUpperCase()}</h2>
                                <span style={{ ...S.badgeLg, background: `${priorityColor(selected.priority)}20`, color: priorityColor(selected.priority) }}>
                                    {selected.priority.toUpperCase()} PRIORITY
                                </span>

                                {/* AI Diagnosis */}
                                <div style={S.aiBox}>
                                    <h3 style={S.aiTitle}>🤖 AI Diagnosis</h3>
                                    <div style={S.aiRow}>
                                        <span style={S.aiLbl}>Severity</span>
                                        <span style={{ fontWeight: 700, color: priorityColor(selected.ai_diagnosis.severity) }}>
                                            {selected.ai_diagnosis.severity.toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={S.aiRow}>
                                        <span style={S.aiLbl}>Estimated Output Loss</span>
                                        <span style={{ fontWeight: 700, color: "#ef4444" }}>{selected.ai_diagnosis.estimated_loss_percent}%</span>
                                    </div>
                                    <div style={S.aiRow}>
                                        <span style={S.aiLbl}>Estimated Repair Cost</span>
                                        <span style={{ fontWeight: 700, color: "#f59e0b" }}>₹{selected.ai_diagnosis.estimated_cost_inr.toLocaleString("en-IN")}</span>
                                    </div>
                                    <p style={S.aiText}>{selected.ai_diagnosis.recommendation}</p>
                                </div>

                                {/* Details */}
                                <div style={S.metaGrid}>
                                    <div style={S.metaCard}>
                                        <span style={S.metaLbl}>Installation ID</span>
                                        <span style={S.metaVal}>{selected.installation_id}</span>
                                    </div>
                                    <div style={S.metaCard}>
                                        <span style={S.metaLbl}>Status</span>
                                        <span style={{ ...S.metaVal, color: selected.status === "open" ? "#f59e0b" : "#22c55e" }}>
                                            {selected.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={S.metaCard}>
                                        <span style={S.metaLbl}>Technician</span>
                                        <span style={S.metaVal}>{selected.assigned_technician || "Not Assigned"}</span>
                                    </div>
                                    <div style={S.metaCard}>
                                        <span style={S.metaLbl}>Reported</span>
                                        <span style={S.metaVal}>{selected.created_at}</span>
                                    </div>
                                </div>

                                <button style={S.dispatchBtn}>🚀 Dispatch Technician</button>
                            </>
                        ) : (
                            <div style={S.empty}>
                                <p style={{ fontSize: 48 }}>🛠️</p>
                                <h3 style={{ color: "#e8ecf1", margin: "8px 0" }}>Select a Request</h3>
                                <p style={{ color: "#64748b", fontSize: 14 }}>Click on a maintenance request to view AI diagnosis and dispatch technicians</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const S: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#0a0f1a", color: "#e8ecf1", fontFamily: "Arial, sans-serif" },
    header: { padding: "20px 32px", borderBottom: "1px solid rgba(56,189,248,0.1)" },
    back: { color: "#38bdf8", textDecoration: "none", fontSize: 13, fontWeight: 600 },
    title: { fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg,#0ea5e9,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "4px 0" },
    sub: { color: "#64748b", fontSize: 14 },
    center: { display: "flex", justifyContent: "center", padding: 60 },
    content: { display: "grid", gridTemplateColumns: "420px 1fr", height: "calc(100vh - 100px)" },
    list: { overflowY: "auto" as const, padding: "16px 16px 16px 32px", display: "flex", flexDirection: "column", gap: 12 },
    card: { background: "rgba(15,23,42,0.7)", border: "1px solid rgba(56,189,248,0.1)", borderRadius: 12, padding: 16, cursor: "pointer", textAlign: "left" as const, width: "100%", color: "#e8ecf1" },
    cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
    cardTitle: { fontSize: 15, fontWeight: 700, margin: 0 },
    cardSub: { fontSize: 11, color: "#64748b" },
    badge: { padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 0.5 },
    badgeLg: { display: "inline-block", padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, marginBottom: 20 },
    detail: { borderLeft: "1px solid rgba(56,189,248,0.1)", padding: 32, overflowY: "auto" as const },
    detailTitle: { fontSize: 24, fontWeight: 800, margin: "0 0 12px" },
    aiBox: { background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 12, padding: 18, marginBottom: 24 },
    aiTitle: { fontSize: 15, fontWeight: 700, color: "#38bdf8", margin: "0 0 12px" },
    aiRow: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13 },
    aiLbl: { color: "#94a3b8" },
    aiText: { fontSize: 14, color: "#cbd5e1", lineHeight: 1.6, margin: "12px 0 0" },
    metaGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 },
    metaCard: { padding: "12px 14px", background: "rgba(15,23,42,0.6)", borderRadius: 8, border: "1px solid rgba(56,189,248,0.06)", display: "flex", flexDirection: "column" },
    metaLbl: { fontSize: 10, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 4 },
    metaVal: { fontSize: 14, fontWeight: 600 },
    dispatchBtn: { width: "100%", padding: 14, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0ea5e9,#8b5cf6)", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer" },
    empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" as const },
};
