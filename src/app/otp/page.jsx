import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the OTP component (client-only)
const OTPVerification = dynamic(() => import("../../components/OTPVerification"), {
  ssr: false,
});

export default function Page() {
  return (
    <Suspense fallback={<div>Loading OTP page...</div>}>
      <OTPVerification />
    </Suspense>
  );
}
