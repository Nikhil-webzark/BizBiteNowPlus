import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import CustomerHeader from "./CustomerHeader";

// 💡 Agar aapke paas store store/hook hai toh use import karein:
// import useStoreStore from "../../api/stores/customerstore/storeStore";

const CustomerLayout = () => {
  const { sellerId } = useParams();

  // 1. Synchronize Seller ID to localStorage whenever layout mounts or URL changes
  useEffect(() => {
    if (sellerId) {
      localStorage.setItem("seller_id", sellerId);
    }
  }, [sellerId]);

  // 2. Safe Store Loader (handles getStore reference gracefully)
  useEffect(() => {
    const loadStore = async () => {
      try {
        // Agar window par ya store store mein getStore function available hai:
        if (typeof window !== "undefined" && typeof window.getStore === "function") {
          await window.getStore();
        }
      } catch (err) {
        console.error("Failed to load store in layout:", err);
      }
    };

    loadStore();
  }, []);

  return (
    <div
      className="bg-[#FAFAF5] min-h-screen"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <CustomerHeader />
      <div className="flex">
        <CustomerSidebar />
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;