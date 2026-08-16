"use client";

import { useEffect, useState } from "react";
import { Cpu, ShieldCheck, AlertTriangle, Zap, Activity, Droplet, ArrowRight, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";

const DigitalTwin3D = dynamic(() => import("@/components/DigitalTwin3D"), { ssr: false });

// Using native Supabase instead of FastAPI for database items
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://urja-link-api.onrender.com";

export default function UserDashboard() {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<any>(null);
    const [telemetryData, setTelemetryData] = useState<any[]>([]);

    const latestTemp = telemetryData.length > 0 ? telemetryData[telemetryData.length - 1].temp : 25;

    useEffect(() => {
        const fetchTelemetry = async () => {
            try {
                // Fetch directly from native Supabase DB!
                const { data, error } = await supabase
                    .from('iot_telemetry')
                    .select('*')
                    .order('timestamp', { ascending: false })
                    .limit(7);

                if (!error && data && data.length > 0) {
                    const formatted = data.reverse().map((d: any) => {
                        const date = new Date(d.timestamp);
                        return {
                            day: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            voltage: d.voltage_v,
                            temp: d.temperature_c
                        };
                    });
                    setTelemetryData(formatted);
                } else {
                    // Fallback mock strictly for design review if DB is empty
                    setTelemetryData([
                        { day: 'Mon', voltage: 230, temp: 28 },
                        { day: 'Tue', voltage: 228, temp: 31 },
                        { day: 'Wed', parseInt: 226, temp: 35 },
                        { day: 'Thu', voltage: 224, temp: 38 },
                        { day: 'Fri', voltage: 221, temp: 42 },
                        { day: 'Sat', voltage: 219, temp: 46 },
                        { day: 'Sun', voltage: 215, temp: 48 },
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch IoT telemetry:", error);
            }
        };

        fetchTelemetry();

        // Supabase Realtime simplifies this! For now, keep the 15s polling to map 1:1 with old behavior
        const interval = setInterval(fetchTelemetry, 15000);
        return () => clearInterval(interval);
    }, []);

    const [isDispatching, setIsDispatching] = useState(false);
    const [dispatched, setDispatched] = useState(false);

    const handleRunDiagnostics = async () => {
        setIsScanning(true);
        setDispatched(false);
        try {
            // Post actual telemetry array natively to Edge AI Next.js route
            const res = await fetch(`/api/diagnostic`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ telemetry: telemetryData })
            });
            const aiData = await res.json();

            let status_code = 'ok';
            if (aiData.impact_score >= 80) status_code = 'critical';
            else if (aiData.impact_score >= 40) status_code = 'warning';

            setScanResult({
                status_code,
                model_version: 'Gemini-1.5-Flash (Edge AI)',
                degradation_risk_score: aiData.impact_score / 100,
                primary_factor: (aiData.impact_score >= 40) ? 'Hardware Degradation / Heat Anomaly' : 'Optimal Operation',
                recommended_action: aiData.diagnostic || "No diagnostic provided."
            });
        } catch (e) {
            console.error(e);
        } finally {
            setIsScanning(false);
        }
    };

    const handleDispatchTechnician = async () => {
        setIsDispatching(true);
        try {
            const { error } = await supabase.from('maintenance_tickets').insert({
                panel_id: "UL-H20-9941X",
                customer_name: "John Doe (Connected Prosumer)",
                address: "Simulated Array Address, Bengaluru",
                task_description: `ML DIAGNOSTIC ALERT: ${scanResult.primary_factor}. Recommended Action: ${scanResult.recommended_action}`
            });
            if (error) throw error;
            setDispatched(true);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setIsDispatching(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--background)", overflowY: "auto", paddingTop: 100, paddingBottom: 60, paddingInline: "5%" }}>

            <div className="glass-card" style={{ padding: 40, width: "100%", maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid var(--card-border)", paddingBottom: 24 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                            <div style={{ padding: "6px 12px", background: "var(--card-bg)", color: "var(--success)", border: "1px solid var(--success)", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>VERIFIED PROSUMER</div>
                            <div style={{ padding: "6px 12px", background: "var(--card-bg)", color: "var(--accent)", border: "1px solid var(--accent)", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>IOT CONNECTED</div>
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
                        disabled={isScanning || isDispatching}
                        style={{ padding: "16px 32px", borderRadius: 12, border: "1px solid var(--card-border)", background: isScanning ? "var(--hover-bg)" : "var(--foreground)", color: isScanning ? "var(--text-muted)" : "var(--background)", fontSize: 16, fontWeight: 700, cursor: isScanning ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 12 }}
                    >
                        {isScanning ? <><Loader2 size={20} className="lucide-spin" /> Analyzing Tensors...</> : <><Cpu size={20} /> Run ML Hardware Scan</>}
                    </button>
                </div>

                {/* ML Result Box */}
                {scanResult && (
                    <div style={{ padding: 24, borderRadius: 16, background: "var(--card-bg)", border: `1px solid ${scanResult.status_code === 'critical' ? 'var(--danger)' : scanResult.status_code === 'warning' ? 'var(--warning)' : 'var(--success)'}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                            {scanResult.status_code === 'critical' ? <AlertTriangle size={36} color="var(--danger)" /> : <ShieldCheck size={36} color="var(--success)" />}
                            <div>
                                <h3 style={{ margin: 0, fontSize: 20, color: "var(--foreground)" }}>Diagnostics Complete ({scanResult.model_version})</h3>
                                <div style={{ color: scanResult.status_code === 'critical' ? "var(--danger)" : "var(--text-muted)", fontSize: 14 }}>
                                    Probability of Imminent Failure: {(scanResult.degradation_risk_score * 100).toFixed(1)}%
                                </div>
                            </div>
                        </div>
                        <div style={{ background: "var(--hover-bg)", padding: "16px 20px", borderRadius: 12, fontSize: 15, color: "var(--foreground)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span><strong>Primary Factor Detected:</strong> {scanResult.primary_factor}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 8, color: scanResult.status_code === 'critical' ? "var(--danger)" : "var(--success)" }}>
                                <ArrowRight size={16} /> {scanResult.recommended_action}
                                {scanResult.status_code === 'critical' && !dispatched && (
                                    <button
                                        onClick={handleDispatchTechnician}
                                        disabled={isDispatching}
                                        style={{ marginLeft: 16, padding: "6px 16px", borderRadius: 100, border: "none", background: "var(--danger)", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                                    >
                                        {isDispatching ? "Dispatching..." : "Dispatch Technician"}
                                    </button>
                                )}
                                {dispatched && (
                                    <span style={{ marginLeft: 16, padding: "6px 16px", borderRadius: 100, background: "rgba(34,197,94,0.1)", color: "var(--success)", fontWeight: 700, fontSize: 12 }}>
                                        Ticket Created!
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                )}

                {/* Telemetry Charts & 3D Twin */}
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>

                    {/* Live Digital Twin Visualization */}
                    <div style={{ flex: 1, minWidth: 400, height: 320, background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--card-border)", padding: 8 }}>
                        <DigitalTwin3D temperature={latestTemp} />
                    </div>

                    <div style={{ flex: 1, minWidth: 400, height: 320, background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--card-border)", padding: 24 }}>
                        <h3 style={{ margin: "0 0 24px 0", fontSize: 16, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
                            <Zap size={18} color="var(--accent)" /> Array Voltage Log (7 Days)
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={telemetryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} />
                                <YAxis domain={[200, 240]} stroke="var(--text-muted)" fontSize={11} />
                                <Tooltip contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8, color: "var(--foreground)" }} />
                                <Area type="monotone" dataKey="voltage" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorV)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ flex: 1, minWidth: 400, height: 320, background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--card-border)", padding: 24 }}>
                        <h3 style={{ margin: "0 0 24px 0", fontSize: 16, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
                            <Activity size={18} color="var(--danger)" /> Panel Heat Stress (Deg C)
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
                                <Tooltip contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8, color: "var(--foreground)" }} />
                                <Area type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorT)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                </div>

            </div>
        </div>
    );
}
