import { useEffect, useState } from "react";
import axios from "axios";

export default function AnnouncementSection({
  eventId,
  isOrganizer,
}) {
  const [announcements, setAnnouncements] =
    useState([]);

  const [title, setTitle] = useState("");

  const [message, setMessage] =
    useState("");

  const token =
    localStorage.getItem("token");

  const fetchAnnouncements =
    async () => {
      const res = await axios.get(
        `/api/announcements/event/${eventId}`
      );

      setAnnouncements(res.data);
    };

  useEffect(() => {
    fetchAnnouncements();
  }, [eventId]);

  const createAnnouncement =
    async () => {
      await axios.post(
        `/api/announcements/event/${eventId}`,
        {
          title,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTitle("");
      setMessage("");

      fetchAnnouncements();
    };

  return (
    <div className="mt-10">

      <h2 className="text-2xl font-bold mb-4">
        Announcements
      </h2>

      {isOrganizer && (
        <div className="bg-white p-4 rounded-xl shadow mb-6">

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            className="w-full border p-3 mb-3 rounded"
          />

          <textarea
            placeholder="Message"
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            className="w-full border p-3 rounded"
          />

          <button
            onClick={createAnnouncement}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Post Announcement
          </button>
        </div>
      )}

      {announcements.map((a) => (
        <div
          key={a._id}
          className="bg-white p-4 rounded-xl shadow mb-3"
        >
          <h3 className="font-bold">
            📢 {a.title}
          </h3>

          <p className="mt-2">
            {a.message}
          </p>

          <p className="text-sm text-gray-500 mt-2">
            By {a.organizer?.name}
          </p>
        </div>
      ))}
    </div>
  );
}