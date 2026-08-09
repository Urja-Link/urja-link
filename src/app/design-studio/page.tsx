"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Grid, Layers, Sun, RotateCcw, Trash2, Save, Maximize, Zap, IndianRupee } from "lucide-react";

const GRID_SIZE = 25; // 25x25 meter roof
const CELL_SIZE = 24; // 24px per meter for rendering

interface Panel {
    id: string;
    x: number;
    y: number;
    orientation: "portrait" | "landscape"; // portrait = 1x2 meters, landscape = 2x1 meters
}

export default function DesignStudio() {
    const [panels, setPanels] = useState<Panel[]>([]);
    const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
    const [hoverCell, setHoverCell] = useState<{ x: number, y: number } | null>(null);

    // Calculate metrics
    const PANEL_WATTAGE = 400; // 400W per panel
    const totalPanels = panels.length;
    const totalKW = (totalPanels * PANEL_WATTAGE) / 1000;
    const estimatedCost = totalKW * 60000; // rough ₹60k per kW

    const isOccupied = (x: number, y: number, o: "portrait" | "landscape") => {
        const reqBoxes = o === "portrait" ? [{ x, y }, { x, y: y + 1 }] : [{ x, y }, { x: x + 1, y }];

        // Out of bounds
        for (const b of reqBoxes) {
            if (b.x >= GRID_SIZE || b.y >= GRID_SIZE) return true;
        }

        // Overlap check
        for (const p of panels) {
            const pBoxes = p.orientation === "portrait" ? [{ x: p.x, y: p.y }, { x: p.x, y: p.y + 1 }] : [{ x: p.x, y: p.y }, { x: p.x + 1, y: p.y }];

            for (const rb of reqBoxes) {
                if (pBoxes.some(pb => pb.x === rb.x && pb.y === rb.y)) return true;
            }
        }
        return false;
    };

    const handleCellClick = (x: number, y: number) => {
        // Find if we clicked on an existing panel to remove it
        const clickedPanelIndex = panels.findIndex(p => {
            if (p.orientation === "portrait") return (p.x === x && (p.y === y || p.y === y - 1));
            return ((p.x === x || p.x === x - 1) && p.y === y);
        });

        if (clickedPanelIndex !== -1) {
            // Remove panel
            const newPanels = [...panels];
            newPanels.splice(clickedPanelIndex, 1);
            setPanels(newPanels);
            return;
        }

        // Otherwise try to add a new panel
        if (!isOccupied(x, y, orientation)) {
            setPanels([...panels, { id: Math.random().toString(), x, y, orientation }]);
        }
    };

    const handleClear = () => setPanels([]);

    return (
        <div className="page-container" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <header className="page-header" style={{ paddingBottom: 24, padding: "100px 48px 32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Layers size={32} color="var(--warning)" /> Roof Design Studio
                    </h1>
                    <p className="page-subtitle">Interactive 2D Sandbox: Plan your PV Array Capacity</p>
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px dashed var(--card-border)", padding: "12px 24px", borderRadius: 12, display: "flex", gap: 24 }}>
                        <div>
                            <span style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 0.5, textTransform: "uppercase" }}>System Size</span>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--warning)", display: "flex", alignItems: "center", gap: 4 }}><Zap size={16} /> {totalKW.toFixed(2)} kW</div>
                        </div>
                        <div>
                            <span style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 0.5, textTransform: "uppercase" }}>Est. Cost</span>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--success)", display: "flex", alignItems: "center", gap: 4 }}><IndianRupee size={16} /> {(estimatedCost / 100000).toFixed(2)}L</div>
                        </div>
                    </div>
                </div>
            </header>

            <div style={{ padding: "0 48px", flex: 1, display: "flex", gap: 32, marginBottom: 40, height: "calc(100vh - 250px)" }}>
                {/* Tools Sidebar */}
                <div className="info-card" style={{ width: 300, padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
                    <div>
                        <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)", marginBottom: 16 }}>Inventory Tools</h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <button className="primary-button" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, width: "100%" }}>
                                <Sun size={18} /> Standard 400W Panel
                            </button>

                            <button
                                onClick={() => setOrientation(prev => prev === "portrait" ? "landscape" : "portrait")}
                                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, width: "100%", background: "transparent", border: "1px solid var(--card-border)", color: "var(--foreground)", borderRadius: 8, cursor: "pointer" }}
                            >
                                <RotateCcw size={18} /> Rotate {orientation === "portrait" ? "(Portrait)" : "(Landscape)"}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginTop: "auto", display: "flex", gap: 12 }}>
                        <button
                            onClick={handleClear}
                            style={{ flex: 1, padding: 12, background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "var(--danger)", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                        >
                            <Trash2 size={16} /> Clear
                        </button>
                        <button
                            style={{ flex: 1, padding: 12, background: "var(--success)", border: "none", color: "#000", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 600 }}
                        >
                            <Save size={16} /> Save
                        </button>
                    </div>
                </div>

                {/* Grid Workspace */}
                <div className="info-card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", background: "#1e293b" }}>
                    <div style={{ position: "absolute", top: 16, left: 16, zIndex: 10, display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.5)", padding: "6px 12px", borderRadius: 8, border: "1px solid var(--card-border)", color: "var(--text-secondary)", fontSize: 13 }}>
                        <Maximize size={16} /> Workspace: {GRID_SIZE}m x {GRID_SIZE}m
                    </div>

                    <div
                        style={{
                            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto", padding: 40
                        }}
                    >
                        <div
                            style={{
                                position: "relative",
                                width: GRID_SIZE * CELL_SIZE,
                                height: GRID_SIZE * CELL_SIZE,
                                background: "#0f172a", // Darker roof background
                                backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                                backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
                                border: "2px solid var(--card-border)",
                                cursor: "crosshair",
                                boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
                            }}
                            onMouseLeave={() => setHoverCell(null)}
                        >
                            {/* Render Ghost Hover Panel */}
                            {hoverCell && !isOccupied(hoverCell.x, hoverCell.y, orientation) && (
                                <div style={{
                                    position: "absolute",
                                    left: hoverCell.x * CELL_SIZE,
                                    top: hoverCell.y * CELL_SIZE,
                                    width: orientation === "portrait" ? CELL_SIZE : CELL_SIZE * 2,
                                    height: orientation === "portrait" ? CELL_SIZE * 2 : CELL_SIZE,
                                    background: "rgba(34, 197, 94, 0.4)", // green tint
                                    border: "2px dashed var(--success)",
                                    pointerEvents: "none", zIndex: 5
                                }} />
                            )}

                            {hoverCell && isOccupied(hoverCell.x, hoverCell.y, orientation) && (
                                <div style={{
                                    position: "absolute",
                                    left: hoverCell.x * CELL_SIZE,
                                    top: hoverCell.y * CELL_SIZE,
                                    width: orientation === "portrait" ? CELL_SIZE : CELL_SIZE * 2,
                                    height: orientation === "portrait" ? CELL_SIZE * 2 : CELL_SIZE,
                                    background: "rgba(239, 68, 68, 0.4)", // red tint
                                    border: "2px dashed var(--danger)",
                                    pointerEvents: "none", zIndex: 5
                                }} />
                            )}

                            {/* Render Actual Panels */}
                            {panels.map(p => (
                                <div
                                    key={p.id}
                                    style={{
                                        position: "absolute",
                                        left: p.x * CELL_SIZE,
                                        top: p.y * CELL_SIZE,
                                        width: p.orientation === "portrait" ? CELL_SIZE : CELL_SIZE * 2,
                                        height: p.orientation === "portrait" ? CELL_SIZE * 2 : CELL_SIZE,
                                        background: "linear-gradient(135deg, #1e3a8a, #1d4ed8)",
                                        border: "1px solid #60a5fa",
                                        boxShadow: "inset 0 0 10px rgba(255,255,255,0.2), 0 4px 6px rgba(0,0,0,0.3)",
                                        borderRadius: 2,
                                        zIndex: 10,
                                        transition: "transform 0.1s"
                                    }}
                                />
                            ))}

                            {/* Click Interaction overlay */}
                            {Array.from({ length: GRID_SIZE }).map((_, y) => (
                                Array.from({ length: GRID_SIZE }).map((_, x) => (
                                    <div
                                        key={`${x}-${y}`}
                                        onMouseEnter={() => setHoverCell({ x, y })}
                                        onClick={() => handleCellClick(x, y)}
                                        style={{
                                            position: "absolute",
                                            left: x * CELL_SIZE,
                                            top: y * CELL_SIZE,
                                            width: CELL_SIZE,
                                            height: CELL_SIZE,
                                            zIndex: 20 // Keep above everything to capture clicks
                                        }}
                                    />
                                ))
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
