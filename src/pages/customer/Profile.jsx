import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useCustomerProfileStore from "../../store/customerProfileStore";
import { useTheme } from "../../context/ThemeContext";
import {
  ChevronRight,
  Check,
  Loader2,
  User,
  MapPin,
  CreditCard,
  SlidersHorizontal,
  Settings as SettingsIcon,
  Home,
  Banknote,
  Smartphone,
} from "lucide-react";
import { motion } from "framer-motion";
import Modal from "../../components/customer/common/Modal";
import Avatar from "../../components/customer/common/Avatar";
import PrimaryButton from "../../components/customer/common/PrimaryButton";
import SecondaryButton from "../../components/customer/common/SecondaryButton";
import SettingsCard from "../../components/customer/profile/SettingsCard";
import NotificationSettings from "../../components/customer/profile/NotificationSettings";

const PAYMENT_STORAGE_KEY = "customerPaymentMethod";
const NOTIF_STORAGE_KEY = "customerNotificationSettings";

const defaultNotifSettings = {
  orders: true,
  offers: true,
  rewards: true,
  email: false,
  security: true,
};

const STEP_COUNT = 4;

const Profile = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const authUser = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.logout);
  const setProfile = useAuthStore((state) => state.setProfile);
  const sellerId = profile?.seller_id;
  const customerId = profile?._id || profile?.id || authUser?._id || authUser?.id;

  const mohallas = useCustomerProfileStore((state) => state.mohallas);
  const getMohallas = useCustomerProfileStore((state) => state.getMohallas);
  const saveAddress = useCustomerProfileStore((state) => state.saveAddress);
  const deleteAccount = useCustomerProfileStore((state) => state.deleteAccount);

  const [user, setUser] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState(
    () => localStorage.getItem(PAYMENT_STORAGE_KEY) || "upi",
  );
  const [paymentSet, setPaymentSet] = useState(
    () => !!localStorage.getItem(PAYMENT_STORAGE_KEY),
  );
  const [showPayment, setShowPayment] = useState(false);

  const [showAddresses, setShowAddresses] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ mohalla: "", address: "" });
  const [addressErrors, setAddressErrors] = useState({});
  const [locLoading, setLocLoading] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [notifSettings, setNotifSettings] = useState(() => {
    const stored = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (!stored) return defaultNotifSettings;
    try {
      return JSON.parse(stored);
    } catch {
      return defaultNotifSettings;
    }
  });
  useEffect(() => {
    setUser({
      name: profile?.customer_name || authUser?.name || "",
      phone: profile?.customer_phone || authUser?.phone || "",
      mohalla: profile?.mohalla || "",
      address: profile?.addressLine || profile?.delivery_address || profile?.address || "",
    });
  }, [authUser, profile]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const openPersonalDetails = () => navigate("/customer/profile/personal-details");

  // ---- Address ----
  const openAddresses = () => {
    setAddressForm({
      mohalla: user.mohalla || "",
      address: user.address || "",
    });
    setAddressErrors({});
    setEditingAddress(!user.address);
    setShowAddresses(true);
    if (sellerId) getMohallas(sellerId).catch(() => {});
  };

  const getAddressLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported. Please enter address manually.");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const data = await res.json();
          setAddressForm((prev) => ({
            ...prev,
            address: data.display_name || `${latitude}, ${longitude}`,
          }));
        } catch {
          setAddressForm((prev) => ({
            ...prev,
            address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          }));
        }
        setLocLoading(false);
      },
      () => {
        alert("Could not get location. Please enter your address manually.");
        setLocLoading(false);
      },
    );
  };

  const handleSaveAddress = async () => {
    if (!addressForm.mohalla) {
      setAddressErrors({ mohalla: "Select a delivery area" });
      return;
    }
    if (!addressForm.address.trim()) {
      setAddressErrors({ address: "Address is required" });
      return;
    }
    setSavingAddress(true);
    try {
      const res = await saveAddress({
        addressLine: addressForm.address,
        mohalla: addressForm.mohalla,
      });
      const mohalla = res.customer?.mohalla || addressForm.mohalla;
      const address = res.customer?.addressLine || addressForm.address;
      setUser((prev) => ({ ...prev, mohalla, address }));
      setProfile({ mohalla, addressLine: address });
      setEditingAddress(false);
    } catch (err) {
      setAddressErrors({
        address: err.response?.data?.message || "Could not save address",
      });
    }
    setSavingAddress(false);
  };

  // ---- Payment ----
  const handleSavePayment = () => {
    localStorage.setItem(PAYMENT_STORAGE_KEY, paymentMethod);
    setPaymentSet(true);
    setShowPayment(false);
  };

  // ---- App settings ----
  const handleToggleNotif = (id, value) => {
    setNotifSettings((prev) => {
      const next = { ...prev, [id]: value };
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleSettingsItemClick = (id) => {
    if (id === "support") {
      setShowAccountSettings(false);
      navigate("/customer/profile/help-support");
    } else if (id === "favorites") {
      navigate("/customer/menu");
    } else if (id === "language") {
      setShowAccountSettings(false);
      navigate("/customer/profile/language");
    } else if (id === "appearance") {
      setShowAccountSettings(false);
      navigate("/customer/profile/appearance");
    } else if (id === "terms") {
      setShowAccountSettings(false);
      navigate("/customer/profile/terms-policy");
    } else if (id === "privacy") {
      setShowAccountSettings(false);
      navigate("/customer/profile/privacy-security");
    }
  };

  // Step 1: opens the confirmation modal (called from Settings)
  const handleDeleteAccount = () => {
    setShowAccountSettings(false);
    setShowDeleteConfirm(true);
  };

  // Step 2: user explicitly confirms inside the modal — this is what actually deletes
  const confirmDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await deleteAccount(customerId);
      logout();
      navigate("/", { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete account");
      setDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!user) return null;

  // ---- Profile completion ----
  const steps = [
    { key: "name", done: !!user.name, action: openPersonalDetails },
    { key: "phone", done: !!user.phone, action: openPersonalDetails },
    { key: "address", done: !!user.address, action: openAddresses },
    { key: "payment", done: paymentSet, action: () => setShowPayment(true) },
  ];
  const completedCount = steps.filter((s) => s.done).length;
  const percent = Math.round((completedCount / STEP_COUNT) * 100);
  const nextStep = steps.find((s) => !s.done);
  const stepMarks = [0, 25, 50, 75, 100];

  const menuItems = [
    { icon: User, label: "Personal Details", action: openPersonalDetails },
    { icon: MapPin, label: "Saved Addresses", action: openAddresses },
    {
      icon: CreditCard,
      label: "Payment Methods",
      action: () => setShowPayment(true),
    },
    {
      icon: SettingsIcon,
      label: "Account Settings",
      action: () => setShowAccountSettings(true),
    },
    {
      icon: SlidersHorizontal,
      label: "App Settings",
      action: () => setShowAppSettings(true),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6">
      <div className="px-4 py-5">
        <div className="w-full min-w-0 max-w-[1760px]">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1
                className="font-bold text-slate-900 dark:text-white"
                style={{ fontSize: "26px" }}>
                My Profile
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1" style={{ fontSize: "14px" }}>
                Manage your account, addresses, and preferences.
              </p>
            </div>
            <button
              onClick={openPersonalDetails}
              className="shrink-0 cursor-pointer">
              <Avatar name={user.name} size="md" />
            </button>
          </div>

          {/* Complete your profile */}
          {percent < 100 ? (
            <div className="bg-white dark:bg-[#181A1B] rounded-2xl shadow-sm p-5 mb-5">
              {/* Stepper */}
              <div className="flex items-center mb-4">
                {stepMarks.map((mark, i) => (
                  <div
                    key={mark}
                    className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div
                        className="rounded-full flex items-center justify-center shrink-0"
                        style={{
                          width: "18px",
                          height: "18px",
                          backgroundColor:
                            mark <= percent ? "var(--primary)" : darkMode ? "#374151" : "#E5E7EB",
                        }}>
                        {mark <= percent && mark > 0 && (
                          <Check size={11} color="#fff" strokeWidth={3} />
                        )}
                      </div>
                      <span
                        className="text-gray-400 dark:text-slate-500 mt-1"
                        style={{ fontSize: "10px" }}>
                        {mark}%
                      </span>
                    </div>
                    {i < stepMarks.length - 1 && (
                      <div
                        className="flex-1 h-[2px] mx-1 mb-4"
                        style={{
                          backgroundColor:
                            stepMarks[i + 1] <= percent
                              ? "var(--primary)"
                              : darkMode ? "#374151" : "#E5E7EB",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p
                    className="font-bold text-slate-900 dark:text-white"
                    style={{ fontSize: "15px" }}>
                    Complete your profile
                  </p>
                  <p
                    className="text-gray-500 dark:text-slate-400 mt-0.5"
                    style={{ fontSize: "13px" }}>
                    {STEP_COUNT - completedCount} step
                    {STEP_COUNT - completedCount > 1 ? "s" : ""} left — unlock
                    faster checkout and personalized offers.
                  </p>
                </div>
                <PrimaryButton size="sm" onClick={nextStep?.action}>
                  Continue
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl p-5 mb-5 flex items-center gap-3"
              style={{
                backgroundColor: "var(--primary-light)",
                border: "1px solid var(--primary-border)",
              }}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--primary)" }}>
                <Check size={16} color="#fff" strokeWidth={3} />
              </div>
              <p
                className="font-semibold"
                style={{ color: "var(--primary)", fontSize: "14px" }}>
                Your profile is complete!
              </p>
            </div>
          )}

          {/* Menu list */}
          <div className="bg-white dark:bg-[#181A1B] rounded-2xl shadow-sm overflow-hidden mb-5">
            {menuItems.map(({ icon: Icon, label, action }, i) => (
              <button
                key={label}
                onClick={action}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                  i < menuItems.length - 1 ? "border-b border-gray-100 dark:border-[#A9BDCF]/20" : ""
                }`}>
                <Icon size={19} className="text-gray-500 dark:text-slate-400 shrink-0" />
                <span
                  className="flex-1 font-medium text-slate-900 dark:text-white"
                  style={{ fontSize: "15px" }}>
                  {label}
                </span>
                <ChevronRight size={18} className="text-gray-300 dark:text-slate-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Address modal */}
        <Modal
          open={showAddresses}
          onClose={() => setShowAddresses(false)}
          title="Delivery Address"
          size="sm">
          {!editingAddress ? (
            <>
              {user.address ? (
                <div
                  className="w-full flex items-start gap-3 rounded-2xl p-4 text-left"
                  style={{
                    border: "2px solid var(--primary)",
                    backgroundColor: "var(--primary-light)",
                  }}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "var(--primary)" }}>
                    <Home size={18} style={{ color: "#FFFFFF" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-slate-900 dark:text-white"
                      style={{ fontSize: "15px" }}>
                      {user.name}
                    </p>
                    <p
                      className="text-gray-400 dark:text-slate-500 mt-0.5"
                      style={{ fontSize: "13px" }}>
                      {user.address}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full flex items-center justify-center"
                    style={{
                      width: "22px",
                      height: "22px",
                      backgroundColor: "var(--primary)",
                    }}>
                    <Check size={13} color="#fff" strokeWidth={3} />
                  </span>
                </div>
              ) : (
                <div className="text-center py-6">
                  <MapPin size={28} className="mx-auto text-gray-300 dark:text-slate-600 mb-2" />
                  <p className="text-gray-400 dark:text-slate-500" style={{ fontSize: "14px" }}>
                    No address on file
                  </p>
                </div>
              )}

              <SecondaryButton
                fullWidth
                className="mt-5"
                onClick={() => setEditingAddress(true)}>
                Change Address
              </SecondaryButton>
            </>
          ) : (
            <div>
              <label className="block text-[14px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                Delivery Area (Mohalla) *
              </label>
              <select
                name="mohalla"
                value={addressForm.mohalla}
                onChange={(e) => {
                  setAddressForm((prev) => ({ ...prev, mohalla: e.target.value }));
                  if (addressErrors.mohalla) setAddressErrors((prev) => ({ ...prev, mohalla: "" }));
                }}
                className={`w-full border rounded-xl px-3 text-[15px] outline-none transition-colors bg-transparent text-slate-900 dark:text-white mb-1 ${
                  addressErrors.mohalla ? "border-red-400" : "border-gray-200 dark:border-[#A9BDCF]/40"
                }`}
                style={{ minHeight: "44px" }}>
                <option value="">Select your area</option>
                {mohallas.map((m) => (
                  <option key={m} value={m} className="text-slate-900">
                    {m}
                  </option>
                ))}
              </select>
              {addressErrors.mohalla && (
                <p className="text-red-500 text-[13px] mb-3">
                  {addressErrors.mohalla}
                </p>
              )}

              <label className="block text-[14px] font-semibold text-gray-500 dark:text-slate-400 mb-1 mt-3">
                Delivery Address *
              </label>
              <textarea
                name="address"
                value={addressForm.address}
                onChange={(e) => {
                  setAddressForm((prev) => ({ ...prev, address: e.target.value }));
                  if (addressErrors.address) setAddressErrors((prev) => ({ ...prev, address: "" }));
                }}
                placeholder="Enter your full delivery address"
                rows={3}
                className={`w-full border rounded-xl px-3 py-3 text-[15px] outline-none resize-none transition-colors bg-transparent text-slate-900 dark:text-white ${
                  addressErrors.address ? "border-red-400" : "border-gray-200 dark:border-[#A9BDCF]/40"
                }`}
              />
              {addressErrors.address && (
                <p className="text-red-500 text-[13px] mt-1">
                  {addressErrors.address}
                </p>
              )}
              <button
                onClick={getAddressLocation}
                disabled={locLoading}
                className="mt-1 flex items-center gap-2 font-semibold text-[14px]"
                style={{ minHeight: "40px", color: "var(--primary)" }}>
                {locLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <MapPin size={14} />
                )}
                {locLoading ? "Getting location..." : "Use my current location"}
              </button>

              <div className="flex gap-3 mt-4">
                {user.address && (
                  <SecondaryButton
                    fullWidth
                    onClick={() => {
                      setEditingAddress(false);
                      setAddressErrors({});
                    }}>
                    Cancel
                  </SecondaryButton>
                )}
                <PrimaryButton
                  fullWidth
                  onClick={handleSaveAddress}
                  loading={savingAddress}>
                  Save
                </PrimaryButton>
              </div>
            </div>
          )}
        </Modal>

        {/* Payment method modal */}
        <Modal
          open={showPayment}
          onClose={() => setShowPayment(false)}
          title="Payment Method"
          size="sm">
          <div className="space-y-3">
            {[
              {
                key: "cod",
                label: "Cash on Delivery",
                desc: "Pay when your order arrives",
                Icon: Banknote,
              },
              {
                key: "upi",
                label: "UPI",
                desc: "Pay instantly via UPI apps",
                Icon: Smartphone,
              },
            ].map(({ key, label, desc, Icon }) => {
              const active = paymentMethod === key;
              return (
                <button
                  key={key}
                  onClick={() => setPaymentMethod(key)}
                  className="w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-colors cursor-pointer"
                  style={{
                    border: `2px solid ${active ? "var(--primary)" : darkMode ? "#374151" : "#E5E7EB"}`,
                    backgroundColor: active
                      ? "var(--primary-light)"
                      : darkMode ? "#181A1B" : "#FFFFFF",
                  }}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: active ? "var(--primary)" : darkMode ? "#232627" : "#F3F4F6",
                    }}>
                    <Icon
                      size={18}
                      style={{ color: active ? "#FFFFFF" : darkMode ? "#94A3B8" : "#6B7280" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-slate-900 dark:text-white"
                      style={{ fontSize: "15px" }}>
                      {label}
                    </p>
                    <p className="text-gray-400 dark:text-slate-500" style={{ fontSize: "12px" }}>
                      {desc}
                    </p>
                  </div>
                  {active && (
                    <span
                      className="shrink-0 rounded-full flex items-center justify-center"
                      style={{
                        width: "22px",
                        height: "22px",
                        backgroundColor: "var(--primary)",
                      }}>
                      <Check size={13} color="#fff" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <PrimaryButton fullWidth className="mt-5" onClick={handleSavePayment}>
            Save
          </PrimaryButton>
        </Modal>

        {/* Account Settings modal */}
        <Modal
          open={showAccountSettings}
          onClose={() => setShowAccountSettings(false)}
          title="Settings"
          subtitle="Personalize your account and preferences."
          size="md">
          <SettingsCard
            onItemClick={handleSettingsItemClick}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
            deletingAccount={deletingAccount}
          />
        </Modal>

        {/* Delete Account confirmation modal */}
        <Modal
          open={showDeleteConfirm}
          onClose={() => !deletingAccount && setShowDeleteConfirm(false)}
          title="Delete Account"
          size="sm">
          <p className="text-slate-600 dark:text-slate-300" style={{ fontSize: "14px" }}>
            This will permanently delete your account, saved address, and
            loyalty progress. <strong>This action cannot be undone.</strong>
          </p>
          <p className="mt-3 font-semibold text-slate-900 dark:text-white" style={{ fontSize: "14px" }}>
            Are you sure you want to continue?
          </p>
          <div className="flex gap-3 mt-5">
            <SecondaryButton
              fullWidth
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deletingAccount}>
              Cancel
            </SecondaryButton>
            <button
              onClick={confirmDeleteAccount}
              disabled={deletingAccount}
              className="flex-1 rounded-[24px] border border-red-600 bg-red-600 p-[5px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-60">
              {deletingAccount ? "Deleting..." : "DELETE"}
            </button>
          </div>
        </Modal>

        {/* App Settings modal */}
        <Modal
          open={showAppSettings}
          onClose={() => setShowAppSettings(false)}
          title="Notification Settings"
          subtitle="Choose which notifications you'd like to receive."
          size="md">
          <NotificationSettings
            settings={notifSettings}
            onToggle={handleToggleNotif}
          />
        </Modal>

      </div>
    </motion.div>
  );
};

export default Profile;
