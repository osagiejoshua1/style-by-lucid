"use client";
import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Analytics() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/user-order-stats`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch user stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("❌ Error fetching analytics:", err);
        toast.error("Error loading analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleDownload = () => {
    const csvRows = [
      ["Full Name", "Email", "Phone", "Total Orders", "Total Spent", "Last Order Date"],
      ...stats.map((u) => [
        u.fullName,
        u.email,
        u.phone,
        u.totalOrders,
        u.totalSpent,
        u.lastOrderDate ? new Date(u.lastOrderDate).toLocaleString() : "N/A",
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "user_order_stats.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" />
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          User Purchase Analytics
        </h2>
        <button
          onClick={handleDownload}
          className="bg-gradient-to-r from-gray-800 to-gray-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity text-sm font-semibold"
        >
          <FaDownload className="w-4 h-4" />
          Download CSV
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading user stats...</p>
      ) : stats.length === 0 ? (
        <p className="text-gray-500">No user data available yet.</p>
      ) : (
        <div className="border border-gray-200 rounded-xl shadow-sm">
        <div className="max-w-full overflow-x-auto bg-white px-4 pb-2">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">Full Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">Phone</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">Orders</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">Total Spent</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-900 whitespace-nowrap">{user.fullName}</td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{user.email}</td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{user.phone}</td>
                  <td className="text-center py-3 px-4 text-gray-900">{user.totalOrders}</td>
                  <td className="text-center py-3 px-4 text-gray-900 font-medium">
                    {formatCurrency(user.totalSpent)}
                  </td>
                  <td className="text-center py-3 px-4 text-gray-600 whitespace-nowrap">
                    {user.lastOrderDate
                      ? new Date(user.lastOrderDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      )}
    </div>
  );
}