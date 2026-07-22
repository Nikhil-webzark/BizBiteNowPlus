import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import useCartStore from "../../api/stores/customerstore/cartStore";

import HeroBanner from "../../components/customer/hero/HeroBanner";
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

  const [todaySpecialProducts, setTodaySpecialProducts] = useState([]);
  const [comboMealProducts, setComboMealProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [offerProducts, setOfferProducts] = useState([]);

  // Cart Store Hook
  const cartItems = useCartStore((state) => state.items || []);
  const addToCart = useCartStore((state) => state.addToCart);
  const updateCartItem = useCartStore((state) => state.updateCartItem);
  const removeCartItem = useCartStore((state) => state.removeCartItem);

  // Favourite Context Hook
  const { favouriteProducts = [], toggleFavourite } = useFavourite();

  const increaseQuantity = async (product) => {
    const item = cartItems.find((cartItem) => cartItem.productId === product.id);

    if (!item) {
      await addToCart(product);
      return;
    }

    await updateCartItem(item.id, item.quantity + 1);
  };

  const decreaseQuantity = async (product) => {
    const item = cartItems.find((cartItem) => cartItem.productId === product.id);

    if (!item) return;

    if (item.quantity === 1) {
      await removeCartItem(item.id);
      return;
    }

    await updateCartItem(item.id, item.quantity - 1);
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
      ] = await Promise.allSettled([
        getStore(),
        getMenu(),
        getTodaySpecialProducts(),
        getComboMealProducts(),
        getRecentlyOrderedProducts(),
      ]);

      const parseArray = (res) => {
        if (!res || res.status !== "fulfilled") return [];
        const val = res.value?.data;
        if (Array.isArray(val)) return val;
        if (Array.isArray(val?.data)) return val.data;
        if (Array.isArray(val?.products)) return val.products;
        return [];
      };

      const storeData = storeRes.status === "fulfilled" ? storeRes.value?.data?.data || storeRes.value?.data : null;
      const menuList = parseArray(menuRes);
      const todayList = parseArray(todayRes);
      const comboList = parseArray(comboRes);
      const recentList = parseArray(recentRes);

      setStore(storeData);
      setTodaySpecialProducts(todayList);
      setComboMealProducts(comboList);
      setRecentProducts(recentList);

      if (Array.isArray(menuList)) {
        setOfferProducts(menuList.filter((item) => item?.originalPrice > item?.price));
      }
    } catch (err) {
      console.error("Error loading home page data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) {
        await loadData();
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const favouriteCount = useMemo(() => favouriteProducts.length, [favouriteProducts]);
  const recentCount = useMemo(() => recentProducts.length, [recentProducts]);
  const offerCount = useMemo(() => offerProducts.length, [offerProducts]);

  const handleFavourite = async (product) => {
    try {
      if (typeof toggleFavourite === "function") {
        await toggleFavourite(product);
      }
    } catch (err) {
      console.error("Toggle favourite error:", err);
    }
  };

  const mobileBanners =
    store?.banners?.map((image, index) => ({
      id: index + 1,
      image,
    })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="w-full min-w-0 max-w-[1760px] space-y-6 pb-28 px-1 sm:px-2 lg:px-10">
        {/* Mobile View */}
        <div className="space-y-5 lg:hidden">
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
                title="Recently Ordered"
                subtitle="Save more today."
                buttonText="View All"
                onViewAll={() => navigate("/customer/orders")}
                products={recentProducts}
                cartItems={cartItems}
                favouriteProducts={favouriteProducts}
                onProductClick={(product) =>
                  navigate(`/customer/product/${product.id || product._id}`)
                }
                onFavourite={handleFavourite}
                onAdd={addToCart}
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

          <div className="px-1">
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
                  navigate(`/customer/product/${product.id || product._id}`)
                }
                onFavourite={handleFavourite}
                onAdd={addToCart}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
              />
            )}
          </div>

          <div className="px-1">
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
                  navigate(`/customer/product/${product.id || product._id}`)
                }
                onFavourite={handleFavourite}
                onAdd={addToCart}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
              />
            )}
          </div>

          <div className="px-1">
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
                  navigate(`/customer/product/${product.id || product._id}`)
                }
                onFavourite={handleFavourite}
                onAdd={addToCart}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
              />
            )}
          </div>

          <div className="px-1">
            {loading ? (
              <HorizontalSectionSkeleton />
            ) : (
              <HorizontalSection
                title="Your Favourites ❤️"
                subtitle="Save more today."
                buttonText="View All"
                onViewAll={() => navigate("/customer/favorites")}
                products={favouriteProducts}
                cartItems={cartItems}
                favouriteProducts={favouriteProducts}
                onProductClick={(product) =>
                  navigate(`/customer/product/${product.id || product._id}`)
                }
                onFavourite={handleFavourite}
                onAdd={addToCart}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
              />
            )}
          </div>

          <section className="flex justify-center px-1">
            <button
              type="button"
              onClick={() => navigate("/customer/menu")}
              className="w-[60%] rounded-[14px] py-4 text-sm font-semibold text-white cursor-pointer"
              style={{ background: "var(--primary)" }}
            >
              Browse Full Menu
            </button>
          </section>
        </div>

        {/* Desktop View */}
        <div className="hidden space-y-8 lg:block">
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
                  type="button"
                  onClick={() => navigate("/customer/orders")}
                  className="text-sm font-semibold transition hover:opacity-80 text-[var(--primary)] dark:text-white cursor-pointer"
                >
                  View Orders
                </button>
              </div>

              <MenuGrid>
                {recentProducts.map((product) => {
                  const pId = product.id || product._id;
                  return (
                    <ProductCard
                      key={pId}
                      product={product}
                      quantity={
                        cartItems.find((item) => item.productId === pId)?.quantity || 0
                      }
                      isFavourite={favouriteProducts.some((item) => (item.id || item._id) === pId)}
                      onAdd={() => addToCart(product)}
                      onIncrease={() => increaseQuantity(product)}
                      onDecrease={() => decreaseQuantity(product)}
                      onFavourite={() => handleFavourite(product)}
                      onClick={() => navigate(`/customer/product/${pId}`)}
                    />
                  );
                })}
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
                  type="button"
                  onClick={() => navigate("/customer/favorites")}
                  className="text-sm font-semibold transition hover:opacity-80 text-[var(--primary)] dark:text-white cursor-pointer"
                >
                  View All
                </button>
              </div>

              <MenuGrid>
                {favouriteProducts.map((product) => {
                  const pId = product.id || product._id;
                  return (
                    <ProductCard
                      key={pId}
                      product={product}
                      quantity={
                        cartItems.find((item) => item.productId === pId)?.quantity || 0
                      }
                      isFavourite={true}
                      onAdd={() => addToCart(product)}
                      onIncrease={() => increaseQuantity(product)}
                      onDecrease={() => decreaseQuantity(product)}
                      onFavourite={() => handleFavourite(product)}
                      onClick={() => navigate(`/customer/product/${pId}`)}
                    />
                  );
                })}
              </MenuGrid>
            </section>
          )}

          {/* Offers */}
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
                  type="button"
                  onClick={() => navigate("/customer/menu")}
                  className="text-sm font-semibold transition hover:opacity-80 text-[var(--primary)] dark:text-white cursor-pointer"
                >
                  View All Offers
                </button>
              </div>

              <MenuGrid>
                {offerProducts.map((product) => {
                  const pId = product.id || product._id;
                  return (
                    <ProductCard
                      key={pId}
                      product={product}
                      quantity={
                        cartItems.find((item) => item.productId === pId)?.quantity || 0
                      }
                      isFavourite={favouriteProducts.some((item) => (item.id || item._id) === pId)}
                      onAdd={() => addToCart(product)}
                      onIncrease={() => increaseQuantity(product)}
                      onDecrease={() => decreaseQuantity(product)}
                      onFavourite={() => handleFavourite(product)}
                      onClick={() => navigate(`/customer/product/${pId}`)}
                    />
                  );
                })}
              </MenuGrid>
            </section>
          )}

          {/* Browse Full Menu CTA */}
          <section className="px-2 sm:px-4 lg:px-6 xl:px-8">
            <div className="rounded-[32px] border border-slate-200 dark:border-[#A9BDCF]/40 bg-white dark:bg-[#181A1B] p-8 text-center shadow-sm">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Looking for something else?
              </h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400">
                Explore our complete menu with all categories, latest dishes, combos and beverages.
              </p>
              <button
                type="button"
                onClick={() => navigate("/customer/menu")}
                className="mt-6 rounded-2xl px-8 py-4 text-lg font-semibold text-white transition hover:scale-[1.02] cursor-pointer"
                style={{ background: "var(--primary)" }}
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