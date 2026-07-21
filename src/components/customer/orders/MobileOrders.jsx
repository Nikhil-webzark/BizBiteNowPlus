import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Bell,
} from "lucide-react";

import SectionHeader from "../common/SectionHeader";
import MobileOrdersSkeleton from "../../../components/customer/skeleton/MobileOrdersSkeleton";
import MobileCurrentCard from "./MobileCurrentCard";
import MobileTimeline from "./MobileTimeline";
import ContactDeliveryCard from "./ContactDeliveryCard";
import CompactHistoryCard from "./CompactHistoryCard";
import CurrentOrderSection from "./CurrentOrderSection";

import useOrderStore from "../../../api/stores/customerstore/orderStore";

const MobileOrders = () => {
  const navigate = useNavigate();

  const {
    orders,
    loading,
    error,
    fetchOrders,
    reorder,
    getCurrentOrders,
    getOrderHistory,
  } = useOrderStore();

  const [reordering, setReordering] =
    useState(null);

  const currentOrders =
    getCurrentOrders();

  const history =
    getOrderHistory();

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () =>
      clearInterval(interval);
  }, [fetchOrders]);

  const handleViewOrder = (
    order
  ) => {
    navigate(
      `/customer/orders/${order.id}`,
      {
        state: {
          order,
        },
      }
    );
  };

  const handleReorder = async (
    order
  ) => {
    try {
      setReordering(order.id);

      await reorder({
        orderId: order.id,
      });

      navigate("/customer/cart");
    } catch (err) {
      console.error(err);
    } finally {
      setReordering(null);
    }
  };

  if (loading.fetchOrders) {
    return (
      <MobileOrdersSkeleton />
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="text-center">
          <ShoppingBag
            size={42}
            className="mx-auto text-red-500"
          />

          <h2 className="mt-4 text-xl font-bold">
            Failed to load orders
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error.message ||
              "Something went wrong."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
      }}
      className="space-y-5 pb-24"
    >
      <div className="px-1">
        <div className="mt-5 flex w-full items-center justify-between rounded-xl p-2">
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
            <Bell
              size={22}
              className="text-slate-700"
            />

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
                {/* Current Orders */}

        {currentOrders.length > 0 && (
          <section className="mt-6">
            <CurrentOrderSection
              title="Current Orders"
              subtitle={`${currentOrders.length} Active Orders`}
            >
              {currentOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="
                    w-full
                    max-w-full
                    snap-center
                    shrink-0
                    space-y-4
                    rounded-[14px]
                    bg-white
                    shadow-sm
                  "
                >
                  <MobileCurrentCard
                    order={order}
                    loading={
                      reordering === order.id
                    }
                    onView={() =>
                      handleViewOrder(order)
                    }
                    onReorder={() =>
                      handleReorder(order)
                    }
                  />

                  <div className="my-4 border-t border-slate-200" />

                  <MobileTimeline
                    timeline={
                      order.tracking?.steps || []
                    }
                    currentStep={
                      order.tracking?.currentStep
                    }
                  />

                  <ContactDeliveryCard
                    order={order}
                  />
                </motion.div>
              ))}
            </CurrentOrderSection>
          </section>
        )}

        {/* Divider */}

        <div className="my-6 flex justify-center">
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
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
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
                Your completed and cancelled
                orders will appear here.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3 pb-8">
              {history.map(
                (order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        index * 0.05,
                      duration: 0.25,
                    }}
                  >
                    <CompactHistoryCard
                      order={order}
                      loading={
                        reordering ===
                        order.id
                      }
                      onView={() =>
                        handleViewOrder(
                          order
                        )
                      }
                      onRate={() => {}}
                      onReorder={() =>
                        handleReorder(
                          order
                        )
                      }
                    />
                  </motion.div>
                )
              )}
            </div>
          )}
        </section>
              </div>
    </motion.div>
  );
};

export default MobileOrders;