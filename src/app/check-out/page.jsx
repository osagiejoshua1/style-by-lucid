"use client";

import React, { useState, useEffect } from "react";
import { FiEdit, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import useCartStore from "../components/store/useCartStore";
import { formatPrice } from "../utils/formatPrice";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import PaystackInlineButton from "../components/PaystackInlineButton";


const Checkout = () => {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { cartItems } = useCartStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const clearCart = useCartStore.getState().clearCart;
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    secondaryPhone: "",
  });
  const [fullScreenImage, setFullScreenImage] = useState(null);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (!user) {
      toast.error("❌ Please log in to access checkout.");
      router.push("/login");
      return;
    }

    // Wait a moment for cart to load
    const timer = setTimeout(() => {
      if (cartItems.length === 0) {
        toast.error(
          "❌ No items in cart. Please add a product before checking out."
        );
        router.push("/");
      } else {
        // Set user info
        setShippingInfo((prev) => ({
          ...prev,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
        }));

        fetchSavedAddress();
        setIsCheckingAuth(false);
      }
    }, 300); // Small delay so Zustand loads cart

    return () => clearTimeout(timer); // Cleanup timer
  }, [cartItems]);

  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const steps = ["Shipping Info", "Review Order", "Payment"];

  const saveShippingInfo = async () => {
    if (!shippingInfo.address.trim()) {
      toast.error("❌ Please enter an address for delivery.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/address`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(shippingInfo),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save address.");
      }

      console.log("✅ Address saved successfully:", data);
    } catch (error) {
      console.error("❌ Error saving address:", error);
      toast.error("❌ Failed to save address. Please try again.");
    }
  };

  // Fetch saved address when page loads
  const fetchSavedAddress = async () => {
    try {
      const response = await fetch(`${API_URL}/api/address`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data) {
        setShippingInfo((prev) => ({
          ...prev,
          address: data.address || "",
          secondaryPhone: data.secondaryPhone || "",
        }));
      }
    } catch (error) {
      console.error("❌ Error fetching saved address:", error);
    }
  };

  return (
    <>
      <div className="xl:pb-[5%] pb-[18%]">
        <Navbar />
      </div>
      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 ">
        {/* Stepper */}
        <div className="relative mb-12 ">
          <div className="flex absolute top-4 left-0 right-0 mx-auto w-full md:w-3/4 h-[2px] bg-gray-200">
            <div
              className="h-full bg-black transition-all duration-300 ease-out"
              style={{ width: `${(currentStep - 1) * 50}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center relative z-10"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold 
                  transition-all duration-300 ${
                    currentStep === index + 1
                      ? "bg-black border-2 border-black scale-110"
                      : currentStep > index + 1
                      ? "bg-green-500 border-2 border-green-500"
                      : "bg-white border-2 border-gray-300 text-gray-400"
                  }`}
                >
                  {currentStep > index + 1 ? "✓" : index + 1}
                </div>
                <p
                  className={`mt-2 text-xs font-medium md:hidden ${
                    currentStep === index + 1 ? "text-black" : "text-gray-500"
                  }`}
                >
                  {step.split(" ").pop()}
                </p>
                <p
                  className={`mt-2 text-sm font-medium hidden md:block ${
                    currentStep === index + 1 ? "text-black" : "text-gray-500"
                  }`}
                >
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Shipping Info */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {["fullName", "email", "phone"].map((field) => (
                <div key={field} className="relative">
                  <input
                    type="text"
                    name={field}
                    value={shippingInfo[field]}
                    onChange={handleInputChange}
                    placeholder={
                      field === "fullName"
                        ? "Full Name"
                        : field === "email"
                        ? "Email"
                        : "Phone"
                    }
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-black focus:ring-0 transition-all"
                    disabled
                  />
                  <FiEdit className="absolute right-3 top-3.5 text-gray-400" />
                </div>
              ))}

              <div className="md:col-span-2">
                <input
                  type="text"
                  name="secondaryPhone"
                  value={shippingInfo.secondaryPhone}
                  onChange={handleInputChange}
                  placeholder="Second Phone Number (optional)"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-black focus:ring-0 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <textarea
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  placeholder="Delivery Address"
                  rows="4"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-black focus:ring-0 transition-all hyphenate"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => {
                  if (!shippingInfo.address.trim()) {
                    toast.error("Please enter an address for delivery.");
                  } else {
                    saveShippingInfo();
                    setCurrentStep(2);
                  }
                }}
                className="mt-8 bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-all 
             font-medium text-lg shadow-md hover:shadow-lg"
              >
                Continue to Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review Order */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>

            <div className="space-y-6 mb-8">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden cursor-pointer flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onClick={() => setFullScreenImage(item.image)}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-semibold text-lg clamp-2"
                        title={item.title}
                      >
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm clamp-1">
                        {[item.color, item.size].filter(Boolean).join(" • ")}
                        {item.quantity && ` • Qty: ${item.quantity}`}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium flex-shrink-0 ml-4">
                    ₦{formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="break-words">
                  <h3 className="font-semibold mb-2">Delivery Address</h3>
                  <div className="text-gray-600 text-sm whitespace-pre-line hyphenate bg-gray-50 p-3 rounded-lg">
                    {shippingInfo.address || (
                      <span className="text-red-500 italic">
                        No address provided
                      </span>
                    )}
                  </div>
                </div>

                <div className="break-words">
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="text-gray-600 text-sm space-y-1 bg-gray-50 p-3 rounded-lg">
                    <div className="truncate" title={shippingInfo.phone}>
                      📞 {shippingInfo.phone}
                    </div>
                    {shippingInfo.secondaryPhone && (
                      <div
                        className="truncate"
                        title={shippingInfo.secondaryPhone}
                      >
                        📞 {shippingInfo.secondaryPhone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col md:flex-row justify-between gap-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 border-2 border-black rounded-lg hover:bg-gray-50 
                         font-medium transition-all text-center"
              >
                ← Back to Shipping
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 
                         transition-all font-medium text-lg shadow-md hover:shadow-lg"
              >
                Proceed to Payment →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6">Payment Details</h2>

            <div className="max-w-lg mx-auto space-y-6">
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between py-2 border-b"
                  >
                    <span className="clamp-1" title={item.title}>
                      {item.title} x {item.quantity}
                    </span>
                    <span>₦{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-4">
                  <span>Total:</span>
                  <span>
                    ₦
                    {formatPrice(
                      cartItems.reduce(
                        (acc, item) => acc + item.price * item.quantity,
                        0
                      )
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
              <PaystackInlineButton
  email={shippingInfo.email}
  amount={cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )}
  fullName={shippingInfo.fullName}
  onSuccess={(response) => {
    fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        items: cartItems,
        shippingInfo,
        totalAmount: cartItems.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        ),
        paymentReference: response.reference,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Order created successfully") {
          toast.success("✅ Order placed successfully!");

          clearCart(); // 🧹 clear the cart on success

          router.push(`/success?orderId=${data.data._id}`);
        } else {
          throw new Error(data.error || "Failed to save order");
        }
      })
      .catch((error) => {
        toast.error("❌ Order failed: " + error.message);
      });
  }}
>
  <button className="w-full p-4 flex items-center justify-between bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
    <span>Pay with Paystack</span>
    <span>→</span>
  </button>
</PaystackInlineButton>

              </div>

              <div className="text-center mt-6">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-gray-600 hover:text-black underline"
                >
                  ← Return to Order Review
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Full-screen Image Preview */}
        <AnimatePresence>
          {fullScreenImage && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[999]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                onClick={() => setFullScreenImage(null)}
                className="absolute top-6 right-6 bg-gray-200 p-2 rounded-full hover:bg-red-500 hover:text-white transition"
              >
                <FiX className="w-6 h-6" />
              </button>
              <img
                src={fullScreenImage}
                alt="Full-Screen Product"
                className="w-full h-full object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Checkout;
