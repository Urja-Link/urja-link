"use client";

import { useEffect, useState } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

interface TelemetryData {
    live_irradiance_w_m2: number;
    average_cloud_cover_pct: number;
    active_power_generation_gw: number;
    live_co2_saved_mt: number;
    installations_today: number;
    timestamp: number;
}

export default function TelemetryMonitor() {
    const [data, setData] = useState<TelemetryData | null>(null);
    const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}/ws/live-telemetry`);

        ws.onopen = () => setStatus("connected");
        ws.onclose = () => setStatus("disconnected");
        ws.onerror = () => setStatus("disconnected");

        ws.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data);
                setData(parsed);
            } catch (e) {
                console.error("Invalid WS payload", e);
            }
        };

        return () => ws.close();
    }, []);

    if (!data) {
        return (
            <div className="info-card" style={{ padding: 20, textAlign: "center", minHeight: 120 }}>
                Loading Live Telemetry... <span style={{ color: status === "disconnected" ? "red" : "orange" }}>•</span>
            </div>
        );
    }

    return (
        <div className="info-card" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, color: "var(--accent)" }}>📡 National Grid Live Telemetry</h3>
                <span style={{ color: status === "connected" ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                    {status === "connected" ? "LIVE •" : "OFFLINE"}
                </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                <div style={{ padding: 12, background: "rgba(59, 130, 246, 0.05)", borderRadius: 8, border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Active Generation</div>
                    <div style={{ fontSize: 24, fontWeight: "bold", color: "#3b82f6" }}>{data.active_power_generation_gw.toFixed(2)} GW</div>
                </div>
                <div style={{ padding: 12, background: "rgba(245, 158, 11, 0.05)", borderRadius: 8, border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Avg Irradiance</div>
                    <div style={{ fontSize: 24, fontWeight: "bold", color: "#f59e0b" }}>{data.live_irradiance_w_m2.toFixed(1)} W/m²</div>
                </div>
                <div style={{ padding: 12, background: "rgba(16, 185, 129, 0.05)", borderRadius: 8, border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>CO₂ Offset Today</div>
                    <div style={{ fontSize: 24, fontWeight: "bold", color: "#10b981" }}>{data.live_co2_saved_mt.toFixed(3)} MT</div>
                </div>
                <div style={{ padding: 12, background: "rgba(139, 92, 246, 0.05)", borderRadius: 8, border: "1px solid rgba(139, 92, 246, 0.2)" }}>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Cloud Cover</div>
                    <div style={{ fontSize: 24, fontWeight: "bold", color: "#8b5cf6" }}>{data.average_cloud_cover_pct}%</div>
                </div>
            </div>
        </div>
    );
}
