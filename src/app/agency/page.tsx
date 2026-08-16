"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wrench, Building2, ClipboardList, BadgeCheck, MapPin, Award, Settings, Star, BarChart2, Phone } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://urja-link-api.onrender.com";

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
            } catch (e) {
                console.warn("Failed to fetch API. Loading fallback mock data...");
                setInstallers([{ id: "INST-01", company_name: "Surya Solutions", contact_person: "Rahul Sharma", phone: "+91-9876543210", email: "rahul@surya.com", city: "Pune", state: "Maharashtra", certification: "MNRE Grade A", specialization: "Residential Rooftop", verified: true, rating: 4.8, total_installations: 1250 }]);
                setInstallations([{ id: "TRK-9021", status: "completed", system_kw: 5, customer: "Amit Patel", city: "Ahmedabad", timeline: [{ step: "Site Inspection", status: "completed", date: "2026-08-01" }, { step: "Installation", status: "completed", date: "2026-08-05" }, { step: "Grid Integration", status: "completed", date: "2026-08-07" }] }]);
            }
            finally { setIsLoading(false); }
        }
        load();
    }, []);

    return (
        <div style={S.page}>
            <header style={S.header}>
                <Link href="/" style={S.back}>← Map</Link>
                <h1 style={S.title}><Wrench size={24} color="var(--warning)" /> Solar Agency Portal</h1>
                <p style={S.sub}>Installer directory, quotation management & installation tracking</p>
            </header>

            {/* Tabs */}
            <div style={S.tabs}>
                {(["installers", "tracking"] as const).map((t) => (
                    <button key={t} onClick={() => setActiveTab(t)}
                        style={{ ...S.tab, ...(activeTab === t ? S.tabActive : {}) }}>
                        {t === "installers" ? <><Building2 size={16} /> Certified Installers</> : <><ClipboardList size={16} /> Installation Tracker</>}
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
                                {inst.verified && <span style={S.verified}><BadgeCheck size={14} /> Verified</span>}
                            </div>
                            <div style={S.row}>
                                <span style={S.lbl}><MapPin size={14} /> Location</span>
                                <span style={S.val}>{inst.city}, {inst.state}</span>
                            </div>
                            <div style={S.row}>
                                <span style={S.lbl}><Award size={14} /> Certification</span>
                                <span style={S.val}>{inst.certification}</span>
                            </div>
                            <div style={S.row}>
                                <span style={S.lbl}><Settings size={14} /> Specialization</span>
                                <span style={S.val}>{inst.specialization}</span>
                            </div>
                            <div style={S.row}>
                                <span style={S.lbl}><Star size={14} /> Rating</span>
                                <span style={{ ...S.val, color: "var(--warning)" }}>{inst.rating}/5.0</span>
                            </div>
                            <div style={S.row}>
                                <span style={S.lbl}><BarChart2 size={14} /> Installations</span>
                                <span style={{ ...S.val, color: "var(--success)" }}>{inst.total_installations.toLocaleString("en-IN")}</span>
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                                <button style={S.btnPrimary}>Get Quotation</button>
                                <button style={S.btnSecondary}><Phone size={14} /> Contact</button>
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
                                            <span style={{ fontSize: 13, fontWeight: 600, color: step.status === "pending" ? "var(--text-muted)" : "var(--foreground)" }}>
                                                {step.step}
                                            </span>
                                            {step.date && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{step.date}</span>}
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
    page: { minHeight: "100vh", background: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-geist-sans), Arial, sans-serif" },
    header: { padding: "100px 32px 20px 32px", borderBottom: "1px solid var(--card-border)" },
    back: { color: "var(--text-secondary)", textDecoration: "none", fontSize: 13, fontWeight: 600, display: "inline-block", marginBottom: 8 },
    title: { fontSize: 26, fontWeight: 700, margin: "4px 0", color: "var(--foreground)", display: "flex", alignItems: "center", gap: 10, letterSpacing: "-0.02em" },
    sub: { color: "var(--text-muted)", fontSize: 14, marginTop: 4 },
    tabs: { display: "flex", gap: 8, padding: "16px 32px" },
    tab: { padding: "8px 16px", borderRadius: 8, border: "1px solid var(--card-border)", background: "transparent", color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "background 0.2s" },
    tabActive: { background: "var(--foreground)", color: "var(--background)", border: "1px solid var(--foreground)" },
    center: { display: "flex", justifyContent: "center", padding: 60 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16, padding: "0 32px 32px" },
    card: { background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: 20 },
    cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
    cardTitle: { fontSize: 17, fontWeight: 700, margin: 0, color: "var(--foreground)" },
    cardSub: { fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" },
    verified: { padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "rgba(34,197,94,0.12)", color: "var(--success)", display: "flex", alignItems: "center", gap: 4 },
    row: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--card-border)" },
    lbl: { fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 },
    val: { fontSize: 13, fontWeight: 600, color: "var(--foreground)" },
    btnPrimary: { flex: 1, padding: "8px", borderRadius: 8, border: "1px solid var(--card-border)", background: "var(--foreground)", color: "var(--background)", fontWeight: 600, fontSize: 13, cursor: "pointer" },
    btnSecondary: { padding: "8px 16px", borderRadius: 8, border: "1px solid var(--card-border)", background: "var(--card-bg)", color: "var(--foreground)", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
    trackList: { padding: "0 32px 32px", display: "flex", flexDirection: "column", gap: 16 },
    trackCard: { background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: 24 },
    trackHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
    statusBadge: { padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 },
    timeline: { display: "flex", flexDirection: "column", gap: 0, paddingLeft: 8 },
    timelineStep: { display: "flex", alignItems: "flex-start", gap: 14, position: "relative" as const, paddingBottom: 20, borderLeft: "2px solid var(--card-border)", marginLeft: 6, paddingLeft: 20 },
    dot: { width: 14, height: 14, borderRadius: "50%", position: "absolute" as const, left: -8, top: 2 },
    stepContent: { display: "flex", flexDirection: "column" as const, gap: 2 },
};
