"use client";

import { useEffect, useState } from "react";
import { Cpu, ShieldCheck, AlertTriangle, Zap, Activity, Droplet, ArrowRight, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function UserDashboard() {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<any>(null);

    // Mock telemetry data representing 7 days of hardware logs
    const telemetryData = [
        { day: 'Mon', voltage: 230, temp: 28 },
        { day: 'Tue', voltage: 228, temp: 31 },
        { day: 'Wed', voltage: 226, temp: 35 },
        { day: 'Thu', voltage: 224, temp: 38 },
        { day: 'Fri', voltage: 221, temp: 42 },
        { day: 'Sat', voltage: 219, temp: 46 }, // Spiking heat, dropping voltage (dust/heat fatigue)
        { day: 'Sun', voltage: 215, temp: 48 },
    ];

    const handleRunDiagnostics = async () => {
        setIsScanning(true);
        try {
            // Post our latest tensor to the Predictive ML endpoint
            const res = await fetch(`${API_BASE}/api/predictive/degradation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    panel_id: "UL-H20-9941X",
                    voltage_drop_pct: ((230 - 215) / 230) * 100, // 6.5% drop
                    operating_hours: 4850,
                    avg_temperature_c: 48
                })
            });
            const data = await res.json();

            // Artificial delay to simulate ML crunhing
            await new Promise(r => setTimeout(r, 2000));
            setScanResult(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "url('/satellite-bg.webp') fixed", backgroundSize: "cover", overflowY: "auto", paddingTop: 100, paddingBottom: 60, paddingInline: "5%" }}>

            <div className="glass-card" style={{ padding: 40, width: "100%", maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid var(--card-border)", paddingBottom: 24 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                            <div style={{ padding: "6px 12px", background: "rgba(34, 197, 94, 0.2)", color: "#22c55e", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>VERIFIED PROSUMER</div>
                            <div style={{ padding: "6px 12px", background: "rgba(56, 189, 248, 0.2)", color: "#38bdf8", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>IOT CONNECTED</div>
                        </div>
                        <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px 0", color: "var(--foreground)" }}>
                            System IoT Dashboard
                        </h1>
                        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 15 }}>
                            Array ID: UL-H20-9941X | 10 kW Capacity
                        </p>
                    </div>

                    <button
                        onClick={handleRunDiagnostics}
                        disabled={isScanning}
                        style={{ padding: "16px 32px", borderRadius: 12, border: "1px solid var(--card-border)", background: isScanning ? "var(--hover-bg)" : "linear-gradient(135deg, #3b82f6, #2563eb)", color: isScanning ? "var(--text-muted)" : "white", fontSize: 16, fontWeight: 700, cursor: isScanning ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 12, boxShadow: isScanning ? "none" : "0 8px 24px rgba(59, 130, 246, 0.3)" }}
                    >
                        {isScanning ? <><Loader2 size={20} className="lucide-spin" /> Analyzing Tensors...</> : <><Cpu size={20} /> Run ML Hardware Scan</>}
                    </button>
                </div>

                {/* ML Result Box */}
                {scanResult && (
                    <div style={{ padding: 24, borderRadius: 16, background: scanResult.status_code === 'critical' ? "rgba(220, 38, 38, 0.15)" : scanResult.status_code === 'warning' ? "rgba(245, 158, 11, 0.15)" : "rgba(34, 197, 94, 0.15)", border: `1px solid ${scanResult.status_code === 'critical' ? 'var(--danger)' : scanResult.status_code === 'warning' ? 'var(--warning)' : 'var(--success)'}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                            {scanResult.status_code === 'critical' ? <AlertTriangle size={36} color="var(--danger)" /> : <ShieldCheck size={36} color="var(--success)" />}
                            <div>
                                <h3 style={{ margin: 0, fontSize: 20, color: "var(--foreground)" }}>Diagnostics Complete ({scanResult.model_version})</h3>
                                <div style={{ color: scanResult.status_code === 'critical' ? "var(--danger)" : "var(--text-muted)", fontSize: 14 }}>
                                    Probability of Imminent Failure: {(scanResult.degradation_risk_score * 100).toFixed(1)}%
                                </div>
                            </div>
                        </div>
                        <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px 20px", borderRadius: 12, fontSize: 15, color: "var(--foreground)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span><strong>Primary Factor Detected:</strong> {scanResult.primary_factor}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 8, color: scanResult.status_code === 'critical' ? "#fca5a5" : "#6ee7b7" }}><ArrowRight size={16} /> {scanResult.recommended_action}</span>
                        </div>
                    </div>
                )}

                {/* Telemetry Charts */}
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>

                    <div style={{ flex: 1, minWidth: 400, height: 320, background: "rgba(0,0,0,0.15)", borderRadius: 16, border: "1px solid var(--card-border)", padding: 24 }}>
                        <h3 style={{ margin: "0 0 24px 0", fontSize: 16, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
                            <Zap size={18} color="#38bdf8" /> Array Voltage Log (7 Days)
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={telemetryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} />
                                <YAxis domain={[200, 240]} stroke="var(--text-muted)" fontSize={11} />
                                <Tooltip contentStyle={{ background: "rgba(9,9,11,0.9)", border: "1px solid var(--card-border)", borderRadius: 8 }} />
                                <Area type="monotone" dataKey="voltage" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorV)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ flex: 1, minWidth: 400, height: 320, background: "rgba(0,0,0,0.15)", borderRadius: 16, border: "1px solid var(--card-border)", padding: 24 }}>
                        <h3 style={{ margin: "0 0 24px 0", fontSize: 16, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
                            <Activity size={18} color="#ef4444" /> Panel Heat Stress (Deg C)
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={telemetryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorT" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} />
                                <YAxis domain={[20, 60]} stroke="var(--text-muted)" fontSize={11} />
                                <Tooltip contentStyle={{ background: "rgba(9,9,11,0.9)", border: "1px solid var(--card-border)", borderRadius: 8 }} />
                                <Area type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorT)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                </div>

            </div>
        </div>
    );
}
