import { useEffect, useState } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import { Link } from "react-router-dom";

export default function EventsMap() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const res = await axios.get("/api/events");

      const validEvents =
        res.data.events.filter(
          (event) =>
            event.latitude &&
            event.longitude
        );

      setEvents(validEvents);
    } catch (error) {
      console.log(error);
    }
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">
          No mapped events available
        </h2>

        <p className="text-slate-500 mt-2">
          Create events with locations
          to display them here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-black">
          🗺️ Explore Events
        </h1>

        <p className="text-slate-500 mt-2">
          Discover events visually
          across locations.
        </p>
      </div>

      <MapContainer
        center={[
          events[0].latitude,
          events[0].longitude,
        ]}
        zoom={5}
        style={{
          height: "75vh",
          width: "100%",
          borderRadius: "20px",
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {events.map((event) => (
          <Marker
            key={event._id}
            position={[
              event.latitude,
              event.longitude,
            ]}
          >
            <Popup>
              <div className="space-y-2">
                <h3 className="font-bold">
                  {event.title}
                </h3>

                <p>
                  📍 {event.location}
                </p>

                <p>
                  🏷️ {event.category}
                </p>

                <Link
                  to={`/events/${event._id}`}
                  className="block text-center bg-white text-blue-600 hover:bg-blue-100 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-600 px-3 py-2 rounded-lg"
                >
                  View Event
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}