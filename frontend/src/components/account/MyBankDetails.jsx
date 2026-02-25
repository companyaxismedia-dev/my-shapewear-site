// import { useAccount } from '../../hooks/useAccount';
// import { useState } from 'react';

// export default function MyBankDetails() {
//   const { bankDetails, updateBankDetails } = useAccount();
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState(bankDetails);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     updateBankDetails(formData);
//     setIsEditing(false);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold text-gray-900">My Bank Details</h2>
//         <button
//           onClick={() => setIsEditing(!isEditing)}
//           className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition font-semibold"
//         >
//           {isEditing ? 'Cancel' : 'Edit'}
//         </button>
//       </div>

//       {!isEditing ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
//           <div>
//             <p className="text-sm text-gray-600 font-semibold">Account Holder</p>
//             <p className="text-gray-900 font-semibold">{bankDetails.accountHolder || 'Not provided'}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600 font-semibold">Account Number</p>
//             <p className="text-gray-900 font-semibold">{bankDetails.accountNumber || 'Not provided'}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600 font-semibold">Bank Name</p>
//             <p className="text-gray-900 font-semibold">{bankDetails.bankName || 'Not provided'}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600 font-semibold">IFSC Code</p>
//             <p className="text-gray-900 font-semibold">{bankDetails.ifscCode || 'Not provided'}</p>
//           </div>
//         </div>
//       ) : (
//         <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-lg">
//           <input
//             type="text"
//             name="accountHolder"
//             value={formData.accountHolder}
//             onChange={handleChange}
//             placeholder="Account Holder Name"
//             className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-pink-600"
//           />
//           <input
//             type="text"
//             name="accountNumber"
//             value={formData.accountNumber}
//             onChange={handleChange}
//             placeholder="Account Number"
//             className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-pink-600"
//           />
//           <input
//             type="text"
//             name="bankName"
//             value={formData.bankName}
//             onChange={handleChange}
//             placeholder="Bank Name"
//             className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-pink-600"
//           />
//           <input
//             type="text"
//             name="ifscCode"
//             value={formData.ifscCode}
//             onChange={handleChange}
//             placeholder="IFSC Code"
//             className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-pink-600"
//           />
//           <button
//             type="submit"
//             className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
//           >
//             Save Bank Details
//           </button>
//         </form>
//       )}
//     </div>
//   );
// }



"use client";

import { useAccount } from "@/hooks/useAccount";
import { useState } from "react";

export default function MyBankDetails() {
  const { bankDetails, updateBankDetails } = useAccount();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(bankDetails);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateBankDetails(formData);
    setIsEditing(false);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">My Bank Details</h2>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition font-semibold text-sm"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
              Account Holder
            </p>
            <p className="text-base text-gray-800">
              {bankDetails?.accountHolder || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
              Account Number
            </p>
            <p className="text-base text-gray-800">
              {bankDetails?.accountNumber || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
              Bank Name
            </p>
            <p className="text-base text-gray-800">
              {bankDetails?.bankName || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
              Branch Name
            </p>
            <p className="text-base text-gray-800">
              {bankDetails?.branchName || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
              IFSC Code
            </p>
            <p className="text-base text-gray-800">
              {bankDetails?.ifscCode || "Not provided"}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="text-sm text-gray-600 font-medium mb-2 block">
                Account Holder
              </label>
              <input
                type="text"
                name="accountHolder"
                value={formData?.accountHolder || ""}
                onChange={handleChange}
                placeholder="Account holder name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium mb-2 block">
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData?.accountNumber || ""}
                onChange={handleChange}
                placeholder="Account number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium mb-2 block">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={formData?.bankName || ""}
                onChange={handleChange}
                placeholder="Bank name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium mb-2 block">
                Branch Name
              </label>
              <input
                type="text"
                name="branchName"
                value={formData?.branchName || ""}
                onChange={handleChange}
                placeholder="Branch name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium mb-2 block">
                IFSC Code
              </label>
              <input
                type="text"
                name="ifscCode"
                value={formData?.ifscCode || ""}
                onChange={handleChange}
                placeholder="IFSC code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Save Bank Details
          </button>
        </form>
      )}
    </div>
  );
}