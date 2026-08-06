"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity, Zap, DollarSign, ArrowRightLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useLanguage } from "@/context/LanguageContext";

interface MarketTick {
    spot_price_inr: number;
    grid_demand_pct: number;
    timeLabel: string;
}

export default function MarketplacePage() {
    const { t } = useLanguage();
    const [priceHistory, setPriceHistory] = useState<MarketTick[]>([]);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [demand, setDemand] = useState(0);
    const [wsError, setWsError] = useState(false);

    useEffect(() => {
        // Hydrate initial mock data
        const initial = Array.from({ length: 30 }).map((_, i) => ({
            spot_price_inr: 4.5 + Math.random() * 0.5,
            grid_demand_pct: 70,
            timeLabel: `T-${30 - i}`
        }));
        setPriceHistory(initial);

        const baseUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
        const ws = new WebSocket(`${baseUrl}/ws/market`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setCurrentPrice(data.spot_price_inr);
            setDemand(data.grid_demand_pct);

            setPriceHistory(prev => {
                const now = new Date();
                const newTick = {
                    spot_price_inr: data.spot_price_inr,
                    grid_demand_pct: data.grid_demand_pct,
                    timeLabel: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
                };
                return [...prev.slice(1), newTick];
            });
        };

        ws.onerror = () => setWsError(true);

        return () => ws.close();
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "url('/satellite-bg.webp')", backgroundSize: "cover", overflowY: "auto", paddingTop: 100, paddingBottom: 60, paddingInline: "5%" }}>

            <div className="glass-card" style={{ padding: 40, width: "100%", maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px 0", color: "var(--foreground)", display: "flex", alignItems: "center", gap: 12 }}>
                            <ArrowRightLeft size={32} color="#f59e0b" /> P2P Energy Marketplace
                        </h1>
                        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 15 }}>
                            Trade your surplus solar energy to the local grid in real-time.
                        </p>
                    </div>

                    <div style={{ padding: "16px 24px", background: "rgba(0,0,0,0.3)", borderRadius: 16, border: "1px solid var(--card-border)", display: "flex", gap: 24 }}>
                        <div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Live Spot Price</div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: "#22c55e", display: "flex", alignItems: "center", gap: 8 }}>
                                ₹{currentPrice.toFixed(2)} <span style={{ fontSize: 14 }}>/kWh</span>
                            </div>
                        </div>
                        <div style={{ width: 1, background: "var(--card-border)" }}></div>
                        <div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Local Grid Demand</div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: demand > 85 ? "#ef4444" : "#f59e0b", display: "flex", alignItems: "center", gap: 8 }}>
                                <Activity size={24} /> {demand}%
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ width: "100%", height: 350, background: "rgba(0,0,0,0.15)", borderRadius: 16, border: "1px solid var(--card-border)", padding: 24 }}>
                    <h3 style={{ margin: "0 0 24px 0", fontSize: 16, color: "var(--foreground)" }}>Spot Rate Volatility (Last 30 Ticks)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={priceHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="timeLabel" stroke="var(--text-muted)" fontSize={11} tickMargin={10} />
                            <YAxis domain={['auto', 'auto']} stroke="var(--text-muted)" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                            <Tooltip contentStyle={{ background: "rgba(9,9,11,0.9)", border: "1px solid var(--card-border)", borderRadius: 8, color: "var(--foreground)" }} />
                            <Line type="monotone" dataKey="spot_price_inr" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "#10b981" }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ display: "flex", gap: 24 }}>
                    <button style={{ flex: 1, padding: "20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #10b981, #059669)", color: "white", fontSize: 18, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: "0 8px 24px rgba(16, 185, 129, 0.3)" }}>
                        <Zap size={20} /> Export Energy (SELL)
                    </button>
                    <button style={{ flex: 1, padding: "20px", borderRadius: 12, border: "1px solid var(--card-border)", background: "rgba(255,255,255,0.05)", color: "var(--foreground)", fontSize: 18, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                        <DollarSign size={20} /> Withdraw Wallet Balance
                    </button>
                </div>
            </div>
        </div>
    );
}
