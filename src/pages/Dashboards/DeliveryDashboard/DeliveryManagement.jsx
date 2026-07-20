import { useEffect, useMemo, useState } from "react";
import useDeliveryBoyStore from "../../../store/deliveryBoyStore";

import DeliveryBoyTable from "../../../components/delivery/DeliveryBoyTable";
import DeliveryBoyForm from "../../../components/delivery/DeliveryBoyForm";
import DeleteDeliveryModal from "../../../components/delivery/DeleteDeliveryModal";
import AssignOrderModal from "../../../components/delivery/AssignOrderModal";
import AssignedOrdersTable from "../../../components/delivery/AssignedOrdersTable";

// Brand tokens
const INK = "#1A4D2E"; // deep green — primary
const GOLD = "#F8BD0D"; // signature accent — used sparingly

export default function DeliveryManagement() {
  const {
    deliveryBoys,
    loading,
    error,
    fetchDeliveryBoys,
    createDeliveryBoy,
    updateDeliveryBoy,
    toggleAvailability,
    deleteDeliveryBoy,
  } = useDeliveryBoyStore();

  // =============================
  // Search & Filter
  // =============================

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All"); // All | Available | Unavailable

  // =============================
  // Add/Edit Modal
  // =============================

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);

  // =============================
  // Delete Modal
  // =============================

  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedBoy, setSelectedBoy] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // =============================
  // Assign Order
  // =============================

  const [assignModal, setAssignModal] = useState(false);
  const [assignBoy, setAssignBoy] = useState(null);
  const [assignedOrders, setAssignedOrders] = useState([]);

  // =============================
  // Load delivery boys from backend on mount
  // =============================

  useEffect(() => {
    fetchDeliveryBoys().catch(() => {
      // error already captured in store; surfaced via `error` state below
    });
  }, [fetchDeliveryBoys]);

  // Assigned orders stay local for now (order/assign integration is separate)
  useEffect(() => {
    const loadOrders = () => {
      const orders = JSON.parse(localStorage.getItem("assignedOrders")) || [];

      setAssignedOrders(orders);
    };

    loadOrders();

    window.addEventListener("storage", loadOrders);

    return () => window.removeEventListener("storage", loadOrders);
  }, []);

  // =============================
  // Search + Filter
  // =============================

  const filteredDeliveryBoys = deliveryBoys.filter((boy) => {
    const matchSearch =
      boy.name?.toLowerCase().includes(search.toLowerCase()) ||
      boy.phoneNumber?.includes(search);

    const matchFilter =
      filter === "All"
        ? true
        : filter === "Available"
          ? boy.is_available
          : !boy.is_available;

    return matchSearch && matchFilter;
  });

  // =============================
  // Stats (Dribbble-style summary strip)
  // =============================

  const stats = useMemo(() => {
    const available = deliveryBoys.filter((b) => b.is_available).length;

    return {
      total: deliveryBoys.length,
      available,
      unavailable: deliveryBoys.length - available,
      onDelivery: assignedOrders.length,
    };
  }, [deliveryBoys, assignedOrders]);

  // =============================
  // Add / Update -> POST /deliveryBoy/create or PUT /deliveryBoy/update/:id
  // =============================

  const handleSave = async (data) => {
    setSaving(true);

    try {
      if (editData) {
        await updateDeliveryBoy(editData._id, {
          name: data.name,
          phoneNumber: data.phoneNumber,
          is_available: data.is_available,
        });
      } else {
        await createDeliveryBoy({
          name: data.name,
          phoneNumber: data.phoneNumber,
        });
      }

      setEditData(null);
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to save delivery boy.");
    } finally {
      setSaving(false);
    }
  };

  // =============================
  // Edit
  // =============================

  const handleEdit = (boy) => {
    setEditData(boy);
    setIsModalOpen(true);
  };

  // =============================
  // Available / Unavailable -> PUT /deliveryBoy/update/:id
  // =============================

  const handleToggleStatus = async (id) => {
    try {
      await toggleAvailability(id);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to update availability.");
    }
  };

  // =============================
  // Open Assign Modal
  // =============================

  const handleAssignClick = (boy) => {
    setAssignBoy(boy);
    setAssignModal(true);
  };

  // =============================
  // Assign Order (kept local/localStorage — order API integration is separate)
  // =============================

  const handleAssignOrder = (orderData) => {
    const newOrder = {
      id: Date.now(),
      orderId: orderData.orderId,
      customer: orderData.customer,
      items: orderData.items,
      address: orderData.address,
      deliveryBoy: assignBoy.name,
      deliveryBoyId: assignBoy._id,
      status: "Assigned",
    };

    const updatedOrders = [...assignedOrders, newOrder];

    setAssignedOrders(updatedOrders);
    localStorage.setItem("assignedOrders", JSON.stringify(updatedOrders));

    setAssignModal(false);
  };

  // =============================
  // Complete Order
  // =============================

  const handleCompleteOrder = (id) => {
    const updatedOrders = assignedOrders.filter((order) => order.id !== id);

    setAssignedOrders(updatedOrders);
    localStorage.setItem("assignedOrders", JSON.stringify(updatedOrders));
  };

  // =============================
  // Delete Delivery Boy
  // =============================

  const handleDeleteClick = (boy) => {
    setSelectedBoy(boy);
    setDeleteModal(true);
  };

  // =============================
  // Confirm Delete -> DELETE /deliveryBoy/delete/:id
  // =============================

  const confirmDelete = async () => {
    if (!selectedBoy) return;

    setDeleting(true);

    try {
      await deleteDeliveryBoy(selectedBoy._id);

      setDeleteModal(false);
      setSelectedBoy(null);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to delete delivery boy.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#1A4D2E]/60">
              Fleet
            </span>

            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Delivery Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track partners, assign orders, and keep deliveries moving.
            </p>
          </div>

          <button
            onClick={() => {
              setEditData(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 self-start rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
            style={{ backgroundColor: INK }}
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-xs"
              style={{ backgroundColor: GOLD, color: INK }}
            >
              +
            </span>
            Add Delivery Boy
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Stat strip */}

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Partners", value: stats.total },
            { label: "Available", value: stats.available, dot: "#22c55e" },
            { label: "Unavailable", value: stats.unavailable, dot: "#94a3b8" },
            { label: "Active Orders", value: stats.onDelivery, dot: GOLD },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-black/5 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center gap-1.5">
                {s.dot && (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: s.dot }}
                  />
                )}
                <p className="text-xs font-medium text-slate-500">
                  {s.label}
                </p>
              </div>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/10 md:w-80"
          />

          <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
            {["All", "Available", "Unavailable"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${filter === f
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Delivery Boy Table */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          {loading && deliveryBoys.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Loading delivery partners…
            </div>
          ) : (
            <DeliveryBoyTable
              deliveryBoys={filteredDeliveryBoys}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onToggleStatus={handleToggleStatus}
              onAssign={handleAssignClick}
            />
          )}
        </div>

        {/* Assigned Orders */}

        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <AssignedOrdersTable
            assignedOrders={assignedOrders}
            onComplete={handleCompleteOrder}
          />
        </div>

        {/* Add/Edit Modal */}

        <DeliveryBoyForm
          key={isModalOpen ? `form-${editData?._id || "new"}` : "form-closed"}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditData(null);
          }}
          onSave={handleSave}
          editData={editData}
          saving={saving}
        />

        {/* Delete Modal */}

        <DeleteDeliveryModal
          isOpen={deleteModal}
          onClose={() => {
            setDeleteModal(false);
            setSelectedBoy(null);
          }}
          onDelete={confirmDelete}
          deliveryBoy={selectedBoy}
          deleting={deleting}
        />

        {/* Assign Order Modal */}

        <AssignOrderModal
          key={assignModal ? `assign-${assignBoy?._id || "none"}` : "assign-closed"}
          isOpen={assignModal}
          onClose={() => setAssignModal(false)}
          onAssign={handleAssignOrder}
          deliveryBoy={assignBoy}
        />
      </div>
    </div>
  );
}