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
    px-1
    sm:px-2
  "
      >
        {/* Header */}
        <div className="w-full flex items-center z-50  rounded-xl p-2 justify-between">
          <div>
            <h1
              className="font-bold text-slate-900 dark:text-white"
              style={{ fontSize: "26px" }}
            >
              Rewards & Loyalty
            </h1>
          </div>

          <Link
            to="/customer/notifications"
            className="
    relative
    flex
    h-11
    w-11
    items-center
    justify-center
    rounded-xl
    bg-slate-200
    transition
    hover:bg-slate-300
  "
          >
            <Bell size={22} className="text-slate-700" />

            <span
              className="
      absolute
      -right-1
      -top-1
      flex
      h-5
      w-5
      items-center
      justify-center
      rounded-full
      bg-red-500
      text-[10px]
      font-bold
      text-white
    "
            >
              3
            </span>
          </Link>
        </div>

        {/* Loyalty */}

        <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-6">
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
