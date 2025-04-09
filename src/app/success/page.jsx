"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const Success = dynamic(() => import("../components/Success"), {
  ssr: false,
});

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Success />
    </Suspense>
  );
}
