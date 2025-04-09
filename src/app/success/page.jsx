"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useCartStore from "@/app/components/store/useCartStore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

const SuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const clearCart = useCartStore((state) => state.clearCart);

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!orderId) {
      toast.error("❌ No order ID found.");
      router.push("/");
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch order");
        }

        setOrder(data);
        clearCart();
        localStorage.setItem("refresh_accessory_stock", "true");
      } catch (err) {
        console.error("Order fetch error:", err);
        toast.error("Failed to load order summary.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router, clearCart, API_URL]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-black animate-spin" />
          <p className="text-lg font-medium text-gray-700">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="p-8 bg-white rounded-xl shadow-lg max-w-md text-center border border-gray-200">
          <div className="text-red-500 bg-red-100 p-4 rounded-full inline-block">
            <XCircle className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Failed to Load Order</h2>
          <p className="text-gray-600 mt-2">Please check your order ID or try again later.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
  <div className="max-w-3xl mx-auto">
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-black to-gray-800 px-4 sm:px-8 py-8 sm:py-12 text-center">
        <div className="inline-block bg-white/10 p-3 sm:p-4 rounded-full backdrop-blur-sm">
          <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
        </div>
        <h1 className="mt-4 sm:mt-6 text-3xl sm:text-4xl font-bold text-white">🎉 Order Confirmed!</h1>
        <p className="mt-2 text-base sm:text-lg text-gray-200">
          Thank you for shopping with <strong>Style by Lucid</strong>
        </p>
      </div>

      {/* Order Details */}
      <div className="px-4 sm:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Order Information */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase mb-3 sm:mb-4">Order Information</h3>
                <dl className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <dt className="text-gray-600 text-sm sm:text-base flex-shrink-0">Order ID</dt>
                    <dd className="font-medium text-gray-900 text-sm sm:text-base text-right truncate">{order._id}</dd>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <dt className="text-gray-600 text-sm sm:text-base">Total Amount</dt>
                    <dd className="font-semibold text-gray-900 text-sm sm:text-base">₦{order.totalAmount?.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <dt className="text-gray-600 text-sm sm:text-base">Items Ordered</dt>
                    <dd className="font-medium text-gray-900 text-sm sm:text-base">{order.items?.length}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase mb-3 sm:mb-4">Customer Details</h3>
              <dl className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center gap-4">
                  <dt className="text-gray-600 text-sm sm:text-base">Full Name</dt>
                  <dd className="font-medium text-gray-900 text-sm sm:text-base text-right">{order.shippingInfo?.fullName}</dd>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <dt className="text-gray-600 text-sm sm:text-base">Email</dt>
                  <dd className="font-medium text-gray-900 text-sm sm:text-base text-right break-words">{order.shippingInfo?.email}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 sm:pt-8">
          <p className="text-center text-gray-600 text-sm sm:text-base">
            We've sent a confirmation email to{" "}
            <span className="font-semibold text-gray-900">{order.shippingInfo?.email}</span>.
            <br className="hidden sm:block" />
            Your order will arrive in 3-5 business days.
          </p>
        </div>

        <button
          onClick={() => router.push("/")}
          className="w-full bg-black hover:bg-gray-800 text-white font-semibold text-sm sm:text-base py-2.5 sm:py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
        >
          Continue Shopping
        </button>
      </div>
    </div>

    <div className="mt-6 sm:mt-8 text-center">
      <p className="text-xs sm:text-sm text-gray-600">
        Need help?{" "}
        <a href="mailto:support@stylebylucid.com" className="text-gray-900 hover:underline font-medium">
          Contact our support
        </a>
      </p>
    </div>
  </div>
</div>
  );
};

export default SuccessPage;