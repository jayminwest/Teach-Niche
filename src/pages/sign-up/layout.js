import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FcGoogle } from "react-icons/fc";

export default function SignUpLayout() {
  const navigate = useNavigate();

  const handleSignInClick = () => {
    navigate("/sign-in");
  };

  return (
    <div className="container mx-auto">
      <Header />
      <div className="flex justify-center items-center min-h-screen py-10">
        <div className="card w-full max-w-sm shadow-2xl bg-base-100 p-6">
          <div className="card-body">
            <button
              className="btn btn-primary mb-4"
              onClick={handleSignInClick}
            >
              Have an account? Sign In
            </button>
            <button className="btn btn-warning flex items-center justify-center">
              <FcGoogle className="mr-2" size={24} />
              Sign Up with Google
            </button>
            <div className="divider"></div>
            <h2 className="card-title text-2xl mb-4">Sign Up</h2>
            <form>
              <div className="form-control">
                <label className="label" htmlFor="name">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Name"
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label" htmlFor="email">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label" htmlFor="password">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  className="input input-bordered"
                />
              </div>
              <div className="form-control mt-6">
                <button className="btn btn-primary">Sign Up</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
