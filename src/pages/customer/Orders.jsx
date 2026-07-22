import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, CheckCircle2, ShoppingBag } from "lucide-react";

import MobileOrders from "../../components/customer/orders/MobileOrders";
import CurrentOrderCard from "../../components/customer/orders/OrderCard";
import OrderHistoryCard from "../../components/customer/orders/OrderHistory";
import CompactHistoryCard from "../../components/customer/orders/CompactHistoryCard";
import OrderSkeleton from "../../components/customer/skeleton/OrderSkeleton";
import SectionHeader from "../../components/customer/common/SectionHeader";

import useOrderStore from "../../api/stores/customerstore/orderStore";

const Orders = () => {
  const navigate = useNavigate();

  const {
    loading,
    error,
    fetchOrders,
    reorder,
    getCurrentOrders,
    getOrderHistory,
  } = useOrderStore();

  const [reordering, setReordering] = useState(null);
  const isFetchingRef = useRef(false);

  const currentOrders = getCurrentOrders ? getCurrentOrders() : [];
  const orderHistory = getOrderHistory ? getOrderHistory() : [];

  // 🛡️ Strict single-fetch effect with mount guard
  useEffect(() => {
    let isMounted = true;

    const executeFetch = async () => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      try {
        await fetchOrders();
      } catch (err) {
        if (isMounted) console.error("Orders fetch error:", err);
      } finally {
        isFetchingRef.current = false;
      }
    };

    executeFetch();

    // Clean 30-second polling
    const timer = setInterval(() => {
      if (isMounted) executeFetch();
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Strictly empty dependency array

  const handleViewOrder = (order) => {
    const orderId = order.id || order._id;
    navigate(`/customer/orders/${orderId}`, {
      state: { order },
    });
  };

  const handleReorder = async (order) => {
    const orderId = order.id || order._id;
    try {
      setReordering(orderId);
      await reorder({ orderId });
      navigate("/customer/cart");
    } catch (err) {
      console.error("Reorder failed:", err);
    } finally {
      setReordering(null);
    }
  };

  if (loading?.fetchOrders && currentOrders.length === 0 && orderHistory.length === 0) {
    return <OrderSkeleton />;
  }

  if (error && currentOrders.length === 0 && orderHistory.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={44} className="mx-auto text-red-500" />
          <h2 className="mt-4 text-2xl font-bold">Failed to load orders</h2>
          <p className="mt-2 text-slate-500">
            {typeof error === "string"
              ? error
              : error?.message || "Something went wrong."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <MobileOrders
          onTrack={(order) => handleViewOrder(order)}
          onView={(order) => handleViewOrder(order)}
          onReorder={(order) => handleReorder(order)}
        />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <div className="w-full min-w-0 max-w-[1760px] space-y-6 pb-28 px-1 sm:px-2 lg:px-10">
            <div className="flex w-full items-center justify-between rounded-xl p-2">
              <SectionHeader
                title="Your Orders"
                subtitle="Track your orders in real time"
              />

              <Link
                to="/customer/notifications"
                className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200 transition hover:bg-slate-300"
              >
                <Bell size={22} className="text-slate-700" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  3
                </span>
              </Link>
            </div>

            {/* Active Orders */}
            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Current Orders
                </h2>

                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
                  <CheckCircle2 size={16} />
                  <span>{currentOrders.length} Active</span>
                </div>
              </div>

              {currentOrders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-[28px] border-2 border-dashed border-slate-300 bg-white p-14 text-center"
                >
                  <ShoppingBag className="mx-auto text-slate-400" size={44} />
                  <h3 className="mt-5 text-2xl font-bold text-slate-900">
                    No Active Orders
                  </h3>
                  <p className="mt-2 text-slate-500">
                    Your active restaurant orders will appear here once you place an order.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {currentOrders.map((order) => {
                    const orderId = order.id || order._id;
                    return (
                      <motion.div
                        key={orderId}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CurrentOrderCard
                          order={order}
                          loading={reordering === orderId}
                          onTrack={() => handleViewOrder(order)}
                          onView={() => handleViewOrder(order)}
                          onReorder={() => handleReorder(order)}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Order History */}
            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Order History
                </h2>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                  {orderHistory.length} Orders
                </span>
              </div>

              {orderHistory.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-[28px] border-2 border-dashed border-slate-300 bg-white p-14 text-center"
                >
                  <ShoppingBag className="mx-auto text-slate-400" size={44} />
                  <h3 className="mt-5 text-2xl font-bold text-slate-900">
                    No Previous Orders
                  </h3>
                  <p className="mt-2 text-slate-500">
                    Your completed and cancelled orders will appear here.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-5">
                  {orderHistory.map((order, index) => {
                    const orderId = order.id || order._id;
                    return (
                      <motion.div
                        key={orderId}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="rounded-[28px]"
                      >
                        <div className="hidden md:block">
                          <OrderHistoryCard
                            order={order}
                            loading={reordering === orderId}
                            onView={() => handleViewOrder(order)}
                            onReorder={() => handleReorder(order)}
                          />
                        </div>

                        <div className="md:hidden">
                          <CompactHistoryCard
                            order={order}
                            loading={reordering === orderId}
                            onView={() => handleViewOrder(order)}
                            onReorder={() => handleReorder(order)}
                            onRate={() => {}}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Orders;