"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import { Ruler, CheckCircle, Sun, Cpu, Loader2, Trash2, LocateFixed } from "lucide-react";

interface MapLeafletProps {
    center: { lat: number; lng: number };
    onLocationSelect: (lat: number, lng: number, area?: number) => void;
    markerPosition: { lat: number; lng: number } | null;
    onPolygonArea?: (area: number | null, geojson?: any) => void;
    solarData?: any;
}

export default function MapLeaflet({ center, markerPosition, onLocationSelect, onPolygonArea, solarData }: MapLeafletProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const polygonRef = useRef<L.Polygon | null>(null);
    const panelsGroupRef = useRef<L.LayerGroup | null>(null);
    const drawnMarkersRef = useRef<L.CircleMarker[]>([]);
    const drawPointsRef = useRef<L.LatLng[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasPolygon, setHasPolygon] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [sliderTime, setSliderTime] = useState<number>(12);
    const [sunPos, setSunPos] = useState<any>(null);
    const [isSimOpen, setIsSimOpen] = useState(false);
    const [telemetry, setTelemetry] = useState<{ total: number; usable: number; capacityKw: number } | null>(null);

    const [isAiScanning, setIsAiScanning] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Dynamic Sun tracking
    useEffect(() => {
        const today = new Date();
        today.setHours(sliderTime, 0, 0, 0);
        const iso = today.toISOString();
        const effectiveLat = markerPosition?.lat || center.lat;
        const effectiveLng = markerPosition?.lng || center.lng;

        // Fetch Astronomical calculations
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://urja-link-api.onrender.com";
        fetch(`${baseUrl}/api/sun-position?lat=${effectiveLat}&lng=${effectiveLng}&date_iso=${iso}`)
            .then(r => r.json())
            .then(data => setSunPos(data))
            .catch(e => {
                console.warn("Sun position API unavailable. Mocking sun position based on hour.");
                const hour = today.getHours();
                let elev = -20;
                if (hour >= 6 && hour <= 18) elev = 60 * Math.sin(((hour - 6) / 12) * Math.PI);
                setSunPos({ azimuth_deg: (hour * 15), elevation_deg: elev });
            });
    }, [sliderTime, center, markerPosition]);

    const defaultClickHandler = useCallback((e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (polygonRef.current) {
            polygonRef.current.remove();
            polygonRef.current = null;
            setHasPolygon(false);
        }
        if (panelsGroupRef.current) {
            panelsGroupRef.current.clearLayers();
        }
        drawPointsRef.current = [];
        onLocationSelect(lat, lng);
    }, [onLocationSelect]);

    const handleLocateMe = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    onLocationSelect(lat, lng);
                    if (mapRef.current) mapRef.current.setView([lat, lng], 18, { animate: true });
                },
                (err) => alert("Could not access location. Please enable browser permissions.")
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    const handleClearBoundary = () => {
        if (polygonRef.current) {
            polygonRef.current.remove();
            polygonRef.current = null;
        }
        drawPointsRef.current = [];
        drawnMarkersRef.current.forEach(m => m.remove());
        drawnMarkersRef.current = [];
        setHasPolygon(false);
        setTelemetry(null);
        if (onPolygonArea) onPolygonArea(null);
    };

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

        // Esri Dark Gray Base layer (Great for enterprise data viz)
        const darkMap = L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
            {
                attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                maxZoom: 20,
                maxNativeZoom: 16
            }
        );

        // OpenTopoMap layer for geographical survey
        const topoMap = L.tileLayer(
            "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
            {
                attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
                maxZoom: 17
            }
        );

        // Layer control
        L.control.layers(
            {
                "Street Map": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }),
                "Satellite": satellite,
                "National Grid (Dark)": darkMap,
                "Topography Survey": topoMap
            },
            {},
            { position: "topright" }
        ).addTo(map);

        // Default to satellite view
        satellite.addTo(map);

        // Click handler
        map.on("click", defaultClickHandler);

        mapRef.current = map;
        panelsGroupRef.current = L.layerGroup().addTo(map);

        return () => {
            if (panelsGroupRef.current) {
                panelsGroupRef.current.clearLayers();
                panelsGroupRef.current.remove();
            }
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
    const renderSimulatedPanels = (points: L.LatLng[], obstacles: L.LatLng[][] = []) => {
        if (!panelsGroupRef.current) return;

        let minLat = Infinity, maxLat = -Infinity;
        let minLng = Infinity, maxLng = -Infinity;

        points.forEach(p => {
            if (p.lat < minLat) minLat = p.lat;
            if (p.lat > maxLat) maxLat = p.lat;
            if (p.lng < minLng) minLng = p.lng;
            if (p.lng > maxLng) maxLng = p.lng;
        });

        // Approx 2x1 meter panels (0.000018 lat/lng degrees)
        const stepLat = 0.000018;
        const stepLng = 0.000010;

        let totalPanels = 0;
        let usablePanels = 0;

        for (let lat = minLat; lat < maxLat; lat += stepLat * 1.5) {
            for (let lng = minLng; lng < maxLng; lng += stepLng * 1.5) {
                // Calculate centroid of the grid box
                let centerLat = lat + (stepLat / 2);
                let centerLng = lng + (stepLng / 2);

                if (pointInPolygon(L.latLng(centerLat, centerLng), points)) {
                    totalPanels++;
                    // Map obstacle logic
                    let isRed = false;
                    const panelCenter = L.latLng(centerLat, centerLng);
                    for (const obs of obstacles) {
                        if (pointInPolygon(panelCenter, obs)) {
                            isRed = true;
                            break;
                        }
                    }
                    if (!isRed) usablePanels++;

                    const bounds: L.LatLngBoundsExpression = [
                        [lat, lng],
                        [lat + stepLat, lng + stepLng]
                    ];

                    L.rectangle(bounds, {
                        color: isRed ? "#dc2626" : "#2563eb", // Tailwind red-600 / blue-600
                        fillColor: isRed ? "#ef4444" : "#3b82f6", // Tailwind red-500 / blue-500
                        fillOpacity: 0.9,
                        weight: 1
                    }).addTo(panelsGroupRef.current);
                }
            }
        }

        setTelemetry({
            total: totalPanels,
            usable: usablePanels,
            capacityKw: solarData?.system_capacity_kw || null
        });
    };

    const toggleDrawing = () => {
        if (isDrawing) {
            // Complete polygon
            if (drawPointsRef.current.length >= 3 && mapRef.current) {
                if (polygonRef.current) polygonRef.current.remove();
                if (panelsGroupRef.current) panelsGroupRef.current.clearLayers();

                polygonRef.current = L.polygon(drawPointsRef.current, {
                    color: "#0ea5e9",
                    fillColor: "#38bdf8",
                    fillOpacity: 0.35,
                    weight: 2,
                }).addTo(mapRef.current);

                // Calculate area using Gauss's formula (approximate in sq meters)
                const area = calculatePolygonArea(drawPointsRef.current);
                if (onPolygonArea) {
                    const geojson = polygonRef.current.toGeoJSON();
                    onPolygonArea(area, geojson.geometry);
                }
                setHasPolygon(true);

                renderSimulatedPanels(drawPointsRef.current, []);

                // Get centroid and trigger calculation
                const avgLat = drawPointsRef.current.reduce((s, p) => s + p.lat, 0) / drawPointsRef.current.length;
                const avgLng = drawPointsRef.current.reduce((s, p) => s + p.lng, 0) / drawPointsRef.current.length;
                onLocationSelect(avgLat, avgLng, area);
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

        try {
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://urja-link-api.onrender.com";
            const res = await fetch(`${baseUrl}/api/detect-rooftop?lat=${latlng.lat}&lng=${latlng.lng}`);
            if (!res.ok) throw new Error("API failed");
            const data = await res.json();

            const syntheticPoints = data.rooftop_polygon.map((p: any) => L.latLng(p.lat, p.lng));

            let obstaclesList: L.LatLng[][] = [];
            if (data.obstacles && Array.isArray(data.obstacles)) {
                obstaclesList = data.obstacles.map((obs: any[]) => obs.map((p: any) => L.latLng(p.lat, p.lng)));
            }

            drawPointsRef.current = syntheticPoints;

            if (polygonRef.current) polygonRef.current.remove();
            if (panelsGroupRef.current) panelsGroupRef.current.clearLayers();
            polygonRef.current = L.polygon(syntheticPoints, {
                color: "#f59e0b",
                fillColor: "#f59e0b",
                fillOpacity: 0.4,
                weight: 3,
                dashArray: "4 4"
            }).addTo(mapRef.current!);

            const area = calculatePolygonArea(syntheticPoints);
            if (onPolygonArea) {
                const geojson = polygonRef.current.toGeoJSON();
                onPolygonArea(area, geojson.geometry);
            }
            setHasPolygon(true);
            renderSimulatedPanels(syntheticPoints, obstaclesList);
            onLocationSelect(latlng.lat, latlng.lng);

        } catch (e: any) {
            console.error("AI Detect fail", e);
            setErrorMsg("AI Model currently unavailable or overloaded (500 Error).");
            setTimeout(() => setErrorMsg(null), 5000);
        } finally {
            setIsAiLoading(false);
            setIsAiScanning(false);
            if (mapRef.current) {
                mapRef.current.on("click", defaultClickHandler);
            }
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
            {errorMsg && (
                <div style={{
                    position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)",
                    background: "rgba(239, 68, 68, 0.9)", color: "#fff", padding: "10px 20px",
                    borderRadius: 8, zIndex: 9999, fontWeight: "bold", backdropFilter: "blur(4px)",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)"
                }}>
                    {errorMsg}
                </div>
            )}
            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

            {/* Map Controls */}
            <div className="bottom-action-bar" style={{
                position: "absolute",
                top: 24,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 12,
                width: "100%",
                maxWidth: 480,
                padding: "0 16px",
                zIndex: 1000,
                pointerEvents: "none"
            }}>
                {hasPolygon && !isDrawing ? (
                    <button
                        onClick={handleClearBoundary}
                        className="nav-link-item glass-card action-bar-btn active"
                        style={{ flex: "1 1", minWidth: "140px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 14px", fontSize: 13, background: "#ef4444", color: "#fff", border: "none", cursor: "pointer", touchAction: "manipulation", height: "48px" }}
                    >
                        <Trash2 size={16} /> Clear Boundary
                    </button>
                ) : (
                    <button
                        onClick={toggleDrawing}
                        className={`nav-link-item glass-card action-bar-btn ${isDrawing ? 'active' : 'inactive'}`}
                        style={{ flex: "1 1", minWidth: "140px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 14px", fontSize: 13, background: isDrawing ? "var(--accent)" : "var(--card-bg)", color: isDrawing ? "#000" : "var(--foreground)", border: "none", cursor: "pointer", touchAction: "manipulation", height: "48px" }}
                    >
                        {isDrawing ? <><CheckCircle size={16} /> Save Area</> : <><Ruler size={16} /> Draw Roof</>}
                    </button>
                )}
                <button
                    onClick={toggleAiScanMode}
                    disabled={isAiLoading}
                    className={`nav-link-item glass-card action-bar-btn ${isAiScanning ? 'active' : 'inactive'}`}
                    style={{
                        flex: "1 1", minWidth: "140px",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 14px",
                        fontSize: 13,
                        background: isAiScanning || isAiLoading ? "#f59e0b" : "var(--card-bg)",
                        color: isAiScanning || isAiLoading ? "#000" : "var(--foreground)",
                        border: "none", cursor: "pointer", touchAction: "manipulation",
                        height: "48px"
                    }}
                >
                    {isAiLoading ? <><Loader2 size={16} className="lucide-spin" /> Scanning...</> : isAiScanning ? <><CheckCircle size={16} /> Click Roof on Map</> : <><Cpu size={16} /> AI Auto-Detect</>}
                </button>
            </div>

            {/* Locate Me FAB */}
            <button
                onClick={handleLocateMe}
                className="glass-card shadow-lg"
                style={{
                    position: "absolute",
                    bottom: 110,
                    right: 20,
                    zIndex: 1000,
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid var(--card-border)",
                    background: "var(--card-bg)",
                    color: "var(--foreground)",
                    cursor: "pointer",
                }}
            >
                <LocateFixed size={20} />
            </button>

            {/* AI Telemetry Panel */}
            {telemetry && (
                <div className="glass-card shadow-lg" style={{
                    position: "absolute",
                    top: 80, // Moved from 20 to 80 to avoid overlapping navbar
                    right: 20,
                    zIndex: 1000,
                    padding: 16,
                    minWidth: 260,
                    border: "1px solid var(--accent)",
                    background: "rgba(10, 15, 26, 0.85)",
                    backdropFilter: "blur(12px)",
                    borderRadius: 12
                }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: 13, color: "var(--accent)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                        <Cpu size={14} /> <span>Phase 6: Panel Placement</span>
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text-secondary)" }}>Total Scanned Area:</span>
                            <span style={{ fontWeight: 600 }}>{telemetry.total} Units</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text-secondary)" }}>Available (Blue Panels):</span>
                            <span style={{ fontWeight: 600, color: "#3b82f6" }}>{telemetry.usable} Panels</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text-secondary)" }}>Preinstalled / Obstacle:</span>
                            <span style={{ fontWeight: 600, color: "#ef4444" }}>{telemetry.total - telemetry.usable} Units</span>
                        </div>
                        <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text-secondary)" }}>Usable Roof Percentage:</span>
                            <span style={{ fontWeight: 600, color: "var(--success)" }}>{Math.round((telemetry.usable / (telemetry.total || 1)) * 100)}%</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text-secondary)" }}>Panel Capacity:</span>
                            <span className="text-white font-mono">{telemetry.usable} panels</span>
                        </div>
                        {solarData?.system_capacity_kw && (
                            <div className="text-xs flex items-center justify-between">
                                <span className="text-white/50 font-medium">True AI Capacity:</span>
                                <span className="text-[#00E5FF] font-mono font-bold text-shadow">{solarData.system_capacity_kw.toFixed(2)} kW</span>
                            </div>
                        )}
                        {solarData && (
                            <>
                                <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                                {solarData.financial_projections && (
                                    <>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "var(--text-secondary)" }}>ROI:</span>
                                            <span style={{ fontWeight: 600, color: "var(--success)" }}>{solarData.financial_projections.lifetime_roi_percentage}%</span>
                                        </div>
                                    </>
                                )}
                                {solarData.savings && (
                                    <>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "var(--text-secondary)" }}>CO2 Saved:</span>
                                            <span style={{ fontWeight: 600 }}>{solarData.savings.co2_reduction_tonnes_lifetime} Tonnes</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "var(--text-secondary)" }}>Savings:</span>
                                            <span style={{ fontWeight: 600, color: "var(--success)" }}>₹{solarData.savings.annual_savings_inr?.toLocaleString()}/yr</span>
                                        </div>
                                    </>
                                )}
                                {solarData.subsidy_inr !== undefined && (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "var(--text-secondary)" }}>PM Surya Ghar Subsidy:</span>
                                        <span style={{ fontWeight: 600, color: "#f59e0b" }}>₹{solarData.subsidy_inr?.toLocaleString()}</span>
                                    </div>
                                )}
                                {solarData.annual_generation_kwh !== undefined && (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "var(--text-secondary)" }}>Energy Generation:</span>
                                        <span style={{ fontWeight: 600, color: "#38bdf8" }}>{solarData.annual_generation_kwh?.toLocaleString()} kWh</span>
                                    </div>
                                )}
                                {solarData.physics_metrics && (
                                    <>
                                        <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                                        <span style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: "bold" }}>Physics Parameters</span>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, fontSize: 11 }}>
                                            <span>GHI: <span style={{ color: "#fff" }}>{solarData.physics_metrics.daily_peak_sun_hours} kWh/m²/day</span></span>
                                            <span>PR: <span style={{ color: "#fff" }}>{(solarData.physics_metrics.system_performance_ratio * 100).toFixed(1)}%</span></span>
                                            <span>Shadow: <span style={{ color: "#fff" }}>{solarData.physics_metrics.astronomical_shadow_loss_pct}%</span></span>
                                            <span>Temp Loss: <span style={{ color: "#fff" }}>{solarData.physics_metrics.temperature_loss_pct}%</span></span>
                                            <span>Soiling: <span style={{ color: "#fff" }}>{solarData.physics_metrics.soiling_loss_pct}%</span></span>
                                            <span>Orientation: <span style={{ color: "#fff" }}>{(solarData.physics_metrics.orientation_factor * 100).toFixed(1)}%</span></span>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Sun Simulation Panel */}
            <div className={`sun-sim-panel ${isSimOpen ? 'expanded' : 'compact'}`} style={{
                position: "absolute",
                bottom: 100,
                left: 24,
                zIndex: 1000,
                width: 320,
                background: "var(--card-bg)",
                backdropFilter: "blur(12px)",
                padding: 16,
                borderRadius: 12,
                border: "1px solid var(--card-border)",
                color: "var(--foreground)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                pointerEvents: "auto"
            }}>
                <div
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                    onClick={() => setIsSimOpen(!isSimOpen)}
                >
                    <h4 style={{ margin: 0, fontSize: 13, color: "var(--accent)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                        <Sun size={14} /> <span className="sim-title-text">Solar Shadow Simulation</span>
                    </h4>
                    <span style={{ fontSize: 14 }}>{isSimOpen ? "−" : "+"}</span>
                </div>

                {isSimOpen && (
                    <div style={{ marginTop: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8, color: "#94a3b8" }}>
                            <span>06:00</span>
                            <span style={{ color: "#e8ecf1", fontWeight: "bold" }}>{sliderTime}:00</span>
                            <span>18:00</span>
                        </div>
                        <input
                            type="range" min="6" max="18" step="1"
                            value={sliderTime}
                            onChange={e => setSliderTime(parseInt(e.target.value))}
                            style={{ width: "100%", cursor: "pointer", accentColor: "#f59e0b", height: 24 }}
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

// Ray-casting algorithm to determine if a point is inside a polygon
function pointInPolygon(point: L.LatLng, vs: L.LatLng[]) {
    let x = point.lng, y = point.lat;
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        let xi = vs[i].lng, yi = vs[i].lat;
        let xj = vs[j].lng, yj = vs[j].lat;
        let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}
