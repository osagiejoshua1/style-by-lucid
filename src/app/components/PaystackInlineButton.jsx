"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const PaystackInlineButton = ({ email, amount, fullName, onSuccess, children }) => {
  const [isPaystackLoaded, setIsPaystackLoaded] = useState(false);

  useEffect(() => {
    if (window.PaystackPop) {
      setIsPaystackLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      console.log("✅ Paystack script loaded successfully");
      setIsPaystackLoaded(true);
    };
    script.onerror = () => {
      console.error("❌ Failed to load Paystack script");
      toast.error("❌ Failed to load Paystack. Please refresh.");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const payWithPaystack = () => {
    if (!isPaystackLoaded || !window.PaystackPop) {
      toast.warn("⏳ Paystack is still loading. Please wait...");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email,
      amount: amount * 100, // Convert to kobo
      currency: "NGN",
      metadata: {
        custom_fields: [
          {
            display_name: fullName,
            variable_name: "full_name",
            value: fullName,
          },
        ],
      },
      callback: function (response) {
        console.log("🎉 Payment response:", response);
        toast.success("✅ Payment successful!");
        onSuccess(response);
      },
      onClose: function () {
        toast.info("❌ Payment window closed.");
      },
    });

    handler.openIframe();
  };

  return (
    <div onClick={payWithPaystack} style={{ cursor: "pointer" }}>
      {children}
    </div>
  );
};

export default PaystackInlineButton;
