import { useEffect, useMemo, useState } from "react";
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import EventTicket from '../components/EventTicket.jsx';
import { Link } from "react-router-dom";
// EventLocationPicker removed — create-event form removed from this page
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A855F7",
];
export default function Dashboard() {
  const { user, logout } = useAuth();
  const [participants, setParticipants] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [mine, setMine] = useState([]);
  
  const [Pending, setPending] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [downloadAction, setDownloadAction] = useState(null);
  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });
  
  const [myEvents, setMyEvents] = useState([]);
  const [deleteEventId, setDeleteEventId] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
  totalEvents: 0,
  totalAttendees: 0,
  totalTicketsSold: 0,
  totalRevenue: 0,
  eventsByCategory: [],
  ticketsByCategory: [],
  revenueByCategory: [],
  attendeesByCategory: [],
});
const [selectedAnalyticsEvent, setSelectedAnalyticsEvent] =
  useState("");

const [eventAnalytics, setEventAnalytics] =
  useState(null);

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false, type: 'info', message: '' }), 3000);
  };

  useEffect(() => {
  if (!user) return;

  if (user.role === "customer") {
    loadMyRegs();
  }

  if (user.role === "organizer") {
  loadMyEvents();
  loadAnalytics();
}

  if (user.role === "admin") {
    loadPending();
  }
}, [user]);

  async function loadMyRegs() {
    const res = await axios.get('/api/registrations/my');
    setMine(res.data.registrations || []);
  }


  async function loadPending() {
    const res = await axios.get('/api/events', { params: { status: 'Pending' } });
    setPending(res.data.events || []);
  }

  async function loadParticipants(eventId) {
    const res = await axios.get(`/api/registrations/${eventId}/participants`);
    setParticipants(res.data.participants || []);
  }

  async function loadMyEvents() {
  try {
    const { data } = await axios.get(
      "/api/events/organizer/my-events"
    );

    setMyEvents(data.events);
  } catch (error) {
    console.log(error);
  }
}
async function loadAnalytics() {
  try {
    const { data } = await axios.get(
      "/api/events/organizer/analytics"
    );

    if (data.success) {
      setAnalyticsData(data);
    }
  } catch (error) {
    console.log(error);
  }
}
async function loadEventAnalytics(eventId) {
  try {
    const { data } = await axios.get(
      `/api/events/analytics/${eventId}`
    );

    if (data.success) {
      setEventAnalytics(data);
      setSelectedAnalyticsEvent(eventId);
    }
  } catch (error) {
    console.log(error);
  }
}

  async function exportCsv(eventId) {
    try {
      const check = await axios.get(`/api/registrations/${eventId}/participants`);
      const list = check.data.participants || [];
      if (!Array.isArray(list) || list.length === 0) {
        showToast('error', 'No participants available for this event.');
        return;
      }
    } catch {
      showToast('error', 'Unable to fetch participants.');
      return;
    }

    const res = await axios.get(`/api/registrations/${eventId}/participants.csv`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants-${eventId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async function approve(id) {
    await axios.post(`/api/admin/events/${id}/approve`);
    await loadPending();
  }

  async function reject(id) {
    await axios.post(`/api/admin/events/${id}/reject`);
    await loadPending();
  }

  const analytics = useMemo(() => {
    const byStatus = mine.reduce((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {});
    const byCategory = mine.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    }, {});
    return { byStatus, byCategory };
  }, [mine]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast.open && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-xl text-white shadow-lg
          ${toast.type === 'error'
            ? 'bg-red-600'
            : toast.type === 'success'
            ? 'bg-emerald-600'
            : 'bg-blue-600'
          }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h1>
        <div className="text-sm flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <span>{user?.name} ({user?.role})</span>
          <button onClick={logout} className="underline hover:text-red-500">
            Logout
          </button>
        </div>
      </div>

      {/* CUSTOMER */}
      {user?.role === "customer" && (
  <div className="space-y-5">
    {/* Header */}
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
        My Passes
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Offline-ready event passes. Open once while online to cache them.
      </p>
    </div>

    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg transition-colors duration-300">
      {mine.length === 0 ? (
        <div className="text-center text-sm text-slate-500 py-10">
          No registrations found yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {mine.map((r) => (
            <div
              key={r._id}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />

              <div className="relative p-5">
                {/* Top Section */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                      {r.event?.title}
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(r.event?.date).toLocaleString()}
                    </p>

                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {r.event?.location}
                    </p>
                  </div>

                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800 whitespace-nowrap">
                    Active Pass
                  </span>
                </div>

                {/* Ticket Details */}
                <div className="mt-4 text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  <p>
                    <strong>Ticket ID:</strong> {r.ticketId}
                  </p>
                  <p>
                    <strong>Type:</strong> {r.ticketType}
                  </p>
                  <p>
                    <strong>Price:</strong> ₹{r.price}
                  </p>
                </div>

                {/* QR + Actions */}
                <div className="flex items-center justify-between mt-5">
                  {r.qrCodeDataUrl ? (
                    <img
                      src={r.qrCodeDataUrl}
                      className="h-16 w-16 rounded-lg border border-slate-200 dark:border-slate-700 bg-white shadow-sm"
                      alt="QR"
                    />
                  ) : (
                    <div />
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTicket(r)}
                      className="px-3 py-2 rounded-lg text-sm bg-slate-900 text-white hover:bg-slate-700 transition"
                    >
                      View
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("token");

                          const response = await axios.get(
                            `http://localhost:5000/api/tickets/download/${r._id}`,
                            {
                              responseType: "blob",
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );

                          const url = window.URL.createObjectURL(
                            new Blob([response.data])
                          );

                          const link = document.createElement("a");

                          link.href = url;
                          link.download = `${r.ticketId}.pdf`;

                          document.body.appendChild(link);

                          link.click();

                          link.remove();
                        } catch (error) {
                          console.log("FULL ERROR:", error);
                          console.log("MESSAGE:", error.message);
                          console.log("RESPONSE:", error.response);
                          console.log("REQUEST:", error.request);
                        }
                      }}
                      className="px-3 py-2 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

{/* ================= ORGANIZER DASHBOARD ================= */}
{user?.role === "organizer" && (
  <div className="space-y-10 text-slate-900 dark:text-slate-100 min-h-screen p-1 transition-colors duration-300">
    
    {/* Header Section */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-800 pb-6 gap-4">
      <div>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
          Manage your events ecosystem, track real-time distribution metrics, and review performance trends.
        </p>
      </div>
      
      {/* Optional Top Actions Bar */}
      <div className="flex items-center gap-3">
        <Link to="/createEvent" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
          Create Event
        </Link>
      </div>
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Total Events */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-blue-100 font-medium text-xs tracking-wider uppercase">Total Events</p>
            <h2 className="text-4xl font-black mt-2 tracking-tight">{analyticsData?.totalEvents ?? 0}</h2>
          </div>
          <div className="w-14 h-14 bg-white/10 dark:bg-black/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner backdrop-blur-sm">
            🎟️
          </div>
        </div>
      </div>

      {/* Attendees */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-purple-100 font-medium text-xs tracking-wider uppercase">Attendees</p>
            <h2 className="text-4xl font-black mt-2 tracking-tight">{analyticsData?.totalAttendees ?? 0}</h2>
          </div>
          <div className="w-14 h-14 bg-white/10 dark:bg-black/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner backdrop-blur-sm">
            👥
          </div>
        </div>
      </div>

      {/* Tickets Sold */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-orange-100 font-medium text-xs tracking-wider uppercase">Tickets Sold</p>
            <h2 className="text-4xl font-black mt-2 tracking-tight">{analyticsData?.totalTicketsSold ?? 0}</h2>
          </div>
          <div className="w-14 h-14 bg-white/10 dark:bg-black/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner backdrop-blur-sm">
            🎫
          </div>
        </div>
      </div>

      {/* Revenue */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-green-100 font-medium text-xs tracking-wider uppercase">Total Revenue</p>
            <h2 className="text-4xl font-black mt-2 tracking-tight">
              ₹{(analyticsData?.totalRevenue ?? 0).toLocaleString("en-IN")}
            </h2>
          </div>
          <div className="w-14 h-14 bg-white/10 dark:bg-black/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner backdrop-blur-sm">
            💰
          </div>
        </div>
      </div>
    </div>

    {/* Primary Trend Analysis (Line + Bar Chart Combo) */}
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
      <div className="mb-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg tracking-tight">Revenue & Tickets Sold Over Time</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500">Performance timeline overview</p>
      </div>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={analyticsData?.historicalData ?? []} margin={{ top: 10, right: -10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis yAxisId="left" stroke="#10b981" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
            <YAxis yAxisId="right" orientation="right" stroke="#6366f1" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px' }} />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Bar yAxisId="left" dataKey="revenue" name="Revenue (₹)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Line yAxisId="right" type="monotone" dataKey="tickets" name="Tickets Sold" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Secondary Distribution Matrix (Upgraded Donut Charts) */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Events By Category */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-colors duration-300">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base tracking-tight mb-2">Events By Category</h3>
        <div className="h-[240px] w-full flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analyticsData?.eventsByCategory ?? []}
                dataKey="count"
                nameKey="category"
                outerRadius={85}
                innerRadius={60}
                paddingAngle={3}
              >
                {(analyticsData?.eventsByCategory ?? []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute text-center pointer-events-none">
            <span className="block text-2xl font-black">{analyticsData?.totalEvents ?? 0}</span>
            <span className="text-[10px] uppercase text-slate-400 tracking-wider">Total Shows</span>
          </div>
        </div>
      </div>

      {/* Revenue By Category */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-colors duration-300">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base tracking-tight mb-2">Revenue By Category</h3>
        <div className="h-[240px] w-full flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analyticsData?.revenueByCategory ?? []}
                dataKey="revenue"
                nameKey="category"
                outerRadius={85}
                innerRadius={60}
                paddingAngle={3}
              >
                {(analyticsData?.revenueByCategory ?? []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute text-center pointer-events-none">
            <span className="block text-sm font-black text-emerald-500">₹{(analyticsData?.totalRevenue ?? 0).toLocaleString("en-IN", { notation: "compact" })}</span>
            <span className="text-[10px] uppercase text-slate-400 tracking-wider">Earnings</span>
          </div>
        </div>
      </div>

      {/* Attendees By Category */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-colors duration-300">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base tracking-tight mb-2">Attendees By Category</h3>
        <div className="h-[240px] w-full flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analyticsData?.attendeesByCategory ?? []}
                dataKey="count"
                nameKey="category"
                outerRadius={85}
                innerRadius={60}
                paddingAngle={3}
              >
                {(analyticsData?.attendeesByCategory ?? []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute text-center pointer-events-none">
            <span className="block text-2xl font-black">{analyticsData?.totalAttendees ?? 0}</span>
            <span className="text-[10px] uppercase text-slate-400 tracking-wider">Crowd Count</span>
          </div>
        </div>
      </div>
    </div>

    {/* Horizontal Bar Chart: Revenue By Specific Events */}
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
      <div className="mb-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg tracking-tight">Top Performing Events</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500">Ranked by overall gross revenue generation</p>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={myEvents?.slice(0, 5) ?? []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
            <YAxis type="category" dataKey="title" stroke="#94a3b8" fontSize={11} tickLine={false} width={100} />
            <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px' }} />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 6, 6, 0]} maxBarSize={24} name="Revenue (₹)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Event Management Cards */}
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Events</h2>
      </div>

      {!myEvents || myEvents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
          <p className="text-slate-500 dark:text-slate-400 font-medium">No Events found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {myEvents.map((event) => {
            const eventDate = new Date(event.date);
            const now = new Date();
            const status = eventDate < now ? "Completed" : "Upcoming";

            return (
              <div
                key={event._id}
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-xl dark:hover:shadow-black/30 transition-all duration-300 p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                      {event.category}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        status === "Upcoming"
                          ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30"
                          : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xl mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 tracking-tight">
                    {event.title}
                  </h3>

                  <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mb-6 flex items-center gap-1">
                    📅 {new Date(event.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Styled Adaptive Action Grid */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to={`/events/${event._id}`}
                      className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white font-semibold text-center py-2.5 rounded-xl transition-all text-xs active:scale-95"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/edit-event/${event._id}`}
                      className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-800 dark:hover:bg-slate-700 hover:text-white dark:hover:text-white font-semibold text-center py-2.5 rounded-xl transition-all text-xs active:scale-95"
                    >
                      Edit
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => loadEventAnalytics(event._id)}
                      className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white font-semibold py-2.5 rounded-xl transition-all text-xs active:scale-95"
                    >
                      Analytics
                    </button>
                    <button
                      onClick={async () => {
                        await loadParticipants(event._id);
                        setSelectedEvent(event._id);
                      }}
                      className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white dark:hover:text-white font-semibold py-2.5 rounded-xl transition-all text-xs active:scale-95"
                    >
                      Attendees
                    </button>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 items-center">
                    <button
                      onClick={() => exportCsv(event._id)}
                      className="col-span-2 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 hover:bg-purple-600 dark:hover:bg-purple-600 hover:text-white font-bold py-2 rounded-xl transition-all text-[11px] uppercase tracking-wider active:scale-95"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => setDeleteEventId(event._id)}
                      className="border border-red-200 dark:border-red-900/40 text-red-500 dark:text-red-400 hover:bg-red-600 dark:hover:bg-red-600 hover:text-white py-2 rounded-xl transition-all text-[11px] font-bold uppercase tracking-wider active:scale-95"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
)}

      {/* ADMIN */}
{user?.role === "admin" && (
  <div className="space-y-4">

    {/* Pending Events */}
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 transition-colors duration-300">
      <h2 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">
        Pending Events
      </h2>

      {Pending.map((e) => (
        <div
          key={e._id}
          className="flex justify-between items-center p-2 border border-slate-200 dark:border-slate-700 rounded-lg mb-2 bg-slate-50 dark:bg-slate-800/60"
        >
          <span className="text-slate-700 dark:text-slate-200">{e.title}</span>

          <div className="flex gap-2">
            <button
              onClick={() => approve(e._id)}
              className="btn"
            >
              Approve
            </button>

            <button
              onClick={() => reject(e._id)}
              className="btn-outline"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>

  </div>
)}

      {/* 🔥 PREMIUM WALLET MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-5xl mx-4 transform animate-scaleIn">
            {/* Glow border */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-60"></div>

            {/* Modal card */}
            <div className="relative bg-white dark:bg-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-white/10">
              
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Your Event Pass</h3>

                <div className="flex gap-2">
                  <button
                    disabled={!downloadAction}
                    onClick={() => downloadAction && downloadAction()}
                    className="px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                    Download
                  </button>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-2xl leading-none hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Ticket */}
<div className="p-4 bg-slate-950">
  <EventTicket
    registration={selectedTicket}
    user={user}
    onReady={setDownloadAction}
  />
</div>
            </div>
          </div>
        </div>
      )}

      {deleteEventId && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
<div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800">

      <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100">
        Delete Event
      </h2>

      <p className="mb-6 text-slate-700 dark:text-slate-300">
        Are you sure you want to delete this event?
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setDeleteEventId(null)}
          className="border px-4 py-2 rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
  try {
    await axios.delete(
      `/api/events/${deleteEventId}`
    );

    setDeleteEventId(null);

    await loadMyEvents();
    await loadAnalytics();

    showToast(
      "success",
      "Event deleted"
    );
  } catch (err) {
    console.log(err);
  }
}}
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Delete
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
}


