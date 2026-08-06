"use client";

import ROIChart from "./ROIChart";
import {
    Sun, MapPin, Satellite, Thermometer, Cloud, Wind,
    Zap, BarChart, IndianRupee, Landmark, Globe,
    Settings, RotateCw, Factory
} from "lucide-react";

interface MonthlyGeneration {
    month: string;
    generation_kwh: number;
    ghi_kwh_m2_day: number;
    days: number;
}

interface SolarData {
    system_capacity_kw: number;
    annual_generation_kwh: number;
    total_cost_inr: number;
    subsidy_inr: number;
    net_cost_inr: number;
    annual_savings_inr: number;
    payback_period_years: number;
    co2_reduction_kg_year: number;
    environmental_data?: {
        data_source: string;
        current_temperature_c: number;
        current_cloud_cover_pct: number;
        current_humidity_pct: number;
        current_wind_speed_m_s: number;
        current_precipitation_mm: number;
        air_quality_pm25: number;
        air_quality_pm10: number;
        aerosol_optical_depth: number;
    };
    physics_metrics?: {
        daily_peak_sun_hours: number;
        system_performance_ratio: number;
        ai_shadow_loss_pct: number;
        temperature_loss_pct: number;
        soiling_loss_pct: number;
        cloud_loss_pct: number;
        orientation_factor: number;
    };
    generation_breakdown?: {
        daily_avg_kwh: number;
        monthly_avg_kwh: number;
        annual_total_kwh: number;
        monthly_detail: MonthlyGeneration[];
    };
    savings?: {
        daily_savings_inr: number;
        monthly_savings_inr: number;
        annual_savings_inr: number;
        lifetime_savings_inr: number;
        co2_reduction_kg_year: number;
        co2_reduction_tonnes_lifetime: number;
        trees_equivalent: number;
    };
    financial_projections?: {
        payback_period_years_exact: number;
        lifetime_net_savings_inr: number;
        lifetime_maintenance_cost_inr: number;
        lifetime_roi_percentage: number;
        year_1_savings: number;
        cashflow_projection: any[];
    };
}

interface SolarReportPanelProps {
    data: SolarData | null;
    isLoading: boolean;
    selectedSystem: number;
    onSystemChange: (kw: number) => void;
    coords: { lat: number; lng: number } | null;
}

function formatINR(num: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency", currency: "INR", maximumFractionDigits: 0,
    }).format(num);
}

export default function SolarReportPanel({ data, isLoading, selectedSystem, onSystemChange, coords }: SolarReportPanelProps) {
    if (!coords) return null;

    return (
        <div className="report-panel glass-card">
            <h2 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Sun size={20} color="var(--accent)" /> Solar Potential Report
            </h2>

            {/* Location */}
            <div style={{ marginBottom: 14 }}>
                <span className="metric-label" style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> Location</span>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
                    {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </p>
            </div>

            {/* System Size Selector */}
            <div>
                <span className="metric-label">Select System Size</span>
                <div className="system-btn-group">
                    {[3, 5, 10].map((kw) => (
                        <button key={kw} className={`system-btn ${selectedSystem === kw ? "active" : ""}`}
                            onClick={() => onSystemChange(kw)}>
                            {kw} kW
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                    <div>
                        <span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" />
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 10 }}>
                        Fetching real-time solar data...
                    </p>
                </div>
            )}

            {/* Results */}
            {data && !isLoading && (
                <>
                    {/* Data Source Badge */}
                    {data.environmental_data && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "12px 0" }}>
                            <span className="env-badge"><Satellite size={12} /> {data.environmental_data.data_source}</span>
                            <span className="env-badge"><Thermometer size={12} /> {data.environmental_data.current_temperature_c}°C</span>
                            <span className="env-badge"><Cloud size={12} /> {data.environmental_data.current_cloud_cover_pct}%</span>
                            <span className="env-badge"><Wind size={12} /> PM2.5: {data.environmental_data.air_quality_pm25}</span>
                        </div>
                    )}

                    {/* AI Recommendation */}
                    <div style={{ textAlign: "center", margin: "14px 0" }}>
                        <span className="recommendation-badge">AI Recommends: {data.system_capacity_kw} kW System</span>
                    </div>

                    {/* Energy Generation Breakdown */}
                    <div style={{
                        marginBottom: 14, padding: 14, borderRadius: 12,
                        background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)",
                    }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                            <Zap size={16} /> Energy Generation
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
                            <div>
                                <p style={{ fontSize: 18, fontWeight: 800, color: "var(--accent)" }}>
                                    {data.generation_breakdown?.daily_avg_kwh ?? (data.annual_generation_kwh / 365).toFixed(1)}
                                </p>
                                <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>kWh / Day</p>
                            </div>
                            <div>
                                <p style={{ fontSize: 18, fontWeight: 800, color: "var(--accent)" }}>
                                    {data.generation_breakdown?.monthly_avg_kwh ?? (data.annual_generation_kwh / 12).toFixed(0)}
                                </p>
                                <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>kWh / Month</p>
                            </div>
                            <div>
                                <p style={{ fontSize: 18, fontWeight: 800, color: "var(--success)" }}>
                                    {data.annual_generation_kwh.toLocaleString("en-IN")}
                                </p>
                                <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>kWh / Year</p>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Generation Chart (mini bar chart) */}
                    {data.generation_breakdown?.monthly_detail && (
                        <div style={{ marginBottom: 14 }}>
                            <span className="metric-label" style={{ display: "flex", alignItems: "center", gap: 6 }}><BarChart size={14} /> Monthly Generation</span>
                            <div style={{
                                display: "flex", gap: 2, alignItems: "flex-end", height: 60,
                                marginTop: 8, padding: "0 2px",
                            }}>
                                {data.generation_breakdown.monthly_detail.map((m) => {
                                    const max = Math.max(...data.generation_breakdown!.monthly_detail.map((x) => x.generation_kwh));
                                    const pct = max > 0 ? (m.generation_kwh / max) * 100 : 0;
                                    return (
                                        <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <div
                                                style={{
                                                    width: "100%",
                                                    height: `${pct}%`,
                                                    minHeight: 4,
                                                    borderRadius: "3px 3px 0 0",
                                                    background: "linear-gradient(to top, var(--gradient-start), var(--gradient-end))",
                                                    transition: "height 0.5s ease",
                                                }}
                                                title={`${m.month}: ${m.generation_kwh} kWh`}
                                            />
                                            <span style={{ fontSize: 8, color: "var(--text-muted)", marginTop: 2 }}>
                                                {m.month.slice(0, 1)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Savings Summary */}
                    {data.savings && (
                        <div style={{
                            marginBottom: 14, padding: 14, borderRadius: 12,
                            background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)",
                        }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--success)", marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
                                <IndianRupee size={16} /> Savings
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
                                <div>
                                    <p style={{ fontSize: 16, fontWeight: 800, color: "var(--success)" }}>
                                        {formatINR(data.savings.daily_savings_inr)}
                                    </p>
                                    <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>Per Day</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 16, fontWeight: 800, color: "var(--success)" }}>
                                        {formatINR(data.savings.monthly_savings_inr)}
                                    </p>
                                    <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>Per Month</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 16, fontWeight: 800, color: "var(--success)" }}>
                                        {formatINR(data.savings.annual_savings_inr)}
                                    </p>
                                    <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>Per Year</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Core Metrics */}
                    <div className="metric-row">
                        <span className="metric-label">System Capacity</span>
                        <span className="metric-value accent">{data.system_capacity_kw} kW</span>
                    </div>
                    <div className="metric-row">
                        <span className="metric-label">Total Installation Cost</span>
                        <span className="metric-value">{formatINR(data.total_cost_inr)}</span>
                    </div>

                    {/* Subsidy */}
                    <div className="subsidy-section">
                        <h3 style={{ display: "flex", alignItems: "center", gap: 6 }}><Landmark size={14} /> PM Surya Ghar Subsidy</h3>
                        <div className="metric-row">
                            <span className="metric-label">Subsidy Amount</span>
                            <span className="metric-value highlight">{formatINR(data.subsidy_inr)}</span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-label">Your Net Cost</span>
                            <span className="metric-value accent">{formatINR(data.net_cost_inr)}</span>
                        </div>
                    </div>

                    <div className="metric-row">
                        <span className="metric-label">Payback Period</span>
                        <span className="metric-value warning">{data.payback_period_years} years</span>
                    </div>

                    {/* CO2 Impact */}
                    {data.savings && (
                        <div style={{
                            margin: "14px 0", padding: 12, borderRadius: 10,
                            background: "rgba(34,197,94,0.06)", textAlign: "center",
                        }}>
                            <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}><Globe size={14} /> Environmental Impact</span>
                            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--success)", marginTop: 4 }}>
                                {data.savings.co2_reduction_tonnes_lifetime} tonnes CO₂ saved over 25 years
                            </p>
                            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                Equivalent to planting {data.savings.trees_equivalent} trees
                            </p>
                        </div>
                    )}

                    {/* Physics Parameters */}
                    {data.physics_metrics && (
                        <div style={{
                            marginTop: 12, padding: 12, borderRadius: 10,
                            background: "rgba(15,23,42,0.3)", border: "1px dashed var(--card-border)",
                        }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}><Settings size={14} /> Physics Parameters</span>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 8, fontSize: 11 }}>
                                <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Sun size={10} color="#f59e0b" /> GHI: <b>{data.physics_metrics.daily_peak_sun_hours} <span style={{ fontSize: 9 }}>kWh/m²/day</span></b></span>
                                <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Settings size={10} /> PR: <b>{(data.physics_metrics.system_performance_ratio * 100).toFixed(1)}%</b></span>
                                <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Cloud size={10} /> Shadow: <b>{data.physics_metrics.ai_shadow_loss_pct}%</b></span>
                                <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Thermometer size={10} /> Temp Loss: <b>{data.physics_metrics.temperature_loss_pct}%</b></span>
                                <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Factory size={10} /> Soiling: <b>{data.physics_metrics.soiling_loss_pct}%</b></span>
                                <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><RotateCw size={10} /> Orientation: <b>{(data.physics_metrics.orientation_factor * 100).toFixed(1)}%</b></span>
                            </div>
                        </div>
                    )}

                    {/* ROI Chart */}
                    {data.financial_projections && (
                        <ROIChart data={data.financial_projections.cashflow_projection} />
                    )}
                </>
            )}
        </div>
    );
}
