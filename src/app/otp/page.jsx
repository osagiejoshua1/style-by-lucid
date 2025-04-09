"use client";

import dynamic from "next/dynamic";

// ✅ Dynamically import the client-only OTPVerification component
const OTPVerification = dynamic(() => import("../components/OTPVerification"), {
  ssr: false, // Important to prevent server-side rendering issues
});

export default function Page() {
  return <OTPVerification />;
}
