import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bike, Phone, Loader2 } from "lucide-react";

const INK = "#1A4D2E";

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
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="border-b border-slate-100 p-6 pr-12">
            <h2 className="text-lg font-semibold text-slate-900">
              Assign Delivery Partner
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Order #{order.orderId || order._id} &middot;{" "}
              {order.customer || order.customerName || "Customer"}
            </p>
            {order.address && (
              <p className="mt-1 truncate text-xs text-slate-400">
                {order.address}
              </p>
            )}
          </div>

          {/* Delivery boys list */}
          <div className="max-h-[60vh] space-y-3 overflow-y-auto p-6">
            {deliveryBoys.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <Bike size={26} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">
                  No delivery partners available
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Ask a delivery partner to mark themselves available to
                  assign this order.
                </p>
              </div>
            ) : (
              deliveryBoys.map((boy) => {
                const boyId = boy._id || boy.id;
                const isAssigning = assigningId === boyId;

                return (
                  <div
                    key={boyId}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: INK }}
                      >
                        {boy.name ? boy.name.charAt(0).toUpperCase() : "D"}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {boy.name || "Delivery Partner"}
                        </p>

                        <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                          {boy.phoneNumber && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} /> {boy.phoneNumber}
                            </span>
                          )}

                          <span
                            className="flex items-center gap-1 font-medium"
                            style={{ color: INK }}
                          >
                            Available
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAssignClick(boyId)}
                      disabled={isAssigning}
                      className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ backgroundColor: INK }}
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