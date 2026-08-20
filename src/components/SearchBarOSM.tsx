"use client";

import { useCallback, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Loader2, MapPin } from "lucide-react";

interface SearchProps {
    onSearch: (lat: number, lng: number) => void;
}

export default function SearchBarOSM({ onSearch }: SearchProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setPortalRoot(document.getElementById("search-portal-slot"));
    }, []);

    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;
        setIsSearching(true);
        setSuggestions([]);

        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`;
            const res = await fetch(url, {
                headers: { "User-Agent": "UrjaLink/2.0" },
            });
            const data = await res.json();

            if (data.length > 0) {
                setSuggestions(data);
                onSearch(parseFloat(data[0].lat), parseFloat(data[0].lon));
            }
        } catch (e) {
            console.error("Search failed:", e);
        } finally {
            setIsSearching(false);
        }
    }, [query, onSearch]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    const searchComponent = (
        <div className="search-container-inner" style={{ width: "100%", position: "relative" }}>
            <div style={{ position: "relative", pointerEvents: "auto" }}>
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search any location.."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button className="search-btn" onClick={handleSearch} disabled={isSearching} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isSearching ? <Loader2 size={18} className="spin-icon" /> : <Search size={18} />}
                </button>
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 1 && (
                <div style={{
                    position: "absolute", width: "100%", marginTop: 4, borderRadius: 12, overflow: "hidden",
                    background: "var(--card-bg)", backdropFilter: "blur(16px)", border: "1px solid var(--card-border)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", zIndex: 100000
                }}>
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                onSearch(parseFloat(s.lat), parseFloat(s.lon));
                                setQuery(s.display_name.split(",").slice(0, 3).join(", "));
                                setSuggestions([]);
                            }}
                            style={{
                                width: "100%", padding: "10px 16px", border: "none",
                                borderBottom: i < suggestions.length - 1 ? "1px solid rgba(128,128,128,0.1)" : "none",
                                background: "transparent", color: "var(--foreground)", fontSize: 13,
                                textAlign: "left", cursor: "pointer", transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-bg)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            <MapPin size={14} style={{ display: "inline", marginRight: 6, verticalAlign: "bottom" }} />
                            {s.display_name.length > 70 ? s.display_name.slice(0, 70) + "..." : s.display_name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    if (portalRoot) {
        return createPortal(searchComponent, portalRoot);
    }

    // Fallback if portal slot is not available (e.g., SSR)
    return <div className="search-container" style={{ position: "fixed", top: "80px", left: "16px", right: "16px", zIndex: 99999 }}>{searchComponent}</div>;
}
