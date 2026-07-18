import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FloatingCartButton = ({
  totalItems = 0,
  totalPrice = 0,
}) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.button
          initial={{
            opacity: 0,
            y: 100,
            scale: 0.85,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: 100,
            scale: 0.85,
          }}
          transition={{
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
          onClick={() => navigate("/customer/cart")}
          className="
            fixed
            bottom-24
            right-4

            z-[60]

            lg:bottom-6
            lg:right-8

            flex
            items-center
            gap-4

            rounded-2xl

            px-5
            py-4

            text-white

            shadow-2xl

            transition-all
            duration-300

            hover:scale-[1.03]
            active:scale-95
          "
          style={{
            background: "var(--primary)",
          }}
        >
          {/* Cart Icon */}

          <div
            className="
              relative

              flex
              h-11
              w-11

              items-center
              justify-center

              rounded-xl

              bg-white/15
            "
          >
            <ShoppingCart size={22} />

            <span
              className="
                absolute
                -right-2
                -top-2

                flex
                h-6
                w-6

                items-center
                justify-center

                rounded-full

                bg-white

                text-[11px]
                font-bold
              "
              style={{
                color: "var(--primary)",
              }}
            >
              {totalItems}
            </span>
          </div>

          {/* Cart Info */}

          <div className="text-left">
            <p className="text-xs text-white/80">
              {totalItems} item{totalItems > 1 ? "s" : ""}
            </p>

            <h3 className="text-base font-bold">
              ₹{totalPrice}
            </h3>
          </div>

          {/* Arrow */}

          <ArrowRight
            size={22}
            className="ml-2"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default FloatingCartButton;