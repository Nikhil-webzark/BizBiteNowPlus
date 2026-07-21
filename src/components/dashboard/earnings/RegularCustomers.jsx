import { useMemo, useState } from "react";
import {
  Search, ArrowDownAZ, ArrowUpAZ, Crown, Medal, Award, Users, ShoppingBag, IndianRupee,
} from "lucide-react";

// 🔧 FIX: backend doesn't send a "status"/tier field, so it's derived here.
// Adjust these thresholds to match your actual loyalty tier logic.
const getTier = (totalSpent) => {
  if (totalSpent >= 20000) return "Gold";
  if (totalSpent >= 10000) return "Silver";
  return "Bronze";
};

// 🔧 FIX: backend sends lastOrderAt as a raw ISO date, not "Today"/"2 Days Ago"
const formatLastOrder = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} Days Ago`;
};

export default function RegularCustomers({ customers = [] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("spent");
  const [sortOrder, setSortOrder] = useState("desc");

  const filteredCustomers = useMemo(() => {
    // 🔧 FIX: field names — totalSpent/totalOrders/phone, and tier computed client-side
    const enriched = customers.map((c) => ({
      ...c,
      spent: c.totalSpent || 0,
      orders: c.totalOrders || 0,
      status: getTier(c.totalSpent || 0),
      lastOrder: formatLastOrder(c.lastOrderAt),
    }));

    const filtered = enriched.filter((customer) =>
      `${customer.name} ${customer.status}`.toLowerCase().includes(search.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      const direction = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "spent") return (a.spent - b.spent) * direction;
      return (a.orders - b.orders) * direction;
    });
  }, [customers, search, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const totalCustomers = filteredCustomers.length;
    const totalSpent = filteredCustomers.reduce((sum, c) => sum + c.spent, 0);
    const totalOrders = filteredCustomers.reduce((sum, c) => sum + c.orders, 0);
    const averageSpent = totalCustomers > 0 ? Math.round(totalSpent / totalCustomers) : 0;
    return { totalCustomers, totalSpent, totalOrders, averageSpent };
  }, [filteredCustomers]);

  const getBadge = (status) => {
    switch (status) {
      case "Gold":
        return { icon: Crown, className: "bg-yellow-100 text-yellow-700" };
      case "Silver":
        return { icon: Medal, className: "bg-[#FDFDF5] text-slate-700" };
      default:
        return { icon: Award, className: "bg-orange-100 text-orange-700" };
    }
  };

  return (
    <div className="rounded-3xl border text-black border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Regular Customers</h2>
          <p className="mt-1 text-slate-500">Your most valuable repeat customers.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer..."
              className="h-11 rounded-xl border border-slate-200 pl-11 pr-4 outline-none transition focus:border-violet-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 px-4 outline-none"
          >
            <option value="spent">Sort by Spending</option>
            <option value="orders">Sort by Orders</option>
          </select>
          <button
            onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
            className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 transition hover:border-violet-500 hover:text-violet-600"
          >
            {sortOrder === "desc" ? <><ArrowDownAZ size={18} />Desc</> : <><ArrowUpAZ size={18} />Asc</>}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white shadow-lg p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Customers</p>
            <Users className="text-violet-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">{stats.totalCustomers}</h2>
        </div>
        <div className="rounded-2xl bg-white shadow-lg p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Orders</p>
            <ShoppingBag className="text-emerald-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">{stats.totalOrders}</h2>
        </div>
        <div className="rounded-2xl bg-white shadow-lg p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Lifetime Spend</p>
            <IndianRupee className="text-blue-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">₹{stats.totalSpent.toLocaleString("en-IN")}</h2>
        </div>
        <div className="rounded-2xl bg-white shadow-lg p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Avg Spend</p>
            <Award className="text-orange-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">₹{stats.averageSpent.toLocaleString("en-IN")}</h2>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="mt-8 hidden xl:block">
        <div className="overflow-x-auto scrollbar-hide rounded-2xl border border-slate-200">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">Customer</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">Tier</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">Orders</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">Lifetime Spend</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">Last Order</th>
                <th className="px-5 py-4 text-right text-sm font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => {
                const badge = getBadge(customer.status);
                const BadgeIcon = badge.icon;
                return (
                  // 🔧 FIX: key is customer.phone (backend has no "id")
                  <tr key={customer.phone} className="border-t border-slate-100 transition hover:bg-slate-50">
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-700 text-lg font-bold text-white">
                          {customer.name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{customer.name}</h4>
                          <p className="text-sm text-slate-500">{customer.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                        <BadgeIcon size={14} />
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-5 py-5 font-semibold">{customer.orders}</td>
                    <td className="px-5 py-5 font-bold text-emerald-600">₹{customer.spent.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-5 text-slate-500">{customer.lastOrder}</td>
                    <td className="px-5 py-5 text-right">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          customer.status === "Gold"
                            ? "bg-green-100 text-green-700"
                            : customer.status === "Silver"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="mt-8 space-y-4 xl:hidden">
        {filteredCustomers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center">
            <Users size={48} className="mx-auto text-slate-400" />
            <h3 className="mt-4 text-xl font-bold text-slate-900">No Customers Found</h3>
            <p className="mt-2 text-slate-500">Try changing your search or sorting option.</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const badge = getBadge(customer.status);
            const BadgeIcon = badge.icon;
            return (
              <div key={customer.phone} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-500 text-lg font-bold text-white">
                      {customer.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{customer.name}</h3>
                      <p className="text-sm text-slate-500">{customer.phone}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                    <BadgeIcon size={14} />
                    {customer.status}
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Orders</p>
                    <h4 className="mt-2 text-2xl font-bold">{customer.orders}</h4>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Lifetime Spend</p>
                    <h4 className="mt-2 text-2xl font-bold text-emerald-600">₹{customer.spent.toLocaleString("en-IN")}</h4>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <div>
                    <p className="text-xs text-slate-500">Last Order</p>
                    <h4 className="mt-1 font-semibold text-slate-900">{customer.lastOrder}</h4>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Active</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="mt-8 hidden rounded-3xl border border-dashed border-slate-300 p-16 text-center xl:block">
          <Users size={56} className="mx-auto text-slate-400" />
          <h3 className="mt-5 text-2xl font-bold text-slate-900">No Customers Found</h3>
          <p className="mt-2 text-slate-500">No customers match your current search.</p>
        </div>
      )}
    </div>
  );
}