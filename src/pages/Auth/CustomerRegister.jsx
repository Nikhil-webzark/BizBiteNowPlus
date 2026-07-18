import { useState } from "react";
import {
  User,
  Phone,
  Lock,
  MapPin,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import logoHorizontal from "../../assets/bizbite_logo_horizontal.png";

export default function RegisterCustomer() {
  const navigate = useNavigate();

  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    birthday: "",
    pin: "",
    mohalla: "",
    delivery_address: "",
    verificationToken: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleVerifyOTP = () => {
    setFormData((prev) => ({
      ...prev,
      verificationToken: "verified-token",
    }));

    setShowOTPModal(false);
    setOtp("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !formData.customer_name.trim() ||
      !formData.customer_phone.trim() ||
      !formData.pin.trim() ||
      !formData.birthday ||
      !formData.mohalla.trim() ||
      !formData.delivery_address.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      localStorage.setItem(
        "pendingCustomer",
        JSON.stringify(formData)
      );

      navigate("/customer");
    } catch {
      setError("Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-full items-center justify-center px-4 py-0 bg-gradient-to-br from-[#0b2b18] via-[#16522d] to-[#07140d]">
      {/* Background */}
      <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-[#ffc700]/10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-white/5 blur-3xl"></div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-2 sm:px-6 sm:py-4 lg:px-8 lg:py-4">

        {/* OTP Modal */}

        {showOTPModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">

              <h2 className="text-center text-2xl font-bold sm:text-3xl">
                Verify OTP
              </h2>

              <p className="mt-3 text-center text-sm text-gray-500">
                We've sent a verification code to your mobile number.
              </p>

              <p className="mt-2 break-all text-center font-semibold text-[#16522d]">
                {formData.customer_phone}
              </p>

              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="mt-8 w-full rounded-xl border border-gray-300 py-4 text-center text-xl tracking-[10px] outline-none transition focus:border-[#16522d] focus:ring-4 focus:ring-green-100"
              />

              <button
                onClick={handleVerifyOTP}
                className="mt-8 w-full rounded-xl bg-gradient-to-r from-[#16522d] to-[#2d6a4f] py-4 font-semibold text-white transition hover:opacity-95"
              >
                Verify OTP
              </button>

              <button
                onClick={() => {
                  setShowOTPModal(false);
                  setOtp("");
                }}
                className="mt-3 w-full rounded-xl border border-gray-300 py-3 font-medium transition hover:bg-gray-50"
              >
                Cancel
              </button>

            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -80 }}
          transition={{
            duration: 0.45,
            ease: "easeInOut",
          }}
          className="w-full h-4xl max-w-6xl"
        ><div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 rounded-[32px] overflow-hidden shadow-[0_40px_80px_rgba(22,82,45,0.15)]">

  {/* LEFT PANEL */}

  <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#16522d] via-[#124325] to-[#08160e] p-8 text-white">

    <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[#ffc700]/10 blur-3xl"></div>

    <div className="relative z-10">

      <img
        src={logoHorizontal}
        alt="BizBiteNow"
        className="h-10 object-contain"
      />

      <span className="mt-5 inline-flex rounded-full bg-[#ffc700] px-3 py-1 text-xs font-bold text-[#16522d]">
        Plus Customer
      </span>

      <h1 className="mt-5 text-4xl font-black leading-tight">
        Enjoy Great
        <br />
        Food & Rewards
      </h1>

      <p className="mt-4 max-w-xs text-sm leading-6 text-green-100">
        Join thousands of food lovers using BizBiteNow to discover
        restaurants, collect loyalty stamps and unlock exciting rewards
        with every order.
      </p>

    </div>

    <div className="space-y-3">

      {[
        {
          title: "Discover Restaurants",
          desc: "Find your favourite restaurants nearby.",
        },
        {
          title: "Earn Loyalty Rewards",
          desc: "Collect stamps with every eligible order.",
        },
        {
          title: "Exclusive Coupons",
          desc: "Unlock discounts and birthday rewards.",
        },
        {
          title: "Secure Customer Account",
          desc: "Verified mobile login with a secure PIN.",
        },
      ].map((item) => (
        <div
          key={item.title}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2.5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffc700] font-black text-[#16522d]">
            ✓
          </div>

          <div>
            <h3 className="text-sm font-semibold">
              {item.title}
            </h3>

            <p className="text-xs text-green-100">
              {item.desc}
            </p>
          </div>

        </div>
      ))}

    </div>

  </div>

  {/* RIGHT PANEL */}

  <div className="flex items-center justify-center bg-white px-10 py-6">

    <div className="w-full max-w-lg">

      {/* Mobile Logo */}

      <div className="mb-5 flex justify-center lg:hidden">
        <img
          src={logoHorizontal}
          alt="BizBiteNow"
          className="h-8 object-contain sm:h-10"
        />
      </div>

      {/* Brand */}

      <h1 className="text-center text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-center">
        BizBiteNow
        <span className="text-emerald-500">PLUS</span>
      </h1>

      {/* Title */}

      <h2 className="mt-3 text-center text-2xl font-black text-[#16522d] sm:text-m lg:text-center">
        Create Customer Account
      </h2>

      <p className="mt-2 text-center text-sm text-gray-500">
        Register once and enjoy rewards, coupons and personalized offers.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {/* Full Name */}

  <div>
    <label className="mb-2 block text-sm font-semibold text-[#16522d]">
      Full Name
    </label>

    <div className="group flex h-12 items-center rounded-xl border border-gray-200 bg-white px-4 transition-all duration-300 focus-within:border-[#16522d] focus-within:ring-2 focus-within:ring-[#16522d]/10">
      <User size={18} className="text-gray-400" />

      <input
        type="text"
        name="customer_name"
        required
        value={formData.customer_name}
        onChange={handleChange}
        placeholder="John Doe"
        className="w-full bg-transparent px-3 text-sm outline-none"
      />
    </div>
  </div>

  {/* Mobile Number */}

  <div>
    <label className="mb-2 block text-sm font-semibold text-[#16522d]">
      Mobile Number
    </label>

    <div className="flex gap-2">

      <div className="group flex h-12 flex-1 items-center rounded-xl border border-gray-200 bg-white px-4 transition-all duration-300 focus-within:border-[#16522d] focus-within:ring-2 focus-within:ring-[#16522d]/10">
        <Phone size={18} className="text-gray-400" />

        <input
          type="tel"
          name="customer_phone"
          required
          value={formData.customer_phone}
          onChange={handleChange}
          placeholder="9876543210"
          className="w-full bg-transparent px-3 text-sm outline-none"
        />
      </div>

      <button
        type="button"
        onClick={() => setShowOTPModal(true)}
        className="rounded-xl bg-[#16522d] px-4 text-sm font-semibold text-white transition hover:bg-[#1d6438]"
      >
        Verify
      </button>

    </div>
  </div>

  {/* Birthday */}

  <div>
    <label className="mb-2 block text-sm font-semibold text-[#16522d]">
      Birthday
    </label>

    <div className="group flex h-12 items-center rounded-xl border border-gray-200 bg-white px-4 transition-all duration-300 focus-within:border-[#16522d] focus-within:ring-2 focus-within:ring-[#16522d]/10">

      <CalendarDays size={18} className="text-gray-400" />

      <input
        type="date"
        name="birthday"
        required
        value={formData.birthday}
        onChange={handleChange}
        className="w-full bg-transparent px-3 text-sm outline-none"
      />

    </div>
  </div>

  {/* Security PIN */}

  <div>
    <label className="mb-2 block text-sm font-semibold text-[#16522d]">
      Security PIN
    </label>

    <div className="group flex h-12 items-center rounded-xl border border-gray-200 bg-white px-4 transition-all duration-300 focus-within:border-[#16522d] focus-within:ring-2 focus-within:ring-[#16522d]/10">

      <Lock size={18} className="text-gray-400" />

      <input
        type="password"
        name="pin"
        required
        maxLength={4}
        value={formData.pin}
        onChange={handleChange}
        placeholder="••••"
        className="w-full bg-transparent px-3 text-sm tracking-[0.3em] outline-none"
      />

    </div>
  </div>
            {/* Mohalla */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#16522d]">
              Mohalla / Area
            </label>

            <div className="group flex h-12 items-center rounded-xl border border-gray-200 bg-white px-4 transition-all duration-300 focus-within:border-[#16522d] focus-within:ring-2 focus-within:ring-[#16522d]/10">

              <MapPin size={18} className="text-gray-400" />

              <input
                type="text"
                name="mohalla"
                required
                value={formData.mohalla}
                onChange={handleChange}
                placeholder="Indiranagar"
                className="w-full bg-transparent px-3 text-sm outline-none"
              />

            </div>
          </div>

          {/* Delivery Address */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#16522d]">
              Delivery Address
            </label>

            <div className="group rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all duration-300 focus-within:border-[#16522d] focus-within:ring-2 focus-within:ring-[#16522d]/10">

              <textarea
                rows={3}
                name="delivery_address"
                required
                value={formData.delivery_address}
                onChange={handleChange}
                placeholder="Flat No. 24, MG Road, Near Metro Station"
                className="w-full resize-none bg-transparent text-sm outline-none"
              />

            </div>
          </div>

        </div>

        {/* Register Button */}

        <button
          type="submit"
          disabled={loading}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#16522d] text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#1d6438] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-30"
                />

                <path
                  d="M22 12A10 10 0 0 0 12 2"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>

              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Customer Account</span>

              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </>
          )}
        </button>
        </form>
                {/* Divider */}

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200"></div>

          <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Already have an account?
          </span>

          <div className="h-px flex-1 bg-gray-200"></div>
        </div>

        {/* Login */}

        <Link
          to="/customer/login"
          className="group flex h-12 w-full items-center justify-center rounded-xl border-2 border-[#16522d] text-sm font-semibold text-[#16522d] transition-all duration-300 hover:bg-[#16522d] hover:text-white"
        >
          Login Instead

          <ArrowRight
            size={18}
            className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>

        {/* Footer */}

        <div className="mt-6 border-t border-gray-200 pt-4 text-center">
          <p className="text-xs text-gray-500">
            Trusted by thousands of food lovers across India.
          </p>

          <p className="mt-2 text-[11px] text-gray-400">
            © 2026 BizBiteNow. All rights reserved.
          </p>
        </div>

      </div>
    </div>

  </div>

</motion.div>

</div>
</div>
);
}