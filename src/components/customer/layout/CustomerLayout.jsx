import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import DesktopSidebar from "./DesktopSidebar";
import CustomerHeader from "./CustomerHeader";
import BottomNavigation from "./BottomNavigation";
import FloatingCartButton from "./FloatingCartButton";

import { useCart } from "../../../context/CartContext";

import { logoutCustomer } from "../../../api/customer/authApi";
import { getStore } from "../../../api/customerApi";

const CustomerLayout = () => {
  const { totalItems, totalPrice } = useCart();

  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarExpanded, setSidebarExpanded] =
    useState(false);

  const [isDesktop, setIsDesktop] =
    useState(window.innerWidth >= 1024);

  const [store, setStore] =
    useState(null);

  const isRestaurantOpen = true
    // store?.timings?.status?.toLowerCase() ===
    // "open";

  const handleLogout = async () => {
    await logoutCustomer();
    navigate("/", {
      replace: true,
    });
  };

  const hideFloatingCart = ["/customer/cart", "/customer/checkout"].includes(
    location.pathname,
  );

  useEffect(() => {
    const handleResize = () =>
      setIsDesktop(
        window.innerWidth >= 1024
      );

    window.addEventListener(
      "resize",
      handleResize
    );

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

  useEffect(() => {
    const loadStore = async () => {
      try {
        const res =
          await getStore();

        setStore(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadStore();
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      !isRestaurantOpen
        ? "hidden"
        : "";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [isRestaurantOpen]);
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-100 dark:bg-[#1E2021] transition-colors duration-300">
      {/* ========================= */}
      {/* Blurred App */}
      {/* ========================= */}

      <div
        className={`transition-all duration-300 ${
          !isRestaurantOpen
            ? "blur-[4px] pointer-events-none select-none"
            : ""
        }`}
      >
        {/* Sidebar */}

        <DesktopSidebar
          expanded={sidebarExpanded}
          setExpanded={setSidebarExpanded}
          onLogout={handleLogout}
        />

        {/* Main */}

        <main
          className="min-h-screen transition-all duration-300"
          style={{
            paddingLeft:
              window.innerWidth >= 1024
                ? sidebarExpanded
                  ? "17rem"
                  : "7.5rem"
                : "0rem",
          }}>
          {location.pathname === "/customer" && (
            <CustomerHeader
              sidebarExpanded={sidebarExpanded}
              isDesktop={isDesktop}
            />
          )}

         <div
  className={`w-full ${
    location.pathname === "/customer" ? "lg:pt-0" : "lg:pt-0"
  }`}
>
            <Outlet />
          </div>
        </main>

        {!hideFloatingCart && (
          <FloatingCartButton totalItems={totalItems} totalPrice={totalPrice} />
        )}

        <BottomNavigation />
      </div>

      {/* ========================= */}
      {/* Store Closed Overlay */}
      {/* ========================= */}

      {!isRestaurantOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-5 w-full max-w-md rounded-3xl bg-white dark:bg-[#181A1B] p-8 text-center shadow-2xl">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Store Closed
            </h2>

            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              We're currently not accepting orders.
            </p>

            <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
              Please visit us again during our business hours.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLayout;
