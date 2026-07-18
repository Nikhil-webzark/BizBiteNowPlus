import { ArrowLeft, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const CheckoutHeader = ({
  itemCount = 0,
  onBack,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
      }}
      className="
        sticky
        top-0
        z-30

        flex
        items-center
        justify-between

        rounded-[24px]


        px-4
        py-3

      "
    >
      {/* Left */}

      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="
            flex
            h-11
            w-11
            items-center
            justify-center

            rounded-xl

            border
            border-slate-200
            dark:border-[#A9BDCF]/30

            transition-all
            duration-200

            hover:bg-slate-200
            dark:hover:bg-white/10
          "
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1
            className="
              text-xl
              font-bold

              text-slate-900
              dark:text-white
            "
          >
            Checkout
          </h1>

          <p
            className="
              text-sm

              text-slate-500
              dark:text-slate-400
            "
          >
            {itemCount}{" "}
            {itemCount === 1
              ? "item"
              : "items"}{" "}
            in your order
          </p>
        </div>
      </div>

      {/* Right */}

      <div
        className="
          hidden
          
          items-center
          gap-2

          rounded-full

          bg-green-50
          dark:bg-[#124224]/20

          px-4
          py-2

          lg:flex
        "
      >
        <ShieldCheck
          size={18}
          className="text-green-600"
        />

        <span
          className="
            text-sm
            font-semibold

            text-green-700
            dark:text-green-400
          "
        >
          Secure Checkout
        </span>
      </div>
    </motion.div>
  );
};

export default CheckoutHeader;