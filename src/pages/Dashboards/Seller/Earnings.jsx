import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";

import EarningsSummaryCards from "../../../components/dashboard/earnings/EarningsSummaryCards";
import EarningsChart from "../../../components/dashboard/earnings/EarningsChart";
import TodaysEarnings from "../../../components/dashboard/earnings/TodaysEarnings";
import CODPaymentTable from "../../../components/dashboard/earnings/CODPaymentTable";
import EarningsHistory from "../../../components/dashboard/earnings/EarningsHistory";
import RegularCustomers from "../../../components/dashboard/earnings/RegularCustomers";

import useEarningStore from "../../../store/earningStore";

export default function Earnings() {
  const {
    earningsSummary,
    earningsChartData,
    todaysOrders,
    earningsHistory,
    regularCustomers,
    fetchEarnings,
    loading,
    error,
  } = useEarningStore();

  const [search, setSearch] = useState("");
  const [range, setRange] = useState("30d");
  const [payment, setPayment] = useState("all");

  // Fetch earnings data on mount AND whenever the range filter changes
  // (range is now sent to the backend so the chart/history reflect the
  // selected window server-side, instead of just filtering client-side)
  useEffect(() => {
    let isMounted = true;
    fetchEarnings(range).catch((err) => {
      if (isMounted) console.error("Error loading earnings:", err);
    });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const handleRefresh = () => {
    setSearch("");
    setPayment("all");
    if (range === "30d") {
      // range unchanged -> effect above won't re-trigger, so fetch explicitly
      fetchEarnings("30d").catch((err) =>
        console.error("Error refreshing earnings:", err),
      );
    } else {
      setRange("30d"); // triggers the useEffect above
    }
  };

  // Filter Pipelines for Tables & Search
  const filteredOrders = useMemo(() => {
    return (todaysOrders || []).filter((order) => {
      const matchesSearch = `${order.customer} ${order.orderId}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesPayment =
        payment === "all"
          ? true
          : order.payment.toLowerCase() === payment.toLowerCase();

      return matchesSearch && matchesPayment;
    });
  }, [todaysOrders, search, payment]);

  const filteredHistory = useMemo(() => {
    return (earningsHistory || []).filter((item) =>
      item.date.toLowerCase().includes(search.toLowerCase()),
    );
  }, [earningsHistory, search]);

  const filteredCustomers = useMemo(() => {
    return (regularCustomers || []).filter(
      (customer) =>
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone.includes(search),
    );
  }, [regularCustomers, search]);

  // Excel Export Report Generator
  const handleExport = () => {
    const workbook = XLSX.utils.book_new();

    // 1. Summary Sheet
    const summaryData = [
      {
        "Today's Earnings": earningsSummary.todayEarnings,
        "Today's Orders": earningsSummary.todayOrders,
        "Average Order": earningsSummary.averageOrderValue,
        "COD Pending": earningsSummary.codPending,
        "Online Received": earningsSummary.onlineReceived,
        "Monthly Revenue": earningsSummary.monthlyRevenue,
      },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // 2. Orders Sheet
    const ordersSheet = XLSX.utils.json_to_sheet(
      filteredOrders.map((order) => ({
        OrderID: order.orderId,
        Customer: order.customer,
        Phone: order.phone,
        Payment: order.payment,
        Status: order.status,
        Amount: order.amount,
        Time: order.time,
      })),
    );
    XLSX.utils.book_append_sheet(workbook, ordersSheet, "Today Orders");

    // 3. History Sheet
    const historySheet = XLSX.utils.json_to_sheet(filteredHistory);
    XLSX.utils.book_append_sheet(workbook, historySheet, "History");

    // 4. Customers Sheet
    const customersSheet = XLSX.utils.json_to_sheet(filteredCustomers);
    XLSX.utils.book_append_sheet(workbook, customersSheet, "Customers");

    XLSX.writeFile(
      workbook,
      `Earnings_Report_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Earnings</h1>
          <p className="mt-2 text-slate-500">
            Track earnings, payments, customer spending and revenue trends.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={loading}
          className="rounded-xl bg-[#16522d] px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#114022] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export Excel Report
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <EarningsSummaryCards summary={earningsSummary} />

      <EarningsChart
        data={earningsChartData}
        filter={range}
        onFilterChange={setRange}
        onRefresh={handleRefresh}
      />

      <TodaysEarnings summary={earningsSummary} />

      <CODPaymentTable orders={filteredOrders} />

      <EarningsHistory history={filteredHistory} />

      <RegularCustomers customers={filteredCustomers} />
    </motion.div>
  );
}