import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ExclusiveOnboarding } from "../components.js";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { profile, signUp } = useAuth();

  useEffect(() => {
    // Agar onboarding complete hai toh dashboard pe redirect karo
    if (profile && profile.onboarding_complete) {
      navigate("/dashboard");
    }
  }, [profile, navigate]);

  const handleOnboardingComplete = async (formData) => {
    // signUp ko call karo, login state set karo, aur dashboard pe redirect karo
    const result = await signUp(formData.email, formData.password, formData);
    if (result.success) {
      navigate("/dashboard");
    } else {
      // Optionally show error
    }
  };

  return (
    <div className="min-h-screen fade-in-up">
      <h1 className="text-3xl font-bold text-red-600 text-center my-8">
        Onboarding
      </h1>
      <ExclusiveOnboarding
        onComplete={handleOnboardingComplete}
        onBack={() => navigate("/auth")}
      />
    </div>
  );
};

export default OnboardingPage;
