import { useState, useEffect } from "react";

// import SectionHeader from "../../components/customer/common/SectionHeader";
import { motion } from "framer-motion";
import LoyaltyCard from "../../components/customer/rewards/LoyaltyCard";
import RewardProgress from "../../components/customer/rewards/RewardProgress";
import Coupons from "../../components/customer/rewards/Coupons";
import { discountsToCoupons } from "../../components/customer/rewards/discountMapper";
import useDiscountStore from "../../store/discountStore";
import useAuthStore from "../../store/authStore";
import { loyaltyData as DEMO_LOYALTY_DATA } from "../../data/customer/rewardsData";
import { Link } from "react-router-dom";
import ActivityTimeline from "../../components/customer/rewards/ActivityTimeline";
import { DEMO_ACTIVITY } from "../../data/customer/demoActivityData";
// import { Gift } from "lucide-react";

import couponsData from "../../data/customer/couponsData";
import { Bell } from "lucide-react";

const Rewards = () => {
  const [loyalty] = useState(DEMO_LOYALTY_DATA);

  const [coupons, setCoupons] = useState(couponsData);

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [usedCoupons, setUsedCoupons] = useState([]);
  const [couponError, setCouponError] = useState(null);

  const { getDiscounts, checkDiscount } = useDiscountStore();
  const { user } = useAuthStore();

  useEffect(() => {
    getDiscounts()
      .then((discounts) => setCoupons(discountsToCoupons(discounts)))
      .catch(() => {
        // Backend /discounts/ not reachable (or not yet live) — fall back to mock.
        setCoupons(couponsData);
      });
  }, [getDiscounts]);

  const applyCoupon = async (coupon) => {
    if (usedCoupons.includes(coupon.code)) return;

    setCouponError(null);

    try {
      // Rewards page has no cart context, so cart_total is 0 for a preview
      // check — real order-time validation happens again at Checkout.
      const result = await checkDiscount(coupon.code, coupon.sellerId, user?.phone, 0);
      const applied = { ...coupon, ...result };
      setAppliedCoupon(applied);
      setUsedCoupons((prev) =>
        prev.includes(coupon.code) ? prev : [...prev, coupon.code]
      );
      localStorage.setItem("appliedCoupon", JSON.stringify(applied));
    } catch (err) {
      setCouponError(err.response?.data?.message || "Invalid or expired code");
    }
  };
  // const rewardReady = loyalty.stampsCollected >= loyalty.threshold;

  const handleCopy = () => {
    // Coupons.jsx already copies to clipboard itself and calls this back —
    // hook in analytics here if needed. No-op otherwise.
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="space-y-6"
    >
      <div
        className="
        pt-4
    w-full
    min-w-0
    max-w-[1760px]
    space-y-6
    pb-28
    px-4
    sm:px-2
  "
      >
        {/* Header */}
        <div className="w-full flex items-start lg:items-center z-50 rounded-xl p-2 justify-between">
          <div>
            <h1
              className="font-bold text-slate-900 dark:text-white"
              style={{ fontSize: "26px" }}
            >
              Rewards & Loyalty
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 lg:hidden">
              Track your orders and coupons and history
            </p>
          </div>

          <Link
            to="/customer/notifications"
            className="
    relative
    flex
    h-10
    w-10
    items-center
    justify-center
    rounded-full
    bg-slate-100/70
    transition-colors
    hover:bg-slate-200/70
    dark:bg-white/5
    dark:hover:bg-white/10
    lg:h-11
    lg:w-11
    lg:rounded-xl
    lg:bg-slate-200
    lg:hover:bg-slate-300
    lg:dark:bg-slate-200
  "
          >
            <Bell size={20} strokeWidth={1.75} className="text-slate-600 dark:text-slate-300 lg:h-[22px] lg:w-[22px] lg:text-slate-700" />

            <span
              className="
      absolute
      right-0
      top-0
      flex
      h-[16px]
      w-[16px]
      items-center
      justify-center
      rounded-full
      bg-red-500
      text-[9px]
      font-semibold
      text-white
      ring-2
      ring-white
      dark:ring-[#181A1B]
      lg:-right-1
      lg:-top-1
      lg:h-5
      lg:w-5
      lg:text-[10px]
      lg:font-bold
      lg:ring-0
    "
            >
              3
            </span>
          </Link>
        </div>

        {/* Loyalty */}

        <div className="space-y-6 lg:rounded-3xl lg:bg-white lg:shadow-sm lg:border lg:border-slate-200 lg:p-6">
          <section className="space-y-6">
            <LoyaltyCard data={loyalty} />

            <RewardProgress data={loyalty} />

            {/* {rewardReady && <Reward Ready Banner />} */}

            <Coupons
              coupons={coupons}
              appliedCoupon={appliedCoupon}
              usedCoupons={usedCoupons}
              onApply={applyCoupon}
              onCopy={handleCopy}
            />

            {couponError && (
              <p className="text-sm font-medium text-red-600">{couponError}</p>
            )}

            <ActivityTimeline activities={DEMO_ACTIVITY} />
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default Rewards;