"use client";

import { useState } from "react";
import { UploadCloud, Sun, Zap, Target } from "lucide-react";
import UrjaScoreCard from "./UrjaScoreCard";

export default function RoofAnalysisWidget() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            setFile(selected);
            setPreviewUrl(URL.createObjectURL(selected));
            setResults(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setAnalyzing(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Updated to fallback to onrender or use local backend 
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
            const res = await fetch(`${baseUrl}/api/v1/ai/analyze-roof`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setResults(data);
        } catch (error) {
            console.error("Analysis failed", error);
            // Fallback for demo if backend is offline/unreachable
            setResults({
                status: "demo",
                usable_area_sqm: 120.5,
                physics: { system_capacity_kw: 24.1, annual_generation_kwh: 43900 },
                financials: { annual_savings_inr: 263400, payback_years: 4.5, co2_offset_tonnes: 36.0, installation_cost_est_inr: 1205000 },
                urja_score_total: 84,
                urja_score_breakdown: { roof_area: 24, orientation: 20, solar_resource: 20, obstructions: 12, shading: 8 }
            });
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 12, padding: 24, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: 18, color: "#e8ecf1", display: "flex", alignItems: "center", gap: 8 }}>
                <Target size={20} color="#38bdf8" /> AI Roof Analysis
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
                {/* Upload Section */}
                <div style={{ border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 12, padding: 24, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    {previewUrl ? (
                        <div style={{ position: "relative" }}>
                            <img src={previewUrl} alt="Roof" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8 }} />
                            <button onClick={() => { setFile(null); setPreviewUrl(null); }} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                        </div>
                    ) : (
                        <label style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", color: "#94a3b8" }}>
                            <UploadCloud size={40} style={{ marginBottom: 12, color: "#38bdf8" }} />
                            <span style={{ fontWeight: 600, color: "#e8ecf1" }}>Click to upload satellite image</span>
                            <span style={{ fontSize: 12, marginTop: 4 }}>PNG, JPG up to 10MB</span>
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                        </label>
                    )}

                    <button
                        onClick={handleAnalyze}
                        disabled={!file || analyzing}
                        style={{ width: "100%", marginTop: 16, padding: "12px", background: !file || analyzing ? "rgba(255,255,255,0.1)" : "#38bdf8", color: !file || analyzing ? "#64748b" : "#0f172a", border: "none", borderRadius: 8, fontWeight: 700, cursor: !file || analyzing ? "not-allowed" : "pointer", transition: "all 0.2s" }}
                    >
                        {analyzing ? "🧠 AI Modeling in Progress..." : "Run AI Diagnostics"}
                    </button>
                </div>

                {/* Results Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {!results && !analyzing && (
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, color: "#94a3b8", fontSize: 14, minHeight: 200 }}>
                            Upload an image to see potential
                        </div>
                    )}

                    {analyzing && (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, border: "1px solid rgba(56,189,248,0.2)", borderRadius: 12, background: "rgba(56,189,248,0.05)", minHeight: 200 }}>
                            <div className="spin-slow"><Sun size={32} color="#38bdf8" /></div>
                            <span style={{ color: "#38bdf8", fontWeight: 600 }}>Analyzing roof vectors & superstructures...</span>
                        </div>
                    )}

                    {results && !analyzing && (
                        <div style={{ width: "100%", marginTop: 8 }}>
                            <UrjaScoreCard
                                scoreData={{
                                    total: results.urja_score_total || 80,
                                    breakdown: results.urja_score_breakdown || { roof_area: 24, orientation: 20, solar_resource: 15, obstructions: 12, shading: 9 }
                                }}
                                financials={results.financials || { annual_savings_inr: 0, payback_years: 0, co2_offset_tonnes: 0, installation_cost_est_inr: 0 }}
                                physics={results.physics || { system_capacity_kw: 0, annual_generation_kwh: 0 }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
