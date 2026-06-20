import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminOrganizers() {
  const [organizers, setOrganizers] =
    useState([]);

  const fetchOrganizers = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "/api/admin/organizers",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setOrganizers(res.data);
  };

  const handleBlock = async (id) => {
    const token = localStorage.getItem("token");

    await axios.patch(
      `/api/admin/users/${id}/block`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchOrganizers();
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Organizers
      </h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {organizers.map((organizer) => (
              <tr key={organizer._id}>
                <td className="p-3">
                  {organizer.name}
                </td>

                <td className="p-3">
                  {organizer.email}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      organizer.isBlocked
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {organizer.isBlocked
                      ? "Blocked"
                      : "Active"}
                  </span>
                </td>

                <td className="p-3">
                  <button
                    onClick={() =>
                      handleBlock(organizer._id)
                    }
                    className={`px-4 py-2 rounded text-white ${
                      organizer.isBlocked
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {organizer.isBlocked
                      ? "Unblock"
                      : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}