import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import API from "../../../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch Orders and Delivery Personnel
  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        setLoading(true);
        const [ordersRes, boysRes] = await Promise.all([
          API.get("/order/seller/all"),
          API.get("/delivery/all").catch(() => ({ data: { deliveryBoys: [] } })),
        ]);

        const rawOrders = ordersRes.data.orders || ordersRes.data.data || [];
        setOrders(Array.isArray(rawOrders) ? rawOrders : []);

        const rawBoys = boysRes.data.deliveryBoys || boysRes.data.data || [];
        setDeliveryBoys(Array.isArray(rawBoys) ? rawBoys : []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersData();
  }, []);

  // Status Change Handler
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await API.put(`/order/status/${orderId}`, { status: newStatus });
      setOrders((prev) =>
        prev.map((ord) =>
          (ord._id || ord.id) === orderId ? { ...ord, status: newStatus } : ord
        )
      );
      if (selectedOrder && (selectedOrder._id || selectedOrder.id) === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update order status");
    }
  };

  // Delivery Boy Assignment Handler
  const handleAssignDelivery = async (orderId, deliveryBoyId) => {
    try {
      await API.put(`/order/assign-delivery/${orderId}`, { deliveryBoyId });
      setOrders((prev) =>
        prev.map((ord) =>
          (ord._id || ord.id) === orderId ? { ...ord, deliveryBoyId } : ord
        )
      );
      alert("Delivery partner assigned successfully!");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to assign delivery partner");
    }
  };

  // Filtered Orders Calculation
  const filteredOrders = orders.filter((order) => {
    const orderId = String(order._id || order.id || "").toLowerCase();
    const customerName = String(
      order.user?.name || order.customerName || ""
    ).toLowerCase();
    const matchesSearch =
      orderId.includes(searchTerm.toLowerCase()) ||
      customerName.includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      String(order.status).toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const st = String(status).toLowerCase();
    switch (st) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            <CheckCircle size={14} /> Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
            <XCircle size={14} /> Cancelled
          </span>
        );
      case "out_for_delivery":
      case "dispatched":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            <Truck size={14} /> Out For Delivery
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            <Clock size={14} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders Management</h1>
          <p className="text-sm text-slate-500">
            Track, assign, and manage customer orders seamlessly.
          </p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID or Customer Name..."
            className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-600"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="dispatched">Out For Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center font-medium text-slate-500">
            Loading orders list...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center font-medium text-slate-500">
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">Order Details</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assign Delivery</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const orderId = order._id || order.id;

                  return (
                    <tr key={orderId} className="hover:bg-slate-50/50">
                      {/* Order Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                            <ShoppingBag size={18} />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-900">
                              #{String(orderId).slice(-6).toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-400">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString("en-IN")
                                : "Today"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="px-6 py-4">
                        <span className="block font-semibold text-slate-800">
                          {order.user?.name || order.customerName || "Customer"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {order.user?.phone || order.phone || "No Contact"}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ₹{order.totalAmount || order.price || 0}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Assign Delivery Partner */}
                      <td className="px-6 py-4">
                        <select
                          value={order.deliveryBoyId || ""}
                          onChange={(e) => handleAssignDelivery(orderId, e.target.value)}
                          className="h-9 w-40 rounded-lg border border-slate-200 px-2 text-xs outline-none focus:border-emerald-600"
                        >
                          <option value="">Select Partner</option>
                          {deliveryBoys.map((boy) => (
                            <option key={boy._id || boy.id} value={boy._id || boy.id}>
                              {boy.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                Order Details (#{String(selectedOrder._id || selectedOrder.id).slice(-6).toUpperCase()})
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-700">
              <div>
                <span className="block text-xs font-semibold text-slate-400">Customer Name</span>
                <span>{selectedOrder.user?.name || selectedOrder.customerName || "N/A"}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400">Address</span>
                <span>{selectedOrder.address || "No address specified"}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400">Status Update</span>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder._id || selectedOrder.id, "dispatched")}
                    className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-200"
                  >
                    Set Out For Delivery
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder._id || selectedOrder.id, "delivered")}
                    className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-200"
                  >
                    Set Delivered
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}