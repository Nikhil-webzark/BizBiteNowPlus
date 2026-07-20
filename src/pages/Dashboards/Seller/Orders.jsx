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

// Store
import useOrderStore from "../../../store/orderStore";
import useDeliveryBoyStore from "../../../store/deliveryBoyStore";

// const INK = "#1A4D2E";

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

  const { deliveryBoys, fetchDeliveryBoys } = useDeliveryBoyStore();

  // Only delivery boys currently marked available get offered for assignment
  const availableDeliveryBoys = useMemo(
    () => (deliveryBoys || []).filter((boy) => boy.is_available),
    [deliveryBoys],
  );

  // ==========================
  // Normalize backend order shape -> shape the UI expects
  // ==========================
  const normalizedOrders = useMemo(() => {
    return (orders || []).map((o) => {
      const backendStatus = String(
        o.delivery_status || o.status || "Unassigned",
      ).trim();

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
        trackingStep:
          backendStatus.toUpperCase() === "DELIVERED"
            ? 4
            : backendStatus.toUpperCase() === "OUT FOR DELIVERY"
              ? 3
              : 1,
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

  // Fetch real delivery boys (GET /deliveryBoy/list) on mount
  useEffect(() => {
    fetchDeliveryBoys().catch((err) =>
      console.error("Failed to fetch delivery boys:", err),
    );
  }, [fetchDeliveryBoys]);

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

  // Dashboard metrics & tab counters
  const stats = useMemo(() => {
    return {
      total: normalizedOrders.length,
      pending: normalizedOrders.filter(
        (o) =>
          o.status.toUpperCase() === "PENDING" ||
          o.status.toUpperCase() === "UNASSIGNED",
      ).length,
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

  // FIX: Promise.resolve Async boundaries to resolve direct setState ESLint warnings
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
    }
  };

  const bulkUpdate = async (newStatus) => {
    try {
      await Promise.all(selectedOrders.map((id) => updateOrderStatus(id, newStatus)));
      await fetchOrders();
    } catch (err) {
      console.error("Bulk update failed:", err);
    } finally {
      setSelectedOrders([]);
    }
  };

  const handleAssignDelivery = async (boyId) => {
    const boy = deliveryBoys.find((item) => item._id === boyId || item.id === boyId);
    if (!boy || !selectedOrder) return;

    try {
      await assignOrder(selectedOrder.id, boyId);

      setAssignModal(false);
      setSelectedOrder(null);
      await fetchOrders();
    } catch (err) {
      console.error("Assign order failed:", err);
      alert(err.response?.data?.message || "Unable to assign order");
    }
  };

  const handleAssignClick = (order) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="space-y-6">
        <OrdersHeader
          totalOrders={normalizedOrders.length}
          boardView={boardView}
          setBoardView={setBoardView}
          onRefresh={fetchOrders}
          onExport={() => setExportOpen(true)}
        />

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
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

        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
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
        </div>

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
          <div className="rounded-2xl border border-black/5 bg-white py-16 text-center text-sm text-slate-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            Loading orders…
          </div>
        ) : (
          <>
            <OrdersTable
              orders={paginatedOrders}
              deliveryBoys={deliveryBoys}
              activeTab={activeTab}
              selectedOrders={selectedOrders}
              toggleOrder={toggleOrder}
              toggleAll={toggleAll}
              onView={openDrawer}
              onAccept={(id) => updateStatus(id, "Preparing")}
              onPreparing={(id) => updateStatus(id, "Preparing")}
              onReady={(id) => updateStatus(id, "Ready")}
              onDelivery={(id) => updateStatus(id, "Out for Delivery")}
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
          deliveryBoys={availableDeliveryBoys}
          onAssign={handleAssignDelivery}
        />
      </div>
    </motion.div>
  );
}