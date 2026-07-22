import { create } from "zustand";
import * as orderApi from "../../customer/orderApi";

const initialLoadingState = {
  fetchOrders: false,
  fetchOrder: false,
  createOrder: false,
  reorder: false,
  cancelOrder: false,
  checkout: false,
  verifyPayment: false,
  trackOrder: false,
  dineIn: false,
};

const useOrderStore = create((set, get) => {
  const setLoading = (key, value) =>
    set((state) => ({
      loading: {
        ...state.loading,
        [key]: value,
      },
    }));

  const setError = (error = null) => set({ error });

  return {
    /* -------------------------------------------------------------------------- */
    /*                                   STATE                                    */
    /* -------------------------------------------------------------------------- */

    orders: [],
    currentOrder: null,

    checkoutSession: null,
    tracking: null,

    cartItems: [],

    loading: { ...initialLoadingState },

    error: null,

    /* -------------------------------------------------------------------------- */
    /*                                  HELPERS                                   */
    /* -------------------------------------------------------------------------- */

    clearError: () => setError(),

    clearCurrentOrder: () =>
      set({
        currentOrder: null,
        tracking: null,
      }),

    reset: () =>
      set({
        orders: [],
        currentOrder: null,
        checkoutSession: null,
        tracking: null,
        cartItems: [],
        loading: { ...initialLoadingState },
        error: null,
      }),

    /* -------------------------------------------------------------------------- */
    /*                               CART ACTIONS                                 */
    /* -------------------------------------------------------------------------- */

    setCartItems: (items) => set({ cartItems: items }),

    clearCartItems: () => set({ cartItems: [] }),

    addCartItem: (item) =>
      set((state) => {
        const existing = state.cartItems.find(
          (i) =>
            i.productId === item.productId &&
            i.variantId === item.variantId
        );

        if (existing) {
          return {
            cartItems: state.cartItems.map((i) =>
              i.productId === item.productId &&
              i.variantId === item.variantId
                ? {
                    ...i,
                    quantity: i.quantity + item.quantity,
                  }
                : i
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
                (i) =>
                  !(
                    i.productId === productId &&
                    i.variantId === variantId
                  )
              )
            : state.cartItems.map((i) =>
                i.productId === productId &&
                i.variantId === variantId
                  ? { ...i, quantity }
                  : i
              ),
      })),

    removeCartItem: (productId, variantId) =>
      set((state) => ({
        cartItems: state.cartItems.filter(
          (i) =>
            !(
              i.productId === productId &&
              i.variantId === variantId
            )
        ),
      })),

    getSubtotal: () =>
      get().cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),

    getTotalItems: () =>
      get().cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),

    /* -------------------------------------------------------------------------- */
    /*                              FETCH ORDERS                                  */
    /* -------------------------------------------------------------------------- */

    fetchOrders: async (params = {}) => {
      setLoading("fetchOrders", true);
      setError();

      try {
        // 1. Read Zustand persisted state from 'bizbite-auth'
        let authState = {};
        try {
          const rawAuth = localStorage.getItem("bizbite-auth");
          if (rawAuth) {
            authState = JSON.parse(rawAuth)?.state || {};
          }
        } catch (e) {
          console.error("Failed to parse bizbite-auth from localStorage", e);
        }

        // 2. Extract URL params if present
        const urlParams = new URLSearchParams(window.location.search);
        const urlSellerId = urlParams.get("seller_id") || urlParams.get("seller");

        // 3. Extract phone number safely
        const customer_phone =
          params?.customer_phone ||
          authState?.user?.phone ||
          authState?.user?.phoneNumber ||
          localStorage.getItem("customer_phone") ||
          localStorage.getItem("user_phone");

        // 4. Extract seller_id safely
        const seller_id =
          params?.seller_id ||
          authState?.user?.seller_id ||
          authState?.profile?.seller_id ||
          urlSellerId ||
          localStorage.getItem("seller_id") ||
          localStorage.getItem("current_seller_id");

        const queryParams = {
          ...params,
          seller_id,
          customer_phone,
        };

        const response = await orderApi.getCustomerOrders(queryParams);

        set({
          orders:
            response?.orders ??
            response?.data ??
            [],
        });

        return response;
      } catch (error) {
        setError(error);
        throw error;
      } finally {
        setLoading("fetchOrders", false);
      }
    },

    fetchOrder: async (orderId) => {
      setLoading("fetchOrder", true);
      setError();

      try {
        const response =
          await orderApi.getCustomerOrder(orderId);

        set({
          currentOrder:
            response?.order ??
            response?.data ??
            response,
        });

        return response;
      } catch (error) {
        setError(error);
        throw error;
      } finally {
        setLoading("fetchOrder", false);
      }
    },

    /* -------------------------------------------------------------------------- */
    /*                               CREATE ORDER                                 */
    /* -------------------------------------------------------------------------- */

    createOrder: async (payload) => {
      setLoading("createOrder", true);
      setError();

      try {
        const response =
          await orderApi.createOrder(payload);

        const order =
          response?.order ??
          response?.data;

        set((state) => ({
          currentOrder: order,
          orders: order
            ? [order, ...state.orders]
            : state.orders,
        }));

        return response;
      } catch (error) {
        setError(error);
        throw error;
      } finally {
        setLoading("createOrder", false);
      }
    },

    /* -------------------------------------------------------------------------- */
    /*                                  REORDER                                   */
    /* -------------------------------------------------------------------------- */

    reorder: async (payload) => {
      setLoading("reorder", true);
      setError();

      try {
        const response =
          await orderApi.reorder(payload);

        const order =
          response?.order ??
          response?.data;

        set((state) => ({
          currentOrder: order,
          orders: order
            ? [order, ...state.orders]
            : state.orders,
        }));

        return response;
      } catch (error) {
        setError(error);
        throw error;
      } finally {
        setLoading("reorder", false);
      }
    },

    /* -------------------------------------------------------------------------- */
    /*                               CANCEL ORDER                                 */
    /* -------------------------------------------------------------------------- */

    cancelOrder: async (orderId) => {
      setLoading("cancelOrder", true);
      setError();

      try {
        const response =
          await orderApi.cancelOrder(orderId);

        set((state) => ({
          orders: state.orders.map((order) =>
            order._id === orderId ||
            order.id === orderId
              ? {
                  ...order,
                  delivery_status:
                    "Cancelled",
                  status:
                    "Cancelled",
                }
              : order
          ),
        }));

        return response;
      } catch (error) {
        setError(error);
        throw error;
      } finally {
        setLoading("cancelOrder", false);
      }
    },

    /* -------------------------------------------------------------------------- */
    /*                                TRACK ORDER                                 */
    /* -------------------------------------------------------------------------- */

    trackOrder: async (orderId) => {
      setLoading("trackOrder", true);
      setError();

      try {
        const response =
          await orderApi.trackOrder(orderId);

        set({
          tracking:
            response?.tracking ??
            response?.data ??
            response,
        });

        return response;
      } catch (error) {
        setError(error);
        throw error;
      } finally {
        setLoading("trackOrder", false);
      }
    },

    /* -------------------------------------------------------------------------- */
    /*                                  CHECKOUT                                  */
    /* -------------------------------------------------------------------------- */

    initiateCheckout: async (payload) => {
      setLoading("checkout", true);
      setError();

      try {
        const response =
          await orderApi.initiateCheckout(payload);

        set({
          checkoutSession: response,
        });

        return response;
      } catch (error) {
        setError(error);
        throw error;
      } finally {
        setLoading("checkout", false);
      }
    },

    verifyPayment: async (payload) => {
      setLoading("verifyPayment", true);
      setError();

      try {
        return await orderApi.verifyCheckout(payload);
      } catch (error) {
        setError(error);
        throw error;
      } finally {
        setLoading("verifyPayment", false);
      }
    },

    /* -------------------------------------------------------------------------- */
    /*                                   DINE-IN                                  */
    /* -------------------------------------------------------------------------- */

    createDineInOrder: async (payload) => {
      setLoading("dineIn", true);
      setError();

      try {
        const response =
          await orderApi.createDineInOrder(payload);

        const order =
          response?.order ??
          response?.data;

        set((state) => ({
          currentOrder: order,
          orders: order
            ? [order, ...state.orders]
            : state.orders,
        }));

        return response;
      } catch (error) {
        setError(error);
        throw error;
      } finally {
        setLoading("dineIn", false);
      }
    },

    /* -------------------------------------------------------------------------- */
    /*                                   GETTERS                                  */
    /* -------------------------------------------------------------------------- */

    getCurrentOrders: () =>
      get().orders.filter(
        (order) =>
          !["Delivered", "Cancelled"].includes(
            order.delivery_status ??
              order.status
          )
      ),

    getOrderHistory: () =>
      get().orders.filter((order) =>
        ["Delivered", "Cancelled"].includes(
          order.delivery_status ??
            order.status
        )
      ),
  };
});

export default useOrderStore;