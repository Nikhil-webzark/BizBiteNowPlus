import { ShoppingBag } from "lucide-react";

import CartItemCard from "./CartItemCard";
import EmptyCart from "./EmptyCart";

const CartItems = ({
  items = [],
  onIncrease,
  onDecrease,
  onContinueShopping,
  onRemove,
}) => {
  if (!items.length) {
    return (
      <EmptyCart onContinueShopping={onContinueShopping} />
    );
  }

  return (
    <section className="w-full rounded-xl md:rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 md:px-6 md:py-5">
        <div className="flex items-center gap-2.5 md:gap-3">
          <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
            <ShoppingBag size={18} className="md:h-5 md:w-5" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900 md:text-lg">
              Items in Cart
            </h2>

            <p className="text-xs text-gray-500 md:text-sm">
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <CartItemCard
            key={item.id}
            item={item}
            onIncrease={() => onIncrease?.(item)}
            onDecrease={() => onDecrease?.(item)}
            onRemove={() => onRemove?.(item)}
          />
        ))}
      </div>
    </section>
  );
};

export default CartItems;