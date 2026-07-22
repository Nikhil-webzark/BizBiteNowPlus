import { create } from "zustand";
import API from "../services/api";

const savedTable = (() => {
  try {
    return JSON.parse(localStorage.getItem("resolvedTable"));
  } catch {
    return null;
  }
})();

const useTableStore = create((set, get) => ({
  // ===========================
  // STATE
  // ===========================

  resolvedTable: savedTable,

  loading: false,

  error: null,

  // ===========================
  // RESOLVE TABLE
  // ===========================

  resolveTable: async (token) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res = await API.get(`/tables/resolve/${token}`);

      // Supports different backend response shapes
      const table =
        res.data.table ||
        res.data.data ||
        res.data;

      set({
        resolvedTable: table,
      });

      localStorage.setItem(
        "resolvedTable",
        JSON.stringify(table)
      );

      return table;
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          "Unable to resolve table",
      });

      throw err;
    } finally {
      set({
        loading: false,
      });
    }
  },

  // ===========================
  // UPDATE TABLE
  // ===========================

  setResolvedTable: (table) => {
    set({
      resolvedTable: table,
    });

    localStorage.setItem(
      "resolvedTable",
      JSON.stringify(table)
    );
  },

  // ===========================
  // CLEAR TABLE
  // ===========================

  clearTable: () => {
    localStorage.removeItem("resolvedTable");

    set({
      resolvedTable: null,
      error: null,
    });
  },

  // ===========================
  // REFRESH FROM STORAGE
  // ===========================

  hydrate: () => {
    try {
      const table = JSON.parse(
        localStorage.getItem("resolvedTable")
      );

      set({
        resolvedTable: table,
      });
    } catch {
      set({
        resolvedTable: null,
      });
    }
  },

  // ===========================
  // HELPERS
  // ===========================

  isTableResolved: () => {
    return !!get().resolvedTable;
  },

  getSellerId: () => {
    return (
      get().resolvedTable?.seller_id ||
      null
    );
  },

  getTableNumber: () => {
    return (
      get().resolvedTable?.table_number ||
      null
    );
  },

  // ===========================
  // RESET
  // ===========================

  reset: () => {
    localStorage.removeItem("resolvedTable");

    set({
      resolvedTable: null,
      loading: false,
      error: null,
    });
  },
}));

export default useTableStore;