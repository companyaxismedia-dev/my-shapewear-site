"use client";

export const loadRazorpay = () =>
  new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const getRazorpayMethodConfig = (method = "UPI") => {
  const normalized = String(method).toUpperCase();

  if (normalized === "CARD") {
    return {
      description: "Card Payment",
      method: {
        card: true,
        upi: false,
        netbanking: false,
        wallet: false,
        emi: false,
        paylater: false,
      },
      config: {
        display: {
          blocks: {
            cards: {
              name: "Cards",
              instruments: [{ method: "card" }],
            },
          },
          sequence: ["block.cards"],
          preferences: {
            show_default_blocks: false,
          },
        },
      },
    };
  }

  return {
    description: "UPI Payment",
    method: {
      upi: true,
      card: false,
      netbanking: false,
      wallet: false,
      emi: false,
      paylater: false,
    },
    config: {
      display: {
        blocks: {
          upi: {
            name: "UPI Apps",
            instruments: [{ method: "upi" }],
          },
        },
        sequence: ["block.upi"],
        preferences: {
          show_default_blocks: false,
        },
      },
    },
  };
};
