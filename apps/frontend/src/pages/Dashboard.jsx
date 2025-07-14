import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faBell,
  faCalendar,
  faUser,
  faChevronRight,
  faQuestionCircle,
  faArrowLeft,
  faTrash,
  faSignOutAlt,
  faEdit,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

// Admin login API function
export async function adminLogin(email, password) {
  const response = await fetch(
    "https://bichance-production-a30f.up.railway.app/api/v1/admin/login",
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }
  );
  if (!response.ok) {
    throw new Error("Login failed");
  }
  return response.json();
}

// Logout API function
async function logoutApi(token) {
  const response = await fetch(
    "https://bichance-production-a30f.up.railway.app/api/v1/auth/logout",
    {
      method: "POST",
      headers: {
        accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: "",
    }
  );
  if (!response.ok) {
    throw new Error("Logout failed");
  }
  return response.json();
}

// Opt-in Dinner API function
async function optInDinner(dinnerId, budgetCategory, dietaryCategory, token) {
  const response = await fetch(
    "https://bichance-production-a30f.up.railway.app/api/v1/dinner/opt-in",
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        dinner_id: dinnerId,
        budget_category: budgetCategory,
        dietary_category: dietaryCategory,
      }),
    }
  );
  if (!response.ok) throw new Error("Failed to opt-in for dinner");
  return response.json();
}

// Fetch upcoming dinners from backend
function useUpcomingDinners(token) {
  const [dinners, setDinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDinners() {
      setLoading(true);
      try {
        if (!token) throw new Error("No auth token found");
        const res = await fetch(
          "https://bichance-production-a30f.up.railway.app/api/v1/dinner/upcoming",
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch dinners");
        const data = await res.json();
        setDinners(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchDinners();
    else setLoading(false);
  }, [token]);
  return { dinners, loading, error };
}

// User Profile API function
async function fetchUserProfile(token) {
  const response = await fetch(
    "https://bichance-production-a30f.up.railway.app/api/v1/users/me",
    {
      headers: {
        accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch profile");
  const data = await response.json();
  return data.data;
}

// My Bookings API function
async function fetchMyBookings(token) {
  const response = await fetch(
    "https://bichance-production-a30f.up.railway.app/api/v1/dinner/my-bookings",
    {
      headers: {
        accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch bookings");
  const data = await response.json();
  // Some backends return {dinners: [...]}, some just [...], handle both
  return data.data?.dinners || data.data || [];
}

const MEMBERSHIP_PLANS = [
  { id: "1m", name: "1 Month", price: 29 },
  { id: "3m", name: "3 Months", price: 79 },
  { id: "6m", name: "6 Months", price: 149 },
];

export default function TimeleftDashboard() {
  const token = localStorage.getItem("access_token");
  const {
    dinners,
    loading: dinnersLoading,
    error: dinnersError,
  } = useUpcomingDinners(token);
  const [activeTab, setActiveTab] = useState("home");
  // Stepwise booking flow states
  const [step, setStep] = useState("dinner"); // 'dinner', 'meal', 'membership', 'payment', 'success'
  const [selectedDate, setSelectedDate] = useState(null);
  const [mealPref, setMealPref] = useState("");
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  // Profile/Help/Guide/Edit/Delete modals
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [profile, setProfile] = useState({
    name: "Gourav",
    email: "gourav@email.com",
  });
  const [editProfile, setEditProfile] = useState(profile);
  // Add loading state for Book My Seat
  const [isOptingIn, setIsOptingIn] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");

  const dispatch = useDispatch();

  // Reset booking flow when switching away from Home
  React.useEffect(() => {
    if (activeTab !== "home") {
      setStep("dinner");
      setSelectedDate(null);
      setMealPref("");
      setSelectedMembership(null);
      setCardDetails({ number: "", expiry: "", cvv: "", name: "" });
      setIsProcessing(false);
    }
  }, [activeTab]);

  // Back button handler for booking steps
  const handleBack = () => {
    switch (step) {
      case "meal":
        setStep("dinner");
        break;
      case "membership":
        setStep("meal");
        break;
      case "payment":
        setStep("membership");
        break;
      case "success":
        setStep("dinner");
        setSelectedDate(null);
        setMealPref("");
        setSelectedMembership(null);
        setCardDetails({ number: "", expiry: "", cvv: "", name: "" });
        setIsProcessing(false);
        break;
      default:
        break;
    }
  };

  const handleProfileSave = () => {
    setProfile(editProfile);
    setShowEditProfile(false);
  };

  const handleDeleteAccount = () => {
    setDeleteSuccess(true);
    setTimeout(() => {
      setShowDelete(false);
      setDeleteSuccess(false);
      // Simulate log out after delete
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }, 1500);
  };

  // Fetch profile when Profile tab is active
  useEffect(() => {
    if (activeTab === "profile") {
      setProfileLoading(true);
      setProfileError("");
      fetchUserProfile(token)
        .then((data) => {
          setProfile(data);
          setEditProfile(data);
        })
        .catch((err) => setProfileError(err.message))
        .finally(() => setProfileLoading(false));
    }
  }, [activeTab, token]);

  // Fetch bookings when Bookings tab is active
  useEffect(() => {
    if (activeTab === "bookings") {
      setBookingsLoading(true);
      setBookingsError("");
      fetchMyBookings(token)
        .then((data) => setBookings(data))
        .catch((err) => setBookingsError(err.message))
        .finally(() => setBookingsLoading(false));
    }
  }, [activeTab, token]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await logoutApi(token);
    } catch (err) {
      // ignore error, just clear local/session storage
    }
    localStorage.clear();
    sessionStorage.clear();
    dispatch(logout());
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#fef7ed] px-2 py-4">
      <div className="w-full max-w-2xl flex flex-col flex-1 bg-[#fef7ed] rounded-xl shadow-lg border border-white/30 items-center relative z-10">
        {/* Back button above header for steps after the first */}
        {activeTab === "home" && step !== "dinner" && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-700 hover:text-red-600 font-bold text-lg mt-4 mb-2 ml-4 self-start focus:outline-none"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
            Back
          </button>
        )}
        {/* Header */}
        <div className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#fef7ed] rounded-t-xl">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <img
              src="/l1.png"
              alt="Bichance Table Logo"
              className="w-10 h-10 object-contain"
            />
            <div className="text-2xl font-extrabold text-red-700 tracking-wide font-sans">
              Bichance Table
            </div>
          </div>
          <div></div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full flex flex-col items-center justify-start px-4 py-4">
          {activeTab === "home" && (
            <>
              {/* Step 1: Upcoming Wednesday Dinners */}
              {step === "dinner" && (
                <div className="w-full">
                  <div className="text-2xl font-extrabold text-gray-900 mb-1 text-center font-sans">
                    Book your next event
                  </div>
                  <div className="text-base font-semibold text-red-500 mb-6 text-center">
                    5 people are waiting for you
                  </div>
                  <div className="flex flex-col gap-4 mb-6">
                    {dinnersLoading && (
                      <div className="text-center text-gray-500">
                        Loading dinners...
                      </div>
                    )}
                    {dinnersError && (
                      <div className="text-center text-red-500">
                        {dinnersError}
                      </div>
                    )}
                    {dinners.map((dinner, idx) => (
                      <button
                        key={dinner.id || idx}
                        onClick={() => setSelectedDate(dinner)}
                        className={`w-full p-5 rounded-2xl border-2 flex justify-between items-center text-left transition-all shadow-md bg-white font-sans ${
                          selectedDate && selectedDate.id === dinner.id
                            ? "border-red-500 ring-2 ring-red-400"
                            : "border-gray-200 hover:border-red-300"
                        }`}
                        style={{ fontWeight: 600, fontSize: "1.1rem" }}
                      >
                        <span>
                          <span className="block font-bold text-lg text-gray-900">
                            {dinner.date
                              ? new Date(dinner.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )
                              : "Dinner"}
                          </span>
                          <span className="block text-sm text-gray-500 font-semibold">
                            {dinner.time || "8:00 PM"}
                          </span>
                        </span>
                        {selectedDate && selectedDate.id === dinner.id && (
                          <span className="w-4 h-4 bg-red-500 rounded-full ml-2 border-2 border-white" />
                        )}
                      </button>
                    ))}
                  </div>
                  <button
                    className="w-full py-3 rounded-full bg-gradient-to-r from-red-500 to-red-700 text-white font-bold text-lg shadow-lg hover:scale-105 transition-all font-sans"
                    disabled={!selectedDate || isOptingIn}
                    onClick={async () => {
                      if (!selectedDate) return;
                      setIsOptingIn(true);
                      try {
                        const dinnerId = selectedDate.id;
                        await optInDinner(dinnerId, "standard", "none", token);
                        setStep("meal");
                      } catch (err) {
                        toast.error(
                          "Failed to book your seat. Please try again."
                        );
                      } finally {
                        setIsOptingIn(false);
                      }
                    }}
                  >
                    {isOptingIn ? "Booking..." : "Book My Seat"}
                  </button>
                </div>
              )}
              {/* Step 2: Meal Preference */}
              {step === "meal" && (
                <div className="w-full">
                  <div className="text-2xl font-extrabold text-gray-900 mb-4 text-center font-sans">
                    Select Your Meal Preference
                  </div>
                  <div className="flex gap-4 mb-6 justify-center">
                    <button
                      className={`px-8 py-4 rounded-xl border-2 font-bold text-lg font-sans transition-all ${
                        mealPref === "Veg"
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-red-300"
                      }`}
                      onClick={() => setMealPref("Veg")}
                    >
                      Veg
                    </button>
                    <button
                      className={`px-8 py-4 rounded-xl border-2 font-bold text-lg font-sans transition-all ${
                        mealPref === "Non-Veg"
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-red-300"
                      }`}
                      onClick={() => setMealPref("Non-Veg")}
                    >
                      Non-Veg
                    </button>
                  </div>
                  <button
                    className="w-full py-3 rounded-full bg-gradient-to-r from-red-500 to-red-700 text-white font-bold text-lg shadow-lg hover:scale-105 transition-all font-sans"
                    disabled={!mealPref}
                    onClick={() => mealPref && setStep("membership")}
                  >
                    Next
                  </button>
                </div>
              )}
              {/* Step 3: Membership Selection */}
              {step === "membership" && (
                <div className="w-full">
                  <div className="text-2xl font-extrabold text-gray-900 mb-4 text-center font-sans">
                    Choose Membership
                  </div>
                  <div className="flex flex-col gap-4 mb-6">
                    {MEMBERSHIP_PLANS.map((plan) => (
                      <button
                        key={plan.id}
                        className={`w-full p-5 rounded-2xl border-2 flex justify-between items-center text-left transition-all shadow bg-white font-sans ${
                          selectedMembership?.id === plan.id
                            ? "border-red-500 ring-2 ring-red-400"
                            : "border-gray-200 hover:border-red-300"
                        }`}
                        style={{ fontWeight: 600, fontSize: "1.1rem" }}
                        onClick={() => setSelectedMembership(plan)}
                      >
                        <span className="font-bold text-lg text-gray-900">
                          {plan.name}
                        </span>
                        <span className="font-bold text-red-600 text-lg">
                          ${plan.price}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    className="w-full py-3 rounded-full bg-gradient-to-r from-red-500 to-red-700 text-white font-bold text-lg shadow-lg hover:scale-105 transition-all font-sans"
                    disabled={!selectedMembership}
                    onClick={() => selectedMembership && setStep("payment")}
                  >
                    Next
                  </button>
                </div>
              )}
              {/* Step 4: Payment Gateway */}
              {step === "payment" && (
                <div className="w-full">
                  <div className="text-2xl font-extrabold text-gray-900 mb-4 text-center font-sans">
                    Payment Details
                  </div>
                  <div className="flex flex-col gap-4 mb-6">
                    <input
                      type="text"
                      placeholder="Card Number"
                      value={cardDetails.number}
                      onChange={(e) =>
                        setCardDetails((cd) => ({
                          ...cd,
                          number: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 outline-none font-sans text-lg font-semibold"
                    />
                    <div className="flex gap-4">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) =>
                          setCardDetails((cd) => ({
                            ...cd,
                            expiry: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 outline-none font-sans text-lg font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        value={cardDetails.cvv}
                        onChange={(e) =>
                          setCardDetails((cd) => ({
                            ...cd,
                            cvv: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 outline-none font-sans text-lg font-semibold"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Cardholder Name"
                      value={cardDetails.name}
                      onChange={(e) =>
                        setCardDetails((cd) => ({
                          ...cd,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 outline-none font-sans text-lg font-semibold"
                    />
                  </div>
                  <button
                    className="w-full py-3 rounded-full bg-gradient-to-r from-red-500 to-red-700 text-white font-bold text-lg shadow-lg hover:scale-105 transition-all font-sans"
                    disabled={
                      isProcessing ||
                      !cardDetails.number ||
                      !cardDetails.expiry ||
                      !cardDetails.cvv ||
                      !cardDetails.name
                    }
                    onClick={() => {
                      setIsProcessing(true);
                      setTimeout(() => {
                        setIsProcessing(false);
                        setStep("success");
                      }, 2000);
                    }}
                  >
                    {isProcessing ? "Processing..." : "Pay Now"}
                  </button>
                </div>
              )}
              {/* Step 5: Success */}
              {step === "success" && (
                <div className="w-full text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2 font-sans">
                    Booking Confirmed!
                  </h2>
                  <p className="text-gray-600 mb-6 font-semibold">
                    Your dinner is scheduled and payment is successful.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                    <h4 className="font-bold text-green-800 mb-2 font-sans">
                      Booking Details
                    </h4>
                    <div className="text-sm text-green-700 space-y-1 font-semibold">
                      <div>
                        Date:{" "}
                        {selectedDate?.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div>Meal: {mealPref}</div>
                      <div>Membership: {selectedMembership?.name}</div>
                      <div>Payment: ${selectedMembership?.price}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 font-sans">
                    You'll receive a confirmation email shortly.
                  </p>
                </div>
              )}
            </>
          )}
          {activeTab === "bookings" && (
            <div className="w-full flex flex-col items-center justify-center min-h-[300px]">
              {bookingsLoading ? (
                <div className="text-lg font-semibold text-gray-500 mt-12">
                  Loading bookings...
                </div>
              ) : bookingsError ? (
                <div className="text-lg font-semibold text-red-500 mt-12">
                  {bookingsError}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-lg font-semibold text-gray-500 mt-12">
                  No bookings yet.
                </div>
              ) : (
                <div className="w-full max-w-md mx-auto mt-6">
                  {bookings.map((booking, idx) => (
                    <div
                      key={booking.id || idx}
                      className="bg-white rounded-xl shadow p-4 mb-4 border border-gray-200"
                    >
                      <div className="font-bold text-lg text-red-700 mb-1">
                        {booking.date
                          ? new Date(booking.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })
                          : "Dinner"}
                      </div>
                      <div className="text-gray-700 text-sm mb-1">
                        Status:{" "}
                        <span className="font-semibold">
                          {booking.status || "confirmed"}
                        </span>
                      </div>
                      <div className="text-gray-700 text-sm">
                        Group ID: {booking.id || booking._id || "N/A"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === "notifications" && (
            <div className="w-full flex flex-col items-center justify-center min-h-[300px]">
              <div className="text-lg font-semibold text-gray-500 mt-12">
                No notifications yet.
              </div>
            </div>
          )}
          {activeTab === "profile" && (
            <div className="w-full flex flex-col items-center">
              {profileLoading ? (
                <div className="text-lg font-semibold text-gray-500 mt-12">
                  Loading profile...
                </div>
              ) : profileError ? (
                <div className="text-lg font-semibold text-red-500 mt-12">
                  {profileError}
                </div>
              ) : (
                <>
                  <div className="font-bold text-xl mb-4">Profile</div>
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-4xl text-gray-600"
                      />
                    </div>
                    <div className="font-medium text-lg mb-2">
                      {profile.name}
                    </div>
                    <div className="text-gray-500 text-sm mb-2">
                      {profile.email}
                    </div>
                  </div>
                  <div className="w-full flex flex-col gap-4 mb-4">
                    <button
                      onClick={() => setShowEditProfile(true)}
                      className="flex items-center justify-between w-full bg-[#fef7ed] border border-gray-300 rounded-xl px-4 py-4 font-semibold text-left hover:bg-gray-100 transition"
                    >
                      <span className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faEdit} className="text-lg" />{" "}
                        Edit Profile
                      </span>
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-gray-500"
                      />
                    </button>
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className="flex items-center justify-between w-full bg-[#fef7ed] border border-gray-300 rounded-xl px-4 py-4 font-semibold text-left hover:bg-gray-100 transition"
                    >
                      <span className="flex items-center gap-3">
                        <FontAwesomeIcon
                          icon={faCalendar}
                          className="text-lg"
                        />{" "}
                        Your Bookings
                      </span>
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-gray-500"
                      />
                    </button>
                    <button
                      onClick={() => setShowHelp(true)}
                      className="flex items-center justify-between w-full bg-[#fef7ed] border border-gray-300 rounded-xl px-4 py-4 font-semibold text-left hover:bg-gray-100 transition"
                    >
                      <span className="flex items-center gap-3">
                        <FontAwesomeIcon
                          icon={faQuestionCircle}
                          className="text-lg"
                        />{" "}
                        Help Center
                      </span>
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-gray-500"
                      />
                    </button>
                    <button
                      onClick={() => setShowGuide(true)}
                      className="flex items-center justify-between w-full bg-[#fef7ed] border border-gray-300 rounded-xl px-4 py-4 font-semibold text-left hover:bg-gray-100 transition"
                    >
                      <span className="flex items-center gap-3">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="text-lg"
                        />{" "}
                        Guide
                      </span>
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-gray-500"
                      />
                    </button>
                    <button
                      onClick={() => setShowDelete(true)}
                      className="flex items-center justify-between w-full bg-[#fef7ed] border border-red-300 text-red-600 rounded-xl px-4 py-4 font-semibold text-left hover:bg-red-50 transition"
                    >
                      <span className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faTrash} className="text-lg" />{" "}
                        Delete My Account
                      </span>
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-red-400"
                      />
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-between w-full bg-[#fef7ed] border border-gray-300 rounded-xl px-4 py-4 font-semibold text-left hover:bg-gray-100 transition"
                    >
                      <span className="flex items-center gap-3">
                        <FontAwesomeIcon
                          icon={faSignOutAlt}
                          className="text-lg"
                        />{" "}
                        Log Out
                      </span>
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-gray-500"
                      />
                    </button>
                  </div>
                  {/* Edit Profile Modal */}
                  {showEditProfile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                      <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full p-6 relative animate-fadeInUp">
                        <button
                          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
                          onClick={() => setShowEditProfile(false)}
                        >
                          &times;
                        </button>
                        <div className="font-bold text-xl mb-4 text-gray-900 flex items-center">
                          <FontAwesomeIcon icon={faEdit} className="mr-2" />
                          Edit Profile
                        </div>
                        <input
                          type="text"
                          className="w-full border rounded p-2 mb-3"
                          placeholder="Name"
                          value={editProfile.name}
                          onChange={(e) =>
                            setEditProfile((p) => ({
                              ...p,
                              name: e.target.value,
                            }))
                          }
                        />
                        <input
                          type="email"
                          className="w-full border rounded p-2 mb-4"
                          placeholder="Email"
                          value={editProfile.email}
                          onChange={(e) =>
                            setEditProfile((p) => ({
                              ...p,
                              email: e.target.value,
                            }))
                          }
                        />
                        <button
                          className="w-full py-2 rounded bg-red-500 text-white font-bold hover:bg-red-600"
                          onClick={handleProfileSave}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Help Center Modal */}
                  {showHelp && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeInUp">
                        <button
                          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
                          onClick={() => setShowHelp(false)}
                        >
                          &times;
                        </button>
                        <div className="font-bold text-xl mb-4 text-gray-900 flex items-center">
                          <FontAwesomeIcon
                            icon={faQuestionCircle}
                            className="mr-2"
                          />
                          Help Center
                        </div>
                        <div className="text-gray-700 mb-2">
                          For any questions, please check our FAQ or contact
                          support at{" "}
                          <a
                            href="mailto:support@bichance.com"
                            className="text-red-500 underline"
                          >
                            support@bichance.com
                          </a>
                          .
                        </div>
                        <ul className="list-disc pl-5 text-gray-700 mb-2">
                          <li>How do I book a dinner?</li>
                          <li>How do I change my profile?</li>
                          <li>How do I cancel a booking?</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  {/* Guide Modal */}
                  {showGuide && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeInUp">
                        <button
                          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
                          onClick={() => setShowGuide(false)}
                        >
                          &times;
                        </button>
                        <div className="font-bold text-xl mb-4 text-gray-900 flex items-center">
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="mr-2"
                          />
                          How Bichance Table Works
                        </div>
                        <ol className="list-decimal pl-5 text-gray-700 space-y-2">
                          <li>Sign up and create your profile.</li>
                          <li>Browse and book upcoming Wednesday dinners.</li>
                          <li>Select your meal preference and membership.</li>
                          <li>Pay securely with your card.</li>
                          <li>Join the dinner, meet new people, and enjoy!</li>
                        </ol>
                      </div>
                    </div>
                  )}
                  {/* Delete Account Modal */}
                  {showDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                      <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full p-6 relative animate-fadeInUp">
                        <button
                          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
                          onClick={() => setShowDelete(false)}
                        >
                          &times;
                        </button>
                        <div className="font-bold text-xl mb-4 text-gray-900 flex items-center">
                          <FontAwesomeIcon icon={faTrash} className="mr-2" />
                          Delete My Account
                        </div>
                        {deleteSuccess ? (
                          <div className="text-green-600 font-bold text-center">
                            Account deleted successfully.
                          </div>
                        ) : (
                          <>
                            <div className="text-gray-700 mb-4">
                              Are you sure you want to delete your account? This
                              action cannot be undone.
                            </div>
                            <button
                              className="w-full py-2 rounded bg-red-500 text-white font-bold hover:bg-red-600 mb-2"
                              onClick={handleDeleteAccount}
                              disabled={deleteSuccess}
                            >
                              {deleteSuccess
                                ? "Deleting..."
                                : "Yes, Delete My Account"}
                            </button>
                            <button
                              className="w-full py-2 rounded bg-gray-200 text-gray-800 font-bold hover:bg-gray-300"
                              onClick={() => setShowDelete(false)}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Bottom Navigation Bar */}
        <div className="w-full max-w-2xl flex justify-between items-center bg-white border-t border-gray-200 px-6 py-3 rounded-b-xl">
          <button
            className={`flex flex-col items-center text-gray-700 hover:text-red-600 focus:outline-none ${
              activeTab === "home" ? "text-red-600" : ""
            }`}
            onClick={() => setActiveTab("home")}
          >
            <FontAwesomeIcon icon={faHouse} className="text-2xl" />
          </button>
          <button
            className={`flex flex-col items-center text-gray-700 hover:text-red-600 focus:outline-none ${
              activeTab === "notifications" ? "text-red-600" : ""
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            <FontAwesomeIcon icon={faBell} className="text-2xl" />
          </button>
          <button
            className={`flex flex-col items-center text-gray-700 hover:text-red-600 focus:outline-none ${
              activeTab === "bookings" ? "text-red-600" : ""
            }`}
            onClick={() => setActiveTab("bookings")}
          >
            <FontAwesomeIcon icon={faCalendar} className="text-2xl" />
          </button>
          <button
            className={`flex flex-col items-center text-gray-700 hover:text-red-600 focus:outline-none ${
              activeTab === "profile" ? "text-red-600" : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <FontAwesomeIcon icon={faUser} className="text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
}
