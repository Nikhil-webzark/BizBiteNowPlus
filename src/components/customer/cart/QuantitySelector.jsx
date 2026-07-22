import { Minus, Plus } from "lucide-react";

const QuantitySelector = ({
  quantity = 1,
  min = 1,
  max = 99,
  loading = false,
  onIncrease,
  onDecrease,
}) => {
  const decreaseDisabled = loading || quantity <= min;
  const increaseDisabled = loading || quantity >= max;

  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg md:rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onDecrease}
        disabled={decreaseDisabled}
        aria-label="Decrease quantity"
        className="
          flex
          h-9
          w-9
          md:h-9
          md:w-9
          items-center
          justify-center
          border-r
          border-gray-200
          text-gray-600
          transition-colors
          hover:bg-gray-100
          hover:text-gray-900
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        <Minus
          size={13}
          className="md:h-[15px] md:w-[15px]"
          strokeWidth={2.5}
        />
      </button>

      <div className="flex h-9 min-w-[44px] md:h-11 md:min-w-[56px] items-center justify-center px-2 md:px-4">
        <span className="text-sm md:text-base font-semibold text-gray-900">
          {loading ? "..." : quantity}
        </span>
      </div>

      <button
        type="button"
        onClick={onIncrease}
        disabled={increaseDisabled}
        aria-label="Increase quantity"
        className="
          flex
          h-9
          w-9
          md:h-9
          md:w-9
          items-center
          justify-center
          border-l
          border-gray-200
          text-green-600
          transition-colors
          hover:bg-green-50
          hover:text-green-700
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        <Plus
          size={13}
          className="md:h-[15px] md:w-[15px]"
          strokeWidth={2.5}
        />
      </button>
    </div>
  );
};

export default QuantitySelector;