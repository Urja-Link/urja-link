"use client";

import React from "react";
import { Zap, Leaf, IndianRupee, Sun, ShieldCheck } from "lucide-react";

interface UrjaScoreProps {
    scoreData: {
        total: number;
        breakdown: {
            roof_area: number;
            orientation: number;
            solar_resource: number;
            obstructions: number;
            shading: number;
        };
    };
    financials: {
        annual_savings_inr: number;
        payback_years: number;
        co2_offset_tonnes: number;
        installation_cost_est_inr: number;
    };
    physics: {
        system_capacity_kw: number;
        annual_generation_kwh: number;
    };
}

export default function UrjaScoreCard({ scoreData, financials, physics }: UrjaScoreProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-400";
        if (score >= 60) return "text-yellow-400";
        return "text-red-400";
    };

    const getBorderColor = (score: number) => {
        if (score >= 80) return "border-green-500/40 shadow-[0_0_30px_rgba(34,197,94,0.15)]";
        if (score >= 60) return "border-yellow-500/40 shadow-[0_0_30px_rgba(234,179,8,0.15)]";
        return "border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.15)]";
    };

    return (
        <div className="w-full bg-[#050505] border border-[#38bdf8]/20 rounded-2xl p-6 shadow-2xl mt-6 relative overflow-hidden">
            {/* Subtle overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#38bdf8]/5 to-transparent blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">

                {/* Left Column: The Core Score */}
                <div className="flex flex-col items-center justify-center min-w-[200px] border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
                    <span className="text-white/50 text-[11px] font-black tracking-[0.2em] uppercase mb-4">Urja Suitability</span>

                    <div className={`relative flex items-center justify-center w-32 h-32 rounded-full border-4 ${getBorderColor(scoreData.total)}`}>
                        <div className="absolute inset-2 rounded-full border border-white/5 bg-[#111] flex items-center justify-center flex-col shadow-inner">
                            <span className={`text-5xl font-black tracking-tighter ${getScoreColor(scoreData.total)}`}>{scoreData.total}</span>
                        </div>
                    </div>

                    <div className="mt-5 text-center">
                        <span className="text-white/90 font-bold tracking-wide text-lg">
                            {scoreData.total >= 80 ? "Excellent Profile" : scoreData.total >= 60 ? "Moderate Viability" : "Poor Structure"}
                        </span>
                        <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mt-1">Based on 5 Physics Vectors</p>
                    </div>
                </div>

                {/* Middle Column: Score Breakdown */}
                <div className="flex-1 w-full flex flex-col justify-center space-y-3.5 border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
                    <h3 className="text-[11px] font-black text-[#38bdf8] uppercase tracking-[0.2em] mb-2">Technical Breakdown</h3>

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-white/70 font-semibold tracking-wide">Roof Usable Area</span>
                        <span className="text-sm text-white font-mono font-bold bg-white/5 px-2 py-0.5 rounded">{scoreData.breakdown.roof_area} / 25</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-white/70 font-semibold tracking-wide">Orientation (Azimuth)</span>
                        <span className="text-sm text-white font-mono font-bold bg-white/5 px-2 py-0.5 rounded">{scoreData.breakdown.orientation} / 20</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-white/70 font-semibold tracking-wide">Solar Resource (GHI)</span>
                        <span className="text-sm text-white font-mono font-bold bg-white/5 px-2 py-0.5 rounded">{scoreData.breakdown.solar_resource} / 20</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-white/70 font-semibold tracking-wide">Obstructions Deductions</span>
                        <span className="text-sm text-white font-mono font-bold bg-white/5 px-2 py-0.5 rounded">{scoreData.breakdown.obstructions} / 15</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-white/70 font-semibold tracking-wide">Shading Losses</span>
                        <span className="text-sm text-white font-mono font-bold bg-white/5 px-2 py-0.5 rounded">{scoreData.breakdown.shading} / 10</span>
                    </div>
                </div>

                {/* Right Column: Financial & Physical Economics */}
                <div className="flex-1 w-full grid grid-cols-2 gap-3">
                    <h3 className="col-span-2 text-[11px] font-black text-[#22c55e] uppercase tracking-[0.2em] mb-1">Economic Layer</h3>

                    <div className="bg-[#111] border border-white/5 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 text-white/50 mb-1">
                            <Zap className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">System Size</span>
                        </div>
                        <span className="text-lg font-black text-white">{physics.system_capacity_kw.toFixed(1)} kW</span>
                    </div>

                    <div className="bg-[#111] border border-white/5 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 text-white/50 mb-1">
                            <Sun className="w-3.5 h-3.5 text-orange-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Annual Gen</span>
                        </div>
                        <span className="text-lg font-black text-white">{physics.annual_generation_kwh.toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh</span>
                    </div>

                    <div className="bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 text-[#22c55e]/80 mb-1">
                            <IndianRupee className="w-3.5 h-3.5 text-[#22c55e]" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Est. Savings</span>
                        </div>
                        <span className="text-xl font-black text-[#22c55e]">₹{financials.annual_savings_inr.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        <div className="text-[10px] text-[#22c55e]/50 font-semibold mt-0.5 uppercase tracking-wide">per year</div>
                    </div>

                    <div className="bg-[#111] border border-white/5 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 text-white/50 mb-1">
                            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">CO2 Offset</span>
                        </div>
                        <span className="text-lg font-black text-white">{financials.co2_offset_tonnes.toFixed(1)}T</span>
                        <div className="text-[10px] text-white/30 font-semibold mt-0.5 uppercase tracking-wide">per year</div>
                    </div>

                    <div className="col-span-2 bg-[#111]/50 rounded-xl p-2.5 px-3 flex items-center justify-between border border-white/5">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
                            <span className="text-[11px] font-semibold text-white/70 uppercase tracking-widest">Turnkey Payback</span>
                        </div>
                        <strong className="text-[#38bdf8] font-black">{financials.payback_years.toFixed(1)} Years</strong>
                    </div>
                </div>

            </div>
        </div>
    );
}
