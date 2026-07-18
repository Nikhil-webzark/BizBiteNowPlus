import {
  Receipt,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "../../../context/CartContext";

export default function PriceSummary({
  product,
  quantity,
  addons = [],
  selectedSize,
  selectedVariant,
}) {
  const { addItem } = useCart();

  

const addonPrice = addons.reduce(
  (sum, addon) => sum + (addon.price || 0),
  0
);


const size = product?.sizes?.find(
  (item) => item.id === selectedSize
);

const variant = product?.variants?.find(
  (item) => item.id === selectedVariant
);

const basePrice =
  variant?.price ?? product?.price ?? 0;
const subtotal =
  (basePrice + addonPrice) * quantity;





  const total =
    subtotal;

const handleAddToCart = () => {
  addItem({
    ...product,
    quantity,
    selectedSize: size,
    selectedVariant: variant,
    selectedAddons: addons,
    price: basePrice + addonPrice,
    totalPrice: total,
  });
};

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#16522d]/10">
          <Receipt
            size={22}
            className="text-[#16522d]"
          />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Price Summary
          </h3>

          <p className="text-sm text-gray-500">
            Order breakdown
          </p>
        </div>
      </div>

      {/* Price */}

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Product Price
          </span>

          <span className="font-semibold">
            ₹{basePrice} × {quantity}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Add-ons
          </span>

          <span className="font-semibold">
            ₹{addonPrice * quantity}
          </span>
        </div>
      </div>

      <div className="my-6 border-t border-dashed border-gray-200" />

      {/* Total */}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Total Amount
          </p>

          <h2 className="mt-1 text-3xl font-bold text-[#16522d]">
            ₹{total}
          </h2>
        </div>
      </div>

      {/* Offer */}

      <div className="mt-6 rounded-2xl border border-[#16522d]/10 bg-[#16522d]/5 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#16522d] text-white">
            %
          </div>

          <div>
            <h4 className="font-semibold text-[#16522d]">
              Special Offer
            </h4>

            <p className="mt-1 text-sm leading-6 text-gray-600">
              Apply coupon during checkout to unlock
              additional discounts and cashback.
            </p>
          </div>
        </div>
      </div>

      {/* Add To Cart */}

      <button
        onClick={handleAddToCart}
        className="
          mt-6
          flex
          h-14
          w-full
          items-center
          justify-center
          gap-3
          rounded-2xl
          bg-[#16522d]
          text-base
          font-semibold
          text-white
          transition-all
          duration-300
          hover:bg-[#124325]
          active:scale-[0.98]
        "
      >
        <ShoppingBag size={20} />
        Add To Cart
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
        <span>✔ Secure Checkout</span>
        <span>•</span>
        <span>✔ Instant Confirmation</span>
        <span>•</span>
        <span>✔ Fast Delivery</span>
      </div>
    </div>
  );
}