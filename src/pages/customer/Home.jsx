import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FestiveDealCard from "../../components/customer/home/FestiveDealCard";
import { useFavourite } from "../../context/FavouriteContext";

import useAuthStore from "../../store/authStore";
import useProductStore from "../../store/productStore";
import useCartStore from "../../api/stores/customerstore/cartStore";
import useTableStore from "../../store/tableStore";
import HeroBanner from "../../components/customer/hero/HeroBanner";

import MenuGrid from "../../components/customer/menu/MenuGrid";
import ProductCard from "../../components/customer/menu/ProductCard";

import BannerCarousel from "../../components/customer/home/BannerCarousel";
import QROrderCard from "../../components/customer/home/QROrderCard";
import DeliveryChecker from "../../components/customer/home/DeliveryChecker";
import HorizontalSection from "../../components/customer/home/HorizontalSection";

import QROrderCardSkeleton from "../../components/customer/skeleton/QROrderCardSkeleton";
import BannerSkeleton from "../../components/customer/skeleton/BannerSkeleton";
import HeroSkeleton from "../../components/customer/skeleton/HeroSkeleton";

const normalizeProduct = (p) => ({
  ...p,

  id: p._id || p.id,

  name: p.name,

  price: p.price ?? 0,

  image: p.image,

  description: p.description || "",

  category: p.category || "Other",

  isVeg: typeof p.is_veg === "boolean" ? p.is_veg : true,

  available: p.is_available ?? p.available ?? true,

  rating: {
    average: p.rating ?? p.rating?.average ?? 0,

    count: p.total_reviews ?? p.rating?.count ?? 0,
  },

  variants: p.variants || [],

  addons: p.addons || [],

  originalPrice: p.originalPrice || null,
});

const Home = () => {
  const navigate = useNavigate();

  const sellerId = useAuthStore((s) => s.profile?.seller_id);

  const customerMohalla = useAuthStore((s) => s.profile?.mohalla);

  const resolvedTable = useTableStore((s) => s.resolvedTable);
  // ======================
  // PRODUCT STORE
  // ======================

  const storefront = useProductStore((s) => s.storefront);

  const fullMenu = useProductStore((s) => s.fullMenu);

  const combos = useProductStore((s) => s.combos);

  const festiveDeals = useProductStore((s) => s.festiveDeals);
  const categories = useProductStore((s) => s.categories);
  const fetchStorefrontCatalog = useProductStore(
    (s) => s.fetchStorefrontCatalog,
  );
  const fetchStorefrontCategories = useProductStore(
    (s) => s.fetchStorefrontCategories,
  );

  const fetchFullMenu = useProductStore((s) => s.fetchFullMenu);

  const fetchCombos = useProductStore((s) => s.fetchCombos);

  const fetchFestiveDeals = useProductStore((s) => s.fetchFestiveDeals);

  const fetchAvailableMohallas = useProductStore(
    (s) => s.fetchAvailableMohallas,
  );

  // ======================
  // CART STORE
  // ======================

  const cartItems = useCartStore((s) => s.items);

  const addToCart = useCartStore((s) => s.addToCart);

  const updateCartItem = useCartStore((s) => s.updateCartItem);

  const removeCartItem = useCartStore((s) => s.removeCartItem);

  const fetchCart = useCartStore((s) => s.fetchCart);

  const { favouriteProducts, toggleFavourite } = useFavourite();

  const [loading, setLoading] = useState(true);

  const [checkedLocation, setCheckedLocation] = useState("");

  // ======================
  // LOAD BACKEND DATA
  // ======================

  useEffect(() => {
    if (!sellerId) return;

    const loadStorefront = async () => {
      setLoading(true);

      try {
        await Promise.all([
          // Product catalog
          fetchStorefrontCatalog(sellerId),

          // Category list
          fetchStorefrontCategories(sellerId),

          // Complete categorized menu
          fetchFullMenu(sellerId),

          // Combo offers
          fetchCombos(sellerId),

          // Festive offers
          fetchFestiveDeals(sellerId),

          // Delivery locations
          fetchAvailableMohallas(sellerId),
        ]);
      } catch (err) {
        console.error("Storefront error", err);
      } finally {
        setLoading(false);
      }
    };

    loadStorefront();
  }, [
    sellerId,
    fetchStorefrontCatalog,
    fetchStorefrontCategories,
    fetchFullMenu,
    fetchCombos,
    fetchFestiveDeals,
    fetchAvailableMohallas,
  ]);

  useEffect(() => {
    fetchCart().catch(() => {});
  }, [fetchCart]);

  // ======================
  // NORMALIZE DATA
  // ======================

  const products = useMemo(
    () => storefront.map(normalizeProduct),
    [storefront],
  );
  const catalogProducts = products;
  const menuProducts = useMemo(() => {
    return fullMenu.flatMap((section) =>
      section.products.map(normalizeProduct),
    );
  }, [fullMenu]);

  const comboProducts = useMemo(() => combos.map(normalizeProduct), [combos]);

  const offerProducts = useMemo(
    () => products.filter((p) => p.originalPrice && p.originalPrice > p.price),
    [products],
  );

  const getCartItem = (productId) =>
  cartItems.find((item) => {
    const pid =
      typeof item.product_id === "object"
        ? item.product_id?._id
        : (item.product_id ?? item.productId ?? item.product?._id);
    return pid === productId;
  });

  const handleAdd = (product) => addToCart(product).catch(() => {});

  const increaseQuantity = (product) => {
    const existing = getCartItem(product.id);

    if (existing) {
      updateCartItem(existing._id, existing.quantity + 1).catch(() => {});
    } else {
      handleAdd(product);
    }
  };

  const decreaseQuantity = (product) => {
    const existing = getCartItem(product.id);

    if (!existing) return;

    if (existing.quantity <= 1) {
      removeCartItem(existing._id).catch(() => {});
    } else {
      updateCartItem(existing._id, existing.quantity - 1).catch(() => {});
    }
  };

  const handleCheckDelivery = async () => {
    try {
      const locations = await fetchAvailableMohallas(sellerId);

      const available = locations.some(
        (m) => m.toLowerCase() === customerMohalla?.toLowerCase(),
      );

      setCheckedLocation(customerMohalla || "");

      alert(available ? "Delivery available" : "Delivery unavailable");
    } catch {
      alert("Unable to check delivery");
    }
  };
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
      }}
      className="space-y-6"
    >
      <div
        className="
        w-full
        min-w-0
        max-w-[1760px]
        space-y-8
        pb-28
        px-2
        lg:px-10
      "
      >
        {/* ======================
          MOBILE VIEW
      ======================= */}

        <div className="space-y-6 lg:hidden">
          {loading ? <BannerSkeleton /> : <BannerCarousel banners={[]} />}

          {loading ? (
            <QROrderCardSkeleton />
          ) : (
            <QROrderCard
              tableNumber={resolvedTable?.table_number}
              onScan={() => navigate("/customer/scan-qr")}
            />
          )}

          <DeliveryChecker
            location={checkedLocation}
            onCheck={handleCheckDelivery}
          />
          {categories.length > 0 && (
            <section className="space-y-3 px-1">
              <h2 className="text-lg font-bold text-slate-900">
                Categories 🍽️
              </h2>

              <div
                className="
flex
gap-3
overflow-x-auto
pb-2
"
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() =>
                      navigate(`/customer/menu?category=${category}`)
                    }
                    className="
whitespace-nowrap
rounded-full
bg-slate-100
px-4
py-2
text-sm
font-semibold
text-slate-700
"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </section>
          )}
          {catalogProducts.length > 0 && (
            <HorizontalSection
              title="Popular Items 🔥"
              subtitle="Customer favourites from today's menu."
              buttonText="View All"
              onViewAll={() => navigate("/customer/menu")}
              products={catalogProducts}
              cartItems={cartItems}
              favouriteProducts={favouriteProducts}
              onProductClick={(p) => navigate(`/customer/product/${p.id}`)}
              onFavourite={(id) =>
                toggleFavourite(catalogProducts.find((p) => p.id === id))
              }
              onAdd={handleAdd}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
            />
          )}
          {/* FULL MENU */}

          {menuProducts.length > 0 && (
            <HorizontalSection
              title="Full Menu 🍽️"
              subtitle="Explore all dishes available today."
              buttonText="View All"
              onViewAll={() => navigate("/customer/menu")}
              products={menuProducts}
              cartItems={cartItems}
              favouriteProducts={favouriteProducts}
              onProductClick={(p) => navigate(`/customer/product/${p.id}`)}
              onFavourite={(id) =>
                toggleFavourite(menuProducts.find((p) => p.id === id))
              }
              onAdd={handleAdd}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
            />
          )}

          {/* OFFERS */}

          {offerProducts.length > 0 && (
            <HorizontalSection
              title="Today's Offers 🔥"
              subtitle="Save more today."
              buttonText="View All"
              onViewAll={() => navigate("/customer/menu")}
              products={offerProducts}
              cartItems={cartItems}
              favouriteProducts={favouriteProducts}
              onProductClick={(p) => navigate(`/customer/product/${p.id}`)}
              onAdd={handleAdd}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
            />
          )}

          {/* FESTIVE DEALS */}

          {festiveDeals.length > 0 && (
            <section className="space-y-4">
              <h2
                className="
text-xl
font-bold
dark:text-white
"
              >
                Festive Deals 🎉
              </h2>

              <div
                className="
flex
gap-4
overflow-x-auto
pb-2
"
              >
                {festiveDeals.map((deal) => (
                  <FestiveDealCard key={deal._id} deal={deal} />
                ))}
              </div>
            </section>
          )}

          {/* COMBOS */}

          {comboProducts.length > 0 && (
            <HorizontalSection
              title="Combo Meals 🍱"
              subtitle="Better value meals."
              buttonText="View All"
              products={comboProducts}
              cartItems={cartItems}
              favouriteProducts={favouriteProducts}
              onProductClick={(p) => navigate(`/customer/product/${p.id}`)}
              onAdd={handleAdd}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
            />
          )}

          {/* FAVORITES */}

          {favouriteProducts.length > 0 && (
            <HorizontalSection
              title="Your Favorites ❤️"
              subtitle="Dishes you love."
              buttonText="View All"
              products={favouriteProducts}
              cartItems={cartItems}
              favouriteProducts={favouriteProducts}
              onProductClick={(p) => navigate(`/customer/product/${p.id}`)}
              onAdd={handleAdd}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
            />
          )}
        </div>

        {/* ======================
          DESKTOP VIEW
      ======================= */}

        <div className="hidden lg:block space-y-10">
          {loading ? (
            <HeroSkeleton />
          ) : (
            <HeroBanner
              banners={[]}
              logo={null}
              name="Welcome"
              tagline="Fresh food prepared for you"
              deliveryTime=""
              isOpen={true}
            />
          )}

          {categories.length > 0 && (
            <section className="space-y-4">
              <h2
                className="
text-2xl
font-bold
text-slate-900
dark:text-white
"
              >
                Categories 🍽️
              </h2>

              <div
                className="
flex
gap-4
flex-wrap
"
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() =>
                      navigate(`/customer/menu?category=${category}`)
                    }
                    className="
rounded-full
border
px-5
py-2
font-semibold
"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </section>
          )}
          {catalogProducts.length > 0 && (
            <section className="space-y-6">
              <div>
                <h2
                  className="
text-2xl
font-bold
dark:text-white
"
                >
                  Popular Items 🔥
                </h2>

                <p className="text-slate-500">Fresh items available now.</p>
              </div>

              <MenuGrid>
                {catalogProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={getCartItem(product.id)?.quantity || 0}
                    isFavourite={favouriteProducts.some(
                      (item) => item.id === product.id,
                    )}
                    onAdd={() => handleAdd(product)}
                    onIncrease={() => increaseQuantity(product)}
                    onDecrease={() => decreaseQuantity(product)}
                    onFavourite={() => toggleFavourite(product)}
                    onClick={() => navigate(`/customer/product/${product.id}`)}
                  />
                ))}
              </MenuGrid>
            </section>
          )}
          {/* FULL MENU */}

          {menuProducts.length > 0 && (
            <section className="space-y-6">
              <div
                className="
                flex
                items-center
                justify-between
                "
              >
                <div>
                  <h2
                    className="
                    text-2xl
                    font-bold
                    text-slate-900
                    dark:text-white
                    "
                  >
                    Full Menu 🍽️
                  </h2>

                  <p className="text-slate-500">Explore our complete menu.</p>
                </div>

                <button
                  onClick={() => navigate("/customer/menu")}
                  className="
                  text-sm
                  font-semibold
                  text-[var(--primary)]
                  "
                >
                  View Full Menu
                </button>
              </div>

              <MenuGrid>
                {menuProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={getCartItem(product.id)?.quantity || 0}
                    isFavourite={favouriteProducts.some(
                      (item) => item.id === product.id,
                    )}
                    onAdd={() => handleAdd(product)}
                    onIncrease={() => increaseQuantity(product)}
                    onDecrease={() => decreaseQuantity(product)}
                    onFavourite={() => toggleFavourite(product)}
                    onClick={() => navigate(`/customer/product/${product.id}`)}
                  />
                ))}
              </MenuGrid>
            </section>
          )}

          {/* FESTIVE DEALS */}

          <section className="space-y-6">
            <h2
              className="
text-2xl
font-bold
dark:text-white
"
            >
              Festive Deals 🎉
            </h2>

            <div
              className="
grid
grid-cols-2
xl:grid-cols-3
gap-6
"
            >
              {festiveDeals.map((deal) => (
                <FestiveDealCard key={deal._id} deal={deal} />
              ))}
            </div>
          </section>
          {/* COMBOS */}

          {comboProducts.length > 0 && (
            <section className="space-y-6">
              <h2
                className="
                text-2xl
                font-bold
                dark:text-white
                "
              >
                Combo Meals 🍱
              </h2>

              <MenuGrid>
                {comboProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={() => handleAdd(product)}
                    onClick={() => navigate(`/customer/product/${product.id}`)}
                  />
                ))}
              </MenuGrid>
            </section>
          )}

          {/* OFFERS */}

          {offerProducts.length > 0 && (
            <section className="space-y-6">
              <h2
                className="
                text-2xl
                font-bold
                dark:text-white
                "
              >
                Today's Offers 🔥
              </h2>

              <MenuGrid>
                {offerProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={() => handleAdd(product)}
                    onClick={() => navigate(`/customer/product/${product.id}`)}
                  />
                ))}
              </MenuGrid>
            </section>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Home;
