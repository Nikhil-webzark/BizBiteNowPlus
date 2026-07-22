import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PartyPopper,
  Users,
  UserRound,
  MessageSquare,
  Gift,
  Percent,
  IndianRupee,
  Bike,
  CalendarClock,
  CalendarDays,
  Search,
  Check,
  X,
} from "lucide-react";

import useSpecialOfferStore from "../../store/specialOfferStore";
import { FESTIVE_VALIDITY_DAYS } from "../../data/occasionTemplate";
import { DEMO_CUSTOMERS } from "../../data/demoCustomers";

const formatShortDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const formatDiscountBadge = (type, value) => {
  if (type === "delivery") return "FREE DELIVERY";
  if (type === "percentage") return `${value}% OFF`;
  return `₹${value} OFF`;
};

const SpecialOffers = ({ shopName = "Your Shop", customerCount = 142 }) => {
  const {
    templates,
    recipientMode,
    selectedCustomerIds,
    customerSearch,
    templateId,
    discountType,
    discountValue,
    minOrder,
    maxDiscount,
    validityMode,
    validityStart,
    validityEnd,
    message,
    discountCode,
    sending,
    sentCount,

    // Store Actions
    fetchTemplates,
    updateMessage,
    setRecipientMode,
    setCustomerSearch,
    setDiscountType,
    setDiscountValue,
    setMinOrder,
    setMaxDiscount,
    setValidityStart,
    setValidityEnd,
    setMessage,
    setDiscountCode,
    setTemplateId,
    toggleCustomer,
    selectAllFiltered,
    clearSelection,
    sendOffer,
  } = useSpecialOfferStore();

  // Load Templates on Mount
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Sync / Auto-fill message template on inputs change
  useEffect(() => {
    updateMessage(shopName);
  }, [
    templateId,
    templates,
    discountCode,
    discountType,
    discountValue,
    validityEnd,
    shopName,
    updateMessage,
  ]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return DEMO_CUSTOMERS;
    return DEMO_CUSTOMERS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [customerSearch]);

  const validityInvalid = validityMode === "custom" && validityEnd <= validityStart;
  const noCustomersPicked = recipientMode === "select" && selectedCustomerIds.length === 0;
  const sendDisabled = sending || noCustomersPicked || validityInvalid;

  const handleSend = () => {
    if (sendDisabled) return;
    sendOffer(customerCount);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-slate-200 bg-white shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
        <div className="rounded-xl bg-[#1A4D2E]/10 p-3">
          <PartyPopper size={22} className="text-[#1A4D2E]" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#1A4D2E]">
            Special Occasion Offers
          </h2>
          <p className="text-sm text-slate-500">
            Send festive and promotional offers to your customers.
          </p>
        </div>
      </div>

      <div className="space-y-8 p-6">
        {/* Recipient Mode Selection */}
        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1A4D2E]">
            <Users size={18} />
            Send To
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setRecipientMode("all")}
              className={`flex items-center justify-between rounded-xl border p-5 transition ${
                recipientMode === "all"
                  ? "border-[#1A4D2E] bg-[#1A4D2E]/5"
                  : "border-slate-200 hover:border-[#1A4D2E]/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="text-[#1A4D2E]" size={22} />
                <div className="text-left">
                  <h4 className="font-semibold text-[#1A4D2E]">All Customers</h4>
                  <p className="text-sm text-slate-500">{customerCount} customers</p>
                </div>
              </div>

              <div
                className={`h-4 w-4 rounded-full border-2 ${
                  recipientMode === "all"
                    ? "border-[#1A4D2E] bg-[#1A4D2E]"
                    : "border-slate-300"
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => setRecipientMode("select")}
              className={`flex items-center justify-between rounded-xl border p-5 transition ${
                recipientMode === "select"
                  ? "border-[#1A4D2E] bg-[#1A4D2E]/5"
                  : "border-slate-200 hover:border-[#1A4D2E]/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <UserRound className="text-[#1A4D2E]" size={22} />
                <div className="text-left">
                  <h4 className="font-semibold text-[#1A4D2E]">Selected Customers</h4>
                  <p className="text-sm text-slate-500">
                    {selectedCustomerIds.length > 0
                      ? `${selectedCustomerIds.length} chosen`
                      : "Choose manually"}
                  </p>
                </div>
              </div>

              <div
                className={`h-4 w-4 rounded-full border-2 ${
                  recipientMode === "select"
                    ? "border-[#1A4D2E] bg-[#1A4D2E]"
                    : "border-slate-300"
                }`}
              />
            </button>
          </div>

          {/* Customer Selection Drawer */}
          <AnimatePresence>
            {recipientMode === "select" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-4 overflow-hidden rounded-xl border border-slate-200"
              >
                <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <Search size={16} className="text-slate-400" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search by name or phone"
                    className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => selectAllFiltered(filteredCustomers)}
                    className="whitespace-nowrap text-xs font-semibold text-[#1A4D2E] hover:underline"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="whitespace-nowrap text-xs font-semibold text-slate-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {filteredCustomers.length === 0 && (
                    <p className="px-4 py-6 text-center text-sm text-slate-400">
                      No customers match "{customerSearch}"
                    </p>
                  )}
                  {filteredCustomers.map((c) => {
                    const checked = selectedCustomerIds.includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => toggleCustomer(c.id)}
                        className={`flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 ${
                          checked ? "bg-[#1A4D2E]/5" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A4D2E]/10 text-sm font-semibold text-[#1A4D2E]">
                            {c.name
                              .split(" ")
                              .map((p) => p[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{c.name}</p>
                            <p className="text-xs text-slate-400">
                              {c.phone} · {c.orders} orders
                            </p>
                          </div>
                        </div>
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-md border-2 ${
                            checked
                              ? "border-[#1A4D2E] bg-[#1A4D2E] text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {checked && <Check size={13} />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between bg-slate-50 px-4 py-2 text-xs text-slate-500">
                  <span>{DEMO_CUSTOMERS.length} demo customers · sample data</span>
                  <span className="font-semibold text-[#1A4D2E]">
                    {selectedCustomerIds.length} selected
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Occasion Templates */}
        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1A4D2E]">
            <Gift size={18} />
            Occasion Templates
          </label>

          <div className="flex flex-wrap gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setTemplateId(template.id, shopName)}
                className={`rounded-xl border px-5 py-3 font-medium transition ${
                  templateId === template.id
                    ? "border-[#1A4D2E] bg-[#1A4D2E] text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-[#1A4D2E]"
                }`}
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>

        {/* Discount Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1A4D2E]">
              <Percent size={18} />
              Discount
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDiscountType("percentage")}
                className={`flex flex-1 items-center justify-center gap-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  discountType === "percentage"
                    ? "border-[#1A4D2E] bg-[#1A4D2E] text-white"
                    : "border-slate-300 text-slate-600 hover:border-[#1A4D2E]"
                }`}
              >
                <Percent size={14} /> Percent
              </button>

              <button
                type="button"
                onClick={() => setDiscountType("flat")}
                className={`flex flex-1 items-center justify-center gap-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  discountType === "flat"
                    ? "border-[#1A4D2E] bg-[#1A4D2E] text-white"
                    : "border-slate-300 text-slate-600 hover:border-[#1A4D2E]"
                }`}
              >
                <IndianRupee size={14} /> Flat amount
              </button>

              <button
                type="button"
                onClick={() => setDiscountType("delivery")}
                className={`flex flex-1 items-center justify-center gap-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  discountType === "delivery"
                    ? "border-[#1A4D2E] bg-[#1A4D2E] text-white"
                    : "border-slate-300 text-slate-600 hover:border-[#1A4D2E]"
                }`}
              >
                <Bike size={14} /> Free delivery
              </button>
            </div>

            {discountType !== "delivery" && (
              <div className="relative mt-3">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {discountType === "percentage" ? "%" : "₹"}
                </span>
                <input
                  type="number"
                  min={0}
                  max={discountType === "percentage" ? 100 : undefined}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-9 pr-4 text-slate-700 outline-none transition focus:border-[#1A4D2E] focus:ring-2 focus:ring-[#1A4D2E]/20"
                />
              </div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Min. order value
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-7 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#1A4D2E] focus:ring-2 focus:ring-[#1A4D2E]/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Max. discount cap
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-7 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#1A4D2E] focus:ring-2 focus:ring-[#1A4D2E]/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Validity Setup */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1A4D2E]">
              <CalendarClock size={18} />
              Offer Validity
            </label>

            {validityMode === "festive" ? (
              <div className="flex items-start gap-3 rounded-xl border border-dashed border-[#1A4D2E]/30 bg-[#1A4D2E]/5 p-4">
                <CalendarDays size={18} className="mt-0.5 text-[#1A4D2E]" />
                <div>
                  <p className="text-sm font-medium text-[#1A4D2E]">
                    Auto — {FESTIVE_VALIDITY_DAYS[templateId]} day festival window
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatShortDate(validityStart)} – {formatShortDate(validityEnd)}. Festive
                    offers run for a fixed window; switch to Generic for custom dates.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={validityStart}
                    onChange={(e) => setValidityStart(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#1A4D2E] focus:ring-2 focus:ring-[#1A4D2E]/20"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="date"
                    value={validityEnd}
                    min={validityStart}
                    onChange={(e) => setValidityEnd(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#1A4D2E] focus:ring-2 focus:ring-[#1A4D2E]/20"
                  />
                </div>
                {validityInvalid && (
                  <p className="text-xs font-medium text-red-500">
                    End date must be after the start date.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Offer Message Textarea */}
        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1A4D2E]">
            <MessageSquare size={18} />
            Offer Message
          </label>

          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-[#1A4D2E] focus:ring-2 focus:ring-[#1A4D2E]/20"
          />
        </div>

        {/* Discount Code */}
        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1A4D2E]">
            <Gift size={18} />
            Discount Code
          </label>

          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="DIWALI20"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-[#1A4D2E] focus:ring-2 focus:ring-[#1A4D2E]/20"
          />
        </div>

        {/* Live Preview */}
        <div>
          <label className="mb-3 text-sm font-semibold text-[#1A4D2E]">
            Live Preview
          </label>

          <div className="rounded-2xl border border-slate-200 bg-[#f8faf8] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-[#1A4D2E]/10 p-3">
                <PartyPopper size={22} className="text-[#1A4D2E]" />
              </div>

              <div>
                <h3 className="font-semibold text-[#1A4D2E]">
                  Customer Message
                </h3>
                <p className="text-sm text-slate-500">
                  This is exactly what customers will receive.
                </p>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#1A4D2E] px-3 py-1 text-xs font-semibold text-white">
                {formatDiscountBadge(discountType, discountValue)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Min order ₹{minOrder}
              </span>
              {discountType !== "delivery" && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Max saving ₹{maxDiscount}
                </span>
              )}
              <span className="rounded-full bg-[#F4A300]/15 px-3 py-1 text-xs font-semibold text-[#8a5d00]">
                Valid {formatShortDate(validityStart)} – {formatShortDate(validityEnd)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {recipientMode === "all"
                  ? `${customerCount} recipients`
                  : `${selectedCustomerIds.length} recipients`}
              </span>
            </div>

            <div className="rounded-xl border border-dashed border-[#1A4D2E]/20 bg-white p-5">
              <p className="whitespace-pre-line leading-7 text-slate-700">
                {message}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Send Action */}
      <div className="flex items-center justify-between border-t border-slate-200 px-6 py-5">
        <div>
          {sentCount !== null && (
            <p className="text-sm font-medium text-green-600">
              ✅ Offer sent successfully to{" "}
              <span className="font-semibold">{sentCount}</span> customer
              {sentCount !== 1 ? "s" : ""}.
            </p>
          )}
          {noCustomersPicked && (
            <p className="flex items-center gap-1 text-sm font-medium text-red-500">
              <X size={14} /> Pick at least one customer to send.
            </p>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSend}
          disabled={sendDisabled}
          className="flex items-center gap-2 rounded-xl bg-[#F4A300] px-6 py-3 font-semibold text-[#1A4D2E] transition hover:bg-[#dc9200] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PartyPopper size={18} />
          {sending ? "Sending..." : "Send Offer"}
        </motion.button>
      </div>
    </motion.section>
  );
};

export default SpecialOffers;