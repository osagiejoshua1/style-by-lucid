"use client";
import { useEffect, useState } from "react";
import {
  FiPackage,
  FiUser,
  FiDollarSign,
  FiClock,
  FiSmartphone,
  FiMapPin,
  FiTrash2,
  FiX,
  FiAlertTriangle,
  FiCheckCircle,
  FiTruck,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ColorCircle Component
const ColorCircle = ({ color }) => {
  // Convert color names to hex values
  const getColorHex = (color) => {
    if (!color) return "#cccccc";

    const colorMap = {
      red: "#ff0000",
      blue: "#0000ff",
      green: "#008000",
      black: "#000000",
      white: "#ffffff",
      yellow: "#ffff00",
      purple: "#800080",
      pink: "#ffc0cb",
      orange: "#ffa500",
      gray: "#808080",
      grey: "#808080",
      brown: "#a52a2a",
      navy: "#000080",
      teal: "#008080",
      maroon: "#800000",
    };

    // If it's already hex or rgb, return as is
    if (color.startsWith("#") || color.startsWith("rgb")) return color;

    // Return mapped color or default if not found
    return colorMap[color.toLowerCase()] || color;
  };

  // Check if color is light (needs dark border)
  const isLightColor = (hexColor) => {
    if (!hexColor) return false;
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  };

  const displayColor = getColorHex(color);
  const needsBorder = isLightColor(displayColor);

  return (
    <div
      className="w-5 h-5 rounded-full inline-block mr-1 border"
      style={{
        backgroundColor: displayColor,
        borderColor: needsBorder ? "#e5e7eb" : "transparent",
        borderWidth: "2px",
      }}
      title={color}
    />
  );
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders`, {
          credentials: "include",
        });
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleDeleteOrder = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Order deleted successfully!");
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
        setOrderToDelete(null);
      } else {
        toast.error(data.error || "Failed to delete order");
      }
    } catch (err) {
      console.error("❌ Error deleting:", err);
      toast.error("Server error");
    }
  };

  const handleUpdateStatus = async (orderId) => {
    setUpdatingOrderId(orderId); // Show loader on this button

    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/deliver`, {
        method: "PUT",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Order status updated successfully!");
        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? data.data : order))
        );
      } else {
        toast.error(data.error || "Failed to update order status");
      }
    } catch (err) {
      console.error("❌ Error updating status:", err);
      toast.error("Server error");
    } finally {
      setUpdatingOrderId(null); // Remove loader
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg text-gray-600">
          Loading orders...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-red-50 rounded-full mb-4">
                <FiAlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Delete Order</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this order? This action cannot
                be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setOrderToDelete(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteOrder(orderToDelete)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <FiX className="w-8 h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Full screen"
            className="max-h-[90vh] w-auto mx-auto object-contain rounded-lg"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <FiPackage className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 relative"
              >
                <div className="absolute top-4 right-4 flex gap-2">
                  {/* Status Badge */}
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {order.status === "delivered" ? "Delivered" : "Pending"}
                  </div>

                  <button
                    onClick={() => setOrderToDelete(order._id)}
                    className="p-2 hover:bg-red-50 rounded-full text-red-500 hover:text-red-600 transition-colors"
                    title="Delete order"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                  <div className="flex items-center gap-3">
                    <FiUser className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-gray-800">
                        {order.shippingInfo.fullName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.shippingInfo.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiSmartphone className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-gray-800">
                        {order.shippingInfo.phone}
                      </p>
                      {order.shippingInfo.secondaryPhone && (
                        <p className="text-sm text-gray-500">
                          {order.shippingInfo.secondaryPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiDollarSign className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-800">
                        ₦{order.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.paymentReference}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiClock className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-gray-800">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex gap-3">
                      <FiMapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-gray-600">
                        {order.shippingInfo.address}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex gap-4 items-start p-3 bg-gray-50 rounded-lg"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-16 rounded-lg object-cover border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedImage(item.image)}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {item.title}
                            </p>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-500 items-center">
                              <span>x{item.quantity}</span>
                              {item.size && <span>• Size: {item.size}</span>}
                              {item.colors?.length > 0 && (
                                <span className="flex items-center">
                                  • Colors:
                                  <span className="flex ml-1 gap-1">
                                    {item.colors.map((color, i) => (
                                      <ColorCircle key={i} color={color} />
                                    ))}
                                  </span>
                                </span>
                              )}
                              {item.measurement && (
                                <span>• {item.measurement}</span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-purple-600">
                              ₦{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Update Button */}
                {order.status === "pending" && (
                  <div className="mt-6 pt-4 border-t">
                    <button
                      onClick={() => handleUpdateStatus(order._id)}
                      disabled={updatingOrderId === order._id}
                      className={`flex items-center justify-center gap-2 w-full md:w-auto px-6 py-2 rounded-lg transition-colors ${
                        updatingOrderId === order._id
                          ? "bg-purple-400 cursor-not-allowed"
                          : "bg-purple-600 hover:bg-purple-700 text-white"
                      }`}
                    >
                      {updatingOrderId === order._id ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            ></path>
                          </svg>
                          <span className="text-white">Processing...</span>
                        </>
                      ) : (
                        <>
                          <FiTruck className="w-5 h-5" />
                          <span>Mark as Delivered</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {order.status === "delivered" && (
                  <div className="mt-4 flex items-center gap-2 text-green-600">
                    <FiCheckCircle className="w-5 h-5" />
                    <span className="font-medium">
                      Customer notified via email
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
