import { create } from "zustand";
import * as orderApi from "../api/customers/orderApi";

const initialLoadingState = {
  fetchOrders: false,
  createOrder: false,
  reorder: false,
  checkout: false,
  verifyPayment: false,
  dineIn: false,
};

const useOrderStore = create((set, get) => ({
  // State
  orders: [],
  currentOrder: null,
  checkout: null,

  cartItems: [],

  loading: { ...initialLoadingState },

  error: null,

  // Utility Actions

  clearError: () => set({ error: null }),

  clearCurrentOrder: () => set({ currentOrder: null }),

  reset: () =>
    set({
      orders: [],
      currentOrder: null,
      checkout: null,
      cartItems: [],
      loading: { ...initialLoadingState },
      error: null,
    }),

  // Cart Actions

  setCartItems: (items) => set({ cartItems: items }),

  clearCartItems: () => set({ cartItems: [] }),

  addCartItem: (item) =>
    set((state) => {
      const existing = state.cartItems.find(
        (i) => i.productId === item.productId && i.variantId === item.variantId,
      );

      if (existing) {
        return {
          cartItems: state.cartItems.map((i) =>
            i.productId === item.productId && i.variantId === item.variantId
              ? {
                  ...i,
                  quantity: i.quantity + item.quantity,
                }
              : i,
          ),
        };
      }

      return {
        cartItems: [...state.cartItems, item],
      };
    }),

  updateCartItem: (productId, variantId, quantity) =>
    set((state) => ({
      cartItems:
        quantity <= 0
          ? state.cartItems.filter(
              (i) => !(i.productId === productId && i.variantId === variantId),
            )
          : state.cartItems.map((i) =>
              i.productId === productId && i.variantId === variantId
                ? {
                    ...i,
                    quantity,
                  }
                : i,
            ),
    })),

  removeCartItem: (productId, variantId) =>
    set((state) => ({
      cartItems: state.cartItems.filter(
        (i) => !(i.productId === productId && i.variantId === variantId),
      ),
    })),

  getSubtotal: () =>
    get().cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),

  getTotalItems: () =>
    get().cartItems.reduce((sum, item) => sum + item.quantity, 0),

  // Fetch Customer Orders

  fetchOrders: async (params = {}) => {
    set((state) => ({
      loading: {
        ...state.loading,
        fetchOrders: true,
      },
      error: null,
    }));

    try {
      const response = await orderApi.getCustomerOrders(params);

      set((state) => ({
        orders: response.orders || [],
        loading: {
          ...state.loading,
          fetchOrders: false,
        },
      }));

      return response;
    } catch (error) {
      set((state) => ({
        loading: {
          ...state.loading,
          fetchOrders: false,
        },
        error,
      }));

      throw error;
    }
  },

  // Fetch Single Order

  fetchOrder: async (orderId) => {
    try {
      const response = await orderApi.getCustomerOrder(orderId);

      set({
        currentOrder: response.order ?? response,
      });

      return response;
    } catch (error) {
      set({ error });
      throw error;
    }
  },

  // Create Order

  createOrder: async (payload) => {
    set((state) => ({
      loading: {
        ...state.loading,
        createOrder: true,
      },
      error: null,
    }));

    try {
      const response = await orderApi.createOrder(payload);

      set((state) => ({
        currentOrder: response.order,
        loading: {
          ...state.loading,
          createOrder: false,
        },
      }));

      return response;
    } catch (error) {
      set((state) => ({
        loading: {
          ...state.loading,
          createOrder: false,
        },
        error,
      }));

      throw error;
    }
  },

  // Reorder

  reorder: async (payload) => {
    set((state) => ({
      loading: {
        ...state.loading,
        reorder: true,
      },
      error: null,
    }));

    try {
      const response = await orderApi.reorder(payload);

      set((state) => ({
        currentOrder: response.order,
        loading: {
          ...state.loading,
          reorder: false,
        },
      }));

      return response;
    } catch (error) {
      set((state) => ({
        loading: {
          ...state.loading,
          reorder: false,
        },
        error,
      }));

      throw error;
    }
  },

  // Cancel Order

  cancelOrder: async (orderId) => {
    try {
      const response = await orderApi.cancelOrder(orderId);

      await get().fetchOrders();

      return response;
    } catch (error) {
      set({ error });
      throw error;
    }
  },

  // Track Order

  trackOrder: async (orderId) => {
    return await orderApi.trackOrder(orderId);
  },

  // Checkout

  initiateCheckout: async (payload) => {
    set((state) => ({
      loading: {
        ...state.loading,
        checkout: true,
      },
      error: null,
    }));

    try {
      const response = await orderApi.initiateCheckout(payload);

      set((state) => ({
        checkout: response,
        loading: {
          ...state.loading,
          checkout: false,
        },
      }));

      return response;
    } catch (error) {
      set((state) => ({
        loading: {
          ...state.loading,
          checkout: false,
        },
        error,
      }));

      throw error;
    }
  },

  // Verify Payment

  verifyPayment: async (payload) => {
    set((state) => ({
      loading: {
        ...state.loading,
        verifyPayment: true,
      },
      error: null,
    }));

    try {
      const response = await orderApi.verifyCheckout(payload);

      set((state) => ({
        loading: {
          ...state.loading,
          verifyPayment: false,
        },
      }));

      return response;
    } catch (error) {
      set((state) => ({
        loading: {
          ...state.loading,
          verifyPayment: false,
        },
        error,
      }));

      throw error;
    }
  },

  // Dine-In Order

  createDineInOrder: async (payload) => {
    set((state) => ({
      loading: {
        ...state.loading,
        dineIn: true,
      },
      error: null,
    }));

    try {
      const response = await orderApi.createDineInOrder(payload);

      set((state) => ({
        currentOrder: response.order,
        loading: {
          ...state.loading,
          dineIn: false,
        },
      }));

      return response;
    } catch (error) {
      set((state) => ({
        loading: {
          ...state.loading,
          dineIn: false,
        },
        error,
      }));

      throw error;
    }
  },
  getCurrentOrders: () =>
    get().orders.filter(
      (order) => !["Delivered", "Cancelled"].includes(order.delivery_status),
    ),

  getOrderHistory: () =>
    get().orders.filter((order) =>
      ["Delivered", "Cancelled"].includes(order.delivery_status),
    ),
}));

export default useOrderStore;
