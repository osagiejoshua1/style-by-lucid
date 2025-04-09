"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const AdminLogin = () => {
const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch(`${API_URL}/api/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "❌ Invalid email or password.");
      }
  
      // ✅ Store adminToken in sessionStorage (like OTP page)
      sessionStorage.setItem("adminToken", data.token);
  
      toast.success(`✅ Welcome, ${data.admin.fullName}! Redirecting...`);
  
      setTimeout(() => {
        router.push("/admin-dashboard"); // ✅ Redirect to dashboard
      }, 1000);
    } catch (err) {
      console.error("❌ Login Error:", err);
      toast.error(err.message);
    }
  
    setLoading(false);
  };
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center">
          <img
            src="/IMG_D87B3092EE01-1_LE_upscale_balanced_x4.jpg"
            alt="Login"
            className="w-[250px]"
          />
        </div>
        <h2 className="text-2xl font-semibold text-center mb-4">Admin Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="relative flex items-center">
            <FaLock className="absolute left-3 text-black" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-500 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex justify-center pt-5">
          <a href="/reset-password">
            <p className="text-center text-blue-500 underline cursor-pointer">Forgot Password?</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
