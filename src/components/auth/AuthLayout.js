import React from "react";
import Header from "../Header";
import Footer from "../Footer";

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="mt-3 text-gray-600">{subtitle}</p>
          </div>
          
          <div className="bg-white shadow-lg rounded-lg px-6 py-8 sm:px-10">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <h2 className="text-xl font-semibold text-center text-gray-900 mb-6">
                {title === "Welcome Back!" ? "Sign in to your account" : "Create your account"}
              </h2>
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout; 