import { useMemo, useState } from "react";
import {
  Search, Filter, CreditCard, CheckCircle2, Clock3, IndianRupee, TrendingUp,
} from "lucide-react";

export default function CODPaymentTable({ orders = [] }) {
  const tableData = useMemo(() => orders ?? [], [orders]);

const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [paymentFilter, setPaymentFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    return tableData.filter((order) => {
      const matchesSearch = `${order.orderId} ${order.customer}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" ? true : order.status === statusFilter;
      const matchesPayment = paymentFilter === "all" ? true : order.payment === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [tableData, search, statusFilter, paymentFilter]);

  const stats = useMemo(() => {
    const total = tableData.length;
    const paid = tableData.filter((o) => o.status === "Paid").length;
    const unpaid = tableData.filter((o) => o.status !== "Paid").length;
    const totalRevenue = tableData.reduce((sum, item) => sum + (item.amount || 0), 0);
    const paidRevenue = tableData
      .filter((o) => o.status === "Paid")
      .reduce((sum, item) => sum + (item.amount || 0), 0);
    return { total, paid, unpaid, totalRevenue, paidRevenue };
  }, [tableData]);

  return (
    <div className="rounded-3xl border text-black border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">COD Payment Tracking</h2>
          <p className="mt-1 text-slate-500">
            Payment status updates automatically when a COD order is marked Delivered.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="h-11 rounded-xl border border-slate-200 pl-11 pr-4 outline-none transition focus:border-violet-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 px-4 outline-none"
          >
            <option value="all">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 px-4 outline-none"
          >
            <option value="all">All Payments</option>
            <option value="COD">COD</option>
            <option value="ONLINE">Online</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl bg-white shadow-lg p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Orders</p>
            <Filter className="text-violet-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">{stats.total}</h2>
        </div>
        <div className="rounded-2xl bg-white shadow-lg p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Paid</p>
            <CheckCircle2 className="text-green-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">{stats.paid}</h2>
        </div>
        <div className="rounded-2xl bg-white shadow-lg p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Pending</p>
            <Clock3 className="text-red-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">{stats.unpaid}</h2>
        </div>
        <div className="rounded-2xl bg-white shadow-lg p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Revenue</p>
            <IndianRupee className="text-blue-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">₹{stats.totalRevenue.toLocaleString("en-IN")}</h2>
        </div>
        <div className="rounded-2xl bg-white shadow-lg p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Collected</p>
            <TrendingUp className="text-amber-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">₹{stats.paidRevenue.toLocaleString("en-IN")}</h2>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="mt-8 hidden overflow-x-auto scrollbar-hide xl:block">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">Order ID</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">Customer</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">Payment</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">Amount</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">Time</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600">Delivery</th>
              <th className="px-4 py-4 text-right text-sm font-semibold text-slate-600">Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.orderId} className="border-b border-slate-100 transition hover:bg-slate-50">
                <td className="px-4 py-5 font-semibold text-slate-900">{order.orderId?.slice(-8)}</td>
                <td className="px-4 py-5">{order.customer}</td>
                <td className="px-4 py-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      order.payment === "COD" ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {order.payment}
                  </span>
                </td>
                <td className="px-4 py-5 font-semibold">₹{(order.amount || 0).toLocaleString("en-IN")}</td>
                <td className="px-4 py-5 text-slate-500">{order.time}</td>
                <td className="px-4 py-5 text-slate-500">{order.deliveryStatus}</td>
                <td className="px-4 py-5 text-right">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      order.status === "Paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.status === "Paid" ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="mt-8 space-y-4 xl:hidden">
        {filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center">
            <CreditCard size={42} className="mx-auto text-slate-400" />
            <h3 className="mt-4 text-xl font-semibold text-slate-900">No Orders Found</h3>
            <p className="mt-2 text-slate-500">Try changing the search or filter.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.orderId} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{order.customer}</h3>
                  <p className="mt-1 text-sm text-slate-500">{order.orderId?.slice(-8)}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    order.payment === "COD" ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {order.payment}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Amount</p>
                  <h4 className="mt-1 text-lg font-bold">₹{(order.amount || 0).toLocaleString("en-IN")}</h4>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Time</p>
                  <h4 className="mt-1 font-semibold">{order.time}</h4>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Delivery</p>
                  <p className="mt-1 font-medium text-slate-700">{order.deliveryStatus}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    order.status === "Paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {order.status === "Paid" ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                  {order.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredOrders.length === 0 && (
        <div className="mt-8 hidden rounded-3xl border border-dashed border-slate-300 p-16 text-center xl:block">
          <CreditCard size={48} className="mx-auto text-slate-400" />
          <h3 className="mt-4 text-2xl font-bold text-slate-900">No Orders Found</h3>
          <p className="mt-2 text-slate-500">No payment records match your current filters.</p>
        </div>
      )}
    </div>
  );
}