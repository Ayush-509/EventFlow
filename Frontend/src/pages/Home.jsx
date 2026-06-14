import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useSocket from '../hooks/useSocket.js';
import { useAuth } from '../context/AuthContext.jsx';
import { sortEvents } from '../context/sortEvent.jsx';
import SortBar from '../components/SortBar';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [recs, setRecs] = useState([]);
  const [dash, setDash] = useState({ categories: [], upcomingByMonth: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [priceFilter, setPriceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const categories = ["All","Tech","Startup","Entertainment","Hackathon","Music","Sports","Education","Business","Workshop","Cultural","Gaming"];
  const { announcements } = useSocket(window.location.origin);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (user) fetchRecs();
    else setRecs([]);
  }, [user]);

  async function fetchEvents(overrides = {}) {
  setLoading(true);
  setError('');
  try {
    const effQ = overrides.q !== undefined ? overrides.q : q;
    const effCategory = overrides.category !== undefined ? overrides.category : category;

    const params = {};
    if (effQ) params.q = effQ;
    if (effCategory) params.category = effCategory;
    params.status = 'Approved';

    const res = await axios.get('/api/events', { params });
    setEvents(res.data.events || []);
  } catch (e) {
    setError('Failed to load events. Please ensure the backend is running.');
  } finally {
    setLoading(false);
  }
}

  async function fetchRecs() {
    try {
      const res = await axios.get('/api/stats/recommendations');
      setRecs(res.data.events || []);
    } catch (_) {}
  }

  async function fetchDashboard() {
    try {
      const r = await axios.get('/api/stats/dashboard');
      setDash({
        categories: r.data?.categories || [],
        upcomingByMonth: r.data?.upcomingByMonth || [],
      });
    } catch (_) {}
  }

  const handleSortChange = (newSortBy, newDir) => {
    setSortBy(newSortBy);
    setSortDir(newDir);
  };

  const getEventStatus = (dateISO) => {
    const now = new Date();
    const eventDate = new Date(dateISO);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    if (eventDay > today) return 'upcoming';
    if (eventDay.getTime() === today.getTime()) return 'ongoing';
    return 'finished';
  };

  const filteredEvents = sortEvents(events, sortBy, sortDir).filter((e) => {
    if (priceFilter === 'free' && (e.ticketPrices.General ?? 0) !== 0) return false;
    if (priceFilter === 'paid' && (e.ticketPrices.General ?? 0) === 0) return false;
    if (statusFilter && getEventStatus(e.date) !== statusFilter) return false;
    return true;
  });

  const Badge = ({ date }) => {
    const status = getEventStatus(date);

    const styles = {
      upcoming: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
      ongoing:  'bg-green-50 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      finished: 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700',
    };

    const labels = {
      upcoming: 'Upcoming',
      ongoing:  'Ongoing',
      finished: 'Finished',
    };

    return (
      <span className={`text-xs px-3 py-1 rounded-full border font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const Card = ({ e }) => (
    <Link
      to={`/events/${e._id}`}
      className="group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1"
    >
      <img
        src={e.posterUrl || '/placeholder.svg'}
        alt="poster"
        className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(ev) => {
          ev.currentTarget.onerror = null;
          ev.currentTarget.src = '/placeholder.svg';
        }}
        loading="lazy"
      />

      <div className="absolute top-3 left-3 flex items-center gap-2">
        <Badge date={e.date} />
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
          ₹ {e.ticketPrices.General || 0}
        </div>

        <div className="mt-2 text-amber-500 text-sm font-medium">
          ⭐ {e.averageRating?.toFixed?.(1) || '0.0'} / 5
        </div>
      </div>
    </Link>
  );

  const Skeleton = () => (
    <div className="animate-pulse rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
      <div className="w-full h-52 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 w-3/4 rounded" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 w-full rounded" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 w-1/2 rounded" />
      </div>
    </div>
  );

  const FilterChip = ({ label, value, active, onClick }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm border transition ${
        active
          ? 'bg-blue-600 text-white border-blue-600 dark:bg-purple-600 dark:border-purple-600'
          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400 dark:hover:border-purple-500'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-10">
      {error && (
        <div className="rounded-2xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {announcements.length > 0 && (
        <div className="rounded-3xl p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-purple-950/40 border border-blue-100 dark:border-purple-800/30">
          <div className="font-semibold text-lg mb-2 text-slate-800 dark:text-slate-100">
            Live announcements
          </div>
          <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc pl-5 space-y-1">
            {announcements.slice(0, 3).map((a, i) => (
              <li key={i}>{a.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-3xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center gap-3 shadow-sm">

        <div className="flex-1 min-w-[250px] flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
          <span className="material-symbols-outlined px-3 text-slate-500">search</span>
          <input
            type="text"
            placeholder="Search events..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 px-2 py-2 bg-transparent outline-none text-slate-800 dark:text-slate-100"
          />
        </div>

        <button
          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-medium"
          onClick={fetchEvents}
        >
          Search
        </button>

        <div className="flex flex-wrap gap-2 w-full">
          {categories.map((c) => {
            const active = (c === 'All' && !category) || c === category;
            return (
              <button
                key={c}
                className={`px-3 py-1 rounded-full text-sm border transition ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600 dark:bg-purple-600 dark:border-purple-600'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400 dark:hover:border-purple-500'
                }`}
                onClick={() => {
                  const next = c === 'All' ? '' : c;
                  setCategory(next);
                  fetchEvents({ category: next });
                }}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Price filter */}
        <div className="flex flex-wrap items-center gap-2 w-full">
          <span className="text-sm text-slate-500 dark:text-slate-400">Price:</span>
          {[
            { label: 'All', value: '' },
            { label: 'Free', value: 'free' },
            { label: 'Paid', value: 'paid' },
          ].map((opt) => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              active={priceFilter === opt.value}
              onClick={() => setPriceFilter(opt.value)}
            />
          ))}
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap items-center gap-2 w-full">
          <span className="text-sm text-slate-500 dark:text-slate-400">Status:</span>
          {[
            { label: 'All', value: '' },
            { label: 'Upcoming', value: 'upcoming' },
            { label: 'Ongoing', value: 'ongoing' },
            { label: 'Finished', value: 'finished' },
          ].map((opt) => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              active={statusFilter === opt.value}
              onClick={() => setStatusFilter(opt.value)}
            />
          ))}
        </div>

      </div>

      {recs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Recommended for you
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recs.map((e) => (
              <Card key={e._id} e={e} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            All events
          </h2>
          <SortBar onSortChange={handleSortChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
            : filteredEvents.map((e) => <Card key={e._id} e={e} />)}
        </div>
      </section>

      {(dash.categories.length > 0 || dash.upcomingByMonth.length > 0) && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5">
          <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">
            Event statistics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <div className="font-semibold mb-2 text-slate-700 dark:text-slate-200">
                By category
              </div>
              <ul className="space-y-2">
                {dash.categories.map((c) => (
                  <li
                    key={c._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                  >
                    <span>{c._id || 'Uncategorized'}</span>
                    <span className="text-slate-600 dark:text-slate-300">{c.count}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="font-semibold mb-2 text-slate-700 dark:text-slate-200">
                Upcoming (next months)
              </div>
              <ul className="space-y-2">
                {dash.upcomingByMonth.map((m) => (
                  <li
                    key={m._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                  >
                    <span>{m._id}</span>
                    <span className="text-slate-600 dark:text-slate-300">{m.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Leaderboard() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      const r = await axios.get('/api/stats/leaderboard');
      setRows(r.data.leaderboard || []);
    })();
  }, []);

  return (
    <ul className="space-y-2">
      {rows.map((r, idx) => (
        <li
          key={r._id || idx}
          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 text-center font-semibold">{idx + 1}</span>
            <span>{r.name}</span>
          </div>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            {r.points} pts
          </span>
        </li>
      ))}
    </ul>
  );
}