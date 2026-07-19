import { useState, useEffect } from "react";
import { Phone, ShieldCheck, Lock, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import logoHorizontal from "../../assets/bizbite_logo_horizontal.png";
import useAuthStore from "../../store/authStore";
import { motion, AnimatePresence } from "framer-motion";

// Step order depends on role — seller: phone -> otp -> pin, customer: phone -> pin
const STEPS_SELLER = ["phone", "otp", "pin"];
const STEPS_CUSTOMER = ["phone", "pin"];

export default function Login() {
  const navigate = useNavigate();
  const { loginInit, verifyOTP, resendOTP, login, loading } = useAuthStore();

  const [step, setStep] = useState("phone");
  const [error, setError] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [reqId, setReqId] = useState("");
  const [loginRole, setLoginRole] = useState(""); // "customer" | "seller"
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");

  const [formData, setFormData] = useState({
    phoneNumber: "",
    otp: "",
    pin: "",
  });

  const STEPS =
    loginRole === "customer" ? STEPS_CUSTOMER : STEPS_SELLER;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Step 1: Enter Phone Number -> POST /users/login/init
  // Checks role. Seller -> OTP sent, go to otp step. Customer -> skip OTP, go to pin step.
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^[0-9]{10}$/.test(formData.phoneNumber.trim())) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    try {
      const data = await loginInit({ identifier: formData.phoneNumber });

      const role = (data.role || data.data?.role || "").toLowerCase();
      const incomingReqId = data.reqId || data.data?.reqId || "";

      setLoginRole(role);
      setReqId(incomingReqId);

      if (role === "customer") {
        setStep("pin");
      } else {
        setStep("otp");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to continue.");
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(
      () => setResendCooldown((s) => Math.max(s - 1, 0)),
      1000,
    );
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Resend OTP -> POST /users/resend-otp
  const handleResendOtp = async () => {
    setError("");
    setResendMessage("");

    try {
      await resendOTP({ reqId });
      setResendMessage("OTP resent to your phone.");
      setResendCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to resend OTP.");
    }
  };

  // Step 2 (Seller only): Receive & Enter OTP -> POST /verify-otp (purpose: LOGIN)
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^[0-9]{4,6}$/.test(formData.otp.trim())) {
      setError("Enter the OTP sent to your phone.");
      return;
    }

    try {
      await verifyOTP({ reqId, otp: formData.otp, purpose: "LOGIN" });
      setStep("pin");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  // Final Step: Enter PIN -> POST /login { identifier, pin, verificationToken }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.pin.trim()) {
      setError("Please enter your PIN.");
      return;
    }

    try {
      const verificationToken = useAuthStore.getState().verificationToken;

      await login({
        identifier: formData.phoneNumber,
        pin: formData.pin,
        fcm_token: null,
        verificationToken, // null for customer (OTP skipped), set for seller after OTP verify
      });

      navigate(loginRole === "customer" ? "/customer/dashboard" : "/seller/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid PIN. Please try again.");
    }
  };

  const goBack = () => {
    setError("");
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
    else setStep("phone");
  };

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-[#0b2b18] via-[#16522d] to-[#07140d]">
      {/* Decorative Background */}

      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-[#ffc700]/10 blur-3xl"></div>

      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>

      <div className="relative z-10 flex h-full items-center justify-center px-6 py-4">
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{
            duration: 0.45,
            ease: "easeInOut",
          }}
          className="w-full max-w-6xl">
          {/* Main Card */}

          <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 rounded-[32px] overflow-hidden  shadow-[0_40px_80px_rgba(22,82,45,0.15)]">
            {/* LEFT PANEL */}

            <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#16522d] via-[#124325] to-[#08160e] p-8 text-white">
              <div className="absolute top-0 right-0 h-60 w-60 rounded-full bg-[#ffc700]/10 blur-3xl"></div>

              <div className="relative z-10">
                <img
                  src={logoHorizontal}
                  alt="BizBiteNow"
                  className="h-10 object-contain"
                />

                <span className="mt-5 inline-flex rounded-full bg-[#ffc700] px-4 py-1.5 text-xs font-bold text-[#16522d]">
                  Plus Seller Dashboard
                </span>

                <h1 className="mt-5 text-[2rem]  leading-tight text-white">
                  Grow Your
                  <br />
                  Restaurant
                  <br />
                  Business
                </h1>

                <p className="mt-3 max-w-sm text-base leading-6 text-green-100">
                  Manage orders, menus, revenue, customers and analytics from
                  one beautiful dashboard.
                </p>
              </div>

              {/* Features */}

              <div className="relative z-10 text-left space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffc700] font-black text-[#16522d]">
                    ✓
                  </div>

                  <div>
                    <h3 className="font-semibold">Live Orders</h3>

                    <p className="text-xs text-green-100">
                      Real-time order management.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffc700] font-black text-[#16522d]">
                    ✓
                  </div>

                  <div>
                    <h3 className="font-semibold">Revenue Insights</h3>

                    <p className="text-xs text-green-100">
                      Daily business analytics.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffc700] font-black text-[#16522d]">
                    ✓
                  </div>

                  <div>
                    <h3 className="font-semibold">Secure Platform</h3>

                    <p className="text-xs text-green-100">
                      Enterprise-grade protection.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}

            <div className="flex items-center justify-center bg-white px-10 py-6">
              <div className="w-full max-w-sm">
                {/* Mobile Logo */}

                <div className="mb-5 flex justify-center lg:hidden">
                  <img src={logoHorizontal} alt="BizBiteNow" className="h-10" />
                </div>

                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  BizbitsNow
                </h1>

                <h2 className="mt-4 text-3xl font-black text-[#16522d]">
                  {step === "phone" && "Welcome Back"}
                  {step === "otp" && "Verify OTP"}
                  {step === "pin" && "Enter Your PIN"}
                </h2>

                <p className="mt-1 text-gray-500 leading-6">
                  {step === "phone" &&
                    "Sign in to manage your restaurant, orders and customers."}
                  {step === "otp" && (
                    <>
                      Enter the code sent to{" "}
                      <span className="font-semibold text-[#16522d]">
                        +91 {formData.phoneNumber}
                      </span>
                    </>
                  )}
                  {step === "pin" &&
                    "Enter your 4-digit security PIN to continue."}
                </p>

                {/* ================= STEP INDICATOR ================= */}

                <div className="mt-4 mb-2 flex items-center gap-2">
                  {STEPS.map((s, i) => (
                    <div
                      key={s}
                      className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${STEPS.indexOf(step) >= i
                        ? "bg-[#16522d]"
                        : "bg-gray-200"
                        }`}
                    />
                  ))}
                </div>

                {/* ================= ERROR ================= */}

                {error && (
                  <div className="mb-4 mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {/* ================= STEP 1: PHONE ================= */}

                  {step === "phone" && (
                    <motion.form
                      key="phone"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      onSubmit={handlePhoneSubmit}
                      className="mt-4 space-y-4">
                      <div>
                        <label
                          htmlFor="phoneNumber"
                          className="mb-2 block w-full text-left text-sm font-semibold text-[#16522d]">
                          Phone Number
                        </label>

                        <div className="group flex items-center rounded-xl border border-gray-200 bg-white px-4 transition-all duration-300 focus-within:border-[#16522d] focus-within:ring-4 focus-within:ring-[#16522d]/10">
                          <Phone
                            size={18}
                            className="text-gray-400 transition group-focus-within:text-[#16522d]"
                          />

                          <input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            required
                            autoComplete="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="9876543210"
                            className="w-full bg-transparent px-4 py-2 text-[#16522d] outline-none placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#16522d] py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#1d6438] disabled:cursor-not-allowed disabled:opacity-70">
                        {loading ? (
                          <span>Checking...</span>
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
                    </motion.form>
                  )}

                  {/* ================= STEP 2: OTP (Seller only) ================= */}

                  {step === "otp" && (
                    <motion.form
                      key="otp"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      onSubmit={handleOtpSubmit}
                      className="mt-4 space-y-4">
                      <div>
                        <label
                          htmlFor="otp"
                          className="mb-2 block w-full text-left text-sm font-semibold text-[#16522d]">
                          One-Time Password
                        </label>

                        <div className="group flex items-center rounded-xl border border-gray-200 bg-white px-4 transition-all duration-300 focus-within:border-[#16522d] focus-within:ring-4 focus-within:ring-[#16522d]/10">
                          <ShieldCheck
                            size={18}
                            className="text-gray-400 transition group-focus-within:text-[#16522d]"
                          />

                          <input
                            id="otp"
                            name="otp"
                            type="text"
                            required
                            inputMode="numeric"
                            maxLength={6}
                            value={formData.otp}
                            onChange={handleChange}
                            placeholder="••••••"
                            className="w-full bg-transparent px-4 py-2 font-mono tracking-[0.35em] text-[#16522d] outline-none placeholder:text-gray-400"
                          />
                        </div>

                        {resendMessage && (
                          <p className="mt-2 text-xs font-semibold text-[#16522d]">
                            {resendMessage}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <button
                          type="button"
                          onClick={goBack}
                          className="flex items-center gap-1 font-semibold text-[#16522d] transition hover:text-[#ffc700]">
                          <ArrowLeft size={14} />
                          Change Number
                        </button>

                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={loading || resendCooldown > 0}
                          className="font-semibold text-[#16522d] transition hover:text-[#ffc700] disabled:cursor-not-allowed disabled:opacity-50">
                          {resendCooldown > 0
                            ? `Resend in ${resendCooldown}s`
                            : "Resend OTP"}
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#16522d] py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#1d6438] disabled:cursor-not-allowed disabled:opacity-70">
                        {loading ? (
                          <span>Verifying...</span>
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
                    </motion.form>
                  )}

                  {/* ================= STEP 3: PIN ================= */}

                  {step === "pin" && (
                    <motion.form
                      key="pin"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      onSubmit={handleSubmit}
                      className="mt-4 space-y-4">
                      <div>
                        <div className="mb-2">
                          <label
                            htmlFor="pin"
                            className="text-sm font-semibold text-[#16522d]">
                            Security PIN
                          </label>
                        </div>

                        <div className="group flex items-center rounded-xl border border-gray-200 bg-white px-4 transition-all duration-300 focus-within:border-[#16522d] focus-within:ring-4 focus-within:ring-[#16522d]/10">
                          <Lock
                            size={18}
                            className="text-gray-400 transition group-focus-within:text-[#16522d]"
                          />

                          <input
                            id="pin"
                            name="pin"
                            type={showPin ? "text" : "password"}
                            required
                            maxLength={4}
                            inputMode="numeric"
                            autoComplete="current-password"
                            value={formData.pin}
                            onChange={handleChange}
                            placeholder="••••"
                            className="w-full bg-transparent px-4 py-2 font-mono tracking-[0.35em] text-[#16522d] outline-none placeholder:text-gray-400"
                          />

                          <button
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                            className="text-xs font-semibold text-[#16522d] transition hover:text-[#ffc700]">
                            {showPin ? "Hide" : "Show"}
                          </button>
                        </div>

                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <button
                          type="button"
                          onClick={goBack}
                          className="flex items-center gap-1 font-semibold text-[#16522d] transition hover:text-[#ffc700]">
                          <ArrowLeft size={14} />
                          Back
                        </button>

                        <Link
                          to="/auth/forgot-pin"
                          className="font-semibold text-[#16522d] transition hover:text-[#ffc700]">
                          Forgot PIN?
                        </Link>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#16522d] py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#1d6438] disabled:cursor-not-allowed disabled:opacity-70">
                        {loading ? (
                          <>
                            <svg
                              className="h-5 w-5 animate-spin"
                              viewBox="0 0 24 24"
                              fill="none">
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

                            <span>Authenticating...</span>
                          </>
                        ) : (
                          <>
                            <span>Access Dashboard</span>

                            <ArrowRight
                              size={18}
                              className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* ================= CUSTOMER DIVIDER ================= */}

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-200"></div>

                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Are You A Customer?
                  </span>

                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>

                {/* ================= CUSTOMER REGISTER BUTTON ================= */}

                <Link
                  to="/customer/register"
                  className="group flex w-full items-center justify-center rounded-lg border border-[#16522d] py-2.5 text-sm font-semibold text-[#16522d] transition-all duration-300 hover:bg-[#16522d] hover:text-white">
                  Create New Customer Account
                  <ArrowRight
                    size={18}
                    className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>

                {/* ================= TRUST BADGES ================= */}

                <div className="mt-6 flex justify-between gap-3">
                  <div className="flex-1 rounded-xl bg-[#16522d]/5 p-3 text-center">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#16522d]/10 text-lg">
                      🔒
                    </div>

                    <p className="mt-2 text-[11px] font-semibold text-[#16522d]">
                      Secure
                    </p>
                  </div>

                  <div className="flex-1 rounded-xl bg-[#ffc700]/10 p-3 text-center">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#ffc700]/20 text-lg">
                      ⚡
                    </div>

                    <p className="mt-2 text-[11px] font-semibold text-[#16522d]">
                      Fast
                    </p>
                  </div>

                  <div className="flex-1 rounded-xl bg-[#16522d]/5 p-3 text-center">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#16522d]/10 text-lg">
                      📈
                    </div>

                    <p className="mt-2 text-[11px] font-semibold text-[#16522d]">
                      Growth
                    </p>
                  </div>
                </div>

                {/* ================= FOOTER ================= */}

                <div className="mt-6 border-t border-gray-200 pt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Built for independent restaurants.
                  </p>

                  <p className="mt-1 text-[11px] text-gray-400">
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