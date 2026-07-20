import { useMemo, useState } from "react";
import {
  Search, CalendarDays, ArrowDownAZ, ArrowUpAZ, IndianRupee, ShoppingBag, TrendingUp,
} from "lucide-react";

export default function EarningsHistory({ history = [] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");

  const filteredHistory = useMemo(() => {
    const data = history.filter((item) => item.date.toLowerCase().includes(search.toLowerCase()));
    return [...data].sort((a, b) =>
      sort === "latest" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
    );
  }, [history, search, sort]);

  const stats = useMemo(() => {
    // 🔧 FIX: backend fields are totalEarnings / totalOrders, not revenue / orders
    const totalRevenue = filteredHistory.reduce((sum, item) => sum + (item.totalEarnings || 0), 0);
    const totalOrders = filteredHistory.reduce((sum, item) => sum + (item.totalOrders || 0), 0);
    const averageRevenue = filteredHistory.length > 0 ? Math.round(totalRevenue / filteredHistory.length) : 0;

    const highestDay = filteredHistory.reduce(
      (prev, current) => ((current.totalEarnings || 0) > (prev.totalEarnings || 0) ? current : prev),
      filteredHistory[0] || { totalEarnings: 0, date: "-" }
    );

    return { totalRevenue, totalOrders, averageRevenue, highestDay };
  }, [filteredHistory]);

  return (
    <div className="rounded-3xl text-black border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Earnings History</h2>
          <p className="mt-1 text-slate-500">Browse historical earnings and revenue performance.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search date..."
              className="h-11 rounded-xl border border-slate-200 pl-11 pr-4 outline-none transition focus:border-violet-500"
            />
          </div>
          <button
            onClick={() => setSort(sort === "latest" ? "oldest" : "latest")}
            className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 transition hover:border-violet-500 hover:text-violet-600"
          >
            {sort === "latest" ? <><ArrowDownAZ size={18} />Latest</> : <><ArrowUpAZ size={18} />Oldest</>}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white shadow-lg p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Revenue</p>
            <IndianRupee className="text-violet-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">₹{stats.totalRevenue.toLocaleString("en-IN")}</h2>
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
            <p className="text-sm text-slate-500">Average / Day</p>
            <TrendingUp className="text-blue-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">₹{stats.averageRevenue.toLocaleString("en-IN")}</h2>
        </div>
        <div className="rounded-2xl bg-white shadow-lg p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Best Day</p>
            <CalendarDays className="text-orange-600" />
          </div>
          <h2 className="mt-3 text-lg font-bold">{stats.highestDay.date}</h2>
          <p className="mt-2 font-semibold text-orange-600">
            ₹{(stats.highestDay.totalEarnings || 0).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="mt-8 hidden xl:block">
        <div className="max-h-[500px] overflow-y-auto scrollbar-hide rounded-2xl border border-slate-200">
          <table className="min-w-full">
            <thead className="sticky top-0 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">Date</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">Orders</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">Revenue</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">Average Order</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">Performance</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => {
                // 🔧 FIX: guard divide-by-zero when a day has 0 orders
                const average = item.totalOrders > 0 ? Math.round(item.totalEarnings / item.totalOrders) : 0;
                const performance =
                  item.totalEarnings >= stats.averageRevenue
                    ? "Excellent"
                    : item.totalEarnings >= stats.averageRevenue * 0.8
                    ? "Good"
                    : "Average";

                return (
                  <tr key={item.date} className="border-t border-slate-100 transition hover:bg-slate-50">
                    <td className="px-5 py-5">
                      <div>
                        <p className="font-semibold text-slate-900">{item.date}</p>
                        <p className="mt-1 text-xs text-slate-500">Earnings Record</p>
                      </div>
                    </td>
                    <td className="px-5 py-5 font-semibold">{item.totalOrders}</td>
                    <td className="px-5 py-5 font-bold text-emerald-600">
                      ₹{item.totalEarnings.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-5">₹{average.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          performance === "Excellent"
                            ? "bg-green-100 text-green-700"
                            : performance === "Good"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {performance}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Timeline */}
      <div className="mt-8 space-y-4 xl:hidden">
        {filteredHistory.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center">
            <CalendarDays size={44} className="mx-auto text-slate-400" />
            <h3 className="mt-4 text-xl font-bold text-slate-900">No History Found</h3>
            <p className="mt-2 text-slate-500">Try changing your search or sort option.</p>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const average = item.totalOrders > 0 ? Math.round(item.totalEarnings / item.totalOrders) : 0;
            const performance =
              item.totalEarnings >= stats.averageRevenue
                ? "Excellent"
                : item.totalEarnings >= stats.averageRevenue * 0.8
                ? "Good"
                : "Average";

            return (
              <div key={item.date} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{item.date}</h3>
                    <p className="text-sm text-slate-500">Daily Earnings</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      performance === "Excellent"
                        ? "bg-green-100 text-green-700"
                        : performance === "Good"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {performance}
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Orders</p>
                    <h4 className="mt-1 text-xl font-bold">{item.totalOrders}</h4>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Revenue</p>
                    <h4 className="mt-1 text-xl font-bold text-emerald-600">
                      ₹{item.totalEarnings.toLocaleString("en-IN")}
                    </h4>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Average Order Value</p>
                  <h4 className="mt-2 text-lg font-bold text-slate-900">₹{average.toLocaleString("en-IN")}</h4>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filteredHistory.length === 0 && (
        <div className="mt-8 hidden rounded-3xl border border-dashed border-slate-300 p-16 text-center xl:block">
          <CalendarDays size={52} className="mx-auto text-slate-400" />
          <h3 className="mt-5 text-2xl font-bold text-slate-900">No Earnings History</h3>
          <p className="mt-2 text-slate-500">No earnings records match your current search.</p>
        </div>
      )}
    </div>
  );
}