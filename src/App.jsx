import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";


// Auth

import Login from "./pages/Auth/Login";
import RegisterSeller from "./pages/Auth/RegisterSeller";
import RegisterSuccess from "./pages/Auth/RegisterSuccess";


// Shared Seller Layout

import DashboardLayout from "./components/Shared/DashboardLayout";


// Seller Pages

import SellerDashboard from "./pages/Dashboards/Seller/SellerDashboard";
import Orders from "./pages/Dashboards/Seller/Orders";
import OrderDetails from "./pages/Dashboards/Seller/OrderDetails";
import Profile from "./pages/Dashboards/Seller/profile";
import Products from "./pages/Dashboards/Seller/Products";
import Settings from "./pages/Dashboards/Seller/Settings";
import Analytics from "./pages/Dashboards/Seller/Analytics";
import Earnings from "./pages/Dashboards/Seller/Earnings";


// Delivery

import DeliveryDashboard from "./pages/Dashboards/DeliveryDashboard/DeliveryDashboard";
import DeliveryManagement from "./pages/Dashboards/DeliveryDashboard/DeliveryManagement";


// Seller Modules

import SpecialOffers from "./components/special offers/SpecialOffers";

import FestiveMenu from "./pages/Dashboards/Seller/FestiveMenu";
import FestiveMenuDetails from "./pages/Dashboards/Seller/FestiveMenuDetails";
import CreateFestiveMenu from "./pages/Dashboards/Seller/CreateFestiveMenu";
import FestiveMenuHistory from "./pages/Dashboards/Seller/FestiveMenuHistory";

import {
  FestiveMenuProvider,
} from "./context/FestiveMenuContext";


// Customer Layout

import CustomerLayout from "./components/customer/layout/CustomerLayout";


// Customer Pages

import Home from "./pages/customer/Home";
import Menu from "./pages/customer/Menu";
import Product from "./pages/customer/Product";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import CustomerOrders from "./pages/customer/Orders";
import OrderDetail from "./pages/customer/OrderDetails";
import Rewards from "./pages/customer/Rewards";
import CustomerProfile from "./pages/customer/Profile";
import PersonalDetails from "./pages/customer/PersonalDetails";
import Language from "./pages/customer/Language";
import Appearance from "./pages/customer/Appearance";
import HelpSupport from "./pages/customer/HelpSupport";
import TermsPolicy from "./pages/customer/TermsPolicy";
import PolicyDetail from "./pages/customer/PolicyDetail";
import PrivacySecurity from "./pages/customer/PrivacySecurity";
import Favourites from "./pages/customer/Favourites";
import CustomerRegister from "./pages/customer/Register";



export default function App() {

  return (

    <div
      className="
        w-full
        min-h-screen
        bg-slate-100
        m-0
        p-0
        box-border
        overflow-x-hidden
      "
    >

      <Routes>


        {/* Default */}

        <Route
          path="/"
          element={
            <Navigate
              to="/customer"
              replace
            />
          }
        />



        {/* Authentication */}


        <Route
          path="/seller/login"
          element={<Login />}
        />


        <Route
          path="/seller/register"
          element={<RegisterSeller />}
        />


        <Route
          path="/seller/register-success"
          element={<RegisterSuccess />}
        />


        <Route
          path="/customer/register"
          element={<CustomerRegister />}
        />



        {/* ======================
            CUSTOMER APP
        ====================== */}


        <Route
          path="/customer"
          element={
            <CustomerLayout />
          }
        >


          <Route
            index
            element={<Home />}
          />


          <Route
            path="menu"
            element={<Menu />}
          />

          <Route 
          path="favorites" 
          element={<Favourites />} />
          <Route
            path="product/:id"
            element={<Product />}
          />


          <Route
            path="cart"
            element={<Cart />}
          />


          <Route
            path="checkout"
            element={<Checkout />}
          />


          <Route
            path="orders"
            element={<CustomerOrders />}
          />
          <Route
          path="orders/:id"
          element={<OrderDetail />}
        />


          <Route
            path="rewards"
            element={<Rewards />}
          />


          <Route
            path="profile"
            element={<CustomerProfile />}
          />

          <Route
            path="profile/personal-details"
            element={<PersonalDetails />}
          />

          <Route
            path="profile/language"
            element={<Language />}
          />

          <Route
            path="profile/appearance"
            element={<Appearance />}
          />

          <Route
            path="profile/help-support"
            element={<HelpSupport />}
          />

          <Route
            path="profile/terms-policy"
            element={<TermsPolicy />}
          />

          <Route
            path="profile/terms-policy/:policyId"
            element={<PolicyDetail />}
          />

          <Route
            path="profile/privacy-security"
            element={<PrivacySecurity />}
          />


        </Route>





        {/* ======================
            SELLER DASHBOARD
        ====================== */}


        <Route
          path="/seller"
          element={
            <FestiveMenuProvider>
              <DashboardLayout />
            </FestiveMenuProvider>
          }
        >


          <Route
            index
            element={
              <Navigate
                to="dashboard"
                replace
              />
            }
          />


          <Route
            path="dashboard"
            element={<SellerDashboard />}
          />


          <Route
            path="orders"
            element={<Orders />}
          />


          <Route
            path="orders/:orderId"
            element={<OrderDetails />}
          />


          <Route
            path="delivery"
            element={<DeliveryManagement />}
          />


          <Route
            path="delivery-management"
            element={<DeliveryDashboard />}
          />


          <Route
            path="special-offers"
            element={<SpecialOffers />}
          />


          <Route
            path="settings"
            element={<Settings />}
          />


          <Route
            path="products"
            element={<Products />}
          />


          <Route
            path="analytics"
            element={<Analytics />}
          />


          <Route
            path="earnings"
            element={<Earnings />}
          />


          <Route
            path="profile"
            element={<Profile />}
          />



          {/* Festive Menu */}


          <Route
            path="festivemenu"
            element={<FestiveMenu />}
          />


          <Route
            path="festivemenu/create"
            element={<CreateFestiveMenu />}
          />


          <Route
            path="festivemenu/edit/:id"
            element={<CreateFestiveMenu />}
          />


          <Route
            path="festivemenu/:id"
            element={<FestiveMenuDetails />}
          />


          <Route
            path="festivemenu/history"
            element={<FestiveMenuHistory />}
          />


        </Route>





        {/* Registration Success */}


        <Route
          path="/register-success"
          element={

            <div
              className="
                min-h-screen
                w-full
                bg-[#f4fbf7]
                flex
                items-center
                justify-center
                p-4
              "
            >

              <div
                className="
                  bg-white
                  w-full
                  max-w-sm
                  rounded-2xl
                  p-6
                  text-center
                  space-y-4
                  border
                  border-emerald-100
                  shadow-xl
                "
              >

                <h3
                  className="
                    text-lg
                    font-black
                    text-slate-900
                  "
                >
                  Registration Successful!
                </h3>


                <p className="text-slate-400">
                  Your seller account has been created successfully.
                </p>


                <a
                  href="/storefront"
                  className="
                    block
                    w-full
                    bg-[#059669]
                    text-white
                    py-2.5
                    rounded-xl
                    font-black
                  "
                >
                  Go To Storefront Market
                </a>


              </div>

            </div>

          }
        />




        {/* 404 */}

        <Route
          path="*"
          element={
            <Navigate
              to="/customer"
              replace
            />
          }
        />


      </Routes>


    </div>

  );
}