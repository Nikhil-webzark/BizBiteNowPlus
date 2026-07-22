import { create } from "zustand";
import API from "../services/api";
import { FESTIVE_VALIDITY_DAYS } from "../data/occasionTemplate";

// 📄 src/store/specialOfferStore.js -> helpers

const toISODate = (date) => new Date(date).toISOString().split("T")[0];

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + Number(days || 0));
  return d;
};

const formatDiscountBadge = (type, value) => {
  if (type === "delivery") return "FREE DELIVERY";
  if (type === "percentage") return `${value}% OFF`;
  return `₹${value} OFF`;
};

// Fallback templates used if the API call fails or returns nothing,
// so the UI is never left with an empty template list.
const FALLBACK_TEMPLATES = [
  {
    id: "diwali",
    label: "Diwali",
    festival: "Diwali",
    isFestive: true,
    discountType: "percentage",
    discountValue: 20,
    minOrder: 199,
    maxDiscount: 150,
    messageTemplate:
      "✨ Happy Diwali from {shopName}! Enjoy {discountBadge} on orders above ₹{minOrder}. Use code {discountCode} — valid till {validityEnd}. Order now! 🪔",
  },
  {
    id: "holi",
    label: "Holi",
    festival: "Holi",
    isFestive: true,
    discountType: "percentage",
    discountValue: 15,
    minOrder: 149,
    maxDiscount: 100,
    messageTemplate:
      "🎨 Happy Holi from {shopName}! Get {discountBadge} on orders above ₹{minOrder}. Use code {discountCode} — valid till {validityEnd}. Colour your day with great food! 🎉",
  },
  {
    id: "weekend",
    label: "Weekend Special",
    festival: "Weekend",
    isFestive: true,
    discountType: "flat",
    discountValue: 50,
    minOrder: 249,
    maxDiscount: 50,
    messageTemplate:
      "🎉 Weekend treat from {shopName}! {discountBadge} on orders above ₹{minOrder}. Use code {discountCode} — valid till {validityEnd}.",
  },
  {
    id: "generic",
    label: "Custom Offer",
    festival: "General",
    isFestive: false,
    discountType: "percentage",
    discountValue: 10,
    minOrder: 99,
    maxDiscount: 100,
    messageTemplate:
      "🎁 Special offer from {shopName}! Enjoy {discountBadge} on orders above ₹{minOrder}. Use code {discountCode} — valid till {validityEnd}.",
  },
];

// 📄 src/store/specialOfferStore.js -> normalizeTemplate

const normalizeTemplate = (raw) => ({
  id: String(raw._id || raw.id || raw.template_id || ""),
  label: raw.title || raw.label || raw.name || "Offer",
  festival: raw.festival_name || raw.festival || raw.label || "General",
  isFestive: raw.is_festive ?? raw.isFestive ?? true,
  discountType: raw.discount_type || raw.discountType || "percentage",
  discountValue: raw.discount_value ?? raw.discountValue ?? 10,
  minOrder: raw.min_order ?? raw.minOrder ?? 0,
  maxDiscount: raw.max_discount ?? raw.maxDiscount ?? 0,
  messageTemplate:
    raw.message_template || raw.messageTemplate || raw.template_text || "",
  _raw: raw,
});

// 📄 src/store/specialOfferStore.js -> buildMessage

const buildMessage = ({
  template,
  shopName,
  discountType,
  discountValue,
  minOrder,
  discountCode,
  validityEnd,
}) => {
  const base =
    template?.messageTemplate ||
    "🎁 Special offer from {shopName}! Enjoy {discountBadge} on orders above ₹{minOrder}. Use code {discountCode} — valid till {validityEnd}.";

  return base
    .replaceAll("{shopName}", shopName || "Your Shop")
    .replaceAll("{discountBadge}", formatDiscountBadge(discountType, discountValue))
    .replaceAll("{minOrder}", String(minOrder ?? 0))
    .replaceAll("{discountCode}", discountCode || "OFFER")
    .replaceAll(
      "{validityEnd}",
      validityEnd ? new Date(validityEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""
    );
};

const today = toISODate(new Date());

const emptyState = {
  templates: [],
  recipientMode: "all", // "all" | "select"
  selectedCustomerIds: [],
  customerSearch: "",

  templateId: FALLBACK_TEMPLATES[0].id,
  discountType: FALLBACK_TEMPLATES[0].discountType,
  discountValue: FALLBACK_TEMPLATES[0].discountValue,
  minOrder: FALLBACK_TEMPLATES[0].minOrder,
  maxDiscount: FALLBACK_TEMPLATES[0].maxDiscount,

  validityMode: "festive", // "festive" | "custom"
  validityStart: today,
  validityEnd: toISODate(addDays(today, FESTIVE_VALIDITY_DAYS[FALLBACK_TEMPLATES[0].id] || 3)),

  message: "",
  discountCode: "",

  loading: false,
  sending: false,
  sentCount: null,
  error: null,
};

const useSpecialOfferStore = create((set, get) => ({
  ...emptyState,

  // ---------------- Templates ----------------

  fetchTemplates: async () => {
    try {
      set({ loading: true, error: null });
      const res = await API.get("/special-offers/templates");
      const raw = res.data.templates || res.data.data || res.data || [];
      const templates = Array.isArray(raw) && raw.length ? raw.map(normalizeTemplate) : FALLBACK_TEMPLATES;
      set({ templates });
      return templates;
    } catch (err) {
      // Fall back to local templates so the UI still works offline
      set({
        templates: FALLBACK_TEMPLATES,
        error: err.response?.data?.message || "Unable to load offer templates",
      });
      return FALLBACK_TEMPLATES;
    } finally {
      set({ loading: false });
    }
  },

  setTemplateId: (id, shopName) => {
    const template = get().templates.find((t) => String(t.id) === String(id));
    if (!template) return;

    const isFestive = !!template.isFestive;
    const start = today;
    const days = FESTIVE_VALIDITY_DAYS[id] ?? 3;
    const end = isFestive ? toISODate(addDays(start, days)) : get().validityEnd || toISODate(addDays(start, 7));

    set({
      templateId: id,
      discountType: template.discountType,
      discountValue: template.discountValue,
      minOrder: template.minOrder,
      maxDiscount: template.maxDiscount,
      validityMode: isFestive ? "festive" : "custom",
      validityStart: start,
      validityEnd: end,
    });

    get().updateMessage(shopName);
  },

  // ---------------- Message ----------------

  updateMessage: (shopName) => {
    const state = get();
    const template = state.templates.find((t) => String(t.id) === String(state.templateId));

    const message = buildMessage({
      template,
      shopName,
      discountType: state.discountType,
      discountValue: state.discountValue,
      minOrder: state.minOrder,
      discountCode: state.discountCode,
      validityEnd: state.validityEnd,
    });

    set({ message });
  },

  setMessage: (message) => set({ message }),
  setDiscountCode: (discountCode) => set({ discountCode }),

  // ---------------- Recipients ----------------

  setRecipientMode: (recipientMode) => set({ recipientMode }),
  setCustomerSearch: (customerSearch) => set({ customerSearch }),

  toggleCustomer: (id) =>
    set((state) => ({
      selectedCustomerIds: state.selectedCustomerIds.includes(id)
        ? state.selectedCustomerIds.filter((cid) => cid !== id)
        : [...state.selectedCustomerIds, id],
    })),

  selectAllFiltered: (customers) =>
    set((state) => {
      const ids = customers.map((c) => c.id);
      const merged = Array.from(new Set([...state.selectedCustomerIds, ...ids]));
      return { selectedCustomerIds: merged };
    }),

  clearSelection: () => set({ selectedCustomerIds: [] }),

  // ---------------- Discount & validity ----------------

  setDiscountType: (discountType) => set({ discountType }),
  setDiscountValue: (discountValue) => set({ discountValue }),
  setMinOrder: (minOrder) => set({ minOrder }),
  setMaxDiscount: (maxDiscount) => set({ maxDiscount }),

  setValidityStart: (validityStart) =>
    set((state) => ({
      validityStart,
      validityMode: "custom",
      validityEnd: state.validityEnd && state.validityEnd > validityStart ? state.validityEnd : toISODate(addDays(validityStart, 1)),
    })),

  setValidityEnd: (validityEnd) => set({ validityEnd, validityMode: "custom" }),

  // ---------------- Send ----------------

  sendOffer: async (customerCount) => {
    const state = get();
    const payload = {
      template_id: state.templateId,
      recipient_mode: state.recipientMode,
      customer_ids: state.recipientMode === "select" ? state.selectedCustomerIds : [],
      discount_type: state.discountType,
      discount_value: state.discountValue,
      min_order: state.minOrder,
      max_discount: state.maxDiscount,
      validity_start: state.validityStart,
      validity_end: state.validityEnd,
      message: state.message,
      discount_code: state.discountCode,
      total_recipients:
        state.recipientMode === "all" ? customerCount : state.selectedCustomerIds.length,
    };

    try {
      set({ sending: true, error: null, sentCount: null });
      const res = await API.post("/special-offers/send", payload);
      const sentCount =
        res.data.sent_count ?? res.data.sentCount ?? payload.total_recipients ?? 0;
      set({ sentCount });
      return sentCount;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Unable to send the offer. Please try again.",
      });
      throw err;
    } finally {
      set({ sending: false });
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ ...emptyState, templates: get().templates }),
}));

export default useSpecialOfferStore;