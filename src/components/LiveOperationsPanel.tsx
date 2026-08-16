"use client";
import React, { useEffect, useState, useRef } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { formatNumber } from "@/lib/utils";

interface TelemetryData {
    live_irradiance_w_m2: number;
    average_cloud_cover_pct: number;
    active_power_generation_gw: number;
    live_co2_saved_mt: number;
    installations_today: number;
    timestamp: number;
}

export default function LiveOperationsPanel() {
    const [history, setHistory] = useState<TelemetryData[]>([]);
    const [current, setCurrent] = useState<TelemetryData | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Connect to FastAPI WebSocket
        const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://urja-link-api.onrender.com";
        const wsUrl = API_BASE.replace("http", "ws") + "/ws/live-telemetry";

        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => setIsConnected(true);
        ws.current.onclose = () => setIsConnected(false);

        ws.current.onmessage = (event) => {
            const data: TelemetryData = JSON.parse(event.data);
            setCurrent(data);
            setHistory(prev => {
                const newHistory = [...prev, data];
                // Keep only last 20 data points for active chart smoothing
                if (newHistory.length > 20) newHistory.shift();
                return newHistory;
            });
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, []);

    const displayCurrent = current || {
        live_irradiance_w_m2: 0,
        average_cloud_cover_pct: 0,
        active_power_generation_gw: 0,
        live_co2_saved_mt: 0,
        installations_today: 0,
        timestamp: 0
    };

    return (
        <div className="glass-card" style={{ padding: "clamp(16px, 4vw, 24px)", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                    ⚡ Telemetry Monitor
                    <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: isConnected ? '#10b981' : '#ef4444',
                        boxShadow: isConnected ? '0 0 10px #10b981' : 'none'
                    }} />
                </h2>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>National Grid Telemetry</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(125px, 100%), 1fr))", gap: 16 }}>
                <div>
                    <div style={{ fontSize: 11, color: "#cbd5e1" }}>Active Power (GW)</div>
                    <div style={{ fontSize: 24, fontWeight: "bold", color: "#38bdf8" }}>{formatNumber(displayCurrent.active_power_generation_gw, 2)}</div>
                </div>
                <div>
                    <div style={{ fontSize: 11, color: "#cbd5e1" }}>Avg Irradiance</div>
                    <div style={{ fontSize: 24, fontWeight: "bold", color: "#fcd34d" }}>{formatNumber(displayCurrent.live_irradiance_w_m2, 1)} <span style={{ fontSize: 10 }}>W/m²</span></div>
                </div>
                <div>
                    <div style={{ fontSize: 11, color: "#cbd5e1" }}>Cloud Cover</div>
                    <div style={{ fontSize: 24, fontWeight: "bold", color: "#94a3b8" }}>{Math.round(Number(displayCurrent.average_cloud_cover_pct) || 0)}%</div>
                </div>
                <div>
                    <div style={{ fontSize: 11, color: "#cbd5e1" }}>CO2 Saved (MT)</div>
                    <div style={{ fontSize: 24, fontWeight: "bold", color: "#10b981" }}>{formatNumber(displayCurrent.live_co2_saved_mt, 2)}</div>
                </div>
                <div>
                    <div style={{ fontSize: 11, color: "#cbd5e1" }}>Installations Today</div>
                    <div style={{ fontSize: 24, fontWeight: "bold", color: "#f43f5e" }}>{Number(displayCurrent.installations_today) || 0}</div>
                </div>
            </div>

            {/* Mini active chart tracking fluctuation */}
            <div style={{ height: 60, marginTop: 20, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <YAxis domain={['dataMin - 0.1', 'dataMax + 0.1']} hide />
                        <Area
                            type="monotone"
                            dataKey="active_power_generation_gw"
                            stroke="#38bdf8"
                            fillOpacity={1}
                            fill="url(#colorPower)"
                            isAnimationActive={false} // Disable animation to allow fluid stream look
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
