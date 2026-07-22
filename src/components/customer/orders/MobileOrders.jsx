import { ShoppingBag, CheckCircle2 } from "lucide-react";
import useOrderStore from "../../../api/stores/customerstore/orderStore";
import CompactHistoryCard from "./CompactHistoryCard";
import CurrentOrderCard from "./OrderCard";
import OrderSkeleton from "../skeleton/OrderSkeleton";

export default function MobileOrders({ onTrack, onView, onReorder }) {
  // Store se state aur getters consume karein (No useEffect fetching here)
  const { loading, getCurrentOrders, getOrderHistory } = useOrderStore();

  const currentOrders = getCurrentOrders ? getCurrentOrders() : [];
  const orderHistory = getOrderHistory ? getOrderHistory() : [];

  if (loading?.fetchOrders) {
    return <OrderSkeleton />;
  }

  return (
    <div className="space-y-6 pb-24 px-4 pt-4">
      {/* Active Orders Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Active Orders</h2>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
            <CheckCircle2 size={14} />
            {currentOrders.length} Active
          </span>
        </div>

        {currentOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <ShoppingBag className="mx-auto text-slate-300" size={36} />
            <p className="mt-3 text-sm text-slate-500 font-medium">
              No active orders right now
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentOrders.map((order) => {
              const orderId = order.id || order._id;
              return (
                <CurrentOrderCard
                  key={orderId}
                  order={order}
                  onTrack={() => onTrack && onTrack(order)}
                  onView={() => onView && onView(order)}
                  onReorder={() => onReorder && onReorder(order)}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Order History Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Order History</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            {orderHistory.length} Orders
          </span>
        </div>

        {orderHistory.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <ShoppingBag className="mx-auto text-slate-300" size={36} />
            <p className="mt-3 text-sm text-slate-500 font-medium">
              No order history available
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orderHistory.map((order) => {
              const orderId = order.id || order._id;
              return (
                <CompactHistoryCard
                  key={orderId}
                  order={order}
                  onView={() => onView && onView(order)}
                  onReorder={() => onReorder && onReorder(order)}
                  onRate={() => {}}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}