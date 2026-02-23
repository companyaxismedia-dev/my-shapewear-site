import { useAccount } from '../../hooks/useAccount';
import { Copy, Trash2 } from 'lucide-react';

export default function MyCoupons() {
  const { coupons } = useAccount();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">My Coupons</h2>

      <div className="space-y-4">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="border-2 border-pink-200 rounded-lg p-6 bg-gradient-to-r from-pink-50 to-white hover:shadow-md transition">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-pink-600 mb-2">{coupon.discount}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="bg-white border-2 border-gray-300 px-3 py-1 rounded font-mono font-semibold text-gray-800">
                      {coupon.code}
                    </code>
                    <button className="p-1 hover:bg-gray-100 rounded transition" title="Copy coupon code">
                      <Copy size={18} className="text-gray-600" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{coupon.minPurchase}</p>
                  <p className="text-xs text-gray-500">Expiry: {coupon.expiry}</p>
                </div>
              </div>
              <button className="text-red-500 hover:text-red-700 transition p-2">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
