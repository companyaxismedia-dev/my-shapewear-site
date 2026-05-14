"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, MapPin, Ruler, ShieldCheck, Truck, XCircle } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { DELIVERY_PINCODE_STORAGE_KEY, formatDeliveryDate } from "@/hooks/useDeliveryEstimates";

export default function DeliveryPincodeChecker({ productId, title = "Delivery Options", compact = false }) {
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const savedPincode = localStorage.getItem(DELIVERY_PINCODE_STORAGE_KEY);
      if (/^[1-9][0-9]{5}$/.test(savedPincode || "")) {
        setPincode(savedPincode);
      }
    } catch {
      // Local storage is optional; the checker still works without it.
    }
  }, []);

  const canCheck = /^[1-9][0-9]{5}$/.test(pincode);

  const checkDelivery = async (nextPincode = pincode) => {
    if (!productId) return;

    const cleanPincode = String(nextPincode || "").trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPincode)) {
      setStatus("idle");
      setResult(null);
      setError(cleanPincode.length ? "Enter a valid 6 digit PIN code" : "");
      return;
    }

    try {
      setStatus("checking");
      setError("");

      const response = await fetch(
        `${API_BASE}/api/products/${productId}/delivery?pincode=${cleanPincode}`,
        { cache: "no-store" }
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Delivery check failed");
      }

      setResult(data);
      setStatus("done");

      try {
        localStorage.setItem(DELIVERY_PINCODE_STORAGE_KEY, cleanPincode);
      } catch {}
    } catch (err) {
      setResult(null);
      setStatus("error");
      setError(err.message || "Delivery check failed. Please try again.");
    }
  };

  useEffect(() => {
    if (!canCheck) return;
    const timer = setTimeout(() => checkDelivery(pincode), 450);
    return () => clearTimeout(timer);
  }, [pincode, canCheck, productId]);

  const helperText = useMemo(() => {
    if (status === "checking") return "Checking delivery time and COD availability...";
    if (error) return error;
    if (!result) return "Enter PIN code to check delivery time and Pay on Delivery availability";
    if (!result.serviceable) return `Delivery is not available for ${result.pincode} on this product`;

    const location = [result.location?.area, result.location?.district || result.location?.city, result.location?.state]
      .filter(Boolean)
      .join(", ");

    return location ? `Delivering to ${location}` : `Delivering to PIN ${result.pincode}`;
  }, [error, result, status]);

  return (
    <div className={compact ? "space-y-3" : "space-y-3 border-b border-[#f1e4e8] pb-5"}>
      {title ? (
        <h2 className={compact ? "text-[17px] font-semibold text-[#2f2428]" : "text-[15px] font-bold uppercase tracking-[0.04em] text-[#282c3f]"}>
          {title}
        </h2>
      ) : null}

      <div className="flex w-full max-w-[360px] items-center gap-2 border border-[#d9dce4] bg-white px-3 py-2.5">
        <MapPin size={16} className="shrink-0 text-[#c56f7f]" />
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={pincode}
          onChange={(event) => {
            const nextValue = event.target.value.replace(/\D/g, "").slice(0, 6);
            setPincode(nextValue);
            if (nextValue.length < 6) {
              setResult(null);
              setStatus("idle");
              setError("");
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") checkDelivery();
          }}
          placeholder="Enter pincode"
          className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-[#2f2428] outline-none placeholder:text-[#8c7480]"
          aria-label="Enter delivery pincode"
        />
        <button
          type="button"
          onClick={() => checkDelivery()}
          disabled={!canCheck || status === "checking"}
          className="shrink-0 text-[13px] font-bold text-[#c56f7f] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "checking" ? <Loader2 size={16} className="animate-spin" /> : "Check"}
        </button>
      </div>

      <p className={`text-[12px] leading-5 ${error || result?.serviceable === false ? "text-[#c45c75]" : "text-[#6f5560]"}`}>
        {helperText}
      </p>

      {result?.serviceable ? (
        <div className="rounded-[8px] border border-[#d7efe2] bg-[#f5fff9] px-3 py-2 text-[13px] font-semibold text-[#256f4a]">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Expected delivery by {formatDeliveryDate(result.expectedDeliveryDate)}</span>
          </div>
        </div>
      ) : result ? (
        <div className="rounded-[8px] border border-[#f1c8d0] bg-[#fff7f8] px-3 py-2 text-[13px] font-semibold text-[#a43d55]">
          <div className="flex items-center gap-2">
            <XCircle size={16} />
            <span>Not deliverable for this product</span>
          </div>
        </div>
      ) : null}

      <div className={`${compact ? "space-y-4" : "space-y-2"} pt-1 text-[14px] leading-5 text-[#282c3f]`}>
        <div className="flex items-center gap-3">
          <Truck size={compact ? 18 : 16} className="shrink-0" />
          <span>{result?.serviceable ? `Delivery in ${result.estimatedDays} business days` : "Delivery options available"}</span>
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck size={compact ? 18 : 16} className="shrink-0" />
          <span>{result ? (result.codAvailable ? "Pay on delivery available" : "Pay on delivery unavailable") : "Pay on delivery might be available"}</span>
        </div>
        <div className="flex items-center gap-3">
          <Ruler size={compact ? 18 : 16} className="shrink-0" />
          <span>Easy size guidance for better fit</span>
        </div>
      </div>
    </div>
  );
}
