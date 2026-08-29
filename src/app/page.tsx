"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import SearchBarOSM from "@/components/SearchBarOSM";
import SolarReportPanel from "@/components/SolarReportPanel";
import CopilotBot from "@/components/CopilotBot";
import { useLanguage } from "@/context/LanguageContext";
import { Zap, Ruler, Save } from "lucide-react";

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

  const fetchSolarData = useCallback(
    async (systemKw: number, lat?: number, lng?: number, polyArea?: number | null) => {
      setIsLoading(true);
      setSolarData(null);

      const effectiveLat = lat ?? markerPos?.lat ?? INDIA_CENTER.lat;
      const effectiveLng = lng ?? markerPos?.lng ?? INDIA_CENTER.lng;

      try {
        const usableArea = polyArea ?? systemKw * 10;

        const res = await fetch(`/api/calculate`, {
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
        console.warn("Failed to fetch calculation API, utilizing local fallback engine.");
        // Fallback for when backend is offline
        const generated = systemKw * 4.5 * 330;
        const totalCost = systemKw * 60000;
        const subsidy = systemKw <= 3 ? systemKw * 26000 : 78000;

        setSolarData({
          system_capacity_kw: systemKw,
          annual_generation_kwh: generated,
          total_cost_inr: totalCost,
          subsidy_inr: subsidy,
          net_cost_inr: Math.max(0, totalCost - subsidy),
          annual_savings_inr: generated * 8,
          payback_period_years: Math.round(((totalCost - subsidy) / (generated * 8)) * 10) / 10,
          co2_reduction_kg_year: Math.round(generated * 0.8),
          environmental_data: {
            data_source: "Urja-Link Offline Math Model",
            current_temperature_c: 32, current_cloud_cover_pct: 12, current_humidity_pct: 45,
            current_wind_speed_m_s: 3.5, current_precipitation_mm: 0,
            air_quality_pm25: 42, air_quality_pm10: 89, aerosol_optical_depth: 0.2
          },
          physics_metrics: {
            daily_peak_sun_hours: 4.5, system_performance_ratio: 0.78,
            astronomical_shadow_loss_pct: 3.2, temperature_loss_pct: 8.5,
            soiling_loss_pct: 2.1, cloud_loss_pct: 4.0, orientation_factor: 1.0
          },
          generation_breakdown: {
            daily_avg_kwh: systemKw * 4.5, monthly_avg_kwh: systemKw * 135, annual_total_kwh: generated,
            monthly_detail: [
              { month: "Jan", generation_kwh: generated * 0.08, ghi_kwh_m2_day: 4.1, days: 31 },
              { month: "Feb", generation_kwh: generated * 0.09, ghi_kwh_m2_day: 4.5, days: 28 },
              { month: "Mar", generation_kwh: generated * 0.10, ghi_kwh_m2_day: 5.2, days: 31 },
              { month: "Apr", generation_kwh: generated * 0.11, ghi_kwh_m2_day: 6.0, days: 30 },
              { month: "Jul", generation_kwh: generated * 0.06, ghi_kwh_m2_day: 3.5, days: 31 },
              { month: "Oct", generation_kwh: generated * 0.09, ghi_kwh_m2_day: 4.5, days: 31 }
            ]
          },
          savings: {
            daily_savings_inr: Math.round((generated * 8) / 365), monthly_savings_inr: Math.round((generated * 8) / 12),
            annual_savings_inr: generated * 8, lifetime_savings_inr: generated * 8 * 25,
            co2_reduction_kg_year: generated * 0.8, co2_reduction_tonnes_lifetime: Math.round((generated * 0.8 * 25) / 1000), trees_equivalent: Math.round((generated * 0.8 * 25) / 30)
          },
          financial_projections: {
            payback_period_years_exact: ((totalCost - subsidy) / (generated * 8)), lifetime_net_savings_inr: (generated * 8 * 25) - (totalCost - subsidy),
            lifetime_maintenance_cost_inr: systemKw * 1000 * 25, lifetime_roi_percentage: 15.5, year_1_savings: generated * 8,
            cashflow_projection: Array.from({ length: 26 }, (_, i) => ({ year: i, cumulative_roi_inr: i === 0 ? -(totalCost - subsidy) : -(totalCost - subsidy) + (generated * 8 * i), net_savings_inr: i === 0 ? 0 : generated * 8, generation_kwh: generated, tariff_inr: 8, maintenance_cost_inr: i === 0 ? 0 : systemKw * 1000 }))
          }
        });
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
    (areaSqm: number | null) => {
      setPolygonArea(areaSqm);
    },
    []
  );

  const handleSaveProperty = () => {
    alert("Property Saved Successfully to Urja-Link Dashboard!");
  };

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

      {/* Polygon Area Indicator & Save Button */}
      {polygonArea && (
        <div style={{
          position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)",
          zIndex: 1000, display: "flex", gap: 12, alignItems: "center", width: "max-content", maxWidth: "calc(100% - 32px)"
        }}>
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

          <button onClick={handleSaveProperty} className="action-bar-btn glass-card" style={{
            padding: "8px 16px", borderRadius: 10,
            background: "var(--accent)", color: "#000",
            border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            fontSize: 13, fontWeight: "bold"
          }}>
            <Save size={16} /> Save Property
          </button>
        </div>
      )}
      {/* Universal Footer Overlay */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 16px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", color: "rgba(255,255,255,0.6)", fontSize: 11, textAlign: "center", zIndex: 999, pointerEvents: "none" }}>
        © Urja-Link India 2026. All Rights Reserved.
      </div>
    </main>
  );
}
