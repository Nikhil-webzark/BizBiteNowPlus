import { motion } from "framer-motion";
import {
  CheckCircle2,
  Lock,
  Stamp,
  Gift,
  Percent,
  Bike,
} from "lucide-react";

const REWARD_ICONS = {
  item: Gift,
  discount: Percent,
  delivery: Bike,
};

const RewardProgress = ({ data }) => {
  const {
    threshold = 5,
    stampsCollected = 0,
    rewardType = "item",
    rewardDetail = "Free Reward",
  } = data || {};

  const RewardIcon = REWARD_ICONS[rewardType] || Gift;

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm lg:rounded-[32px] lg:p-6"
    >
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 lg:text-2xl">
            Stamp Journey
          </h2>

          <p className="mt-1 text-sm text-slate-500 lg:mt-2 lg:text-base">
            Collect {threshold} stamps to unlock{" "}
            <span className="font-semibold text-slate-700">
              {rewardDetail}
            </span>
          </p>
        </div>

        <div
          className="rounded-xl px-3 py-1.5 text-white lg:rounded-2xl lg:px-4 lg:py-2"
          style={{
            background: "var(--primary)",
          }}
        >
          <p className="text-xs opacity-80 lg:text-sm">Progress</p>
          <p className="text-sm font-bold lg:text-lg">
            {stampsCollected}/{threshold}
          </p>
        </div>
      </div>

      {/* Stamp Journey */}

      <div className="mt-6 overflow-x-auto lg:mt-10 lg:overflow-visible">
        <div className="flex min-w-[420px] items-center justify-between relative lg:min-w-0">
          {/* Line */}

          <div className="absolute left-0 right-0 top-[18px] h-1 bg-slate-200 rounded-full lg:top-6" />

          <div
            className="absolute left-0 top-[18px] h-1 rounded-full transition-all duration-500 lg:top-6"
            style={{
              background: "var(--primary)",
              width: `${(stampsCollected / threshold) * 100}%`,
            }}
          />

          {Array.from({ length: threshold }).map((_, index) => {
            const stamp = index + 1;

            const completed = stamp <= stampsCollected;

            const current = stamp === stampsCollected + 1;

            return (
              <div
                key={stamp}
                className="relative z-10 flex flex-col items-center"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white shadow-md transition-all lg:h-12 lg:w-12 lg:border-4 ${current ? "scale-110" : ""
                    }`}
                  style={{
                    background: completed
                      ? "var(--primary)"
                      : "#E2E8F0",
                  }}
                >
                  {completed ? (
                    <CheckCircle2 size={16} color="#fff" className="lg:hidden" />
                  ) : (
                    <Lock size={14} className="text-slate-500 lg:hidden" />
                  )}
                  {completed ? (
                    <CheckCircle2 size={22} color="#fff" className="hidden lg:block" />
                  ) : (
                    <Lock size={20} className="hidden text-slate-500 lg:block" />
                  )}
                </div>

                <span className="mt-2 text-[10px] font-semibold text-slate-600 lg:mt-3 lg:text-xs">
                  Stamp {stamp}
                </span>
              </div>
            );
          })}

          {/* Reward */}

          <div className="relative z-10 flex flex-col items-center">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white shadow-lg lg:h-14 lg:w-14 lg:border-4"
              style={{
                background:
                  stampsCollected >= threshold
                    ? "var(--primary)"
                    : "#F8FAFC",
              }}
            >
              <RewardIcon
                size={18}
                className="lg:hidden"
                style={{
                  color:
                    stampsCollected >= threshold
                      ? "#fff"
                      : "var(--primary)",
                }}
              />
              <RewardIcon
                size={24}
                className="hidden lg:block"
                style={{
                  color:
                    stampsCollected >= threshold
                      ? "#fff"
                      : "var(--primary)",
                }}
              />
            </div>

            <span className="mt-2 text-[10px] font-bold text-slate-700 lg:mt-3 lg:text-xs">
              Reward
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Card */}

      <div
        className="mt-6 rounded-2xl p-3 lg:mt-10 lg:rounded-3xl lg:p-5"
        style={{
          background: "var(--primary-light)",
        }}
      >
        {stampsCollected >= threshold ? (
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-xs font-medium lg:text-sm"
                style={{
                  color: "var(--primary)",
                }}
              >
                🎉 Congratulations!
              </p>

              <h3 className="mt-1 text-base font-bold text-slate-900 lg:text-xl">
                {rewardDetail}
              </h3>

              <p className="mt-1 text-sm text-slate-500 lg:text-base">
                Your reward is ready to redeem.
              </p>
            </div>

            <RewardIcon
              size={24}
              className="lg:hidden"
              style={{
                color: "var(--primary)",
              }}
            />
            <RewardIcon
              size={34}
              className="hidden lg:block"
              style={{
                color: "var(--primary)",
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-xs font-medium lg:text-sm"
                style={{
                  color: "var(--primary)",
                }}
              >
                Keep Going!
              </p>

              <h3 className="mt-1 text-base font-bold text-slate-900 lg:text-xl">
                {threshold - stampsCollected} more{" "}
                {threshold - stampsCollected === 1
                  ? "order"
                  : "orders"}{" "}
                left
              </h3>

              <p className="mt-1 text-sm text-slate-500 lg:text-base">
                Unlock <strong>{rewardDetail}</strong>
              </p>
            </div>

            <Stamp
              size={24}
              className="lg:hidden"
              style={{
                color: "var(--primary)",
              }}
            />
            <Stamp
              size={34}
              className="hidden lg:block"
              style={{
                color: "var(--primary)",
              }}
            />
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default RewardProgress;