import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

const AuthPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (countdown > 0) {
      setError(`Please wait ${countdown} seconds before trying again.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.status === 429) {
        // Rate limited - start 60 second countdown
        setCountdown(60);
        setError(
          "Too many requests. Please wait 60 seconds before trying again."
        );
      } else if (
        res.ok &&
        (data.success || data.message?.toLowerCase().includes("otp"))
      ) {
        setStep(2);
        setSuccess(data.message || "OTP sent to your email!");
      } else {
        setError(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!otp || otp.length < 4) {
      setError("Please enter the OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (
        res.ok &&
        ((data.success && data.success === true) ||
          (data.message &&
            (data.message.toLowerCase().includes("verified") ||
              data.message.toLowerCase().includes("login successful"))))
      ) {
        setSuccess(data.message || "OTP verified! Redirecting...");
        // Save tokens to localStorage
        if (data.data && data.data.access_token) {
          localStorage.setItem("access_token", data.data.access_token);
          localStorage.setItem("refresh_token", data.data.refresh_token);
        }
        console.log("Redirecting to /onboarding");
        navigate("/onboarding");
      } else {
        setError(data.message || "Invalid OTP.");
      }
    } catch (err) {
      setError("Failed to verify OTP. Please try again.");
    }
    setLoading(false);
  };
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-white px-2 sm:px-4 w-full">
      <motion.div
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h2 className="text-3xl font-bold text-center text-red-600 mb-6">
          Sign Up with Email
        </h2>
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <label className="font-semibold text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-300 outline-none text-lg"
              placeholder="Enter your Gmail address"
              required
              disabled={countdown > 0}
            />
            <button
              type="submit"
              className={`font-bold py-3 rounded-lg transition-all text-lg mt-2 ${
                countdown > 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
              disabled={loading || countdown > 0}
            >
              {loading
                ? "Sending OTP..."
                : countdown > 0
                ? `Wait ${countdown}s`
                : "Send OTP"}
            </button>
            {error && (
              <div className="text-red-600 text-center font-semibold">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-600 text-center font-semibold">
                {success}
              </div>
            )}
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <label className="font-semibold text-gray-700">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-300 outline-none text-lg tracking-widest text-center"
              placeholder="Enter OTP"
              required
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all text-lg mt-2"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            {error && (
              <div className="text-red-600 text-center font-semibold">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-600 text-center font-semibold">
                {success}
              </div>
            )}
            <button
              type="button"
              className="text-red-500 underline mt-2"
              onClick={() => setStep(1)}
            >
              Change Email
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default AuthPage;
