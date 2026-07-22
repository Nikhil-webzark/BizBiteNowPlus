import { create } from "zustand";
import API from "../services/api";

const useEarningStore = create((set) => ({
  // ===========================
  // STATES
  // ===========================
  earningsSummary: {
    todayEarnings: 0,
    todayOrders: 0,
    averageOrderValue: 0,
    codPending: 0,
    onlineReceived: 0,
    monthlyRevenue: 0,
  },
  earningsChartData: [], // chart series (day/week/month wise)
  todaysOrders: [], // today's COD/online payment breakdown
  earningsHistory: [], // historical earnings list (date-wise)
  regularCustomers: [], // repeat customers with spend info
  loading: false,
  error: null,

  // ===========================
  // FETCH ALL EARNINGS DATA (protected)
  // NOTE: Assumes a single dashboard-style endpoint returning everything
  // the Earnings page needs. Adjust the URL / response mapping below if
  // the actual backend exposes separate routes instead.
  // ===========================
  fetchEarnings: async (range) => {
    try {
      set({ loading: true, error: null });

      const params = {};
      if (range) params.range = range;

      const res = await API.get("/earnings/dashboard", { params });
      const raw = res.data.data || res.data;

      set({
        earningsSummary: raw.earningsSummary ||
          raw.summary || {
            todayEarnings: 0,
            todayOrders: 0,
            averageOrderValue: 0,
            codPending: 0,
            onlineReceived: 0,
            monthlyRevenue: 0,
          },
        earningsChartData: Array.isArray(raw.earningsChartData)
          ? raw.earningsChartData
          : Array.isArray(raw.chartData)
            ? raw.chartData
            : [],
        todaysOrders: Array.isArray(raw.todaysOrders)
          ? raw.todaysOrders
          : Array.isArray(raw.todayOrders)
            ? raw.todayOrders
            : [],
        earningsHistory: Array.isArray(raw.earningsHistory)
          ? raw.earningsHistory
          : Array.isArray(raw.history)
            ? raw.history
            : [],
        regularCustomers: Array.isArray(raw.regularCustomers)
          ? raw.regularCustomers
          : Array.isArray(raw.customers)
            ? raw.customers
            : [],
      });

      return raw;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Unable to load earnings data",
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
      earningsSummary: {
        todayEarnings: 0,
        todayOrders: 0,
        averageOrderValue: 0,
        codPending: 0,
        onlineReceived: 0,
        monthlyRevenue: 0,
      },
      earningsChartData: [],
      todaysOrders: [],
      earningsHistory: [],
      regularCustomers: [],
      loading: false,
      error: null,
    });
  },
}));

export default useEarningStore;