import { motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  MapPin,
  Plus,
} from "lucide-react";

const AddressSelector = ({
  addresses = [],
  selectedAddress,
  onSelect,
  onManage,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="
        rounded-[14px]
        border
        border-slate-200
        dark:border-[#A9BDCF]/30
        bg-white
        dark:bg-[#181A1B]
        max-w-full
        min-w-0
        p-3
        sm:p-5
      "
    >
      {/* Header */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h2
            className="
              text-base
              font-bold
              text-slate-900
              dark:text-white

              sm:text-lg
            "
          >
            Delivery Address
          </h2>

          <p
            className="
              mt-0.5
              text-xs
              text-slate-500
              dark:text-slate-400

              sm:text-sm
            "
          >
            Select where you'd like your order delivered.
          </p>

        </div>

        <button
          onClick={onManage}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-1

            rounded-xl

            bg-slate-100
            dark:bg-white/5

            px-3
            py-2

            text-xs
            font-semibold

            transition-all
            duration-200

            hover:bg-slate-200
            dark:hover:bg-white/10

            sm:w-auto
            sm:bg-transparent
            sm:text-sm
          "
          style={{
            color: "var(--primary)",
          }}
        >
          Manage
          <ChevronRight size={15} />
        </button>

      </div>

      {/* Addresses */}

      <div className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">

        {addresses.map((address) => {
          const active =
            selectedAddress?.id === address.id;

          return (
            <button
              key={address.id}
              onClick={() => onSelect(address)}
              className={`
                group

                flex
                w-full
                items-start

                gap-3

                rounded-2xl

                border

                p-3

                text-left

                transition-all
                duration-200

                ${
                  active
                    ? "border-transparent shadow-md"
                    : "border-slate-200 dark:border-[#A9BDCF]/30 hover:border-[var(--primary)]"
                }

                sm:gap-4
                sm:p-4
              `}
              style={
                active
                  ? {
                      background: "var(--primary-light)",
                    }
                  : {}
              }
            >

              {/* Icon */}

              <div
                className="
                  mt-0.5

                  flex
                  h-9
                  w-9

                  shrink-0

                  items-center
                  justify-center

                  rounded-xl

                  sm:h-11
                  sm:w-11
                "
                style={{
                  background: active
                    ? "var(--primary)"
                    : "#F1F5F9",
                }}
              >
                <MapPin
                  size={18}
                  color={
                    active
                      ? "#fff"
                      : "#475569"
                  }
                />
              </div>

              {/* Content */}

              <div className="min-w-0 flex-1">

                <div className="flex flex-wrap items-center gap-2">

                  <h3
                    className="
                      truncate

                      text-sm
                      font-semibold

                      text-slate-900
                      dark:text-white

                      sm:text-base
                    "
                  >
                    {address.title}
                  </h3>

                  {address.default && (
                    <span
                      className="
                        rounded-full

                        px-2
                        py-0.5

                        text-[10px]
                        font-semibold

                        text-white
                      "
                      style={{
                        background: "var(--primary)",
                      }}
                    >
                      Default
                    </span>
                  )}

                </div>

                <p
                  className="
                    mt-1

                    line-clamp-2

                    text-xs
                    leading-4

                    text-slate-500
                    dark:text-slate-400

                    sm:text-sm
                    sm:leading-5
                  "
                >
                  {address.address}
                </p>

              </div>

              {active && (
                <div
                  className="
                    flex
                    h-6
                    w-6

                    shrink-0

                    items-center
                    justify-center

                    rounded-full

                    text-white

                    sm:h-7
                    sm:w-7
                  "
                  style={{
                    background: "var(--primary)",
                  }}
                >
                  <Check size={14} />
                </div>
              )}

            </button>
          );
        })}

        {/* Add Address */}

        <button
          onClick={onManage}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2

            rounded-2xl

            border
            border-dashed

            border-slate-300
            dark:border-[#A9BDCF]/30

            py-3

            text-sm
            font-semibold

            transition-all

            hover:border-[var(--primary)]
            hover:bg-[var(--primary-light)]
            hover:text-[var(--primary)]

            sm:py-4
            sm:text-base
          "
        >
          <Plus size={17} />
          Add New Address
        </button>

      </div>

    </motion.section>
  );
};

export default AddressSelector;