"use client";

import { useState } from "react";
import { FaEnvelope, FaKey, FaLock } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Send OTP Request
  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      console.log("📩 OTP Response:", data);

      if (!response.ok) throw new Error(data.error);

      toast.success("✅ OTP sent to your email!");
      setStep(2);
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  // ✅ Verify OTP
  const handleVerifyOtp = async () => {
    if (formData.otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });

      const data = await response.json();
      console.log("✅ OTP Verification Response:", data);

      if (!response.ok) throw new Error(data.error);

      toast.success("✅ OTP verified successfully!");
      setStep(3);
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  // ✅ Reset Password
  const handleResetPassword = async () => {
    if (!formData.newPassword || formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, newPassword: formData.newPassword }),
      });

      const data = await response.json();
      console.log("🔑 Password Reset Response:", data);

      if (!response.ok) throw new Error(data.error);

      toast.success("✅ Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <h2 className="text-2xl font-semibold text-center mb-4">Forgot Password</h2>

        <motion.div
          key={step}
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ type: "tween", duration: 0.5 }}
        >
          {step === 1 && (
            <div>
              <p className="text-center mb-3">Enter your email to receive an OTP</p>
              <div className="relative flex items-center">
                <FaEnvelope className="absolute left-3 text-black" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <button
                onClick={handleSendOtp}
                className="w-full bg-black text-white py-2 mt-4 rounded-md hover:bg-gray-500 transition"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-center mb-3">Enter the 6-digit OTP sent to your email</p>
              <div className="relative flex items-center">
                <FaKey className="absolute left-3 text-black" />
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  maxLength="6"
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full px-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <button
                onClick={handleVerifyOtp}
                className="w-full bg-black text-white py-2 mt-4 rounded-md hover:bg-gray-500 transition"
                disabled={loading}
              >
                {loading ? "Verifying OTP..." : "Verify OTP"}
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-center mb-3">Enter a new password</p>
              <div className="relative flex items-center">
                <FaLock className="absolute left-3 text-black" />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div className="relative flex items-center mt-3">
                <FaLock className="absolute left-3 text-black" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <button
                onClick={handleResetPassword}
                className="w-full bg-black text-white py-2 mt-4 rounded-md hover:bg-gray-500 transition"
                disabled={loading}
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="text-center">
              <h3 className="text-xl font-semibold">✅ Password Reset Successful</h3>
              <p className="mt-2">You can now log in with your new password.</p>
              <a
                href="/login"
                className="block w-full bg-blue-500 text-white py-2 mt-4 rounded-md hover:bg-blue-700 transition text-center"
              >
                Go to Login
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
