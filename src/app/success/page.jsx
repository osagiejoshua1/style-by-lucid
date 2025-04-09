import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the Success component (client-only)
const Success = dynamic(() => import("../../components/Success"), {
  ssr: false,
});

export default function Page() {
  return (
    <Suspense fallback={<div>Loading Success page...</div>}>
      <Success />
    </Suspense>
  );
}
