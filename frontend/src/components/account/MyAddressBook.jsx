// import { useAccount } from '../../hooks/useAccount';
// import { useState } from 'react';
// import { Plus, Trash2 } from 'lucide-react';

// export default function MyAddressBook() {
//   const { addresses, addAddress, deleteAddress } = useAccount();
//   const [isAdding, setIsAdding] = useState(false);
//   const [formData, setFormData] = useState({
//     label: 'Home',
//     name: '',
//     phone: '',
//     address: '',
//     city: '',
//     state: '',
//     pincode: '',
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (formData.name && formData.phone && formData.address && formData.city && formData.state && formData.pincode) {
//       addAddress(formData);
//       setFormData({ label: 'Home', name: '', phone: '', address: '', city: '', state: '', pincode: '' });
//       setIsAdding(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold text-gray-900">My Address Book</h2>
//         <button
//           onClick={() => setIsAdding(!isAdding)}
//           className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition font-semibold"
//         >
//           <Plus size={20} /> Add Address
//         </button>
//       </div>

//       {isAdding && (
//         <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <select
//               name="label"
//               value={formData.label}
//               onChange={handleChange}
//               className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-pink-600"
//             >
//               <option>Home</option>
//               <option>Office</option>
//               <option>Other</option>
//             </select>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               placeholder="Name"
//               required
//               className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-pink-600"
//             />
//             <input
//               type="tel"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               placeholder="Phone"
//               required
//               className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-pink-600"
//             />
//             <input
//               type="text"
//               name="pincode"
//               value={formData.pincode}
//               onChange={handleChange}
//               placeholder="Pincode"
//               required
//               className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-pink-600"
//             />
//           </div>
//           <input
//             type="text"
//             name="address"
//             value={formData.address}
//             onChange={handleChange}
//             placeholder="Full Address"
//             required
//             className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-pink-600"
//           />
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <input
//               type="text"
//               name="city"
//               value={formData.city}
//               onChange={handleChange}
//               placeholder="City"
//               required
//               className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-pink-600"
//             />
//             <input
//               type="text"
//               name="state"
//               value={formData.state}
//               onChange={handleChange}
//               placeholder="State"
//               required
//               className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-pink-600"
//             />
//           </div>
//           <div className="flex gap-3">
//             <button
//               type="submit"
//               className="flex-1 bg-pink-600 text-white py-2 rounded-lg font-semibold hover:bg-pink-700 transition"
//             >
//               Save Address
//             </button>
//             <button
//               type="button"
//               onClick={() => setIsAdding(false)}
//               className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {addresses.map((addr) => (
//           <div key={addr.id} className="border-2 border-gray-200 rounded-lg p-6 hover:border-pink-300 transition">
//             <div className="flex items-start justify-between mb-4">
//               <div>
//                 <p className="font-semibold text-gray-900">{addr.label} - {addr.name}</p>
//                 <p className="text-sm text-gray-600">{addr.phone}</p>
//               </div>
//               <button
//                 onClick={() => deleteAddress(addr.id)}
//                 className="text-red-500 hover:text-red-700 transition p-1"
//               >
//                 <Trash2 size={20} />
//               </button>
//             </div>
//             <p className="text-gray-700 text-sm mb-2">{addr.address}</p>
//             <p className="text-gray-700 text-sm">{addr.city}, {addr.state} {addr.pincode}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


"use client";

import { useAccount } from "@/hooks/useAccount";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function MyAddressBook() {
  const { addresses, addAddress, deleteAddress } = useAccount();

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    label: "Home",
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      formData.name &&
      formData.phone &&
      formData.address &&
      formData.city &&
      formData.state &&
      formData.pincode
    ) {
      addAddress(formData);

      setFormData({
        label: "Home",
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      });

      setIsAdding(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">My Address Book</h2>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition font-semibold text-sm"
        >
          <Plus size={18} /> Add Address
        </button>
      </div>

      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="text-sm text-gray-600 font-medium mb-2 block">
                Address Label
              </label>

              <select
                name="label"
                value={formData.label}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              >
                <option>Home</option>
                <option>Office</option>
                <option>Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm text-gray-600 font-medium mb-2 block">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 font-medium mb-2 block">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="text-sm text-gray-600 font-medium mb-2 block">
                Address
              </label>

              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm text-gray-600 font-medium mb-2 block">
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 font-medium mb-2 block">
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 font-medium mb-2 block">
                  Pincode
                </label>

                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg font-semibold transition"
              >
                Save Address
              </button>

              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses?.map((addr) => (
          <div
            key={addr.id}
            className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-pink-200 transition relative"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-800">
                  {addr.label} - {addr.name}
                </h3>
                <p className="text-sm text-gray-600">{addr.phone}</p>
              </div>

              <button
                onClick={() => deleteAddress(addr.id)}
                className="text-red-500 hover:text-red-700 transition p-1"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-700 mb-2">{addr.address}</p>
            <p className="text-sm text-gray-600">
              {addr.city}, {addr.state} {addr.pincode}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}