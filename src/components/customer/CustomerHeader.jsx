import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, LayoutGrid, ShoppingCart, User, Search } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { isCustomerLoggedIn, getMyProfile } from "../../api/customer/authApi";

const storeInfo = {
  name: "Store Name",
  initials: "SN",
  brandColor: "#E8622D",
};



const CustomerHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const [customerName, setCustomerName] = useState(null);
  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);

  const goToSearch = (value) => {
    const onMenu = location.pathname === "/menu";
    if (value.trim()) {
      navigate(`/menu?search=${encodeURIComponent(value.trim())}`, { replace: onMenu });
    } else if (onMenu) {
      navigate("/menu", { replace: true });
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

  useEffect(() => {
    if (isCustomerLoggedIn()) {
      getMyProfile()
        .then((user) => setCustomerName(user.name))
        .catch(() => {});
    }
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        {/* Store Avatar + Name */}
        <button
          onClick={() => navigate("/storefront")}
          className="flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[16px] shrink-0"
            style={{ backgroundColor: storeInfo.brandColor }}
          >
            {storeInfo.initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="font-bold text-[#1C1C1C] leading-tight" style={{ fontSize: "16px" }}>
              {storeInfo.name}
            </p>
            <p className="text-gray-400 leading-tight" style={{ fontSize: "12px" }}>
              POWERED BY BIZBITENOW
            </p>
          </div>
        </button>

        {/* Search bar */}
        <form
          onSubmit={submitSearch}
          className="hidden md:flex flex-1 items-center bg-gray-50 border border-gray-200 rounded-full px-4 gap-2 max-w-md"
          style={{ minHeight: "42px" }}
        >
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder={`Search in ${storeInfo.name}...`}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full outline-none text-[15px] bg-transparent text-[#1C1C1C] placeholder-gray-400"
            style={{ fontFamily: "Arial, sans-serif" }}
          />
        </form>

        {/* Menu + Bell + Cart + Customer */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate("/menu")}
            className="relative flex items-center justify-center text-gray-500 shrink-0 rounded-xl hover:bg-[#FBE7DD] hover:text-[#E8622D] transition-colors lg:hidden cursor-pointer"
            style={{ minHeight: "40px", minWidth: "40px" }}
          >
            <LayoutGrid size={20} />
          </button>

          <div className="relative">
            <Link
            to="/customer/notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200 transition hover:bg-slate-300"
          >
            <Bell size={22} className="text-slate-700" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              3
            </span>
          </Link>
          
          </div>

          <button
            onClick={() => navigate("/cart")}
            className="relative flex items-center justify-center text-gray-500 shrink-0 rounded-xl hover:bg-[#FBE7DD] hover:text-[#E8622D] transition-colors lg:hidden cursor-pointer"
            style={{ minHeight: "40px", minWidth: "40px" }}
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span
                className="absolute bg-[#E8622D] text-white font-bold rounded-full flex items-center justify-center"
                style={{ top: "2px", right: "0px", fontSize: "10px", width: "16px", height: "16px" }}
              >
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>

          <button
            onClick={() =>
              navigate(isCustomerLoggedIn() ? "/customer/profile" : "/customer/onboarding")
            }
            className="flex items-center gap-2 pl-2 sm:border-l border-gray-100 cursor-pointer"
          >
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#FBE7DD" }}
            >
              <User size={18} style={{ color: "#E8622D" }} />
            </span>
            <div className="hidden sm:block text-left">
              <p className="font-bold text-[#1C1C1C] leading-tight" style={{ fontSize: "13px" }}>
                {customerName || "Guest"}
              </p>
              <p className="text-gray-400 leading-tight" style={{ fontSize: "11px" }}>
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
