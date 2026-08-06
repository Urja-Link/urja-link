"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// --- MOCK HIERARCHY DATA FOR FILTER OPTIONS ---
const GEO_DATA: Record<string, Record<string, string[]>> = {
    "Maharashtra": {
        "Mumbai": ["Andheri", "Bandra", "Colaba", "Dadar"],
        "Pune": ["Kothrud", "Hinjewadi", "Shivajinagar", "Viman Nagar"],
        "Nagpur": ["Sadar", "Sitabuldi", "Dharampeth"],
    },
    "Delhi": {
        "New Delhi": ["Connaught Place", "Chanakyapuri", "Hauz Khas"],
        "North Delhi": ["Civil Lines", "Model Town", "Pitampura"],
        "South Delhi": ["Saket", "Vasant Kunj", "Greater Kailash"],
    },
    "Karnataka": {
        "Bangalore": ["Koramangala", "Indiranagar", "Whitefield", "Jayanagar"],
        "Mysore": ["Gokulam", "Jayalakshmipuram", "Kuvempunagar"],
    },
    "Gujarat": {
        "Ahmedabad": ["Bopal", "Satellite", "Navrangpura"],
        "Surat": ["Adajan", "Vesu", "Piplod"],
    }
};
// ----------------------------------------------

interface AIAnalysis {
    impact_score: number;
    priority: string;
    recommendation: string;
    deficit_score: number;
    solar_untapped_percent: number;
    power_cut_severity: number;
}

interface StateData {
    state: string;
    state_code: string;
    demand_mu: number;
    supply_mu: number;
    deficit_mu: number;
    deficit_percent: number;
    solar_potential_gw: number;
    installed_solar_mw: number;
    avg_power_cuts_hrs_day: number;
    discom: string;
    rooftop_potential_gw: number;
    population_million: number;
    night_light_index: number;
    feeder_loading_percent?: number;
    ai_analysis: AIAnalysis;
}

interface NationalSummary {
    national_demand_mu: number;
    national_supply_mu: number;
    national_deficit_mu: number;
    national_deficit_percent: number;
    total_solar_potential_gw: number;
    total_installed_solar_mw: number;
    solar_utilization_percent: number;
    total_rooftop_potential_gw: number;
    critical_states: { state: string; score: number }[];
    total_states_tracked: number;
}

function getPriorityColor(priority: string) {
    switch (priority) {
        case "CRITICAL": return "#ef4444";
        case "HIGH": return "#f59e0b";
        case "MEDIUM": return "#3b82f6";
        case "LOW": return "#22c55e";
        default: return "#94a3b8";
    }
}

function getPriorityBg(priority: string) {
    switch (priority) {
        case "CRITICAL": return "rgba(239,68,68,0.12)";
        case "HIGH": return "rgba(245,158,11,0.12)";
        case "MEDIUM": return "rgba(59,130,246,0.12)";
        case "LOW": return "rgba(34,197,94,0.12)";
        default: return "rgba(148,163,184,0.08)";
    }
}

function formatINR(num: number): string {
    return num.toLocaleString("en-IN");
}

export default function EnergyDeficitPage() {
    const [states, setStates] = useState<StateData[]>([]);
    const [summary, setSummary] = useState<NationalSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedState, setSelectedState] = useState<StateData | null>(null);

    // Filters
    const [filterPriority, setFilterPriority] = useState<string>("ALL");
    const [selectedStateFilter, setSelectedStateFilter] = useState<string>("ALL");
    const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL");
    const [selectedCity, setSelectedCity] = useState<string>("ALL");

    useEffect(() => {
        async function fetchData() {
            try {
                const [statesRes, summaryRes] = await Promise.all([
                    fetch(`${API_BASE}/api/energy/states`),
                    fetch(`${API_BASE}/api/energy/summary`),
                ]);
                const statesData = await statesRes.json();
                const summaryData = await summaryRes.json();
                setStates(statesData.states || []);
                setSummary(summaryData);
            } catch (err) {
                console.error("Failed to fetch energy data:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    // Filter Logic
    let filteredStates = [...states];

    if (filterPriority !== "ALL") {
        filteredStates = filteredStates.filter((s) => s.ai_analysis.priority === filterPriority);
    }

    if (selectedStateFilter !== "ALL") {
        filteredStates = filteredStates.filter((s) => s.state === selectedStateFilter);
    }

    // Export Handlers
    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredStates.map(s => ({
            "State": s.state,
            "Priority": s.ai_analysis.priority,
            "AI Impact Score (0-100)": s.ai_analysis.impact_score,
            "Demand (MU)": s.demand_mu,
            "Supply (MU)": s.supply_mu,
            "Deficit (MU)": s.deficit_mu,
            "Deficit (%)": s.deficit_percent,
            "Solar Potential (GW)": s.solar_potential_gw,
            "Installed Solar (MW)": s.installed_solar_mw,
            "Avg Power Cuts (hrs)": s.avg_power_cuts_hrs_day,
            "AI Recommendation": s.ai_analysis.recommendation
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Energy Intelligence");
        XLSX.writeFile(workbook, "Urja_Link_Energy_Deficit_Intelligence.xlsx");
    };

    const exportPDF = () => {
        const doc = new jsPDF("landscape");
        doc.text("Urja-Link: Energy Deficit & AI Intelligence", 14, 15);
        autoTable(doc, {
            head: [["State", "Priority", "Impact Score", "Deficit (%)", "Power Cuts (hrs)", "Solar Pot. (GW)"]],
            body: filteredStates.map(s => [s.state, s.ai_analysis.priority, s.ai_analysis.impact_score, s.deficit_percent, s.avg_power_cuts_hrs_day, s.solar_potential_gw]),
            startY: 20,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [14, 165, 233] },
        });
        doc.save("Urja_Link_Energy_Deficit_Intelligence.pdf");
    };

    if (isLoading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner} />
                <p style={{ color: "#94a3b8", marginTop: 16 }}>Loading national energy intelligence...</p>
            </div>
        );
    }

    const availableStatesForFilter = ["ALL", ...states.map(s => s.state).sort()];
    const availableDistrictsForFilter = selectedStateFilter !== "ALL" && GEO_DATA[selectedStateFilter]
        ? ["ALL", ...Object.keys(GEO_DATA[selectedStateFilter])]
        : ["ALL"];
    const availableCitiesForFilter = selectedStateFilter !== "ALL" && selectedDistrict !== "ALL" && GEO_DATA[selectedStateFilter]?.[selectedDistrict]
        ? ["ALL", ...GEO_DATA[selectedStateFilter][selectedDistrict]]
        : ["ALL"];

    return (
        <div style={styles.page}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <Link href="/" style={styles.backLink}>← Map</Link>
                    <h1 style={styles.title}>⚡ Energy Deficit Intelligence</h1>
                    <p style={styles.subtitle}>AI-powered analysis of India&apos;s state-wise energy gap & solar opportunity</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={exportExcel} style={styles.btnExportExcel}>📊 Export Excel</button>
                    <button onClick={exportPDF} style={styles.btnExportPdf}>📄 Export PDF</button>
                </div>
            </header>

            {/* National Summary Cards */}
            {summary && (
                <div style={styles.summaryGrid}>
                    <div style={{ ...styles.summaryCard, borderLeft: "4px solid #ef4444" }}>
                        <span style={styles.summaryLabel}>National Deficit</span>
                        <span style={styles.summaryValue}>{formatINR(summary.national_deficit_mu)} MU</span>
                        <span style={styles.summaryMeta}>{summary.national_deficit_percent}% gap</span>
                    </div>
                    <div style={{ ...styles.summaryCard, borderLeft: "4px solid #38bdf8" }}>
                        <span style={styles.summaryLabel}>Total Solar Potential</span>
                        <span style={styles.summaryValue}>{summary.total_solar_potential_gw} GW</span>
                        <span style={styles.summaryMeta}>Only {summary.solar_utilization_percent}% utilized</span>
                    </div>
                    <div style={{ ...styles.summaryCard, borderLeft: "4px solid #22c55e" }}>
                        <span style={styles.summaryLabel}>Rooftop Potential</span>
                        <span style={styles.summaryValue}>{summary.total_rooftop_potential_gw} GW</span>
                        <span style={styles.summaryMeta}>Addressable via PM Surya Ghar</span>
                    </div>
                    <div style={{ ...styles.summaryCard, borderLeft: "4px solid #f59e0b" }}>
                        <span style={styles.summaryLabel}>Critical States</span>
                        <span style={styles.summaryValue}>{summary.critical_states.length}</span>
                        <span style={styles.summaryMeta}>Need immediate solar intervention</span>
                    </div>
                </div>
            )}

            {/* Advanced Filters */}
            <div style={styles.advancedFilterBlock}>
                <div style={styles.filterRow}>
                    <span style={styles.filterLabelLarge}>🗺️ Geographic Drill-Down</span>
                    <select
                        style={styles.dropdown}
                        value={selectedStateFilter}
                        onChange={(e) => {
                            setSelectedStateFilter(e.target.value);
                            setSelectedDistrict("ALL");
                            setSelectedCity("ALL");
                            if (e.target.value !== "ALL") {
                                const found = states.find(s => s.state === e.target.value);
                                if (found) setSelectedState(found);
                            }
                        }}
                    >
                        {availableStatesForFilter.map((s) => (
                            <option key={s} value={s}>{s === "ALL" ? "All States / UTs" : s}</option>
                        ))}
                    </select>

                    <select
                        style={styles.dropdown}
                        value={selectedDistrict}
                        onChange={(e) => {
                            setSelectedDistrict(e.target.value);
                            setSelectedCity("ALL");
                        }}
                        disabled={selectedStateFilter === "ALL" || !GEO_DATA[selectedStateFilter]}
                    >
                        {availableDistrictsForFilter.map((d) => (
                            <option key={d} value={d}>{d === "ALL" ? "All Districts" : d}</option>
                        ))}
                    </select>

                    <select
                        style={styles.dropdown}
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        disabled={selectedDistrict === "ALL" || !GEO_DATA[selectedStateFilter]?.[selectedDistrict]}
                    >
                        {availableCitiesForFilter.map((c) => (
                            <option key={c} value={c}>{c === "ALL" ? "All Cities / Tehsils" : c}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Priority Filter Bar */}
            <div style={styles.filterBar}>
                <span style={styles.filterLabel}>Filter by Priority:</span>
                {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => (
                    <button
                        key={p}
                        onClick={() => setFilterPriority(p)}
                        style={{
                            ...styles.filterBtn,
                            background: filterPriority === p
                                ? p === "ALL" ? "linear-gradient(135deg, #0ea5e9, #8b5cf6)" : getPriorityColor(p)
                                : "transparent",
                            color: filterPriority === p ? "white" : "#94a3b8",
                            borderColor: filterPriority === p ? "transparent" : "rgba(56,189,248,0.15)",
                        }}
                    >
                        {p === "ALL" ? "All Severities" : p}
                    </button>
                ))}
                <span style={styles.filterCount}>{filteredStates.length} states</span>
            </div>

            {/* Content: State Cards */}
            <div style={styles.contentArea}>
                {/* State List */}
                <div style={styles.stateList}>
                    {filteredStates.map((state) => (
                        <button
                            key={state.state_code}
                            onClick={() => setSelectedState(state)}
                            style={{
                                ...styles.stateCard,
                                borderColor: selectedState?.state_code === state.state_code
                                    ? getPriorityColor(state.ai_analysis.priority)
                                    : "rgba(56,189,248,0.1)",
                            }}
                        >
                            <div style={styles.stateCardHeader}>
                                <div>
                                    <h3 style={styles.stateName}>{state.state}</h3>
                                    <span style={styles.stateDiscom}>{state.discom}</span>
                                </div>
                                <div style={{
                                    ...styles.priorityBadge,
                                    background: getPriorityBg(state.ai_analysis.priority),
                                    color: getPriorityColor(state.ai_analysis.priority),
                                }}>
                                    {state.ai_analysis.priority}
                                </div>
                            </div>
                            <div style={styles.miniMetrics}>
                                <div style={styles.miniMetric}>
                                    <span style={styles.miniLabel}>Deficit</span>
                                    <span style={{ ...styles.miniValue, color: "#ef4444" }}>{state.deficit_percent}%</span>
                                </div>
                                <div style={styles.miniMetric}>
                                    <span style={styles.miniLabel}>Feeder Strain</span>
                                    <span style={{ ...styles.miniValue, color: "#fcd34d" }}>{state.feeder_loading_percent || 75}%</span>
                                </div>
                                <div style={styles.miniMetric}>
                                    <span style={styles.miniLabel}>Power Cuts</span>
                                    <span style={{ ...styles.miniValue, color: "#f59e0b" }}>{state.avg_power_cuts_hrs_day}h</span>
                                </div>
                                <div style={styles.miniMetric}>
                                    <span style={styles.miniLabel}>AI Score</span>
                                    <span style={{ ...styles.miniValue, color: "#38bdf8" }}>{state.ai_analysis.impact_score}</span>
                                </div>
                            </div>
                            {/* Impact bar */}
                            <div style={styles.impactBarBg}>
                                <div style={{
                                    ...styles.impactBarFill,
                                    width: `${state.ai_analysis.impact_score}%`,
                                    background: `linear-gradient(90deg, ${getPriorityColor(state.ai_analysis.priority)}, ${getPriorityColor(state.ai_analysis.priority)}88)`,
                                }} />
                            </div>
                        </button>
                    ))}
                </div>

                {/* Detail Panel */}
                <div style={styles.detailPanel}>
                    {selectedState ? (
                        <div style={styles.detailContent}>
                            <h2 style={styles.detailTitle}>{selectedState.state}</h2>
                            <div style={{
                                ...styles.priorityBadgeLarge,
                                background: getPriorityBg(selectedState.ai_analysis.priority),
                                color: getPriorityColor(selectedState.ai_analysis.priority),
                            }}>
                                {selectedState.ai_analysis.priority} PRIORITY — Score {selectedState.ai_analysis.impact_score}/100
                            </div>

                            {/* Geographic Context (if filtered to lower level) */}
                            {selectedDistrict !== "ALL" && (
                                <div style={{
                                    margin: "-10px 0 20px 0", padding: "12px", background: "rgba(245, 158, 11, 0.1)",
                                    border: "1px dashed #f59e0b", borderRadius: 8, color: "#fcd34d", fontSize: 14
                                }}>
                                    ⚠️ <b>Note:</b> You are viewing analysis context zoomed to <b>{selectedCity !== 'ALL' ? selectedCity : selectedDistrict}</b>.
                                    (Location-specific hyper-local grid deficit models are currently in beta. Showing aggregate State parent data.)
                                </div>
                            )}

                            {/* AI Recommendation */}
                            <div style={styles.aiBox}>
                                <h3 style={styles.aiBoxTitle}>🤖 AI Recommendation</h3>
                                <p style={styles.aiBoxText}>{selectedState.ai_analysis.recommendation}</p>
                            </div>

                            {/* Detailed Metrics */}
                            <div style={styles.detailGrid}>
                                <div style={styles.detailMetric}>
                                    <span style={styles.detailLabel}>Electricity Demand</span>
                                    <span style={styles.detailValue}>{formatINR(selectedState.demand_mu)} MU</span>
                                </div>
                                <div style={styles.detailMetric}>
                                    <span style={styles.detailLabel}>Electricity Supply</span>
                                    <span style={styles.detailValue}>{formatINR(selectedState.supply_mu)} MU</span>
                                </div>
                                <div style={styles.detailMetric}>
                                    <span style={styles.detailLabel}>Energy Deficit</span>
                                    <span style={{ ...styles.detailValue, color: "#ef4444" }}>{formatINR(selectedState.deficit_mu)} MU ({selectedState.deficit_percent}%)</span>
                                </div>
                                <div style={styles.detailMetric}>
                                    <span style={styles.detailLabel}>Avg Power Cuts</span>
                                    <span style={{ ...styles.detailValue, color: "#f59e0b" }}>{selectedState.avg_power_cuts_hrs_day} hrs/day</span>
                                </div>
                                <div style={styles.detailMetric}>
                                    <span style={styles.detailLabel}>Grid Feeder Strain</span>
                                    <span style={{ ...styles.detailValue, color: "#fcd34d" }}>{selectedState.feeder_loading_percent || 75}%</span>
                                </div>
                                <div style={styles.detailMetric}>
                                    <span style={styles.detailLabel}>Solar Potential</span>
                                    <span style={{ ...styles.detailValue, color: "#38bdf8" }}>{selectedState.solar_potential_gw} GW</span>
                                </div>
                                <div style={styles.detailMetric}>
                                    <span style={styles.detailLabel}>Installed Solar</span>
                                    <span style={styles.detailValue}>{formatINR(selectedState.installed_solar_mw)} MW</span>
                                </div>
                                <div style={styles.detailMetric}>
                                    <span style={styles.detailLabel}>Rooftop Potential</span>
                                    <span style={{ ...styles.detailValue, color: "#22c55e" }}>{selectedState.rooftop_potential_gw} GW</span>
                                </div>
                                <div style={styles.detailMetric}>
                                    <span style={styles.detailLabel}>Population</span>
                                    <span style={styles.detailValue}>{selectedState.population_million}M</span>
                                </div>
                                <div style={styles.detailMetric}>
                                    <span style={styles.detailLabel}>Night Light Index</span>
                                    <span style={styles.detailValue}>{selectedState.night_light_index}/100</span>
                                </div>
                                <div style={styles.detailMetric}>
                                    <span style={styles.detailLabel}>DISCOM</span>
                                    <span style={styles.detailValue}>{selectedState.discom}</span>
                                </div>
                            </div>

                            {/* Scoring Breakdown */}
                            <div style={styles.scoringSection}>
                                <h3 style={styles.scoringTitle}>📊 AI Scoring Breakdown</h3>
                                {[
                                    { label: "Energy Deficit Severity (30%)", value: selectedState.ai_analysis.deficit_score, color: "#ef4444" },
                                    { label: "Solar Untapped Potential (20%)", value: selectedState.ai_analysis.solar_untapped_percent, color: "#38bdf8" },
                                    { label: "Power Cut Severity (25%)", value: selectedState.ai_analysis.power_cut_severity, color: "#f59e0b" },
                                ].map((item) => (
                                    <div key={item.label} style={styles.scoreRow}>
                                        <div style={styles.scoreLabel}>
                                            <span>{item.label}</span>
                                            <span style={{ color: item.color }}>{item.value}%</span>
                                        </div>
                                        <div style={styles.scoreBarBg}>
                                            <div style={{ ...styles.scoreBarFill, width: `${item.value}%`, background: item.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={styles.emptyDetail}>
                            <p style={{ fontSize: 48 }}>🗺️</p>
                            <h3 style={{ color: "#e8ecf1", marginBottom: 8 }}>Select a Region</h3>
                            <p style={{ color: "#64748b", fontSize: 14 }}>Click on any state card to view detailed energy deficit analysis and AI recommendations</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ===================== Styles =====================
const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        background: "#0a0f1a",
        color: "#e8ecf1",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
    },
    loadingContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#0a0f1a",
    },
    spinner: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "3px solid rgba(56,189,248,0.2)",
        borderTopColor: "#38bdf8",
        animation: "spin 1s linear infinite",
    },
    header: {
        padding: "20px 32px",
        borderBottom: "1px solid rgba(56,189,248,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerLeft: {},
    backLink: {
        color: "#38bdf8",
        textDecoration: "none",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 4,
        display: "inline-block",
    },
    title: {
        fontSize: 26,
        fontWeight: 800,
        background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        margin: "4px 0",
    },
    subtitle: {
        color: "#64748b",
        fontSize: 14,
    },
    btnExportExcel: { padding: "8px 16px", borderRadius: 8, background: "#059669", color: "white", fontWeight: 600, border: "none", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 },
    btnExportPdf: { padding: "8px 16px", borderRadius: 8, background: "#dc2626", color: "white", fontWeight: 600, border: "none", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 },
    // Summary
    summaryGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
        padding: "20px 32px",
    },
    summaryCard: {
        background: "rgba(15,23,42,0.85)",
        backdropFilter: "blur(16px)",
        borderRadius: 12,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        border: "1px solid rgba(56,189,248,0.1)",
    },
    summaryLabel: {
        fontSize: 12,
        color: "#94a3b8",
        textTransform: "uppercase" as const,
        letterSpacing: 1,
        marginBottom: 6,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 700,
        color: "#e8ecf1",
    },
    summaryMeta: {
        fontSize: 12,
        color: "#64748b",
        marginTop: 4,
    },

    // Advanced Filters (State/District)
    advancedFilterBlock: {
        padding: "0 32px 16px",
    },
    filterRow: {
        display: "flex",
        gap: 12,
        alignItems: "center",
        background: "rgba(15, 23, 42, 0.4)",
        padding: "12px",
        borderRadius: "10px",
        border: "1px solid rgba(56, 189, 248, 0.1)"
    },
    filterLabelLarge: {
        fontSize: 14,
        fontWeight: 600,
        color: "#cbd5e1",
        marginRight: 10
    },
    dropdown: {
        padding: "8px 14px",
        borderRadius: 8,
        background: "rgba(15, 23, 42, 0.9)",
        border: "1px solid rgba(56, 189, 248, 0.2)",
        color: "#e8ecf1",
        fontSize: 13,
        outline: "none",
        cursor: "pointer",
        minWidth: 160
    },

    // Filter
    filterBar: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 32px 16px",
    },
    filterLabel: {
        fontSize: 13,
        color: "#94a3b8",
        marginRight: 4,
    },
    filterBtn: {
        padding: "6px 16px",
        borderRadius: 20,
        border: "1px solid rgba(56,189,248,0.15)",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s",
    },
    filterCount: {
        marginLeft: "auto",
        fontSize: 13,
        color: "#64748b",
    },
    // Content
    contentArea: {
        display: "grid",
        gridTemplateColumns: "420px 1fr",
        gap: 0,
        flex: 1,
        overflow: "hidden",
    },
    stateList: {
        overflowY: "auto" as const,
        padding: "0 16px 20px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxHeight: "calc(100vh - 260px)",
    },
    stateCard: {
        background: "rgba(15,23,42,0.7)",
        border: "1px solid rgba(56,189,248,0.1)",
        borderRadius: 12,
        padding: "16px",
        cursor: "pointer",
        transition: "all 0.2s",
        textAlign: "left" as const,
        width: "100%",
        color: "#e8ecf1",
    },
    stateCardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    stateName: {
        fontSize: 16,
        fontWeight: 700,
        margin: 0,
    },
    stateDiscom: {
        fontSize: 11,
        color: "#64748b",
    },
    priorityBadge: {
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.5,
    },
    miniMetrics: {
        display: "flex",
        gap: 16,
        marginBottom: 8,
    },
    miniMetric: {
        display: "flex",
        flexDirection: "column",
    },
    miniLabel: {
        fontSize: 10,
        color: "#64748b",
        textTransform: "uppercase" as const,
    },
    miniValue: {
        fontSize: 15,
        fontWeight: 700,
    },
    impactBarBg: {
        height: 4,
        borderRadius: 2,
        background: "rgba(255,255,255,0.06)",
        overflow: "hidden",
    },
    impactBarFill: {
        height: "100%",
        borderRadius: 2,
        transition: "width 0.6s ease",
    },
    // Detail Panel
    detailPanel: {
        borderLeft: "1px solid rgba(56,189,248,0.1)",
        overflowY: "auto" as const,
        maxHeight: "calc(100vh - 260px)",
    },
    detailContent: {
        padding: "24px 32px",
    },
    detailTitle: {
        fontSize: 28,
        fontWeight: 800,
        color: "#e8ecf1",
        margin: "0 0 12px",
    },
    priorityBadgeLarge: {
        display: "inline-block",
        padding: "8px 18px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 0.5,
        marginBottom: 20,
    },
    aiBox: {
        background: "rgba(14,165,233,0.08)",
        border: "1px solid rgba(14,165,233,0.2)",
        borderRadius: 12,
        padding: "18px",
        marginBottom: 24,
    },
    aiBoxTitle: {
        fontSize: 15,
        fontWeight: 700,
        color: "#38bdf8",
        margin: "0 0 8px",
    },
    aiBoxText: {
        fontSize: 14,
        color: "#cbd5e1",
        lineHeight: 1.6,
        margin: 0,
    },
    detailGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        marginBottom: 24,
    },
    detailMetric: {
        display: "flex",
        flexDirection: "column",
        padding: "12px 14px",
        background: "rgba(15,23,42,0.6)",
        borderRadius: 8,
        border: "1px solid rgba(56,189,248,0.06)",
    },
    detailLabel: {
        fontSize: 11,
        color: "#64748b",
        textTransform: "uppercase" as const,
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: 600,
        color: "#e8ecf1",
    },
    scoringSection: {
        background: "rgba(15,23,42,0.6)",
        borderRadius: 12,
        padding: "18px",
        border: "1px solid rgba(56,189,248,0.08)",
    },
    scoringTitle: {
        fontSize: 15,
        fontWeight: 700,
        color: "#e8ecf1",
        margin: "0 0 14px",
    },
    scoreRow: {
        marginBottom: 12,
    },
    scoreLabel: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12,
        color: "#94a3b8",
        marginBottom: 4,
    },
    scoreBarBg: {
        height: 6,
        borderRadius: 3,
        background: "rgba(255,255,255,0.06)",
        overflow: "hidden",
    },
    scoreBarFill: {
        height: "100%",
        borderRadius: 3,
        transition: "width 0.8s ease",
    },
    emptyDetail: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        textAlign: "center" as const,
        padding: 40,
    },
};
