import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });
  const [registered, setRegistered] = useState(false);

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
  try {
    await axios.post(
      `/api/registrations/${id}/register`,
      {},
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

  function shareEvent() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: event.title, text: event.description, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast('info', 'Event link copied!');
    }
  }

  function downloadIcs() {
    const start = new Date(event.date);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CampusEvents//EN
BEGIN:VEVENT
UID:${event._id}@campus
DTSTAMP:${start.toISOString().replace(/[-:]/g,'').split('.')[0]}Z
DTSTART:${start.toISOString().replace(/[-:]/g,'').split('.')[0]}Z
DTEND:${end.toISOString().replace(/[-:]/g,'').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title}.ics`;
    a.click();
    URL.revokeObjectURL(url);
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
          <div className="text-amber-500 font-medium">
         ⭐ {event.averageRating?.toFixed?.(1) || "0.0"} / 5
          </div>

          <div className="text-sm text-slate-600 dark:text-slate-300">
            {reviews.length} Review{reviews.length !== 1 ? "s" : ""}
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            <button
              onClick={registerEvent}
              disabled={registered}
              className={`px-4 py-2 rounded ${registered ? "bg-green-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600" } text-white`}>
              {registered ? "Registered" : "Register"}
            </button>
            <button className="btn-outline" onClick={shareEvent}>
              Share
            </button>
            <button className="btn-outline" onClick={downloadIcs}>
              Add to Calendar
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <h2 className="font-semibold mb-3 text-lg text-slate-800 dark:text-slate-100">Reviews</h2>

        {user && !hasReviewed && (
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
    </div>
  );
}
