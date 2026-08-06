"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import SearchBarOSM from "@/components/SearchBarOSM";
import SolarReportPanel from "@/components/SolarReportPanel";
import CopilotBot from "@/components/CopilotBot";
import { useLanguage } from "@/context/LanguageContext";
import { Zap, Ruler } from "lucide-react";

// Leaflet must be imported client-side only (no SSR)
const MapLeaflet = dynamic(() => import("@/components/MapLeaflet"), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

interface SolarData {
  system_capacity_kw: number;
  annual_generation_kwh: number;
  total_cost_inr: number;
  subsidy_inr: number;
  net_cost_inr: number;
  annual_savings_inr: number;
  payback_period_years: number;
  co2_reduction_kg_year: number;
  environmental_data?: any;
  physics_metrics?: any;
  generation_breakdown?: any;
  savings?: any;
  financial_projections?: any;
  digital_twin?: any;
}

export default function Home() {
  const { t } = useLanguage();
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(INDIA_CENTER);
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);
  const [solarData, setSolarData] = useState<SolarData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState(5);
  const [polygonArea, setPolygonArea] = useState<number | null>(null);

  const fetchSolarData = useCallback(
    async (systemKw: number, lat?: number, lng?: number, polyArea?: number | null) => {
      setIsLoading(true);
      setSolarData(null);

      const effectiveLat = lat ?? markerPos?.lat ?? INDIA_CENTER.lat;
      const effectiveLng = lng ?? markerPos?.lng ?? INDIA_CENTER.lng;

      try {
        const usableArea = polyArea ?? systemKw * 10;

        const res = await fetch(`${API_BASE}/api/calculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usable_area_sqm: usableArea,
            system_size_kw: systemKw,
            lat: effectiveLat,
            lng: effectiveLng,
            polygon_area_sqm: polyArea ?? null,
          }),
        });

        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setSolarData(data);
      } catch {
        setSolarData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [markerPos]
  );

  const handleLocationSelect = useCallback(
    (lat: number, lng: number) => {
      setMarkerPos({ lat, lng });
      setMapCenter({ lat, lng });
      setPolygonArea(null);
      fetchSolarData(selectedSystem, lat, lng);
    },
    [selectedSystem, fetchSolarData]
  );

  const handleSystemChange = useCallback(
    (kw: number) => {
      setSelectedSystem(kw);
      fetchSolarData(kw, markerPos?.lat, markerPos?.lng, polygonArea);
    },
    [fetchSolarData, markerPos, polygonArea]
  );

  const handleSearch = useCallback(
    (lat: number, lng: number) => {
      setMarkerPos({ lat, lng });
      setMapCenter({ lat, lng });
      setPolygonArea(null);
      fetchSolarData(selectedSystem, lat, lng);
    },
    [selectedSystem, fetchSolarData]
  );

  const handlePolygonArea = useCallback(
    (areaSqm: number) => {
      setPolygonArea(areaSqm);
    },
    []
  );

  return (
    <main style={{ position: "relative", height: "100vh", width: "100vw", overflow: "hidden" }}>
      {/* Full-screen Leaflet + OSM Map */}
      <MapLeaflet
        center={mapCenter}
        onLocationSelect={handleLocationSelect}
        markerPosition={markerPos}
        onPolygonArea={handlePolygonArea}
      />

      {/* Address Search (OSM Nominatim) */}
      <SearchBarOSM onSearch={handleSearch} />

      {/* Solar Report Panel */}
      <SolarReportPanel
        data={solarData}
        isLoading={isLoading}
        selectedSystem={selectedSystem}
        onSystemChange={handleSystemChange}
        coords={markerPos}
      />



      {/* Copilot Chat Assistant */}
      <CopilotBot />

      {/* Polygon Area Indicator */}
      {polygonArea && (
        <div style={{
          position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)",
          zIndex: 1000, padding: "8px 18px", borderRadius: 10,
          background: "var(--card-bg)", backdropFilter: "blur(16px)",
          border: "1px solid var(--card-border)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <Ruler size={16} color="var(--accent)" /> Selected Area: {polygonArea.toFixed(1)} m² ({(polygonArea / 10).toFixed(1)} kW potential)
        </div>
      )}
      {/* Universal Footer Overlay */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 16px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", color: "rgba(255,255,255,0.6)", fontSize: 11, textAlign: "center", zIndex: 999, pointerEvents: "none" }}>
        © Urja-Link India 2026. All Rights Reserved.
      </div>
    </main>
  );
}
