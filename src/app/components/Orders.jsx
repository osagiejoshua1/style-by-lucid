"use client";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders`, {
          credentials: "include", // if using auth
        });
        const data = await res.json();
        console.log("Fetched Orders:", data);
        setOrders(data);
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Orders</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Customer</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Address</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Ref</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t">
                <td className="p-3">{order.shippingInfo.fullName}</td>
                <td className="p-3">
                  {order.shippingInfo.phone}
                  <br />
                  {order.shippingInfo.secondaryPhone}
                </td>
                <td className="p-3">{order.shippingInfo.address}</td>
                <td className="p-3">
                  {order.items.map((item, index) => (
                    <div key={index}>
                      <strong>{item.title}</strong> x{item.quantity} <br />
                      Size: {item.size} | Color: {item.colors?.join(", ")} <br />
                      Measurement: {item.measurement} <br />
                      Price: ₦{item.price}
                      <hr />
                    </div>
                  ))}
                </td>
                <td className="p-3 font-bold">₦{order.totalAmount}</td>
                <td className="p-3">{order.paymentReference}</td>
                <td className="p-3">{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}