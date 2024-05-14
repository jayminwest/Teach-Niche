import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function ForgotPasswordLayout() {
    return (
        <div className="container mx-auto">
            <Header />
            <div className="flex justify-center items-center min-h-screen">
                <div className="card w-full max-w-sm shadow-2xl bg-base-100">
                    <div className="card-body">
                        <h2 className="card-title">Forgot Password</h2>
                        <form>
                            <div className="form-control">
                                <label className="label" htmlFor="email">
                                    <span className="label-text">Email</span>
                                </label>
                                <input type="email" id="email" placeholder="Email" className="input input-bordered" />
                            </div>
                            <div className="form-control mt-6">
                                <button className="btn btn-primary">Send Reset Link</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
