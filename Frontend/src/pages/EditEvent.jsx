import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(null);
const [longitude, setLongitude] = useState(null);
  const [date, setDate] = useState("");

  const [generalPrice, setGeneralPrice] = useState("");
  const [vipPrice, setVipPrice] = useState("");
  const [premiumPrice, setPremiumPrice] = useState("");
  const [studentPrice, setStudentPrice] = useState("");

  const [generalLimit, setGeneralLimit] = useState(0);
  const [vipLimit, setVipLimit] = useState(0);
  const [premiumLimit, setPremiumLimit] = useState(0);
  const [studentLimit, setStudentLimit] = useState(0);

  const [poster, setPoster] = useState(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState({open: false, type: "info", message: "",});


  useEffect(() => {
    loadEvent();
  }, []);

  async function loadEvent() {
    try {
      const { data } = await axios.get(`/api/events/${id}`);

      const e = data.event;

      setEvent(e);

      setTitle(e.title || "");
      setDescription(e.description || "");
      setCategory(e.category || "");
      setLocation(e.location || "");

      setGeneralLimit(e.ticketLimits?.General || 0);
      setVipLimit(e.ticketLimits?.VIP || 0);
      setPremiumLimit(e.ticketLimits?.Premium || 0);
      setStudentLimit(e.ticketLimits?.Student || 0);

      setDate(
        e.date
          ? new Date(e.date)
              .toISOString()
              .slice(0, 16)
          : ""
      );

      setGeneralPrice(
        e.ticketPrices?.General || ""
      );

      setVipPrice(
        e.ticketPrices?.VIP || ""
      );

      setPremiumPrice(
        e.ticketPrices?.Premium || ""
      );

      setStudentPrice(
        e.ticketPrices?.Student || ""
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function updateEvent(e) {
    e.preventDefault();

    if (updating) return;

    try {
      setUpdating(true);

      const fd = new FormData();

      fd.append("title", title);
      fd.append("description", description);
      fd.append("category", category);
      fd.append("location", location);
      fd.append("date", date);

      fd.append("generalPrice", generalPrice);
      fd.append("vipPrice", vipPrice);
      fd.append("premiumPrice", premiumPrice);
      fd.append("studentPrice", studentPrice);

      fd.append("generalLimit", generalLimit);
      fd.append("vipLimit", vipLimit);
      fd.append("premiumLimit", premiumLimit);
      fd.append("studentLimit", studentLimit);

      if (poster) {
        fd.append("poster", poster);
      }

      await axios.put(
  `/api/events/${id}`,
  fd
);

showToast(
  "success",
  "Event updated successfully"
);

setTimeout(() => {
  navigate(`/events/${id}`);
}, 1500);

return;

    } catch (error) {
      console.log(error);
      showToast(
  "error",
  "Failed to update event"
);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        Loading event...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        ✏️ Edit Event
      </h1>

      {/* Event Info */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-6 mb-8">

        <h2 className="text-xl font-bold">
          Currently Editing
        </h2>

        <p className="text-blue-600 font-semibold text-lg mt-2">
          {event?.title}
        </p>

        <p className="text-sm text-gray-500 mt-1">
          Event ID: {event?._id}
        </p>

        <p className="text-sm text-gray-500">
          Date:
          {" "}
          {event?.date
            ? new Date(
                event.date
              ).toLocaleString()
            : "N/A"}
        </p>

        <div className="mt-3">
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              event?.status === "Approved"
                ? "bg-green-100 text-green-700"
                : event?.status === "Rejected"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {event?.status}
          </span>
        </div>

        {event?.posterUrl && (
          <img
            src={event.posterUrl}
            alt={event.title}
            className="w-full max-h-72 object-cover rounded-xl mt-4"
          />
        )}
      </div>

      <form
        onSubmit={updateEvent}
        className="bg-white dark:bg-slate-900 rounded-xl shadow p-6 space-y-5"
      >

        <div>
          <label className="block mb-2 font-medium">
            Event Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            className="input w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Category
          </label>

          <input
            type="text"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="input w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Location
          </label>

          <input
            type="text"
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
            className="input w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Date & Time
          </label>

          <input
            type="datetime-local"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            className="input w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Description
          </label>

          <textarea
            rows="5"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            className="input w-full"
            required
          />
        </div>

        <div>
  <h3 className="font-semibold text-lg mb-4">
    🎟 Ticket Prices
  </h3>

  <div className="space-y-4">

    <div>
      <label className="block font-medium mb-1">
        🎫 General Ticket Price
      </label>

      <input
        type="number"
        value={generalPrice}
        onChange={(e) => setGeneralPrice(e.target.value)}
        className="input w-full"
      />
    </div>

    <div>
      <label className="block font-medium mb-1">
        ⭐ VIP Ticket Price
      </label>

      <input
        type="number"
        value={vipPrice}
        onChange={(e) => setVipPrice(e.target.value)}
        className="input w-full"
      />
    </div>

    <div>
      <label className="block font-medium mb-1">
        👑 Premium Ticket Price
      </label>

      <input
        type="number"
        value={premiumPrice}
        onChange={(e) => setPremiumPrice(e.target.value)}
        className="input w-full"
      />
    </div>

    <div>
      <label className="block font-medium mb-1">
        🎓 Student Ticket Price
      </label>

      <input
        type="number"
        value={studentPrice}
        onChange={(e) => setStudentPrice(e.target.value)}
        className="input w-full"
      />
    </div>

  </div>
</div>
<div>
  <h3 className="font-semibold text-lg mb-4">
    🎟 Ticket Availability
  </h3>

  <div className="space-y-4">

    <div>
      <label className="block font-medium mb-1">
        🎫 General Tickets Available
      </label>

      <input
        type="number"
        value={generalLimit}
        onChange={(e) =>
          setGeneralLimit(e.target.value)
        }
        className="input w-full"
      />
    </div>

    <div>
      <label className="block font-medium mb-1">
        ⭐ VIP Tickets Available
      </label>

      <input
        type="number"
        value={vipLimit}
        onChange={(e) =>
          setVipLimit(e.target.value)
        }
        className="input w-full"
      />
    </div>

    <div>
      <label className="block font-medium mb-1">
        👑 Premium Tickets Available
      </label>

      <input
        type="number"
        value={premiumLimit}
        onChange={(e) =>
          setPremiumLimit(e.target.value)
        }
        className="input w-full"
      />
    </div>

    <div>
      <label className="block font-medium mb-1">
        🎓 Student Tickets Available
      </label>

      <input
        type="number"
        value={studentLimit}
        onChange={(e) =>
          setStudentLimit(e.target.value)
        }
        className="input w-full"
      />
    </div>

  </div>
</div>

        <div>
          <label className="block mb-2 font-medium">
            Change Poster
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setPoster(e.target.files[0])
            }
            className="input w-full"
          />
        </div>

        <button
          type="submit"
          disabled={updating}
          className={`w-full py-3 rounded-xl text-white font-semibold transition ${
            updating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {updating
            ? "Updating..."
            : "Save Changes"}
        </button>

      </form>
    </div>
  );
}