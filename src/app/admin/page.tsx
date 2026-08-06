"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AnalyticsDashboard from "../../components/AnalyticsDashboard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface Company {
    id: string;
    company_name: string;
    gst_number: string;
    business_registration_number: string;
    contact_person: string;
    phone: string;
    email: string;
    city: string;
    state: string;
    status: string;
    created_at: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [pendingCompanies, setPendingCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("verifications");

    useEffect(() => {
        loadPendingCompanies();
    }, []);

    const loadPendingCompanies = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/admin/companies/pending`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Failed to fetch pending companies");
            const data = await res.json();
            setPendingCompanies(data.companies || []);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const updateCompanyStatus = async (companyId: string, newStatus: string) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/admin/company/${companyId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error("Failed to update status");

            // Remove the company from pending list locally
            setPendingCompanies(prev => prev.filter(c => c.id !== companyId));
            alert(`Company successfully ${newStatus.toLowerCase()}!`);
        } catch (e: any) {
            alert(e.message);
        }
    };

    return (
        <div style={S.page}>
            {/* Sidebar (Local to Admin context) */}
            <div style={S.sidebar}>
                <div style={S.brand}>
                    <span style={{ fontSize: 24 }}>🛡️</span>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 16, color: "#e8ecf1" }}>Urja-Link</h2>
                        <span style={{ fontSize: 11, color: "#38bdf8", fontWeight: 700, letterSpacing: 1 }}>ADMIN PORTAL</span>
                    </div>
                </div>

                <div style={S.navGroup}>
                    <button
                        style={activeTab === "verifications" ? S.navItemActive : S.navItem}
                        onClick={() => setActiveTab("verifications")}
                    >
                        📋 Mod Queue ({pendingCompanies.length})
                    </button>
                    <button
                        style={activeTab === "users" ? S.navItemActive : S.navItem}
                        onClick={() => setActiveTab("users")}
                    >
                        👥 User Management
                    </button>
                    <button
                        style={activeTab === "analytics" ? S.navItemActive : S.navItem}
                        onClick={() => setActiveTab("analytics")}
                    >
                        📈 Analytics Board
                    </button>
                    <button
                        style={activeTab === "logs" ? S.navItemActive : S.navItem}
                        onClick={() => setActiveTab("logs")}
                    >
                        🖥️ System Logs
                    </button>
                </div>

                <div style={{ marginTop: "auto" }}>
                    <Link href="/" style={S.backToApp}>← Return to App</Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={S.main}>
                <header style={S.header}>
                    <h1 style={S.title}>Verification Queue</h1>
                    <div style={S.adminProfile}>
                        <span>Admin Superuser</span>
                        <div style={S.avatar}>A</div>
                    </div>
                </header>

                <div style={S.content}>
                    {activeTab === "verifications" && (
                        <div>
                            <p style={{ color: "#94a3b8", marginBottom: 24 }}>Review and approve solar installer & agency applications before they are listed on the Marketplace.</p>

                            {isLoading ? (
                                <p style={{ color: "#38bdf8" }}>Loading pending applications...</p>
                            ) : error ? (
                                <p style={{ color: "#ef4444" }}>{error}</p>
                            ) : pendingCompanies.length === 0 ? (
                                <div style={S.emptyState}>
                                    <span style={{ fontSize: 40, marginBottom: 12 }}>✨</span>
                                    <h3>Total Zero Inbox</h3>
                                    <p>There are no pending company registrations.</p>
                                </div>
                            ) : (
                                <div style={S.grid}>
                                    {pendingCompanies.map(company => (
                                        <div key={company.id} style={S.card}>
                                            <div style={S.cardHeader}>
                                                <h3 style={S.companyName}>{company.company_name}</h3>
                                                <span style={S.badgePending}>PENDING</span>
                                            </div>

                                            <div style={S.cardBody}>
                                                <div style={S.detailRow}><span style={S.label}>ID:</span> <span style={S.value}>{company.id}</span></div>
                                                <div style={S.detailRow}><span style={S.label}>Applied:</span> <span style={S.value}>{company.created_at}</span></div>
                                                <div style={S.detailRow}><span style={S.label}>Contact:</span> <span style={S.value}>{company.contact_person}</span></div>
                                                <div style={S.detailRow}><span style={S.label}>Email:</span> <span style={S.value}>{company.email}</span></div>
                                                <div style={S.detailRow}><span style={S.label}>Phone:</span> <span style={S.value}>{company.phone}</span></div>
                                                <div style={S.detailRow}><span style={S.label}>Location:</span> <span style={S.value}>{company.city}, {company.state}</span></div>

                                                <div style={S.divider} />

                                                <div style={S.detailRow}><span style={S.label}>GST:</span> <span style={{ ...S.value, color: "#f59e0b", fontFamily: "monospace" }}>{company.gst_number}</span></div>
                                                <div style={S.detailRow}><span style={S.label}>Reg No:</span> <span style={{ ...S.value, fontFamily: "monospace" }}>{company.business_registration_number}</span></div>
                                            </div>

                                            <div style={S.cardActions}>
                                                <button onClick={() => updateCompanyStatus(company.id, "REJECTED")} style={S.btnReject}>Reject</button>
                                                <button onClick={() => updateCompanyStatus(company.id, "APPROVED")} style={S.btnApprove}>Approve Listing</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "analytics" && (
                        <div>
                            <p style={{ color: "#94a3b8", marginBottom: 24 }}>System and registration analytics overview.</p>
                            <AnalyticsDashboard />
                        </div>
                    )}

                    {activeTab !== "verifications" && activeTab !== "analytics" && (
                        <div style={S.emptyState}>
                            <span style={{ fontSize: 40, marginBottom: 12 }}>🚧</span>
                            <h3>Under Construction</h3>
                            <p>This module is slated for deployment in Q4.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const S: Record<string, React.CSSProperties> = {
    page: { display: "flex", height: "100vh", background: "#0a0f1a", fontFamily: "Arial, sans-serif" },
    sidebar: { width: 260, background: "#0f172a", borderRight: "1px solid rgba(56,189,248,0.1)", display: "flex", flexDirection: "column", padding: "24px 16px" },
    brand: { display: "flex", alignItems: "center", gap: 12, marginBottom: 40, padding: "0 8px" },
    navGroup: { display: "flex", flexDirection: "column", gap: 8 },
    navItem: { padding: "12px 16px", background: "transparent", border: "none", color: "#94a3b8", textAlign: "left", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500, transition: "0.2s" },
    navItemActive: { padding: "12px 16px", background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)", color: "#38bdf8", textAlign: "left", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 },
    backToApp: { display: "block", textAlign: "center", color: "#64748b", textDecoration: "none", fontSize: 13, padding: "12px", borderRadius: 8, border: "1px dashed rgba(255,255,255,0.1)" },
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    header: { height: 70, borderBottom: "1px solid rgba(56,189,248,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 32px" },
    title: { fontSize: 20, color: "#e8ecf1", margin: 0 },
    adminProfile: { display: "flex", alignItems: "center", gap: 12, color: "#94a3b8", fontSize: 14 },
    avatar: { width: 32, height: 32, borderRadius: "50%", background: "#38bdf8", color: "#0f172a", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold" },
    content: { padding: 32, overflowY: "auto", flex: 1 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 },
    card: { background: "rgba(15,23,42,0.6)", borderRadius: 12, border: "1px solid rgba(56,189,248,0.15)", overflow: "hidden" },
    cardHeader: { padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)" },
    companyName: { margin: 0, fontSize: 16, color: "#e8ecf1" },
    badgePending: { background: "rgba(245,158,11,0.1)", color: "#f59e0b", padding: "4px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 },
    cardBody: { padding: "20px" },
    detailRow: { display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 },
    label: { color: "#64748b" },
    value: { color: "#cbd5e1" },
    divider: { height: 1, background: "rgba(255,255,255,0.05)", margin: "14px 0" },
    cardActions: { display: "flex", gap: 12, padding: "16px 20px", background: "rgba(0,0,0,0.2)", borderTop: "1px solid rgba(255,255,255,0.05)" },
    btnReject: { flex: 1, padding: "10px", background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 6, fontWeight: 600, cursor: "pointer" },
    btnApprove: { flex: 1.5, padding: "10px", background: "#10b981", border: "none", color: "white", borderRadius: 6, fontWeight: 600, cursor: "pointer" },
    emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, background: "rgba(15,23,42,0.4)", borderRadius: 12, border: "1px dashed rgba(56,189,248,0.2)", color: "#94a3b8" }
};
