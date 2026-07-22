import api from "./axios";

// Helper function to get seller_id safely
const getSellerId = () => {
  let sellerId = localStorage.getItem("seller_id") || localStorage.getItem("current_seller_id");
  if (!sellerId) {
    try {
      const rawAuth = localStorage.getItem("bizbite-auth");
      if (rawAuth) {
        sellerId = JSON.parse(rawAuth)?.state?.user?.seller_id;
      }
    } catch (e) {
      console.error("Failed to parse auth for seller_id", e);
    }
  }
  return sellerId;
};

// Helper function to get customer phone safely
const getCustomerPhone = () => {
  let phone = localStorage.getItem("customer_phone");
  if (!phone) {
    try {
      const rawAuth = localStorage.getItem("bizbite-auth");
      if (rawAuth) {
        phone = JSON.parse(rawAuth)?.state?.user?.phone || JSON.parse(rawAuth)?.state?.user?.phoneNumber;
      }
    } catch (e) {
      console.error("Failed to parse auth for phone", e);
    }
  }
  return phone;
};

/* =========================================================================
   CUSTOMER API ENDPOINTS
   ========================================================================= */

// 1. Get Store Details
export const getStore = async (sellerId = getSellerId()) => {
  if (!sellerId) throw new Error("Seller ID missing");
  return await api.get(`/store/${sellerId}`);
};

// 2. Get Menu List
export const getMenu = async (sellerId = getSellerId()) => {
  if (!sellerId) throw new Error("Seller ID missing");
  return await api.get(`/menu/${sellerId}`);
};

// 3. Get Today Special Products
export const getTodaySpecialProducts = async (sellerId = getSellerId()) => {
  if (!sellerId) throw new Error("Seller ID missing");
  return await api.get(`/menu/today-special/${sellerId}`);
};

// 4. Get Combo Meal Products
export const getComboMealProducts = async (sellerId = getSellerId()) => {
  if (!sellerId) throw new Error("Seller ID missing");
  return await api.get(`/menu/combo-meals/${sellerId}`);
};

// 5. Get Recently Ordered Products
export const getRecentlyOrderedProducts = async (
  sellerId = getSellerId(),
  phone = getCustomerPhone()
) => {
  if (!sellerId) throw new Error("Seller ID missing");
  return await api.get(`/customer/recently-ordered`, {
    params: { seller_id: sellerId, customer_phone: phone },
  });
};

// 6. Single Product Details (for ProductDetails.jsx)
export const getProduct = async (productId) => {
  if (!productId) throw new Error("Product ID missing");
  return await api.get(`/product/${productId}`);
};
export const getProductById = getProduct;

// 7. Favorites / Favourites Endpoints (for Favourites.jsx)
export const getFavorites = async (
  sellerId = getSellerId(),
  phone = getCustomerPhone()
) => {
  return await api.get(`/customer/favorites`, {
    params: { seller_id: sellerId, customer_phone: phone },
  });
};
export const getFavourites = getFavorites;

export const toggleFavorite = async (data) => {
  return await api.post(`/customer/favorites/toggle`, data);
};
export const toggleFavourite = toggleFavorite;

// 8. Notifications Endpoints (for CustomerHeader.jsx)
export const getCustomerNotifications = async (phone = getCustomerPhone()) => {
  if (!phone) {
    console.warn("Customer phone missing, skipping notifications API call");
    return { data: [] };
  }
  return await api.get(`/notifications/customer/${phone}`);
};
export const getNotifications = getCustomerNotifications;