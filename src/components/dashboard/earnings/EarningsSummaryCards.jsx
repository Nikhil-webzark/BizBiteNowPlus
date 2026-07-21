import {
  IndianRupee,
  ShoppingBag,
  Wallet,
  CreditCard,
  TrendingUp,
} from "lucide-react";

const formatCurrency = (value) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function EarningsSummaryCards({
  summary,
}) {
  const cards = [
    {
      id: 1,
      title: "Today's Earnings",
      value: formatCurrency(summary.todayEarnings),
      subtitle: "Revenue generated today",
     growth: `+${summary.revenueGrowth ?? 0}%`,
      icon: IndianRupee,
      iconColor: "text-violet-600",
      iconBg: "bg-violet-100",
    },
    {
      id: 2,
      title: "Today's Orders",
      value: summary.todayOrders.toLocaleString(),
      subtitle: "Completed orders",
      growth: "+12%",
      icon: ShoppingBag,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
    },
    {
      id: 3,
      title: "Average Order",
      value: formatCurrency(summary.averageOrderValue),
      subtitle: "Average order value",
      growth: "+8%",
      icon: Wallet,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
    },
    {
      id: 4,
      title: "COD Pending",
      value: formatCurrency(summary.codPending),
      subtitle: "Pending COD collection",
      growth: "Pending",
      icon: CreditCard,
      iconColor: "text-rose-600",
      iconBg: "bg-rose-100",
    },
    {
      id: 5,
      title: "Online Received",
      value: formatCurrency(summary.onlineReceived),
      subtitle: "Successfully received",
      growth: "Paid",
      icon: TrendingUp,
      iconColor: "text-sky-600",
      iconBg: "bg-sky-100",
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className="
              group
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-xl
            "
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                  {card.value}
                </h2>
              </div>

              <div
                className={`rounded-2xl p-3 ${card.iconBg}`}
              >
                <Icon
                  size={24}
                  className={card.iconColor}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {card.subtitle}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                {card.growth}
              </span>
            </div>

            {/* Progress Line */}
            <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-4/5 rounded-full bg-green-600 transition-all duration-500 group-hover:w-full" />
            </div>
          </div>
        );
      })}
    </div>
  );
}