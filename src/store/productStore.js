import { create } from "zustand";
import API from "../services/api";

const useProductStore = create((set, get) => ({
  // ===========================
  // STATES
  // ===========================

  products: [], // seller's own products (dashboard)
  storefront: [], // public storefront product list
  categories: [], // public storefront categories

  loading: false,
  error: null,

  // ===========================
  // ADD PRODUCT (multipart, protected)
  // ===========================

  addProduct: async (formData) => {
    // formData must be a FormData instance (multipart image + fields)
    try {
      set({ loading: true, error: null });

      const res = await API.post("/product/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const raw = res.data.product || res.data.data || res.data;
      const product = { ...raw, available: raw.is_available ?? raw.available };

      set({ products: [product, ...get().products] });

      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Unable to add product" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // ===========================
  // UPDATE PRODUCT (multipart optional image, protected)
  // ===========================

  updateProduct: async (id, formData) => {
    try {
      set({ loading: true, error: null });

      const res = await API.put(`/product/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const raw = res.data.product || res.data.data || res.data;
      const updated = { ...raw, available: raw.is_available ?? raw.available };

      set({
        products: get().products.map((p) =>
          p._id === id ? { ...p, ...updated } : p,
        ),
      });

      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Unable to update product" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // ===========================
  // DELETE PRODUCT (protected)
  // ===========================

  deleteProduct: async (id) => {
    try {
      set({ loading: true, error: null });

      const res = await API.delete(`/product/delete/${id}`);

      set({
        products: get().products.filter((p) => p._id !== id),
      });

      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Unable to delete product" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // ===========================
  // GET ALL SELLER PRODUCTS (dashboard, protected)
  // ===========================

  fetchDashboardProducts: async () => {
    try {
      set({ loading: true, error: null });

      const res = await API.get("/product/dashboard/all");

      const rawList = res.data.products || res.data.data || res.data;

      // Backend sends `is_available`, UI everywhere checks `available` — normalize.
      const list = rawList.map((p) => ({
        ...p,
        available: p.is_available ?? p.available,
      }));

      set({ products: list });

      return list;
    } catch (err) {
      set({ error: err.response?.data?.message || "Unable to load products" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // ===========================
  // STOREFRONT — SAME LIST, PUBLIC (reuses getSellerProducts)
  // ===========================

  fetchStorefrontBySeller: async (sellerId) => {
    try {
      set({ loading: true, error: null });

      const res = await API.get(`/product/storefront/${sellerId}`);

      const list = res.data.products || res.data.data || res.data;

      set({ storefront: list });

      return list;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Unable to load storefront",
      });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // ===========================
  // STOREFRONT CATALOG (public, filter by category/search)
  // ===========================

  fetchStorefrontCatalog: async (sellerId, { category, search } = {}) => {
    try {
      set({ loading: true, error: null });

      const params = {};
      if (category) params.category = category;
      if (search) params.search = search;

      const res = await API.get(`/product/${sellerId}/products`, { params });

      const list = res.data.products || res.data.data || res.data;

      set({ storefront: list });

      return list;
    } catch (err) {
      set({ error: err.response?.data?.message || "Unable to load catalog" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // ===========================
  // STOREFRONT CATEGORIES (public)
  // ===========================

  fetchStorefrontCategories: async (sellerId) => {
    try {
      set({ loading: true, error: null });

      const res = await API.get(`/product/${sellerId}/categories`);

      const list = res.data.categories || res.data.data || res.data;

      set({ categories: list });

      return list;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Unable to load categories",
      });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // ===========================
  // RESET
  // ===========================

  reset: () => {
    set({
      products: [],
      storefront: [],
      categories: [],
      loading: false,
      error: null,
    });
  },
}));

export default useProductStore;
