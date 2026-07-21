import { useState } from "react";
import { MoreVertical, PackageOpen } from "lucide-react";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderActionModal from "./OrderActionModal";
import { useNavigate } from "react-router-dom";

export default function OrdersTable({
  orders,
  deliveryBoys = [],
  activeTab = "new",
  selectedOrders = [],
  toggleOrder = () => {},
  toggleAll = () => {},
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
      <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#16522d]/10">
          <PackageOpen size={30} className="text-[#16522d]" />
        </div>

        <h3 className="text-lg font-semibold text-slate-800">
          {activeTab === "new" ? "No New Orders" : "No Completed Orders"}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {activeTab === "new"
            ? "New orders will appear here once customers place them."
            : "Delivered orders will appear here."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-12 px-5 py-4">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selectedOrders.length === orders.length}
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold">Order</th>
                <th className="px-5 py-4 text-left text-sm font-semibold">Customer</th>
                <th className="px-5 py-4 text-center text-sm font-semibold">Items</th>
                <th className="px-5 py-4 text-left text-sm font-semibold">Payment</th>
                <th className="px-5 py-4 text-right text-sm font-semibold">Amount</th>
                <th className="px-5 py-4 text-center text-sm font-semibold">Status</th>
                <th className="px-5 py-4 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/seller/orders/${order.id}`)}
                  className="border-t transition cursor-pointer hover:bg-slate-50"
                >
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleOrder(order.id)}
                    />
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{order.orderId}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleString("en-IN", { timeStyle: "short", dateStyle: "short" })}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16522d]/10 font-bold text-[#16522d]">
                        {order.customer ? order.customer.charAt(0) : "G"}
                      </div>
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-xs text-slate-500">{order.phone}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-center font-semibold">
                    {order.items?.length || 0}
                  </td>

                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold ${
                          order.payment === "COD"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {order.payment}
                      </span>
                      <p className="text-xs text-slate-500">{order.paymentStatus}</p>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right font-bold">₹{order.amount}</td>

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
                      className="rounded-lg p-2 transition hover:bg-slate-100 text-slate-500"
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