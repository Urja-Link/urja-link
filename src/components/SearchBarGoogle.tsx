"use client";

import { useState } from "react";
import { Autocomplete } from "@react-google-maps/api";

interface SearchBarProps {
    onSearch: (lat: number, lng: number, address: string) => void;
}

export default function SearchBarGoogle({ onSearch }: SearchBarProps) {
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

    const onLoad = (autoC: google.maps.places.Autocomplete) => {
        setAutocomplete(autoC);
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
                onSearch(place.geometry.location.lat(), place.geometry.location.lng(), place.formatted_address || place.name || "");
            }
        }
    };

    return (
        <div style={S.wrapper}>
            {/* 
        This is an invisible wrapper that safely uses the Autocomplete component
        which requires the Google Map script to be loaded completely.
        Since <MapGoogle> is loading the script in page.tsx, 
        this component will piggy-back off that global script object implicitly.
      */}
            {typeof window !== "undefined" && window.google && window.google.maps ? (
                <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged} restrictions={{ country: "IN" }}>
                    <div style={S.inner}>
                        <span style={S.icon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search any address in India (Google Places)..."
                            style={S.input}
                        />
                        <button type="button" style={S.btn}>→</button>
                    </div>
                </Autocomplete>
            ) : (
                <div style={S.inner}>
                    <span style={S.icon}>🔍</span>
                    <input
                        type="text"
                        placeholder="Waiting for Google Maps API..."
                        style={S.input}
                        disabled
                    />
                </div>
            )}
        </div>
    );
}

const S: Record<string, React.CSSProperties> = {
    wrapper: {
        position: "absolute",
        top: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        width: "100%",
        maxWidth: 600,
    },
    inner: {
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(56, 189, 248, 0.2)",
        borderRadius: 16,
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        gap: 12,
    },
    icon: {
        fontSize: 18,
        opacity: 0.8,
    },
    input: {
        flex: 1,
        background: "transparent",
        border: "none",
        color: "#e8ecf1",
        fontSize: 15,
        outline: "none",
        fontFamily: "inherit",
    },
    btn: {
        background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)",
        border: "none",
        color: "white",
        width: 36,
        height: 36,
        borderRadius: 10,
        fontSize: 16,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
    },
};
