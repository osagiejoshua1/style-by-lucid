"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [timer, setTimer] = useState(60); // Countdown timer
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("signupEmail");
    if (!storedEmail || storedEmail !== email) {
      toast.error("❌ Unauthorized access! Please sign up first.");
      router.push("/signup");
    } else {
      setIsAuthorized(true);
    }
  }, [email, router]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const otpValue = otp.join("");
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("✅ OTP Verified Successfully!");
        sessionStorage.removeItem("signupEmail");
        setTimeout(() => router.push("/"), 2000);
      } else {
        toast.error(data.error || "❌ Invalid OTP. Please try again.");
      }
    } catch (err) {
      toast.error("❌ Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setCanResend(false);
    setTimer(60);
    try {
      const response = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("✅ New OTP sent to your email!");
      } else {
        toast.error(data.error || "❌ Failed to resend OTP. Try again later.");
      }
    } catch (err) {
      toast.error("❌ Network error. Try again later.");
    }
  };

  if (isAuthorized === null) return null;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-4">OTP Verification</h2>
        <p className="text-gray-600">Enter the 6-digit code sent to <b>{email}</b></p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            ))}
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-500 transition mt-4"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
        <div className="mt-4 text-sm">
          {canResend ? (
            <button
              onClick={handleResendOTP}
              className="text-blue-600 hover:underline font-medium"
            >
              Resend OTP
            </button>
          ) : (
            <p className="text-gray-600">Resend OTP in {timer}s</p>
          )}
        </div>
      </div>
    </div>
  );
}
