"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CashflowData {
    year: number;
    generation_kwh: number;
    tariff_inr: number;
    maintenance_cost_inr: number;
    net_savings_inr: number;
    cumulative_roi_inr: number;
}

interface ROIChartProps {
    data: CashflowData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(56,189,248,0.2)", padding: "10px", borderRadius: "8px", fontSize: "12px", color: "#e2e8f0" }}>
                <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>Year {label}</p>
                <p style={{ margin: "0", color: "#38bdf8" }}>Net ROI: ₹{payload[0].value.toLocaleString("en-IN")}</p>
                {payload[1] && <p style={{ margin: "0", color: "#10b981" }}>Annual Savings: ₹{payload[1].value.toLocaleString("en-IN")}</p>}
            </div>
        );
    }
    return null;
};

export default function ROIChart({ data }: ROIChartProps) {
    if (!data || data.length === 0) return null;

    // We can add a "Year 0" data point for the initial investment cost (negative)
    // But since `cumulative_roi_inr` already accounts for net_cost being subtracted, Year 1 is fine.

    return (
        <div style={{ width: "100%", height: 200, marginTop: "20px" }}>
            <h4 style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "10px" }}>25-Year Deep ROI Projection</h4>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorRoi" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="year" stroke="#475569" fontSize={10} tickFormatter={(val) => `Yr ${val}`} />
                    <YAxis stroke="#475569" fontSize={10} tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="cumulative_roi_inr" stroke="#38bdf8" fillOpacity={1} fill="url(#colorRoi)" />
                    <Area type="monotone" dataKey="net_savings_inr" stroke="#10b981" fillOpacity={1} fill="url(#colorSavings)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
