"use client";
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sky } from '@react-three/drei';
import * as THREE from 'three';

const SolarPanel = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    // Subtle rotation or animation to make it feel "digital twin" alive
    useFrame((state, delta) => {
        if (meshRef.current) {
            // simulate tracking the sun slightly
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        }
    });

    return (
        <group position={[0, 0, 0]}>
            {/* Panel surface */}
            <mesh ref={meshRef} position={[0, 1, 0]} rotation={[-Math.PI / 4, 0, 0]}>
                <boxGeometry args={[4, 0.1, 2]} />
                <meshStandardMaterial color="#023e8a" metalness={0.9} roughness={0.1} />
                {/* Frame */}
                <mesh position={[0, -0.05, 0]}>
                    <boxGeometry args={[4.2, 0.1, 2.2]} />
                    <meshStandardMaterial color="#6c757d" metalness={1.0} roughness={0.2} />
                </mesh>
            </mesh>

            {/* Mount Base */}
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

export default function DigitalTwin3D() {
    return (
        <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shadow-[0_0_40px_rgba(30,58,138,0.2)] relative">
            <div className="absolute top-4 left-4 z-10 bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm border border-slate-600 backdrop-blur font-mono">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                Live Virtual Twin
            </div>

            <Canvas camera={{ position: [0, 3, 7], fov: 45 }}>
                {/* Dynamic environment lighting */}
                <Sky distance={450000} sunPosition={[5, 1, 8]} inclination={0} azimuth={0.25} turbidity={0.5} />
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />

                <SolarPanel />

                <OrbitControls
                    enableZoom={true}
                    maxPolarAngle={Math.PI / 2.1}
                    minDistance={3}
                    maxDistance={12}
                    autoRotate={true}
                    autoRotateSpeed={0.5}
                />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
