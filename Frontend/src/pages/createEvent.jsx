import React, { useState } from "react";
import axios from "axios";
import EventLocationPicker from "../components/EventLocationPicker";

const CreateEvent = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [generalPrice, setGeneralPrice] = useState("");
  const [vipPrice, setVipPrice] = useState("");
  const [premiumPrice, setPremiumPrice] = useState("");
  const [studentPrice, setStudentPrice] = useState("");
  const [category, setCategory] = useState("Tech");
  const [description, setDescription] = useState("");
  const [poster, setPoster] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPublishing(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("date", date);
      formData.append("location", location);
      if (latitude !== null) formData.append("latitude", latitude);
      if (longitude !== null) formData.append("longitude", longitude);
      formData.append("generalPrice", generalPrice);
      formData.append("vipPrice", vipPrice);
      formData.append("premiumPrice", premiumPrice);
      formData.append("studentPrice", studentPrice);
      formData.append("category", category);
      formData.append("description", description);
      if (poster) formData.append("poster", poster);

      await axios.post("/api/events", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // simple success UX
      alert("Event created successfully");
      // reset form
      setTitle("");
      setDate("");
      setLocation("");
      setLatitude(null);
      setLongitude(null);
      setGeneralPrice("");
      setVipPrice("");
      setPremiumPrice("");
      setStudentPrice("");
      setCategory("Tech");
      setDescription("");
      setPoster(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create event");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
  <div className="max-w-5xl mx-auto px-4 py-8">
    <div className="bg-white/90 dark:bg-slate-900/90 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
        <h2 className="text-2xl font-bold text-white">Create Event</h2>
        <p className="text-blue-100 mt-1">
          Fill in the details and publish your event.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">

        {/* Basic Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Basic Information</h3>

          <div className="space-y-4">
            <input
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Event Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              type="datetime-local"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <input
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Location Picker */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">📍 Event Location</h3>

          <EventLocationPicker
            onLocationSelect={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
          />

          {latitude !== null && longitude !== null && (
            <div className="mt-3 inline-flex items-center rounded-lg bg-green-100 text-green-700 px-3 py-2 text-sm font-medium">
              Selected: {Number(latitude).toFixed(6)},{" "}
              {Number(longitude).toFixed(6)}
            </div>
          )}
        </div>

        {/* Ticket Pricing */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Ticket Pricing</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="number"
              min="0"
              placeholder="General Ticket Price (₹)"
              value={generalPrice}
              onChange={(e) => setGeneralPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />

            <input
              type="number"
              min="0"
              placeholder="VIP Ticket Price (₹)"
              value={vipPrice}
              onChange={(e) => setVipPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />

            <input
              type="number"
              min="0"
              placeholder="Premium Ticket Price (₹)"
              value={premiumPrice}
              onChange={(e) => setPremiumPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />

            <input
              type="number"
              min="0"
              placeholder="Student Ticket Price (₹)"
              value={studentPrice}
              onChange={(e) => setStudentPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Category</h3>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
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
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Description</h3>

          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a detailed description about your event..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 resize-none"
          />
        </div>

        {/* Poster Upload */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Event Poster</h3>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center">
            <input
              type="file"
              onChange={(e) => setPoster(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-700 dark:text-slate-200"
            />

            {poster && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                Selected: {poster.name}
              </p>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPublishing}
          className={`w-full py-4 rounded-2xl font-semibold text-white transition-all duration-300 ${
            isPublishing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.01] hover:shadow-lg"
          }`}
        >
          {isPublishing ? "Publishing Event..." : "🚀 Publish Event"}
        </button>
      </form>
    </div>
  </div>
);
};

export default CreateEvent;