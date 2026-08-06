"use client";

import { useCallback, useState, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polygon, DrawingManager } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "100%" };
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }; // India
const LIBRARIES: ("places" | "drawing" | "geometry")[] = ["places", "drawing", "geometry"];

interface MapGoogleProps {
    center: { lat: number; lng: number };
    markerPosition: { lat: number; lng: number } | null;
    onLocationSelect: (lat: number, lng: number) => void;
}

export default function MapGoogle({ center, markerPosition, onLocationSelect }: MapGoogleProps) {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [polygonPath, setPolygonPath] = useState<google.maps.LatLngLiteral[]>([]);
    const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);

    const { isLoaded, loadError } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: LIBRARIES,
    });

    const onLoad = useCallback((mapInstance: google.maps.Map) => {
        setMap(mapInstance);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            setPolygonPath([]); // Clear any drawn polygons
            if (drawingManagerRef.current) drawingManagerRef.current.setDrawingMode(null);
            onLocationSelect(e.latLng.lat(), e.latLng.lng());
        }
    };

    const onPolygonComplete = (polygon: google.maps.Polygon) => {
        const path = polygon.getPath().getArray().map((p) => ({ lat: p.lat(), lng: p.lng() }));
        setPolygonPath(path);
        polygon.setMap(null); // Remove the drawn polygon to use our controlled <Polygon> component

        // Roughly estimate center of polygon for the marker and API call
        if (path.length > 0) {
            const avgLat = path.reduce((sum, p) => sum + p.lat, 0) / path.length;
            const avgLng = path.reduce((sum, p) => sum + p.lng, 0) / path.length;
            onLocationSelect(avgLat, avgLng);
        }
    };

    if (loadError) {
        return (
            <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0f1a", color: "#ef4444" }}>
                <h3>Error loading Google Maps. Is the API Key valid?</h3>
            </div>
        );
    }

    if (!isLoaded) {
        return <div style={{ height: "100%", width: "100%", background: "#0a0f1a" }} />;
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={(markerPosition && center.lat !== DEFAULT_CENTER.lat) ? markerPosition : center} // Track marker strictly
            zoom={markerPosition ? 18 : 5}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
            options={{
                mapTypeId: "satellite",
                disableDefaultUI: false, // Keep terrain/satellite controls
                streetViewControl: false,
                fullscreenControl: false,
            }}
        >
            {/* Search Marker */}
            {markerPosition && polygonPath.length === 0 && (
                <Marker position={markerPosition} animation={!map ? undefined : window.google.maps.Animation.DROP} />
            )}

            {/* User Drawn Polygon */}
            {polygonPath.length > 0 && (
                <Polygon
                    paths={polygonPath}
                    options={{
                        fillColor: "#38bdf8",
                        fillOpacity: 0.4,
                        strokeColor: "#0ea5e9",
                        strokeOpacity: 1,
                        strokeWeight: 2,
                    }}
                />
            )}

            {/* Drawing Manager Tools */}
            <DrawingManager
                onLoad={(dm) => { drawingManagerRef.current = dm; }}
                onPolygonComplete={onPolygonComplete}
                options={{
                    drawingControl: true,
                    drawingControlOptions: {
                        position: !map ? undefined : window.google.maps.ControlPosition.TOP_LEFT,
                        drawingModes: [
                            window.google.maps.drawing.OverlayType.POLYGON
                        ]
                    },
                    polygonOptions: {
                        fillColor: "#38bdf8",
                        fillOpacity: 0.4,
                        strokeWeight: 2,
                        clickable: false,
                        editable: true,
                        zIndex: 1
                    }
                }}
            />
        </GoogleMap>
    );
}
