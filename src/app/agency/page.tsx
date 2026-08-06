"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface Installer {
    id: string;
    company_name: string;
    contact_person: string;
    phone: string;
    email: string;
    city: string;
    state: string;
    certification: string;
    specialization: string;
    verified: boolean;
    rating: number;
    total_installations: number;
}

interface Installation {
    id: string;
    status: string;
    system_kw?: number;
    customer?: string;
    city?: string;
    timeline: { step: string; status: string; date: string | null }[];
}

export default function AgencyPage() {
    const [installers, setInstallers] = useState<Installer[]>([]);
    const [installations, setInstallations] = useState<Installation[]>([]);
    const [activeTab, setActiveTab] = useState<"installers" | "tracking">("installers");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [iRes, tRes] = await Promise.all([
                    fetch(`${API_BASE}/api/agency/installers`),
                    fetch(`${API_BASE}/api/agency/installations`),
                ]);
                const iData = await iRes.json();
                const tData = await tRes.json();
                setInstallers(iData.installers || []);
                setInstallations(tData.installations || []);
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        }
        load();
    }, []);

    return (
        <div style={S.page}>
            <header style={S.header}>
                <Link href="/" style={S.back}>← Map</Link>
                <h1 style={S.title}>🔧 Solar Agency Portal</h1>
                <p style={S.sub}>Installer directory, quotation management & installation tracking</p>
            </header>

            {/* Tabs */}
            <div style={S.tabs}>
                {(["installers", "tracking"] as const).map((t) => (
                    <button key={t} onClick={() => setActiveTab(t)}
                        style={{ ...S.tab, ...(activeTab === t ? S.tabActive : {}) }}>
                        {t === "installers" ? "🏢 Certified Installers" : "📋 Installation Tracker"}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div style={S.center}><p style={{ color: "#94a3b8" }}>Loading...</p></div>
            ) : activeTab === "installers" ? (
                /* Installer Cards */
                <div style={S.grid}>
                    {installers.map((inst) => (
                        <div key={inst.id} style={S.card}>
                            <div style={S.cardTop}>
                                <div>
                                    <h3 style={S.cardTitle}>{inst.company_name}</h3>
                                    <p style={S.cardSub}>{inst.contact_person}</p>
                                </div>
                                {inst.verified && <span style={S.verified}>✓ Verified</span>}
                            </div>
                            <div style={S.row}>
                                <span style={S.lbl}>📍 Location</span>
                                <span style={S.val}>{inst.city}, {inst.state}</span>
                            </div>
                            <div style={S.row}>
                                <span style={S.lbl}>🏅 Certification</span>
                                <span style={S.val}>{inst.certification}</span>
                            </div>
                            <div style={S.row}>
                                <span style={S.lbl}>⚙️ Specialization</span>
                                <span style={S.val}>{inst.specialization}</span>
                            </div>
                            <div style={S.row}>
                                <span style={S.lbl}>⭐ Rating</span>
                                <span style={{ ...S.val, color: "#f59e0b" }}>{inst.rating}/5.0</span>
                            </div>
                            <div style={S.row}>
                                <span style={S.lbl}>📊 Installations</span>
                                <span style={{ ...S.val, color: "#22c55e" }}>{inst.total_installations.toLocaleString("en-IN")}</span>
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                                <button style={S.btnPrimary}>Get Quotation</button>
                                <button style={S.btnSecondary}>📞 Contact</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Installation Tracking */
                <div style={S.trackList}>
                    {installations.map((inst) => (
                        <div key={inst.id} style={S.trackCard}>
                            <div style={S.trackHeader}>
                                <div>
                                    <h3 style={S.cardTitle}>{inst.id}</h3>
                                    <p style={S.cardSub}>{inst.customer} • {inst.city} • {inst.system_kw}kW</p>
                                </div>
                                <span style={{
                                    ...S.statusBadge,
                                    background: inst.status === "completed" ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
                                    color: inst.status === "completed" ? "#22c55e" : "#f59e0b",
                                }}>
                                    {inst.status.replace("_", " ").toUpperCase()}
                                </span>
                            </div>
                            {/* Timeline */}
                            <div style={S.timeline}>
                                {inst.timeline.map((step, i) => (
                                    <div key={i} style={S.timelineStep}>
                                        <div style={{
                                            ...S.dot,
                                            background: step.status === "completed" ? "#22c55e"
                                                : step.status === "in_progress" ? "#f59e0b" : "#334155",
                                            boxShadow: step.status === "in_progress" ? "0 0 8px rgba(245,158,11,0.5)" : "none",
                                        }} />
                                        <div style={S.stepContent}>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: step.status === "pending" ? "#64748b" : "#e8ecf1" }}>
                                                {step.step}
                                            </span>
                                            {step.date && <span style={{ fontSize: 11, color: "#64748b" }}>{step.date}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
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
    tabs: { display: "flex", gap: 8, padding: "16px 32px" },
    tab: { padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(56,189,248,0.15)", background: "transparent", color: "#94a3b8", fontSize: 14, fontWeight: 600, cursor: "pointer" },
    tabActive: { background: "linear-gradient(135deg,#0ea5e9,#8b5cf6)", color: "white", borderColor: "transparent" },
    center: { display: "flex", justifyContent: "center", padding: 60 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16, padding: "0 32px 32px" },
    card: { background: "rgba(15,23,42,0.7)", border: "1px solid rgba(56,189,248,0.1)", borderRadius: 14, padding: 20 },
    cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
    cardTitle: { fontSize: 17, fontWeight: 700, margin: 0 },
    cardSub: { fontSize: 12, color: "#64748b", margin: "2px 0 0" },
    verified: { padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "rgba(34,197,94,0.12)", color: "#22c55e" },
    row: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" },
    lbl: { fontSize: 12, color: "#94a3b8" },
    val: { fontSize: 13, fontWeight: 600 },
    btnPrimary: { flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#0ea5e9,#8b5cf6)", color: "white", fontWeight: 600, fontSize: 13, cursor: "pointer" },
    btnSecondary: { padding: "10px 16px", borderRadius: 8, border: "1px solid rgba(56,189,248,0.2)", background: "transparent", color: "#38bdf8", fontWeight: 600, fontSize: 13, cursor: "pointer" },
    trackList: { padding: "0 32px 32px", display: "flex", flexDirection: "column", gap: 16 },
    trackCard: { background: "rgba(15,23,42,0.7)", border: "1px solid rgba(56,189,248,0.1)", borderRadius: 14, padding: 24 },
    trackHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
    statusBadge: { padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 },
    timeline: { display: "flex", flexDirection: "column", gap: 0, paddingLeft: 8 },
    timelineStep: { display: "flex", alignItems: "flex-start", gap: 14, position: "relative" as const, paddingBottom: 20, borderLeft: "2px solid #1e293b", marginLeft: 6, paddingLeft: 20 },
    dot: { width: 14, height: 14, borderRadius: "50%", position: "absolute" as const, left: -8, top: 2 },
    stepContent: { display: "flex", flexDirection: "column" as const, gap: 2 },
};
