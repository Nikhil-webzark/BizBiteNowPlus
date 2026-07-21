import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  IndianRupee,
  ShoppingBag,
  Package,
  Layers3,
  Pencil,
  Copy,
  Eye,
  Trash2,
  PauseCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import useFestiveMenuStore from "../../../store/festiveMenuStore";

export default function FestiveMenuDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    menus,
    loading,
    fetchMenus,
    deleteMenu,
    duplicateMenu,
    endMenu,
  } = useFestiveMenuStore();

  useEffect(() => {
    if (menus.length === 0) {
      fetchMenus().catch(() => {});
    }
  }, [menus.length, fetchMenus]);

  // Safe String Comparison for Mongo ObjectId & String IDs
  const menu = menus.find((item) => String(item.id || item._id) === String(id));

  const handleEdit = () => {
    if (menu) navigate(`/seller/festivemenu/edit/${menu.id}`);
  };

  const handleDuplicate = async () => {
    if (!menu) return;
    try {
      await duplicateMenu(menu.id);
      alert("Menu duplicated successfully!");
      navigate("/seller/festivemenu");
    } catch (err) {
      alert(err?.response?.data?.message || "Unable to duplicate menu");
    }
  };

  const handleDelete = async () => {
    if (!menu) return;
    if (window.confirm("Delete this festive menu?")) {
      try {
        await deleteMenu(menu.id);
        navigate("/seller/festivemenu");
      } catch (err) {
        alert(err?.response?.data?.message || "Unable to delete menu");
      }
    }
  };

  const handleEndMenu = async () => {
    if (!menu) return;
    if (window.confirm("End this festive menu?")) {
      try {
        await endMenu(menu.id);
        navigate("/seller/festivemenu");
      } catch (err) {
        alert(err?.response?.data?.message || "Unable to end menu");
      }
    }
  };

  const handlePreview = () => {
    alert("Customer Preview connected to storefront API.");
  };

  if (loading && !menu) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500 font-medium">
        Loading deal details...
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="flex min-h-[70vh] text-black items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800">Menu Not Found</h2>
          <button
            onClick={() => navigate("/seller/festivemenu")}
            className="mt-6 rounded-xl bg-[#1A4D2E] px-6 py-3 text-white cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = (menu.status || "draft").toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 p-6"
    >
      <button
        onClick={() => navigate("/seller/festivemenu")}
        className="flex items-center bg-orange-100 gap-2 text-black rounded-xl p-3 hover:text-orange-600 transition-colors cursor-pointer"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* Hero Header */}
      <div className="overflow-hidden rounded-3xl bg-white shadow">
       {menu.banner && menu.banner.trim() !== "" && (
  <img
    src={menu.banner}
    alt={menu.name || "Festive Banner"}
    className="h-[340px] w-full object-cover"
  />
)}

        <div className="space-y-5 p-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <span className="rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
                {currentStatus}
              </span>
              <h1 className="mt-4 text-4xl font-black text-slate-900">
                {menu.name}
              </h1>
              <p className="mt-3 max-w-3xl text-slate-600">
                {menu.description}
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={handlePreview} className="rounded-xl border p-3 hover:bg-slate-50 cursor-pointer"><Eye size={18} /></button>
              <button onClick={handleEdit} className="rounded-xl border p-3 hover:bg-slate-50 cursor-pointer"><Pencil size={18} /></button>
              <button onClick={handleDuplicate} className="rounded-xl border p-3 hover:bg-slate-50 cursor-pointer"><Copy size={18} /></button>
              <button onClick={handleDelete} className="rounded-xl border border-red-200 p-3 text-red-600 hover:bg-red-50 cursor-pointer"><Trash2 size={18} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Revenue" value={`₹${(menu.revenue || 0).toLocaleString()}`} icon={<IndianRupee />} />
        <StatCard title="Orders" value={menu.orders || 0} icon={<ShoppingBag />} />
        <StatCard title="Products" value={menu.totalProducts || 0} icon={<Package />} />
        <StatCard title="Combos" value={menu.totalCombos || 0} icon={<Layers3 />} />
      </div>

      {/* Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-7 shadow lg:col-span-2">
          <h2 className="mb-6 text-2xl font-bold">Menu Details</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <DetailItem icon={<CalendarDays />} label="Festival" value={menu.festival || "N/A"} />
            <DetailItem icon={<Clock3 />} label="Status" value={menu.status || "N/A"} />
            <DetailItem icon={<CalendarDays />} label="Starts" value={menu.goLive ? menu.goLive.split("T")[0] : "-"} />
            <DetailItem icon={<CalendarDays />} label="Ends" value={menu.endsOn ? menu.endsOn.split("T")[0] : "-"} />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-7 shadow">
          <h2 className="mb-6 text-2xl font-bold">Quick Actions</h2>
          <div className="space-y-4">
            <button onClick={handleEdit} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A4D2E] py-3 text-white cursor-pointer"><Pencil size={18} /> Edit Menu</button>
            <button onClick={handleDuplicate} className="flex w-full items-center justify-center gap-2 rounded-xl border py-3 cursor-pointer"><Copy size={18} /> Duplicate</button>
            <button onClick={handleEndMenu} className="flex w-full items-center justify-center gap-2 rounded-xl border py-3 cursor-pointer"><PauseCircle size={18} /> End Menu</button>
            <button onClick={handleDelete} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-red-600 cursor-pointer"><Trash2 size={18} /> Delete</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-black">{value}</h3>
        </div>
        <div className="rounded-2xl bg-green-100 p-4 text-green-700">{icon}</div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="rounded-2xl border p-5">
      <div className="mb-3 text-green-700">{icon}</div>
      <p className="text-sm text-slate-500">{label}</p>
      <h3 className="mt-1 text-lg font-semibold">{value}</h3>
    </div>
  );
}