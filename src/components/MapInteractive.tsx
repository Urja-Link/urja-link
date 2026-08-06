"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

// Fix default marker icons for Leaflet in bundled environments
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapInteractiveProps {
  center: [number, number];
  onLocationSelect: (lat: number, lng: number) => void;
  markerPosition: [number, number] | null;
}

function ClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapInteractive({ center, onLocationSelect, markerPosition }: MapInteractiveProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div style={{ height: "100vh", width: "100vw", background: "#0a0f1a" }} />;
  }

  return (
    <MapContainer center={center} zoom={17} style={{ height: "100vh", width: "100vw" }} zoomControl={true}>
      {/* Dark satellite tile layer */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution='Tiles &copy; Esri'
      />
      <ClickHandler onLocationSelect={onLocationSelect} />
      {markerPosition && (
        <Marker position={markerPosition} icon={defaultIcon}>
          <Popup>
            <div style={{ color: "#0f172a", fontWeight: 600 }}>
              📍 Selected Location<br />
              <span style={{ fontWeight: 400, fontSize: 12 }}>
                {markerPosition[0].toFixed(5)}, {markerPosition[1].toFixed(5)}
              </span>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
