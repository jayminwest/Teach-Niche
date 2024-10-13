// src/pages/success.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const SuccessPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('session_id');

  return (
    <div className="container mx-auto">
      <Header />
      <div className="flex flex-col justify-center items-center min-h-screen py-10">
        <div className="card w-full max-w-md shadow-2xl bg-base-100 p-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Purchase Successful!</h2>
          <p>Thank you for your purchase. Your lesson has been added to your profile.</p>
          {/* Optionally, you can fetch and display purchase details using sessionId */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SuccessPage;
