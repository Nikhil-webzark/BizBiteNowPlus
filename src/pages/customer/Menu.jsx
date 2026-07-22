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
import useCartStore from "../../api/stores/customerstore/cartStore";
import { Bell } from "lucide-react";
import MenuPageSkeleton from "../../components/customer/skeleton/MenuPageSkeleton";
import { useFavourite } from "../../context/FavouriteContext";
import useAuthStore from "../../store/authStore";
import useProductStore from "../../store/productStore";

// Normalizes a raw backend product into the shape the UI expects,
// with safe defaults for fields not confirmed in the documented schema.
const normalizeProduct = (p) => {
  // backend sends `is_veg` (boolean) and/or `food_type` ("veg"/"non-veg"),
  // not `isVeg` — map whichever is present, else unknown (null)
  let isVeg = null;
  if (typeof p.isVeg === "boolean") isVeg = p.isVeg;
  else if (typeof p.is_veg === "boolean") isVeg = p.is_veg;
  else if (typeof p.food_type === "string") isVeg = p.food_type.toLowerCase() === "veg";

  return {
    ...p,
    id: p._id || p.id,
    available: p.is_available ?? p.available ?? true,
    isVeg,
    rating:
      typeof p.rating === "number"
        ? { average: p.rating, count: p.total_reviews ?? 0 }
        : p.rating || { average: 0, count: 0 },
    bestseller: p.bestseller ?? false,
    featured: p.featured ?? false,
    originalPrice: p.originalPrice ?? null,
    preparationTime: p.preparationTime ?? null,
    image: p.image || p.imageUrl || null,
  };
};

const Menu = () => {
  const cartItems = useCartStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addToCart);
  const updateCartItem = useCartStore((state) => state.updateCartItem);
  const removeCartItem = useCartStore((state) => state.removeCartItem);
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
  const [searchQuery, setSearchQuery] = useState("");

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

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      products = products.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
      );
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
  }, [normalizedProducts, vegType, filters, sortBy, searchQuery]);

  const getCartItem = (productId) =>
    cartItems.find(
      (item) => (item.product_id?._id || item.product_id) === productId
    );

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
        <div className="w-full flex items-center justify-between mt-5 lg:mt-0">
          <SectionHeader
            title="Our Menu"
            subtitle="Freshly prepared dishes made just for you."
          />

          <Link
            to="/customer/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors bg-slate-100/70 hover:bg-slate-200/70 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <Bell size={20} strokeWidth={1.75} className="text-slate-600 dark:text-slate-300" />
            <span className="absolute right-0 top-0 flex h-[16px] w-[16px] items-center justify-center rounded-full bg-red-500 text-[9px] font-semibold text-white ring-2 ring-white dark:ring-[#181A1B]">
              3
            </span>
          </Link>
        </div>

        <div className="relative px-1">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for dishes, categories..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-slate-300 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:bg-white/10"
          />
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

        <div className="relative flex items-center justify-between gap-3 px-4 lg:px-6">
          <div className="lg:hidden">
            <CompactVegToggle value={vegType} onChange={setVegType} />
          </div>
          <div className="hidden lg:block">
            <VegToggle value={vegType} onChange={setVegType} />
          </div>

          <div className="lg:hidden">
            <CompactSortDropdown value={sortBy} onChange={setSortBy} />
          </div>
          <div className="hidden lg:block">
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        <section className="w-full space-y-6 px-4 lg:px-6">
          {searchQuery.trim() && (
            <p className="text-sm text-slate-500">
              {filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""} for "{searchQuery.trim()}"
            </p>
          )}

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
                    onAdd={() => addToCart({
                      product_id: product._id || product.id,
                      quantity: 1,
                    })}

                    onIncrease={async () => {
                      const item = getCartItem(product.id);

                      if (!item) {
                        await addToCart({
                          product_id: product._id || product.id,
                          quantity: 1,
                        });
                        return;
                      }

                      await updateCartItem(item.id, item.quantity + 1);
                    }}

                    onDecrease={async () => {
                      const item = getCartItem(product.id);

                      if (!item) return;

                      if (item.quantity <= 1) {
                        await removeCartItem(item.id);
                        return;
                      }

                      await updateCartItem(item.id, item.quantity - 1);
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
                      onAdd={() => addToCart(product)}

                      onIncrease={async () => {
                        const item = getCartItem(product.id);

                        if (!item) {
                          await addToCart(product);
                          return;
                        }

                        await updateCartItem(item.id, item.quantity + 1);
                      }}

                      onDecrease={async () => {
                        const item = getCartItem(product.id);

                        if (!item) return;

                        if (item.quantity <= 1) {
                          await removeCartItem(item.id);
                          return;
                        }

                        await updateCartItem(item.id, item.quantity - 1);
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