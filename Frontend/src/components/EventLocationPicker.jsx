import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const coords = e.latlng;

      setPosition(coords);

      onLocationSelect(
        coords.lat,
        coords.lng
      );
    },
  });

  return position ? (
    <Marker position={position} />
  ) : null;
}

export default function EventLocationPicker({
  onLocationSelect,
}) {
  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{
        height: "350px",
        width: "100%",
        borderRadius: "12px",
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationMarker
        onLocationSelect={onLocationSelect}
      />
    </MapContainer>
  );
}