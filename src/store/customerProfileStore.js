import { create } from "zustand";
import { devtools } from "zustand/middleware";
import API from "../services/api";

const BASE = "/customer";

const useCustomerProfileStore = create(
  devtools(
    (set) => ({
      // STATES

      mohallas: [],

      loading: false,
      savingAddress: false,
      error: null,

      // GET MOHALLAS (public)

      getMohallas: async (sellerId) => {
        try {
          set({ loading: true, error: null }, false, "getMohallas/pending");
          const res = await API.get(`${BASE}/mohallas/${sellerId}`);
          const mohallas =
            res.data?.mohendra_locations ?? res.data?.mohalla_locations ?? [];
          set({ mohallas }, false, "getMohallas/success");
          return mohallas;
        } catch (err) {
          set(
            {
              error:
                err.response?.data?.message || "Could not load delivery areas",
            },
            false,
            "getMohallas/error",
          );
          throw err;
        } finally {
          set({ loading: false }, false, "getMohallas/settled");
        }
      },

      // UPDATE PROFILE

      updateProfile: async (id, payload) => {
        try {
          set({ loading: true, error: null }, false, "updateProfile/pending");
          const res = await API.put(`${BASE}/update/${id}`, payload);
          return res.data;
        } catch (err) {
          set(
            {
              error: err.response?.data?.message || "Could not update profile",
            },
            false,
            "updateProfile/error",
          );
          throw err;
        } finally {
          set({ loading: false }, false, "updateProfile/settled");
        }
      },

      // DELETE ACCOUNT

      deleteAccount: async (id) => {
        try {
          set({ loading: true, error: null }, false, "deleteAccount/pending");
          const res = await API.delete(`${BASE}/delete/${id}`);
          return res.data;
        } catch (err) {
          set(
            {
              error: err.response?.data?.message || "Could not delete account",
            },
            false,
            "deleteAccount/error",
          );
          throw err;
        } finally {
          set({ loading: false }, false, "deleteAccount/settled");
        }
      },

      // SAVE ADDRESS (profile + delivery address)

      saveAddress: async ({ addressLine, mohalla }) => {
        try {
          set({ savingAddress: true, error: null }, false, "saveAddress/pending");
          const res = await API.post(`${BASE}/address/save`, {
            addressLine,
            mohalla,
          });
          return res.data;
        } catch (err) {
          set(
            {
              error: err.response?.data?.message || "Could not save address",
            },
            false,
            "saveAddress/error",
          );
          throw err;
        } finally {
          set({ savingAddress: false }, false, "saveAddress/settled");
        }
      },

      clearError: () => set({ error: null }, false, "clearError"),
    }),
    { name: "CustomerProfileStore" },
  ),
);

export default useCustomerProfileStore;
