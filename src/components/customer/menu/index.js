import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Check,
  ArrowUpAZ,
  ArrowDownAZ,
  Star,
  Flame,
  Clock3,
  Sparkles,
} from "lucide-react";

const sortOptions = [
  {
    value: "recommended",
    label: "Recommended",
    icon: Sparkles,
  },
  {
    value: "popular",
    label: "Most Popular",
    icon: Flame,
  },
  {
    value: "rating",
    label: "Highest Rated",
    icon: Star,
  },
  {
    value: "price-low",
    label: "Price: Low to High",
    icon: ArrowUpAZ,
  },
  {
    value: "price-high",
    label: "Price: High to Low",
    icon: ArrowDownAZ,
  },
  {
    value: "fastest",
    label: "Fastest Ready",
    icon: Clock3,
  },
];

const SortDropdown = ({ value = "recommended", onChange }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected =
    sortOptions.find((item) => item.value === value) || sortOptions[0];

  const SelectedIcon = selected.icon || Sparkles;

  return (
    <div ref={dropdownRef} className="relative inline-block text-left z-30">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all hover:shadow-md active:scale-95 cursor-pointer"
      >
        <SelectedIcon
          size={18}
          style={{
            color: "var(--primary, #E8622D)",
          }}
        />

        <span className="text-sm font-medium text-slate-700">
          {selected.label}
        </span>

        <ChevronDown
          size={18}
          className={`transition-transform duration-300 text-slate-500 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl z-50"
          >
            {sortOptions.map((option) => {
              const Icon = option.icon;
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange?.(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-5 py-3.5 transition-colors cursor-pointer ${
                    active ? "bg-slate-100/80" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      style={{
                        color: active
                          ? "var(--primary, #E8622D)"
                          : "#64748B",
                      }}
                    />

                    <span
                      className={`text-sm ${
                        active
                          ? "font-semibold text-slate-900"
                          : "text-slate-600"
                      }`}
                    >
                      {option.label}
                    </span>
                  </div>

                  {active && (
                    <Check
                      size={18}
                      style={{
                        color: "var(--primary, #E8622D)",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SortDropdown;