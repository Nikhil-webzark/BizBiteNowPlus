import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useCart } from "../../context/CartContext";

import HeroBanner from "../../components/customer/hero/HeroBanner";

import { Link } from "react-router-dom";
import MenuGrid from "../../components/customer/menu/MenuGrid";
import ProductCard from "../../components/customer/menu/ProductCard";

/* ---------- New Mobile Components ---------- */
import QROrderCardSkeleton from "../../components/customer/skeleton/QROrderCardSkeleton";
import BannerSkeleton from "../../components/customer/skeleton/BannerSkeleton";
import HeroSkeleton from "../../components/customer/skeleton/HeroSkeleton";
import HorizontalSectionSkeleton from "../../components/customer/skeleton/HorizontalSectionSkeleton";
import BannerCarousel from "../../components/customer/home/BannerCarousel";
import QROrderCard from "../../components/customer/home/QROrderCard";
import DeliveryChecker from "../../components/customer/home/DeliveryChecker";
import HorizontalSection from "../../components/customer/home/HorizontalSection";

import {
  getStore,
  getMenu,
  getTodaySpecialProducts,
  getComboMealProducts,
  getRecentlyOrderedProducts,
} from "../../api/customerApi";

import { useFavourite } from "../../context/FavouriteContext";

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);

  const [menuData, setMenuData] = useState([]);
const [todaySpecialProducts, setTodaySpecialProducts] = useState([]);
const [comboMealProducts, setComboMealProducts] = useState([]);
  

  const [recentProducts, setRecentProducts] = useState([]);

  const [offerProducts, setOfferProducts] = useState([]);
  const { cartItems, addItem, updateItem, removeItem } = useCart();
  const {
  favouriteProducts,
  toggleFavourite,
} = useFavourite();
  const increaseQuantity = (product) => {
    const item = cartItems.find(
      (cartItem) => cartItem.productId === product.id,
    );

    if (!item) {
      addItem(product);
      return;
    }

    updateItem(item.id, item.quantity + 1);
  };

  const decreaseQuantity = (product) => {
    const item = cartItems.find(
      (cartItem) => cartItem.productId === product.id,
    );

    if (!item) return;

    if (item.quantity === 1) {
      removeItem(item.id);
      return;
    }

    updateItem(item.id, item.quantity - 1);
  };
  const loadData = async () => {
    setLoading(true);

    try {
const [
  storeRes,
  menuRes,
  todayRes,
  comboRes,
  recentRes,
] = await Promise.all([
  getStore(),
  getMenu(),
  getTodaySpecialProducts(),
  getComboMealProducts(),
  getRecentlyOrderedProducts(),
]);

setMenuData(menuRes.data?.data || []);
setTodaySpecialProducts(todayRes.data?.data || []);
setComboMealProducts(comboRes.data?.data || []);
setRecentProducts(recentRes.data?.data || []);

const menu = menuRes.data?.data || [];

      setStore(storeRes.data.data);

      setMenuData(menu);


      setOfferProducts(menu.filter((item) => item.originalPrice > item.price));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

 const favouriteCount = useMemo(
  () => favouriteProducts.length,
  [favouriteProducts]
);

  const recentCount = useMemo(() => recentProducts.length, [recentProducts]);

  const offerCount = useMemo(() => offerProducts.length, [offerProducts]);
  const handleFavourite = async (productId) => {
    try {
      await toggleFavorite({
        customerId: "CUSTOMER_001",
        productId,
        storeId: store?.id || "STORE_001",
      });

      setFavoriteProducts((prev) => {
        const exists = prev.some((item) => item.id === productId);

        if (exists) {
          return prev.filter((item) => item.id !== productId);
        }

        const product = menuData.find((item) => item.id === productId);

        return product ? [...prev, product] : prev;
      });
    } catch (err) {
      console.error(err);
    }
  };
  const mobileBanners =
    store?.banners?.map((image, index) => ({
      id: index + 1,
      image,
    })) || [];
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="space-y-6"
    >
      <div
        className="
    w-full
    min-w-0
    max-w-[1760px]

    space-y-6
    pb-28

    px-1
    sm:px-2
    lg:px-10
  "
      >
        {/* ========================================================= */}
        {/* Mobile Home */}
        {/* ========================================================= */}

        <div className="space-y-5 lg:hidden">
          <div className="px-1"></div>
          <div className="px-1">
            {loading ? (
              <BannerSkeleton />
            ) : (
              <BannerCarousel banners={mobileBanners} />
            )}
          </div>
          <div className="px-1">
            {loading ? (
              <QROrderCardSkeleton />
            ) : (
              <QROrderCard
                tableNumber={store?.tableNumber}
                onScan={() => navigate("/customer/scan-qr")}
              />
            )}
          </div>
          <div className="px-1">
            {loading ? (
              <HorizontalSectionSkeleton />
            ) : (
              <HorizontalSection
                title="Recently Orderd"
                subtitle="Save more today."
                buttonText="View All"
                onViewAll={() => navigate("/customer/orders")}
                products={recentProducts}
                cartItems={cartItems}
                favouriteProducts={favouriteProducts}
                onProductClick={(product) =>
                  navigate(`/customer/product/${product.id}`)
                }
                onFavourite={handleFavourite}
                onAdd={addItem}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
              />
            )}
          </div>
          <div className="px-1">
            <DeliveryChecker
              location={store?.address?.city}
              onCheck={() => navigate("/customer/address")}
            />
          </div>

          {loading ? (
            <HorizontalSectionSkeleton />
          ) : (
            <HorizontalSection
              title="Today's Offers 🔥"
              subtitle="Save more today."
              buttonText="View All"
              onViewAll={() => navigate("/customer/menu")}
              products={offerProducts}
              cartItems={cartItems}
              favouriteProducts={favouriteProducts}
              onProductClick={(product) =>
                navigate(`/customer/product/${product.id}`)
              }
              onFavourite={handleFavourite}
              onAdd={addItem}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
            />
          )}

  {loading ? (
    <HorizontalSectionSkeleton />
  ) : (
    <HorizontalSection
      title="Today's Special 🌟"
      subtitle="Chef's handpicked favorites."
      buttonText="View All"
      onViewAll={() => navigate("/customer/menu")}
      products={todaySpecialProducts}
      cartItems={cartItems}
      favouriteProducts={favouriteProducts}
      onProductClick={(product) =>
        navigate(`/customer/product/${product.id}`)
      }
      onFavourite={handleFavourite}
      onAdd={addItem}
      onIncrease={increaseQuantity}
      onDecrease={decreaseQuantity}
    />
  )}


  {loading ? (
    <HorizontalSectionSkeleton />
  ) : (
    <HorizontalSection
      title="Combo Meals 🍱"
      subtitle="Great taste, better value."
      buttonText="View All"
      onViewAll={() => navigate("/customer/menu")}
      products={comboMealProducts}
      cartItems={cartItems}
      favouriteProducts={favouriteProducts}
      onProductClick={(product) =>
        navigate(`/customer/product/${product.id}`)
      }
      onFavourite={handleFavourite}
      onAdd={addItem}
      onIncrease={increaseQuantity}
      onDecrease={decreaseQuantity}
    />
  )}


          {loading ? (
            <HorizontalSectionSkeleton />
          ) : (
            <HorizontalSection
              title="Your Favourites ❤️"
              subtitle="Save more today."
              buttonText="View All"
              onViewAll={() => navigate("/customer/menu")}
              products={favouriteProducts}
              cartItems={cartItems}
              favouriteProducts={favouriteProducts}
              onProductClick={(product) =>
                navigate(`/customer/product/${product.id}`)
              }
              onFavourite={handleFavourite}
              onAdd={addItem}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
            />
          )}
          <section className="flex justify-center px-1">
            <button
              onClick={() => navigate("/customer/menu")}
              className="
      w-[60%]
      rounded-[14px]
      py-4
      text-sm
      font-semibold
      text-white
    "
              style={{
                background: "var(--primary)",
              }}
            >
              Browse Full Menu
            </button>
          </section>
        </div>

        <div
          className="
    hidden
    space-y-8
    lg:block

  "
        >
          {loading ? (
            <HeroSkeleton />
          ) : (
            <HeroBanner
              banners={store?.banners}
              logo={store?.logo}
              name={store?.name}
              tagline={store?.tagline}
              deliveryTime={store?.deliveryTime}
              isOpen={store?.isOpen}
            />
          )}

          

          {/* Recently Ordered */}

          {recentCount > 0 && (
            <section className="space-y-6 px-2 sm:px-4 lg:px-6 xl:px-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Recently Ordered
                  </h2>

                  <p className="mt-1 text-slate-500 dark:text-slate-400">
                    Order your favourites again in one tap.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/customer/orders")}
                  className="
                text-sm
                font-semibold
                transition
                hover:opacity-80
                text-[var(--primary)]
                dark:text-white
              "
                >
                  View Orders
                </button>
              </div>

              <MenuGrid>
                {recentProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={
                      cartItems.find((item) => item.productId === product.id)
                        ?.quantity || 0
                    }
                    isFavourite={favouriteProducts.some(
                      (item) => item.id === product.id,
                    )}
                    onAdd={() => addItem(product)}
                    onIncrease={() => increaseQuantity(product)}
                    onDecrease={() => decreaseQuantity(product)}
                    onFavourite={() => toggleFavourite(product)}
                    onClick={() => navigate(`/customer/product/${product.id}`)}
                  />
                ))}
              </MenuGrid>
            </section>
          )}
          {/* Favourite Items */}

          {favouriteCount > 0 && (
            <section className="space-y-6 px-2 sm:px-4 lg:px-6 xl:px-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Your Favorites ❤️
                  </h2>

                  <p className="mt-1 text-slate-500">
                    Dishes you've marked as favourites.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/customer/favorites")}
                  className="
                text-sm
                font-semibold
                transition
                hover:opacity-80
                text-[var(--primary)]
                dark:text-white
              "
                >
                  View All
                </button>
              </div>

              <MenuGrid>
                {favouriteProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={
                      cartItems.find((item) => item.productId === product.id)
                        ?.quantity || 0
                    }
                    isFavourite={favouriteProducts.some(
                      (item) => item.id === product.id,
                    )}
                    onAdd={() => addItem(product)}
                    onIncrease={() => increaseQuantity(product)}
                    onDecrease={() => decreaseQuantity(product)}
                    onFavourite={() => toggleFavourite(product)}
                    onClick={() => navigate(`/customer/product/${product.id}`)}
                  />
                ))}
              </MenuGrid>
            </section>
          )}
        

          {offerCount > 0 && (
            <section className="space-y-6 px-2 sm:px-4 lg:px-6 xl:px-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Today's Offers 🔥
                  </h2>

                  <p className="mt-1 text-slate-500 dark:text-slate-400">
                    Save more with exclusive deals available today.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/customer/menu")}
                  className="
                text-sm
                font-semibold
                transition
                hover:opacity-80
                text-[var(--primary)]
                dark:text-white
              "
                >
                  View All Offers
                </button>
              </div>

              <MenuGrid>
                {offerProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={
                      cartItems.find((item) => item.productId === product.id)
                        ?.quantity || 0
                    }
                    isFavourite={favouriteProducts.some(
                      (item) => item.id === product.id,
                    )}
                    onAdd={() => addItem(product)}
                    onIncrease={() => increaseQuantity(product)}
                    onDecrease={() => decreaseQuantity(product)}
                    onFavourite={() => toggleFavourite(product)}
                    onClick={() => navigate(`/customer/product/${product.id}`)}
                  />
                ))}
              </MenuGrid>
            </section>
          )}

          {/* Browse Full Menu */}

          <section className="px-2 sm:px-4 lg:px-6 xl:px-8">
            <div
              className="
            rounded-[32px]
            border
            border-slate-200 dark:border-[#A9BDCF]/40
            bg-white dark:bg-[#181A1B]
            p-8
            text-center
            shadow-sm
          "
            >
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Looking for something else?
              </h2>

              <p className="mt-3 text-slate-500 dark:text-slate-400">
                Explore our complete menu with all categories, latest dishes,
                combos and beverages.
              </p>

              <button
                onClick={() => navigate("/customer/menu")}
                className="
              mt-6
              rounded-2xl
              px-8
              py-4
              text-lg
              font-semibold
              text-white
              transition
              hover:scale-[1.02]
            "
                style={{
                  background: "var(--primary)",
                }}
              >
                Browse Full Menu
              </button>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;
