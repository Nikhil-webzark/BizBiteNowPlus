import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const FavouriteContext = createContext(null);

export function FavouriteProvider({ children }) {
  const [favouriteProducts, setFavouriteProducts] = useState(() => {
    const saved = localStorage.getItem("customer-favourites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "customer-favourites",
      JSON.stringify(favouriteProducts)
    );
  }, [favouriteProducts]);

  const isFavourite = (productId) =>
    favouriteProducts.some(
      (item) => item.id === productId
    );

  const toggleFavourite = (product) => {
    if (!product) return;

    setFavouriteProducts((prev) => {
      const exists = prev.some(
        (item) => item.id === product.id
      );

      if (exists) {
        return prev.filter(
          (item) => item.id !== product.id
        );
      }

      return [...prev, product];
    });
  };

  const clearFavourites = () => {
    setFavouriteProducts([]);
  };

  const value = useMemo(
    () => ({
      favouriteProducts,
      isFavourite,
      toggleFavourite,
      clearFavourites,
    }),
    [favouriteProducts]
  );

  return (
    <FavouriteContext.Provider value={value}>
      {children}
    </FavouriteContext.Provider>
  );
}

export function useFavourite() {
  const context = useContext(FavouriteContext);

  if (!context) {
    throw new Error(
      "useFavourite must be used inside FavouriteProvider."
    );
  }

  return context;
}