import React, { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Lock,
  Phone,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

import logoHorizontal from "../../assets/bizbite_logo_horizontal.png";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const otpRefs = useRef([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [step, setStep] = useState("phone");
  // phone
  // otp
  // pin

  const [showPin, setShowPin] = useState(false);

  const [requiresOtp, setRequiresOtp] = useState(false);

  const [verificationToken, setVerificationToken] = useState("");
  const [reqId, setReqId] = useState("");

  const [formData, setFormData] = useState({
    identifier: "",
    pin: "",
    otp: ["", "", "", "", "", ""],
    fcm_token: null,
  });

  const otpValue = useMemo(
    () => formData.otp.join(""),
    [formData.otp]
  );

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const otp = [...formData.otp];
    otp[index] = value;

    setFormData((prev) => ({
      ...prev,
      otp,
    }));

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !formData.otp[index] &&
      index > 0
    ) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const resetError = () => setError("");

  const nextStep = (value) => {
    resetError();
    setStep(value);
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();

    resetError();

    if (!formData.identifier.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/login/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: formData.identifier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to continue."
        );
      }

      if (data.requiresOtp) {
        setRequiresOtp(true);
        setReqId(data.reqId || "");
        nextStep("otp");
      } else {
        setRequiresOtp(false);
        nextStep("pin");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    resetError();

    if (otpValue.length !== 6) {
      setError("Please enter the 6 digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reqId,
          otp: otpValue,
          purpose: "LOGIN",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "OTP verification failed."
        );
      }

      setVerificationToken(data.verificationToken);

      nextStep("pin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);

      const response = await fetch("/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reqId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to resend OTP."
        );
      }

      if (data.reqId) {
        setReqId(data.reqId);
      }

      setFormData((prev) => ({
        ...prev,
        otp: ["", "", "", "", "", ""],
      }));

      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    resetError();

    if (!formData.pin.trim()) {
      setError("Please enter your PIN.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        identifier: formData.identifier,
        pin: formData.pin,
        fcm_token: formData.fcm_token,
      };

      if (requiresOtp) {
        payload.verificationToken = verificationToken;
      }

      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed."
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      login(data.user, data.token);

      switch (data.user.role) {
        case "seller":
          navigate("/seller/dashboard");
          break;

        case "customer":
          navigate("/customer/store");
          break;

        default:
          navigate("/admin/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const slideAnimation = {
    initial: {
      opacity: 0,
      x: 40,
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: -40,
    },
    transition: {
      duration: 0.35,
    },
  };

  return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0b2b18] via-[#16522d] to-[#07140d]">
      {/* Background */}
      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#ffc700]/10 blur-3xl"></div>

      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{
            duration: 0.45,
            ease: "easeInOut",
          }}
          className="w-full max-w-6xl"
        >
          <div
            className="
              grid
              overflow-hidden
              rounded-[32px]
              bg-white
              shadow-[0_40px_80px_rgba(22,82,45,0.15)]
              lg:grid-cols-2
            "
          >
            {/* ================================================= */}
            {/* LEFT PANEL */}
            {/* ================================================= */}

            <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#16522d] via-[#124325] to-[#08160e] p-8 text-white lg:flex">
              <div className="absolute right-0 top-0 h-60 w-60 rounded-full bg-[#ffc700]/10 blur-3xl"></div>

              <div className="relative z-10">
                <img
                  src={logoHorizontal}
                  alt="BizBiteNow"
                  className="h-10 object-contain"
                />

                <span className="mt-5 inline-flex rounded-full bg-[#ffc700] px-4 py-1.5 text-xs font-bold text-[#16522d]">
                  Restaurant Platform
                </span>

                <h1 className="mt-5 text-[2rem] leading-tight font-bold">
                  Welcome
                  <br />
                  Back
                </h1>

                <p className="mt-4 max-w-sm text-base leading-6 text-green-100">
                  Access your restaurant or customer account using your
                  registered mobile number.
                </p>
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ffc700] text-[#16522d]">
                    <Phone size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      One Login
                    </h3>

                    <p className="text-sm text-green-100">
                      Customer & Seller accounts.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ffc700] text-[#16522d]">
                    <ShieldCheck size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Secure Authentication
                    </h3>

                    <p className="text-sm text-green-100">
                      OTP verification for sellers with encrypted PIN login.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ffc700] text-[#16522d]">
                    ✓
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Fast Access
                    </h3>

                    <p className="text-sm text-green-100">
                      Login in just a few seconds.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ================================================= */}
            {/* RIGHT PANEL */}
            {/* ================================================= */}

            <div className="flex items-center justify-center bg-white px-5 py-8 sm:px-8 lg:px-10 lg:py-6">
              <div className="w-full max-w-lg">

                {/* Mobile Logo */}

                <div className="mb-6 flex justify-center lg:hidden">
                  <img
                    src={logoHorizontal}
                    alt="BizBiteNow"
                    className="h-10 object-contain"
                  />
                </div>

                <h1 className="text-center text-3xl font-extrabold tracking-tight text-slate-900 lg:text-left">
                  BizBiteNow
                  <span className="text-[#16522d]">
                    {" "}
                    Platform
                  </span>
                </h1>

                <h2 className="mt-4 text-center text-3xl font-black text-[#16522d] lg:text-left">
                  Welcome Back
                </h2>

                <p className="mt-2 text-center leading-6 text-gray-500 lg:text-left">
                  Continue with your registered mobile number.
                </p>

                {error && (
                  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                <AnimatePresence mode="wait">                  {/* ================================================= */}
                  {/* PHONE STEP */}
                  {/* ================================================= */}

                  {step === "phone" && (
                    <motion.form
                      key="phone"
                      {...slideAnimation}
                      onSubmit={handlePhoneSubmit}
                      className="mt-8 space-y-6"
                    >
                      <div>
                        <label
                          htmlFor="identifier"
                          className="mb-2 block text-left text-sm font-semibold text-[#16522d]"
                        >
                          Mobile Number
                        </label>

                        <div className="group flex h-14 items-center rounded-xl border border-gray-200 bg-white px-4 transition-all duration-300 focus-within:border-[#16522d] focus-within:ring-4 focus-within:ring-[#16522d]/10">
                          <Phone
                            size={18}
                            className="text-gray-400 transition group-focus-within:text-[#16522d]"
                          />

                          <span className="ml-3 mr-3 border-r border-gray-200 pr-3 font-semibold text-[#16522d]">
                            +91
                          </span>

                          <input
                            id="identifier"
                            name="identifier"
                            type="tel"
                            autoComplete="tel"
                            inputMode="numeric"
                            maxLength={10}
                            required
                            value={formData.identifier}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");

                              setFormData((prev) => ({
                                ...prev,
                                identifier: value,
                              }));
                            }}
                            placeholder="Enter your mobile number"
                            className="h-full w-full bg-transparent text-[15px] text-[#16522d] outline-none placeholder:text-gray-400"
                          />
                        </div>

                        <p className="mt-2 text-left text-xs leading-5 text-gray-500">
                          Use the mobile number linked to your BizBiteNow
                          account.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[#16522d]/10 bg-[#16522d]/5 p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#16522d] text-white">
                            <ShieldCheck size={18} />
                          </div>

                          <div>
                            <h3 className="font-semibold text-[#16522d]">
                              Smart Login
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-gray-600">
                              Customer and Admin accounts continue directly to
                              PIN verification. Seller accounts automatically
                              receive an OTP before PIN verification.
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#16522d] px-5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#1b6538] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loading ? (
                          <>
                            <svg
                              className="h-5 w-5 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="opacity-25"
                              />

                              <path
                                d="M22 12A10 10 0 0 0 12 2"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                            </svg>

                            <span>Checking Account...</span>
                          </>
                        ) : (
                          <>
                            <span>Continue</span>

                            <ArrowRight
                              size={18}
                              className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-gray-200"></div>

                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                          New Seller?
                        </span>

                        <div className="h-px flex-1 bg-gray-200"></div>
                      </div>

                      <Link
                        to="/seller/register"
                        className="group flex h-12 w-full items-center justify-center rounded-xl border border-[#16522d] text-sm font-semibold text-[#16522d] transition-all duration-300 hover:bg-[#16522d] hover:text-white"
                      >
                        Create Seller Account

                        <ArrowRight
                          size={18}
                          className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </Link>
                    </motion.form>
                  )}
                                    {/* ================================================= */}
                  {/* OTP STEP */}
                  {/* ================================================= */}

                  {step === "otp" && (
                    <motion.div
                      key="otp"
                      {...slideAnimation}
                      className="mt-8 space-y-6"
                    >
                      <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#16522d]/10">
                          <ShieldCheck
                            size={30}
                            className="text-[#16522d]"
                          />
                        </div>

                        <h3 className="mt-4 text-2xl font-bold text-[#16522d]">
                          Verify OTP
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                          We've sent a 6-digit verification code to
                        </p>

                        <p className="mt-1 font-semibold text-[#16522d]">
                          +91 {formData.identifier}
                        </p>
                      </div>

                      <div className="flex justify-center gap-2 sm:gap-3">
                        {formData.otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => (otpRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleOtpChange(
                                e.target.value,
                                index
                              )
                            }
                            onKeyDown={(e) =>
                              handleOtpKeyDown(
                                e,
                                index
                              )
                            }
                            className="
                              h-14
                              w-11
                              rounded-xl
                              border
                              border-gray-200
                              text-center
                              text-lg
                              font-bold
                              outline-none
                              transition-all
                              duration-300
                              focus:border-[#16522d]
                              focus:ring-4
                              focus:ring-[#16522d]/10
                              sm:h-16
                              sm:w-14
                            "
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={loading}
                        className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#16522d] text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#1b6538] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loading ? (
                          <>
                            <svg
                              className="h-5 w-5 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="opacity-25"
                              />

                              <path
                                d="M22 12A10 10 0 0 0 12 2"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                            </svg>

                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <span>Verify OTP</span>

                            <ArrowRight
                              size={18}
                              className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={loading}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#16522d] transition hover:text-[#ffc700]"
                        >
                          <RefreshCw size={16} />
                          Resend OTP
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => nextStep("phone")}
                        className="w-full text-sm font-semibold text-gray-500 transition hover:text-[#16522d]"
                      >
                        Change Mobile Number
                      </button>
                    </motion.div>
                  )}

                  {/* ================================================= */}
                  {/* PIN STEP */}
                  {/* ================================================= */}

                  {step === "pin" && (
                    <motion.form
                      key="pin"
                      {...slideAnimation}
                      onSubmit={handleLogin}
                      className="mt-8 space-y-6"
                    >
                      <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#16522d]/10">
                          <Lock
                            size={28}
                            className="text-[#16522d]"
                          />
                        </div>

                        <h3 className="mt-4 text-2xl font-bold text-[#16522d]">
                          Enter Security PIN
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                          Enter your secure PIN to continue.
                        </p>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label
                            htmlFor="pin"
                            className="text-sm font-semibold text-[#16522d]"
                          >
                            Security PIN
                          </label>

                          <button
                            type="button"
                            onClick={() =>
                              setShowPin(!showPin)
                            }
                            className="text-xs font-semibold text-[#16522d] transition hover:text-[#ffc700]"
                          >
                            {showPin
                              ? "Hide PIN"
                              : "Show PIN"}
                          </button>
                        </div>

                        <div className="group flex h-14 items-center rounded-xl border border-gray-200 bg-white px-4 transition-all duration-300 focus-within:border-[#16522d] focus-within:ring-4 focus-within:ring-[#16522d]/10">
                          <Lock
                            size={18}
                            className="text-gray-400 transition group-focus-within:text-[#16522d]"
                          />

                          <input
                            id="pin"
                            name="pin"
                            type={
                              showPin
                                ? "text"
                                : "password"
                            }
                            maxLength={4}
                            required
                            inputMode="numeric"
                            autoComplete="current-password"
                            value={formData.pin}
                            onChange={handleChange}
                            placeholder="••••"
                            className="w-full bg-transparent px-4 py-2 font-mono tracking-[0.35em] text-[#16522d] outline-none placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                                            <div className="flex items-center justify-between">
                        <label
                          htmlFor="rememberMe"
                          className="flex cursor-pointer items-center gap-2 text-sm text-gray-600"
                        >
                          <input
                            id="rememberMe"
                            type="checkbox"
                            className="h-4 w-4 accent-[#16522d]"
                          />

                          Remember Me
                        </label>

                        <button
                          type="button"
                          className="text-sm font-semibold text-[#16522d] transition hover:text-[#ffc700]"
                        >
                          Need Help?
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#16522d] text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#1b6538] disabled:cursor-not-allowed disabled:opacity-70"
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
                                className="opacity-25"
                              />

                              <path
                                d="M22 12A10 10 0 0 0 12 2"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                            </svg>

                            <span>Signing In...</span>
                          </>
                        ) : (
                          <>
                            <span>Login</span>

                            <ArrowRight
                              size={18}
                              className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          requiresOtp
                            ? nextStep("otp")
                            : nextStep("phone")
                        }
                        className="w-full text-sm font-semibold text-gray-500 transition hover:text-[#16522d]"
                      >
                        Back
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* ================= TRUST BADGES ================= */}

                <div className="mt-8 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-[#16522d]/5 p-3 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#16522d]/10 text-lg">
                      🔒
                    </div>

                    <p className="mt-2 text-xs font-semibold text-[#16522d]">
                      Secure
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#ffc700]/10 p-3 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#ffc700]/20 text-lg">
                      ⚡
                    </div>

                    <p className="mt-2 text-xs font-semibold text-[#16522d]">
                      Fast
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#16522d]/5 p-3 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#16522d]/10 text-lg">
                      🛡️
                    </div>

                    <p className="mt-2 text-xs font-semibold text-[#16522d]">
                      Trusted
                    </p>
                  </div>
                </div>

                {/* ================= FOOTER ================= */}

                <div className="mt-8 border-t border-gray-200 pt-5 text-center">
                  <p className="text-sm text-gray-500">
                    Built for restaurants, customers and business growth.
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
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