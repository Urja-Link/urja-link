"use client";

import { useEffect, useState } from "react";
import { Sun, CloudRain, Cloud, Settings, MapPin, Zap, Calendar } from "lucide-react";

interface ForecastData {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    shortwave_radiation_sum: number[];
}

export default function SolarForecastWidget() {
    const [data, setData] = useState<ForecastData | null>(null);
    const [loading, setLoading] = useState(true);

    // Jodhpur, Rajasthan coordinates as the primary national benchmark
    const lat = 26.2389;
    const lon = 73.0243;

    useEffect(() => {
        async function fetchForecast() {
            try {
                // Open-Meteo Free API: 7 Day forecast for temperature and solar radiation
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,shortwave_radiation_sum,precipitation_sum&timezone=auto`);
                const json = await res.json();
                setData(json.daily);
            } catch (err) {
                console.error("Failed to fetch solar forecast", err);
            } finally {
                setLoading(false);
            }
        }
        fetchForecast();
    }, []);

    if (loading) {
        return (
            <div className="glass-card" style={{ padding: 24, minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", color: "var(--text-muted)" }}>
                    <Sun size={32} className="spin-slow" />
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <Calendar size={20} color="var(--warning)" /> 7-Day Solar Forecast
                    </h3>
                    <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "4px 0 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={12} /> Jodhpur, Rajasthan (National Benchmark)
                    </p>
                </div>
                <div style={{ padding: "6px 12px", background: "rgba(234, 179, 8, 0.15)", borderRadius: 16, color: "var(--warning)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <Zap size={14} /> Live AI
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(75px, 1fr))", gap: 12, marginTop: 8 }}>
                {data.time.map((dateStr, idx) => {
                    const dateObj = new Date(dateStr);
                    const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'short' });
                    // MJ/m2 to kWh/m2 (approximate conversion factor 3.6)
                    const radiationKwh = (data.shortwave_radiation_sum[idx] / 3.6).toFixed(1);
                    const maxTemp = Math.round(data.temperature_2m_max[idx]);
                    
                    // Simple heuristic for icons
                    const isCloudy = data.shortwave_radiation_sum[idx] < 15; // Low radiation indicates clouds
                    
                    return (
                        <div key={dateStr} style={{ 
                            background: "rgba(255, 255, 255, 0.03)", 
                            border: "1px solid var(--card-border)", 
                            borderRadius: 12, 
                            padding: "16px 10px", 
                            display: "flex", 
                            flexDirection: "column", 
                            alignItems: "center", 
                            gap: 12,
                            transition: "transform 0.2s, background 0.2s",
                            cursor: "default"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.background = 'rgba(234, 179, 8, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{idx === 0 ? "Today" : dayName}</div>
                            
                            <div>
                                {isCloudy ? <Cloud size={24} color="#94a3b8" /> : <Sun size={24} color="var(--warning)" />}
                            </div>
                            
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--foreground)" }}>{radiationKwh}</div>
                                <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>kWh/m²</div>
                            </div>
                            
                            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginTop: 4 }}>
                                {maxTemp}°C
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "right", fontStyle: "italic" }}>
                Powered by Open-Meteo High-Resolution Forecasting Model
            </div>
        </div>
    );
}
