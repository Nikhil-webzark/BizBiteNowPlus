import { motion } from "framer-motion";
import {
  TicketPercent,
  Truck,
  BadgePercent,
  Copy,
  CheckCircle2,
  Clock3,
} from "lucide-react";

const ICONS = {
  percentage: BadgePercent,
  flat: TicketPercent,
  delivery: Truck,
};

const CouponCard = ({
  coupon,
  copied = false,
  used = false,
  onCopy,
  onApply,
}) => {
  if (!coupon) return null;

  const expired = coupon.expired;

  const Icon = ICONS[coupon.discountType] || TicketPercent;

  const discountLabel =
    coupon.discountType === "percentage"
      ? `${coupon.discount}% OFF`
      : coupon.discountType === "flat"
        ? `₹${coupon.discount} OFF`
        : "FREE DELIVERY";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className={`
        min-w-65
        max-w-65
        rounded-3xl
        border
        bg-white
        shadow-sm
        overflow-hidden
        shrink-0
        ${
          expired
            ? "opacity-60 border-red-200"
            : "border-slate-200 hover:shadow-lg"
        }
      `}
    >
      {/* Top */}

      <div
        className="p-5"
        style={{
          background: "var(--primary-light)",
        }}
      >
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center"
              style={{
                background: "var(--primary)",
              }}
            >
              <Icon size={22} color="#fff" />
            </div>

            <div>
              <h3
                className={`font-bold ${
                  coupon.discountType === "delivery" ? "" : "text-xl"
                }`}
                style={{
                  color: "var(--primary)",
                }}
              >
                {discountLabel}
              </h3>

              <p className="text-sm font-medium text-slate-700">
                {coupon.title}
              </p>
            </div>
          </div>

          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold ${
              expired
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-700"
            }`}
          >
            {expired ? "Expired" : "Active"}
          </span>
        </div>
      </div>

      {/* Body */}

      <div className="p-5 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Min ₹{coupon.minOrder}</span>

          <span className="font-semibold text-slate-700">
            Save ₹{coupon.maxDiscount}
          </span>
        </div>

        <div
          className="
            rounded-2xl
            border-2
            border-dashed
            p-3
            flex
            justify-between
            items-center
          "
          style={{
            borderColor: "var(--primary)",
          }}
        >
          <code
            className="font-bold tracking-wider"
            style={{
              color: "var(--primary)",
            }}
          >
            {coupon.code}
          </code>

          <button
            onClick={() => onCopy?.(coupon.code)}
            className="text-sm flex items-center gap-2"
          >
            {copied ? (
              <>
                <CheckCircle2 size={16} className="text-green-600" />
                Copied
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy
              </>
            )}
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center text-xs text-slate-500">
            <Clock3 size={14} />

            {coupon.expiry}
          </div>

          {!expired && !used && (
            <button
              onClick={() => onApply?.(coupon)}
              className="rounded-lg bg-green-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
            >
              Apply
            </button>
          )}

          {used && (
            <span className="text-xs font-semibold text-green-600">Applied</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CouponCard;
