import { useState, useEffect } from "react";
import {
  Phone,
  ShieldCheck,
  Lock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import logoHorizontal from "../../assets/bizbite_logo_horizontal.png";
import useAuthStore from "../../store/authStore";
import { motion, AnimatePresence } from "framer-motion";

// Step order: phone -> otp -> reset -> done
const STEPS = ["phone", "otp", "reset"];

export default function ForgotPin() {
  const navigate = useNavigate();
  const { forgotPin, verifyOTP, resendOTP, resetPin, loading } =
    useAuthStore();

  const [step, setStep] = useState("phone");
  const [error, setError] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [reqId, setReqId] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");

  const [formData, setFormData] = useState({
    phoneNumber: "",
    otp: "",
    newPin: "",
    confirmPin: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(
      () => setResendCooldown((s) => Math.max(s - 1, 0)),
      1000,
    );
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Enter Phone Number -> POST /users/forgot-pin
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^[0-9]{10}$/.test(formData.phoneNumber.trim())) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    try {
      const data = await forgotPin({ phoneNumber: formData.phoneNumber });

      // Backend returns the reqId as data.data.message (mislabeled), not data.reqId
      setReqId(data.reqId || data.data?.reqId || data.data?.message || "");
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to continue.");
    }
  };

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

  // Step 2: Receive & Enter OTP -> POST /verify-otp (purpose: FORGOT_PIN)
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^[0-9]{4,6}$/.test(formData.otp.trim())) {
      setError("Enter the OTP sent to your phone.");
      return;
    }

    try {
      await verifyOTP({ reqId, otp: formData.otp, purpose: "FORGOT_PIN" });
      setStep("reset");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  // Step 3: Set New PIN -> POST /users/reset-pin
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^[0-9]{4}$/.test(formData.newPin.trim())) {
      setError("PIN must be exactly 4 digits.");
      return;
    }

    if (formData.newPin !== formData.confirmPin) {
      setError("PINs do not match.");
      return;
    }

    try {
      const verificationToken = useAuthStore.getState().verificationToken;

      await resetPin({
        verificationToken,
        newPin: formData.newPin,
        confirmPin: formData.confirmPin,
      });

      setStep("done");
      setTimeout(() => navigate("/seller/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset PIN.");
    }
  };

  const goBack = () => {
    setError("");
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0b2b18] via-[#16522d] to-[#07140d] px-6 py-6">
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-[#ffc700]/10 blur-3xl"></div>

      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="relative z-10 w-full max-w-sm rounded-[28px] bg-white p-8 shadow-[0_40px_80px_rgba(22,82,45,0.2)]">
        <div className="mb-5 flex justify-center">
          <img src={logoHorizontal} alt="BizBiteNow" className="h-10" />
        </div>

        {step !== "done" && (
          <>
            <h2 className="text-center text-2xl font-black text-[#16522d]">
              {step === "phone" && "Forgot PIN"}
              {step === "otp" && "Verify OTP"}
              {step === "reset" && "Set New PIN"}
            </h2>

            <p className="mt-1 text-center text-sm text-gray-500 leading-6">
              {step === "phone" &&
                "Enter your registered phone number to reset your PIN."}
              {step === "otp" && (
                <>
                  Enter the code sent to{" "}
                  <span className="font-semibold text-[#16522d]">
                    +91 {formData.phoneNumber}
                  </span>
                </>
              )}
              {step === "reset" && "Choose a new 4-digit security PIN."}
            </p>

            <div className="mt-4 mb-2 flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    STEPS.indexOf(step) >= i ? "bg-[#16522d]" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {error && (
          <div className="mb-4 mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: PHONE */}

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
                  <span>Sending OTP...</span>
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

              <Link
                to="/seller/login"
                className="flex items-center justify-center gap-1 text-sm font-semibold text-[#16522d] transition hover:text-[#ffc700]">
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </motion.form>
          )}

          {/* STEP 2: OTP */}

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

          {/* STEP 3: NEW PIN */}

          {step === "reset" && (
            <motion.form
              key="reset"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleResetSubmit}
              className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="newPin"
                  className="mb-2 block w-full text-left text-sm font-semibold text-[#16522d]">
                  New PIN
                </label>

                <div className="group flex items-center rounded-xl border border-gray-200 bg-white px-4 transition-all duration-300 focus-within:border-[#16522d] focus-within:ring-4 focus-within:ring-[#16522d]/10">
                  <Lock
                    size={18}
                    className="text-gray-400 transition group-focus-within:text-[#16522d]"
                  />

                  <input
                    id="newPin"
                    name="newPin"
                    type={showPin ? "text" : "password"}
                    required
                    maxLength={4}
                    inputMode="numeric"
                    autoComplete="new-password"
                    value={formData.newPin}
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

              <div>
                <label
                  htmlFor="confirmPin"
                  className="mb-2 block w-full text-left text-sm font-semibold text-[#16522d]">
                  Confirm PIN
                </label>

                <div className="group flex items-center rounded-xl border border-gray-200 bg-white px-4 transition-all duration-300 focus-within:border-[#16522d] focus-within:ring-4 focus-within:ring-[#16522d]/10">
                  <Lock
                    size={18}
                    className="text-gray-400 transition group-focus-within:text-[#16522d]"
                  />

                  <input
                    id="confirmPin"
                    name="confirmPin"
                    type={showPin ? "text" : "password"}
                    required
                    maxLength={4}
                    inputMode="numeric"
                    autoComplete="new-password"
                    value={formData.confirmPin}
                    onChange={handleChange}
                    placeholder="••••"
                    className="w-full bg-transparent px-4 py-2 font-mono tracking-[0.35em] text-[#16522d] outline-none placeholder:text-gray-400"
                  />
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
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#16522d] py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#1d6438] disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? (
                  <span>Resetting...</span>
                ) : (
                  <>
                    <span>Reset PIN</span>
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </motion.form>
          )}

          {/* DONE */}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 size={36} className="text-emerald-500" />
              </div>

              <h2 className="mt-4 text-2xl font-black text-[#16522d]">
                PIN Reset Successful
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Redirecting you to login...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
