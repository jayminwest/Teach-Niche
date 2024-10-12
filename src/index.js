import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MarketplaceLayout from './pages/marketplace/layout'; 
import SignInLayout from './pages/sign-in/layout'; 
import AboutLayout from './pages/about/layout';
import ProfileLayout from './pages/profile/layout';
import LegalLayout from './pages/legal/layout';
import SignUpLayout from './pages/sign-up/layout';
import ForgotPasswordLayout from './pages/forgot-password/layout';
import CreateLesson from './pages/create-lesson/layout';
import Checkout from './pages/checkout/layout';
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
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
        <Route path="/profile" element={<ProfileLayout />} />
        <Route path="/legal" element={<LegalLayout />} />
        <Route path="/create-lesson" element={<CreateLesson />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
