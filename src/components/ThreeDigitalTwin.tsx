"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import AstronomicalSun from "./AstronomicalSun";

interface ThreeDigitalTwinProps {
    latitude: number;
    longitude: number;
    simulationTime: Date; // Controlled by UI slider
    usableAreaSqFt: number; // Simulating the AI's output
    roofOrientation?: number;
}

const ProceduralHouse = ({ area, orientation = 0 }: { area: number, orientation?: number }) => {
    // Rough estimate of box size based on Area (sqft)
    // 1 unit = 1 ft exactly in this scene scale
    const sideLength = Math.sqrt(area);
    const height = 15; // 15 ft tall roughly for a residential block

    return (
        <group rotation={[0, (orientation * Math.PI) / 180, 0]}>
            {/* Main walls */}
            <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
                <boxGeometry args={[sideLength, height, sideLength]} />
                <meshStandardMaterial color="#f0efe9" roughness={0.9} />
            </mesh>
            {/* Rooftop (flat roof acting as the footprint identified by AI pipeline) */}
            <mesh castShadow receiveShadow position={[0, height + 0.25, 0]}>
                <boxGeometry args={[sideLength + 2, 0.5, sideLength + 2]} />
                <meshStandardMaterial color="#444444" roughness={0.8} />
            </mesh>
            {/* Procedurally generate Solar Panels laid out based on AI area */}
            <SolarPanelArray roofSideLength={sideLength} height={height} />
        </group>
    );
};

const SolarPanelArray = ({ roofSideLength, height }: { roofSideLength: number, height: number }) => {
    // A standard panel is about 5.4 ft x 3.25 ft
    const panelW = 5.4;
    const panelL = 3.25;
    const gap = 1.0;

    // Calculate how many rows/cols fit in the usable area (leaving some margin for edges)
    const columns = Math.max(1, Math.floor((roofSideLength - 3) / (panelW + gap)));
    const rows = Math.max(1, Math.floor((roofSideLength - 3) / (panelL + gap)));

    const panels = [];
    const startX = -((columns - 1) * (panelW + gap)) / 2;
    const startZ = -((rows - 1) * (panelL + gap)) / 2;

    // Render the grid of solar panels
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows; r++) {
            panels.push(
                <group
                    key={`${c}-${r}`}
                    position={[startX + c * (panelW + gap), height + 1.0, startZ + r * (panelL + gap)]}
                    rotation={[Math.PI / 12, 0, 0]} // 15 degree rigid tilt on standard frames
                >
                    {/* Silicon Panel */}
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[panelW, 0.1, panelL]} />
                        <meshStandardMaterial color="#0A192F" roughness={0.05} metalness={0.9} />
                    </mesh>
                    {/* Panel stand/strut */}
                    <mesh castShadow receiveShadow position={[0, -0.2, -panelL / 3]}>
                        <boxGeometry args={[0.2, 0.4, 0.2]} />
                        <meshStandardMaterial color="#aaaaaa" roughness={0.5} metalness={0.8} />
                    </mesh>
                </group>
            );
        }
    }

    return <group>{panels}</group>;
}

export default function ThreeDigitalTwin({
    latitude,
    longitude,
    simulationTime,
    usableAreaSqFt,
    roofOrientation = 0
}: ThreeDigitalTwinProps) {

    return (
        <div className="w-full h-full relative border border-white/10 rounded-xl overflow-hidden bg-gradient-to-b from-[#87CEEB]/20 to-[#020111]/90 shadow-2xl cursor-move">
            <Canvas shadows camera={{ position: [40, 30, 40], fov: 45 }}>
                <Suspense fallback={null}>
                    <AstronomicalSun
                        latitude={latitude}
                        longitude={longitude}
                        date={simulationTime}
                    />

                    {/* Procedural physical house generated entirely from AI Roof segmentation data */}
                    <ProceduralHouse area={Math.max(400, usableAreaSqFt)} orientation={roofOrientation} />

                    {/* Ground Plane mimicking the surrounding Earth footprint */}
                    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                        <planeGeometry args={[1000, 1000]} />
                        <meshStandardMaterial color="#2d4c1e" roughness={1} />
                    </mesh>

                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        maxPolarAngle={Math.PI / 2 - 0.05} // Physically prevent looking up from underground
                    />
                </Suspense>
            </Canvas>

            {/* Floating Info UI overlay */}
            <div className="absolute top-4 left-4 p-4 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 z-10 pointer-events-none">
                <h3 className="text-white font-bold text-lg mb-1 tracking-tight">WebGL Digital Twin</h3>
                <p className="text-white/70 text-sm">Validating physical occlusion and generation limits...</p>

                <div className="mt-3 bg-[#0A0A0A]/50 p-2 rounded-lg border border-white/5 space-y-1">
                    <div className="text-xs flex items-center justify-between">
                        <span className="text-white/50 font-medium">Usable Area:</span>
                        <span className="text-white font-mono">{usableAreaSqFt.toLocaleString()} sq.ft</span>
                    </div>
                    <div className="text-xs flex items-center justify-between">
                        <span className="text-white/50 font-medium">Roof Lat/Lon:</span>
                        <span className="text-white font-mono">{latitude.toFixed(2)}°, {longitude.toFixed(2)}°</span>
                    </div>
                </div>

                <div className="mt-3 text-xs text-[#00E5FF] flex items-center space-x-2 bg-[#00E5FF]/10 px-3 py-1.5 rounded-full w-max border border-[#00E5FF]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_8px_#00E5FF]"></span>
                    <span className="font-semibold tracking-wide">Astronomical Rendering ON</span>
                </div>
            </div>
        </div>
    );
}
