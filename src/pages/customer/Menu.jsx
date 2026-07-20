import { useEffect, useMemo, useState } from "react";
import SectionHeader from "../../components/customer/common/SectionHeader";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CategoryTabs from "../../components/customer/menu/CategoryTabs";
import VegToggle from "../../components/customer/menu/VegToggle";
import SortDropdown from "../../components/customer/menu/SortDropdown";
import MenuGrid from "../../components/customer/menu/MenuGrid";
import ProductCard from "../../components/customer/menu/ProductCard";
import MenuListCard from "../../components/customer/menu/MenuListCard";
import CompactCategoryTabs from "../../components/customer/menu/CompactCategoryTabs";
import CompactSortDropdown from "../../components/customer/menu/CompactSortDropdown";
import CompactVegToggle from "../../components/customer/menu/CompactVegToggle";
import { useCart } from "../../context/CartContext";
import { Bell } from "lucide-react";
import MenuPageSkeleton from "../../components/customer/skeleton/MenuPageSkeleton";
import { useFavourite } from "../../context/FavouriteContext";
import useAuthStore from "../../store/authStore";
import useProductStore from "../../store/productStore";

// Normalizes a raw backend product into the shape the UI expects,
// with safe defaults for fields not confirmed in the documented schema.
const normalizeProduct = (p) => ({
  ...p,
  id: p._id || p.id,
  available: p.is_available ?? p.available ?? true,
  isVeg: typeof p.isVeg === "boolean" ? p.isVeg : null, // null = unknown, don't filter it out
  rating: p.rating || { average: 0, count: 0 },
  bestseller: p.bestseller ?? false,
  featured: p.featured ?? false,
  originalPrice: p.originalPrice ?? null,
  preparationTime: p.preparationTime ?? null,
  image: p.image || p.imageUrl || null,
});

const Menu = () => {
  const { cartItems, addItem, updateItem } = useCart();
  const navigate = useNavigate();
  const { favouriteProducts, toggleFavourite } = useFavourite();

  const sellerId = useAuthStore((state) => state.profile?.seller_id);

  const storefront = useProductStore((state) => state.storefront);
  const categories = useProductStore((state) => state.categories);
  const loading = useProductStore((state) => state.loading);
  const error = useProductStore((state) => state.error);
  const fetchStorefrontCatalog = useProductStore(
    (state) => state.fetchStorefrontCatalog
  );
  const fetchStorefrontCategories = useProductStore(
    (state) => state.fetchStorefrontCategories
  );

  const [activeCategory, setActiveCategory] = useState("all");
  const [vegType, setVegType] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const [filters] = useState({
    bestseller: false,
    offers: false,
    rating: false,
    available: true,
  });

  useEffect(() => {
    if (!sellerId) return;

    fetchStorefrontCategories(sellerId);
    fetchStorefrontCatalog(sellerId, {
      category: activeCategory !== "all" ? activeCategory : undefined,
    });
  }, [sellerId, activeCategory, fetchStorefrontCatalog, fetchStorefrontCategories]);

  const normalizedProducts = useMemo(
    () => storefront.map(normalizeProduct),
    [storefront]
  );

  const filteredProducts = useMemo(() => {
    let products = [...normalizedProducts];

    // veg filter only applies to products where isVeg is actually known;
    // unknown (null) products stay visible either way rather than vanishing
    if (vegType === "veg") {
      products = products.filter((item) => item.isVeg !== false);
    }
    if (vegType === "nonveg") {
      products = products.filter((item) => item.isVeg !== true);
    }

    if (filters.available) {
      products = products.filter((item) => item.available);
    }
    if (filters.bestseller) {
      products = products.filter((item) => item.bestseller);
    }
    if (filters.rating) {
      products = products.filter((item) => item.rating.average >= 4);
    }
    if (filters.offers) {
      products = products.filter((item) => item.originalPrice);
    }

    switch (sortBy) {
      case "price-low":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        products.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        products.sort((a, b) => b.rating.average - a.rating.average);
        break;
      case "popular":
        products.sort((a, b) => b.rating.count - a.rating.count);
        break;
      case "fastest":
        products.sort(
          (a, b) => parseInt(a.preparationTime || 0) - parseInt(b.preparationTime || 0)
        );
        break;
      case "recommended":
      default:
        products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return products;
  }, [normalizedProducts, vegType, filters, sortBy]);

  const getCartItem = (productId) =>
    cartItems.find((item) => item.productId === productId);

  if (loading) {
    return <MenuPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Couldn't load the menu
        </h3>
        <p className="mt-2 text-slate-500 dark:text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="w-full min-w-0 max-w-[1760px] space-y-6 pb-28 px-1 sm:px-2">
        <div className="w-full flex items-center dark:bg-[#181A1B] border border-transparent dark:border-[#A9BDCF]/40 z-50 mt-5 lg:mt-0 rounded-xl p-2 justify-between">
          <SectionHeader
            title="Our Menu"
            subtitle="Freshly prepared dishes made just for you."
          />

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

        <div className="lg:hidden">
          <CompactCategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onChange={setActiveCategory}
          />
        </div>

        <div className="hidden lg:block">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onChange={setActiveCategory}
          />
        </div>

        <div className="relative flex flex-col gap-5 px-4 lg:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <>
              <div className="relative lg:hidden">
                <div className="flex items-center justify-between w-full">
                  <CompactVegToggle value={vegType} onChange={setVegType} />
                  <CompactSortDropdown value={sortBy} onChange={setSortBy} />
                </div>
              </div>
              <div className="hidden lg:block">
                <VegToggle value={vegType} onChange={setVegType} />
              </div>
            </>
            <div className="hidden lg:block">
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </div>
        </div>

        <section className="w-full space-y-6 px-4 lg:px-6">
          <div>
            <p className="mt-1 text-slate-500">
              {filteredProducts.length} items available
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-[28px] border-2 border-dashed border-slate-300 dark:border-[#A9BDCF]/40 bg-white dark:bg-[#181A1B] px-6 py-16 text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                No Products Found
              </h3>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Try changing your filters.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 lg:hidden">
                {filteredProducts.map((product) => (
                  <MenuListCard
                    key={product.id}
                    product={product}
                    quantity={getCartItem(product.id)?.quantity ?? 0}
                    isFavourite={favouriteProducts.some((item) => item.id === product.id)}
                    onFavourite={() => toggleFavourite(product)}
                    onAdd={() => addItem(product, 1)}
                    onIncrease={() => addItem(product, 1)}
                    onDecrease={() => {
                      const item = getCartItem(product.id);
                      if (item) updateItem(item.id, item.quantity - 1);
                    }}
                    onClick={() => navigate(`/customer/product/${product.id}`)}
                  />
                ))}
              </div>

              <div className="hidden lg:block">
                <MenuGrid>
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      quantity={getCartItem(product.id)?.quantity ?? 0}
                      isFavourite={favouriteProducts.some((item) => item.id === product.id)}
                      onFavourite={() => toggleFavourite(product)}
                      onAdd={() => addItem(product, 1)}
                      onIncrease={() => addItem(product, 1)}
                      onDecrease={() => {
                        const item = getCartItem(product.id);
                        if (item) updateItem(item.id, item.quantity - 1);
                      }}
                      onClick={() => navigate(`/customer/product/${product.id}`)}
                    />
                  ))}
                </MenuGrid>
              </div>
            </>
          )}
        </section>
      </div>
    </motion.div>
  );
};

export default Menu;