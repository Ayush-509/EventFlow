import { MapContainer, TileLayer, Marker } from "react-leaflet";

export default function EventLocationMap({
  latitude,
  longitude,
}) {
  if (!latitude || !longitude)
    return null;

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={14}
      style={{
        height: "350px",
        width: "100%",
        borderRadius: "12px",
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker
        position={[latitude, longitude]}
      />
    </MapContainer>
  );
}