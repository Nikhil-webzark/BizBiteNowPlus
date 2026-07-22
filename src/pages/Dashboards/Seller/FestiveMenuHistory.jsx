import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarHeart,
  IndianRupee,
  ShoppingBag,
  Layers3,
  Search,
  Eye,
  Copy,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";

import useFestiveMenuStore from "../../../store/festiveMenuStore";

export default function FestiveMenuHistory() {
  const navigate = useNavigate();
  const { menus, loading, fetchMenus, duplicateMenu, deleteMenu } = useFestiveMenuStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMenus().catch(() => {});
  }, [fetchMenus]);

  // Case-Insensitive Status Filter
  const historyMenus = useMemo(() => {
    return menus.filter(
      (menu) => String(menu.status).toLowerCase() === "expired"
    );
  }, [menus]);

  const filteredMenus = useMemo(() => {
    return historyMenus.filter((menu) => {
      const query = search.toLowerCase();
      return (
        (menu.name && menu.name.toLowerCase().includes(query)) ||
        (menu.festival && menu.festival.toLowerCase().includes(query))
      );
    });
  }, [historyMenus, search]);

  const totalRevenue = filteredMenus.reduce((sum, m) => sum + (m.revenue || 0), 0);
  const totalOrders = filteredMenus.reduce((sum, m) => sum + (m.orders || 0), 0);
  const averageRevenue = filteredMenus.length > 0 ? Math.round(totalRevenue / filteredMenus.length) : 0;

  const handleDuplicate = async (id) => {
    try {
      await duplicateMenu(id);
      alert("Menu duplicated successfully as draft.");
      navigate("/seller/festivemenu");
    } catch (err) {
      alert(err?.response?.data?.message || "Unable to duplicate menu.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this festive menu?")) {
      try {
        await deleteMenu(id);
      } catch (err) {
        alert(err?.response?.data?.message || "Unable to delete menu.");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 p-6"
    >
      <button
        onClick={() => navigate("/seller/festivemenu")}
        className="mb-4 flex items-center bg-orange-100 gap-2 text-black rounded-xl p-3 hover:text-orange-600 transition cursor-pointer"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-orange-100 p-3"><CalendarHeart className="text-orange-600" /></div>
        <div>
          <h1 className="text-3xl text-black font-bold">Festive Menu History</h1>
          <p className="mt-1 text-slate-500">View previous expired menus and performance stats.</p>
        </div>
      </div>

      <div className="grid gap-5 text-black md:grid-cols-2 xl:grid-cols-4">
        <HistoryCard title="Historic Menus" value={filteredMenus.length} icon={<Layers3 />} />
        <HistoryCard title="Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={<IndianRupee />} />
        <HistoryCard title="Orders" value={totalOrders} icon={<ShoppingBag />} />
        <HistoryCard title="Average Revenue" value={`₹${averageRevenue.toLocaleString()}`} icon={<IndianRupee />} />
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search history..."
          className="w-full rounded-2xl border py-3 pl-11 pr-4 outline-none focus:border-green-700"
        />
      </div>

      <div className="overflow-hidden rounded-3xl text-black bg-white shadow">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-4 text-left">Festival</th>
              <th className="text-left">Duration</th>
              <th className="text-left">Revenue</th>
              <th className="text-left">Orders</th>
              <th className="text-left">Status</th>
              <th className="text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && menus.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center text-slate-500">Loading history...</td></tr>
            ) : filteredMenus.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center text-slate-500">No festive menu history found.</td></tr>
            ) : (
              filteredMenus.map((menu) => {
                const menuId = menu.id || menu._id;
                return (
                  <tr key={menuId} className="border-t transition hover:bg-slate-50">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                      
{menu.banner && menu.banner.trim() !== "" && (
  <img
    src={menu.banner}
    alt={menu.name || "Banner"}
    className="h-16 w-16 rounded-xl object-cover"
  />
)}
                        <div>
                          <h3 className="font-semibold text-slate-900">{menu.name}</h3>
                          <p className="text-sm text-slate-500">{menu.festival}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <p>{menu.goLive ? menu.goLive.split("T")[0] : "-"}</p>
                        <p className="text-slate-400">to</p>
                        <p>{menu.endsOn ? menu.endsOn.split("T")[0] : "-"}</p>
                      </div>
                    </td>
                    <td className="font-semibold text-emerald-700">₹{(menu.revenue || 0).toLocaleString()}</td>
                    <td>{menu.orders || 0}</td>
                    <td>
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase text-red-700">
                        {menu.status}
                      </span>
                    </td>
                    <td className="pr-6">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/seller/festivemenu/${menuId}`)} className="rounded-xl border p-3 hover:bg-slate-100 cursor-pointer"><Eye size={18} /></button>
                        <button onClick={() => handleDuplicate(menuId)} className="rounded-xl border p-3 hover:bg-slate-100 cursor-pointer"><Copy size={18} /></button>
                        <button onClick={() => handleDelete(menuId)} className="rounded-xl border border-red-200 p-3 text-red-600 hover:bg-red-50 cursor-pointer"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function HistoryCard({ title, value, icon }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold">{value}</h3>
        </div>
        <div className="rounded-2xl bg-green-100 p-4 text-green-700">{icon}</div>
      </div>
    </div>
  );
}