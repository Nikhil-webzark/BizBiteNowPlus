import { useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Bell, LayoutGrid, ShoppingCart, User, Search } from "lucide-react";

import { useCart } from "../../context/CartContext";
import { isCustomerLoggedIn } from "../../api/customer/authApi";

const CustomerHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const cartCtx = useCart();
  const totalItems = cartCtx?.totalItems || 0;

  const customerName = isCustomerLoggedIn()
    ? "Customer"
    : null;

  const [search, setSearch] = useState("");

  const [storeInfo] = useState({
    name: "BizBite Store",
    initials: "BB",
    brandColor: "#E8622D",
  });

  const debounceRef = useRef(null);


  // Search Navigation
  const goToSearch = (value) => {
    const onMenu = location.pathname.includes("/menu");

    if (value.trim()) {
      navigate(
        `/customer/menu?search=${encodeURIComponent(value.trim())}`,
        {
          replace: onMenu,
        }
      );
    } else if (onMenu) {
      navigate("/customer/menu", {
        replace: true,
      });
    }
  };


  const handleSearchChange = (value) => {
    setSearch(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      goToSearch(value);
    }, 400);
  };


  const submitSearch = (e) => {
    e.preventDefault();

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    goToSearch(search);
  };


  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">

      <div className="flex items-center justify-between gap-3 px-4 py-3">


        {/* Store */}
        <button
          type="button"
          onClick={() => navigate("/customer/home")}
          className="flex items-center gap-2 shrink-0 cursor-pointer"
        >

          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[16px]"
            style={{
              backgroundColor: storeInfo.brandColor,
            }}
          >
            {storeInfo.initials}
          </div>


          <div className="hidden sm:block text-left">

            <p className="font-bold text-[#1C1C1C]">
              {storeInfo.name}
            </p>

            <p className="text-gray-400 text-[10px]">
              POWERED BY BIZBITENOW
            </p>

          </div>

        </button>



        {/* Search */}

        <form
          onSubmit={submitSearch}
          className="hidden md:flex flex-1 items-center bg-gray-50 border border-gray-200 rounded-full px-4 gap-2 max-w-md min-h-[42px]"
        >

          <Search
            size={16}
            className="text-gray-400"
          />


          <input
            type="text"
            placeholder={`Search in ${storeInfo.name}...`}
            value={search}
            onChange={(e) =>
              handleSearchChange(e.target.value)
            }
            className="w-full outline-none bg-transparent"
          />

        </form>




        {/* Actions */}

        <div className="flex items-center gap-3 shrink-0">


          {/* Menu */}

          <button
            type="button"
            onClick={() => navigate("/customer/menu")}
            className="lg:hidden"
          >

            <LayoutGrid size={20} />

          </button>




          {/* Notifications */}

          <Link
            to="/customer/notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200"
          >

            <Bell size={22} />

            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              3
            </span>

          </Link>





          {/* Cart */}

          <button
            type="button"
            onClick={() => navigate("/customer/cart")}
            className="relative"
          >

            <ShoppingCart size={20} />


            {totalItems > 0 && (

              <span className="absolute -top-2 -right-2 bg-[#E8622D] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">

                {totalItems > 9 ? "9+" : totalItems}

              </span>

            )}

          </button>





          {/* Profile */}

          <button
            type="button"
            onClick={() =>
              navigate(
                isCustomerLoggedIn()
                  ? "/customer/profile"
                  : "/customer/onboarding"
              )
            }
            className="flex items-center gap-2"
          >

            <span className="w-9 h-9 rounded-full flex items-center justify-center bg-[#FBE7DD]">

              <User
                size={18}
                className="text-[#E8622D]"
              />

            </span>



            <div className="hidden sm:block text-left">

              <p className="font-bold text-[13px]">

                {customerName || "Guest"}

              </p>


              <p className="text-gray-400 text-[11px]">

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