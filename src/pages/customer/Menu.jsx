import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SectionHeader from "../../components/customer/common/SectionHeader";
import { useNavigate, Link } from "react-router-dom";
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
import { Bell } from "lucide-react";
import MenuPageSkeleton from "../../components/customer/skeleton/MenuPageSkeleton";
import { useFavourite } from "../../context/FavouriteContext";
import useAuthStore from "../../store/authStore";
import useProductStore from "../../store/productStore";
import useCartStore from "../../api/stores/customerstore/cartStore";

const PAGE_SIZE = 12;

const normalizeProduct = (p) => ({
  ...p,
  id: p._id || p.id,
  available: p.is_available ?? true,

  // Now REAL fields confirmed from backend
  isVeg: typeof p.is_veg === "boolean" ? p.is_veg : true,
  rating: {
    average: typeof p.rating === "number" ? p.rating : 0,
    count: p.total_reviews ?? 0,
  },
  popularityCount: p.popularity_count ?? 0,

  // Still NOT present on the backend — kept as safe defaults
  bestseller: p.bestseller ?? false,
  featured: p.featured ?? false,
  originalPrice: p.originalPrice ?? null,
  preparationTime: p.preparationTime ?? 15,

  variants: p.variants || [],
  addons: p.addons || [],
});

const Menu = () => {
  const navigate = useNavigate();
  const { favouriteProducts, toggleFavourite } = useFavourite();

  const sellerId = useAuthStore((state) => state.profile?.seller_id);

  const storefront = useProductStore((state) => state.storefront);
  const categories = useProductStore((state) => state.categories);
  const productLoading = useProductStore((state) => state.loading);
  const error = useProductStore((state) => state.error);
  const fetchStorefrontCatalog = useProductStore(
    (state) => state.fetchStorefrontCatalog,
  );
  const fetchStorefrontCategories = useProductStore(
    (state) => state.fetchStorefrontCategories,
  );

  // Zustand cart store — replaces CartContext entirely
  const cartItems = useCartStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addToCart);
  const updateCartItem = useCartStore((state) => state.updateCartItem);
  const removeCartItem = useCartStore((state) => state.removeCartItem);
  const fetchCart = useCartStore((state) => state.fetchCart);

  const [activeCategory, setActiveCategory] = useState("all");
  const [prevCategory, setPrevCategory] = useState(activeCategory);
  const [vegType, setVegType] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMoreRef = useRef(null);
  const categoryOptions = useMemo(
    () => [
      { id: "all", name: "All", icon: "🍽️" },
      ...categories.map((cat) => ({ id: cat, name: cat, icon: "🍴" })),
    ],
    [categories],
  );
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
  }, [
    sellerId,
    activeCategory,
    fetchStorefrontCatalog,
    fetchStorefrontCategories,
  ]);


  if (activeCategory !== prevCategory) {
    setPrevCategory(activeCategory);
    setVisibleCount(PAGE_SIZE);
  }

  // Load the cart once on mount so quantities reflect what's already added
  useEffect(() => {
    fetchCart().catch(() => {});
  }, [fetchCart]);

  const normalizedProducts = useMemo(
    () => storefront.map(normalizeProduct),
    [storefront],
  );

  const filteredProducts = useMemo(() => {
    let products = [...normalizedProducts];

    if (vegType === "veg") {
      products = products.filter((item) => item.isVeg === true);
    }
    if (vegType === "nonveg") {
      products = products.filter((item) => item.isVeg === false);
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
        products.sort((a, b) => b.popularityCount - a.popularityCount);
        break;
      case "fastest":
        products.sort(
          (a, b) => parseInt(a.preparationTime) - parseInt(b.preparationTime),
        );
        break;
      case "recommended":
      default:
        products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return products;
  }, [normalizedProducts, vegType, filters, sortBy]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE);
      setLoadingMore(false);
    }, 300);
  }, [hasMore]);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 1 },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  // ⚠️ Field name assumption: matching on item.product_id since that's what
  // useCartStore.addToCart sends as the payload key. Confirm this is also
  // what the backend's GET /cart response returns per item — if the real
  // response uses a nested `item.product._id` instead, update this line.
  const getCartItem = (productId) =>
    cartItems.find((item) => {
      const pid =
        typeof item.product_id === "object"
          ? item.product_id?._id
          : (item.product_id ?? item.productId ?? item.product?._id);
      return pid === productId;
    });

  const handleAdd = (product) => addToCart(product).catch(() => {});

  const handleIncrease = (product) => {
    const existing = getCartItem(product.id);
    if (existing) {
      updateCartItem(existing._id || existing.id, existing.quantity + 1).catch(
        () => {},
      );
    } else {
      addToCart(product).catch(() => {});
    }
  };

  const handleDecrease = (product) => {
    const existing = getCartItem(product.id);
    if (!existing) return;
    if (existing.quantity <= 1) {
      removeCartItem(existing._id || existing.id).catch(() => {});
    } else {
      updateCartItem(existing._id || existing.id, existing.quantity - 1).catch(
        () => {},
      );
    }
  };

  if (productLoading) {
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
            categories={categoryOptions}
            activeCategory={activeCategory}
            onChange={setActiveCategory}
          />
        </div>
        <div className="hidden lg:block">
          <CategoryTabs
            categories={categoryOptions}
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
          <p className="mt-1 text-slate-500">
            {filteredProducts.length} items available
          </p>

          {visibleProducts.length === 0 ? (
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
                {visibleProducts.map((product) => (
                  <MenuListCard
                    key={product.id}
                    product={product}
                    quantity={getCartItem(product.id)?.quantity ?? 0}
                    isFavourite={favouriteProducts.some(
                      (item) => item.id === product.id,
                    )}
                    onFavourite={() => toggleFavourite(product)}
                    onAdd={() => handleAdd(product)}
                    onIncrease={() => handleIncrease(product)}
                    onDecrease={() => handleDecrease(product)}
                    onClick={() => navigate(`/customer/product/${product.id}`)}
                  />
                ))}
              </div>

              <div className="hidden lg:block">
                <MenuGrid>
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      quantity={getCartItem(product.id)?.quantity ?? 0}
                      isFavourite={favouriteProducts.some(
                        (item) => item.id === product.id,
                      )}
                      onFavourite={() => toggleFavourite(product)}
                      onAdd={() => handleAdd(product)}
                      onIncrease={() => handleIncrease(product)}
                      onDecrease={() => handleDecrease(product)}
                      onClick={() =>
                        navigate(`/customer/product/${product.id}`)
                      }
                    />
                  ))}
                </MenuGrid>
              </div>

              {hasMore && (
                <div ref={loadMoreRef} className="flex justify-center py-8">
                  {loadingMore ? (
                    <p className="text-sm text-slate-500">
                      Loading more items...
                    </p>
                  ) : (
                    <div className="h-6" />
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </motion.div>
  );
};

export default Menu;
