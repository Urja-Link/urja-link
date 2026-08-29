"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import SolarForecastWidget from "./SolarForecastWidget";
import RoofAnalysisWidget from "./RoofAnalysisWidget";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://urja-link-api.onrender.com";

interface AdminStats {
    active_companies: number;
    pending_companies: number;
    platform_capacity_gw: number;
}

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);

    // Mock trend data 
    const trendData = [
        { name: "Jan", capacity: 4.2, companies: 40 },
        { name: "Feb", capacity: 4.8, companies: 55 },
        { name: "Mar", capacity: 5.6, companies: 75 },
        { name: "Apr", capacity: 7.2, companies: 98 },
        { name: "May", capacity: 9.3, companies: 120 },
        { name: "Jun", capacity: 12.8, companies: 154 }
    ];

    useEffect(() => {
        // Here we ideally fetch from an admin analytics endpoint, but we'll simulate it briefly
        setTimeout(() => setStats({
            active_companies: 154,
            pending_companies: 27,
            platform_capacity_gw: 12.8
        }), 600);
    }, []);

    if (!stats) return <div style={{ color: "#94a3b8" }}>Loading Platform Analytics...</div>;

    return (
        <div style={{ marginTop: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 20, marginBottom: 30 }}>
                <div style={{ background: "rgba(15,23,42,0.6)", padding: "20px", borderRadius: 12, border: "1px solid rgba(56,189,248,0.2)" }}>
                    <div style={{ fontSize: 13, color: "#94a3b8", textTransform: "uppercase" }}>Registered Agencies</div>
                    <div style={{ fontSize: 32, fontWeight: "bold", color: "#e8ecf1", marginTop: 8 }}>{stats.active_companies}</div>
                </div>
                <div style={{ background: "rgba(15,23,42,0.6)", padding: "20px", borderRadius: 12, border: "1px solid rgba(245,158,11,0.2)" }}>
                    <div style={{ fontSize: 13, color: "#94a3b8", textTransform: "uppercase" }}>Pending Verifications</div>
                    <div style={{ fontSize: 32, fontWeight: "bold", color: "#f59e0b", marginTop: 8 }}>{stats.pending_companies}</div>
                </div>
                <div style={{ background: "rgba(15,23,42,0.6)", padding: "20px", borderRadius: 12, border: "1px solid rgba(34,197,94,0.2)" }}>
                    <div style={{ fontSize: 13, color: "#94a3b8", textTransform: "uppercase" }}>Managed Capacity</div>
                    <div style={{ fontSize: 32, fontWeight: "bold", color: "#22c55e", marginTop: 8 }}>{stats.platform_capacity_gw} GW</div>
                </div>
            </div>

            <RoofAnalysisWidget />

            <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 12, padding: "24px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 24 }}>
                <h3 style={{ margin: 0, marginBottom: 20, fontSize: 16, color: "#e8ecf1" }}>📈 Platform Growth Trend (2026)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCapacity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" tick={{ fill: "#94a3b8" }} />
                        <YAxis tick={{ fill: "#94a3b8" }} />
                        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                        <Area type="monotone" dataKey="capacity" stroke="#38bdf8" fillOpacity={1} fill="url(#colorCapacity)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <SolarForecastWidget />
        </div>
    );
}
