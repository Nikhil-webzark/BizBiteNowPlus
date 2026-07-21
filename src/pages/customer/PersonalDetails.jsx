import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  User,
  Mail,
  Phone,
  UserRound,
  Calendar,
  MapPin,
  ShieldCheck,
  ChevronRight,
  KeyRound,
} from "lucide-react";
import { motion } from "framer-motion";
import useAuthStore from "../../store/authStore";
import useCustomerProfileStore from "../../store/customerProfileStore";
import Avatar from "../../components/customer/common/Avatar";
import SecondaryButton from "../../components/customer/common/SecondaryButton";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  gender: "",
  dob: "",
  city: "",
};

const fields = [
  {
    key: "name",
    label: "Full Name",
    icon: User,
    type: "text",
    placeholder: "Enter your full name",
  },
  {
    key: "email",
    label: "Email Address",
    icon: Mail,
    type: "email",
    placeholder: "you@example.com",
  },
  {
    key: "phone",
    label: "Phone Number",
    icon: Phone,
    type: "tel",
    placeholder: "10-digit mobile number",
  },
  { key: "gender", label: "Gender", icon: UserRound, type: "select" },
  { key: "dob", label: "Date of Birth", icon: Calendar, type: "date" },
  {
    key: "city",
    label: "Default City",
    icon: MapPin,
    type: "text",
    placeholder: "Enter your city",
  },
];

const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];

const PersonalDetails = () => {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const setProfile = useAuthStore((state) => state.setProfile);
  const updateProfile = useCustomerProfileStore((state) => state.updateProfile);

  const customerId = profile?._id || profile?.id || authUser?._id || authUser?.id;

  const [user, setUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const u = {
      name: profile?.customer_name || authUser?.name || "",
      email: profile?.email || authUser?.email || "",
      phone: profile?.customer_phone || authUser?.phone || "",
      gender: profile?.gender || authUser?.gender || "",
      dob: profile?.birthday || profile?.dob || authUser?.dob || "",
      city: profile?.city || authUser?.city || "",
    };
    setUser(u);
    setForm(u);
    setEditing(!u.name);
  }, [authUser, profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setSaved(false);
  };

  const handleEdit = () => {
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      gender: user.gender || "",
      dob: user.dob || "",
      city: user.city || "",
    });
    setErrors({});
    setSaved(false);
    setEditing(true);
  };

  const handleCancel = () => {
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      gender: user.gender || "",
      dob: user.dob || "",
      city: user.city || "",
    });
    setErrors({});
    setEditing(false);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (form.phone.trim() && !/^[6-9]\d{9}$/.test(form.phone.trim()))
      errs.phone = "Enter a valid 10-digit mobile number";
    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    )
      errs.email = "Enter a valid email address";
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        gender: form.gender,
        dob: form.dob,
        city: form.city.trim(),
      };
      await updateProfile(customerId, payload);
      setProfile({ customer_name: payload.name, ...payload });
      setUser(form);
      setSaved(true);
      setEditing(false);
    } catch (err) {
      setErrors({
        name: err.response?.data?.message || "Could not save details",
      });
    }
    setSaving(false);
  };

  const handleChangePassword = () => {
    alert("Password change is coming soon.");
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="px-4 py-5 pb-28">
      <div className="w-full min-w-0 max-w-[1760px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/customer/profile")}
              className="flex items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
              style={{ width: "40px", height: "40px" }}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Personal Details
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage your personal information.
              </p>
            </div>
          </div>
          <Avatar name={user.name} size="md" />
        </div>

        {/* Profile Information */}
        <div className="bg-white dark:bg-[#181A1B] rounded-2xl shadow-sm p-5 mb-5">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-[#A9BDCF]/20 mb-5">
            <User size={18} style={{ color: "#238B45" }} />
            <h2
              className="font-bold"
              style={{ fontSize: "16px", color: "#238B45" }}>
              Profile Information
            </h2>
          </div>

          {!editing ? (
            <>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                {fields.map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center gap-3">
                    <Icon
                      size={20}
                      className="shrink-0"
                      style={{ color: "#238B45" }}
                    />
                    <div className="flex-1 min-w-0">
                      <label className="block text-[13px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                        {label}
                      </label>
                      <div
                        className="w-full border rounded-xl px-3 flex items-center border-gray-200 dark:border-[#A9BDCF]/40 text-slate-900 dark:text-white"
                        style={{ minHeight: "44px" }}>
                        <span className="text-[14px] font-medium truncate">
                          {form[key] || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {saved && (
                <p
                  className="mt-4"
                  style={{ color: "var(--primary)", fontSize: "13px" }}>
                  Saved successfully.
                </p>
              )}

              <div className="flex justify-start mt-5">
                <SecondaryButton icon={Pencil} onClick={handleEdit}>
                  Edit
                </SecondaryButton>
              </div>
            </>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                {fields.map(({ key, label, icon: Icon, type, placeholder }) => (
                  <div key={key} className="flex items-center gap-3">
                    <Icon
                      size={20}
                      className="shrink-0"
                      style={{ color: "#238B45" }}
                    />
                    <div className="flex-1 min-w-0">
                      <label className="block text-[13px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                        {label}
                        {key === "name" && " *"}
                      </label>
                      {type === "select" ? (
                        <select
                          name={key}
                          value={form[key]}
                          onChange={handleChange}
                          className="w-full border rounded-xl px-3 text-[14px] outline-none transition-colors border-gray-200 dark:border-[#A9BDCF]/40 bg-transparent text-slate-900 dark:text-white"
                          style={{ minHeight: "44px" }}>
                          <option value="">Select gender</option>
                          {genderOptions.map((g) => (
                            <option
                              key={g}
                              value={g}
                              className="text-slate-900">
                              {g}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={type}
                          name={key}
                          value={form[key]}
                          onChange={handleChange}
                          placeholder={placeholder}
                          maxLength={key === "phone" ? 10 : undefined}
                          className={`w-full border rounded-xl px-3 text-[14px] outline-none transition-colors bg-transparent text-slate-900 dark:text-white ${
                            errors[key]
                              ? "border-red-400"
                              : "border-gray-200 dark:border-[#A9BDCF]/40"
                          }`}
                          style={{ minHeight: "44px" }}
                        />
                      )}
                      {errors[key] && (
                        <p className="text-red-500 text-[12px] mt-1">
                          {errors[key]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-start gap-3 mt-5">
                {user.name && (
                  <SecondaryButton onClick={handleCancel}>
                    Cancel
                  </SecondaryButton>
                )}
                <SecondaryButton onClick={handleSave} loading={saving}>
                  Save Changes
                </SecondaryButton>
              </div>
            </>
          )}
        </div>

        {/* Account Security */}
        <div className="bg-white dark:bg-[#181A1B] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-[#A9BDCF]/20">
            <ShieldCheck size={18} style={{ color: "#238B45" }} />
            <h2
              className="font-bold"
              style={{ fontSize: "16px", color: "#238B45" }}>
              Account Security
            </h2>
          </div>
          <button
            onClick={handleChangePassword}
            className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <KeyRound
              size={19}
              className="text-gray-500 dark:text-slate-400 shrink-0"
            />
            <div className="flex-1">
              <p
                className="font-medium text-slate-900 dark:text-white"
                style={{ fontSize: "15px" }}>
                Change Password
              </p>
              <p
                className="text-gray-400 dark:text-slate-500 mt-0.5"
                style={{ fontSize: "12px" }}>
                Update your password to keep your account secure.
              </p>
            </div>
            <ChevronRight
              size={18}
              className="text-gray-300 dark:text-slate-600 shrink-0"
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PersonalDetails;
