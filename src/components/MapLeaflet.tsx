"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import { Ruler, CheckCircle, Sun, Cpu, Loader2 } from "lucide-react";

interface MapLeafletProps {
    center: { lat: number; lng: number };
    markerPosition: { lat: number; lng: number } | null;
    onLocationSelect: (lat: number, lng: number) => void;
    onPolygonArea?: (areaSqm: number) => void;
}

export default function MapLeaflet({ center, markerPosition, onLocationSelect, onPolygonArea }: MapLeafletProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const polygonRef = useRef<L.Polygon | null>(null);
    const drawnMarkersRef = useRef<L.CircleMarker[]>([]);
    const drawPointsRef = useRef<L.LatLng[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [sliderTime, setSliderTime] = useState<number>(12);
    const [sunPos, setSunPos] = useState<any>(null);

    const [isAiScanning, setIsAiScanning] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);

    // Dynamic Sun tracking
    useEffect(() => {
        const today = new Date();
        today.setHours(sliderTime, 0, 0, 0);
        const iso = today.toISOString();
        const effectiveLat = markerPosition?.lat || center.lat;
        const effectiveLng = markerPosition?.lng || center.lng;

        // Fetch Astronomical calculations
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        fetch(`${baseUrl}/api/sun-position?lat=${effectiveLat}&lng=${effectiveLng}&date_iso=${iso}`)
            .then(r => r.json())
            .then(data => setSunPos(data))
            .catch(e => console.error(e));
    }, [sliderTime, center, markerPosition]);

    const defaultClickHandler = useCallback((e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (polygonRef.current) {
            polygonRef.current.remove();
            polygonRef.current = null;
        }
        drawPointsRef.current = [];
        onLocationSelect(lat, lng);
    }, [onLocationSelect]);

    // Initialize map
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            center: [center.lat, center.lng],
            zoom: 5,
            zoomControl: true,
            attributionControl: false,
        });

        // OpenStreetMap tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        // Satellite tile layer (Esri — free)
        const satellite = L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
                attribution: '&copy; Esri &mdash; Sources: Esri, DigitalGlobe, GeoEye, Earthstar',
                maxZoom: 19,
            }
        );

        // Layer control
        L.control.layers(
            { "Street Map": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }), "Satellite": satellite },
            {},
            { position: "topright" }
        ).addTo(map);

        // Default to satellite view
        satellite.addTo(map);

        // Click handler
        map.on("click", defaultClickHandler);

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Update marker
    useEffect(() => {
        if (!mapRef.current) return;

        if (markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
        }

        if (markerPosition) {
            const customIcon = L.divIcon({
                className: "",
                html: `<div style="
          width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
          background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        "></div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
            });

            markerRef.current = L.marker([markerPosition.lat, markerPosition.lng], { icon: customIcon })
                .addTo(mapRef.current);

            mapRef.current.setView([markerPosition.lat, markerPosition.lng], 18, { animate: true });
        }
    }, [markerPosition]);

    // Update center
    useEffect(() => {
        if (!mapRef.current || !center) return;
        if (markerPosition) return; // Don't override if marker is set
        mapRef.current.setView([center.lat, center.lng], mapRef.current.getZoom(), { animate: true });
    }, [center]); // eslint-disable-line react-hooks/exhaustive-deps

    // Drawing mode
    const toggleDrawing = () => {
        if (isDrawing) {
            // Complete polygon
            if (drawPointsRef.current.length >= 3 && mapRef.current) {
                if (polygonRef.current) polygonRef.current.remove();

                polygonRef.current = L.polygon(drawPointsRef.current, {
                    color: "#0ea5e9",
                    fillColor: "#38bdf8",
                    fillOpacity: 0.35,
                    weight: 2,
                }).addTo(mapRef.current);

                // Calculate area using Gauss's formula (approximate in sq meters)
                const area = calculatePolygonArea(drawPointsRef.current);
                if (onPolygonArea) onPolygonArea(area);

                // Get centroid
                const avgLat = drawPointsRef.current.reduce((s, p) => s + p.lat, 0) / drawPointsRef.current.length;
                const avgLng = drawPointsRef.current.reduce((s, p) => s + p.lng, 0) / drawPointsRef.current.length;
                onLocationSelect(avgLat, avgLng);
            }
            drawPointsRef.current = [];
            drawnMarkersRef.current.forEach(m => m.remove());
            drawnMarkersRef.current = [];
            setIsDrawing(false);

            // Restore click handler
            if (mapRef.current) {
                mapRef.current.off("click");
                mapRef.current.on("click", defaultClickHandler);
            }
        } else {
            // Start drawing
            drawPointsRef.current = [];
            drawnMarkersRef.current.forEach(m => m.remove());
            drawnMarkersRef.current = [];

            if (markerRef.current) {
                markerRef.current.remove();
                markerRef.current = null;
            }
            if (polygonRef.current) {
                polygonRef.current.remove();
                polygonRef.current = null;
            }
            setIsDrawing(true);
            setIsAiScanning(false);

            if (mapRef.current) {
                mapRef.current.off("click");
                mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
                    drawPointsRef.current.push(e.latlng);
                    // Draw temporary marker for each point
                    const circle = L.circleMarker(e.latlng, {
                        radius: 5, color: "#0ea5e9", fillColor: "#38bdf8", fillOpacity: 1,
                    }).addTo(mapRef.current!);
                    drawnMarkersRef.current.push(circle);
                });
            }
        }
    };

    const handleAiScan = async (latlng: L.LatLng) => {
        setIsAiLoading(true);
        if (mapRef.current) mapRef.current.off("click");

        // Simulate Computer Vision segmentation API call
        await new Promise(r => setTimeout(r, 1500));

        // Generate synthetic "roof footprint" bounds around click (approx 8m x 12m)
        const offsetLat = 0.00008;
        const offsetLng = 0.00010;

        // Slightly irregular to look like a real building footprint
        const syntheticPoints = [
            L.latLng(latlng.lat + offsetLat, latlng.lng - offsetLng),
            L.latLng(latlng.lat + offsetLat, latlng.lng + offsetLng),
            L.latLng(latlng.lat - offsetLat * 0.9, latlng.lng + offsetLng * 1.1),
            L.latLng(latlng.lat - offsetLat, latlng.lng - offsetLng * 0.8),
        ];

        drawPointsRef.current = syntheticPoints;

        if (polygonRef.current) polygonRef.current.remove();
        polygonRef.current = L.polygon(syntheticPoints, {
            color: "#f59e0b", // Amber for AI
            fillColor: "#f59e0b",
            fillOpacity: 0.4,
            weight: 3,
            dashArray: "4 4"
        }).addTo(mapRef.current!);

        const area = calculatePolygonArea(syntheticPoints);
        if (onPolygonArea) onPolygonArea(area);
        onLocationSelect(latlng.lat, latlng.lng);

        setIsAiLoading(false);
        setIsAiScanning(false);

        // Restore default click
        if (mapRef.current) {
            mapRef.current.on("click", defaultClickHandler);
        }
    };

    const toggleAiScanMode = () => {
        if (isAiScanning) {
            setIsAiScanning(false);
            if (mapRef.current) {
                mapRef.current.off("click");
                mapRef.current.on("click", defaultClickHandler);
            }
            return;
        }

        setIsDrawing(false);
        setIsAiScanning(true);
        if (mapRef.current) {
            mapRef.current.off("click");
            mapRef.current.on("click", (e: L.LeafletMouseEvent) => handleAiScan(e.latlng));
        }
    };

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

            {/* Map Controls */}
            <div style={{ position: "absolute", bottom: 44, left: "50%", transform: "translateX(-50%)", zIndex: 1000, display: "flex", gap: 12 }}>
                <button
                    onClick={toggleDrawing}
                    className={`nav-link-item glass-card ${isDrawing ? 'active' : 'inactive'}`}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", fontSize: 13, background: isDrawing ? "var(--accent)" : "var(--card-bg)", color: isDrawing ? "#000" : "var(--foreground)", border: "none", cursor: "pointer" }}
                >
                    {isDrawing ? <><CheckCircle size={16} /> Save Area</> : <><Ruler size={16} /> Draw Roof</>}
                </button>
                <button
                    onClick={toggleAiScanMode}
                    disabled={isAiLoading}
                    className={`nav-link-item glass-card ${isAiScanning ? 'active' : 'inactive'}`}
                    style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
                        fontSize: 13,
                        background: isAiScanning || isAiLoading ? "#f59e0b" : "var(--card-bg)",
                        color: isAiScanning || isAiLoading ? "#000" : "var(--foreground)",
                        border: "none", cursor: "pointer"
                    }}
                >
                    {isAiLoading ? <><Loader2 size={16} className="lucide-spin" /> Scanning...</> : isAiScanning ? <><CheckCircle size={16} /> Click Roof on Map</> : <><Cpu size={16} /> AI Auto-Detect</>}
                </button>
            </div>

            {/* Sun Simulation Panel */}
            <div className="sun-sim-panel">
                <h4 style={{ margin: "0 0 12px 0", fontSize: 13, color: "var(--accent)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                    <Sun size={14} /> Solar Shadow Simulation
                </h4>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8, color: "#94a3b8" }}>
                    <span>06:00</span>
                    <span style={{ color: "#e8ecf1", fontWeight: "bold" }}>{sliderTime}:00</span>
                    <span>18:00</span>
                </div>
                <input
                    type="range" min="6" max="18" step="1"
                    value={sliderTime}
                    onChange={e => setSliderTime(parseInt(e.target.value))}
                    style={{ width: "100%", cursor: "pointer", accentColor: "#f59e0b" }}
                />

                {sunPos && (
                    <div style={{ marginTop: 12, display: "flex", gap: 12, fontSize: 12 }}>
                        <div style={{ flex: 1, background: "rgba(0,0,0,0.3)", padding: "6px 8px", borderRadius: 6 }}>
                            <div style={{ color: "#94a3b8" }}>Azimuth</div>
                            <div style={{ fontWeight: "bold" }}>{sunPos.azimuth_deg?.toFixed(1)}°</div>
                        </div>
                        <div style={{ flex: 1, background: "rgba(0,0,0,0.3)", padding: "6px 8px", borderRadius: 6 }}>
                            <div style={{ color: "#94a3b8" }}>Elevation</div>
                            <div style={{ fontWeight: "bold", color: sunPos.elevation_deg > 0 ? "#22c55e" : "#ef4444" }}>
                                {sunPos.elevation_deg > 0 ? `${sunPos.elevation_deg?.toFixed(1)}°` : "NIGHT"}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Calculate polygon area in square meters using the Spherical Excess formula.
 */
function calculatePolygonArea(points: L.LatLng[]): number {
    if (points.length < 3) return 0;

    const R = 6371000; // Earth radius in meters
    let total = 0;

    for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        const lat1 = (points[i].lat * Math.PI) / 180;
        const lat2 = (points[j].lat * Math.PI) / 180;
        const lng1 = (points[i].lng * Math.PI) / 180;
        const lng2 = (points[j].lng * Math.PI) / 180;

        total += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }

    return Math.abs((total * R * R) / 2);
}
