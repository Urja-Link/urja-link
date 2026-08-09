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
import { Building2, Download, Table2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
import LiveOperationsPanel from "../../components/LiveOperationsPanel";

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
                    <h1 style={S.title}><Building2 size={24} color="var(--warning)" /> Government Data</h1>
                    <p style={S.sub}>National rooftop solar progress • PM Surya Ghar Yojana • State-level analytics</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={exportExcel} style={S.btnExportExcel}><Table2 size={16} /> Export Excel</button>
                    <button onClick={exportPDF} style={S.btnExportPdf}><Download size={16} /> Export PDF</button>
                </div>
            </header>

            <LiveOperationsPanel />

            {/* National KPIs */}
            {kpis && (
                <div style={S.kpiGrid}>
                    <div style={S.kpiCard}>
                        <span style={S.kpiLabel}>INSTALLED CAPACITY</span>
                        <span style={S.kpiValue}>{kpis.total_rooftop_installed_gw} GW</span>
                        <div style={S.progressBg}>
                            <div style={{ ...S.progressFill, width: `${kpis.achievement_percent}%` }} />
                        </div>
                        <span style={S.kpiMeta}>{kpis.achievement_percent}% of {kpis.target_rooftop_gw} GW target</span>
                    </div>
                    <div style={S.kpiCard}>
                        <span style={S.kpiLabel}>CO₂ REDUCTION</span>
                        <span style={S.kpiValue}>{kpis.total_co2_reduced_mt} MT</span>
                        <span style={S.kpiMeta}>Annual carbon offset</span>
                    </div>
                    <div style={{ ...S.kpiCard, borderColor: "var(--warning)" }}>
                        <span style={S.kpiLabel}>PM SURYA GHAR</span>
                        <span style={S.kpiValue}>{fmt(kpis.pm_surya_ghar_installed)}</span>
                        <div style={S.progressBg}>
                            <div style={{ ...S.progressFill, width: `${(kpis.pm_surya_ghar_installed / kpis.target_beneficiaries * 100).toFixed(0)}%` }} />
                        </div>
                        <span style={S.kpiMeta}>{fmt(kpis.pm_surya_ghar_installed)} of {fmt(kpis.target_beneficiaries)} target</span>
                    </div>
                    <div style={S.kpiCard}>
                        <span style={S.kpiLabel}>SUBSIDY DISBURSED</span>
                        <span style={S.kpiValue}>₹{fmt(kpis.total_subsidy_disbursed_cr)} Cr</span>
                        <div style={S.progressBg}>
                            <div style={{ ...S.progressFill, width: `${(kpis.total_subsidy_disbursed_cr / kpis.total_subsidy_budget_cr * 100).toFixed(0)}%` }} />
                        </div>
                        <span style={S.kpiMeta}>{((kpis.total_subsidy_disbursed_cr / kpis.total_subsidy_budget_cr) * 100).toFixed(1)}% of ₹{fmt(kpis.total_subsidy_budget_cr)} Cr budget</span>
                    </div>
                    <div style={S.kpiCard}>
                        <span style={S.kpiLabel}>TOTAL BENEFICIARIES</span>
                        <span style={S.kpiValue}>{fmt(kpis.total_beneficiaries)}</span>
                        <span style={S.kpiMeta}>Avg system: {kpis.avg_system_size_kw} kW</span>
                    </div>
                    <div style={S.kpiCard}>
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
                            <XAxis dataKey="state" tick={{ fill: "var(--text-muted)", fontSize: 11 }} interval={0} angle={-30} textAnchor="end" />
                            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: "var(--card-bg)", borderColor: "var(--card-border)", borderRadius: 8, color: "var(--foreground)" }} />
                            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                            <Bar dataKey="installed_mw" name="Installed" fill="var(--text-secondary)" radius={[4, 4, 0, 0]} />
                            <Line type="monotone" dataKey="target_mw" name="Target" stroke="var(--warning)" strokeWidth={2} dot={{ r: 4 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div style={S.chartBox}>
                    <h3 style={S.chartTitle}>Bottom 10 States: Achievement Deficit (%)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={bottomStates} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                            <XAxis type="number" dataKey="achievement_percent" tick={{ fill: "var(--text-muted)" }} unit="%" />
                            <YAxis type="category" dataKey="state" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: "var(--card-bg)", borderColor: "var(--card-border)", borderRadius: 8, color: "var(--foreground)" }} />
                            <Bar dataKey="achievement_percent" name="Achievement" fill="#ef4444" radius={[0, 4, 4, 0]} opacity={0.8} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* State Table */}
            <div style={S.tableWrap}>
                <h2 style={S.tableTitle}>State Analytics Overview</h2>
                <div style={{ overflowX: "auto", background: "var(--card-bg)", borderRadius: 12, border: "1px solid var(--card-border)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
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
                                                    background: s.achievement_percent >= 50 ? "var(--success)" : s.achievement_percent >= 20 ? "var(--warning)" : "var(--danger)",
                                                }} />
                                            </div>
                                            <span style={{ fontSize: 12, color: s.achievement_percent >= 50 ? "var(--success)" : s.achievement_percent >= 20 ? "var(--warning)" : "var(--danger)" }}>
                                                {s.achievement_percent}%
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ ...S.td, color: "var(--danger)" }}>{fmt(s.gap_mw)}</td>
                                    <td style={{ ...S.td, color: "var(--success)" }}>{s.co2_mt}</td>
                                    <td style={S.td}>₹{fmt(s.subsidy_cr)}</td>
                                    <td style={S.td}>{fmt(s.beneficiaries)}</td>
                                    <td style={{ ...S.td, color: "var(--warning)" }}>{fmt(s.applications_pending)}</td>
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
    page: { minHeight: "100vh", background: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-geist-sans), Arial, sans-serif" },
    loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "var(--background)" },
    header: { padding: "100px 32px 20px 32px", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" },
    back: { color: "var(--accent)", textDecoration: "none", fontSize: 13, fontWeight: 600 },
    title: { fontSize: 26, fontWeight: 700, margin: "4px 0", color: "var(--foreground)", display: "flex", alignItems: "center", gap: 10, letterSpacing: "-0.02em" },
    sub: { color: "var(--text-muted)", fontSize: 14, marginTop: 4 },
    btnExportExcel: { padding: "8px 16px", borderRadius: 8, background: "var(--card-bg)", color: "var(--foreground)", border: "1px solid var(--card-border)", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, transition: "background 0.2s" },
    btnExportPdf: { padding: "8px 16px", borderRadius: 8, background: "var(--card-bg)", color: "var(--foreground)", border: "1px solid var(--card-border)", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, transition: "background 0.2s" },
    kpiGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, padding: "20px 32px" },
    kpiCard: { background: "var(--card-bg)", borderRadius: 12, padding: "24px", border: "1px solid var(--card-border)", display: "flex", flexDirection: "column", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
    kpiLabel: { fontSize: 11, color: "var(--text-muted)", letterSpacing: 0.5, marginBottom: 8, textTransform: "uppercase" as const, fontWeight: 600 },
    kpiValue: { fontSize: 32, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em" },
    kpiMeta: { fontSize: 12, color: "var(--text-muted)", marginTop: 8 },
    progressBg: { height: 4, borderRadius: 2, background: "var(--card-border)", overflow: "hidden", marginTop: 12 },
    progressFill: { height: "100%", borderRadius: 2, background: "var(--warning)", transition: "width 0.8s ease" },
    chartsWrap: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: "0 32px 20px" },
    chartBox: { background: "var(--card-bg)", borderRadius: 12, padding: "20px", border: "1px solid var(--card-border)" },
    chartTitle: { fontSize: 15, fontWeight: 700, color: "var(--foreground)", marginBottom: 16 },
    tableWrap: { padding: "8px 32px 32px" },
    tableTitle: { fontSize: 18, fontWeight: 700, color: "var(--foreground)", marginBottom: 14 },
    table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
    th: { textAlign: "left" as const, padding: "14px 16px", borderBottom: "1px solid var(--card-border)", color: "var(--text-secondary)", fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" as const },
    tr: { borderBottom: "1px solid var(--card-border)" },
    td: { padding: "12px 16px", fontSize: 13 },
    miniBar: { height: 6, borderRadius: 3, background: "var(--card-border)", overflow: "hidden" },
};
