import React from "react";
import { Route, Routes } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

// Layout Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Page Components
import HomePage from "./pages/home/layout";
import MarketplaceLayout from "./pages/marketplace/layout";
import SignInLayout from "./pages/sign-in/layout";
import AboutLayout from "./pages/about/layout";
import ProfileLayout from "./pages/profile/layout";
import LegalLayout from "./pages/legal/layout";
import SignUpLayout from "./pages/sign-up/layout";
import ForgotPasswordLayout from "./pages/forgot-password/layout";
import CreateLesson from "./pages/create-lesson/layout";
import EditLesson from "./pages/edit-lesson/[id]";
import Success from "./pages/success/layout";
import Cancel from "./pages/cancel/layout";
import LessonPage from "./pages/lesson/[id]";
import MyPurchasesLayout from "./pages/my-purchases/layout";
import Logout from "./pages/logout/layout";
import NotFound from "./pages/not-found/layout";
import ResetPasswordLayout from "./pages/reset-password/layout";
import AuthCallback from "./pages/auth/callback";
import ProtectedRoute from "./components/ProtectedRoute";

const BetaAlert = () => (
  <div className="alert alert-warning shadow-lg mx-auto my-4 max-w-6xl">
    <div className="flex justify-center items-center space-x-2">
      <i
        className="bi bi-exclamation-triangle-fill text-sm"
        aria-hidden="true"
      />
      <span className="text-sm font-semibold">
        Welcome to Teach Niche! The site is currently in Beta, so please be
        patient as the site improves. If you have feedback, please DM @teachniche
      </span>
    </div>
  </div>
);

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <BetaAlert />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplaceLayout />} />
          <Route path="/sign-in" element={<SignInLayout />} />
          <Route path="/sign-up" element={<SignUpLayout />} />
          <Route path="/forgot-password" element={<ForgotPasswordLayout />} />
          <Route path="/about" element={<AboutLayout />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/reset-password" element={<ResetPasswordLayout />} />
          <Route path="/legal" element={<LegalLayout />} />
          <Route path="/create-lesson" element={<CreateLesson />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/logout" element={<Logout />} />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-lesson/:id"
            element={
              <ProtectedRoute>
                <EditLesson />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lesson/:id"
            element={
              <ProtectedRoute>
                <LessonPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-purchases"
            element={
              <ProtectedRoute>
                <MyPurchasesLayout />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
