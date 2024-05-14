import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";

export default function SignUpLayout() {
  return (
    <div className="container mx-auto">
      <Header />
      <div className="flex justify-center items-center min-h-screen">
        <div className="card w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
            <h2 className="card-title">Sign In</h2>
            <form>
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
                <button className="btn btn-primary">Sign In</button>
              </div>
            </form>
            <div className="divider">OR</div>
            <button className="btn btn-outline btn-accent">
              Sign In with Google
            </button>
            <div className="form-control mt-6">
              <Link to="/forgot-password" className="link link-primary">
                Forgot Password?
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
