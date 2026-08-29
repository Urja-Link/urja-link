"use client";

import React, { useState, useEffect } from "react";
import ThreeDigitalTwin from "./ThreeDigitalTwin";
import { Clock, Maximize } from "lucide-react";

interface SolarSimulationWidgetProps {
    initialUsableArea?: number;
}

export default function SolarSimulationWidget({ initialUsableArea = 1200 }: SolarSimulationWidgetProps) {
    // We use hours from 0 to 24 for the slider. Default to Noon (12.0)
    const [timeSlider, setTimeSlider] = useState<number>(12.0);
    const [simulationDate, setSimulationDate] = useState<Date>(new Date());

    // Fixed coordinates for the Urja-Link demo (e.g., somewhere in India)
    const [latitude, setLatitude] = useState(28.6139); // New Delhi
    const [longitude, setLongitude] = useState(77.2090);

    useEffect(() => {
        // Dynamically update the precise Date object when the user modifies the slider.
        // This allows SunCalc to instantly compute new astronomical physics limits.
        const newDate = new Date();
        newDate.setHours(Math.floor(timeSlider), (timeSlider % 1) * 60, 0, 0);
        setSimulationDate(newDate);
    }, [timeSlider]);

    // Formatting helper for the digital clock display
    const formatTime = (decimalHours: number) => {
        const hours = Math.floor(decimalHours);
        const mins = Math.round((decimalHours - hours) * 60);
        const suffix = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${suffix}`;
    };

    return (
        <div className="w-full h-full min-h-[600px] flex flex-col bg-[#050505] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
            {/* Simulation Engine Controls Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/60 relative z-20 shadow-lg">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Maximize className="w-5 h-5 text-[#00E5FF]" />
                        3D Digital Twin Sandbox
                    </h2>
                    <p className="text-sm text-white/50 mt-1.5 font-medium max-w-md leading-relaxed">
                        Physical rigid-body shadow simulation powered by hardware-accelerated WebGL and exact astronomical positioning.
                    </p>
                </div>

                {/* Interactive Physics Controls */}
                <div className="flex flex-col items-end gap-3 bg-[#111111] p-4 rounded-xl border border-white/10 min-w-[320px] shadow-inner">
                    <div className="flex items-center justify-between w-full">
                        <span className="text-xs text-white/50 flex items-center gap-1.5 uppercase tracking-widest font-bold">
                            <Clock className="w-3.5 h-3.5" /> Simulation Time
                        </span>
                        <span className="text-sm font-mono text-[#00E5FF] font-bold bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20">
                            {formatTime(timeSlider)}
                        </span>
                    </div>

                    <input
                        type="range"
                        min="4" // 4 AM Sunrise limit
                        max="20" // 8 PM Sunset limit
                        step="0.05" // Super smooth 3-minute intervals
                        value={timeSlider}
                        onChange={(e) => setTimeSlider(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-ew-resize accent-[#00E5FF]"
                    />
                    <div className="flex justify-between w-full text-[10px] text-white/30 uppercase font-black tracking-widest px-1">
                        <span>Dawn</span>
                        <span>Noon</span>
                        <span>Dusk</span>
                    </div>
                </div>
            </div>

            {/* Massive 3D WebGL Canvas Container */}
            <div className="flex-grow w-full relative">
                <ThreeDigitalTwin
                    latitude={latitude}
                    longitude={longitude}
                    simulationTime={simulationDate}
                    usableAreaSqFt={initialUsableArea}
                    roofOrientation={0}
                />
            </div>
        </div>
    );
}
