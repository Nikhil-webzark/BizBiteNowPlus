import { create } from "zustand";
import API from "../services/api";

const useOrderStore = create((set, get) => ({
  // ===========================
  // STATES
  // ===========================
  orders: [], // list of orders (dashboard/history)
  counters: null, // aggregate dashboard stats (PRO+)
  clusters: [], // pending orders grouped by mohalla (PLUS)
  isLoading: false,
  error: null,

  // ===========================
  // ASSIGN ORDER TO DELIVERY BOY (protected, PLUS)
  // ===========================
  assignOrder: async (order_id, delivery_boy_id) => {
    try {
      set({ isLoading: true, error: null });

      const res = await API.post("/orders/assign", {
        order_id,
        delivery_boy_id,
      });

      const raw = res.data.order || res.data.data || res.data;

      set({
        orders: get().orders.map((o) =>
          o._id === order_id || o.id === order_id
            ? { ...o, ...raw }
            : o,
        ),
      });

      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Unable to assign order" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ===========================
  // LIST ORDERS (protected, tier-based history window)
  // ===========================
  fetchOrders: async (order_type) => {
    try {
      set({ isLoading: true, error: null });

      const params = {};
      if (order_type) params.order_type = order_type;

      const res = await API.get("/orders/list", { params });
      const list = res.data.orders || res.data.data || res.data;

      set({ orders: Array.isArray(list) ? list : [] });
      return list;
    } catch (err) {
      set({ error: err.response?.data?.message || "Unable to load orders" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ===========================
  // UPDATE DELIVERY STATUS (protected)
  // ===========================
  updateOrderStatus: async (id, targetStatus) => {
    try {
      set({ isLoading: true, error: null });

      const res = await API.put(`/orders/update/${id}`, {
        delivery_status: targetStatus,
      });

      const raw = res.data.order || res.data.data || res.data;

      set({
        orders: get().orders.map((o) =>
          o._id === id || o.id === id
            ? { ...o, ...raw, delivery_status: targetStatus }
            : o,
        ),
      });

      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Unable to update order status",
      });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ===========================
  // DELETE ORDER (protected)
  // ===========================
  deleteOrder: async (id) => {
    try {
      set({ isLoading: true, error: null });

      const res = await API.delete(`/orders/delete/${id}`);

      set({
        orders: get().orders.filter((o) => o._id !== id && o.id !== id),
      });

      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Unable to delete order" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ===========================
  // DASHBOARD COUNTERS (protected, PRO+)
  // ===========================
  fetchDashboardCounters: async () => {
    try {
      set({ isLoading: true, error: null });

      const res = await API.get("/orders/dashboard/counters");
      const raw = res.data.counters || res.data.data || res.data;

      set({ counters: raw });
      return raw;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Unable to load dashboard counters",
      });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ===========================
  // DASHBOARD CLUSTERS BY MOHALLA (protected, PLUS)
  // ===========================
  fetchDashboardClusters: async () => {
    try {
      set({ isLoading: true, error: null });

      const res = await API.get("/orders/dashboard/clusters");
      const list = res.data.clusters || res.data.data || res.data;

      set({ clusters: Array.isArray(list) ? list : [] });
      return list;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Unable to load order clusters",
      });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ===========================
  // MARK DINE-IN ORDER AS PAID (protected)
  // ===========================
  markDineInPaid: async (order_id) => {
    try {
      set({ isLoading: true, error: null });

      const res = await API.put(`/orders/dine-in/mark-paid/${order_id}`);
      const raw = res.data.order || res.data.data || res.data;

      set({
        orders: get().orders.map((o) =>
          o._id === order_id || o.id === order_id
            ? { ...o, ...raw }
            : o,
        ),
      });

      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Unable to mark order as paid",
      });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ===========================
  // VERIFY ORDER VIA MAGIC LINK (public, no auth — delivery boy)
  // ===========================
  verifyOrderToken: async (token) => {
    try {
      set({ isLoading: true, error: null });

      const res = await API.get(`/orders/verify/${token}`);
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Unable to verify order" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ===========================
  // LOCAL SELECTOR — find an order already in the store by any id shape
  // (no GET /orders/:id route exists, so OrderDetails relies on this)
  // ===========================
  getOrderById: (id) => {
    return get().orders.find(
      (o) =>
        o._id === id ||
        o.id === id ||
        String(o._id) === String(id) ||
        o.razorpay_order_id === id,
    );
  },

  // ===========================
  // RESET
  // ===========================
  reset: () => {
    set({
      orders: [],
      counters: null,
      clusters: [],
      isLoading: false,
      error: null,
    });
  },
}));

export default useOrderStore;