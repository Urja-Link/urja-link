"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Wrench, CloudFog, Zap, TrendingDown, Rocket } from "lucide-react";
import { formatPercentage, formatPower } from "@/lib/utils";

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
    systemContext?: {
        energyLossKw: number;
        inverterTempC: number;
        panelEfficiencyPct: number;
    };
    created_at: string;
}

function priorityColor(p: string) {
    switch (p) { case "critical": return "var(--danger)"; case "high": return "var(--warning)"; case "medium": return "var(--foreground)"; default: return "var(--success)"; }
}

function issueIcon(t: string, size: number = 24) {
    switch (t) { case "dust": return <CloudFog size={size} />; case "damage": return <Zap size={size} />; case "performance_drop": return <TrendingDown size={size} />; case "inverter_fault": return <Zap size={size} />; default: return <Wrench size={size} />; }
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
            } catch (e) {
                console.warn("Failed to fetch API. Loading fallback mock data...");
                setRequests([{ id: "REQ-405", installation_id: "TRK-8812", issue_type: "inverter_fault", description: "Inverter reporting string voltage drop in String B.", priority: "critical", status: "open", assigned_technician: null, ai_diagnosis: { severity: "critical", estimated_loss_percent: 45, recommendation: "Immediate dispatch required. Potential diode failure detected in String B combiner box.", estimated_cost_inr: 8500 }, systemContext: { energyLossKw: 12.5, inverterTempC: 78, panelEfficiencyPct: 0.82 }, created_at: "2026-08-07T14:30:00Z" }]);
            }
            finally { setIsLoading(false); }
        }
        load();
    }, []);

    return (
        <div style={S.page}>
            <header style={S.header}>
                <Link href="/" style={S.back}>← Map</Link>
                <h1 style={S.title}><Wrench size={32} style={{ marginRight: 10 }} /> Maintenance & AI Diagnostics</h1>
                <p style={S.sub}>AI-powered panel monitoring, fault detection, and technician dispatch</p>
            </header>

            {isLoading ? (
                <div style={S.center}><p style={{ color: "#94a3b8" }}>Loading maintenance data...</p></div>
            ) : (
                <div className="responsive-grid-split" style={{ height: "calc(100vh - 100px)" }}>
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
                                        <span>{issueIcon(r.issue_type, 24)}</span>
                                        <div>
                                            <h3 style={S.cardTitle}>{r.id}</h3>
                                            <span style={S.cardSub}>{r.issue_type.replace("_", " ").toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <span style={{ ...S.badge, background: "var(--card-bg)", border: `1px solid ${priorityColor(r.priority)}`, color: priorityColor(r.priority) }}>
                                        {r.priority.toUpperCase()}
                                    </span>
                                </div>
                                <p style={{ fontSize: 13, color: "#94a3b8", margin: "8px 0 0" }}>{r.description}</p>
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "var(--text-secondary)" }}>
                                    <span>Install: {r.installation_id}</span>
                                    <span style={{ color: r.status === "open" ? "var(--warning)" : "var(--success)" }}>{r.status.toUpperCase()}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Detail / AI Diagnosis Panel */}
                    <div style={S.detail}>
                        {selected ? (
                            <>
                                <h2 style={S.detailTitle}><span style={{ marginRight: 10 }}>{issueIcon(selected.issue_type, 28)}</span> {selected.issue_type.replace("_", " ").toUpperCase()}</h2>
                                <span style={{ ...S.badgeLg, background: "var(--card-bg)", border: `1px solid ${priorityColor(selected.priority)}`, color: priorityColor(selected.priority) }}>
                                    {selected.priority.toUpperCase()} PRIORITY
                                </span>

                                {/* AI Diagnosis */}
                                <div style={S.aiBox}>
                                    <h3 style={S.aiTitle}><Bot size={20} style={{ marginRight: 8 }} /> AI Diagnosis</h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 16, marginTop: 12 }}>
                                        <div style={{ background: "rgba(15,23,42,0.4)", borderRadius: 8, padding: 12, border: "1px solid var(--card-border)" }}>
                                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Est. Energy Loss</span>
                                            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--warning)", marginTop: 4 }}>{formatPower(selected.systemContext?.energyLossKw || 0)}</p>
                                        </div>
                                        <div style={{ background: "rgba(15,23,42,0.4)", borderRadius: 8, padding: 12, border: "1px solid var(--card-border)" }}>
                                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Inverter Temp</span>
                                            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)", marginTop: 4 }}>{selected.systemContext?.inverterTempC || 0}°C</p>
                                        </div>
                                        <div style={{ background: "rgba(15,23,42,0.4)", borderRadius: 8, padding: 12, border: "1px solid var(--card-border)" }}>
                                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Panel Efficiency</span>
                                            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--success)", marginTop: 4 }}>{formatPercentage(selected.systemContext?.panelEfficiencyPct || 0)}</p>
                                        </div>
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
                                        <span style={{ ...S.metaVal, color: selected.status === "open" ? "var(--warning)" : "var(--success)" }}>
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

                                <button style={S.dispatchBtn}><Rocket size={18} style={{ marginRight: 8 }} /> Dispatch Technician</button>
                            </>
                        ) : (
                            <div style={S.empty}>
                                <p style={{ fontSize: 48, margin: 0 }}><Wrench size={48} color="var(--text-muted)" /></p>
                                <h3 style={{ color: "var(--foreground)", margin: "8px 0" }}>Select a Request</h3>
                                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Click on a maintenance request to view AI diagnosis and dispatch technicians</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const S: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-geist-sans), Arial, sans-serif" },
    header: { padding: "100px 32px 20px 32px", borderBottom: "1px solid var(--card-border)" },
    back: { color: "var(--foreground)", textDecoration: "none", fontSize: 13, fontWeight: 600 },
    title: { fontSize: 26, fontWeight: 800, color: "var(--foreground)", display: "flex", alignItems: "center", margin: "4px 0" },
    sub: { color: "var(--text-muted)", fontSize: 14 },
    center: { display: "flex", justifyContent: "center", padding: 60 },
    list: { overflowY: "auto" as const, padding: "16px 16px 16px 32px", display: "flex", flexDirection: "column", gap: 12 },
    card: { background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 16, cursor: "pointer", textAlign: "left" as const, width: "100%", color: "var(--foreground)" },
    cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
    cardTitle: { fontSize: 15, fontWeight: 700, margin: 0 },
    cardSub: { fontSize: 11, color: "var(--text-muted)" },
    badge: { padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 0.5 },
    badgeLg: { display: "inline-block", padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, marginBottom: 20 },
    detail: { borderLeft: "1px solid var(--card-border)", padding: 32, overflowY: "auto" as const },
    detailTitle: { fontSize: 24, fontWeight: 800, margin: "0 0 12px", display: "flex", alignItems: "center" },
    aiBox: { background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 18, marginBottom: 24 },
    aiTitle: { fontSize: 15, fontWeight: 700, color: "var(--foreground)", display: "flex", alignItems: "center", margin: "0 0 12px" },
    aiRow: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--card-border)", fontSize: 13 },
    aiLbl: { color: "var(--text-secondary)" },
    aiText: { fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, margin: "12px 0 0" },
    metaGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 },
    metaCard: { padding: "12px 14px", background: "var(--card-bg)", borderRadius: 8, border: "1px solid var(--card-border)", display: "flex", flexDirection: "column" },
    metaLbl: { fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 4 },
    metaVal: { fontSize: 14, fontWeight: 600, color: "var(--foreground)" },
    dispatchBtn: { width: "100%", padding: 14, borderRadius: 10, border: "1px solid var(--card-border)", background: "var(--foreground)", color: "var(--background)", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
    empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" as const },
};
