import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  CheckCircle2,
  Bell,
} from "lucide-react";
import HorizontalSection from "../home/HorizontalSection";
import SectionHeader from "../common/SectionHeader";
import MobileOrdersSkeleton from "../../../components/customer/skeleton/MobileOrdersSkeleton";
import MobileCurrentCard from "./MobileCurrentCard";
import MobileTimeline from "./MobileTimeline";
import ContactDeliveryCard from "./ContactDeliveryCard";
import CompactHistoryCard from "./CompactHistoryCard";
import CurrentOrderSection from "./CurrentOrderSection";

import {
  getCurrentOrders,
  getOrderHistory,
} from "../../../api/customerApi";

const MobileOrders = () => {
  const navigate = useNavigate();

  const [currentOrders, setCurrentOrders] =
    useState([]);

  const [history, setHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [reordering, setReordering] =
    useState(null);

  const handleViewOrder = (order) => {
    navigate(`/customer/orders/${order.id}`, {
      state: {
        order,
      },
    });
  };

  const handleReorder = (order) => {
    setReordering(order.id);

    setTimeout(() => {
      setReordering(null);

      navigate("/customer/cart", {
        state: {
          reorder: order,
        },
      });
    }, 500);
  };

useEffect(() => {
  const customerId = "CUSTOMER_001";

  const loadOrders = async () => {
    try {
      const [currentRes, historyRes] = await Promise.all([
        getCurrentOrders(customerId),
        getOrderHistory(customerId),
      ]);

      setCurrentOrders(currentRes.data?.data || []);
      setHistory(historyRes.data?.data || []);
    } catch (error) {
      console.log("Orders API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  loadOrders();

  // Refresh every 5 seconds
  const interval = setInterval(loadOrders, 5000);

  return () => clearInterval(interval);
}, []);

if (loading) {
  return <MobileOrdersSkeleton />;
}
    return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
      }}
      className="space-y-5 pb-24"
    >
      <div className="px-1">

<div className="w-full flex items-center  mt-5 z-50 rounded-xl p-2 justify-between">
  <SectionHeader
    title="Your Orders"
    subtitle="Track your orders in real time"
  />

  <Link
            to="/customer/notifications"
            className="
    relative
    flex
    h-11
    w-11
    items-center
    justify-center
    rounded-xl
    bg-slate-200
    transition
    hover:bg-slate-300
  "
          >
            <Bell size={22} className="text-slate-700" />

            <span
              className="
      absolute
      -right-1
      -top-1
      flex
      h-5
      w-5
      items-center
      justify-center
      rounded-full
      bg-red-500
      text-[10px]
      font-bold
      text-white
    "
            >
              3
            </span>
          </Link>
</div>

        {/* Current Order */}

        {currentOrders.length > 0 && (
          <section className="mt-6">



            <div className="space-y-5">
<CurrentOrderSection
  title="Current Orders"
  subtitle={`${currentOrders.length} Active Orders`}
>
  {currentOrders.map((order) => (
    <div
      key={order.id}
        className="
    snap-center
    shrink-0

    w-full
    max-w-full

    space-y-4

    rounded-[14px]
    bg-white
    shadow-sm
  "
    >
      <MobileCurrentCard
        order={order}
        onView={() => handleViewOrder(order)}
        onReorder={() => handleReorder(order)}
      />

      <div className="my-4 border-t border-slate-200" />

      <MobileTimeline
        timeline={order.tracking?.steps || []}
        currentStep={order.tracking?.currentStep}
      />

      <ContactDeliveryCard order={order} />
    </div>
  ))}
</CurrentOrderSection>
            
            </div>

          </section>
        )}

        {/* Divider */}

        <div
          className="
            my-6
            flex
            justify-center
          "
        >
          <div
            className="
              h-1.5
              w-16
              rounded-full
              bg-slate-300
            "
          />
        </div>
                {/* Order History */}

        <section className="space-y-4">

          <div className="flex items-center justify-between">

            <h2 className="text-lg font-bold text-slate-900">
              Order History
            </h2>

            {history.length > 0 && (
              <span className="text-xs font-medium text-slate-500">
                {history.length} Orders
              </span>
            )}

          </div>

          {history.length === 0 ? (
            <div
              className="
                rounded-2xl
                border-2
                border-dashed
                border-slate-300
                bg-white
                px-6
                py-10
                text-center
              "
            >
              <ShoppingBag
                size={34}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-3 text-lg font-bold">
                No Previous Orders
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your completed orders will appear here.
              </p>

            </div>
          ) : (
            <div
              className="
                space-y-3
                pb-8
              "
            >
              {history.map((order) => (
                <CompactHistoryCard
                  key={order.id}
                  order={order}
                  loading={
                    reordering === order.id
                  }
                  onView={() =>
                    handleViewOrder(order)
                  }
                  onRate={() => {
                    console.log(
                      "Rate Order",
                      order.id
                    );
                  }}
                  onReorder={() =>
                    handleReorder(order)
                  }
                />
              ))}
            </div>
          )}

        </section>

      </div>
    </motion.div>
  );
};

export default MobileOrders;