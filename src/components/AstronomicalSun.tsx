"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import * as SunCalc from "suncalc";

interface AstronomicalSunProps {
    latitude: number;
    longitude: number;
    date: Date;
    sunDistance?: number;
}

export default function AstronomicalSun({
    latitude,
    longitude,
    date,
    sunDistance = 100,
}: AstronomicalSunProps) {
    const lightRef = useRef<THREE.DirectionalLight>(null);

    // Calculate sun position using SunCalc
    // Note: SunCalc altitude is 0 at horizon, PI/2 at zenith.
    // Azimuth is measured from South to West.
    const { altitude, azimuth } = useMemo(() => {
        return SunCalc.getPosition(date, latitude, longitude);
    }, [date, latitude, longitude]);

    // Convert spherical to Cartesion coords for Three.js
    // Y is up in Three.js standard
    const sunPosition = useMemo(() => {
        const y = sunDistance * Math.sin(altitude);
        const radius = sunDistance * Math.cos(altitude);
        // Adjust azimuth to rotate properly around Y axis
        // In Three.js, -Z is usually forward. By standard, let's map azimuth to X/Z
        const x = radius * Math.sin(azimuth + Math.PI);
        const z = radius * Math.cos(azimuth + Math.PI);
        return new THREE.Vector3(x, y, z);
    }, [altitude, azimuth, sunDistance]);

    const intensity = altitude > 0 ? Math.min(2.5, altitude * 4.0) : 0; // Fade out during twilight

    return (
        <>
            <ambientLight intensity={altitude > 0 ? 0.4 : 0.05} />
            {altitude > -0.1 && (
                <directionalLight
                    ref={lightRef}
                    position={sunPosition}
                    intensity={intensity}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                    shadow-camera-near={0.5}
                    shadow-camera-far={300}
                    shadow-camera-left={-50}
                    shadow-camera-right={50}
                    shadow-camera-top={50}
                    shadow-camera-bottom={-50}
                    shadow-bias={-0.0005} // prevent acne lines on shadows
                />
            )}
            {/* Sky color dynamically shifts based on altitude */}
            <color attach="background" args={[altitude > 0 ? "#87CEEB" : "#020111"]} />

            {/* Visually render the sun disk if altitude > 0 */}
            {altitude > 0 && (
                <mesh position={sunPosition}>
                    <sphereGeometry args={[sunDistance * 0.06, 32, 32]} />
                    <meshBasicMaterial color="#FFD700" />
                </mesh>
            )}
        </>
    );
}
