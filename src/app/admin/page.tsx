"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AnalyticsDashboard from "../../components/AnalyticsDashboard";
import { ShieldAlert, ClipboardList, Users, LineChart, Terminal, CheckCircle, Construction } from "lucide-react";

import { supabase } from "@/lib/supabase";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://urja-link-api.onrender.com";

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
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPendingCompanies(data || []);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const updateCompanyStatus = async (companyId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('companies')
                .update({ status: newStatus.toLowerCase() })
                .eq('id', companyId);

            if (error) throw error;

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
                    <ShieldAlert size={28} color="var(--warning)" />
                    <div>
                        <h2 style={{ margin: 0, fontSize: 16, color: "var(--foreground)" }}>Urja-Link</h2>
                        <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 1 }}>ADMIN PORTAL</span>
                    </div>
                </div>

                <div style={S.navGroup}>
                    <button
                        style={activeTab === "verifications" ? S.navItemActive : S.navItem}
                        onClick={() => setActiveTab("verifications")}
                    >
                        <ClipboardList size={16} /> Mod Queue ({pendingCompanies.length})
                    </button>
                    <button
                        style={activeTab === "users" ? S.navItemActive : S.navItem}
                        onClick={() => setActiveTab("users")}
                    >
                        <Users size={16} /> User Management
                    </button>
                    <button
                        style={activeTab === "analytics" ? S.navItemActive : S.navItem}
                        onClick={() => setActiveTab("analytics")}
                    >
                        <LineChart size={16} /> Analytics Board
                    </button>
                    <button
                        style={activeTab === "logs" ? S.navItemActive : S.navItem}
                        onClick={() => setActiveTab("logs")}
                    >
                        <Terminal size={16} /> System Logs
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
                                <p style={{ color: "var(--text-secondary)" }}>Loading pending applications...</p>
                            ) : error ? (
                                <p style={{ color: "var(--danger)" }}>{error}</p>
                            ) : pendingCompanies.length === 0 ? (
                                <div style={S.emptyState}>
                                    <CheckCircle size={40} color="var(--success)" style={{ marginBottom: 12 }} />
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
                            <Construction size={40} color="var(--warning)" style={{ marginBottom: 12 }} />
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
    page: { display: "flex", height: "100vh", background: "var(--background)", fontFamily: "var(--font-geist-sans), Arial, sans-serif" },
    sidebar: { width: 260, background: "var(--card-bg)", borderRight: "1px solid var(--card-border)", display: "flex", flexDirection: "column", padding: "24px 16px" },
    brand: { display: "flex", alignItems: "center", gap: 12, marginBottom: 40, padding: "0 8px" },
    navGroup: { display: "flex", flexDirection: "column", gap: 8 },
    navItem: { padding: "12px 16px", background: "transparent", border: "none", color: "var(--text-secondary)", textAlign: "left", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "0.2s", display: "flex", alignItems: "center", gap: 10 },
    navItemActive: { padding: "12px 16px", background: "var(--foreground)", border: "1px solid var(--card-border)", color: "var(--background)", textAlign: "left", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 },
    backToApp: { display: "block", textAlign: "center", color: "var(--text-muted)", textDecoration: "none", fontSize: 13, padding: "12px", borderRadius: 8, border: "1px dashed var(--card-border)" },
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", paddingTop: 90 },
    header: { height: 70, borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 32px" },
    title: { fontSize: 20, color: "var(--foreground)", margin: 0 },
    adminProfile: { display: "flex", alignItems: "center", gap: 12, color: "var(--text-secondary)", fontSize: 14 },
    avatar: { width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold" },
    content: { padding: 32, overflowY: "auto", flex: 1 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 },
    card: { background: "var(--card-bg)", borderRadius: 12, border: "1px solid var(--card-border)", overflow: "hidden" },
    cardHeader: { padding: "16px 20px", borderBottom: `1px solid var(--card-border)`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.1)" },
    companyName: { margin: 0, fontSize: 16, color: "var(--foreground)" },
    badgePending: { background: "var(--card-bg)", color: "var(--warning)", border: "1px solid var(--warning)", padding: "4px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: 0.5 },
    cardBody: { padding: "20px" },
    detailRow: { display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 },
    label: { color: "var(--text-muted)" },
    value: { color: "var(--text-secondary)" },
    divider: { height: 1, background: "var(--card-border)", margin: "14px 0" },
    cardActions: { display: "flex", gap: 12, padding: "16px 20px", background: "rgba(0,0,0,0.1)", borderTop: `1px solid var(--card-border)` },
    btnReject: { flex: 1, padding: "10px", background: "transparent", border: "1px solid var(--card-border)", color: "var(--danger)", borderRadius: 6, fontWeight: 600, cursor: "pointer" },
    btnApprove: { flex: 1.5, padding: "10px", background: "var(--foreground)", border: "none", color: "var(--background)", borderRadius: 6, fontWeight: 600, cursor: "pointer" },
    emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, background: "var(--card-bg)", borderRadius: 12, border: "1px dashed var(--card-border)", color: "var(--text-secondary)" }
};
