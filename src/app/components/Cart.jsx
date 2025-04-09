"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import useCartStore from "../components/store/useCartStore";
import { formatPrice } from "../utils/formatPrice";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Cart({ closeCart }) {
  const { cartItems, removeFromCart, clearCart, loadCart, refreshAllStocks } = useCartStore();
  const [isVisible, setIsVisible] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);


  useEffect(() => {
    const initCart = async () => {
      await loadCart(); // Now this loads both cart and all product stocks
      setTimeout(() => setIsVisible(true), 100);
    };
  
    initCart();
  }, []);
  
  
  

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleRemoveFromCart = async (cartItemId) => {
    if (!cartItemId) {
      toast.error("❌ Product ID is missing!");
      return;
    }
  
    try {
      // Directly use Zustand's removeFromCart which updates UI and backend
      await removeFromCart(cartItemId);
    } catch (error) {
      console.error("❌ Remove Error:", error);
      toast.error("Failed to remove item.");
    }
  };
  
  
  
  const handleClearCart = async () => {
    try {
      await clearCart();
      await refreshAllStocks(); // 🔁 force UI update
    } catch (error) {
      toast.error("Something went wrong while clearing cart.");
    }
  };
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => closeCart(), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-[1000rem] bg-black/50 p-4 z-50"
            onClick={handleClose}
          />

          {/* Slide-In Cart */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed right-0 top-0 h-full w-[350px] bg-white shadow-lg flex flex-col z-50"
          >
            <button onClick={handleClose} className="absolute top-3 right-3">
              <FiX className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-semibold mb-4 p-4">
              Your Cart ({cartItems.length})
            </h2>

            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <p className="text-gray-500">Your cart is empty.</p>
              ) : (
                <>
                  {cartItems.map((item, index) => (
                    <motion.div
                    key={item._id || `${item.productId}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="border-b py-3 flex items-start gap-3"
                    >
                      <div className="w-16 h-16 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-md cursor-pointer"
                          onClick={() => setFullScreenImage(item.image)}
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p>Size: {item.size || "Default Size"}</p>

                        {item.measurement && (
                          <p className="break-words text-black">
                            Measurements:{" "}
                            <span className="text-sm text-gray-500">
                              {item.size === "custom"
                                ? "Customized"
                                : item.measurement}
                            </span>
                          </p>
                        )}

                        {item.colors?.length > 0 && (
                          <p className="flex items-center gap-2">
                            Colors:
                            <div className="flex gap-1">
                              {item.colors.map((color, colorIndex) => (
                                <span
                                  key={colorIndex}
                                  className="inline-block w-6 h-6 rounded-full border border-gray-300"
                                  style={{ backgroundColor: color }}
                                ></span>
                              ))}
                            </div>
                          </p>
                        )}

                        <p>Quantity: {item.quantity}</p>
                        <p className="font-bold">₦{formatPrice(item.price)}</p>

                        <button
                          onClick={() => handleRemoveFromCart(item._id)}
                          className="text-red-500 hover:underline mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t bg-white">
              <div className="mb-4">
                <p className="text-lg font-semibold">
                  Total: ₦{formatPrice(totalAmount)}
                </p>
              </div>

              <button
                onClick={handleClearCart}
                disabled={cartItems.length === 0}
                className={`bg-red-500 text-white w-full py-2 rounded ${
                  cartItems.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-red-600"
                }`}
              >
                Clear Cart
              </button>

              {cartItems.length > 0 ? (
                <a href="/check-out">
                  <button className="mt-2 bg-black text-white w-full py-2 rounded hover:bg-gray-800">
                    Checkout
                  </button>
                </a>
              ) : (
                <button
                  disabled
                  className="mt-2 bg-gray-400 text-white w-full py-2 rounded cursor-not-allowed"
                >
                  Cart is Empty
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}

      {/* Fullscreen Image Preview */}
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
    </AnimatePresence>
  );
}
