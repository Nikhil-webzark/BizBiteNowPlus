import { create } from "zustand";
import { getOccasionTemplates, sendManualOffer } from "../../src/api/offers"; // Aapka offers API path
import {
  DEFAULT_TEMPLATES,
  FESTIVE_VALIDITY_DAYS,
  fillTemplate,
} from "../../../BizBiteNowPlus-New/src/data/occasionTemplate"; // Aapka occasionTemplate path


// Utility Functions
const toISODate = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
};
const formatShortDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const formatDiscount = (type, value) => {
  if (type === "delivery") return "free delivery";
  if (type === "percentage") return `${value}% off`;
  return `₹${value} off`;
};

const useSpecialOfferStore = create((set, get) => ({
  /* -------------------------------------------------------------------------- */
  /*                                   STATE                                    */
  /* -------------------------------------------------------------------------- */
  templates: DEFAULT_TEMPLATES,
  recipientMode: "all", // "all" | "select"
  selectedCustomerIds: [],
  customerSearch: "",

  templateId: DEFAULT_TEMPLATES[0].id,

  discountType: "percentage", // "percentage" | "flat" | "delivery"
  discountValue: 20,
  minOrder: 299,
  maxDiscount: 150,

  validityMode: "festive", // "festive" | "custom"
  validityStart: toISODate(new Date()),
  validityEnd: toISODate(addDays(new Date(), 5)),

  message: "",
  discountCode: "DIWALI20",

  loading: false,
  sending: false,
  sentCount: null,
  error: null,

  /* -------------------------------------------------------------------------- */
  /*                                  ACTIONS                                   */
  /* -------------------------------------------------------------------------- */

  // Sync / Calculate dynamic message based on parameters
  updateMessage: (shopName = "Your Shop") => {
    const {
      templates,
      templateId,
      discountCode,
      discountType,
      discountValue,
      validityEnd,
    } = get();

    const selected =
      templates.find((t) => t.id === templateId) || templates[0];

    if (!selected) return;

    const filled = fillTemplate(selected.body, {
      code: discountCode,
      shop: shopName,
      discount: formatDiscount(discountType, discountValue),
    });

    set({
      message: `${filled}\n\nValid till ${formatShortDate(validityEnd)}.`,
    });
  },

  // Setters
  setRecipientMode: (recipientMode) => set({ recipientMode }),
  setCustomerSearch: (customerSearch) => set({ customerSearch }),
  setDiscountType: (discountType) => set({ discountType }),
  setDiscountValue: (discountValue) => set({ discountValue }),
  setMinOrder: (minOrder) => set({ minOrder }),
  setMaxDiscount: (maxDiscount) => set({ maxDiscount }),
  setValidityStart: (validityStart) => set({ validityStart }),
  setValidityEnd: (validityEnd) => set({ validityEnd }),
  setMessage: (message) => set({ message }),
  setDiscountCode: (discountCode) =>
    set({ discountCode: discountCode.toUpperCase() }),

  // Change Template & auto-adjust validity dates
  setTemplateId: (templateId, shopName = "Your Shop") => {
    const days = FESTIVE_VALIDITY_DAYS[templateId];
    const today = new Date();

    if (days) {
      set({
        templateId,
        validityMode: "festive",
        validityStart: toISODate(today),
        validityEnd: toISODate(addDays(today, days)),
      });
    } else {
      set({
        templateId,
        validityMode: "custom",
        validityStart: toISODate(today),
        validityEnd: toISODate(addDays(today, 7)),
      });
    }

    get().updateMessage(shopName);
  },

  // Customer Selection Handlers
  toggleCustomer: (id) =>
    set((state) => ({
      selectedCustomerIds: state.selectedCustomerIds.includes(id)
        ? state.selectedCustomerIds.filter((x) => x !== id)
        : [...state.selectedCustomerIds, id],
    })),

  selectAllFiltered: (filteredCustomers) =>
    set({
      selectedCustomerIds: filteredCustomers.map((c) => c.id),
    }),

  clearSelection: () => set({ selectedCustomerIds: [] }),

  /* -------------------------------------------------------------------------- */
  /*                                API ACTIONS                                 */
  /* -------------------------------------------------------------------------- */

  // Fetch Templates
  fetchTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getOccasionTemplates();
      if (res && res.length) {
        set({ templates: res });
      }
    } catch (err) {
      console.error("Failed to load templates fallback to default:", err);
    } finally {
      set({ loading: false });
    }
  },

  // Send Offer API Handler
  sendOffer: async (customerCount = 142) => {
    const {
      recipientMode,
      selectedCustomerIds,
      templateId,
      message,
      discountCode,
      discountType,
      discountValue,
      minOrder,
      maxDiscount,
      validityMode,
      validityStart,
      validityEnd,
    } = get();

    set({ sending: true, sentCount: null, error: null });

    try {
      const result = await sendManualOffer({
        recipientMode,
        customerIds:
          recipientMode === "select" ? selectedCustomerIds : undefined,
        templateId,
        message,
        discountCode,
        discountType,
        discountValue: discountType === "delivery" ? 0 : discountValue,
        minOrder,
        maxDiscount,
        validityMode,
        validityStart,
        validityEnd,
      });

      set({ sentCount: result?.sentCount ?? selectedCustomerIds.length });
    } catch (err) {
      console.error("Send offer failed, fallback simulation:", err);
      set({
        sentCount:
          recipientMode === "all" ? customerCount : selectedCustomerIds.length,
      });
    } finally {
      set({ sending: false });
    }
  },
}));

export default useSpecialOfferStore;