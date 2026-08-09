"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Clock, Navigation, Zap, AlertTriangle, ArrowLeft, Sun } from "lucide-react";
import * as SunCalc from "suncalc";

// Jodhpur Coordinates (Default)
const DEFAULT_LAT = 26.2389;
const DEFAULT_LON = 73.0243;
const POLE_HEIGHT_METERS = 2;

export default function ShadowSimulationPage() {
    // Current simulated time within the UI
    const [simTime, setSimTime] = useState<Date>(new Date());
    const [timeSlider, setTimeSlider] = useState(12); // Default Noon (0.0 to 24.0)

    const [metrics, setMetrics] = useState({
        azimuth: 0,
        altitude: 0,
        shadowLength: 0,
        shadowDirection: 0
    });

    useEffect(() => {
        // Build a date object based on the slider representing the hour of day
        const today = new Date();
        today.setHours(Math.floor(timeSlider), (timeSlider % 1) * 60, 0);
        setSimTime(today);

        // SunCalc logic
        const sunPos = SunCalc.getPosition(today, DEFAULT_LAT, DEFAULT_LON);

        // SunCalc returns altitude and azimuth in radians
        const altDeg = sunPos.altitude * (180 / Math.PI);
        let aziDeg = sunPos.azimuth * (180 / Math.PI);

        // Ensure Azimuth is 0-360 degrees where 0 is South, 90 is West. Convert to normal Compass (0=N)
        aziDeg = (aziDeg + 180) % 360;

        let shadow = 0;
        if (altDeg > 0) {
            // Shadow Length = Height / tan(altitude)
            shadow = POLE_HEIGHT_METERS / Math.tan(sunPos.altitude);
        } else {
            shadow = 0; // No shadow at night
        }

        setMetrics({
            azimuth: aziDeg,
            altitude: altDeg,
            shadowLength: shadow,
            // Shadow goes opposite of the sun
            shadowDirection: (aziDeg + 180) % 360
        });

    }, [timeSlider]);

    // CSS variables to map the shadow dynamically
    // A 1 meter shadow = 20px on screen for scale
    const shadowScale = metrics.altitude > 0 ? (metrics.shadowLength * 20) : 0;

    // Using CSS filter `drop-shadow` to simulate the darkness
    // Standard X, Y offsets based on trigonometry of the direction
    const dx = Math.sin(metrics.shadowDirection * (Math.PI / 180)) * shadowScale;
    const dy = -Math.cos(metrics.shadowDirection * (Math.PI / 180)) * shadowScale; // negative because screen Y is flipped

    return (
        <div className="page-container">
            <div className="content-section" style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 100 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                    <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                        <ArrowLeft size={16} /> Back
                    </Link>
                    <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, display: "flex", alignItems: "center", gap: 12 }}>
                        <Sun color="var(--warning)" size={32} />
                        Solar Shadow Simulator
                    </h1>
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 32, marginBottom: 32 }}>
                    <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 16 }}>
                        Utilizing the astronomical <strong>SunCalc (NOAA Algorithm)</strong> physics engine. Adjust the time of day to instantly calculate true localized solar azimuth, elevation, and structural shadow casting for Jodhpur, Rajasthan (Lat: {DEFAULT_LAT}, Lon: {DEFAULT_LON}).
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
                        <Clock size={24} color="var(--primary)" />
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontWeight: 600 }}>Simulation Time</span>
                                <span style={{ fontFamily: "monospace", color: "var(--primary)", fontWeight: "bold" }}>
                                    {simTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0" max="24" step="0.25"
                                value={timeSlider}
                                onChange={(e) => setTimeSlider(parseFloat(e.target.value))}
                                style={{
                                    width: "100%", accentColor: "var(--primary)", height: 6, borderRadius: 10
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                        {/* Simulation Viewport */}
                        <div style={{
                            height: 300,
                            background: "var(--bg-secondary)",
                            borderRadius: 16,
                            border: "1px solid rgba(255,255,255,0.1)",
                            position: "relative",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            {/* Grid Lines */}
                            <div style={{ position: "absolute", inset: 0, backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px', zIndex: 0 }}></div>

                            {/* The "Object" casting shadow (e.g., a 2x2 meter structural box) */}
                            {metrics.altitude > 0 && (
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    background: "var(--accent-blue)",
                                    borderRadius: 4,
                                    zIndex: 10,
                                    position: "relative",
                                    boxShadow: `${dx}px ${dy}px 5px rgba(0,0,0,0.5)`,
                                    transition: "box-shadow 0.1s linear"
                                }}>
                                    <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", fontSize: 10, fontWeight: "bold" }}>N</div>
                                </div>
                            )}
                            {metrics.altitude <= 0 && (
                                <div style={{ zIndex: 10, color: "var(--text-secondary)", fontWeight: 600 }}>
                                    Night Time (No Shadows)
                                </div>
                            )}
                        </div>

                        {/* Real-Time Metrics Output */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div className="info-card" style={{ padding: 16 }}>
                                <div style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase" }}>Solar Elevation (Altitude)</div>
                                <div style={{ fontSize: 24, fontWeight: "bold" }}>{metrics.altitude.toFixed(2)}°</div>
                                {metrics.altitude < 0 && <span style={{ color: "var(--danger)", fontSize: 13 }}>Below Horizon</span>}
                            </div>
                            <div className="info-card" style={{ padding: 16 }}>
                                <div style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase" }}>Solar Azimuth</div>
                                <div style={{ fontSize: 24, fontWeight: "bold" }}>{metrics.azimuth.toFixed(2)}° <span style={{ fontSize: 14 }}>(Compass)</span></div>
                            </div>
                            <div className="info-card" style={{ padding: 16, background: "rgba(245, 158, 11, 0.05)", border: "1px solid var(--warning)" }}>
                                <div style={{ fontSize: 12, color: "var(--warning)", textTransform: "uppercase" }}>Projected Shadow Length</div>
                                <div style={{ fontSize: 24, fontWeight: "bold", color: "var(--warning)" }}>{metrics.shadowLength.toFixed(2)} meters</div>
                                <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>Based on a {POLE_HEIGHT_METERS}m high obstruction</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
