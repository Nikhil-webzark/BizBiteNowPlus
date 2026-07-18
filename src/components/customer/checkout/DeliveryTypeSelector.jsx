import { motion } from "framer-motion";
import {
  Bike,
  PackageCheck,
  Clock3,
  Check,
} from "lucide-react";

const DeliveryTypeSelector = ({
  deliveryType = "delivery",
  scheduled = false,
  scheduledLabel = "",
  onDeliveryTypeChange,
  onScheduleClick,
}) => {
  const options = [
    {
      id: "delivery",
      title: "Delivery",
      subtitle: "Delivered to your address",
      icon: Bike,
    },
    {
      id: "pickup",
      title: "Take Away",
      subtitle: "Pick up from restaurant",
      icon: PackageCheck,
    },
  ];

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
        overflow-hidden

        rounded-2xl
        sm:rounded-[24px]

        border
        border-slate-200
        dark:border-[#A9BDCF]/30

        bg-white
        dark:bg-[#181A1B]

        shadow-sm

        p-3
        sm:p-5
      "
    >
      {/* Header */}

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
          Delivery Options
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
          Choose how you'd like to receive your order.
        </p>

      </div>

      {/* Options */}

      <div
        className="
          mt-4

          grid
          grid-cols-2

          gap-2

          sm:mt-5
          sm:gap-3
        "
      >
        {options.map((option) => {
          const selected =
            deliveryType === option.id;

          const Icon = option.icon;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() =>
                onDeliveryTypeChange(option.id)
              }
              className={`
                relative

                flex
                flex-col

                items-center
                justify-center

                rounded-2xl

                border

                px-3
                py-3

                text-center

                transition-all
                duration-300

                active:scale-[0.98]

                ${
                  selected
                    ? "border-transparent shadow-md"
                    : "border-slate-200 dark:border-[#A9BDCF]/30 hover:border-[var(--primary)] hover:shadow-sm"
                }

                sm:px-5
                sm:py-5
              `}
              style={
                selected
                  ? {
                      background:
                        "var(--primary-light)",
                    }
                  : {}
              }
            >
              {selected && (
                <div
                  className="
                    absolute

                    right-2
                    top-2

                    flex
                    h-5
                    w-5

                    items-center
                    justify-center

                    rounded-full
                  "
                  style={{
                    background:
                      "var(--primary)",
                  }}
                >
                  <Check
                    size={11}
                    color="#fff"
                  />
                </div>
              )}

              <div
                className="
                  flex

                  h-10
                  w-10

                  items-center
                  justify-center

                  rounded-xl

                  transition-all

                  sm:h-12
                  sm:w-12
                "
                style={{
                  background:
                    selected
                      ? "var(--primary)"
                      : "#F1F5F9",
                }}
              >
                <Icon
                  size={18}
                  color={
                    selected
                      ? "#fff"
                      : "#475569"
                  }
                />
              </div>

              <h3
                className="
                  mt-3

                  text-sm
                  font-semibold

                  text-slate-900
                  dark:text-white

                  sm:text-base
                "
              >
                {option.title}
              </h3>

              <p
                className="
                  mt-1

                  text-[11px]
                  leading-4

                  text-slate-500
                  dark:text-slate-400

                  sm:text-xs
                "
              >
                {option.subtitle}
              </p>
                          </button>
          );
        })}
      </div>

      {/* Schedule */}

      <button
        type="button"
        onClick={onScheduleClick}
        className="
          mt-4

          w-full

          rounded-2xl

          border
          border-slate-200
          dark:border-[#A9BDCF]/30

          p-3

          transition-all
          duration-300

          hover:border-[var(--primary)]
          hover:shadow-md

          active:scale-[0.99]

          sm:mt-5
          sm:p-4
        "
      >
        <div className="flex items-center gap-3">

          <div
            className="
              flex

              h-10
              w-10

              shrink-0

              items-center
              justify-center

              rounded-xl

              sm:h-11
              sm:w-11
            "
            style={{
              background: scheduled
                ? "var(--primary)"
                : "var(--primary-light)",
            }}
          >
            <Clock3
              size={18}
              color={
                scheduled
                  ? "#fff"
                  : "var(--primary)"
              }
            />
          </div>

          <div className="min-w-0 flex-1 text-left">

            <div className="flex items-center gap-2">

              <h3
                className="
                  text-sm
                  font-semibold

                  text-slate-900
                  dark:text-white

                  sm:text-base
                "
              >
                Schedule Order
              </h3>

              {scheduled && (
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
                    background:
                      "var(--primary)",
                  }}
                >
                  Scheduled
                </span>
              )}

            </div>

            <p
              className="
                mt-0.5

                truncate

                text-xs

                text-slate-500
                dark:text-slate-400

                sm:text-sm
              "
            >
              {scheduled
                ? scheduledLabel
                : "Deliver as soon as possible"}
            </p>

          </div>

          <div className="shrink-0">

            {!scheduled ? (
              <span
                className="
                  rounded-full

                  bg-slate-100
                  dark:bg-white/10

                  px-2.5
                  py-1

                  text-[10px]
                  font-semibold

                  text-slate-600
                  dark:text-slate-300
                "
              >
                ASAP
              </span>
            ) : (
              <div
                className="
                  flex

                  h-8
                  w-8

                  items-center
                  justify-center

                  rounded-full

                  bg-green-50
                  dark:bg-green-900/20
                "
              >
                <Check
                  size={15}
                  className="text-green-600"
                />
              </div>
            )}

          </div>

        </div>

      </button>
          </motion.section>
  );
};

export default DeliveryTypeSelector;