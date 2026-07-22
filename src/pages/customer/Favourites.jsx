import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeader from "../../components/customer/common/SectionHeader";
import ProductCard from "../../components/customer/menu/ProductCard";
import MenuListCard from "../../components/customer/menu/MenuListCard";
import MenuGrid from "../../components/customer/menu/MenuGrid";
import MenuPageSkeleton from "../../components/customer/skeleton/MenuPageSkeleton";
import useCartStore from "../../api/stores/customerstore/cartStore";
import {
  getFavorites,
  toggleFavorite,
} from "../../api/customerApi";

const CUSTOMER_ID = "CUSTOMER_001";

const Favourites = () => {
  const navigate = useNavigate();

const cartItems = useCartStore((state) => state.items);
const refreshCart = useCartStore((state) => state.fetchCart);
const clearCart = useCartStore((state) => state.clearCart);

  const [loading, setLoading] =
    useState(true);

  const [favorites, setFavorites] =
    useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);

      const response =
        await getFavorites(CUSTOMER_ID);

      setFavorites(
        response.data?.data || []
      );
    } catch (err) {
      console.log(
        "Favourite Loading Error",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (
    product
  ) => {
    try {
      await toggleFavorite({
        customerId: CUSTOMER_ID,
        productId: product.id,
      });

      setFavorites((prev) =>
        prev.filter(
          (item) =>
            item.productId !== product.id
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  const getCartItem = (productId) =>
    cartItems.find(
      (item) =>
        item.productId === productId
    );

  if (loading) {
    return <MenuPageSkeleton />;
  }

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
      className="space-y-0"
    >
      <div
        className="
          w-full
          max-w-[1760px]
          space-y-6
          pb-28
          px-1
          sm:px-2
        "
      >
        {/* Header */}

        <div
          className="
     
            flex
            items-center
            justify-between

            rounded-xl
            mt-5
            lg:mt-0
            

            p-2

            
          "
        >
          <SectionHeader
            title="Favourite Items"
            subtitle="All your saved dishes in one place."
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

        {/* Body */}

        <section
          className="
            space-y-6
            px-4
            lg:px-6
          "
        >
          <div className="flex items-center justify-between">
            <p className="text-slate-500">
              {favorites.length} favourite
              items
            </p>
          </div>
                    {favorites.length === 0 ? (
            <div
              className="
                rounded-[28px]
                border-2
                border-dashed
                border-slate-300
                bg-white
                px-6
                py-20
                text-center
              "
            >
              <div
                className="
                  mx-auto
                  flex
                  h-20
                  w-20
                  items-center
                  justify-center
                  rounded-full
                  bg-red-50
                "
              >
                <Heart
                  size={34}
                  className="text-red-500"
                />
              </div>

              <h2 className="mt-6 text-2xl font-bold text-slate-900">
                No Favourite Items
              </h2>

              <p className="mt-3 text-slate-500">
                Save dishes you love by tapping the
                heart icon.
              </p>

              <button
                onClick={() =>
                  navigate("/customer/menu")
                }
                className="
                  mt-8

                  rounded-2xl

                  px-6
                  py-3

                  font-semibold

                  text-white
                "
                style={{
                  background:
                    "var(--primary)",
                }}
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {/* Mobile */}

              <div className="space-y-3 lg:hidden">
                {favorites.map((item) => {
                  const product =
                    item.product || item;

                  return (
                    <MenuListCard
                      key={product.id}
                      product={product}
                      quantity={
                        getCartItem(product.id)
                          ?.quantity ?? 0
                      }
                      isFavourite
                      onFavourite={() =>
                        handleFavorite(product)
                      }
                      onAdd={() =>
                        addItem(product, 1)
                      }
                      onIncrease={() =>
                        addItem(product, 1)
                      }
                      onDecrease={() => {
                        const cartItem =
                          getCartItem(
                            product.id
                          );

                        if (cartItem) {
                          updateItem(
                            cartItem.id,
                            cartItem.quantity - 1
                          );
                        }
                      }}
                      onClick={() =>
                        navigate(
                          `/customer/product/${product.id}`
                        )
                      }
                    />
                  );
                })}
              </div>

              {/* Desktop */}

              <div className="hidden lg:block">
                <MenuGrid>
                  {favorites.map((item) => {
                    const product =
                      item.product || item;

                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        quantity={
                          getCartItem(product.id)
                            ?.quantity ?? 0
                        }
                        isFavourite
                        onFavourite={() =>
                          handleFavorite(product)
                        }
                        onAdd={() =>
                          addItem(product, 1)
                        }
                        onIncrease={() =>
                          addItem(product, 1)
                        }
                        onDecrease={() => {
                          const cartItem =
                            getCartItem(
                              product.id
                            );

                          if (cartItem) {
                            updateItem(
                              cartItem.id,
                              cartItem.quantity - 1
                            );
                          }
                        }}
                        onClick={() =>
                          navigate(
                            `/customer/product/${product.id}`
                          )
                        }
                      />
                    );
                  })}
                </MenuGrid>
              </div>
            </>
          )}
        </section>
      </div>
    </motion.div>
  );
};

export default Favourites;