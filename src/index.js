import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
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
import ProtectedRoute from "./components/ProtectedRoute";
import MyPurchasesLayout from "./pages/my-purchases/layout";
import Logout from "./pages/logout/layout";
import NotFound from "./pages/not-found/layout";

/**
 * Main entry point for the React application.
 * Sets up routing and authentication context.
 */
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/marketplace" element={<MarketplaceLayout />} />
          <Route path="/sign-in" element={<SignInLayout />} />
          <Route path="/sign-up" element={<SignUpLayout />} />
          <Route path="/forgot-password" element={<ForgotPasswordLayout />} />
          <Route path="/about" element={<AboutLayout />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileLayout />
              </ProtectedRoute>
            }
          />
          <Route path="/legal" element={<LegalLayout />} />
          <Route path="/create-lesson" element={<CreateLesson />} />
          <Route
            path="/edit-lesson/:id"
            element={
              <ProtectedRoute>
                <EditLesson />
              </ProtectedRoute>
            }
          />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
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
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Analytics />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
