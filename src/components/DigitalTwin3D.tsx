"use client";
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sky } from '@react-three/drei';
import * as THREE from 'three';

const SolarPanel = ({ temperature = 25 }: { temperature: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);

    // Calculate dynamic color: Blue (optimal ~25C) to Red (Critical > 50C)
    const thermalColor = useMemo(() => {
        const base = new THREE.Color("#023e8a");
        const hot = new THREE.Color("#ef4444");
        // Temp range 20 to 60 mapped to 0 -> 1
        const lerpFactor = Math.max(0, Math.min(1, (temperature - 20) / 35));
        return new THREE.Color().lerpColors(base, hot, lerpFactor);
    }, [temperature]);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        }
        if (materialRef.current) {
            // Smoothly animate the color transition in 3D space
            materialRef.current.color.lerp(thermalColor, 0.1);
            if (temperature > 40) {
                materialRef.current.emissive.copy(hot.clone().multiplyScalar(0.2));
            } else {
                materialRef.current.emissive.setHex(0x000000);
            }
        }
    });

    const hot = useMemo(() => new THREE.Color("#ef4444"), []);

    return (
        <group position={[0, 0, 0]}>
            {/* Panel surface */}
            <mesh ref={meshRef} position={[0, 1, 0]} rotation={[-Math.PI / 4, 0, 0]}>
                <boxGeometry args={[4, 0.1, 2]} />
                <meshStandardMaterial ref={materialRef} color="#023e8a" metalness={0.9} roughness={0.1} />
                {/* Frame */}
                <mesh position={[0, -0.05, 0]}>
                    <boxGeometry args={[4.2, 0.1, 2.2]} />
                    <meshStandardMaterial color="#6c757d" metalness={1.0} roughness={0.2} />
                </mesh>
            </mesh>
            <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 1, 32]} />
                <meshStandardMaterial color="#495057" metalness={0.5} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.5, 0.2, 1.5]} />
                <meshStandardMaterial color="#343a40" />
            </mesh>
        </group>
    );
};

export default function DigitalTwin3D({ temperature = 25 }: { temperature?: number }) {
    const isCritical = temperature > 40;

    return (
        <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl relative" style={{ boxShadow: isCritical ? '0 0 50px rgba(239, 68, 68, 0.3)' : '0 0 40px rgba(30,58,138,0.2)', transition: 'box-shadow 1s ease' }}>
            <div className={`absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg text-sm border backdrop-blur font-mono ${isCritical ? 'bg-red-900/80 border-red-500 text-white' : 'bg-black/60 border-slate-600 text-white'}`}>
                <span className={`inline-block w-2 h-2 rounded-full mr-2 animate-pulse ${isCritical ? 'bg-red-400' : 'bg-green-400'}`}></span>
                {isCritical ? `THERMAL WARNING: ${temperature.toFixed(1)}°C` : 'Live Virtual Twin'}
            </div>

            <Canvas camera={{ position: [0, 3, 7], fov: 45 }}>
                <Sky distance={450000} sunPosition={[5, 1, 8]} inclination={0} azimuth={isCritical ? 0.8 : 0.25} turbidity={isCritical ? 2.0 : 0.5} />
                <ambientLight intensity={isCritical ? 0.3 : 0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow color={isCritical ? "#ffd6d6" : "#ffffff"} />

                <SolarPanel temperature={temperature} />

                <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2.1} minDistance={3} maxDistance={12} autoRotate={true} autoRotateSpeed={isCritical ? 2.0 : 0.5} />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
