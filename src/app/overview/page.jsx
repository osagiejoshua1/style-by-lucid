"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { FaChartLine, FaShoppingCart, FaMoneyBill } from "react-icons/fa";
import { RiLoader5Line } from "react-icons/ri";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function OverviewPage() {
  const [stats, setStats] = useState({
    monthlySales: [],
    totalRevenue: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/overview-stats`, {
            credentials: "include", // ✅ send cookies to verify admin
          });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        console.log("API Response:", data);
        setStats(data);
      } catch (err) {
        console.error("Error fetching overview stats:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);

  const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const chartData = stats.monthlySales?.length > 0 
    ? stats.monthlySales.map((item) => ({
        month: monthLabels[item._id - 1], // Convert 1-12 to 0-11 index
        revenue: item.totalSales || 0,
      }))
    : Array.from({ length: 12 }, (_, i) => ({
        month: monthLabels[i],
        revenue: 0,
      }));

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📊 Monthly Overview</h2>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md">
          <p className="text-red-700 font-medium">Error: {error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-600 text-lg">
          <RiLoader5Line className="animate-spin mr-2" /> Loading stats...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              icon={<FaMoneyBill className="text-3xl text-green-600" />}
            />
            <StatCard
              title="Total Orders"
              value={stats.totalOrders.toLocaleString()}
              icon={<FaShoppingCart className="text-3xl text-blue-600" />}
            />
            <StatCard
              title="Monthly Growth"
              value={stats.monthlySales?.length > 0 ? "+ Growing" : "N/A"}
              icon={<FaChartLine className="text-3xl text-purple-600" />}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Revenue by Month 
              {stats.monthlySales?.length === 0 && " - No data available"}
            </h3>
            
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#4b5563' }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `₦${value.toLocaleString()}`}
                    tick={{ fill: '#4b5563' }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    itemStyle={{ color: '#1f2937' }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-semibold text-gray-800">{value}</h3>
      </div>
      <div className="p-3 bg-gray-100 rounded-full shadow-inner">{icon}</div>
    </div>
  );
}