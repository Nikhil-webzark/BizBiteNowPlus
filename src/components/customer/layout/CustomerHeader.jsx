import {
  Bell,
  User,
  ShoppingCart,
  Gift,
  ShoppingBag,
  MapPin,
  ChevronDown,
  Plus,
  Navigation,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";


import { useCart } from "../../../context/CartContext";

import { getStore, getNotifications } from "../../../api/customerApi";

const CustomerHeader = ({ sidebarExpanded, isDesktop }) => {
  const navigate = useNavigate();

  const [store, setStore] = useState({});

  const [notifications, setNotifications] = useState([]);

  const [notificationOpen, setNotificationOpen] = useState(false);

  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    title: "Select your location",
  });
  const wrapperRef = useRef(null);
  const { cartItems } = useCart();

const cartCount = cartItems.reduce(
  (total, item) => total + (item.quantity || 1),
  0
);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [storeRes, notificationRes] = await Promise.all([
          getStore(),
          getNotifications(),
        ]);

        setStore(storeRes.data.data || storeRes.data || {});

        setNotifications(
          notificationRes.data.data || notificationRes.data || [],
        );
      } catch (error) {
        console.error("Header API Error:", error);
      }
    };

    loadData();
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setNotificationOpen(false);
        setLocationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);




  const getNotificationIcon = (type) => {
    if (type === "reward") return Gift;

    return ShoppingBag;
  };

  const storeAddress = store?.address
    ? `${store.address.line1 ?? ""}, ${store.address.city ?? ""}`
    : "Tap to view restaurant";

  const storeLogo = store?.logo;
  const detectLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          );

          const data = await res.json();

          const address = data.address || {};

          setSelectedLocation({
            title: address.suburb || address.city || address.town,

            subtitle: data.display_name,
          });

          setLocationOpen(false);
        } catch (err) {
          console.log(err);
        }
      },
      (err) => {
        alert("Location permission denied.");
      },
    );
  };
  return (
<header
  className="
    relative
    z-50
    transition-all
    duration-300
    ease-in-out


    lg:pr-10
    lg:px-2
  "
  style={
    isDesktop
      ? {

          width: sidebarExpanded
            ? "calc(100% + 2rem)"
            : "calc(100% - 0rem)",
        }
      : {
          marginLeft: 0,
          marginRight:0,
          width: "100%",
        }
  }
>
      <div
        ref={wrapperRef}
        className="
    relative

    flex

    h-20
    
    lg:w-full

    items-center
    justify-between

    rounded-[10px]



    px-5



    transition-all
duration-300
ease-in-out
  "
      >
        {/* Store */}

        <button
          className="
          flex
          ml-0
          lg:ml-5
          min-w-0
          flex-1
          items-center
          gap-3
          text-left
        "
        >
          {/* Logo */}

          <img
            src={storeLogo}
            alt={store?.name}
            className="
            h-11
            w-11
            lg:h-13
            lg:w-13

            rounded-[10px]

            border
            border-slate-200

            object-cover
            shadow-sm
          "
          />

          {/* Store Info */}

          <div className="min-w-0 flex-1">
            <h2
              className="
              truncate
              text-[15px]
              lg:text-[20px]
              font-bold

              text-slate-900 dark:text-white
            "
            >
              {store?.name || "Restaurant"}
            </h2>

            <p
              className="
              truncate

              text-xs

              text-slate-500 dark:text-slate-400
            "
            >
              {storeAddress}
            </p>
          </div>
        </button>

        {/* Actions */}

        <div
          className="
          ml-3
          flex
          items-center
          gap-3
        "
        >
     
          {/* Location Dropdown */}

          <div className="relative hidden lg:block">
            <button
              onClick={() => setLocationOpen(!locationOpen)}
              className="
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2
              shadow-sm
              transition-all
              hover:border-green-300
              hover:shadow-md
            "
            >
              <div className="rounded-lg bg-green-50 p-2">
                <MapPin size={18} className="text-green-600" />
              </div>

              <div className="text-left">
                <p className="text-[10px] text-slate-500">Deliver to</p>

                <p className="max-w-[140px] truncate text-sm font-semibold text-slate-900">
                  {selectedLocation.title}
                </p>
                <p className="text-[13px] text-slate-1000">
                  {selectedLocation.subtitle}
                </p>
              </div>

              <ChevronDown size={18} className="text-slate-500" />
            </button>

            <AnimatePresence>
              {locationOpen && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -15,
                    scale: 0.96,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -15,
                    scale: 0.96,
                  }}
                  transition={{
                    duration: 0.22,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="
                  absolute
                  right-0
                  top-[64px]
                  z-[999]
                  w-[360px]
                  overflow-hidden
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  shadow-2xl
                "
                >
                  <div className="border-b border-slate-100 p-5">
                    <h3 className="text-lg font-bold text-slate-900">
                      Delivery Location
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Choose where you'd like your order delivered.
                    </p>
                  </div>

                  <button
                    onClick={detectLocation}
                    className="
    flex
    w-full
    items-center
    gap-4
    p-4
    text-left
    transition
    hover:bg-slate-50
  "
                  >
                    <div className="rounded-xl bg-green-100 p-3">
                      <Navigation size={20} className="text-green-600" />
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        Use Current Location
                      </p>

                      <p className="text-sm text-slate-500">
                        Detect your current location
                      </p>
                    </div>
                  </button>

                  <button
                    className="
    flex
    w-full
    items-center
    gap-4
    p-4
    text-left
    transition
    hover:bg-slate-50
  "
                  >
                    <div className="rounded-xl bg-slate-100 p-3">
                      <Plus size={20} className="text-slate-700" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        Add New Address
                      </p>

                      <p className="text-sm text-slate-500">
                        Home, Work or Other
                      </p>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
  onClick={() => navigate("/customer/cart")}
  className="
    relative
    flex
    h-11
    w-11
    lg:hidden
    items-center
    justify-center
    rounded-xl
    border
    border-slate-200
    bg-slate-200
    text-slate-700

    transition-all
    duration-200
    hover:border-[#16522d]
    hover:bg-[#16522d]
    hover:text-white
    active:scale-95
    dark:border-[#A9BDCF]/30
    dark:bg-[#181A1B]
    dark:text-[#A9BDCF]
    dark:hover:bg-[#124224]
  "
>
  <ShoppingCart
    size={20}
    strokeWidth={2.2}
  />

  {cartCount > 0 && (
    <span
      className="
        absolute
        -right-1
        -top-1
        flex
        h-5
        min-w-[20px]
        items-center
        justify-center
        rounded-full
        bg-red-500
        px-1
        text-[10px]
        font-bold
        leading-none
        text-white
      "
    >
      {cartCount}
    </span>
  )}
</button>
          {/* Notification */}

          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="
            relative

            flex
            h-11
            w-11

            items-center
            justify-center

            rounded-[10px]

            transition

            bg-slate-200 dark:bg-[#232627]
          "
          >
            <Bell
              size={20}
              style={{
                color: "var(--primary)",
              }}
            />

            {notifications.length > 0 && (
              <span
                className="
                absolute

                right-2
                top-2

                flex

                h-4
                w-4

                items-center
                justify-center

                rounded-full

                text-[10px]

                text-white
              "
                style={{
                  background: "var(--primary)",
                }}
              >
                {notifications.length}
              </span>
            )}
          </button>

          {/* Profile
            Hidden on Mobile
        */}
        </div>

        {/* Notification Panel */}

        {notificationOpen && (
          <div
            className="
            absolute

            right-0
            top-[72px]

            w-[320px]
            max-w-[calc(100vw-24px)]

            overflow-hidden

            rounded-3xl

            border
            border-slate-200 dark:border-[#A9BDCF]/40

            bg-white dark:bg-[#181A1B]

            shadow-2xl
          "
          >
            <div className="border-b border-slate-100 dark:border-[#A9BDCF]/20 p-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Notifications
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Latest updates from the restaurant.
              </p>
            </div>

            <div
              className="
              max-h-[420px]
              overflow-y-auto
            "
            >
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell
                    size={34}
                    className="mx-auto mb-3 text-slate-300 dark:text-slate-600"
                  />

                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                    No notifications
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    You're all caught up.
                  </p>
                </div>
              ) : (
                notifications.map((item) => {
                  const Icon = getNotificationIcon(item.type);

                  return (
                    <button
                      key={item.id}
                      className="
                      flex
                      w-full
                      gap-4

                      border-b
                      border-slate-100 dark:border-[#A9BDCF]/20

                      p-4

                      text-left

                      transition

                      hover:bg-slate-50 dark:hover:bg-white/5
                    "
                    >
                      <div
                        className="
                        flex
                        h-11
                        w-11

                        items-center
                        justify-center

                        rounded-2xl

                        bg-slate-100 dark:bg-[#232627]
                      "
                      >
                        <Icon
                          size={20}
                          style={{
                            color: "var(--primary)",
                          }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {item.title}
                        </p>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {item.message}
                        </p>

                        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                          {item.time}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default CustomerHeader;
