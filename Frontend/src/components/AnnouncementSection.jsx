import { useEffect, useState } from "react";
import axios from "axios";

export default function AnnouncementSection({
  eventId,
  isOrganizer,
}) {
  const [announcements, setAnnouncements] =
    useState([]);

  const [title, setTitle] = useState("");
  const [deleteId, setDeleteId] = useState(null);

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
    <div className="flex justify-between items-start">
      <h3 className="font-bold">
        📢 {a.title}
      </h3>

      {isOrganizer && (
        <button
  onClick={() => setDeleteId(a._id)}
  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
>
  Delete
</button>
      )}
    </div>

    <p className="mt-2">
      {a.message}
    </p>

    <p className="text-sm text-gray-500 mt-2">
      By {a.organizer?.name}
    </p>
  </div>
))}
{deleteId && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md shadow-2xl">

      <h2 className="text-xl font-bold mb-3 flex items-center gap-2"> 🗑️ Delete Announcement</h2>

      <p className="text-slate-600 dark:text-slate-300 mb-6">
        Are you sure you want to delete this announcement?
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setDeleteId(null)}
          className="px-4 py-2 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            try {
              await axios.delete(
                `/api/announcements/${deleteId}`
              );

              setDeleteId(null);

              fetchAnnouncements();

              showToast?.(
                "success",
                "Announcement deleted successfully"
              );
            } catch (error) {
              console.log(error);
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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