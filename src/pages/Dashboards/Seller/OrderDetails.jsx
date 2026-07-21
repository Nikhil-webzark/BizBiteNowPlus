import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, User, Phone, MapPin, Package, Calendar, CreditCard,
  CircleCheck, BadgeCheck, Truck, MoreVertical, Loader2, Trash2
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";
import useOrderStore from "../../../store/orderStore";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    orders,
    isLoading,
    error,
    fetchOrders,
    updateOrderStatus,
    deleteOrder,
    getOrderById,
  } = useOrderStore();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Safe async fetch trigger
  useEffect(() => {
    let isMounted = true;
    if (!orders || orders.length === 0) {
      Promise.resolve().then(() => {
        if (isMounted) {
          fetchOrders().catch((err) => console.error("Failed to fetch orders:", err));
        }
      });
    }
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // FIX: Unnecessary 'orders' dependency removed to satisfy ESLint
  const rawOrder = useMemo(() => {
    return getOrderById(id);
  }, [id, getOrderById]);

  const order = useMemo(() => {
    if (!rawOrder) return null;

    const backendStatus = String(
      rawOrder.delivery_status || rawOrder.status || "Unassigned",
    ).trim();

    const processedItems = (rawOrder.items || []).map((item, index) => {
      const pData = item.product_id || {};
      return {
        itemId: item._id || index,
        productId: pData._id || item.product_id,
        quantity: item.quantity || 1,
        price: item.price || 0,
        totalPrice: (item.price || 0) * (item.quantity || 1),
        name: pData.name || "Menu Item",
        description: pData.description || "Freshly prepared authentic cuisine choice.",
        imageUrl:
          pData.imageUrl ||
          pData.image ||
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
      };
    });

    return {
      id: rawOrder._id || rawOrder.id,
      orderId:
        rawOrder.razorpay_order_id ||
        rawOrder._id?.toString().slice(-6).toUpperCase() ||
        "ORD-TX",
      customerName: rawOrder.customer_name || "Guest Customer",
      phone: rawOrder.customer_phone || "N/A",
      address:
        typeof rawOrder.delivery_address === "object"
          ? rawOrder.delivery_address?.address_line
          : rawOrder.delivery_address || "Pickup / Dine-In",
      mohalla: rawOrder.mohalla || "N/A",
      status: backendStatus,
      paymentMethod: rawOrder.payment_method || "COD",
      paymentStatus: rawOrder.payment_status || "Pending",
      orderType: rawOrder.order_type || "delivery",
      createdAt: rawOrder.createdAt
        ? new Date(rawOrder.createdAt).toLocaleString("en-IN")
        : "N/A",
      total: rawOrder.total_amount || 0,
      items: processedItems,
    };
  }, [rawOrder]);

  const handleStatusChange = async (targetStatus) => {
    if (!order) return;
    try {
      await updateOrderStatus(order.id, targetStatus);
      setDropdownOpen(false);
    } catch (err) {
      console.error("Status update failed:", err);
      alert(err.response?.data?.message || "Unable to update order status");
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    if (!confirm("Delete this order permanently?")) return;

    try {
      await deleteOrder(order.id);
      navigate("/seller/orders");
    } catch (err) {
      console.error("Delete order failed:", err);
      alert(err.response?.data?.message || "Unable to delete order");
    }
  };

  if (isLoading && !order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500 font-semibold gap-3">
        <Loader2 className="animate-spin text-[#16522d]" /> Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-slate-500">
        <p className="font-bold">{error || "Order not found."}</p>
        <Button variant="outline" onClick={() => navigate("/seller/orders")}>
          <ArrowLeft size={18} /> Back to Orders
        </Button>
      </div>
    );
  }

  const normalizedStatus = order.status.toUpperCase();
  const isClosed = normalizedStatus === "DELIVERED" || normalizedStatus === "CANCELLED";
  const isNewOrder = normalizedStatus === "PENDING" || normalizedStatus === "UNASSIGNED";

  return (
    <motion.div
      className="mx-auto max-w-full space-y-6 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <Button variant="outline" onClick={() => navigate("/seller/orders")}><ArrowLeft size={18} /> Back</Button>
        <div className="flex items-center gap-4 text-right relative" ref={dropdownRef}>
          <div>
            <p className="text-xs text-slate-400 font-bold tracking-wide">ID: {order.id}</p>
            <h1 className="mt-1 text-2xl font-black text-slate-900">Order #{order.orderId}</h1>
            <span className="mt-2 inline-flex rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
              {order.status}
            </span>
          </div>

          {/* Action menu */}
          {(!isNewOrder && !isClosed) || isClosed ? (
            <div className="relative align-middle self-center mt-3">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              >
                <MoreVertical size={20} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-100 bg-white shadow-xl p-2 z-30 text-left"
                  >
                    {!isClosed && (
                      <>
                        <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Update Workflow</p>
                        {normalizedStatus === "PREPARING" && (
                          <button onClick={() => handleStatusChange("Ready")} className="w-full text-left px-3 py-2 text-sm font-semibold rounded-xl text-amber-700 hover:bg-amber-50 transition cursor-pointer">Mark Item Ready</button>
                        )}
                        {(normalizedStatus === "READY" || normalizedStatus === "PREPARING") && (
                          <button onClick={() => handleStatusChange("Out for Delivery")} className="w-full text-left px-3 py-2 text-sm font-semibold rounded-xl text-blue-700 hover:bg-blue-50 transition cursor-pointer">Out For Delivery</button>
                        )}
                        {normalizedStatus === "OUT FOR DELIVERY" && (
                          <button onClick={() => handleStatusChange("Delivered")} className="w-full text-left px-3 py-2 text-sm font-bold rounded-xl text-emerald-700 hover:bg-emerald-50 transition cursor-pointer">Mark As Delivered</button>
                        )}
                        <div className="border-t border-slate-100 my-1"></div>
                        <button onClick={() => handleStatusChange("Cancelled")} className="w-full text-left px-3 py-2 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 transition cursor-pointer">Cancel Order</button>
                      </>
                    )}

                    {isClosed && (
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 size={14} /> Delete Order
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : null}
        </div>
      </motion.div>

      {/* Info Grid */}
      <motion.div variants={itemVariants} className="grid gap-6 xl:grid-cols-3">
        <Card className="p-6 bg-white border border-slate-100 shadow-xs">
          <h2 className="mb-6 text-base font-bold uppercase tracking-wider text-slate-400">Customer Details</h2>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#16522d]/10 p-3"><User size={18} className="text-[#16522d]" /></div>
              <div><p className="text-xs text-slate-400 font-medium">Name</p><p className="font-bold text-slate-800">{order.customerName}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#16522d]/10 p-3"><Phone size={18} className="text-[#16522d]" /></div>
              <div><p className="text-xs text-slate-400 font-medium">Phone</p><p className="font-semibold text-slate-700">{order.phone}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-red-50 p-3"><MapPin size={18} className="text-red-500" /></div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Address</p>
                <p className="font-medium text-slate-700 text-sm leading-relaxed">{order.address}</p>
                <span className="mt-1.5 inline-block text-xs bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-500">Mohalla: {order.mohalla}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-slate-100 shadow-xs">
          <h2 className="mb-6 text-base font-bold uppercase tracking-wider text-slate-400">Logistics</h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="rounded-xl bg-green-50 p-3"><Calendar size={18} className="text-green-700" /></div><div><p className="text-xs text-slate-400">Timestamp</p><p className="font-semibold text-slate-700 text-sm">{order.createdAt}</p></div></div></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="rounded-xl bg-orange-50 p-3"><Truck size={18} className="text-orange-600" /></div><div><p className="text-xs text-slate-400">Order Type</p><p className="font-bold text-sm text-slate-700 uppercase">{order.orderType}</p></div></div></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="rounded-xl bg-purple-50 p-3"><CreditCard size={18} className="text-purple-600" /></div><div><p className="text-xs text-slate-400">Payment Method</p><p className="font-bold text-sm text-slate-700">{order.paymentMethod}</p></div></div></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="rounded-xl bg-cyan-50 p-3"><BadgeCheck size={18} className="text-cyan-700" /></div><div><p className="text-xs text-slate-400">Payment Status</p><span className="inline-flex rounded-full bg-yellow-50 border border-yellow-200 px-3 py-0.5 text-xs font-bold text-yellow-700 uppercase">{order.paymentStatus}</span></div></div></div>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-slate-100 shadow-xs">
          <h2 className="mb-6 text-base font-bold uppercase tracking-wider text-slate-400">Billing</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between"><span className="text-slate-500 text-sm font-medium">Subtotal</span><span className="font-bold text-slate-700">₹{order.total}</span></div>
            <div className="border-t border-slate-100 pt-4 mt-4">
              <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-base font-black text-slate-800">Grand Total</span><span className="text-3xl font-black text-[#16522d]">₹{order.total}</span></div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Items */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-white border border-slate-100 shadow-xs">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <Package className="text-amber-500" size={24} />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Ordered Items</h2>
              <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">{order.items.length} item(s)</p>
            </div>
          </div>

          {order.items.length === 0 ? (
            <p className="text-sm text-slate-500">No item details available.</p>
          ) : (
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.itemId} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center">
                    <img src={item.imageUrl} alt={item.name} className="h-24 w-24 rounded-2xl object-cover border border-slate-100 shadow-xs" />
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                        <span className="rounded-full bg-[#16522d]/10 px-3 py-0.5 text-xs font-semibold text-[#16522d]">Qty × {item.quantity}</span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.description}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Product ID: {item.productId}</p>
                    </div>

                    <div className="flex min-w-[200px] flex-row lg:flex-col justify-between rounded-xl bg-slate-50 p-4 border border-slate-100 gap-2">
                      <div className="text-sm text-slate-500 font-medium">
                        <div className="flex justify-between gap-4"><span>Unit Price:</span><span className="font-bold text-slate-700">₹{item.price}</span></div>
                        <div className="flex justify-between gap-4"><span>Qty:</span><span className="font-bold text-slate-700">× {item.quantity}</span></div>
                      </div>
                      <div className="lg:border-t lg:border-slate-200 lg:pt-2 mt-2 lg:mt-0 text-right lg:text-left">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Subtotal</p>
                        <p className="text-xl font-black text-[#16522d]">₹{item.totalPrice}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Sticky accept bar for new orders */}
      <AnimatePresence>
        {isNewOrder && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="sticky bottom-6 z-20"
          >
            <Card className="border border-slate-200 p-5 bg-white shadow-xl rounded-2xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Incoming Order</p>
                  <p className="text-base font-black text-slate-800 mt-0.5">Grand Total: <span className="text-[#16522d]">₹{order.total}</span></p>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" className="border-red-200 text-red-500 hover:bg-red-50" onClick={() => handleStatusChange("Cancelled")}>Reject</Button>
                  <Button className="bg-[#16522d] text-white hover:bg-[#114022]" onClick={() => handleStatusChange("Preparing")}>Accept Order</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isClosed && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-700">
            <CircleCheck size={18} /> Closed ({order.status})
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default OrderDetails;