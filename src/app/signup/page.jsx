"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL; // Ensure this is set in .env.local

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
        toast.error("❌ Passwords do not match");
        setLoading(false);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await response.json();
        console.log("📥 Signup Response:", data);

        if (response.ok) {
            toast.success("✅ Signup successful! Redirecting...");

            // ✅ Store user data in sessionStorage
            sessionStorage.setItem("user", JSON.stringify(data.user));
            sessionStorage.setItem("signupEmail", formData.email); // ✅ Ensure OTP page can access it

            console.log("🔄 Redirecting to OTP Page...");
            
            // ✅ Test navigation
            setTimeout(() => {
                console.log("✅ Navigating to:", `/otp?email=${encodeURIComponent(formData.email)}`);
                router.push(`/otp?email=${encodeURIComponent(formData.email)}`);
            }, 2000);
        } else {
            toast.error(data.error || "❌ Signup failed. Please try again.");
        }
    } catch (err) {
        console.error("❌ Signup Error:", err);
        toast.error("❌ Something went wrong. Please try again.");
    }

    setLoading(false);
};

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  console.log("✅ API_URL:", API_URL); // Debugging

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      {/* Toast Notifications Container */}
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center">
          <img src="IMG_D87B3092EE01-1_LE_upscale_balanced_x4.jpg" alt="Signup" className="w-[300px]" />
        </div>
        <h2 className="text-2xl font-semibold text-center mb-4">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex items-center">
            <FaUser className="absolute left-3 text-black" />
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

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
            <FaPhone className="absolute left-3 text-black" />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
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

          <div className="relative flex items-center">
            <FaLock className="absolute left-3 text-black" />
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-500 transition"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="flex justify-center">
          <p className="text-center pt-5">
            Already Have an Account?{" "}
            <a href="/login">
            <span className="text-blue-500 font-bold underline cursor-pointer">Login</span>
            </a>
          </p>
        </div>

        
        
      </div>
    </div>
  );
}
