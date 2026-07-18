import { NavLink } from "react-router-dom";

import {
  House,
  UtensilsCrossed,
  ReceiptText,
  Gift,

  User,
  Heart,
} from "lucide-react";


const navItems = [
  {
    label: "Home",
    icon: House,
    path: "/customer",
  },
{
  label: "Menu",
  path: "/customer/menu",
  icon: UtensilsCrossed,
},

  {
    label: "Orders",
    icon: ReceiptText,
    path: "/customer/orders",
  },
  {
    label: "Rewards",
    icon: Gift,
    path: "/customer/rewards",
  },
  {
    label: "Profile",
    icon: User,
    path: "/customer/profile",
  },
];


const BottomNavigation = () => {

  return (

    <nav
      className="
        fixed

        bottom-0

        left-0

        right-0

        z-50

        lg:hidden
      "
    >

      <div
        className="
          flex

          items-center

          justify-around

          rounded-[10px]

          border

          border-slate-200 dark:border-[#A9BDCF]/40

          bg-white/90 dark:bg-[#181A1B]

          px-2

          py-2

          shadow-2xl

          backdrop-blur-xl
        "
      >

        {
          navItems.map(
            ({
              label,
              icon: Icon,
              path,
            }) => (

              <NavLink
                key={path}
                to={path}
                end={
                  path === "/customer"
                }

                className="
                  flex

                  flex-1

                  justify-center
                "
              >

                {
                  ({isActive}) => (

                    <div
                      className="
                        relative

                        flex

                        flex-col

                        items-center

                        justify-center

                        gap-0.5

                        py-1
                      "
                    >

                      <div
                        className={`
                          flex

                          h-10

                          w-10

                          items-center

                          justify-center

                          rounded-[10px]

                          transition-all

                          duration-300

                          ${
                            isActive
                            ?
                            "text-white shadow-lg"
                            :
                            "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                          }
                        `}

                        style={{
                          background:
                            isActive
                            ?
                            "var(--primary)"
                            :
                            "transparent",
                        }}
                      >

                        <Icon
                          size={20}
                          strokeWidth={2.3}
                        />

                      </div>

                      <span
                        className={`
                          text-[10px]

                          font-semibold

                          ${
                            isActive
                            ?
                            "text-slate-900 dark:text-white"
                            :
                            "text-slate-500 dark:text-slate-400"
                          }
                        `}
                      >
                        {label}
                      </span>

                    </div>

                  )
                }


              </NavLink>

            )
          )
        }


      </div>


    </nav>

  );

};


export default BottomNavigation;