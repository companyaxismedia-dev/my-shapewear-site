import { useAccount } from '../../hooks/useAccount';
import { ShoppingBag } from 'lucide-react';

export default function OrderHistory() {
  const { orders } = useAccount();

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Order History</h2>

        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg">
          <ShoppingBag size={64} className="text-gray-300 mb-4" />
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Orders Yet</h3>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
          <a
            href="/"
            className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Order History</h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-semibold text-gray-900">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-900">{order.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-semibold text-gray-900">₹{order.total}</p>
              </div>
              <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
