import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function EventGallery() {
  const { eventId } = useParams();

  const [gallery, setGallery] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, [eventId]);

  async function fetchGallery() {
    try {
      const res = await axios.get(
        `/api/gallery/${eventId}`
      );

      setGallery(res.data.gallery || []);
    } catch (error) {
      console.log(error);
    }
  }

  async function uploadMedia(e) {
    e.preventDefault();

    if (!file) return;

    const formData = new FormData();
    formData.append("media", file);

    try {
      setUploading(true);

      await axios.post(
        `/api/gallery/${eventId}`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setFile(null);

      fetchGallery();

      alert(
        "Media uploaded successfully!"
      );
    } catch (error) {
      console.log(error);

      alert(
        error?.response?.data?.message ||
          "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            📸 Event Gallery
          </h1>

          <p className="text-slate-500 mt-1">
            Share memories from this event
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-8 shadow-sm">

        <form
          onSubmit={uploadMedia}
          className="flex flex-col md:flex-row gap-4"
        >
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) =>
              setFile(e.target.files[0])
            }
            className="flex-1 border rounded-lg p-3"
          />

          <button
            type="submit"
            disabled={!file || uploading}
            className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:bg-gray-400"
          >
            {uploading
              ? "Uploading..."
              : "Upload"}
          </button>
        </form>

      </div>

      {gallery.length === 0 ? (
        <div className="text-center py-20">

          <div className="text-6xl mb-3">
            📷
          </div>

          <h3 className="text-xl font-semibold">
            No media uploaded yet
          </h3>

          <p className="text-slate-500 mt-2">
            Be the first to share a memory.
          </p>

        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {gallery.map((item) => (
            <div
              key={item._id}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition"
            >

              {item.mediaType ===
              "image" ? (
                <img
                  src={`/uploads/${item.mediaUrl}`}
                  alt=""
                  onClick={() =>
                    setPreview(item)
                  }
                  className="w-full h-72 object-cover cursor-pointer group-hover:scale-105 transition duration-500"
                />
              ) : (
                <video
                  controls
                  className="w-full h-72"
                >
                  <source
                    src={`/uploads/${item.mediaUrl}`}
                  />
                </video>
              )}

              <div className="p-4">
                <p className="text-sm text-slate-500">
                  Uploaded by
                </p>

                <p className="font-medium text-slate-800 dark:text-slate-100">
                  {item.uploadedBy?.name ||
                    "Anonymous"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
  {new Date(
    item.createdAt
  ).toLocaleString()}
</p>
              </div>

            </div>
          ))}

        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() =>
            setPreview(null)
          }
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
