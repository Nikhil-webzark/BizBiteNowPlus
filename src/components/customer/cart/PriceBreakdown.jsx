const formatPrice = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const PriceRow = ({
  
  label,
  value,
  positive = false,
  bold = false,
  muted = false,
}) => (
  <div
    className={`flex items-center justify-between ${
      bold ? "pt-4 text-base font-bold" : "text-sm"
    }`}
  >
    <span
      className={
        muted
          ? "text-gray-500"
          : bold
          ? "text-gray-900"
          : "text-gray-700"
      }
    >
      {label}
    </span>

    <span
      className={
        positive
          ? "font-semibold text-green-600"
          : bold
          ? "text-gray-900"
          : "font-medium text-gray-900"
      }
    >
      {positive ? "-" : ""}
      {formatPrice(value)}
    </span>
  </div>
);

const PriceBreakdown = ({
  deliveryType = "delivery",
  subtotal = 0,
  discount = 0,
  deliveryFee = 0,
  taxes = 0,
  total = 0,
}) => {
  return (
    <div className="space-y-4">
      <PriceRow
        label="Subtotal"
        value={subtotal}
      />

      <PriceRow
        label="Discount"
        value={discount}
        positive
      />
      {deliveryType === "delivery" && (
      <PriceRow
        label="Delivery Fee"
        value={deliveryFee}
      />
      )}
      <PriceRow
        label="Taxes & Charges"
        value={taxes}
        muted
      />

      <hr className="border-dashed border-gray-200" />

      <PriceRow
        label="Grand Total"
        value={total}
        bold
      />
    </div>
  );
};

export default PriceBreakdown;