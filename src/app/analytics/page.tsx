"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { Activity, Zap, TrendingUp, BarChart3, Database, Server, Cpu, Clock, Cloud, Leaf, BrainCircuit, Wind, ThermometerSun, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data for Analytics
const PERFORMANCE_DATA = [
    { time: "00:00", generation: 0, consumption: 420 },
    { time: "04:00", generation: 0, consumption: 380 },
    { time: "08:00", generation: 210, consumption: 560 },
    { time: "12:00", generation: 850, consumption: 610 },
    { time: "16:00", generation: 640, consumption: 720 },
    { time: "20:00", generation: 0, consumption: 890 },
    { time: "24:00", generation: 0, consumption: 450 },
];

const NODE_DATA = [
    { name: "North Grid", active: 1450, total: 1500, uptime: 99.8 },
    { name: "South Grid", active: 2100, total: 2150, uptime: 99.9 },
    { name: "West Grid", active: 1800, total: 1840, uptime: 99.5 },
    { name: "East Grid", active: 950, total: 1000, uptime: 98.2 },
];

const FORECAST_DATA = [
    { day: "Mon", predicted_power: 840, confidence: 94 },
    { day: "Tue", predicted_power: 890, confidence: 92 },
    { day: "Wed", predicted_power: 760, confidence: 85 },
    { day: "Thu", predicted_power: 920, confidence: 88 },
    { day: "Fri", predicted_power: 950, confidence: 91 },
    { day: "Sat", predicted_power: 1050, confidence: 95 },
    { day: "Sun", predicted_power: 1100, confidence: 96 },
];

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState("24h");
    const [isPredictive, setIsPredictive] = useState(false);
    const [liveData, setLiveData] = useState({
        power: 3.2, cloud: 12, installs: 1450, co2: 48.5,
        temp: 35.0, wind: 12.0, ai_alert: "Normal"
    });
    const [telemetryLogs, setTelemetryLogs] = useState([
        { time: "14:22:05.112", id: "IN-DL-882", type: "PING_ALIVE", status: "OK", latency: "12ms" },
        { time: "14:22:04.981", id: "IN-MH-102", type: "SYNC_REQ", status: "OK", latency: "8ms" },
        { time: "14:22:04.055", id: "IN-GJ-542", type: "DATA_PUSH", status: "OK", latency: "15ms" }
    ]);
    const [performanceData, setPerformanceData] = useState(PERFORMANCE_DATA);

    import("react").then((React) => {
        const { useEffect } = React;
        useEffect(() => {
            const baseUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
            const ws = new WebSocket(`${baseUrl}/ws/live-telemetry`);

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                setLiveData({
                    power: data.active_power_generation_gw,
                    cloud: data.average_cloud_cover_pct,
                    installs: data.installations_today,
                    co2: data.live_co2_saved_mt,
                    temp: data.temperature_c || 35.0,
                    wind: data.wind_speed_kmh || 12.0,
                    ai_alert: data.ai_alert || "Normal"
                });

                const now = new Date();
                const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

                setTelemetryLogs(prev => {
                    const newLog = {
                        time: timeStr,
                        id: `IN-NODE-${Math.floor(Math.random() * 999)}`,
                        type: "LIVE_SYNC",
                        status: "OK",
                        latency: `${Math.floor(Math.random() * 20 + 5)}ms`
                    };
                    return [newLog, ...prev].slice(0, 8);
                });
            };

            return () => ws.close();
        }, []);
    }).catch(() => { });

    return (
        <div className="page-container">
            <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 className="page-title"><Activity size={32} style={{ marginRight: 10 }} /> Telemetry & Analytics</h1>
                    <p className="page-subtitle">Real-time system performance and node metrics</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    {["1h", "24h", "7d", "30d"].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            style={{
                                padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                                background: timeRange === range ? "var(--warning)" : "transparent",
                                color: timeRange === range ? "#000" : "var(--text-secondary)",
                                border: `1px solid ${timeRange === range ? "transparent" : "var(--card-border)"}`,
                                cursor: "pointer", transition: "all 0.2s"
                            }}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </header>

            <div className="content-section" style={{ maxWidth: 1200 }}>
                {/* KPIs */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 32 }}>
                    {[
                        { icon: <Zap size={24} color="var(--warning)" />, label: "Grid Power Output", value: `${liveData.power.toFixed(2)} GW`, trend: "+12.5%" },
                        { icon: <AlertTriangle size={24} color={liveData.ai_alert === "Normal" ? "var(--success)" : "var(--danger)"} />, label: "AI Safety Alert", value: liveData.ai_alert, trend: "Live Model" },
                        { icon: <Cloud size={24} color="var(--info, #3b82f6)" />, label: "Avg Cloud Cover", value: `${liveData.cloud}%`, trend: "Open-Meteo" },
                        { icon: <Wind size={24} color="#a855f7" />, label: "Wind Vectors", value: `${liveData.wind} km/h`, trend: "Open-Meteo" },
                        { icon: <ThermometerSun size={24} color="#f97316" />, label: "Grid Thermals", value: `${liveData.temp}°C`, trend: "Open-Meteo" },
                        { icon: <Leaf size={24} color="var(--success, #10b981)" />, label: "CO2 Mitigated", value: `${liveData.co2.toFixed(1)} MT`, trend: "+5.2%" },
                    ].map((kpi, i) => (
                        <motion.div key={i} className="info-card" style={{ padding: 24 }} whileHover={{ y: -5 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {kpi.icon}
                                </div>
                                <span style={{
                                    fontSize: 13, fontWeight: 600, padding: "4px 8px", borderRadius: 4,
                                    background: kpi.trend.startsWith("+") ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                                    color: kpi.trend.startsWith("+") ? "var(--success)" : "var(--danger)"
                                }}>
                                    {kpi.trend}
                                </span>
                            </div>
                            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                {kpi.label}
                            </p>
                            <AnimatePresence mode="popLayout">
                                <motion.h3
                                    key={kpi.value}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    style={{ fontSize: 28, fontWeight: 700, margin: 0 }}
                                >
                                    {kpi.value}
                                </motion.h3>
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Area */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 32 }}>
                    {/* Main Chart */}
                    <div className="info-card" style={{ padding: 24, minHeight: 400 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                                {isPredictive ? <BrainCircuit size={18} color="var(--accent)" /> : <TrendingUp size={18} color="var(--warning)" />}
                                {isPredictive ? "7-Day AI Power Forecast (GW)" : "Grid Power Dynamics (MW)"}
                            </h3>
                            <button
                                onClick={() => setIsPredictive(!isPredictive)}
                                style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--card-border)", background: isPredictive ? "var(--foreground)" : "var(--card-bg)", color: isPredictive ? "var(--background)" : "var(--foreground)", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                            >
                                <BrainCircuit size={14} /> {isPredictive ? "View Live Telemetry" : "Enable AI Forecast"}
                            </button>
                        </div>
                        <div style={{ width: "100%", height: 320 }}>
                            <ResponsiveContainer>
                                {isPredictive ? (
                                    <LineChart data={FORECAST_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                                        <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)", borderRadius: 8, color: "var(--foreground)" }}
                                            itemStyle={{ color: "var(--foreground)" }}
                                        />
                                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 13, color: "var(--text-secondary)" }} />
                                        <Line type="monotone" dataKey="predicted_power" name="Predicted Output" stroke="var(--accent)" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: "var(--accent)" }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                ) : (
                                    <AreaChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--warning)" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorCon" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--text-secondary)" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="var(--text-secondary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                                        <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)", borderRadius: 8, color: "var(--foreground)" }}
                                            itemStyle={{ color: "var(--foreground)" }}
                                        />
                                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 13, color: "var(--text-secondary)" }} />
                                        <Area type="monotone" dataKey="generation" name="Generation" stroke="var(--warning)" strokeWidth={2} fillOpacity={1} fill="url(#colorGen)" />
                                        <Area type="monotone" dataKey="consumption" name="Consumption" stroke="var(--text-secondary)" strokeWidth={2} fillOpacity={1} fill="url(#colorCon)" />
                                    </AreaChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Node Uptime */}
                    <div className="info-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 24px 0", display: "flex", alignItems: "center", gap: 8 }}>
                            <BarChart3 size={18} color="var(--warning)" /> Node Activity
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {NODE_DATA.map((node) => (
                                <div key={node.name}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                        <span style={{ fontSize: 14, fontWeight: 500 }}>{node.name}</span>
                                        <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{node.active} / {node.total}</span>
                                    </div>
                                    <div style={{ width: "100%", height: 8, background: "var(--hover-bg)", borderRadius: 4, overflow: "hidden" }}>
                                        <div style={{ width: `${(node.active / node.total) * 100}%`, height: "100%", background: "var(--warning)", borderRadius: 4 }} />
                                    </div>
                                    <div style={{ marginTop: 4, fontSize: 12, color: "var(--success)" }}>
                                        {node.uptime}% Uptime SLA
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Advanced Telemetry Logs Table */}
                <div className="info-card" style={{ padding: "24px 0" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 24px 24px", display: "flex", alignItems: "center", gap: 8 }}>
                        <Clock size={18} color="var(--warning)" /> Real-Time Telemetry Stream
                    </h3>
                    <div style={{ overflowX: "auto", padding: "0 24px" }}>
                        <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse", fontSize: 14, textAlign: "left" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--card-border)", color: "var(--text-secondary)" }}>
                                    <th style={{ padding: "12px 16px", fontWeight: 500 }}>Timestamp</th>
                                    <th style={{ padding: "12px 16px", fontWeight: 500 }}>Node ID</th>
                                    <th style={{ padding: "12px 16px", fontWeight: 500 }}>Event Type</th>
                                    <th style={{ padding: "12px 16px", fontWeight: 500 }}>Status</th>
                                    <th style={{ padding: "12px 16px", fontWeight: 500 }}>Latency</th>
                                </tr>
                            </thead>
                            <tbody>
                                {telemetryLogs.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: "1px solid var(--hover-bg)", transition: "background 0.2s" }} className="table-row-hover">
                                        <td style={{ padding: "12px 16px", fontFamily: "monospace", color: "var(--text-secondary)" }}>{row.time}</td>
                                        <td style={{ padding: "12px 16px", fontWeight: 500 }}>{row.id}</td>
                                        <td style={{ padding: "12px 16px" }}>{row.type}</td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span style={{
                                                padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600,
                                                background: row.status === "OK" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                                                color: row.status === "OK" ? "var(--success)" : "var(--warning)"
                                            }}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{row.latency}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
            <Footer />
        </div>
    );
}
