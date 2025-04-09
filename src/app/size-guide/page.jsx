"use client";
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function SizeGuideSection() {
  return (
   <>
   <Navbar/>
    <section className="relative xl:h-[70vh] h-[60vh] w-full">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover"
        style={{
          backgroundImage:
            "url('/Screenshot 2025-04-05 at 3.42.43 pm.png')",
          backgroundPosition: "0% 15%", // 👈 Moves image up slightly
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Centered Text */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <h1 className="text-white text-4xl md:text-6xl font-bold tracking-widest uppercase">
          Size Guide
        </h1>
      </div>
    </section>
   <div className="mx-auto md:max-w-7xl overflow-hidden">
   <div className="overflow-x-auto w-full mt-10">
      <table className="min-w-[700px] w-full text-sm md:text-base border-collapse">
        <thead>
          <tr className="bg-black text-white text-left">
            <th className="py-3 px-4 font-semibold">Display Sizes</th>
            <th className="py-3 px-4 font-semibold">XS</th>
            <th className="py-3 px-4 font-semibold">S</th>
            <th className="py-3 px-4 font-semibold">M</th>
            <th className="py-3 px-4 font-semibold">L</th>
            <th className="py-3 px-4 font-semibold">XL</th>
            <th className="py-3 px-4 font-semibold">XXL</th>
            <th className="py-3 px-4 font-semibold">XXXL</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Neck Circumference (in)", 13, 14, 15, 16, 17, 18, 20],
            ["Chest Circumference (in)", 30, 34, 38, 42, 46, 48, 52],
            ["Waist Circumference (in)", 24, 28, 32, 36, 38, 40, 44],
            ["Arm length", 24, 24.5, 25, 25.5, 26, 27, 27],
            ["Neck Circumference (cm)", 33, 35.5, 38, 40.6, 43.2, 46, 51],
            ["Chest Circumference (cm)", 76.2, 86.4, 96.5, 106.7, 116.9, 122, 133],
            ["Waist Circumference (cm)", 70, 71.1, 81.3, 91.5, 101.6, 102, 122],
            ["Arm length", 60.9, 62.2, 63.5, 64.7, 66, 69, 169],
          ].map((row, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
              {row.map((cell, i) => (
                <td key={i} className="py-3 px-4 border border-gray-200">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
   </div>

   <div className="flex justify-center text-center pt-[5%]">
    <p className="text-2xl md:text-3xl font-bold text-center uppercase text-gray-800 tracking-widest">HOW TO MEASURE</p>
   </div>

   <div className="flex justify-center mb-[5%]">
    <img src="size-guide-illustration.png" alt=""  className="w-full max-w-3xl rounded-xl shadow-md object-contain"/>
   </div>

   <Footer/>
   </>
  );
}
