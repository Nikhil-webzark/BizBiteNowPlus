/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../api/customerApi";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Coupon State
  const [selectedCoupon, setSelectedCoupon] = useState(() => {
    const saved = localStorage.getItem("appliedCoupon");
    return saved ? JSON.parse(saved) : null;
  });

  // Save coupon automatically
  useEffect(() => {
    if (selectedCoupon) {
      localStorage.setItem("appliedCoupon", JSON.stringify(selectedCoupon));
    } else {
      localStorage.removeItem("appliedCoupon");
    }
  }, [selectedCoupon]);

  const refreshCart = useCallback(async () => {
    // 🔒 ROLE GUARD: Check if the user is a Seller or Admin
    const authData = localStorage.getItem("bizbite-auth");
    let role = "";
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        role = parsed?.state?.user?.role || parsed?.role || "";
      } catch (e) {
        console.error("Auth parsing error:", e);
      }
    }

    // Agar user Seller ya Admin hai, toh Customer Cart polling skip kar do!
    if (role.toLowerCase() === "seller" || role.toLowerCase() === "admin") {
      setCartItems([]);
      return;
    }

    try {
      const res = await getCart();
      setCartItems(
        Array.isArray(res.data.data?.items)
          ? res.data.data.items
          : Array.isArray(res.data?.items)
          ? res.data.items
          : []
      );
    } catch (err) {
      // 🛑 403 Forbidden error handled silently
      if (err.response?.status === 403) {
        setCartItems([]);
        return;
      }
      console.warn("Cart refresh error:", err);
      setCartItems([]);
    }
  }, []);

  // Async task boundary ensures state updates don't trigger cascading render errors
  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        refreshCart();
      }
    });
    return () => {
      isMounted = false;
    };
  }, [refreshCart]);

  const addItem = async (product, quantity = 1) => {
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
    } catch (err) {
      console.error("Failed adding item to cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id, quantity) => {
    try {
      await updateCartItem(id, quantity);
      await refreshCart();
    } catch (err) {
      console.error("Failed updating cart item:", err);
    }
  };

  const removeItem = async (id) => {
    try {
      await removeFromCart(id);
      await refreshCart();
    } catch (err) {
      console.error("Failed removing cart item:", err);
    }
  };

  const clear = async () => {
    try {
      await clearCart();
      await refreshCart();
      setSelectedCoupon(null);
    } catch (err) {
      console.error("Failed clearing cart:", err);
    }
  };

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [cartItems]
  );

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.total || item.price * item.quantity || 0), 0),
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
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);