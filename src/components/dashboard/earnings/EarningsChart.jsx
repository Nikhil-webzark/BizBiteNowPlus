import { useMemo } from "react";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";
import { TrendingUp, CalendarDays, RefreshCw } from "lucide-react";

const FILTERS = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
  { label: "All Time", value: "all" },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
      <p className="font-semibold text-slate-900">{label}</p>
      <p className="mt-3 text-lg font-bold text-green-900">
        ₹{payload[0].value.toLocaleString("en-IN")}
      </p>
    </div>
  );
};

export default function EarningsChart({ data, filter, onFilterChange, onRefresh }) {
  // 🔧 FIX: backend already returns a flat array, filtered server-side by `range`.
  // It is NOT keyed by "7d"/"30d" like the old dummy data. data[filter] on an
  // array returned undefined -> empty chart -> Math.max(...[]) = -Infinity.
  const chartData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const totalRevenue = chartData.reduce((sum, item) => sum + (item.earnings || 0), 0);

  // 🔧 FIX: guard empty array (was producing -Infinity)
  const highestRevenue = chartData.length
    ? Math.max(...chartData.map((item) => item.earnings || 0))
    : 0;

  const averageRevenue = chartData.length ? Math.round(totalRevenue / chartData.length) : 0;

  return (
    <div className="rounded-3xl text-black border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Revenue Trend</h2>
          <p className="mt-1 text-slate-500">Visualize your earnings performance over time.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              onClick={() => onFilterChange(item.value)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                filter === item.value
                  ? "bg-yellow-500 text-white shadow-lg"
                  : "border border-slate-200 bg-white hover:border-green-500 hover:text-green-600"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button onClick={onRefresh} className="rounded-xl border border-slate-200 p-3 transition hover:bg-[#FDFDF5]">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl bg-white shadow-lg p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Revenue</p>
            <TrendingUp className="text-green-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">₹{totalRevenue.toLocaleString("en-IN")}</h2>
        </div>
        <div className="rounded-2xl bg-white shadow-lg p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Highest</p>
            <TrendingUp className="text-emerald-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">₹{highestRevenue.toLocaleString("en-IN")}</h2>
        </div>
        <div className="rounded-2xl bg-white shadow-lg p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Average</p>
            <CalendarDays className="text-orange-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">₹{averageRevenue.toLocaleString("en-IN")}</h2>
        </div>
      </div>

      <div className="mt-8 h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="earningGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16522d" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#16522d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
            {/* 🔧 FIX: backend field is "date", not "day" */}
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
            />
            <Tooltip content={<ChartTooltip />} />
            {/* 🔧 FIX: backend field is "earnings", not "revenue" */}
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="#16522d"
              strokeWidth={4}
              fill="url(#earningGradient)"
              activeDot={{ r: 7, fill: "#16522d" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}