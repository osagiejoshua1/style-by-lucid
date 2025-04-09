"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import AccessoryCard from "@/app/components/AccessoryCard"; // ✅ import your new card component
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AccessoriesPage() {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccessoriesWithStock = async () => {
      try {
        const res = await fetch(`${API_URL}/api/accessories`);
        const data = await res.json();
  
        if (!Array.isArray(data)) throw new Error("Invalid accessories response");
        setAccessories(data);
      } catch (err) {
        console.error("❌ Failed to fetch accessories or stock:", err);
        toast.error("Failed to load accessories.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchAccessoriesWithStock();
  
    // 🧠 Re-run when user switches back to this tab
    const handleFocus = () => {
      fetchAccessoriesWithStock();
    };
  
    window.addEventListener("focus", handleFocus);
  
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);
  

  return (
    <>
      <Navbar />
      <div className="w-full min-h-screen pt-[80px] bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Accessories Collection
          </h2>

          {loading ? (
            <div className="text-center text-gray-500 text-lg">
              Loading accessories...
            </div>
          ) : accessories.length === 0 ? (
            <div className="text-center text-gray-500">No accessories found.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {accessories.map((acc) => (
                <AccessoryCard key={acc._id} product={acc} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
