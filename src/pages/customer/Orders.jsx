import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileOrders from "../../components/customer/orders/MobileOrders";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeader from "../../components/customer/common/SectionHeader";
import CompactHistoryCard from "../../components/customer/orders/CompactHistoryCard";
import CurrentOrderCard from "../../components/customer/orders/OrderCard";
import OrderHistoryCard from "../../components/customer/orders/OrderHistory";
import OrderTimeline from "../../components/customer/orders/OrderTimeline";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { getCurrentOrders, getOrderHistory } from "../../api/customerApi";

const Orders = () => {
  const navigate = useNavigate();

  const [currentOrders, setCurrentOrders] = useState([]);

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [reordering, setReordering] = useState(null);

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

  const handleViewOrder = (order) => {
    navigate(`/customer/orders/${order.id}`, {
      state: {
        order,
      },
    });
  };

useEffect(() => {
  const customerId = "CUSTOMER_001";

  const loadOrders = async () => {
    const [currentRes, historyRes] =
      await Promise.all([
        getCurrentOrders(customerId),
        getOrderHistory(customerId),
      ]);

    setCurrentOrders(currentRes.data.data || []);
    setHistory(historyRes.data.data || []);
  };

  loadOrders();

  const interval = setInterval(loadOrders, 30000);

  return () => clearInterval(interval);
}, []);


  return (
      <>
        {/* Mobile */}

    <div className="lg:hidden">
      <MobileOrders />
    </div>

    {/* Desktop */}

    <div className="hidden lg:block">
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="space-y-6"
    >
      <div
        className="
    w-full
    min-w-0
    max-w-[1760px]

    space-y-6
    pb-28

    px-1
    sm:px-2
    lg:px-10
  "
      >
      <div className="w-full flex items-center z-50  rounded-xl p-2 justify-between">
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

        <section className="space-y-5">
          <div
            className="
            flex
            items-center
            justify-between
          "
          >
            <h2 className="text-xl font-bold text-slate-900">Current Order</h2>

            <div
              className="
              flex
              items-center
              gap-2

              rounded-full

              bg-emerald-50

              px-3
              py-1

              text-sm

              font-semibold

              text-emerald-600
            "
            >
              <CheckCircle2 size={16} />
              Active
            </div>
          </div>

          {currentOrders.length === 0 ? (
            <div className="rounded-[28px] border-2 border-dashed border-slate-300 bg-white p-12 text-center">
              <ShoppingBag className="mx-auto text-slate-400" size={40} />

              <h3 className="mt-4 text-xl font-bold">No Active Orders</h3>

              <p className="mt-2 text-slate-500">
                You don't have any active orders.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentOrders.map((order) => (
                <div key={order.id} className="space-y-4">
                  <CurrentOrderCard
                    order={order}
                    onTrack={() =>
                      navigate(`/customer/orders/${order.id}`, {
                        state: { order },
                      })
                    }
                    onView={() => handleViewOrder(order)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* History */}

        <section className="space-y-5">
          <h2 className="text-xl font-bold text-slate-900">Order History</h2>

          {history.length === 0 ? (
            <div
              className="
                rounded-[28px]
                border-2
                border-dashed
                border-slate-300
                bg-white
                p-12
                text-center
              "
            >
              <ShoppingBag className="mx-auto text-slate-400" size={40} />

              <h3 className="mt-4 text-xl font-bold">No Previous Orders</h3>

              <p className="mt-2 text-slate-500">
                Your completed orders will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {history.map((order) => (
                <div
                  key={order.id}
                  className="
                        rounded-[28px]
                        
                      "
                >
                  {/* Desktop / Tablet */}

                  <div className="hidden md:block">
                    <OrderHistoryCard
                      order={order}
                      onView={() => handleViewOrder(order)}
                    />


                  </div>

                  {/* Mobile */}

                  <div className="md:hidden">
                    <CompactHistoryCard
                      order={order}
                      onView={() => handleViewOrder(order)}
                      onReorder={() => handleReorder(order)}
                      onRate={() => {
                        // Navigate to rating page or open rating modal
                      }}
                    />
                  </div>
                </div>
              ))}
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
