import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MarketplaceLayout from './pages/marketplace/layout'; 
import SignInLayout from './pages/sign-in/layout'; 
import AboutLayout from './pages/about/layout';
import DashboardLayout from './pages/dashboard/layout';
import LegalLayout from './pages/legal/layout';
import SignUpLayout from './pages/sign-up/layout';
import ForgotPasswordLayout from './pages/forgot-password/layout';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/marketplace" element={<MarketplaceLayout />} />
        <Route path="/sign-in" element={<SignInLayout />} />
        <Route path="/sign-up" element={<SignUpLayout />} />
        <Route path="/forgot-password" element={<ForgotPasswordLayout />} />
        <Route path="/about" element={<AboutLayout />} />
        <Route path="/dashboard" element={<DashboardLayout />} />
        <Route path="/legal" element={<LegalLayout />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
