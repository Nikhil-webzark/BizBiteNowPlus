import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, LayoutGrid, ShoppingCart, User, Search } from "lucide-react";
import { useCart } from "../../context/CartContext";
import NotificationPanel from "./NotificationPanel";
import { isCustomerLoggedIn, getMyProfile } from "../../api/customer/authApi";
import { getStore, getNotifications } from "../../api/customerApi";

const CustomerHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Top-level Hook call (Rules of Hooks Compliant)
  const cartCtx = useCart();
  const totalItems = cartCtx?.totalItems || 0;

  const [customerName, setCustomerName] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [search, setSearch] = useState("");
  const [storeInfo, setStoreInfo] = useState({
    name: "Loading Store...",
    initials: "SB",
    brandColor: "#E8622D",
  });

  const debounceRef = useRef(null);

  // Fetch Store Details
  useEffect(() => {
    let isMounted = true;
    const fetchStore = async () => {
      try {
        const response = await getStore();
        const store = response?.data?.data || response?.data;
        if (store && isMounted) {
          const name = store.name || store.store_name || "Restaurant Store";
          const initials = name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          setStoreInfo({
            name,
            initials: initials || "ST",
            brandColor: store.brandColor || "#E8622D",
          });
        }
      } catch (err) {
        console.error("Failed to load store info in header:", err);
      }
    };

    fetchStore();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Profile & Notifications
  useEffect(() => {
    let isMounted = true;
    if (typeof isCustomerLoggedIn === "function" && isCustomerLoggedIn()) {
      getMyProfile()
        .then((user) => {
          if (isMounted && (user?.name || user?.customer_name)) {
            setCustomerName(user.name || user.customer_name);
          }
        })
        .catch((err) => console.error("Profile fetch error:", err));

      getNotifications()
        .then((res) => {
          if (isMounted) {
            setNotificationsList(res?.data || []);
          }
        })
        .catch(() => {
          if (isMounted) setNotificationsList([]);
        });
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Search Navigation Handlers
  const goToSearch = (value) => {
    const onMenu = location.pathname.includes("/menu");
    if (value.trim()) {
      navigate(`/customer/menu?search=${encodeURIComponent(value.trim())}`, {
        replace: onMenu,
      });
    } else if (onMenu) {
      navigate("/customer/menu", { replace: true });
    }
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => goToSearch(value), 400);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    goToSearch(search);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        {/* Store Avatar + Name */}
        <button
          type="button"
          onClick={() => navigate("/customer/home")}
          className="flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[16px] shrink-0"
            style={{ backgroundColor: storeInfo.brandColor }}
          >
            {storeInfo.initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="font-bold text-[#1C1C1C] leading-tight text-[16px]">
              {storeInfo.name}
            </p>
            <p className="text-gray-400 leading-tight text-[10px] tracking-wider">
              POWERED BY BIZBITENOW
            </p>
          </div>
        </button>

        {/* Search Bar */}
        <form
          onSubmit={submitSearch}
          className="hidden md:flex flex-1 items-center bg-gray-50 border border-gray-200 rounded-full px-4 gap-2 max-w-md min-h-[42px]"
        >
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder={`Search in ${storeInfo.name}...`}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full outline-none text-[15px] bg-transparent text-[#1C1C1C] placeholder-gray-400"
          />
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate("/customer/menu")}
            className="relative flex items-center justify-center text-gray-500 shrink-0 rounded-xl hover:bg-[#FBE7DD] hover:text-[#E8622D] transition-colors lg:hidden cursor-pointer min-w-[40px] min-h-[40px]"
          >
            <LayoutGrid size={20} />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications((v) => !v)}
              className="relative flex items-center justify-center text-gray-500 shrink-0 rounded-xl hover:bg-[#FBE7DD] hover:text-[#E8622D] transition-colors cursor-pointer min-w-[40px] min-h-[40px]"
            >
              <Bell size={20} />
              {notificationsList.length > 0 && (
                <span className="absolute top-[8px] right-[9px] w-[7px] h-[7px] rounded-full bg-[#E8622D]" />
              )}
            </button>
            {showNotifications && (
              <NotificationPanel
                notifications={notificationsList}
                onClose={() => setShowNotifications(false)}
                onBrowseMenu={() => {
                  setShowNotifications(false);
                  navigate("/customer/menu");
                }}
              />
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate("/customer/cart")}
            className="relative flex items-center justify-center text-gray-500 shrink-0 rounded-xl hover:bg-[#FBE7DD] hover:text-[#E8622D] transition-colors cursor-pointer min-w-[40px] min-h-[40px]"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute top-[2px] right-0 text-[10px] w-4 h-4 bg-[#E8622D] text-white font-bold rounded-full flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                typeof isCustomerLoggedIn === "function" && isCustomerLoggedIn()
                  ? "/customer/profile"
                  : "/customer/onboarding"
              )
            }
            className="flex items-center gap-2 pl-2 sm:border-l border-gray-100 cursor-pointer"
          >
            <span className="w-9 h-9 rounded-full flex items-center justify-center bg-[#FBE7DD] shrink-0">
              <User size={18} style={{ color: "#E8622D" }} />
            </span>
            <div className="hidden sm:block text-left">
              <p className="font-bold text-[#1C1C1C] leading-tight text-[13px] max-w-[100px] truncate">
                {customerName || "Guest"}
              </p>
              <p className="text-gray-400 leading-tight text-[11px]">
                {customerName ? "Customer" : "Sign in"}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;