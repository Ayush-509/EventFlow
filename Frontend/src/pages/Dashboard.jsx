import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import EventTicket from '../components/EventTicket.jsx';
import { Link } from "react-router-dom";


export default function Dashboard() {
  const { user, logout } = useAuth();
  const [mine, setMine] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Tech');
  const [description, setDescription] = useState('');
  const [poster, setPoster] = useState(null);
  const [Pending, setPending] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [downloadAction, setDownloadAction] = useState(null);
  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });
  const [generalPrice, setGeneralPrice] = useState("");
  const [vipPrice, setVipPrice] = useState("");
  const [premiumPrice, setPremiumPrice] = useState("");
  const [studentPrice, setStudentPrice] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [myEvents, setMyEvents] = useState([]);
  const [deleteEventId, setDeleteEventId] = useState(null);

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false, type: 'info', message: '' }), 3000);
  };

  useEffect(() => {
    if (!user) return;
    if (user.role === 'customer') loadMyRegs();
    if (user.role === 'organizer') loadMyEvents();
    if (user.role === 'admin') loadPending();
    if (user?.role === "organizer") loadMyEvents();
  }, [user]);

  async function loadMyRegs() {
    const res = await axios.get('/api/registrations/my');
    setMine(res.data.registrations || []);
  }

  async function loadMyEvents() {
    const res = await axios.get('/api/events', { params: { organizer: user.id } });
    setMine(res.data.events || []);
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

  async function createEvent(e) {
  e.preventDefault();

  if (isPublishing) return;

  try {
    setIsPublishing(true);

    const fd = new FormData();

    fd.append('title', title);
    fd.append('date', date);
    fd.append('location', location);
    fd.append('price', price);
    fd.append('category', category);
    fd.append('description', description);

    fd.append("generalPrice", generalPrice);
    fd.append("vipPrice", vipPrice);
    fd.append("premiumPrice", premiumPrice);
    fd.append("studentPrice", studentPrice);

    if (poster) fd.append('poster', poster);

    await axios.post('/api/events', fd);

    setTitle('');
    setDate('');
    setLocation('');
    setPrice('');
    setDescription('');
    setPoster(null);

    setGeneralPrice("");
    setVipPrice("");
    setPremiumPrice("");
    setStudentPrice("");

    await loadMyEvents();

    showToast(
      'success',
      'Event created successfully'
    );

  } catch (error) {
    console.log(error);

    showToast(
      'error',
      'Failed to create event'
    );
  } finally {
    setIsPublishing(false);
  }
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
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
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

    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg">
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


      {/* ORGANIZER (unchanged logic, slightly polished container) */}
      {user?.role === 'organizer' && (
        <div className="grid md:grid-cols-2 gap-5">
          {/* form unchanged for brevity (same as yours) */}
          <form onSubmit={createEvent} className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
            <h2 className="font-semibold mb-3">Create Event</h2>
            <input className="input w-full mb-2" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
            <input className="input w-full mb-2" type="datetime-local" value={date} onChange={(e)=>setDate(e.target.value)} />
            <input className="input w-full mb-2" placeholder="Location" value={location} onChange={(e)=>setLocation(e.target.value)} />
            <input
  className="input w-full mb-2"
  type="number"
  min="0"
  placeholder="General Ticket Price (₹)"
  value={generalPrice}
  onChange={(e) => setGeneralPrice(e.target.value)}
/>

<input
  className="input w-full mb-2"
  type="number"
  min="0"
  placeholder="VIP Ticket Price (₹)"
  value={vipPrice}
  onChange={(e) => setVipPrice(e.target.value)}
/>

<input
  className="input w-full mb-2"
  type="number"
  min="0"
  placeholder="Premium Ticket Price (₹)"
  value={premiumPrice}
  onChange={(e) => setPremiumPrice(e.target.value)}
/>

<input
  className="input w-full mb-2"
  type="number"
  min="0"
  placeholder="Student Ticket Price (₹)"
  value={studentPrice}
  onChange={(e) => setStudentPrice(e.target.value)}
/>

            <select className="input w-full mb-2" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Tech</option>
              <option>Startup</option>
              <option>Entertainment</option>
              <option>Hackathon</option>
              <option>Music</option>
              <option>Sports</option>
              <option>Education</option>
              <option>Business</option>
              <option>Workshop</option>
              <option>Cultural</option>
              <option>Gaming</option>
            </select>
            
            <textarea className="input w-full mb-2" value={description} onChange={(e)=>setDescription(e.target.value)} />
            <input type="file" onChange={(e)=>setPoster(e.target.files[0])} className="mb-3" />
            <button
             type="submit"
             disabled={isPublishing}
             className={`w-full py-3 rounded-xl font-medium transition ${ isPublishing ? "bg-gray-400 cursor-not-allowed text-white" : "bg-blue-600 hover:bg-blue-700 text-white" }`}>
             {isPublishing ? "Publishing..." : "Publish"}
            </button>
          </form>
        </div>
      )}
      {user?.role === "organizer" && (
  <div className="card mb-8">
    <h2 className="text-2xl font-bold mb-4">
      My Events
    </h2>

    {myEvents.length === 0 ? (
      <p>No events created yet.</p>
    ) : (
      <div className="space-y-4">
        {myEvents.map((event) => (
          <div
            key={event._id}
            className="flex justify-between items-center border rounded-xl p-4"
          >
            <div>
              <h3 className="font-semibold text-lg">
                {event.title}
              </h3>

              <p className="text-sm text-gray-500">
                {new Date(
                  event.date
                ).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-2">
  <Link
    to={`/events/${event._id}`}
    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
  >
    View Details
  </Link>

  <Link
  to={`/edit-event/${event._id}`}
  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
>
  ✏️ Edit Event
</Link>

  <button
    onClick={() => setDeleteEventId(event._id)}
    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
  >
    Delete
  </button>
</div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

      {/* ADMIN */}
      {/* ADMIN */}
{user?.role === "admin" && (
  <div className="space-y-4">

    {/* Admin Navigation */}
    <div className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
      <h2 className="font-semibold mb-3">Admin Management</h2>

      <div className="flex gap-3">
        <Link
          to="/admin/customers"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white"
        >
          Customers
        </Link>

        <Link
          to="/admin/organizers"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white"
        >
          Organizers
        </Link>
      </div>
    </div>

    {/* Pending Events */}
    <div className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
      <h2 className="font-semibold mb-3">
        Pending Events
      </h2>

      {Pending.map((e) => (
        <div
          key={e._id}
          className="flex justify-between items-center p-2 border rounded-lg mb-2"
        >
          <span>{e.title}</span>

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
              <div className="flex justify-between items-center p-4 border-b dark:border-slate-800">
                <h3 className="font-semibold text-lg">Your Event Pass</h3>

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
    <div className="bg-white rounded-xl p-6 w-full max-w-md">

      <h2 className="text-xl font-bold mb-3">
        Delete Event
      </h2>

      <p className="mb-6">
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

              loadMyEvents();

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
