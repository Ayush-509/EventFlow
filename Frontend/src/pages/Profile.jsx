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
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow-lg rounded-xl p-8">

      <div className="flex flex-col items-center mb-8">

        <img
          src={
            user.profilePhoto ||
            `https://ui-avatars.com/api/?name=${user.name}`
          }
          alt=""
          className="w-32 h-32 rounded-full object-cover border"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="mt-4"
        />

      </div>

      <form
        onSubmit={handleUpdate}
        className="space-y-4"
      >
        <input
          type="text"
          name="name"
          value={user.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full border p-3 rounded"
        />

        <input
          type="email"
          value={user.email}
          disabled
          className="w-full border p-3 rounded bg-gray-100"
        />

        <input
          type="text"
          name="phone"
          value={user.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full border p-3 rounded"
        />

        <textarea
          name="bio"
          value={user.bio}
          onChange={handleChange}
          placeholder="Bio"
          className="w-full border p-3 rounded"
        />

        <textarea
          name="address"
          value={user.address}
          onChange={handleChange}
          placeholder="Address"
          className="w-full border p-3 rounded"
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-3 rounded-lg"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}