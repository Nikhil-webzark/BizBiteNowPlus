import api from "../axios";


const BASE_URL = "/orders";


export const createOrder = async (payload, config = {}) => {
  try {
    const { data } = await api.post(
      `${BASE_URL}/create`,
      payload,
      config
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};


export const getCustomerOrders = async (params = {}, config = {}) => {
  try {
    const { data } = await api.get(
      `${BASE_URL}/customer-orders`,
      {
        params,
        ...config,
      }
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};


export const reorder = async (payload, config = {}) => {
  try {
    const { data } = await api.post(
      `${BASE_URL}/reorder`,
      payload,
      config
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const initiateCheckout = async (
  payload,
  config = {}
) => {
  try {
    const { data } = await api.post(
      `${BASE_URL}/checkout/initiate`,
      payload,
      config
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};


export const verifyCheckout = async (
  payload,
  config = {}
) => {
  try {
    const { data } = await api.post(
      `${BASE_URL}/checkout/verify`,
      payload,
      config
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};


export const createDineInOrder = async (
  payload,
  config = {}
) => {
  try {
    const { data } = await api.post(
      `${BASE_URL}/dine-in/create`,
      payload,
      config
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};
export const getCustomerOrder = async (
  orderId,
  config = {}
) => {
  try {
    const { data } = await api.get(
      `${BASE_URL}/${orderId}`,
      config
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const cancelOrder = async (
  orderId,
  config = {}
) => {
  try {
    const { data } = await api.patch(
      `${BASE_URL}/${orderId}/cancel`,
      {},
      config
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const trackOrder = async (
  orderId,
  config = {}
) => {
  try {
    const { data } = await api.get(
      `${BASE_URL}/${orderId}/track`,
      config
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

function normalizeApiError(error) {
  if (error?.response) {
    return {
      success: false,
      status: error.response.status,
      message:
        error.response.data?.message ||
        "Request failed.",
      errors: error.response.data?.errors ?? null,
      data: error.response.data ?? null,
    };
  }

  if (error?.request) {
    return {
      success: false,
      status: 0,
      message:
        "Network error. Please check your internet connection.",
      errors: null,
      data: null,
    };
  }

  return {
    success: false,
    status: 0,
    message: error?.message || "Something went wrong.",
    errors: null,
    data: null,
  };
}