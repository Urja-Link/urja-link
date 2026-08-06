"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, ComposedChart, Area
} from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
import TelemetryMonitor from "../../components/TelemetryMonitor";

interface KPIs {
    total_rooftop_installed_gw: number;
    target_rooftop_gw: number;
    achievement_percent: number;
    total_co2_reduced_mt: number;
    total_subsidy_disbursed_cr: number;
    total_subsidy_budget_cr: number;
    total_beneficiaries: number;
    target_beneficiaries: number;
    pm_surya_ghar_applications: number;
    pm_surya_ghar_approved: number;
    pm_surya_ghar_installed: number;
    avg_system_size_kw: number;
    total_jobs_created: number;
}

interface StateRow {
    state: string;
    installed_mw: number;
    target_mw: number;
    achievement_percent: number;
    gap_mw: number;
    co2_mt: number;
    subsidy_cr: number;
    beneficiaries: number;
    applications_pending: number;
}

function fmt(n: number) { return n.toLocaleString("en-IN"); }

export default function GovernmentDashboard() {
    const [kpis, setKpis] = useState<KPIs | null>(null);
    const [states, setStates] = useState<StateRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [kRes, sRes] = await Promise.all([
                    fetch(`${API_BASE}/api/gov/kpis`),
                    fetch(`${API_BASE}/api/gov/states`),
                ]);
                setKpis(await kRes.json());
                const sData = await sRes.json();
                setStates(sData.states || []);
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        }
        load();
    }, []);

    // Export to Excel
    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(states.map(s => ({
            "State": s.state,
            "Installed (MW)": s.installed_mw,
            "Target (MW)": s.target_mw,
            "Achievement %": s.achievement_percent,
            "Gap (MW)": s.gap_mw,
            "CO2 Offset (MT)": s.co2_mt,
            "Subsidy Disbursed (₹Cr)": s.subsidy_cr,
            "Beneficiaries": s.beneficiaries,
            "Pending Applications": s.applications_pending
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "State Progress");
        XLSX.writeFile(workbook, "Urja-Link_National_Status.xlsx");
    };

    // Export to PDF
    const exportPDF = () => {
        const doc = new jsPDF("landscape");
        doc.text("Urja-Link: State-wise Solar Installation Progress", 14, 15);
        autoTable(doc, {
            head: [["State", "Installed (MW)", "Target", "Achieved (%)", "Gap (MW)", "Subsidy (Cr)"]],
            body: states.map(s => [s.state, s.installed_mw, s.target_mw, s.achievement_percent, s.gap_mw, s.subsidy_cr]),
            startY: 20,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [14, 165, 233] },
        });
        doc.save("Urja-Link_National_Status.pdf");
    };

    if (isLoading) return <div style={S.loading}><p style={{ color: "#94a3b8" }}>Loading dashboard...</p></div>;

    // Sort data for charts
    const topStates = [...states].sort((a, b) => b.installed_mw - a.installed_mw).slice(0, 10);
    const bottomStates = [...states].sort((a, b) => a.achievement_percent - b.achievement_percent).slice(0, 10);

    return (
        <div style={S.page}>
            <header style={S.header}>
                <div>
                    <Link href="/" style={S.back}>← Map</Link>
                    <h1 style={S.title}>🏛️ Government Dashboard</h1>
                    <p style={S.sub}>National rooftop solar progress • PM Surya Ghar Yojana • State-level analytics</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={exportExcel} style={S.btnExportExcel}>📊 Export Excel</button>
                    <button onClick={exportPDF} style={S.btnExportPdf}>📄 Export PDF</button>
                </div>
            </header>

            <TelemetryMonitor />

            {/* National KPIs */}
            {kpis && (
                <div style={S.kpiGrid}>
                    <div style={{ ...S.kpiCard, borderLeft: "4px solid #38bdf8" }}>
                        <span style={S.kpiLabel}>INSTALLED CAPACITY</span>
                        <span style={S.kpiValue}>{kpis.total_rooftop_installed_gw} GW</span>
                        <div style={S.progressBg}>
                            <div style={{ ...S.progressFill, width: `${kpis.achievement_percent}%`, background: "#38bdf8" }} />
                        </div>
                        <span style={S.kpiMeta}>{kpis.achievement_percent}% of {kpis.target_rooftop_gw} GW target</span>
                    </div>
                    <div style={{ ...S.kpiCard, borderLeft: "4px solid #22c55e" }}>
                        <span style={S.kpiLabel}>CO₂ REDUCTION</span>
                        <span style={S.kpiValue}>{kpis.total_co2_reduced_mt} MT</span>
                        <span style={S.kpiMeta}>Annual carbon offset</span>
                    </div>
                    <div style={{ ...S.kpiCard, borderLeft: "4px solid #f59e0b" }}>
                        <span style={S.kpiLabel}>PM SURYA GHAR</span>
                        <span style={S.kpiValue}>{fmt(kpis.pm_surya_ghar_installed)}</span>
                        <div style={S.progressBg}>
                            <div style={{ ...S.progressFill, width: `${(kpis.pm_surya_ghar_installed / kpis.target_beneficiaries * 100).toFixed(0)}%`, background: "#f59e0b" }} />
                        </div>
                        <span style={S.kpiMeta}>{fmt(kpis.pm_surya_ghar_installed)} of {fmt(kpis.target_beneficiaries)} target</span>
                    </div>
                    <div style={{ ...S.kpiCard, borderLeft: "4px solid #8b5cf6" }}>
                        <span style={S.kpiLabel}>SUBSIDY DISBURSED</span>
                        <span style={S.kpiValue}>₹{fmt(kpis.total_subsidy_disbursed_cr)} Cr</span>
                        <div style={S.progressBg}>
                            <div style={{ ...S.progressFill, width: `${(kpis.total_subsidy_disbursed_cr / kpis.total_subsidy_budget_cr * 100).toFixed(0)}%`, background: "#8b5cf6" }} />
                        </div>
                        <span style={S.kpiMeta}>{((kpis.total_subsidy_disbursed_cr / kpis.total_subsidy_budget_cr) * 100).toFixed(1)}% of ₹{fmt(kpis.total_subsidy_budget_cr)} Cr budget</span>
                    </div>
                    <div style={{ ...S.kpiCard, borderLeft: "4px solid #ec4899" }}>
                        <span style={S.kpiLabel}>TOTAL BENEFICIARIES</span>
                        <span style={S.kpiValue}>{fmt(kpis.total_beneficiaries)}</span>
                        <span style={S.kpiMeta}>Avg system: {kpis.avg_system_size_kw} kW</span>
                    </div>
                    <div style={{ ...S.kpiCard, borderLeft: "4px solid #14b8a6" }}>
                        <span style={S.kpiLabel}>GREEN JOBS</span>
                        <span style={S.kpiValue}>{fmt(kpis.total_jobs_created)}</span>
                        <span style={S.kpiMeta}>Created across India</span>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div style={S.chartsWrap}>
                <div style={S.chartBox}>
                    <h3 style={S.chartTitle}>Top 10 States: Installed Capacity vs Target (MW)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={topStates} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="state" tick={{ fill: "#94a3b8", fontSize: 11 }} interval={0} angle={-30} textAnchor="end" />
                            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#fff" }} />
                            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                            <Bar dataKey="installed_mw" name="Installed" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                            <Line type="monotone" dataKey="target_mw" name="Target" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div style={S.chartBox}>
                    <h3 style={S.chartTitle}>Bottom 10 States: Achievement Deficit (%)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={bottomStates} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                            <XAxis type="number" dataKey="achievement_percent" tick={{ fill: "#94a3b8" }} unit="%" />
                            <YAxis type="category" dataKey="state" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#fff" }} />
                            <Bar dataKey="achievement_percent" name="Achievement" fill="#ef4444" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* State Table */}
            <div style={S.tableWrap}>
                <h2 style={S.tableTitle}>📊 Full State Analytics Overview</h2>
                <div style={{ overflowX: "auto", background: "rgba(15,23,42,0.6)", borderRadius: 12, border: "1px solid rgba(56,189,248,0.1)" }}>
                    <table style={S.table}>
                        <thead>
                            <tr>
                                <th style={S.th}>State</th>
                                <th style={S.th}>Installed (MW)</th>
                                <th style={S.th}>Target (MW)</th>
                                <th style={S.th}>Achievement</th>
                                <th style={S.th}>Gap (MW)</th>
                                <th style={S.th}>CO₂ (MT)</th>
                                <th style={S.th}>Subsidy (₹Cr)</th>
                                <th style={S.th}>Beneficiaries</th>
                                <th style={S.th}>Pending Apps</th>
                            </tr>
                        </thead>
                        <tbody>
                            {states.map((s) => (
                                <tr key={s.state} style={S.tr}>
                                    <td style={{ ...S.td, fontWeight: 600 }}>{s.state}</td>
                                    <td style={S.td}>{fmt(s.installed_mw)}</td>
                                    <td style={S.td}>{fmt(s.target_mw)}</td>
                                    <td style={S.td}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div style={{ ...S.miniBar, width: 60 }}>
                                                <div style={{
                                                    height: "100%", borderRadius: 3,
                                                    width: `${Math.min(s.achievement_percent, 100)}%`,
                                                    background: s.achievement_percent >= 50 ? "#22c55e" : s.achievement_percent >= 20 ? "#f59e0b" : "#ef4444",
                                                }} />
                                            </div>
                                            <span style={{ fontSize: 12, color: s.achievement_percent >= 50 ? "#22c55e" : s.achievement_percent >= 20 ? "#f59e0b" : "#ef4444" }}>
                                                {s.achievement_percent}%
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ ...S.td, color: "#ef4444" }}>{fmt(s.gap_mw)}</td>
                                    <td style={{ ...S.td, color: "#22c55e" }}>{s.co2_mt}</td>
                                    <td style={S.td}>₹{fmt(s.subsidy_cr)}</td>
                                    <td style={S.td}>{fmt(s.beneficiaries)}</td>
                                    <td style={{ ...S.td, color: "#f59e0b" }}>{fmt(s.applications_pending)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const S: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#0a0f1a", color: "#e8ecf1", fontFamily: "Arial, sans-serif" },
    loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0a0f1a" },
    header: { padding: "20px 32px", borderBottom: "1px solid rgba(56,189,248,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" },
    back: { color: "#38bdf8", textDecoration: "none", fontSize: 13, fontWeight: 600 },
    title: { fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg,#0ea5e9,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "4px 0" },
    sub: { color: "#64748b", fontSize: 14 },
    btnExportExcel: { padding: "8px 16px", borderRadius: 8, background: "#059669", color: "white", fontWeight: 600, border: "none", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 },
    btnExportPdf: { padding: "8px 16px", borderRadius: 8, background: "#dc2626", color: "white", fontWeight: 600, border: "none", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 },
    kpiGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, padding: "20px 32px" },
    kpiCard: { background: "rgba(15,23,42,0.85)", borderRadius: 12, padding: "18px 20px", border: "1px solid rgba(56,189,248,0.1)", display: "flex", flexDirection: "column" },
    kpiLabel: { fontSize: 11, color: "#94a3b8", letterSpacing: 1, marginBottom: 6 },
    kpiValue: { fontSize: 28, fontWeight: 800, color: "#e8ecf1" },
    kpiMeta: { fontSize: 12, color: "#64748b", marginTop: 6 },
    progressBg: { height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginTop: 8 },
    progressFill: { height: "100%", borderRadius: 3, transition: "width 0.8s ease" },
    chartsWrap: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: "0 32px 20px" },
    chartBox: { background: "rgba(15,23,42,0.6)", borderRadius: 12, padding: "20px", border: "1px solid rgba(56,189,248,0.1)" },
    chartTitle: { fontSize: 15, fontWeight: 700, color: "#e8ecf1", marginBottom: 16 },
    tableWrap: { padding: "8px 32px 32px" },
    tableTitle: { fontSize: 18, fontWeight: 700, color: "#e8ecf1", marginBottom: 14 },
    table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
    th: { textAlign: "left" as const, padding: "14px 16px", borderBottom: "1px solid rgba(56,189,248,0.2)", color: "#94a3b8", fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" as const },
    tr: { borderBottom: "1px solid rgba(255,255,255,0.04)" },
    td: { padding: "12px 16px", fontSize: 13 },
    miniBar: { height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" },
};
