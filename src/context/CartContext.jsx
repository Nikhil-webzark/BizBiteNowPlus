import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../api/customerApi";

const CartContext = createContext();

export const CartProvider = ({
  children,
}) => {
  const [cartItems, setCartItems] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  // Coupon State
  const [selectedCoupon, setSelectedCoupon] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "appliedCoupon"
        );

      return saved
        ? JSON.parse(saved)
        : null;
    });

  // Save coupon automatically
  useEffect(() => {
    if (selectedCoupon) {
      localStorage.setItem(
        "appliedCoupon",
        JSON.stringify(selectedCoupon)
      );
    } else {
      localStorage.removeItem(
        "appliedCoupon"
      );
    }
  }, [selectedCoupon]);

  const refreshCart = async () => {
    try {
      const res = await getCart();

      setCartItems(
        Array.isArray(
          res.data.data?.items
        )
          ? res.data.data.items
          : []
      );
    } catch (err) {
      console.log(err);

      setCartItems([]);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

const addItem = async (
  product,
  quantity = 1
) => {
  setLoading(true);

  try {
    await addToCart({
      productId: product.productId || product.id,
      quantity: product.quantity || quantity,
      price: product.price,
      totalPrice: product.totalPrice,
      selectedSize: product.selectedSize,
      selectedVariant: product.selectedVariant,
      selectedAddons: product.selectedAddons,
    });

    await refreshCart();
  } finally {
    setLoading(false);
  }
};

  const updateItem = async (
    id,
    quantity
  ) => {
    await updateCartItem(
      id,
      quantity
    );

    await refreshCart();
  };

  const removeItem = async (
    id
  ) => {
    await removeFromCart(id);

    await refreshCart();
  };

  const clear = async () => {
    await clearCart();

    await refreshCart();

    setSelectedCoupon(null);
  };

  const totalItems = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum + item.quantity,
        0
      ),
    [cartItems]
  );

  const totalPrice = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum + item.total,
        0
      ),
    [cartItems]
  );

  const value = {
    cartItems,
    totalItems,
    totalPrice,
    loading,

    refreshCart,

    addItem,
    updateItem,
    removeItem,
    clear,

    selectedCoupon,
    setSelectedCoupon,
  };

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () =>
  useContext(CartContext);