import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import useCartStore from "../../api/stores/customerstore/cartStore";

import CartPage from "../../components/customer/cart/CartPage";
import CartSkeleton from "../../components/customer/cart/CartSkeleton";

const Cart = () => {
  const navigate = useNavigate();

  const {
    items: cartItems,
    loading,
    fetchCart,
    updateCartItem,
    removeCartItem,
  } = useCartStore();

  useEffect(() => {
    fetchCart().catch(console.error);
  }, [fetchCart]);

  const updateQuantity = async (item, type) => {
    const quantity =
      type === "inc"
        ? item.quantity + 1
        : item.quantity - 1;

    if (quantity <= 0) {
      await removeCartItem(item.id);
      return;
    }

    await updateCartItem(item.id, quantity);
  };

  const sharedProps = {
    cartItems,

    onIncrease: (item) =>
      updateQuantity(item, "inc"),

    onDecrease: (item) =>
      updateQuantity(item, "dec"),

    onRemove: (item) =>
      removeCartItem(item.id),

    onCheckout: () =>
      navigate("/customer/checkout"),

    onContinueShopping: () =>
      navigate("/customer/menu"),

    onAddressClick: () => {},

    onBack: () => navigate(-1),
  };

  if (loading) {
    return <CartSkeleton />;
  }

  return (
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
    >
      <CartPage {...sharedProps} />
    </motion.div>
  );
};

export default Cart;