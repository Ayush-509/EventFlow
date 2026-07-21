import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function EventGallery() {
  const { eventId } = useParams();
  const { user } = useAuth();

  const [gallery, setGallery] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef(null);

  useEffect(() => {
    if (eventId) {
      fetchGallery();
    }
  }, [eventId]);

  async function fetchGallery() {
    try {
      const res = await axios.get(`/api/gallery/${eventId}`);
      setGallery(res.data.gallery || []);
    } catch (error) {
      console.log(error);
    }
  }

  async function uploadMedia(e) {
    e.preventDefault();

    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("media", file);
      formData.append("caption", caption);

      await axios.post(`/api/gallery/${eventId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setFile(null);
      setCaption("");

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      fetchGallery();

      alert("Media uploaded successfully.");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function deleteMedia(id) {
    if (!window.confirm("Delete this media?")) return;

    try {
      await axios.delete(`/api/gallery/media/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      fetchGallery();
      alert("Media deleted successfully.");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Delete failed");
    }
  }

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">
        📸 Event Gallery
      </h2>

      {user && (
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-8 shadow transition-colors duration-300">
          <form onSubmit={uploadMedia} className="space-y-4">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />

            <textarea
              placeholder="Write a caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />

            <button
              type="submit"
              disabled={!file || uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg disabled:bg-slate-400"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>
      )}

      {gallery.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          No media uploaded yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
          {gallery.map((item) => (
            <div
              key={item._id}
              className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white/90 dark:bg-slate-900/90 shadow hover:shadow-lg transition"
            >
              {item.mediaType === "image" ? (
                <img
                  src={`/uploads/${item.mediaUrl}`}
                  alt=""
                  onClick={() => setPreview(item)}
                  className="w-full h-72 object-cover cursor-pointer hover:scale-105 transition"
                />
              ) : (
                <video controls className="w-full h-72 object-cover">
                  <source src={`/uploads/${item.mediaUrl}`} />
                </video>
              )}

              <div className="p-4">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {item.uploadedBy?.name || "Unknown User"}
                </p>

                {item.caption && (
                  <p className="text-slate-600 dark:text-slate-300 mt-2">
                    {item.caption}
                  </p>
                )}

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {new Date(item.createdAt).toLocaleString()}
                </p>

                {(user &&
                  (user.id === item.uploadedBy?._id ||
                    user.role === "admin")) && (
                  <button
                    onClick={() => deleteMedia(item._id)}
                    className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
                  >
                    🗑 Delete Media
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div
          onClick={() => setPreview(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-5"
        >
          <img
            src={`/uploads/${preview.mediaUrl}`}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-xl"
          />
        </div>
      )}
    </div>
  );
}
