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
    : 'fixed inset-0 flex items-center justify-center z-50';

  return (
    <div className={containerClass}>
      {variant === 'modal' && <div className="absolute inset-0 bg-black/10 pointer-events-none" />}
      <div className={(variant === 'drawer' ? 'p-6' : 'bg-white rounded-lg p-6 w-[540px]') + ' relative z-50'} role="dialog" aria-modal="true">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Customer</h3>
          <button type="button" onClick={onClose} className="text-gray-600 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        {!user ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600">Name</label>
              <input value={user.name || ''} onChange={(e) => handleChange('name', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Email</label>
              <input value={user.email || ''} onChange={(e) => handleChange('email', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Phone</label>
              <input value={user.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>

            <div className="pt-2 border-t">
              <div className="text-sm font-medium mb-2">Address</div>
              <div>
                <label className="text-xs text-gray-600">Address Line</label>
                <input value={(user.addresses && user.addresses[0] && user.addresses[0].addressLine) || ''} onChange={(e) => handleAddressChange('addressLine', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600">City</label>
                  <input value={(user.addresses && user.addresses[0] && user.addresses[0].city) || ''} onChange={(e) => handleAddressChange('city', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-xs text-gray-600">State</label>
                  <input value={(user.addresses && user.addresses[0] && user.addresses[0].state) || ''} onChange={(e) => handleAddressChange('state', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600">Pincode</label>
                  <input value={(user.addresses && user.addresses[0] && user.addresses[0].pincode) || ''} onChange={(e) => handleAddressChange('pincode', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Phone (address)</label>
                  <input value={(user.addresses && user.addresses[0] && user.addresses[0].phone) || ''} onChange={(e) => handleAddressChange('phone', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <button type="button" onClick={onClose} className="px-3 py-2 rounded-md bg-gray-100 cursor-pointer">Cancel</button>
              <button type="button" onClick={submit} disabled={loading} className="px-4 py-2 rounded-md bg-accent-brand text-black cursor-pointer">{loading ? 'Saving...' : 'Save changes'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
