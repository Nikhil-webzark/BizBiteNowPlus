import { motion } from "framer-motion";
import PriceBreakdown from "../cart/PriceBreakdown";
import DeliveryProgress from "../cart/DeliveryProgress";
import CouponSection from "../cart/CouponSection";
const OrderSummary = ({
  summary = {},
  deliveryType = "delivery",
  coupon,
  onCouponChange,
  onApplyCoupon,
}) => {
  const {
    subtotal = 0,
    discount = 0,
    deliveryFee = 0,
    taxes = 0,
    total = 0,

    freeDeliveryThreshold = 499,
    amountRemaining = 0,
    progress = 0,
    freeDeliveryUnlocked = false,
  } = summary;

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
      }}
      className="
        rounded-[24px]
        border
        border-slate-200
        bg-white
        p-5
        dark:border-[#A9BDCF]/30
        dark:bg-[#181A1B]
      "
    >
      {/* Header */}

      <div>
        <h2
          className="
            text-lg
            font-bold
            text-slate-900
            dark:text-white
          "
        >
          Order Summary
        </h2>

        <p
          className="
            mt-1
            text-sm
            text-slate-500
            dark:text-slate-400
          "
        >
          Review your payment details.
        </p>
      </div>
      <div className="mb-5 mt-5">
        <CouponSection
          coupon={coupon}
          onChange={onCouponChange}
          onApply={onApplyCoupon}
        />
      </div>
      {/* Price */}

      <PriceBreakdown
        subtotal={subtotal}
        discount={discount}
        deliveryType={deliveryType}
        deliveryFee={deliveryFee}
        taxes={taxes}
        total={total}
      />

      {/* Free Delivery Progress */}

      {deliveryType === "delivery" && (
        <DeliveryProgress
          subtotal={subtotal}
          progress={progress}
          amountRemaining={amountRemaining}
          threshold={freeDeliveryThreshold}
          unlocked={freeDeliveryUnlocked}
        />
      )}

      {/* Trust Badge */}

      <div
        className="
          mt-6

          rounded-2xl

          bg-green-50
          p-4

          text-center

          dark:bg-[#124224]/20
        "
      >
        <p
          className="
            text-sm
            font-medium

            text-green-700
            dark:text-green-400
          "
        >
          🔒 Secure payment with encrypted checkout
        </p>
      </div>
    </motion.section>
  );
};

export default OrderSummary;
