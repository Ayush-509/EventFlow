import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "/api/admin/customers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCustomers(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (id) => {
    try {
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

      fetchCustomers();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (loading)
    return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Customers
      </h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">
                Name
              </th>
              <th className="p-3 text-left">
                Email
              </th>
              <th className="p-3 text-left">
                Status
              </th>
              <th className="p-3 text-left">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer._id}
                className="border-t"
              >
                <td className="p-3">
                  {customer.name}
                </td>

                <td className="p-3">
                  {customer.email}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      customer.isBlocked
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {customer.isBlocked
                      ? "Blocked"
                      : "Active"}
                  </span>
                </td>

                <td className="p-3">
                  <button
                    onClick={() =>
                      handleBlock(customer._id)
                    }
                    className={`px-4 py-2 rounded text-white ${
                      customer.isBlocked
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {customer.isBlocked
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