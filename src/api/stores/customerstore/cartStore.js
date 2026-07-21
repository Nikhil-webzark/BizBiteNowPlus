import { create } from "zustand";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../customer/cartApi";

const initialState = {
  cart: null,
  items: [],
  loading: false,
  updating: false,
  error: null,
};

const useCartStore = create((set, get) => ({
  ...initialState,

  /* -------------------------------------------------------------------------- */
  /*                                  HELPERS                                   */
  /* -------------------------------------------------------------------------- */

  setCart(cart) {
    set({
      cart,
      items: cart?.items ?? [],
      error: null,
    });
  },

  resetCart() {
    set(initialState);
  },

  clearError() {
    set({ error: null });
  },

  /* -------------------------------------------------------------------------- */
  /*                                FETCH CART                                  */
  /* -------------------------------------------------------------------------- */

  async fetchCart() {
    try {
      set({
        loading: true,
        error: null,
      });

      const response = await getCart();

      const cart =
        response?.data ??
        response?.cart ??
        response;

      set({
        cart,
        items: cart?.items ?? [],
        loading: false,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error,
      });

      throw error;
    }
  },

  /* -------------------------------------------------------------------------- */
  /*                                ADD TO CART                                 */
  /* -------------------------------------------------------------------------- */

  async addToCart(payload) {
    try {
      set({
        updating: true,
        error: null,
      });

      const response = await addToCart(payload);

      const cart =
        response?.data ??
        response?.cart ??
        response;

      set({
        cart,
        items: cart?.items ?? [],
        updating: false,
      });

      return response;
    } catch (error) {
      set({
        updating: false,
        error,
      });

      throw error;
    }
  },

  /* -------------------------------------------------------------------------- */
  /*                              UPDATE QUANTITY                               */
  /* -------------------------------------------------------------------------- */

  async updateCartItem(itemId, quantity) {
    try {
      set({
        updating: true,
        error: null,
      });

      const response = await updateCartItem(
        itemId,
        quantity
      );

      const cart =
        response?.data ??
        response?.cart ??
        response;

      set({
        cart,
        items: cart?.items ?? [],
        updating: false,
      });

      return response;
    } catch (error) {
      set({
        updating: false,
        error,
      });

      throw error;
    }
  },

  /* -------------------------------------------------------------------------- */
  /*                               REMOVE ITEM                                  */
  /* -------------------------------------------------------------------------- */

  async removeCartItem(itemId) {
    try {
      set({
        updating: true,
        error: null,
      });

      const response = await removeCartItem(
        itemId
      );

      const cart =
        response?.data ??
        response?.cart ??
        response;

      set({
        cart,
        items: cart?.items ?? [],
        updating: false,
      });

      return response;
    } catch (error) {
      set({
        updating: false,
        error,
      });

      throw error;
    }
  },

  /* -------------------------------------------------------------------------- */
  /*                                CLEAR CART                                  */
  /* -------------------------------------------------------------------------- */

  async clearCart() {
    try {
      set({
        updating: true,
        error: null,
      });

      const response = await clearCart();

      set({
        cart: null,
        items: [],
        updating: false,
      });

      return response;
    } catch (error) {
      set({
        updating: false,
        error,
      });

      throw error;
    }
  },
}));

export default useCartStore;