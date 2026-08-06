"use client";

import { useState } from "react";

interface SearchBarProps {
    onSearch: (lat: number, lng: number) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsSearching(true);

        try {
            // Use OpenStreetMap Nominatim for free geocoding
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1`,
                {
                    headers: {
                        "Accept-Language": "en",
                    },
                }
            );
            const results = await res.json();

            if (results.length > 0) {
                const { lat, lon } = results[0];
                onSearch(parseFloat(lat), parseFloat(lon));
            } else {
                alert("Location not found. Try a more specific address.");
            }
        } catch {
            alert("Geocoding service unavailable. Please try again.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    return (
        <div className="search-container">
            <input
                type="text"
                className="search-input"
                placeholder="🔍 Search any address in India..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSearching}
            />
            <button className="search-btn" onClick={handleSearch} disabled={isSearching}>
                {isSearching ? "⏳" : "→"}
            </button>
        </div>
    );
}
