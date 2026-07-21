import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

// Core UI Components
import OrdersHeader from "../../../components/orders/OrdersHeader";
import OrderStats from "../../../components/orders/OrderStats";
import OrdersTabs from "../../../components/orders/OrderTabs";
import OrderFilters from "../../../components/orders/OrderFilters";
import OrdersTable from "../../../components/orders/OrdersTable";
import OrderPagination from "../../../components/orders/OrderPagination";
import OrderDrawer from "../../../components/orders/OrderDrawer";
import BulkActions from "../../../components/orders/BulkActions";
import ExportModal from "../../../components/orders/ExportModal";
import AssignDeliveryModal from "../../../components/delivery/AssignDeliveryModal";

import useOrderStore from "../../../store/orderStore";
import axiosInstance from "../../../api/axios";

// 🆕 5-step seller-side tracking, must match Order model's delivery_status enum
const STEP_ORDER = ["Pending", "Preparing", "Ready", "Out for Delivery", "Delivered"];

export default function Orders() {
  const {
    orders,
    isLoading,
    error,
    fetchOrders,
    updateOrderStatus,
    deleteOrder,
    assignOrder,
  } = useOrderStore();

  // Normalize backend order shape -> UI required shape
  const normalizedOrders = useMemo(() => {
    return (orders || []).map((o) => {
      const backendStatus = String(o.delivery_status || o.status || "Pending").trim();
      const stepIndex = STEP_ORDER.indexOf(backendStatus); // -1 for Cancelled / Ready for Pickup / Picked Up

      return {
        ...o,
        id: o._id || o.id,
        orderId:
          o.razorpay_order_id || o._id?.toString().slice(-6).toUpperCase() || "ORD-TX",
        customer: o.customer_name || "Guest Customer",
        phone: o.customer_phone || "N/A",
        address:
          typeof o.delivery_address === "object"
            ? o.delivery_address?.address_line
            : o.delivery_address || "",
        items: o.items || [],
        amount: o.total_amount ?? o.amount ?? 0,
        payment: o.payment_method || "COD",
        status: backendStatus,
        // 1 = Pending ... 5 = Delivered, matches STEP_ORDER (1-indexed for the UI)
        trackingStep: stepIndex >= 0 ? stepIndex + 1 : 1,
        createdAt: o.createdAt || new Date().toISOString(),
        deliveredAt: o.updatedAt,
        deliveryBoy: o.delivery_boy_name || "Unassigned",
        deliveryBoyId: o.delivery_boy_id || null,
      };
    });
  }, [orders]);

  const [activeTab, setActiveTab] = useState("new");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [payment, setPayment] = useState("All");
  const [sort, setSort] = useState("Newest");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [boardView, setBoardView] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Delivery boys — Array initialized
  const [deliveryBoys, setDeliveryBoys] = useState([]);

  // Fetch Delivery Boys with Array Validation Guard
  useEffect(() => {
    let isMounted = true;
    const loadDeliveryBoys = async () => {
      try {
        const res = await axiosInstance.get("/deliveryBoy/list");

        // Handle varied backend response formats safely
        const rawData =
          res.data?.data ||
          res.data?.deliveryBoys ||
          res.data?.deliveryBoy ||
          res.data;

        const list = Array.isArray(rawData) ? rawData : [];

        if (isMounted) {
          setDeliveryBoys(list);
          localStorage.setItem("deliveryBoys", JSON.stringify(list));
        }
      } catch (err) {
        console.error("Failed to fetch delivery partners list:", err);
        if (isMounted) setDeliveryBoys([]);
      }
    };

    loadDeliveryBoys();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        fetchOrders().catch((err) => console.error("Failed to fetch orders:", err));
      }
    });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter pipeline
  const filteredOrders = useMemo(() => {
    let data = [...normalizedOrders];

    if (activeTab === "new") {
      data = data.filter((order) => {
        const s = order.status.toUpperCase();
        return s !== "DELIVERED" && s !== "CANCELLED";
      });
    }

    if (activeTab === "completed") {
      data = data.filter((order) => {
        const s = order.status.toUpperCase();
        return s === "DELIVERED" || s === "CANCELLED";
      });
    }

    if (search.trim()) {
      const value = search.toLowerCase();
      data = data.filter(
        (order) =>
          order.orderId?.toLowerCase().includes(value) ||
          order.customer?.toLowerCase().includes(value) ||
          order.phone?.includes(value),
      );
    }

    if (status !== "All") data = data.filter((order) => order.status === status);
    if (payment !== "All") data = data.filter((order) => order.payment === payment);

    switch (sort) {
      case "Highest Amount":
        data.sort((a, b) => b.amount - a.amount);
        break;
      case "Lowest Amount":
        data.sort((a, b) => a.amount - b.amount);
        break;
      case "Oldest":
        data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return data;
  }, [normalizedOrders, activeTab, search, status, payment, sort]);

  // Dashboard metrics
  const stats = useMemo(() => {
    return {
      total: normalizedOrders.length,
      pending: normalizedOrders.filter((o) => o.status.toUpperCase() === "PENDING")
        .length,
      preparing: normalizedOrders.filter((o) => o.status.toUpperCase() === "PREPARING")
        .length,
      delivered: normalizedOrders.filter((o) => o.status.toUpperCase() === "DELIVERED")
        .length,
      revenue: normalizedOrders
        .filter((o) => o.status.toUpperCase() === "DELIVERED")
        .reduce((sum, order) => sum + (order.amount || 0), 0),
    };
  }, [normalizedOrders]);

  const newOrdersCount = useMemo(() => {
    return normalizedOrders.filter((o) => {
      const s = o.status.toUpperCase();
      return s !== "DELIVERED" && s !== "CANCELLED";
    }).length;
  }, [normalizedOrders]);

  const completedOrdersCount = useMemo(() => {
    return normalizedOrders.filter((o) => {
      const s = o.status.toUpperCase();
      return s === "DELIVERED" || s === "CANCELLED";
    }).length;
  }, [normalizedOrders]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / rowsPerPage));

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted && currentPage > totalPages) {
        setCurrentPage(totalPages);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentPage, totalPages]);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        setCurrentPage(1);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [activeTab, search, status, payment, sort]);

  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage,
    );
  }, [filteredOrders, currentPage, rowsPerPage]);

  const openDrawer = (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedOrder(null);
  };

  const toggleOrder = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
      return;
    }
    setSelectedOrders(paginatedOrders.map((order) => order.id));
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      await fetchOrders();
    } catch (err) {
      console.error("Status update failed:", err);
      alert(err.response?.data?.message || "Unable to update order status");
    }
  };

  // 🆕 New order comes in as "Pending" -> seller Accepts, starting the
  // 5-step tracking at "Preparing". Reject reuses the existing onCancel
  // path below since OrderActionModal only exposes cancelOrder, not a
  // separate reject action — same underlying "Cancelled" status either way.
  const handleAcceptOrder = (id) => updateStatus(id, "Preparing");

  const bulkUpdate = async (newStatus) => {
    try {
      await Promise.all(selectedOrders.map((id) => updateOrderStatus(id, newStatus)));
      await fetchOrders();
    } catch (err) {
      console.error("Bulk update failed:", err);
      alert(err.response?.data?.message || "Unable to update selected orders");
    } finally {
      setSelectedOrders([]);
    }
  };

  // 🚀 WhatsApp Redirection on Assign Click
  const handleAssignDelivery = async (boyId) => {
    const safeBoys = Array.isArray(deliveryBoys) ? deliveryBoys : [];
    const boy = safeBoys.find((item) => item.id === boyId || item._id === boyId);
    if (!boy || !selectedOrder) return;

    try {
      const res = await assignOrder(selectedOrder.id, boyId);

      // 📲 Auto open WhatsApp with pre-filled details & location
      const waUrl = res?.whatsappUrl || res?.data?.whatsappUrl;
      if (waUrl) {
        window.open(waUrl, "_blank");
      }

      setDeliveryBoys((prev) =>
        (Array.isArray(prev) ? prev : []).map((item) =>
          item.id === boyId || item._id === boyId
            ? { ...item, assignedOrders: (item.assignedOrders || 0) + 1 }
            : item,
        ),
      );

      // Assigning a delivery partner IS the "Out for Delivery" step —
      // move the order forward unless the backend already did this.
      if (selectedOrder.status !== "Out for Delivery") {
        try {
          await updateOrderStatus(selectedOrder.id, "Out for Delivery");
        } catch (statusErr) {
          console.error("Failed to advance status after assign:", statusErr);
        }
      }

      setAssignModal(false);
      setSelectedOrder(null);
      await fetchOrders();
    } catch (err) {
      console.error("Assign order failed:", err);
      alert(err.response?.data?.message || "Unable to assign order");
    }
  };

  const handleAssignClick = (orderOrId) => {
    const order =
      orderOrId && typeof orderOrId === "object"
        ? orderOrId
        : normalizedOrders.find((o) => o.id === orderOrId);
    if (!order) return;
    setSelectedOrder(order);
    setAssignModal(true);
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm("Delete this order permanently?")) return;

    try {
      await deleteOrder(id);
    } catch (err) {
      console.error("Delete order failed:", err);
      alert(err.response?.data?.message || "Unable to delete order");
    }
  };

  const handleReset = () => {
    setSearch("");
    setStatus("All");
    setPayment("All");
    setSort("Newest");
    setCurrentPage(1);
  };

  const exportOrders = (month) => {
    console.log("Export PDF:", month);
  };

  const autoCancelOrder = (order) => {
    updateStatus(order.id, "Cancelled");
  };

  // Safe delivery boys array reference
  const safeDeliveryBoysList = Array.isArray(deliveryBoys) ? deliveryBoys : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="space-y-8">
        <OrdersHeader
          totalOrders={normalizedOrders.length}
          boardView={boardView}
          setBoardView={setBoardView}
          onRefresh={fetchOrders}
          onExport={() => setExportOpen(true)}
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <OrderStats stats={stats} />

        <OrdersTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          newOrders={newOrdersCount}
          completedOrders={completedOrdersCount}
        />

        <OrderFilters
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          payment={payment}
          setPayment={setPayment}
          sort={sort}
          setSort={setSort}
          onReset={handleReset}
        />

        <BulkActions
          selectedCount={selectedOrders.length}
          onClear={() => setSelectedOrders([])}
          onAccept={() => bulkUpdate("Preparing")}
          onPreparing={() => bulkUpdate("Preparing")}
          onReady={() => bulkUpdate("Ready")}
          onDelivery={() => bulkUpdate("Out for Delivery")}
          onDelivered={() => bulkUpdate("Delivered")}
          onCancel={() => bulkUpdate("Cancelled")}
        />

        {isLoading && normalizedOrders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-slate-500 font-medium">
            Loading orders...
          </div>
        ) : (
          <>
            <OrdersTable
              orders={paginatedOrders}
              deliveryBoys={safeDeliveryBoysList}
              activeTab={activeTab}
              selectedOrders={selectedOrders}
              toggleOrder={toggleOrder}
              toggleAll={toggleAll}
              onView={openDrawer}
              onAccept={(id) => handleAcceptOrder(id)}
              onPreparing={(id) => updateStatus(id, "Preparing")}
              onReady={(id) => updateStatus(id, "Ready")}
              onDelivery={(id) => handleAssignClick(id)}
              onDelivered={(id) => updateStatus(id, "Delivered")}
              onCancel={(id) => updateStatus(id, "Cancelled")}
              onAssign={handleAssignClick}
              onDelete={handleDeleteOrder}
            />
            <OrderPagination
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalOrders={filteredOrders.length}
              onPageChange={setCurrentPage}
              onRowsChange={(rows) => {
                setRowsPerPage(rows);
                setCurrentPage(1);
              }}
            />
          </>
        )}

        <OrderDrawer
          open={drawerOpen}
          order={selectedOrder}
          onClose={closeDrawer}
          onExpire={autoCancelOrder}
        />
        <ExportModal
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          onExport={exportOrders}
        />
        <AssignDeliveryModal
          isOpen={assignModal}
          onClose={() => setAssignModal(false)}
          order={selectedOrder}
          deliveryBoys={safeDeliveryBoysList.filter((boy) => {
            // 1. Agar DB mein status field hi nahi hai, toh default show hone do
            if (!boy.status && boy.isOnline === undefined) return true;

            // 2. Case-insensitive & multi-status match
            const s = String(boy.status || "").toLowerCase();
            return (
              s === "online" ||
              s === "active" ||
              s === "available" ||
              boy.isOnline === true
            );
          })}
          onAssign={handleAssignDelivery}
        />
      </div>
    </motion.div>
  );
}