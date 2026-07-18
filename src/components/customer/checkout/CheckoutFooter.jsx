import { Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const CheckoutFooter = ({
  loading = false,
  disabled = false,
  total = 0,
  onPlaceOrder,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mt-6"
    >
      <button
        disabled={disabled || loading}
        onClick={onPlaceOrder}
        className="
          flex
          h-14
          w-full
          items-center
          justify-between

          rounded-2xl

          px-6

          font-semibold
          text-white

          transition-all
          duration-200

          hover:scale-[1.01]
          active:scale-[0.98]

          disabled:cursor-not-allowed
          disabled:opacity-60
        "
        style={{
          background: "var(--primary)",
        }}
      >
        <div className="text-left">
          <p className="text-xs text-white/80">
            Total Payable
          </p>

          <p className="text-lg font-bold">
            ₹{Number(total).toFixed(2)}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2
              size={20}
              className="animate-spin"
            />
            Processing...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            Place Order
            <ArrowRight size={20} />
          </div>
        )}
      </button>
    </motion.div>
  );
};

export default CheckoutFooter;