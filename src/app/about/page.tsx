"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import { Info, Target, Bot, Satellite, Sun, CloudRain, Coins, Landmark, Wrench, BarChart2 } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="page-container">
            <header className="page-header">
                <Link href="/" className="back-link">← Back to Map</Link>
                <h1 className="page-title"><Info size={32} style={{ marginRight: 8 }} /> About Urja-Link India</h1>
                <p className="page-subtitle">Empowering India&apos;s solar revolution through AI and technology</p>
            </header>

            <div className="content-section">
                {/* Mission */}
                <div className="info-card" style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: "var(--foreground)", display: "flex", alignItems: "center", gap: 8 }}>
                        <Target size={24} color="var(--warning)" /> Our Mission
                    </h2>
                    <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text-secondary)" }}>
                        Urja-Link India is an AI-powered national platform designed to accelerate rooftop solar
                        adoption across India. We combine satellite imagery analysis, real-time environmental
                        data from NASA POWER and Open-Meteo, and advanced AI models to provide accurate solar
                        potential estimation for every rooftop in the country.
                    </p>
                </div>

                {/* Key Features */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 24 }}>
                    {[
                        {
                            icon: <Bot size={36} color="var(--warning)" />, title: "AI Rooftop Detection",
                            desc: "Custom-trained models detect rooftops, obstacles, and shadows from satellite imagery for accurate usable area calculation.",
                        },
                        {
                            icon: <Satellite size={36} color="var(--warning)" />, title: "Real Satellite Data",
                            desc: "Integration with Sentinel-2 and Google Earth Engine for high-resolution multispectral analysis of rooftop surfaces.",
                        },
                        {
                            icon: <Sun size={36} color="var(--warning)" />, title: "NASA POWER Integration",
                            desc: "Real solar irradiance data from NASA's POWER database — monthly climatology and peak sun hours for any location in India.",
                        },
                        {
                            icon: <CloudRain size={36} color="var(--warning)" />, title: "Live Weather Data",
                            desc: "Open-Meteo provides real-time temperature, cloud cover, humidity, wind speed, and air quality for accurate loss calculations.",
                        },
                        {
                            icon: <Coins size={36} color="var(--warning)" />, title: "Financial Analysis",
                            desc: "25-year ROI projection with PM Surya Ghar subsidy, net metering, degradation modeling, and inflation-adjusted tariffs.",
                        },
                        {
                            icon: <Landmark size={36} color="var(--warning)" />, title: "Government Dashboard",
                            desc: "National solar progress tracking, state-wise analytics, PM Surya Ghar Yojana monitoring, and energy deficit intelligence.",
                        },
                    ].map((f) => (
                        <div key={f.title} className="info-card">
                            <div style={{ marginBottom: 12 }}>{f.icon}</div>
                            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                            <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text-secondary)" }}>{f.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Technology Stack */}
                <div className="info-card" style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, color: "var(--foreground)", display: "flex", alignItems: "center", gap: 8 }}>
                        <Wrench size={24} color="var(--warning)" /> Technology Stack
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                        {[
                            { label: "Maps", value: "Leaflet + OpenStreetMap" },
                            { label: "Satellite Analysis", value: "Sentinel-2 / GEE" },
                            { label: "Solar Irradiance", value: "NASA POWER API" },
                            { label: "Weather Data", value: "Open-Meteo API" },
                            { label: "AI/ML", value: "Custom PyTorch Models" },
                            { label: "Frontend", value: "Next.js + React" },
                            { label: "Backend", value: "FastAPI + Python" },
                            { label: "Charts", value: "Recharts" },
                        ].map((t) => (
                            <div key={t.label} style={{
                                padding: 14, borderRadius: 10,
                                background: "var(--hover-bg)", border: "1px solid var(--card-border)",
                            }}>
                                <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>
                                    {t.label}
                                </span>
                                <p style={{ fontWeight: 600, marginTop: 4, fontSize: 14 }}>{t.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Data Sources */}
                <div className="info-card">
                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: "var(--foreground)", display: "flex", alignItems: "center", gap: 8 }}>
                        <BarChart2 size={24} color="var(--warning)" /> Data Sources
                    </h2>
                    <ul style={{ fontSize: 14, lineHeight: 2, color: "var(--text-secondary)", paddingLeft: 20 }}>
                        <li>Ministry of New & Renewable Energy (MNRE) — Solar targets and installations data</li>
                        <li>Central Electricity Authority (CEA) — Demand, supply, and deficit statistics</li>
                        <li>DISCOMs — State-wise tariff and net metering policies</li>
                        <li>NASA POWER — 30+ years of solar irradiance climatology</li>
                        <li>Open-Meteo — Real-time weather and air quality data</li>
                        <li>Sentinel-2 / Copernicus — Multispectral satellite imagery</li>
                        <li>SRTM — Digital Elevation Models for terrain analysis</li>
                    </ul>
                </div>
            </div>

            <Footer />
        </div>
    );
}
