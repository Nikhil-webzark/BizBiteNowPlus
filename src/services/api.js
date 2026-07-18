import API from "../api/axios";

// =======================
// AUTH APIs
// =======================

export const registerSeller = (data) =>
  API.post("/users/admin/register-seller", data);

export const login = (data) => API.post("/users/login", data);

export const forgotPin = (data) => API.post("/users/forgot-pin", data);

export const resetPin = (data) => API.post("/users/reset-pin", data);

export const changePin = (data) => API.post("/users/change-pin", data);

export const registerCustomer = (data) =>
  API.post("/users/customer/register", data);

export const verifyAccessToken = (data) =>
  API.post("/users/verify-access-token", data);

export const sendOTP = (data) => API.post("/users/send-otp", data);

export const verifyOTP = (data) => API.post("/users/verify-otp", data);

export const resendOTP = (data) => API.post("/users/resend-otp", data);
