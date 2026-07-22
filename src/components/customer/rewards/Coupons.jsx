import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import CouponCard from "./CouponCard";

import Card from "../common/Card";
import Chip from "../common/Chip";
import EmptyState from "../common/EmptyState";
import SectionHeader from "../common/SectionHeader";

const tabs = [
  { id: "available", label: "Available" },
  { id: "applied", label: "Applied" },
  { id: "expired", label: "Expired" },
];

const Coupons = ({
  coupons = [],
  appliedCoupon = null,
  usedCoupons = [],
  onApply,
  onCopy,
}) => {
  const [activeTab, setActiveTab] = useState("available");
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);

    setCopiedCode(code);

    onCopy?.(code);

    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      const tabMatch =
        activeTab === "available"
          ? !coupon.expired && !usedCoupons.includes(coupon.code)
          : activeTab === "applied"
            ? appliedCoupon?.code === coupon.code
            : coupon.expired;

      const searchMatch =
        coupon.code
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        coupon.title
          .toLowerCase()
          .includes(search.toLowerCase());

      return tabMatch && searchMatch;
    });
  }, [
    coupons,
    activeTab,
    search,
    appliedCoupon,
    usedCoupons,
  ]);

  return (
    <div className="space-y-4 lg:space-y-6">

      <SectionHeader
        title="Active Coupons"
        subtitle="Available rewards ready to use."
      />

      {/* Search */}

      <Card shadow="none">
        <div className="relative">

          <Search
            size={16}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-slate-400

              lg:left-4
              lg:size-[18px]
            "
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search coupon..."
            className="
              w-full
              bg-transparent
              py-2
              pl-9
              pr-2
              text-sm
              outline-none

              lg:py-0
              lg:pl-12
              lg:text-base
            "
          />

        </div>
      </Card>

      {/* Tabs */}

      <div className="flex gap-2 overflow-x-auto scrollbar-hide lg:gap-3">

        {tabs.map((tab) => (
          <Chip
            key={tab.id}
            label={tab.label}
            selected={activeTab === tab.id}
            onClick={() =>
              setActiveTab(tab.id)
            }
          />
        ))}

      </div>

      {/* Coupons */}

      {filteredCoupons.length === 0 ? (
        <EmptyState
          icon="search"
          title="No Coupons"
          description="Nothing available here."
        />
      ) : (
        <div
          className="
            flex
            gap-3
            overflow-x-auto
            scrollbar-hide
            pb-2
            snap-x
            snap-mandatory

            lg:gap-5
          "
        >
          {filteredCoupons.map((coupon) => (
            <div
              key={coupon.code}
              className="snap-start"
            >
              <CouponCard
                coupon={coupon}
                copied={
                  copiedCode === coupon.code
                }
                used={usedCoupons.includes(
                  coupon.code
                )}
                onCopy={handleCopy}
                onApply={onApply}
              />
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Coupons;