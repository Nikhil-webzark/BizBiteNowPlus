import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bike, Phone, PackageCheck, Loader2 } from "lucide-react";

export default function AssignDeliveryModal({
  isOpen,
  onClose,
  order,
  deliveryBoys = [],
  onAssign,
}) {
  const [assigningId, setAssigningId] = useState(null);

  if (!isOpen || !order) return null;

  const handleAssignClick = async (boyId) => {
    if (!onAssign || !boyId) return;
    try {
      setAssigningId(boyId);
      await onAssign(boyId);
    } catch (error) {
      console.error("Failed to assign delivery partner:", error);
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 hover:bg-slate-100 cursor-pointer text-slate-500 hover:text-slate-700 transition"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="border-b p-6 pr-12">
            <h2 className="text-xl font-bold text-slate-800">
              Assign Delivery Partner
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Order #{order.orderId || order._id} &middot; {order.customer || order.customerName || "Customer"}
            </p>
            {order.address && (
              <p className="mt-1 text-xs text-slate-400 leading-relaxed truncate">
                {order.address}
              </p>
            )}
          </div>

          {/* Delivery boys list */}
          <div className="max-h-[60vh] space-y-3 overflow-y-auto p-6">
            {deliveryBoys.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <Bike size={28} className="mx-auto mb-3 text-slate-300" />
                <p className="font-medium text-slate-600">
                  No delivery partners online
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Ask a delivery partner to come online to assign this order.
                </p>
              </div>
            ) : (
              deliveryBoys.map((boy) => {
                const boyId = boy._id || boy.id;
                const isAssigning = assigningId === boyId;
                const displayPhone = boy.phone || boy.phoneNumber || "N/A";

                return (
                  <div
                    key={boyId}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#16522d]/10 font-bold text-[#16522d]">
                        {boy.name ? boy.name.charAt(0).toUpperCase() : "D"}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800">
                          {boy.name || "Delivery Partner"}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          {displayPhone !== "N/A" && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} /> {displayPhone}
                            </span>
                          )}

                          <span className="flex items-center gap-1">
                            <PackageCheck size={12} />
                            {boy.assignedOrders ?? 0} active
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAssignClick(boyId)}
                      disabled={isAssigning}
                      className="flex items-center gap-2 rounded-xl bg-[#16522d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#124324] disabled:cursor-not-allowed disabled:opacity-60 shrink-0 cursor-pointer"
                    >
                      {isAssigning ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        "Assign"
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}