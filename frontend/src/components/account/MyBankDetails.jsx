"use client";

import { useAccount } from "@/hooks/useAccount";
import { useState, useEffect } from "react";

export default function MyBankDetails() {
  const { bankDetails, updateBankDetails } = useAccount();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    accountHolder: "",
    accountNumber: "",
    bankName: "",
    branchName: "",
    ifscCode: "",
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (bankDetails) {
      setFormData(bankDetails);
    }
  }, [bankDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= SAVE TO BACKEND ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 🔥 future backend call ready
      await updateBankDetails(formData);

      setIsEditing(false);
    } catch (err) {
      console.error("Bank update error:", err);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          My Bank Details
        </h2>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      {/* ================= VIEW MODE ================= */}
      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <Field title="Account Holder" value={bankDetails?.accountHolder} />
          <Field title="Account Number" value={bankDetails?.accountNumber} />
          <Field title="Bank Name" value={bankDetails?.bankName} />
          <Field title="Branch Name" value={bankDetails?.branchName} />
          <Field title="IFSC Code" value={bankDetails?.ifscCode} />

        </div>
      ) : (

        /* ================= EDIT MODE ================= */
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            <Input
              name="accountHolder"
              value={formData.accountHolder}
              onChange={handleChange}
              placeholder="Account holder name"
            />

            <Input
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Account number"
            />

            <Input
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="Bank name"
            />

            <Input
              name="branchName"
              value={formData.branchName}
              onChange={handleChange}
              placeholder="Branch name"
            />

            <Input
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              placeholder="IFSC code"
            />

          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold"
          >
            Save Bank Details
          </button>
        </form>
      )}
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function Field({ title, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
        {title}
      </p>
      <p className="text-base text-gray-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function Input({ name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-sm text-gray-600 font-medium mb-2 block">
        {placeholder}
      </label>
      <input
        type="text"
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
      />
    </div>
  );
}