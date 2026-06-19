import { useEffect, useState } from "react";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    address: "",
    profilePhoto: "",
    role: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(res.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        "http://localhost:5000/api/profile",
        {
          name: user.name,
          phone: user.phone,
          bio: user.bio,
          address: user.address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Profile Updated");
    } catch (error) {
      console.log(error);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("profilePhoto", file);

    try {
      const res = await axios.put(
        "http://localhost:5000/api/profile/photo",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser({
        ...user,
        profilePhoto: res.data.profilePhoto,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl overflow-hidden">

      {/* Header */}
      <div className="h-32 bg-slate-200 dark:bg-slate-800" />

      {/* Profile Section */}
      <div className="px-8 pb-8">
        <div className="flex flex-col items-center -mt-16">
          <img
            src={
              user.profilePhoto ||
              `https://ui-avatars.com/api/?name=${user.name}`
            }
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-lg"
          />

          <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-100">
            {user.name || "User"}
          </h2>

          <p className="text-slate-500 dark:text-slate-400">
            {user.role}
          </p>

          <label className="mt-4 cursor-pointer">
            <span className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition">
              Change Photo
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Form */}
        <form
          onSubmit={handleUpdate}
          className="mt-8 grid md:grid-cols-2 gap-5"
        >
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-3 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={user.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Role
            </label>
            <input
              type="text"
              value={user.role}
              disabled
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-3 cursor-not-allowed capitalize"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Bio
            </label>
            <textarea
              name="bio"
              value={user.bio}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Tell us something about yourself..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Address
            </label>
            <textarea
              name="address"
              value={user.address}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Enter your address"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);
}