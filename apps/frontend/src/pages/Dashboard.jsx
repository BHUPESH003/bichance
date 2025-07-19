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
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

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
  if (!response.ok) {
    let msg = "Failed to opt-in for dinner";
    try {
      const data = await response.json();
      console.log("Opt-in API error:", data); // <--- log backend error
      if (data.detail) msg = data.detail;
    } catch (e) {
      console.log("Opt-in API error (no JSON):", e);
    }
    throw new Error(msg);
  }
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

// Fetch opted-in dinners for the user
async function fetchOptedInDinners(token) {
  const response = await fetch(
    "https://bichance-production-a30f.up.railway.app/api/v1/dinner/dinners/user-view",
    {
      headers: {
        accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch opted-in dinners");
  const data = await response.json();
  return data.data || [];
}

// Fix MEMBERSHIP_PLANS to use numbers only for price
const MEMBERSHIP_PLANS = [
  { id: "1m", name: "1 Month", price: 1099 },
  { id: "3m", name: "3 Months", price: 2999 },
  { id: "6m", name: "12 Months", price: 10550 },
];

const PLAN_PRICE_IDS = {
  monthly: "price_1RisNDSGp7YEjcqZBloeFYAC",
  quarterly: "price_1RisNXSGp7YEjcqZHzL4zJCP",
  yearly: "price_1RisO2SGp7YEjcqZDDccoJsl",
};

// Helper: Map profile fields to journey question_keys
const FIELD_TO_QUESTION_KEY = {
  city: "current_city",
  country: "current_country",
  dob: "dob",
  gender: "gender",
  relationship_status: "relationship_status",
  profession: "profession",
  children: "children",
};

// Helper: Save a single field to journey
async function saveJourneyField(token, key, value, questionText) {
  // Convert children to string 'true'/'false'
  let answer = value;
  if (key === "children") answer = value ? "true" : "false";
  if (key === "dob" && value) answer = value.slice(0, 10); // Ensure YYYY-MM-DD
  const res = await fetch(
    "https://bichance-production-a30f.up.railway.app/api/v1/journey/save",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        question_key: key,
        answer,
        question: questionText,
      }),
    }
  );
  if (!res.ok) {
    let msg = "Failed to update " + key;
    try {
      const data = await res.json();
      if (data.detail) msg += ": " + data.detail;
    } catch {}
    throw new Error(msg);
  }
}

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
  const [selectedPlan, setSelectedPlan] = useState("monthly"); // default plan
  // Add a state to track subscription status
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [optedInDinners, setOptedInDinners] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationInput, setLocationInput] = useState({
    city: profile.city || profile.current_city || "",
    country: profile.country || profile.current_country || "",
  });
  const [locationImg, setLocationImg] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const redirectTimeoutRef = useRef(null);
  const [showActions, setShowActions] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  // Update handleProfileSave to send each field as a journey/save POST
  const handleProfileSave = async () => {
    setShowEditProfile(false);
    const updates = [];
    // Only send allowed fields
    for (const [field, key] of Object.entries(FIELD_TO_QUESTION_KEY)) {
      if (
        editProfile[field] !== undefined &&
        editProfile[field] !== profile[field]
      ) {
        updates.push(saveJourneyField(token, key, editProfile[field]));
      }
    }
    // Personality answers
    if (
      editProfile.personality_answers &&
      Array.isArray(editProfile.personality_answers)
    ) {
      editProfile.personality_answers.forEach((ans, idx) => {
        if (
          !profile.personality_answers ||
          profile.personality_answers[idx]?.answer !== ans.answer
        ) {
          updates.push(
            saveJourneyField(token, `q${idx}`, ans.answer, ans.question)
          );
        }
      });
    }
    try {
      await Promise.all(updates);
      toast.success("Profile updated successfully!");
      setProfile(editProfile);
    } catch (err) {
      toast.error("Failed to update profile: " + err.message);
    }
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

  // Fetch profile and check subscription status on mount
  useEffect(() => {
    async function fetchProfileAndSubscription() {
      setProfileLoading(true);
      setProfileError("");
      try {
        const data = await fetchUserProfile(token);
        setProfile(data);
        setEditProfile(data);
        console.log(data);
        // Check for active subscription (adjust field as per backend response)
        if (data && data.subscription_status === "active") {
          setHasActiveSubscription(true);
        } else {
          setHasActiveSubscription(false);
        }
      } catch (err) {
        setProfileError(err.message);
      } finally {
        setProfileLoading(false);
      }
    }
    fetchProfileAndSubscription();
    // eslint-disable-next-line
  }, [token]);

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

  // Fetch opted-in dinners on mount or when token changes
  useEffect(() => {
    if (!token) return;
    fetchOptedInDinners(token)
      .then((data) => {
        setOptedInDinners(data);
        // If user has opted-in dinners, set step to 'manage' and select the first dinner
        if (data && data.length > 0) {
          setSelectedDate(data[0]);
          setStep("manage");
        }
      })
      .catch((err) => console.log("Failed to fetch opted-in dinners:", err));
  }, [token]);

  // Helper: get image for city
  function getCityImage(city) {
    // You can expand this map as needed
    const map = {
      delhi: "/4.jpg",
      mumbai: "/5.jpg",
      bangalore: "/6.webp",
      london: "/hero.jpg",
      // ... add more cities and images
    };
    if (!city) return "/l1.png";
    const key = city.toLowerCase();
    return map[key] || "/l1.png";
  }
  // Update location image when city changes
  useEffect(() => {
    const city = profile.city || profile.current_city;
    setLocationImg(getCityImage(city));
  }, [profile.city, profile.current_city]);

  // Show splash screen only on first dashboard load after login
  useEffect(() => {
    // Only show splash if just logged in (e.g., on mount)
    setShowSplash(true);
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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
    navigate("/signin");
  };

  // Add useEffect for redirect after booking success
  useEffect(() => {
    if (step === "success") {
      redirectTimeoutRef.current = setTimeout(() => {
        setStep("manage"); // Go to event details step
      }, 1500); // 1.5 seconds
    }
    return () => {
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, [step]);

  return (
    <div
      className="flex flex-col items-center bg-[#fef7ed] px-0 py-0"
      style={{
        height: "100vh",
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Splash Screen */}
      {showSplash && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
          <img
            src="/l1.png"
            alt="Bichance Table Logo"
            className="w-24 h-24 mb-6"
          />
          <div className="text-3xl font-extrabold text-red-700 mb-2 text-center">
            Welcome to Bichance Tables
          </div>
        </div>
      )}
      <div
        className="w-full max-w-2xl flex flex-col flex-1 bg-[#fef7ed] rounded-xl shadow-2xl border border-white/30 items-center relative z-10"
        style={{
          height: "100%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          paddingBottom: "80px",
        }}
      >
        {/* Back button above header for steps after the first */}
        {activeTab === "home" && step !== "dinner" && step !== "manage" && (
          <button
            onClick={() => {
              setStep("dinner");
              setSelectedPlan(null);
              setSelectedDate(null);
            }}
            className="flex items-center gap-2 text-gray-700 hover:text-red-600 font-bold text-lg mt-4 mb-2 ml-4 self-start focus:outline-none"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
            Back
          </button>
        )}
        {/* Main Content Area */}
        <div className="flex-1 w-full flex flex-col items-center justify-start px-4 py-4 overflow-auto">
          {activeTab === "home" && (
            <>
              {/* Step 1: Upcoming Wednesday Dinners */}
              {step === "dinner" && (
                <div
                  className="w-full p-0 m-0"
                  style={{ marginTop: 0, paddingTop: 0 }}
                >
                  {/* Location Card */}
                  <div
                    className="overflow-hidden relative p-0 m-0 w-full max-w-2xl"
                    style={{
                      width: "100%",
                      height: "150px",
                      position: "relative",
                      borderRadius: 0,
                      margin: 0,
                      padding: 0,
                      boxShadow: "none",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    <img
                      src={locationImg}
                      alt="Location"
                      className="absolute inset-0 object-cover w-full h-full"
                      style={{
                        zIndex: 1,
                        borderRadius: 0,
                        width: "100%",
                        height: "100%",
                        left: 0,
                        top: 0,
                        margin: 0,
                        padding: 0,
                      }}
                    />
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center"
                      style={{ zIndex: 2, background: "rgba(0,0,0,0.35)" }}
                    >
                      <div className="flex flex-col items-center w-full mt-0">
                        {/* City pill/badge at top, transparent, with location icon and hover effect */}
                        <div className="flex justify-center w-full mt-0">
                          <span
                            className="bg-white/50 text-gray-900 font-bold rounded-full px-4 py-1 text-xs uppercase tracking-widest shadow transition-transform duration-150 hover:scale-105 hover:bg-white/70 flex items-center gap-2"
                            style={{
                              cursor: "pointer",
                              backdropFilter: "blur(2px)",
                            }}
                            onClick={() => {
                              setLocationInput({
                                city:
                                  profile.city || profile.current_city || "",
                                country:
                                  profile.country ||
                                  profile.current_country ||
                                  "",
                              });
                              setShowLocationModal(true);
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faMapMarkerAlt}
                              className="text-red-500 text-sm"
                            />
                            {profile.city || profile.current_city || "CITY"}
                          </span>
                        </div>
                        {/* Country/State below city, uppercase */}
                        <div className="text-white font-bold text-xs md:text-sm text-center mt-2 mb-1 drop-shadow-lg tracking-widest uppercase">
                          {(profile.state || profile.current_state || "") &&
                          (profile.country || profile.current_country || "")
                            ? `${(
                                profile.state ||
                                profile.current_state ||
                                ""
                              ).toUpperCase()}, ${(
                                profile.country ||
                                profile.current_country ||
                                ""
                              ).toUpperCase()}`
                            : (
                                profile.country ||
                                profile.current_country ||
                                "COUNTRY"
                              ).toUpperCase()}
                        </div>
                        {/* Change location link, smaller size, hover effect */}
                        <button
                          className="text-white underline font-bold text-xs md:text-sm text-center drop-shadow-lg mt-1 transition-transform duration-150 hover:scale-105 hover:text-gray-200"
                          style={{ fontWeight: 600 }}
                          onClick={() => {
                            setLocationInput({
                              city: profile.city || profile.current_city || "",
                              country:
                                profile.country ||
                                profile.current_country ||
                                "",
                            });
                            setShowLocationModal(true);
                          }}
                        >
                          Change location
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Location Modal */}
                  {showLocationModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                      <div className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-xs p-4 relative animate-fadeInUp flex flex-col">
                        <button
                          className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-xl"
                          onClick={() => setShowLocationModal(false)}
                        >
                          &times;
                        </button>
                        <div className="font-bold text-lg mb-2 text-gray-900">
                          Change Location
                        </div>
                        <input
                          type="text"
                          className="w-full border rounded p-2 mb-2"
                          placeholder="City"
                          value={locationInput.city}
                          onChange={(e) =>
                            setLocationInput((l) => ({
                              ...l,
                              city: e.target.value,
                            }))
                          }
                        />
                        <input
                          type="text"
                          className="w-full border rounded p-2 mb-2"
                          placeholder="Country"
                          value={locationInput.country}
                          onChange={(e) =>
                            setLocationInput((l) => ({
                              ...l,
                              country: e.target.value,
                            }))
                          }
                        />
                        <button
                          className="w-full py-2 rounded bg-red-500 text-white font-bold hover:bg-red-600 mt-2 mb-1 text-sm"
                          onClick={async () => {
                            try {
                              await saveJourneyField(
                                token,
                                "current_city",
                                locationInput.city,
                                "Current City"
                              );
                              await saveJourneyField(
                                token,
                                "current_country",
                                locationInput.country,
                                "Current Country"
                              );
                              setProfile((p) => ({
                                ...p,
                                city: locationInput.city,
                                country: locationInput.country,
                                current_city: locationInput.city,
                                current_country: locationInput.country,
                              }));
                              setShowLocationModal(false);
                              setLocationImg(getCityImage(locationInput.city));
                              toast.success("Location updated!");
                            } catch (err) {
                              toast.error(
                                "Failed to update location: " + err.message
                              );
                            }
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                  {/* End Location Modal */}
                  {/* Headings below image, as in second screenshot */}
                  <div className="text-2xl font-extrabold text-gray-900 mb-1 text-center font-sans mt-4">
                    Book your next event
                  </div>
                  <div className="text-base font-semibold text-black mb-6 text-center">
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
                    {dinners.map((dinner, idx) => {
                      const isOptedIn = optedInDinners.some(
                        (opted) =>
                          opted.dinner_id === dinner.id ||
                          opted.id === dinner.id
                      );
                      return (
                        <button
                          key={dinner.id || idx}
                          onClick={() => {
                            if (isOptedIn) return;
                            setSelectedDate(dinner);
                            if (hasActiveSubscription) {
                              setStep("meal");
                            } else {
                              setStep("plan");
                            }
                          }}
                          disabled={isOptedIn}
                          className={`w-full p-5 rounded-2xl border-2 flex justify-between items-center text-left transition-all shadow-md bg-white font-sans ${
                            selectedDate && selectedDate.id === dinner.id
                              ? "border-red-500 ring-2 ring-red-400"
                              : isOptedIn
                              ? "border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed"
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
                          {isOptedIn ? (
                            <span className="ml-2 px-3 py-1 rounded-full bg-green-200 text-green-800 text-xs font-bold">
                              Already Booked
                            </span>
                          ) : (
                            selectedDate &&
                            selectedDate.id === dinner.id && (
                              <span className="w-4 h-4 bg-red-500 rounded-full ml-2 border-2 border-white" />
                            )
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Step 2: Plan Selection as Cards */}
              {step === "plan" && selectedDate && !hasActiveSubscription && (
                <div className="w-full animate-fadeInUp ">
                  <div className="text-2xl font-extrabold text-gray-900 mb-4 text-center font-sans">
                    Choose your subscription plan for dining
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {MEMBERSHIP_PLANS.map((plan, idx) => {
                      // Map plan.id to PLAN_PRICE_IDS key
                      const planKey =
                        plan.id === "1m"
                          ? "monthly"
                          : plan.id === "3m"
                          ? "quarterly"
                          : "yearly";
                      return (
                        <button
                          key={plan.id}
                          onClick={() => setSelectedPlan(planKey)}
                          className={`flex flex-col items-center p-3 md:p-5 border-0 border-t-2 border-b-2 border-l-2 border-r-2 shadow-lg transition-all bg-white hover:scale-105 ${
                            selectedPlan === planKey
                              ? "border-red-500 ring-2 ring-red-400"
                              : "border-gray-200 hover:border-red-300"
                          }`}
                          style={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            height: "auto",
                            minHeight: "180px",
                            borderRadius: 0,
                          }}
                        >
                          <img
                            src={`/${["l1.png", "4.jpg", "5.jpg"][idx % 3]}`}
                            alt={plan.name}
                            className="w-full h-24 md:h-32 object-cover mb-2 md:mb-4 border-0"
                          />
                          <div className="font-bold text-base md:text-lg text-gray-900 mb-1 md:mb-2">
                            {plan.name}
                          </div>
                          <div className="text-gray-600 text-xs md:text-sm mb-1 text-center">
                            {plan.id === "1m" &&
                              "Perfect for trying out Bichance. Attend all events for a month."}
                            {plan.id === "3m" &&
                              "Best value! Unlimited dinners for 3 months. Meet more people, more often."}
                            {plan.id === "6m" &&
                              "For the true connector. Premium access to all events for 6 months."}
                          </div>
                          <ul className="text-gray-500 text-xs md:text-sm list-disc pl-4 text-left mb-1">
                            <li>Access to exclusive dinners</li>
                            <li>Personalized matches</li>
                            <li>Member-only offers</li>
                          </ul>
                          <div
                            className="font-extrabold text-xl md:text-2xl mb-1"
                            style={{
                              color: "#111",
                              fontWeight: 700,
                              fontFamily: "Montserrat, Arial, sans-serif",
                            }}
                          >
                            ₹ {plan.price}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mb-2" />
                  <button
                    className={`w-full mt-2 py-3 rounded-full bg-gradient-to-r from-red-500 to-red-700 text-white font-bold text-lg shadow-lg transition-all font-sans animate-fadeInUp ${
                      !selectedPlan
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:scale-105"
                    }`}
                    disabled={!selectedPlan || isOptingIn}
                    onClick={async () => {
                      if (!selectedPlan) return;
                      setIsOptingIn(true);
                      try {
                        const priceId = PLAN_PRICE_IDS[selectedPlan];
                        if (!priceId) {
                          toast.error(
                            "No price_id found for this plan. Please contact support."
                          );
                          setIsOptingIn(false);
                          return;
                        }
                        // Store dinner id for opt-in after payment
                        localStorage.setItem(
                          "pending_dinner_id",
                          selectedDate.id
                        );
                        const response = await fetch(
                          "https://bichance-production-a30f.up.railway.app/api/v1/subscription/create-checkout-session",
                          {
                            method: "POST",
                            headers: {
                              accept: "application/json",
                              "Content-Type": "application/json",
                              ...(token
                                ? { Authorization: `Bearer ${token}` }
                                : {}),
                            },
                            body: JSON.stringify({ price_id: priceId }),
                          }
                        );
                        if (!response.ok)
                          throw new Error("Failed to create checkout session");
                        const data = await response.json();
                        if (data && (data.checkout_url || data.session_url)) {
                          window.location.href =
                            data.checkout_url || data.session_url;
                        } else {
                          toast.error("No checkout URL returned.");
                        }
                      } catch (err) {
                        toast.error(
                          "Failed to start checkout. Please try again."
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
                    disabled={!mealPref || isOptingIn}
                    onClick={async () => {
                      if (!mealPref) return;
                      if (hasActiveSubscription) {
                        // Book the dinner directly
                        try {
                          setIsOptingIn(true);
                          await optInDinner(
                            selectedDate.id,
                            "standard", // or collect from user
                            mealPref.toLowerCase(),
                            token
                          );
                          // Refetch opted-in dinners and bookings after booking
                          const [updatedOptedIn, updatedBookings] =
                            await Promise.all([
                              fetchOptedInDinners(token),
                              fetchMyBookings(token),
                            ]);
                          setOptedInDinners(updatedOptedIn);
                          setBookings(updatedBookings);
                          setStep("success");
                          toast.success("Dinner booked successfully!");
                        } catch (err) {
                          if (err.message === "Already opted in") {
                            toast.error("You have already booked this dinner.");
                            setStep("success"); // Optionally, go to success step anyway
                            setActiveTab("bookings"); // Redirect to bookings tab
                          } else {
                            toast.error(
                              "Failed to book dinner: " + err.message
                            );
                          }
                        } finally {
                          setIsOptingIn(false);
                        }
                      } else {
                        setStep("membership");
                      }
                    }}
                  >
                    {isOptingIn ? "Booking..." : "Next"}
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
                <>
                  {/* Overlay for loading effect */}
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mb-4"></div>
                      <div className="text-xl font-bold text-white mb-2 animate-pulse">
                        Redirecting to your dashboard...
                      </div>
                      <div className="text-base text-gray-200">
                        Please wait while we confirm your booking.
                      </div>
                    </div>
                  </div>
                  <div className="w-full text-center relative z-10">
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
                          {selectedDate?.date
                            ? new Date(selectedDate.date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : ""}
                        </div>
                        <div>Meal: {mealPref}</div>
                        <div>Membership: {selectedMembership?.name}</div>
                        <div>Payment: ${selectedMembership?.price}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center mt-4 opacity-0 pointer-events-none">
                      {/* Old spinner and redirect message hidden, replaced by overlay */}
                    </div>
                  </div>
                </>
              )}
              {step === "manage" && optedInDinners.length > 0 && (
                <div className="h-screen flex flex-col bg-[#fef7ed] w-full">
                  <div className="flex-1 flex flex-col items-center w-full">
                    <div className="w-full max-w-md mx-auto flex-1 flex flex-col overflow-y-auto p-0 pb-32 gap-4">
                      <div className="text-2xl font-bold text-center py-4">
                        Your booked dinners
                      </div>
                      {optedInDinners.map((dinner, idx) => {
                        return (
                          <React.Fragment key={dinner.dinner_id || idx}>
                            {/* Event Card */}
                            <div className="rounded-2xl border border-gray-300 p-4 bg-white mb-4">
                              <div className="flex items-center mb-2">
                                <div className="bg-green-700 text-white rounded-full px-3 py-1 text-sm font-bold mr-2 flex items-center">
                                  <span className="mr-1">✔</span> Your seat is
                                  confirmed
                                </div>
                                <span className="ml-2 text-lg">🍲 Dinner</span>
                              </div>
                              <hr className="my-2" />
                              <div className="mb-2">
                                <span className="font-semibold">Date</span>
                                <br />
                                <span className="font-bold">
                                  {dinner.date
                                    ? new Date(dinner.date).toLocaleDateString(
                                        "en-US",
                                        {
                                          weekday: "long",
                                          month: "short",
                                          day: "numeric",
                                        }
                                      )
                                    : ""}
                                </span>
                              </div>
                              <div className="mb-2">
                                <span className="font-semibold">Location</span>
                                <br />
                                <span className="font-bold">
                                  {dinner.city || "City"} |{" "}
                                  {dinner.country || "Country"}
                                </span>
                              </div>
                              <button
                                className="w-full mt-2 py-2 rounded-xl border border-gray-400 text-lg font-bold hover:bg-gray-100 transition"
                                onClick={() => setShowActions((prev) => !prev)}
                              >
                                Manage reservation
                              </button>
                              {showActions && (
                                <div className="flex flex-col gap-2 mt-6 mb-4">
                                  <button
                                    className="w-full py-3 rounded-full bg-black text-white text-lg font-bold flex items-center justify-center"
                                    onClick={() => setStep("confirmed")}
                                  >
                                    <span>Confirm my presence</span>
                                    <span className="ml-2">✔</span>
                                  </button>
                                  <button className="w-full py-3 rounded-full border border-black text-black text-lg font-bold bg-white">
                                    I'll be late
                                  </button>
                                  <button
                                    className="w-full py-2 rounded bg-gray-200 text-gray-800 font-bold hover:bg-gray-300"
                                    onClick={() => {
                                      setStep("dinner");
                                      setSelectedDate(null);
                                      setMealPref("");
                                      setSelectedMembership(null);
                                      setCardDetails({
                                        number: "",
                                        expiry: "",
                                        cvv: "",
                                        name: "",
                                      });
                                      setIsProcessing(false);
                                    }}
                                  >
                                    Return to Dashboard
                                  </button>
                                </div>
                              )}
                            </div>
                            {/* Group Card - only if matched */}
                            {dinner.matched && dinner.group && (
                              <div className="rounded-2xl border border-gray-300 p-4 bg-white mb-4">
                                <div className="bg-orange-500 text-white rounded-full px-3 py-1 text-sm font-bold mb-2 inline-block">
                                  ⏲ Your group
                                </div>
                                <div className="mb-2">
                                  Group ID:{" "}
                                  <span className="font-bold">
                                    {dinner.group.group_id}
                                  </span>
                                </div>
                                <div className="mb-2">
                                  Match Score:{" "}
                                  <span className="font-bold">
                                    {dinner.group.match_score}%
                                  </span>
                                </div>
                                {/* Static group stats */}
                                <div className="mt-2">
                                  <div className="font-semibold">
                                    Industries:
                                  </div>
                                  <div>
                                    <span className="font-bold">
                                      Technology: 67%
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-bold">
                                      Services: 17%
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-bold">
                                      Not working: 17%
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <div className="font-semibold">
                                    Nationalities:
                                  </div>
                                  <div>
                                    <span className="font-bold">
                                      India 🇮🇳: 83%
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-bold">
                                      Canada 🇨🇦: 17%
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <div className="font-semibold">Language</div>
                                  <div className="font-bold">English</div>
                                </div>
                              </div>
                            )}
                            {/* Restaurant Card - only if matched */}
                            {dinner.matched && dinner.group && (
                              <div className="rounded-2xl border border-gray-300 p-4 bg-white mb-4">
                                <div className="bg-green-700 text-white rounded-full px-3 py-1 text-sm font-bold mb-2 inline-block">
                                  ✔ Your restaurant
                                </div>
                                <div className="mb-2">
                                  <span className="font-semibold">
                                    Restaurant
                                  </span>
                                  <br />
                                  <span className="font-bold">
                                    {dinner.restaurant_name ||
                                      "The Chatter House"}
                                  </span>
                                </div>
                                <div className="mb-2">
                                  <span className="font-semibold">Address</span>
                                  <br />
                                  <span className="font-bold underline">
                                    {dinner.restaurant_address ||
                                      "58 1st & 2nd Floor, Khan Market, Rabindra Nagar, New Delhi, Delhi 110003, India"}
                                  </span>
                                </div>
                                <div className="mb-2">
                                  <span className="font-semibold">
                                    N° Table
                                  </span>
                                  <br />
                                  <span className="font-bold">
                                    {dinner.table_name || "AMAN"}
                                  </span>
                                </div>
                              </div>
                            )}
                            {/* Dinner Game Card - only if matched */}
                            {dinner.matched && (
                              <div className="rounded-2xl border border-gray-300 p-4 bg-white mb-4">
                                <div className="bg-orange-500 text-white rounded-full px-3 py-1 text-sm font-bold mb-2 inline-block">
                                  ⏲ Your dinner game
                                </div>
                                <div>
                                  Unlock the game for your dinner on
                                  <br />
                                  <span className="font-bold">
                                    {dinner.date
                                      ? new Date(
                                          dinner.date
                                        ).toLocaleDateString("en-US", {
                                          weekday: "long",
                                          month: "short",
                                          day: "numeric",
                                        })
                                      : ""}
                                  </span>
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {/* {step === "manage" && selectedDate && (
                <div className="h-screen flex flex-col bg-[#fef7ed] w-full">
                  <div className="flex-1 flex flex-col items-center w-full">
                    <div className="w-full max-w-md mx-auto flex-1 flex flex-col overflow-y-auto p-0 pb-32 gap-4">
                      <div className="text-2xl font-bold text-center py-4">
                        Your event
                      </div>
                    
                      <div className="rounded-2xl border border-gray-300 p-4 bg-white">
                        <div className="flex items-center mb-2">
                          <div className="bg-green-700 text-white rounded-full px-3 py-1 text-sm font-bold mr-2 flex items-center">
                            <span className="mr-1">✔</span> Your seat is
                            confirmed
                          </div>
                          <span className="ml-2 text-lg">🍲 Dinner</span>
                        </div>
                        <hr className="my-2" />
                        <div className="mb-2">
                          <span className="font-semibold">Date</span>
                          <br />
                          <span className="font-bold">
                            {selectedDate.date
                              ? new Date(selectedDate.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )
                              : ""}
                            {selectedDate.time ? `, ${selectedDate.time}` : ""}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Location</span>
                          <br />
                          <span className="font-bold">
                            {selectedDate.city || "New Delhi"} 🇮🇳 |{" "}
                            {selectedDate.area ||
                              selectedDate.location ||
                              "South Delhi"}
                          </span>
                        </div>
                        <button className="w-full mt-2 py-2 rounded-xl border border-gray-400 text-lg font-bold hover:bg-gray-100 transition">
                          Manage reservation
                        </button>
                      </div>
                     
                      <div className="rounded-2xl border border-gray-300 p-4 bg-white">
                        <div className="bg-orange-500 text-white rounded-full px-3 py-1 text-sm font-bold mb-2 inline-block">
                          ⏲ Your group
                        </div>
                        <div className="mb-2">
                          Find out more about your group on
                          <br />
                          <span className="font-bold">
                            Tuesday, July 8, 7:00 PM
                          </span>
                        </div>
                        
                        <div className="mt-2">
                          <div className="font-semibold">Industries:</div>
                          <div>
                            <span className="font-bold">Technology: 67%</span>
                          </div>
                          <div>
                            <span className="font-bold">Services: 17%</span>
                          </div>
                          <div>
                            <span className="font-bold">Not working: 17%</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="font-semibold">Nationalities:</div>
                          <div>
                            <span className="font-bold">India 🇮🇳: 83%</span>
                          </div>
                          <div>
                            <span className="font-bold">Canada 🇨🇦: 17%</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="font-semibold">Language</div>
                          <div className="font-bold">English</div>
                        </div>
                      </div>
                      
                      <div className="rounded-2xl border border-gray-300 p-4 bg-white">
                        <div className="bg-green-700 text-white rounded-full px-3 py-1 text-sm font-bold mb-2 inline-block">
                          ✔ Your restaurant
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Restaurant</span>
                          <br />
                          <span className="font-bold">
                            {selectedDate.restaurant_name ||
                              "The Chatter House"}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Address</span>
                          <br />
                          <span className="font-bold underline">
                            {selectedDate.restaurant_address ||
                              "58 1st & 2nd Floor, Khan Market, Rabindra Nagar, New Delhi, Delhi 110003, India"}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">N° Table</span>
                          <br />
                          <span className="font-bold">
                            {selectedDate.table_name || "AMAN"}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-gray-300 p-4 bg-white">
                        <div className="bg-orange-500 text-white rounded-full px-3 py-1 text-sm font-bold mb-2 inline-block">
                          ⏲ Your dinner game
                        </div>
                        <div>
                          Unlock the game for your dinner on
                          <br />
                          <span className="font-bold">
                            Wednesday, July 9, 8:00 PM
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 mt-6 mb-4">
                        <button
                          className="w-full py-3 rounded-full bg-black text-white text-lg font-bold flex items-center justify-center"
                          onClick={() => setStep("confirmed")}
                        >
                          <span>Confirm my presence</span>
                          <span className="ml-2">✔</span>
                        </button>
                        <button className="w-full py-3 rounded-full border border-black text-black text-lg font-bold bg-white">
                          I'll be late
                        </button>
                        <button
                          className="w-full py-2 rounded bg-gray-200 text-gray-800 font-bold hover:bg-gray-300"
                          onClick={() => {
                            setStep("dinner");
                            setSelectedDate(null);
                            setMealPref("");
                            setSelectedMembership(null);
                            setCardDetails({
                              number: "",
                              expiry: "",
                              cvv: "",
                              name: "",
                            });
                            setIsProcessing(false);
                          }}
                        >
                          Return to Dashboard
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )} */}
              {/* Add the new 'confirmed' step for orange success screen */}
              {step === "confirmed" && (
                <div
                  className="w-full min-h-screen flex flex-col items-center justify-center bg-orange-400"
                  style={{ minHeight: "100vh" }}
                >
                  <div className="flex flex-col items-center justify-center flex-1 w-full">
                    <div className="text-6xl mb-4">✔️</div>
                    <div className="text-2xl font-extrabold text-white mb-2 text-center">
                      You are booked successfully
                    </div>
                    <div className="text-lg text-white mb-8 text-center">
                      Your presence is confirmed for the dinner event.
                    </div>
                  </div>
                  <button
                    className={`w-full max-w-xs py-3 rounded-full bg-white text-orange-600 text-lg font-bold mb-8 shadow-lg hover:bg-orange-100 ${
                      isOptingIn ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    disabled={isOptingIn}
                    onClick={async () => {
                      if (!selectedDate) return;
                      try {
                        setIsOptingIn(true);
                        await optInDinner(
                          selectedDate.id,
                          "standard",
                          mealPref.toLowerCase(),
                          token
                        );
                        toast.success("Dinner booking confirmed!");
                        // Fetch latest bookings
                        const updatedBookings = await fetchMyBookings(token);
                        setBookings(updatedBookings);
                        setActiveTab("bookings");
                        setStep("dinner");
                        setSelectedDate(null);
                        setMealPref("");
                        setSelectedMembership(null);
                        setCardDetails({
                          number: "",
                          expiry: "",
                          cvv: "",
                          name: "",
                        });
                        setIsProcessing(false);
                      } catch (err) {
                        toast.error("Failed to book dinner: " + err.message);
                      } finally {
                        setIsOptingIn(false);
                      }
                    }}
                  >
                    {isOptingIn ? "Booking..." : "Next step"}
                  </button>
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
                      <div className="text-gray-700 text-sm mb-2">
                        Group ID: {booking.id || booking._id || "N/A"}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          className="px-4 py-2 rounded bg-blue-500 text-white font-bold hover:bg-blue-600 text-xs"
                          onClick={() => {
                            // Implement manage reservation logic here
                            toast("Manage reservation coming soon!");
                          }}
                        >
                          Manage
                        </button>
                        <button
                          className="px-4 py-2 rounded bg-yellow-500 text-white font-bold hover:bg-yellow-600 text-xs"
                          onClick={() => {
                            // Implement reschedule logic here
                            toast("Reschedule coming soon!");
                          }}
                        >
                          Reschedule
                        </button>
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
            <div
              className="w-full flex flex-col items-center"
              style={{ marginBottom: "90px" }}
            >
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
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                      <div
                        className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-md p-2 sm:p-6 relative animate-fadeInUp flex flex-col"
                        style={{ maxHeight: "90vh" }}
                      >
                        <button
                          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
                          onClick={() => setShowEditProfile(false)}
                        >
                          &times;
                        </button>
                        <div className="font-bold text-xl mb-2 sm:mb-4 text-gray-900 flex items-center">
                          <FontAwesomeIcon icon={faEdit} className="mr-2" />
                          Edit Profile
                        </div>
                        <div
                          className="flex-1 overflow-y-auto pr-1"
                          style={{ minHeight: 0 }}
                        >
                          <input
                            type="text"
                            className="w-full border rounded p-2 mb-2 sm:mb-3"
                            placeholder="Name"
                            value={editProfile.name || ""}
                            onChange={(e) =>
                              setEditProfile((p) => ({
                                ...p,
                                name: e.target.value,
                              }))
                            }
                          />
                          <input
                            type="email"
                            className="w-full border rounded p-2 mb-2 sm:mb-3"
                            placeholder="Email"
                            value={editProfile.email || ""}
                            readOnly
                          />
                          <input
                            type="text"
                            className="w-full border rounded p-2 mb-2 sm:mb-3"
                            placeholder="Mobile Number"
                            value={editProfile.mobile || ""}
                            onChange={(e) =>
                              setEditProfile((p) => ({
                                ...p,
                                mobile: e.target.value,
                              }))
                            }
                          />
                          <input
                            type="text"
                            className="w-full border rounded p-2 mb-2 sm:mb-3"
                            placeholder="City"
                            value={
                              editProfile.city || editProfile.current_city || ""
                            }
                            onChange={(e) =>
                              setEditProfile((p) => ({
                                ...p,
                                city: e.target.value,
                              }))
                            }
                          />
                          <input
                            type="text"
                            className="w-full border rounded p-2 mb-2 sm:mb-3"
                            placeholder="Country"
                            value={
                              editProfile.country ||
                              editProfile.current_country ||
                              ""
                            }
                            onChange={(e) =>
                              setEditProfile((p) => ({
                                ...p,
                                country: e.target.value,
                              }))
                            }
                          />
                          <input
                            type="date"
                            className="w-full border rounded p-2 mb-2 sm:mb-3"
                            placeholder="Date of Birth"
                            value={
                              editProfile.dob
                                ? editProfile.dob.slice(0, 10)
                                : ""
                            }
                            onChange={(e) =>
                              setEditProfile((p) => ({
                                ...p,
                                dob: e.target.value,
                              }))
                            }
                          />
                          <input
                            type="text"
                            className="w-full border rounded p-2 mb-2 sm:mb-3"
                            placeholder="Gender"
                            value={editProfile.gender || ""}
                            onChange={(e) =>
                              setEditProfile((p) => ({
                                ...p,
                                gender: e.target.value,
                              }))
                            }
                          />
                          <input
                            type="text"
                            className="w-full border rounded p-2 mb-2 sm:mb-3"
                            placeholder="Relationship Status"
                            value={editProfile.relationship_status || ""}
                            onChange={(e) =>
                              setEditProfile((p) => ({
                                ...p,
                                relationship_status: e.target.value,
                              }))
                            }
                          />
                          <input
                            type="text"
                            className="w-full border rounded p-2 mb-2 sm:mb-3"
                            placeholder="Profession"
                            value={editProfile.profession || ""}
                            onChange={(e) =>
                              setEditProfile((p) => ({
                                ...p,
                                profession: e.target.value,
                              }))
                            }
                          />
                          <div className="mb-2 sm:mb-3">
                            <label className="block text-gray-700 font-semibold mb-1">
                              Children
                            </label>
                            <div className="font-bold">
                              {editProfile.children ? "Yes" : "No"}
                            </div>
                          </div>
                          <div className="mb-2 sm:mb-3">
                            <label className="block text-gray-700 font-semibold mb-1">
                              Subscription Status
                            </label>
                            <div
                              className={`font-bold ${
                                hasActiveSubscription
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {hasActiveSubscription ? "Active" : "Not Active"}
                            </div>
                          </div>
                          <div className="mb-2 sm:mb-3">
                            <label className="block text-gray-700 font-semibold mb-1">
                              Identity Verified
                            </label>
                            <div
                              className={`font-bold ${
                                editProfile.identity_verified
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {editProfile.identity_verified
                                ? "Verified"
                                : "Not Verified"}
                            </div>
                          </div>
                          {editProfile.personality_answers &&
                            Array.isArray(editProfile.personality_answers) && (
                              <div className="mb-2 sm:mb-3">
                                <label className="block text-gray-700 font-semibold mb-1">
                                  Personality Answers
                                </label>
                                <ul className="bg-gray-100 rounded p-2 text-sm overflow-x-auto">
                                  {editProfile.personality_answers.map(
                                    (ans, idx) => (
                                      <li
                                        key={idx}
                                        className="mb-1 flex items-center gap-2"
                                      >
                                        <span className="font-semibold">
                                          {idx + 1}.{" "}
                                        </span>
                                        <span className="flex-1">
                                          {ans.question || `Q${idx}`}:
                                        </span>
                                        <select
                                          className="border rounded px-2 py-1 text-xs"
                                          value={ans.answer}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setEditProfile((p) => {
                                              const arr = [
                                                ...(p.personality_answers ||
                                                  []),
                                              ];
                                              arr[idx] = {
                                                ...arr[idx],
                                                answer: val,
                                              };
                                              return {
                                                ...p,
                                                personality_answers: arr,
                                              };
                                            });
                                          }}
                                        >
                                          <option value="1">Yes</option>
                                          <option value="0">No</option>
                                        </select>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                          {editProfile.personality_scores && (
                            <div className="mb-2 sm:mb-3">
                              <label className="block text-gray-700 font-semibold mb-1">
                                Personality Scores
                              </label>
                              <ul className="bg-gray-100 rounded p-2 text-sm overflow-x-auto">
                                {Object.entries(
                                  editProfile.personality_scores
                                ).map(([trait, score]) => (
                                  <li key={trait} className="mb-1">
                                    <span className="font-semibold">
                                      {trait}:{" "}
                                    </span>
                                    <span className="font-bold">{score}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <button
                          className="w-full py-2 rounded bg-red-500 text-white font-bold hover:bg-red-600 mt-2 mb-1 text-sm fixed left-0 bottom-0 max-w-md mx-auto"
                          style={{ position: "sticky", left: 0, right: 0 }}
                          onClick={handleProfileSave}
                        >
                          Apply Changes
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Help Center Modal */}
                  {showHelp && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
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
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
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
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
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
      </div>
      {/* Bottom Navigation Bar: Always visible, even on profile step and mobile */}
      <div
        className="w-full max-w-2xl flex justify-between items-center bg-white border-t-4 border-red-500 px-6 py-3 rounded-b-xl fixed bottom-0 left-1/2 -translate-x-1/2 z-50"
        style={{
          boxShadow: "0 -2px 8px rgba(0,0,0,0.04)",
          background: "#fffbe6",
        }}
      >
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
  );
}
