import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { ExclusiveOnboarding, ExclusiveRegistrationSuccess, AdminPanel } from './components';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useDinners, useBookings } from './hooks/useSupabase';
import { analytics } from './lib/supabaseEnhanced';
import BrowseDinners from './BrowseDinners';
import ViewMatches from './ViewMatches';
import MyBookings from './MyBookings';
import { GoogleMap, LoadScript, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setToken } from './store/authSlice';

// Import page components
import LandingPage from './pages/LandingPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import BlogPage from './pages/BlogPage.jsx';
import PricingPage from './pages/PricingPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import SignInPage from './pages/SignInPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import UserProfile from './pages/UserProfile.jsx';
import DinnersPage from './pages/DinnersPage.jsx';
import DinnerDetailsPage from './pages/DinnerDetailsPage.jsx';
import BookingsPage from './pages/BookingsPage.jsx';
import MatchesPage from './pages/MatchesPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminDinnersPage from './pages/AdminDinnersPage.jsx';
import AdminRestaurantsPage from './pages/AdminRestaurantsPage.jsx';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage.jsx';
import RegistrationSuccessPage from './pages/RegistrationSuccessPage.jsx';
import EmailVerificationPage from './pages/EmailVerificationPage.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import BlogDetail from './pages/BlogDetail.jsx';
import AuthPage from './pages/AuthPage.jsx';
import FAQPage from './pages/FAQPage.jsx';
import HelpPage from './pages/HelpPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import ContactUsPage from './pages/ContactUsPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import Dashboard from './pages/Dashboard';

// API Configuration
const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'https://bichance-production-a30f.up.railway.app') + '/api';

// Add this above the LandingPage component
const GOOGLE_MAPS_API_KEY = "AIzaSyAh_IG7Mt61z6axZ_qVu40eHqrmMqgNZC4";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7 } }
};

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-red-800">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Main App Component with Router
function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    // Try to get token from localStorage or sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      dispatch(setToken(token));
    }
  }, [dispatch]);
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-red-800">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes - No Authentication Required */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:id" element={<BlogDetail />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/contact-us" element={<ContactUsPage />} />
      <Route path="/terms" element={<TermsPage />} />
      
      {/* Public Authentication Routes - Login, Register, Sign Up */}
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      
      {/* Protected Routes - Authentication Required */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dinners" element={
        <ProtectedRoute>
          <DinnersPage />
        </ProtectedRoute>
      } />
      <Route path="/dinners/:id" element={
        <ProtectedRoute>
          <DinnerDetailsPage />
        </ProtectedRoute>
      } />
      <Route path="/matches" element={
        <ProtectedRoute>
          <MatchesPage />
        </ProtectedRoute>
      } />
      <Route path="/bookings" element={
        <ProtectedRoute>
          <BookingsPage />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />
      {/* Onboarding is now a public route */}
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/profile" element={
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      } />
      
      {/* Protected Admin Routes - Admin Authentication Required */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <AdminPanel />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute adminOnly>
          <AdminUsersPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/dinners" element={
        <ProtectedRoute adminOnly>
          <AdminDinnersPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/restaurants" element={
        <ProtectedRoute adminOnly>
          <AdminRestaurantsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/analytics" element={
        <ProtectedRoute adminOnly>
          <AdminAnalyticsPage />
        </ProtectedRoute>
      } />
      
      {/* Success and Completion Pages */}
      <Route path="/registration-success" element={<RegistrationSuccessPage />} />
      <Route path="/email-verification" element={<EmailVerificationPage />} />
      <Route path="/welcome" element={
        <ProtectedRoute>
          <WelcomePage />
        </ProtectedRoute>
      } />
      
      {/* 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
 