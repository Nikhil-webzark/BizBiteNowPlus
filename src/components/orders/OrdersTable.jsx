import { useState } from "react";
import { MoreVertical, PackageOpen } from "lucide-react";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderActionModal from "./OrderActionModal";
import { useNavigate } from "react-router-dom";

const INK = "#1A4D2E";

export default function OrdersTable({
  orders,
  deliveryBoys = [],
  activeTab = "new",
  selectedOrders = [],
  toggleOrder = () => { },
  toggleAll = () => { },
  onAccept,
  onPreparing,
  onReady,
  onDelivery,
  onDelivered,
  onCancel,
  onAssign,
  onDelete,
}) {
  const navigate = useNavigate();
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const selectedOrder = orders.find((item) => item.id === selectedOrderId) || null;

  if (!orders.length) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-16 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: `${INK}1A` }}
        >
          <PackageOpen size={26} style={{ color: INK }} />
        </div>

        <h3 className="text-base font-semibold text-slate-800">
          {activeTab === "new" ? "No new orders" : "No completed orders"}
        </h3>

        <p className="mt-1.5 text-sm text-slate-500">
          {activeTab === "new"
            ? "New orders will appear here once customers place them."
            : "Delivered orders will appear here."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="w-12 px-5 py-3.5">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selectedOrders.length === orders.length}
                    onChange={toggleAll}
                    className="accent-[#1A4D2E]"
                  />
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Order
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Customer
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-medium uppercase tracking-wide text-slate-500">
                  Items
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Payment
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                  Amount
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-medium uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/seller/orders/${order.id}`)}
                  className="cursor-pointer border-b border-slate-50 transition hover:bg-slate-50/60"
                >
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleOrder(order.id)}
                      className="accent-[#1A4D2E]"
                    />
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-800">{order.orderId}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        timeStyle: "short",
                        dateStyle: "short",
                      })}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: INK }}
                      >
                        {order.customer ? order.customer.charAt(0).toUpperCase() : "G"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{order.customer}</p>
                        <p className="text-xs text-slate-500">{order.phone}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-center text-sm font-medium text-slate-700">
                    {order.items?.length || 0}
                  </td>

                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <span
                        className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                        style={
                          order.payment === "COD"
                            ? { backgroundColor: "#F8BD0D26", color: "#946600" }
                            : { backgroundColor: `${INK}1A`, color: INK }
                        }
                      >
                        {order.payment}
                      </span>
                      <p className="text-xs text-slate-400">{order.paymentStatus}</p>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-semibold text-slate-800">
                    ₹{order.amount}
                  </td>

                  <td className="px-5 py-4 text-center">
                    <OrderStatusBadge status={order.status} />
                  </td>

                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrderId(order.id);
                        setActionModalOpen(true);
                      }}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <OrderActionModal
        open={actionModalOpen}
        order={selectedOrder}
        deliveryBoys={deliveryBoys}
        onClose={() => {
          setActionModalOpen(false);
          setSelectedOrderId(null);
        }}
        acceptOrder={onAccept}
        markPreparing={onPreparing}
        markReady={onReady}
        onAssign={onAssign}
        markDelivery={onDelivery}
        markDelivered={onDelivered}
        cancelOrder={onCancel}
        onDelete={onDelete}
      />
    </>
  );
}