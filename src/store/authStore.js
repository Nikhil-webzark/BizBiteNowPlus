import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  login,
  forgotPin,
  resetPin,
  changePin,
  sendOTP,
  verifyOTP,
  resendOTP,
  verifyAccessToken,
} from "../services/api";

const useAuthStore = create(
  persist(
    (set) => ({
      // ===========================
      // STATES
      // ===========================

      user: null,
      token: null,
      role: null,
      profile: null,

      loading: false,
      error: null,

      verificationToken: null,

      isAuthenticated: false,

      // ===========================
      // LOGIN
      // ===========================

      login: async (payload) => {
        try {
          set({
            loading: true,
            error: null,
          });

          const res = await login(payload);

          const data = res.data;

          set({
            token: data.token,
            user: data.user,
            role: data.user?.role,
            profile: data.profile,
            isAuthenticated: true,
          });

          return data;
        } catch (err) {
          set({
            error: err.response?.data?.message || "Login failed",
          });

          throw err;
        } finally {
          set({
            loading: false,
          });
        }
      },

      // ===========================
      // SEND OTP
      // ===========================

      sendOTP: async (payload) => {
        try {
          set({
            loading: true,
            error: null,
          });

          const res = await sendOTP(payload);

          return res.data;
        } finally {
          set({
            loading: false,
          });
        }
      },

      // ===========================
      // VERIFY OTP
      // ===========================

      verifyOTP: async (payload) => {
        try {
          set({
            loading: true,
            error: null,
          });

          const res = await verifyOTP(payload);

          set({
            verificationToken: res.data.verificationToken,
          });

          return res.data;
        } finally {
          set({
            loading: false,
          });
        }
      },

      // ===========================
      // RESEND OTP
      // ===========================

      resendOTP: async (payload) => {
        try {
          set({
            loading: true,
            error: null,
          });

          const res = await resendOTP(payload);

          return res.data;
        } finally {
          set({
            loading: false,
          });
        }
      },

      // ===========================
      // VERIFY ACCESS TOKEN
      // ===========================

      verifyAccessToken: async (payload) => {
        try {
          set({
            loading: true,
            error: null,
          });

          const res = await verifyAccessToken(payload);

          return res.data;
        } finally {
          set({
            loading: false,
          });
        }
      },

      // ===========================
      // FORGOT PIN
      // ===========================

      forgotPin: async (payload) => {
        try {
          set({
            loading: true,
            error: null,
          });

          const res = await forgotPin(payload);

          return res.data;
        } finally {
          set({
            loading: false,
          });
        }
      },

      // ===========================
      // RESET PIN
      // ===========================

      resetPin: async (payload) => {
        try {
          set({
            loading: true,
            error: null,
          });

          const res = await resetPin(payload);

          return res.data;
        } finally {
          set({
            loading: false,
          });
        }
      },

      // ===========================
      // CHANGE PIN
      // ===========================

      changePin: async (payload) => {
        try {
          set({
            loading: true,
            error: null,
          });

          const res = await changePin(payload);

          return res.data;
        } finally {
          set({
            loading: false,
          });
        }
      },

      // ===========================
      // LOGOUT
      // ===========================

      logout: () => {
        set({
          user: null,
          token: null,
          role: null,
          profile: null,
          verificationToken: null,
          isAuthenticated: false,
          error: null,
        });
      },
    }),

    {
      name: "bizbite-auth",
    },
  ),
);

export default useAuthStore;
