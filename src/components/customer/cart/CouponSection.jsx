import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Percent,
  Tag,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const CouponSection = ({
  coupon = {},
  onChange,
  onApply,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [shake, setShake] = useState(false);

  const {
    code = "",
    applied = false,
    discount = 0,
    offers = [],
    error = "",
  } = coupon;

  useEffect(() => {
    if (error) {
      setShake(true);

      const timer = setTimeout(() => {
        setShake(false);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <section
      className="
        rounded-xl
        sm:rounded-2xl

        border
        border-slate-200

        bg-white
        shadow-sm
      "
    >
      {/* Header */}

      <div
        className="
          border-b
          border-slate-100

          px-4
          py-4

          sm:px-6
          sm:py-5
        "
      >
        <div className="flex items-center gap-3">

          <div
            className="
              flex

              items-center
              justify-center

              rounded-full

              bg-orange-50
              text-orange-500

              sm:h-10
              sm:w-10
            "
          >
            <Percent size={16} />
          </div>

          <div>

            <h2
              className="
                text-base
                font-semibold

                text-slate-900

                sm:text-lg
              "
            >
              Coupons & Offers
            </h2>

            <p
              className="
                text-xs
                text-slate-500

                sm:text-sm
              "
            >
              Apply a coupon and save more
            </p>

          </div>

        </div>

      </div>

      {/* Coupon Input */}

      <div
        className="
          p-6

          sm:p-6
        "
      >
        <div
          className="
            flex
            flex-col

            gap-2

            sm:flex-row
            sm:gap-3
          "
        >

<input
  value={code}
  placeholder="Enter coupon code"
  onChange={(e) => {
    if (error) {
      setShake(false);
    }

    onChange(e.target.value);
  }}
  className={`
    min-h-[56px]
    sm:min-h-[44px]

    flex-1

    rounded-xl

    border

    px-4
    py-4

    text-sm

    outline-none

    transition-all
    duration-300

    ${
      error
        ? "border-red-500 bg-red-50 text-red-700 focus:border-red-500 focus:ring-4 focus:ring-red-100"
        : "border-slate-300 focus:border-green-600 focus:ring-4 focus:ring-green-100"
    }

    ${
      shake
        ? "animate-[shake_0.4s_ease-in-out]"
        : ""
    }
  `}
/>

          <button
            onClick={() => onApply()}
            className="
              w-full

              rounded-xl

              bg-green-600

              px-4
              py-2.5

              font-semibold
              text-white

              transition

              hover:bg-green-700

              sm:w-auto
              sm:px-6
            "
          >
            {applied ? "Applied" : "Apply"}
          </button>
                  </div>

        {applied && (
          <div
            className="
              mt-3

              flex
              items-center

              gap-2

              rounded-xl

              bg-green-50

              p-2.5

              text-green-700

              sm:mt-4
              sm:p-3
            "
          >
            <CheckCircle2 size={18} />

            <span
              className="
                text-xs
                font-medium

                sm:text-sm
              "
            >
              Coupon applied successfully.
              You saved ₹{discount}
            </span>
          </div>
        )}

        {!applied && error && (
          <div
            className="
              mt-3

              flex
              items-center

              gap-2

              text-xs
              font-medium

              text-red-600

              sm:text-sm
            "
          >
            <XCircle size={16} />

            <span>
              The coupon is invalid.
              Please enter a valid coupon.
            </span>
          </div>
        )}

      </div>

      {/* Available Coupons */}

      {offers.length > 0 && (
        <>

          <button
            onClick={() =>
              setExpanded(!expanded)
            }
            className="
              flex

              w-full

              items-center
              justify-between

              border-t
              border-slate-100

              px-4
              py-3

              transition

              hover:bg-slate-50

              sm:px-6
              sm:py-4
            "
          >
            <span
              className="
                text-sm
                font-medium

                text-slate-900

                sm:text-base
              "
            >
              Available Coupons ({offers.length})
            </span>

            {expanded ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>

          {expanded && (
            <div
              className="
                space-y-2

                border-t
                border-slate-100

                p-4

                sm:space-y-3
                sm:p-6
              "
            >
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="
                    flex

                    items-center
                    justify-between

                    gap-3

                    rounded-xl

                    border
                    border-slate-200

                    p-3

                    sm:p-4
                  "
                >
                  <div className="flex gap-3">

                    <Tag
                      size={18}
                      className="mt-1 text-green-600"
                    />

                    <div>

                      <h4
                        className="
                          text-sm
                          font-semibold

                          text-slate-900

                          sm:text-base
                        "
                      >
                        {offer.code}
                      </h4>

                      <p
                        className="
                          mt-1

                          text-xs

                          text-slate-500

                          sm:text-sm
                        "
                      >
                        {offer.description}
                      </p>

                    </div>

                  </div>
                                    <button
                    onClick={() =>
                      onApply(offer.code)
                    }
                    className="
                      rounded-lg

                      bg-green-50

                      px-3
                      py-1.5

                      text-xs
                      font-semibold

                      text-green-600

                      transition

                      hover:bg-green-100

                      sm:py-2
                      sm:text-sm
                    "
                  >
                    Apply
                  </button>

                </div>
              ))}
            </div>
          )}

        </>
      )}

    </section>
  );
};

export default CouponSection;