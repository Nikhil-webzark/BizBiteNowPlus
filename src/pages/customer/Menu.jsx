import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  getMenu,
  getCategories,
} from "../../api/customerApi";

import { useFavourite } from "../../context/FavouriteContext";

const Menu = () => {
  const { cartItems, addItem, updateItem } = useCart();
  const navigate = useNavigate();
  const {
  favouriteProducts,
  toggleFavourite,
} = useFavourite();

  const [categories, setCategories] = useState([]);

  const [menuData, setMenuData] = useState([]);



  const [cursor, setCursor] = useState(null);

  const [loading, setLoading] = useState(true);

  const [loadingMore, setLoadingMore] = useState(false);

  const loadMoreRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState("all");

  const [vegType, setVegType] = useState("all");

  const [sortBy, setSortBy] = useState("featured");

  const [filters] = useState({
    bestseller: false,
    offers: false,
    rating: false,
    available: true,
  });

  const loadMenu = useCallback(
    async (reset = false) => {
      try {
        if (reset) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const response = await getMenu({
          limit: 12,
          cursor: reset ? "" : cursor,
        });

        const newProducts = response.data.data;

        if (reset) {
          setMenuData(newProducts);
        } else {
          setMenuData((prev) => [...prev, ...newProducts]);
        }

        setCursor(response.data.nextCursor);
      } catch (error) {
        console.log("Menu Loading Error:", error);
      } finally {
        setLoading(false);

        setLoadingMore(false);
      }
    },
    [cursor],
  );

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const categoryResponse = await getCategories();

        setCategories(categoryResponse.data.data);

        await loadMenu(true);
       
      } catch (error) {
        console.log("Initial Menu Error", error);
      }
    };

    loadInitial();
  }, [loadMenu]);
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && cursor && !loadingMore) {
          loadMenu();
        }
      },
      {
        threshold: 1,
      },
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [cursor, loadMenu, loadingMore]);

  const filteredProducts = useMemo(() => {
    let products = [...menuData];

    if (activeCategory !== "all") {
      products = products.filter((item) => {
        const productCategory = (item.category?.id ?? item.category ?? "")
          .toString()
          .toLowerCase();

        const selectedCategory = activeCategory.toString().toLowerCase();

        return productCategory === selectedCategory;
      });
    }

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
      products = products.filter((item) => (item.rating?.average ?? 0) >= 4);
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
        products.sort(
          (a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0),
        );
        break;

      case "popular":
        products.sort(
          (a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0),
        );
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
  }, [menuData, activeCategory, vegType, filters, sortBy]);

  const getCartItem = (productId) =>
    cartItems.find((item) => item.productId === productId);

  if (loading) {
    return <MenuPageSkeleton />;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="space-y-6">
      <div
        className="
    w-full
    min-w-0
    max-w-[1760px]

    space-y-6
    pb-28
    
    px-1
    sm:px-2

  ">
        <div className="w-full flex items-center  dark:bg-[#181A1B] border border-transparent dark:border-[#A9BDCF]/40 z-50 mt-5 lg:mt-0  rounded-xl p-2 justify-between">
          <SectionHeader
            title="Our Menu"
            subtitle="Freshly prepared dishes made just for you."
          />

          <Link
            to="/customer/notifications"
            className="
    relative
    flex
    h-11
    w-11
    items-center
    justify-center
    rounded-xl
    bg-slate-200
    transition
    hover:bg-slate-300
  "
          >
            <Bell size={22} className="text-slate-700" />

            <span
              className="
      absolute
      -right-1
      -top-1
      flex
      h-5
      w-5
      items-center
      justify-center
      rounded-full
      bg-red-500
      text-[10px]
      font-bold
      text-white
    "
            >
              3
            </span>
          </Link>
        </div>
        {/* Categories */}

        {/* Mobile Only */}

        <div className="lg:hidden">
          <CompactCategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onChange={setActiveCategory}
          />
        </div>

        {/* Desktop Only */}

        <div className="hidden lg:block">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onChange={setActiveCategory}
          />
        </div>

        {/* Filters */}

        <div
          className="
          relative
          flex
          flex-col
          gap-5
          px-4
          lg:px-6
        ">
          <div
            className="
            flex
            flex-col
            gap-4

            lg:flex-row
            lg:items-center
            lg:justify-between
          ">
            <>
              {/* Mobile */}

              <div className="relative lg:hidden">
                <div
                  className="
    flex
    items-center
    justify-between
    w-full
  ">
                  <CompactVegToggle value={vegType} onChange={setVegType} />

                  <CompactSortDropdown value={sortBy} onChange={setSortBy} />
                </div>
              </div>
              {/* Desktop */}

              <div className="hidden lg:block">
                <VegToggle value={vegType} onChange={setVegType} />
              </div>
            </>

            <>
              <div className="hidden lg:block">
                <SortDropdown value={sortBy} onChange={setSortBy} />
              </div>
            </>
          </div>
        </div>

        {/* Products */}

        <section
          className="
          w-full
          space-y-6
          px-4
          lg:px-6
        ">
          <div>
            <p
              className="
              mt-1
              text-slate-500
            ">
              {filteredProducts.length} items available
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div
              className="
                rounded-[28px]
                border-2
                border-dashed
                border-slate-300 dark:border-[#A9BDCF]/40
                bg-white dark:bg-[#181A1B]
                px-6
                py-16
                text-center
              ">
              <h3
                className="
                  text-xl
                  font-bold
                  text-slate-900 dark:text-white
                ">
                No Products Found
              </h3>

              <p
                className="
                  mt-2
                  text-slate-500 dark:text-slate-400
                ">
                Try changing your filters.
              </p>
            </div>
          ) : (
            <>
              <>
                {/* Mobile */}

                <div className="space-y-3 lg:hidden">
                  {filteredProducts.map((product) => (
                    <MenuListCard
                      key={product.id}
                      product={product}
                      quantity={getCartItem(product.id)?.quantity ?? 0}
                      isFavourite={favouriteProducts.some(
                          (item) => item.id === product.id)}
                      onFavourite={() => toggleFavourite(product)}
                      onAdd={() => addItem(product, 1)}
                      onIncrease={() => addItem(product, 1)}
                      onDecrease={() => {
                        const item = getCartItem(product.id);

                        if (item) {
                          updateItem(item.id, item.quantity - 1);
                        }
                      }}
                      onClick={() =>
                        navigate(`/customer/product/${product.id}`)
                      }
                    />
                  ))}
                </div>

                {/* Desktop */}

                <div className="hidden lg:block">
                  <MenuGrid>
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        quantity={getCartItem(product.id)?.quantity ?? 0}
                        isFavourite={favouriteProducts.some( 
                          (item) => item.id === product.id)}
                        onFavourite={() => toggleFavourite(product)}
                        onAdd={() => addItem(product, 1)}
                        onIncrease={() => addItem(product, 1)}
                        onDecrease={() => {
                          const item = getCartItem(product.id);

                          if (item) {
                            updateItem(item.id, item.quantity - 1);
                          }
                        }}
                        onClick={() =>
                          navigate(`/customer/product/${product.id}`)
                        }
                      />
                    ))}
                  </MenuGrid>
                </div>
              </>

              {/* Cursor Loader */}

              {cursor && (
                <div
                  ref={loadMoreRef}
                  className="
                      flex
                      justify-center
                      py-8
                    ">
                  {loadingMore ? (
                    <p
                      className="
                            text-sm
                            text-slate-500
                          ">
                      Loading more items...
                    </p>
                  ) : (
                    <div
                      className="
                            h-6
                          "
                    />
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
