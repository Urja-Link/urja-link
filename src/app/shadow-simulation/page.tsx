"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { ArrowLeft, Clock, MapPin, Sun } from "lucide-react";
import * as SunCalc from "suncalc";
import { Canvas } from "@react-three/fiber";
import { Sky, OrbitControls, Environment, SoftShadows } from "@react-three/drei";
import * as THREE from 'three';

const DEFAULT_LAT = 26.2389; // Jodhpur
const DEFAULT_LON = 73.0243;
const DATE_TARGET = new Date(); // Today

// 3D Scene Component
const ShadowScene = ({ timeSlider }: { timeSlider: number }) => {
    // 1. Calculate Sun Position based on slider time
    const sunVector = useMemo(() => {
        const d = new Date(DATE_TARGET);
        d.setHours(Math.floor(timeSlider), (timeSlider % 1) * 60, 0);

        const pos = SunCalc.getPosition(d, DEFAULT_LAT, DEFAULT_LON);
        const alt = pos.altitude;
        const azi = pos.azimuth; // 0 = South, PI/2 = West

        const radius = 50;
        // Convert to Cartesian (Y up. -Z = North, +Z = South, +X = East, -X = West)
        const y = radius * Math.sin(alt);
        const rGround = radius * Math.cos(alt);

        // azimuth 0 is South (+z). PI/2 (90deg) is West (-x).
        const z = rGround * Math.cos(azi);
        const x = rGround * -Math.sin(azi);

        return new THREE.Vector3(x, Math.max(y, -5), z); // keep Y slightly below horizon if night
    }, [timeSlider]);

    const isNight = sunVector.y <= 0;

    return (
        <>
            <ambientLight intensity={isNight ? 0.05 : 0.4} />
            {!isNight && (
                <directionalLight
                    position={[sunVector.x, sunVector.y, sunVector.z]}
                    intensity={2}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                    shadow-camera-left={-10}
                    shadow-camera-right={10}
                    shadow-camera-top={10}
                    shadow-camera-bottom={-10}
                />
            )}

            <Sky sunPosition={sunVector.toArray()} turbidity={isNight ? 0.1 : 0.8} rayleigh={isNight ? 0.3 : 1.2} />
            <SoftShadows size={15} samples={10} focus={0.5} />

            {/* A sample building/obstacle block */}
            <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[2, 3, 2]} />
                <meshStandardMaterial color="#94a3b8" roughness={0.7} />
            </mesh>

            {/* Solar Panel Example */}
            <mesh position={[3, 0.5, 0]} rotation={[-Math.PI / 6, Math.PI / 4, 0]} castShadow receiveShadow>
                <boxGeometry args={[2, 0.1, 3]} />
                <meshStandardMaterial color="#023e8a" metalness={0.8} />
            </mesh>
            {/* Panel pole */}
            <mesh position={[3, 0.25, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 0.5]} />
                <meshStandardMaterial color="#475569" />
            </mesh>

            {/* The Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#1e293b" roughness={1} />
            </mesh>

            <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={30} />
            <Environment preset="night" />
        </>
    );
};

export default function ShadowSimulationPage() {
    const [timeSlider, setTimeSlider] = useState(12);
    const [metrics, setMetrics] = useState({ alt: 0, azi: 0 });

    useEffect(() => {
        const d = new Date(DATE_TARGET);
        d.setHours(Math.floor(timeSlider), (timeSlider % 1) * 60, 0);
        const pos = SunCalc.getPosition(d, DEFAULT_LAT, DEFAULT_LON);

        let aziDeg = (pos.azimuth * 180) / Math.PI;
        aziDeg = (aziDeg + 180) % 360; // standardized compass bearing

        setMetrics({
            alt: (pos.altitude * 180) / Math.PI,
            azi: aziDeg
        });
    }, [timeSlider]);

    const formatTime = (slider: number) => {
        const hrs = Math.floor(slider).toString().padStart(2, '0');
        const mins = (Math.round((slider % 1) * 60)).toString().padStart(2, '0');
        return `${hrs}:${mins}`;
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-900 text-slate-200">
            <div className="container mx-auto px-4 py-8 flex-grow flex flex-col">
                <header className="flex items-center gap-6 mb-8">
                    <Link href="/" className="text-slate-400 hover:text-white transition flex items-center gap-2">
                        <ArrowLeft size={20} /> Back
                    </Link>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Sun className="text-amber-500" size={32} />
                        Astronomical Shadow Physics
                    </h1>
                </header>

                <div className="grid lg:grid-cols-4 gap-8 flex-grow">
                    {/* Controls & Metrics */}
                    <div className="lg:col-span-1 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col gap-6">
                        <div>
                            <h2 className="text-xl font-bold mb-2">Simulation Time</h2>
                            <p className="text-slate-400 text-sm mb-4">Adjust to see structural shadows update in real-time across the day.</p>

                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold flex items-center gap-2"><Clock size={16} /> Local Time</span>
                                <span className="text-amber-400 font-mono text-xl">{formatTime(timeSlider)}</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="24" step="0.25"
                                value={timeSlider}
                                onChange={(e) => setTimeSlider(parseFloat(e.target.value))}
                                className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                            <h3 className="text-xs uppercase text-slate-500 mb-1 flex items-center gap-2">
                                <MapPin size={12} /> Location
                            </h3>
                            <div className="font-semibold">Jodhpur, Rajasthan</div>
                            <div className="text-sm font-mono text-slate-400 mt-1">Lat: {DEFAULT_LAT} / Lon: {DEFAULT_LON}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                                <div className="text-xs uppercase text-slate-500 mb-1">Elevation</div>
                                <div className={`text-xl font-bold ${metrics.alt < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {metrics.alt.toFixed(1)}°
                                </div>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                                <div className="text-xs uppercase text-slate-500 mb-1">Azimuth</div>
                                <div className="text-xl font-bold text-sky-400">
                                    {metrics.azi.toFixed(1)}°
                                </div>
                            </div>
                        </div>

                        {metrics.alt < 0 && (
                            <div className="bg-red-900/40 border border-red-800 text-red-200 p-4 rounded-xl text-sm">
                                <strong>Night Phase:</strong> The sun is below the horizon. Shadows disabled.
                            </div>
                        )}
                        {metrics.alt > 0 && metrics.alt < 15 && (
                            <div className="bg-amber-900/40 border border-amber-800 text-amber-200 p-4 rounded-xl text-sm">
                                <strong>Golden Hour:</strong> Shadows are highly elongated and may reach adjacent arrays.
                            </div>
                        )}
                    </div>

                    {/* 3D Viewport */}
                    <div className="lg:col-span-3 bg-slate-950 rounded-2xl overflow-hidden shadow-2xl relative min-h-[500px] border border-slate-700">
                        <div className="absolute top-4 left-4 z-10 text-white/50 text-xs font-mono select-none">
                            Orbit: Click & Drag | Pan: Right-Click | Zoom: Scroll
                        </div>
                        <Canvas shadows camera={{ position: [5, 8, 15], fov: 45 }}>
                            <ShadowScene timeSlider={timeSlider} />
                        </Canvas>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

