import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import AnnouncementSection from "../components/AnnouncementSection";
import EventLocationMap from "../components/EventLocationMap.jsx";

export default function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });
  const [registered, setRegistered] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState("General");
  const [otherEvents, setOtherEvents] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false, type: 'info', message: '' }), 5000);
  };

  useEffect(() => {
    load();
  }, [id, user]);

  async function load() {
    try {
      const [e, r] = await Promise.all([
        axios.get(`/api/events/${id}`),
        axios.get(`/api/reviews/${id}`),
      ]);
      setEvent(e.data.event);
      const organizerId = e.data.event.organizer?._id;

if (organizerId) {
  const otherRes = await axios.get(
    `/api/events/organizer/${organizerId}/${id}`
  );

  setOtherEvents(otherRes.data.events || []);
}
      setReviews(r.data.reviews || []);

      if (user) {
        const userReview = r.data.reviews?.find(review => review.user?._id === user.id);
        setHasReviewed(!!userReview);
      }

      if (user) {
  const statusRes = await axios.get(
    `/api/registrations/${id}/status`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  setRegistered(statusRes.data.registered);
}
    } catch (err) {
      showToast('error', 'Failed to load event details.');
    }
  }

  async function registerEvent() {
  if (user?.role !== "customer") {
    showToast(
      "warning",
      "To register for events, please log in as a customer."
    );
    return;
  }

  try {
    await axios.post(
      `/api/registrations/${id}/register`,
      {
        ticketType: selectedTicketType,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setRegistered(true);

    showToast(
      "success",
      "Successfully registered!"
    );
  } catch (error) {
    showToast(
      "error",
      error.response?.data?.message ||
      "Registration failed"
    );
  }
}
const handlePayment = async () => {
  try {
    const amount =
      event.ticketPrices[selectedTicketType];

    const { data } = await axios.post(
      "/api/payments/create-order",
      { amount },
      
    );

    const options = {
  key: import.meta.env.VITE_RAZORPAY_KEY,

  amount: data.order.amount,

  currency: "INR",

  name: "EventFlow",

  description: `${selectedTicketType} Ticket`,

  order_id: data.order.id,

  handler: async function () {
    await registerEvent();

    setRegistered(true);

    setShowTicketModal(false);

    showToast(
      "success",
      "Payment successful & registration completed!"
    );
  },
};

    const razorpay =
      new window.Razorpay(options);

    razorpay.open();

  } catch (error) {
    console.log(error);
  }
};

function getDirections() {
  if (!event?.latitude || !event?.longitude) return;

  const url = `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`;

  window.open(url, "_blank");
}

  function shareEvent() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: event.title, text: event.description, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast('info', 'Event link copied!');
    }
  }

  

  async function submitReview() {
    if (!comment.trim()) return;
    try {
      await axios.post(`/api/reviews/${id}`, { rating, comment });
      showToast('success', 'Review posted successfully!');
      setComment('');
      await load();
    } catch (error) {
      if (error.response?.status === 401) {
        showToast('warning', 'Please log in to post a review.');
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('reviewed')) {
        showToast('info', 'You have already reviewed this event.');
      } else {
        showToast('error', `Failed to post review: ${error.response?.data?.message || 'Please try again.'}`);
      }
    }
  }

  const totalTickets =
  event?.ticketLimits?.[selectedTicketType] || 0;

const soldTickets =
  event?.ticketsSold?.[selectedTicketType] || 0;

const remainingTickets =
  totalTickets - soldTickets;

const ticketPrice =
  event?.ticketPrices?.[selectedTicketType] || 0;

const soldOut =
  totalTickets > 0 &&
  remainingTickets <= 0;
  if (!event) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Loading event details...</div>;

  

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast.open && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${
            toast.type === 'success'
              ? 'bg-green-600'
              : toast.type === 'warning'
              ? 'bg-yellow-600'
              : toast.type === 'error'
              ? 'bg-red-600'
              : 'bg-blue-600'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold capitalize">{toast.type}</span>
            <span className="opacity-90">{toast.message}</span>
            <button
              className="ml-4 opacity-80 hover:opacity-100"
              onClick={() => setToast({ ...toast, open: false })}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <img
          src={event.posterUrl || '/placeholder.svg'}
          alt="Event Poster"
          className="w-full h-64 object-cover rounded-xl shadow-md"
        />
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{event.title}</h1>
          <p className="text-slate-700 dark:text-slate-300">{event.description}</p>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {new Date(event.date).toLocaleString()} • {event.location}
          </div>
          <div className="mt-4 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">

  {/* Toggle Button */}
  <button
    onClick={() => setShowMap(!showMap)}
    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
  >
    <span className="font-semibold text-slate-700 dark:text-slate-200">
      📍 Location Map
    </span>

    <span className="text-slate-500">
      {showMap ? "▲" : "▼"}
    </span>
  </button>

  {/* Collapsible Map */}
  <div
    className={`transition-all duration-500 ease-in-out overflow-hidden ${
      showMap ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
    }`}
  >
    <div className="p-3 bg-white dark:bg-slate-900">
      <div className="space-y-3">

  {/* Map */}
  <EventLocationMap
    latitude={event.latitude}
    longitude={event.longitude}
  />

  {/* Directions Button */}
  <button
    onClick={getDirections}
    className="w-full mt-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
  >
    📍 Get Directions
  </button>

</div>
    </div>
  </div>

</div>
          <div className="text-amber-500 font-medium">
         ⭐ {event.averageRating?.toFixed?.(1) || "0.0"} / 5
          </div>

          <div className="text-sm text-slate-600 dark:text-slate-300">
            {reviews.length} Review{reviews.length !== 1 ? "s" : ""}
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
          <button
  disabled={registered || user?.role !== "customer"}
  onClick={() => {
    if (user?.role !== "customer") {
      showToast(
        "warning",
        "To register for events, please log in as a customer."
      );
      return;
    }

    setShowTicketModal(true);
  }}
  className={`px-4 py-2 rounded-lg text-white ${
    registered
      ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
  }`}
>
  {registered
    ? "Registered"
    : user?.role !== "customer"
    ? "Customers Only"
    : "Register"}
</button>
            <button className="btn-outline" onClick={shareEvent}>
              Share
            </button>
            <button className="btn-outline">
              Yha koi naya feature add kro
            </button>
          </div>
        </div>
      </div>
      <AnnouncementSection
  eventId={event._id}
  isOrganizer={
    user?.id === event.organizer?._id
  }
/>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <h2 className="font-semibold mb-3 text-lg text-slate-800 dark:text-slate-100">Reviews</h2>

        {user?.role === "customer" && !hasReviewed && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <select
              className="input"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <input
              className="input flex-1"
              placeholder="Share your experience"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="btn" onClick={submitReview} disabled={!comment.trim()}>
              Post
            </button>
          </div>
        )}

        {user && hasReviewed && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-3">
            <p className="text-green-800 dark:text-green-200 text-sm">
              ✅ You have already reviewed this event.
            </p>
          </div>
        )}

        <ul className="space-y-3">
          {reviews.map((r) => (
            <li
              key={r._id}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
            >
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-1">
                <span>{r.user?.name}</span>
                <span>{new Date(r.createdAt).toLocaleString()}</span>
              </div>
              <div className="font-medium text-amber-500">⭐ {r.rating}</div>
              <p className="text-slate-700 dark:text-slate-200 mt-1">{r.comment}</p>
            </li>
          ))}
        </ul>
      </div>

      {otherEvents.length > 0 && (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
    <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">
      Our Other Events
    </h2>

    <div className="flex gap-4 overflow-x-auto pb-2">
      {otherEvents.map((ev) => (
        <div
  key={ev._id}
  onClick={() => navigate(`/events/${ev._id}`)}
  className="group min-w-[280px] cursor-pointer rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
>
  <div className="relative">
    <img
      src={ev.posterUrl || "/placeholder.svg"}
      alt={ev.title}
      className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "/placeholder.svg";
      }}
      loading="lazy"
    />

    <div className="absolute top-3 left-3 flex items-center gap-2">
      <span className="text-xs px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-700">
        {ev.category}
      </span>
    </div>
  </div>

  <div className="p-4">
    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-purple-300 transition-colors">
      {ev.title}
    </h3>

    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
      {ev.description}
    </p>

    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
      {new Date(ev.date).toLocaleString()} • {ev.location}
    </div>

    <div className="mt-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
      ₹ {ev.ticketPrices?.General || 0}
    </div>

    <div className="mt-2 text-amber-500 text-sm font-medium">
      ⭐ {ev.averageRating?.toFixed?.(1) || "0.0"} / 5
    </div>
  </div>
</div>
      ))}
    </div>
  </div>
)}

      {showTicketModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-[400px]">

      <h2 className="text-xl font-bold mb-4">
        Select Ticket Type
      </h2>

      <select
  value={selectedTicketType}
  onChange={(e) =>
    setSelectedTicketType(e.target.value)
  }
  className="w-full border rounded-lg p-3 mb-4"
>
  <option value="General">
    General
  </option>

  <option value="VIP">
    VIP
  </option>

  <option value="Premium">
    Premium
  </option>

  <option value="Student">
    Student
  </option>
</select>

<div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2">

  <p className="text-lg font-semibold text-green-600">
    Price: ₹{ticketPrice}
  </p>

  {soldOut ? (
    <p className="font-semibold text-red-600">
      Sold Out
    </p>
  ) : (
    <p className="font-medium text-blue-600">
      Available: {remainingTickets} / {totalTickets}
    </p>
  )}

</div>

      <div className="flex gap-3">
        <button
          onClick={() => setShowTicketModal(false)}
          className="flex-1 border rounded-lg p-2"
        >
          Cancel
        </button>

        <button
  onClick={handlePayment}
  disabled={soldOut}
  className={`flex-1 rounded-lg p-2 text-white ${
    soldOut
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-indigo-600 hover:bg-indigo-700"
  }`}
>
  {soldOut
    ? "Sold Out"
    : "Pay & Register"}
</button>
      </div>

    </div>
  </div>
)}
    </div>

    
  );
}
