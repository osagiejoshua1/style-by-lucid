"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminAuthGuard({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const adminToken = sessionStorage.getItem("adminToken");

    if (!adminToken) {
      // ❌ If no token, redirect to login
      router.push("/admin-login");
    } else {
      // ✅ If token exists, set authentication status
      setIsAuthenticated(true);
    }
  }, [router]);

  if (isAuthenticated === null) return null; // ⏳ Show nothing while checking

  return isAuthenticated ? children : null;
}
