import { create } from "zustand";
import { devtools } from "zustand/middleware";
import API from "../services/api";

const useDiscountStore = create(
  devtools((set) => ({
  // STATES

  discounts: [],
  appliedDiscount: null,

  loading: false,
  error: null,

  // ===========================
  // CREATE DISCOUNT (seller, PRO/PLUS)

  createDiscount: async (payload) => {
    try {
      set({ loading: true, error: null });
      const res = await API.post("/discounts/", payload);
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Could not create discount",
      });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // ===========================
  // GET DISCOUNTS (list all)

  getDiscounts: async () => {
    try {
      set({ loading: true, error: null });
      const res = await API.get("/discounts/");
      const discounts = res.data?.discounts ?? res.data ?? [];
      set({ discounts });
      return discounts;
    } catch (err) {
      set({ error: err.response?.data?.message || "Could not load discounts" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // ===========================
  // UPDATE DISCOUNT

  updateDiscount: async (id, payload) => {
    try {
      set({ loading: true, error: null });
      const res = await API.put(`/discounts/${id}`, payload);
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Could not update discount",
      });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // ===========================
  // DELETE DISCOUNT

  deleteDiscount: async (id) => {
    try {
      set({ loading: true, error: null });
      const res = await API.delete(`/discounts/${id}`);
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Could not deactivate discount",
      });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // ===========================
  // CHECK DISCOUNT (public - validate code)

  checkDiscount: async (code, sellerId, customerPhone, cartTotal) => {
    try {
      set({ loading: true, error: null });
      const res = await API.post("/discounts/check", {
        code,
        seller_id: sellerId,
        customer_phone: customerPhone,
        cart_total: cartTotal,
      });
      set({ appliedDiscount: res.data });
      return res.data;
    } catch (err) {
      set({
        appliedDiscount: null,
        error: err.response?.data?.message || "Invalid or expired code",
      });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  clearAppliedDiscount: () => set({ appliedDiscount: null, error: null }),
  }),
  { name: "DiscountStore" },
  ),
);

export default useDiscountStore;
