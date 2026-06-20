import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Favorites() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  async function fetchFavorites() {
    try {
      const res = await axios.get("/api/favorites");

      setEvents(res.data.events || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-500">
        Loading favourites...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center">
        <div className="text-6xl mb-4">❤️</div>

        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          No Favourite Events
        </h2>

        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Save events using the heart icon to view them here.
        </p>

        <Link
          to="/"
          className="inline-block mt-6 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
        >
          Browse Events
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          My Favourite Events
        </h1>

        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Events you've saved for later.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((e) => (
          <Link
            key={e._id}
            to={`/events/${e._id}`}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1"
          >
            <img
              src={e.posterUrl || "/placeholder.svg"}
              alt={e.title}
              className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(ev) => {
                ev.currentTarget.onerror = null;
                ev.currentTarget.src = "/placeholder.svg";
              }}
            />

            <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-full p-2 shadow">
              ❤️
            </div>

            <div className="absolute top-3 left-3">
              <span className="text-xs px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-700">
                {e.category}
              </span>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-purple-300 transition-colors">
                {e.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
                {e.description}
              </p>

              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {new Date(e.date).toLocaleString()} • {e.location}
              </div>

              <div className="mt-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                ₹ {e.ticketPrices?.General || 0}
              </div>

              <div className="mt-2 text-amber-500 text-sm font-medium">
                ⭐ {e.averageRating?.toFixed?.(1) || "0.0"} / 5
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}