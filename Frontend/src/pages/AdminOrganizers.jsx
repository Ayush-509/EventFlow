import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminOrganizers() {
  const [organizers, setOrganizers] = useState([]);

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
    <div className="p-6 bg-gray-50 dark:bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Organizers Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View, monitor, and manage registered organizers.
            </p>
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-300 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
            Total Organizers: <span className="text-gray-900 dark:text-white font-bold">{organizers.length}</span>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden bg-white dark:bg-slate-900/40 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-4">Name</th>
                  <th scope="col" className="px-6 py-4">Email</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                {organizers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-gray-400 dark:text-gray-500">
                      No organizers found.
                    </td>
                  </tr>
                ) : (
                  organizers.map((organizer) => (
                    <tr key={organizer._id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Name */}
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {organizer.name}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {organizer.email}
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            organizer.isBlocked
                              ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30"
                              : "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/30"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              organizer.isBlocked ? "bg-red-500" : "bg-green-500"
                            }`}
                          />
                          {organizer.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleBlock(organizer._id)}
                          className={`inline-flex items-center justify-center rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                            organizer.isBlocked
                              ? "bg-white text-green-700 ring-1 ring-inset ring-green-300 hover:bg-green-50 focus-visible:outline-green-600 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/30 dark:hover:bg-green-500/20"
                              : "bg-red-50 text-red-600 hover:bg-red-100 focus-visible:outline-red-600 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                          }`}
                        >
                          {organizer.isBlocked ? "Unblock" : "Block"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}