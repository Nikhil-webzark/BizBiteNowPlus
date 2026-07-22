import { useState } from "react";
import {
  CalendarDays,
  Package,
  Boxes,
  IndianRupee,
  ShoppingBag,
  Pencil,
  CalendarClock,
  Copy,
  Trash2,
  X,
} from "lucide-react";

import FestiveStatusBadge from "./FestiveStatusBadge";
import useFestiveMenuStore from "../../../store/festiveMenuStore";

const FestiveMenuTable = ({
  menus = [],
  onDuplicate,
  onDelete,
  onEdit,
}) => {
  const { updateMenu } = useFestiveMenuStore();

  // Naya Schedule Modal State
  const [selectedMenuForSchedule, setSelectedMenuForSchedule] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!menus.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
        <h3 className="text-xl font-semibold text-slate-700">
          No Festive Menu Found
        </h3>
        <p className="mt-2 text-slate-500">
          Create your first festive menu to get started.
        </p>
      </div>
    );
  }

  // 🎯 Yellow Schedule Icon Click Handler (Purane External Handler Ko Bypass Karke Sirf Naya Modal Kholega)
  const handleScheduleClick = (menu) => {
    setSelectedMenuForSchedule(menu);
    setStartDate(menu.goLive ? menu.goLive.split("T")[0] : "");
    setEndDate(menu.endsOn ? menu.endsOn.split("T")[0] : "");
  };

  // Backend Save & UI Live Refresh
  const handleSaveSchedule = async () => {
    if (!selectedMenuForSchedule) return;
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    try {
      setIsUpdating(true);
      await updateMenu(selectedMenuForSchedule.id, {
        ...selectedMenuForSchedule,
        goLive: `${startDate}T00:00:00`,
        endsOn: `${endDate}T23:59:59`,
      });

      alert("Schedule updated successfully!");
      setSelectedMenuForSchedule(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update schedule");
    } finally {
      setIsUpdating(false);
    }
  };

  // Single-line Date Formatter (21/07/2026)
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("en-IN");
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Table Header */}
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-bold text-slate-900">Festive Menus</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage all festive menus from one place.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr className="text-left">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                Festival
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                Status
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                Products
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                Revenue
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                Orders
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                Schedule
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600 whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {menus.map((menu) => (
              <tr
                key={menu.id}
                className="border-t border-slate-100 transition hover:bg-slate-50"
              >
                {/* Festival Name & Banner */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4 min-w-[220px]">
                    {menu.banner && menu.banner.trim() !== "" ? (
                      <img
                        src={menu.banner}
                        alt={menu.name}
                        className="h-14 w-14 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-400">
                        No Img
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {menu.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                        {menu.description}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Dynamic Status Badge */}
                <td className="px-6 py-5 whitespace-nowrap">
                  <FestiveStatusBadge status={menu.status} />
                </td>

                {/* Products Count */}
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Package size={16} className="shrink-0" />
                      <span>{menu.totalProducts || menu.products?.length || 0} Products</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Boxes size={14} className="shrink-0" />
                      <span>{menu.totalCombos || 0} Combos</span>
                    </div>
                  </div>
                </td>

                {/* Revenue */}
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-1 font-semibold text-[#1A4D2E]">
                    <IndianRupee size={16} />
                    <span>{(menu.revenue || 0).toLocaleString()}</span>
                  </div>
                </td>

                {/* Orders */}
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-2 font-medium">
                    <ShoppingBag size={16} />
                    <span>{menu.orders || 0}</span>
                  </div>
                </td>

                {/* Schedule Display */}
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="space-y-1 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={15} className="shrink-0 text-slate-400" />
                      <span>{formatDate(menu.goLive)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarClock size={15} className="shrink-0 text-slate-400" />
                      <span>{formatDate(menu.endsOn)}</span>
                    </div>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    {/* Edit */}
                    <button
                      onClick={() => onEdit?.(menu)}
                      className="rounded-lg p-2 transition hover:bg-blue-100 cursor-pointer"
                      title="Edit Menu"
                    >
                      <Pencil size={18} className="text-blue-600" />
                    </button>

                    {/* 🎯 Yellow Schedule Icon (Sirf Naya Modal Kholega) */}
                    <button
                      onClick={() => handleScheduleClick(menu)}
                      className="rounded-lg p-2 transition hover:bg-amber-100 cursor-pointer"
                      title="Reschedule Menu"
                    >
                      <CalendarClock size={18} className="text-amber-500" />
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => onDuplicate?.(menu)}
                      className="rounded-lg p-2 transition hover:bg-green-100 cursor-pointer"
                      title="Duplicate Menu"
                    >
                      <Copy size={18} className="text-green-600" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete?.(menu)}
                      className="rounded-lg p-2 transition hover:bg-red-100 cursor-pointer"
                      title="Delete Menu"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🎯 Naya Quick Schedule Update Modal */}
      {selectedMenuForSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-800">
                Reschedule: {selectedMenuForSchedule.name}
              </h3>
              <button
                onClick={() => setSelectedMenuForSchedule(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Start Date (Go Live)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#1A4D2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  End Date (Ends On)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#1A4D2E]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedMenuForSchedule(null)}
                className="rounded-xl border px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                disabled={isUpdating}
                className="rounded-xl bg-[#1A4D2E] px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FestiveMenuTable;