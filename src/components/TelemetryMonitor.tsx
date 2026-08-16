"use client";

import { useEffect, useState } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://urja-link-api.onrender.com";

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

                // Grid Fluctuation Push Notification Logic
                if (typeof window !== "undefined" && "Notification" in window) {
                    if (Notification.permission === "granted" && parsed.active_power_generation_gw < 5) {
                        new Notification("🚨 Critical Grid Alert", {
                            body: `Active Power Generation dropped heavily to ${parsed.active_power_generation_gw.toFixed(2)} GW!`,
                            icon: "/icon.png"
                        });
                    }
                }

            } catch (e) {
                console.error("Invalid WS payload", e);
            }
        };

        return () => ws.close();
    }, []);

    const requestAlerts = () => {
        if (typeof window !== "undefined" && "Notification" in window) {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("✅ Grid Alerts Enabled", { body: "You will now receive desktop alerts for critical grid surges/drops." });
                }
            });
        }
    };

    if (!data) {
        return (
            <div className="info-card" style={{ padding: 20, textAlign: "center", minHeight: 120 }}>
                Loading Telemetry Data... <span style={{ color: status === "disconnected" ? "red" : "orange" }}>•</span>
            </div>
        );
    }

    return (
        <div className="info-card" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, color: "var(--accent)" }}>📡 National Grid Telemetry</h3>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <button onClick={requestAlerts} style={{ background: "rgba(14,165,233,0.1)", border: "1px solid var(--accent)", color: "var(--accent)", padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: "bold" }}>
                        🔔 Enable Push Alerts
                    </button>
                    <span style={{ color: status === "connected" ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                        {status === "connected" ? "CONNECTED •" : "OFFLINE"}
                    </span>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                <div style={{ padding: 12, background: "rgba(59, 130, 246, 0.05)", borderRadius: 8, border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Active Generation</div>
                    <div style={{ fontSize: 24, fontWeight: "bold", color: "#3b82f6" }}>{data.active_power_generation_gw?.toFixed(2) || "0.00"} GW</div>
                </div>
                <div style={{ padding: 12, background: "rgba(245, 158, 11, 0.05)", borderRadius: 8, border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Avg Irradiance</div>
                    <div style={{ fontSize: 24, fontWeight: "bold", color: "#f59e0b" }}>{data.live_irradiance_w_m2?.toFixed(1) || "0.0"} W/m²</div>
                </div>
                <div style={{ padding: 12, background: "rgba(16, 185, 129, 0.05)", borderRadius: 8, border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>CO₂ Offset Today</div>
                    <div style={{ fontSize: 24, fontWeight: "bold", color: "#10b981" }}>{data.live_co2_saved_mt?.toFixed(3) || "0.000"} MT</div>
                </div>
                <div style={{ padding: 12, background: "rgba(139, 92, 246, 0.05)", borderRadius: 8, border: "1px solid rgba(139, 92, 246, 0.2)" }}>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Cloud Cover</div>
                    <div style={{ fontSize: 24, fontWeight: "bold", color: "#8b5cf6" }}>{data.average_cloud_cover_pct || 0}%</div>
                </div>
            </div>
        </div>
    );
}
