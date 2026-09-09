"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import SearchBarOSM from "@/components/SearchBarOSM";
import SolarReportPanel from "@/components/SolarReportPanel";
import CopilotBot from "@/components/CopilotBot";
import { useLanguage } from "@/context/LanguageContext";
import { Zap, Ruler, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Leaflet must be imported client-side only (no SSR) with an instant loading skeleton for FCP Optimization
const MapLeaflet = dynamic(() => import("@/components/MapLeaflet"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--card-bg)" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <span className="loading-dot" />
        <span className="loading-dot" />
        <span className="loading-dot" />
      </div>
      <p style={{ marginTop: "16px", color: "var(--accent)", fontSize: "14px", fontWeight: "bold" }}>Acquiring Geographic Telemetry...</p>
    </div>
  )
});

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://urja-link-api.onrender.com";

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
  const [polygonGeoJSON, setPolygonGeoJSON] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSolarData = useCallback(
    async (systemKw: number, lat?: number, lng?: number, polyArea?: number | null, tilt?: number, azimuth?: number) => {
      setIsLoading(true);
      setSolarData(null);

      const effectiveLat = lat ?? markerPos?.lat ?? INDIA_CENTER.lat;
      const effectiveLng = lng ?? markerPos?.lng ?? INDIA_CENTER.lng;

      try {
        const usableArea = polyArea ?? systemKw * 10;

        const res = await fetch(`/api/calculate-job`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usable_area_sqm: usableArea,
            system_size_kw: systemKw,
            lat: effectiveLat,
            lng: effectiveLng,
            polygon_area_sqm: polyArea ?? null,
            roof_tilt_deg: tilt,
            roof_azimuth_deg: azimuth,
            geojson: polygonGeoJSON,
          }),
        });

        if (!res.ok) throw new Error("API error on job creation");
        const initData = await res.json();
        const jobId = initData.job_id;

        // Polling loop
        let isDone = false;
        let attempts = 0;
        const maxAttempts = 30; // 60 seconds max

        while (!isDone && attempts < maxAttempts) {
          attempts++;
          const pollRes = await fetch(`/api/job/${jobId}`);
          if (pollRes.ok) {
            const jobData = await pollRes.json();
            if (jobData.status === "COMPLETED") {
              setSolarData(jobData.result_data);
              isDone = true;
            } else if (jobData.status === "FAILED") {
              throw new Error("Analysis job failed on backend.");
            } else {
              // Wait 2 seconds before checking again
              await new Promise(r => setTimeout(r, 2000));
            }
          }
        }

        if (!isDone) {
          throw new Error("Job timed out");
        }
      } catch (error: any) {
        console.error("Failed to fetch calculation API", error);
        setErrorMsg("Failed to connect to Physics Calculation Engine (500 Error).");
        setTimeout(() => setErrorMsg(null), 5000);
      } finally {
        setIsLoading(false);
      }
    },
    [markerPos, polygonGeoJSON]
  );

  const handleLocationSelect = useCallback(
    (lat: number, lng: number, area?: number) => {
      setMarkerPos({ lat, lng });
      setMapCenter({ lat, lng });
      if (area === undefined) {
        setPolygonArea(null);
      }
      fetchSolarData(selectedSystem, lat, lng, area !== undefined ? area : undefined);
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

  const handlePolygonArea = (area: number | null, geojson?: any) => {
    setPolygonArea(area);
    if (geojson) {
      setPolygonGeoJSON(geojson);
    } else {
      setPolygonGeoJSON(null);
    }
  };

  const handleSaveProperty = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErrorMsg("You must be logged in to save properties.");
        setTimeout(() => setErrorMsg(null), 5000);
        return;
      }
      if (!solarData || !markerPos) {
        setErrorMsg("No solar data or location to save.");
        setTimeout(() => setErrorMsg(null), 5000);
        return;
      }

      const { error } = await supabase.from('saved_reports').insert({
        user_id: session.user.id,
        lat: markerPos.lat,
        lng: markerPos.lng,
        capacity_kw: solarData.system_capacity_kw,
        annual_generation_kwh: solarData.annual_generation_kwh,
        net_cost_inr: solarData.net_cost_inr,
        roi_years: solarData.payback_period_years,
        payload: solarData
      });

      if (error) throw error;
      alert("Property Saved Successfully to Urja-Link Dashboard!");
    } catch (e: any) {
      console.error("Save property error", e);
      setErrorMsg("Failed to save property. Please try again.");
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  return (
    <main className="app-main-layout">
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

      {/* Full-screen Leaflet + OSM Map */}
      <div className="map-layer">
        <MapLeaflet
          center={mapCenter}
          onLocationSelect={handleLocationSelect}
          markerPosition={markerPos}
          onPolygonArea={handlePolygonArea}
          solarData={solarData}
        />
      </div>

      <div className="ui-interaction-layer">
        <div className="ui-header-spacer"></div>
        <div className="ui-content-area">
          {/* Address Search (OSM Nominatim) - Falls back if Portal isn't ready */}
          <SearchBarOSM onSearch={handleSearch} />

          {/* Solar Report Panel */}
          {!polygonArea && (
            <SolarReportPanel
              data={solarData}
              isLoading={isLoading}
              selectedSystem={selectedSystem}
              onSystemChange={handleSystemChange}
              coords={markerPos}
            />
          )}

          {/* Copilot Chat Assistant */}
          <CopilotBot />

          {/* Bottom Controls / Action Bar */}
          {polygonArea && (
            <div className="ui-bottom-controls">
              <div style={{
                padding: "8px 18px", borderRadius: 10,
                background: "var(--card-bg)", backdropFilter: "blur(16px)",
                border: "1px solid var(--card-border)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <Ruler size={16} color="var(--accent)" /> Area: {polygonArea.toFixed(1)} m² ({(polygonArea / 10).toFixed(1)} kW)
              </div>

              <button onClick={handleSaveProperty} style={{
                padding: "8px 16px", borderRadius: 10,
                background: "var(--accent)", color: "#000",
                border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                fontSize: 13, fontWeight: "bold"
              }}>
                <Save size={16} /> Save Property
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Universal Footer Overlay */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "4px 16px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", color: "rgba(255,255,255,0.6)", fontSize: 10, textAlign: "center", zIndex: 999, pointerEvents: "none" }}>
        © Urja-Link India 2026. All Rights Reserved.
      </div>
    </main>
  );
}
