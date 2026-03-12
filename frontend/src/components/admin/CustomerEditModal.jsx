"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { API_BASE } from "@/lib/api";

export default function CustomerEditModal({ open, onClose = () => {}, user: initialUser, userId, variant = "modal", onSaved }) {
  const [user, setUser] = useState(initialUser || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUser(initialUser || null);
  }, [initialUser]);

  useEffect(() => {
    if (!user && userId && open) {
      // fetch user
      (async () => {
        try {
          const token = localStorage.getItem("adminToken");
          const res = await fetch(`${API_BASE}/api/admin/customers/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
          const json = await res.json();
          if (json.success) setUser(json.user || null);
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }, [userId, open]);

  if (!open) return null;

  const handleChange = (key, value) => {
    setUser((u) => ({ ...u, [key]: value }));
  };

  const handleAddressChange = (key, value) => {
    setUser((u) => {
      const addr = (u.addresses && u.addresses[0]) ? { ...u.addresses[0] } : {};
      addr[key] = value;
      return { ...u, addresses: [addr] };
    });
  };

  const submit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const payload = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        address: (user.addresses && user.addresses[0]) ? user.addresses[0] : undefined,
      };
      const res = await fetch(`${API_BASE}/api/admin/customers/${user._id || userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Update failed');
      toast.success('Customer updated');
      onSaved && onSaved(json.user);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const containerClass = variant === 'drawer'
    ? 'fixed right-0 top-0 h-full w-[420px] bg-white shadow-xl z-50 overflow-auto'
    : 'fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm';

  return (
    <div className={containerClass}>
      <div className={(variant === 'drawer' ? 'p-6' : 'bg-white rounded-2xl p-8 w-[540px] shadow-2xl') + ' relative z-50'} role="dialog" aria-modal="true">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Customer</h3>
          <button type="button" onClick={onClose} className="text-gray-600 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        {!user ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-gray-600">Loading...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input value={user.name || ''} onChange={(e) => handleChange('name', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input value={user.email || ''} onChange={(e) => handleChange('email', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input value={user.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select value={user.status || 'active'} onChange={(e) => handleChange('status', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm font-semibold text-gray-900 mb-4">Address</div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Line</label>
                  <input value={(user.addresses && user.addresses[0] && user.addresses[0].addressLine) || ''} onChange={(e) => handleAddressChange('addressLine', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input value={(user.addresses && user.addresses[0] && user.addresses[0].city) || ''} onChange={(e) => handleAddressChange('city', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input value={(user.addresses && user.addresses[0] && user.addresses[0].state) || ''} onChange={(e) => handleAddressChange('state', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                    <input value={(user.addresses && user.addresses[0] && user.addresses[0].pincode) || ''} onChange={(e) => handleAddressChange('pincode', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone (address)</label>
                    <input value={(user.addresses && user.addresses[0] && user.addresses[0].phone) || ''} onChange={(e) => handleAddressChange('phone', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 cursor-pointer transition">Cancel</button>
              <button type="button" onClick={submit} disabled={loading} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 cursor-pointer transition">{loading ? 'Saving...' : 'Save changes'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
