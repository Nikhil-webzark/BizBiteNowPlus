import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { motion } from "framer-motion";
import CheckoutHeader from "../../components/customer/checkout/CheckoutHeader";
import AddressSelector from "../../components/customer/checkout/AddressSelector";
import DeliveryTypeSelector from "../../components/customer/checkout/DeliveryTypeSelector";
import ScheduleOrderCard from "../../components/customer/checkout/ScheduleOrderCard";
import ScheduleOrderModal from "../../components/customer/checkout/ScheduleOrderModal";
import PaymentMethodList from "../../components/customer/checkout/PaymentMethodList";
import AddUpiModal from "../../components/customer/checkout/AddUpiModal";
import OrderSummary from "../../components/customer/checkout/OrderSummary";
import CheckoutFooter from "../../components/customer/checkout/CheckoutFooter";
import couponsData from "../../data/customer/couponsData"; 

import {
  addresses,
  paymentMethods,
} from "../../data/customer/profileData";

import {
  placeOrder as placeOrderApi,
} from "../../api/customerApi";

import {
  useCart,
} from "../../context/CartContext";

const Checkout = () => {
  const navigate = useNavigate();

const {
  cartItems,
  refreshCart,
  selectedCoupon,
  setSelectedCoupon,
} = useCart();

  const [selectedAddress, setSelectedAddress] =
    useState(
      addresses.find(
        (item) => item.default
      )
    );

const [savedPaymentMethods, setSavedPaymentMethods] =
  useState(paymentMethods);

const [selectedPayment, setSelectedPayment] =
  useState(
    paymentMethods.find(
      (item) => item.default
    )
  );
const [couponCode, setCouponCode] =
  useState(selectedCoupon?.code || "");

const [couponError, setCouponError] =
  useState("");

useEffect(() => {
  setCouponCode(selectedCoupon?.code || "");
}, [selectedCoupon]);



  const [placingOrder, setPlacingOrder] =
    useState(false);
const [deliveryType, setDeliveryType] =
  useState("delivery");

const [scheduleModalOpen, setScheduleModalOpen] =
  useState(false);

const [addUpiModalOpen, setAddUpiModalOpen] =
  useState(false);

const [scheduledOrder, setScheduledOrder] =
  useState({
    scheduled: false,
    date: "",
    time: "",
    datetime: null,
  });
  const handleScheduleConfirm = (
  schedule
) => {
  setScheduledOrder({
    scheduled: true,
    ...schedule,
  });
};
const handleCouponChange = (value) => {
  setCouponCode(value);

  if (couponError) {
    setCouponError("");
  }

  if (selectedCoupon) {
    setSelectedCoupon(null);
  }
};

const handleApplyCoupon = (selectedCode) => {
  const code = (selectedCode || couponCode)
    .trim()
    .toLowerCase();

  const coupon = couponsData.find(
    (c) => c.code.toLowerCase() === code
  );

  if (!coupon) {
    setCouponError(
      "The coupon is invalid. Please enter a valid coupon."
    );
    setSelectedCoupon(null);
    return;
  }

  setCouponError("");
  setCouponCode(coupon.code);
  setSelectedCoupon(coupon);
};

const handleAddUpi = (payment) => {
  const newMethod = {
    id: Date.now(),
    type: "upi",
    title: "UPI",
    name: "UPI",
    description: payment.upiId,
    default: payment.default,
  };

  setSavedPaymentMethods((prev) => [
    newMethod,
    ...prev,
  ]);

  setSelectedPayment(newMethod);

  setAddUpiModalOpen(false);
};
  const orderSummary = useMemo(() => {
    const subtotal =
      cartItems.reduce(
        (sum, item) =>
          sum + item.total,
        0
      );

const delivery =
  deliveryType === "pickup"
    ? 0
    : subtotal >= 499
      ? 0
      : 40;

    const tax = Math.round(
      subtotal * 0.05
    );

    const discount =
      selectedCoupon
        ? selectedCoupon.discountType ===
          "flat"
          ? selectedCoupon.discount
          : Math.round(
              (subtotal *
                selectedCoupon.discount) /
                100
            )
        : 0;

const freeDeliveryThreshold = 499;

const amountRemaining = Math.max(
  freeDeliveryThreshold - subtotal,
  0
);

const progress = Math.min(
  (subtotal / freeDeliveryThreshold) * 100,
  100
);

const freeDeliveryUnlocked =
  subtotal >= freeDeliveryThreshold;

return {
  subtotal,
  discount,
  deliveryFee: delivery,
  taxes: tax,
  total:
    subtotal +
    delivery +
    tax -
    discount,

  freeDeliveryThreshold,
  amountRemaining,
  progress,
  freeDeliveryUnlocked,
};
  }, [
    cartItems,
    selectedCoupon,
    deliveryType, 
  ]);
const coupon = {
  code: couponCode,
  applied: !!selectedCoupon,
  discount: orderSummary.discount,
  error: couponError,
  offers: couponsData.filter(
    (coupon) => !coupon.expired
  ),
};
  const placeOrder = async () => {
    if (!cartItems.length) {
      alert("Your cart is empty.");
      return;
    }

    if (!selectedAddress) {
      alert(
        "Please select a delivery address."
      );
      return;
    }

    if (!selectedPayment) {
      alert(
        "Please select a payment method."
      );
      return;
    }

    try {
      setPlacingOrder(true);

await placeOrderApi({
  payment: selectedPayment,
  address: selectedAddress,

  deliveryType,

  scheduledOrder,

  coupon: selectedCoupon,

  notes: "",
});


      setSelectedCoupon(null);

      await refreshCart();

      navigate(
        "/customer/orders"
      );
    } catch (err) {
      console.error(err);

      alert(
        err?.response?.data
          ?.message ||
          "Unable to place order."
      );
    } finally {
      setPlacingOrder(false);
    }
  };
useEffect(() => {
  if (deliveryType !== "pickup") {
    return;
  }

  const upiMethod =
    savedPaymentMethods.find(
      (method) => method.type === "upi"
    );

  if (
    upiMethod &&
    selectedPayment?.type !== "upi"
  ) {
    setSelectedPayment(upiMethod);
  }
}, [
  deliveryType,
  savedPaymentMethods,
  selectedPayment,
]);
return (
  <>
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
  className="
    w-full
    max-w-none

    px-3
    py-4

    sm:px-4
    lg:px-8

    mb-20
  "
    >
      <CheckoutHeader
        itemCount={cartItems.length}
        onBack={() => navigate(-1)}
      />

<div
  className="
    mt-4

    grid
    grid-cols-1

    gap-4

    xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,1fr)]
    xl:gap-6
  "
>
        {/* LEFT */}

        <div className="space-y-6">

          <AddressSelector
            addresses={addresses}
            selectedAddress={selectedAddress}
            onSelect={setSelectedAddress}
            onManage={() => navigate("/customer/profile")}
          />

          <DeliveryTypeSelector
            deliveryType={deliveryType}
            scheduled={scheduledOrder.scheduled}
            scheduledLabel={
              scheduledOrder.scheduled
                ? `${scheduledOrder.date} • ${scheduledOrder.time}`
                : ""
            }
            onDeliveryTypeChange={setDeliveryType}
            onScheduleClick={() =>
              setScheduleModalOpen(true)
            }
          />

          <ScheduleOrderCard
            scheduled={scheduledOrder.scheduled}
            scheduledDate={scheduledOrder.date}
            scheduledTime={scheduledOrder.time}
            onClick={() =>
              setScheduleModalOpen(true)
            }
          />

<PaymentMethodList
  paymentMethods={savedPaymentMethods}
  selectedPayment={selectedPayment}
  deliveryType={deliveryType}
  onSelect={setSelectedPayment}
  onAddUpi={() =>
    setAddUpiModalOpen(true)
  }
/>

        </div>

        {/* RIGHT */}

        <div
          className="
            h-fit

            xl:sticky
            xl:top-24
          "
        >

<OrderSummary
  summary={orderSummary}
  deliveryType={deliveryType}
  coupon={coupon}
  onCouponChange={handleCouponChange}
  onApplyCoupon={handleApplyCoupon}
/>

          <CheckoutFooter
            total={orderSummary.total}
            loading={placingOrder}
            disabled={
              !selectedAddress ||
              !selectedPayment ||
              cartItems.length === 0
            }
            onPlaceOrder={placeOrder}
          />
        </div>

      </div>
    </motion.div>

    <ScheduleOrderModal
      open={scheduleModalOpen}
      onClose={() =>
        setScheduleModalOpen(false)
      }
      onConfirm={
        handleScheduleConfirm
      }
    />

    <AddUpiModal
      open={addUpiModalOpen}
      onClose={() =>
        setAddUpiModalOpen(false)
      }
      onSave={handleAddUpi}
    />
  </>
);
}

export default Checkout;