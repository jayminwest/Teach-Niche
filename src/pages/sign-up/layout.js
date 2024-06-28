import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FcGoogle } from "react-icons/fc";
import supabase from "../../utils/supabaseClient";  // Ensure you have the Supabase client properly set up and imported

export default function SignUpLayout() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSignInClick = () => {
    navigate("/sign-in");
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Optionally, you can update the user's profile with the name
      const userId = data.user?.id;  // Ensure the user ID is correctly retrieved
      if (userId) {
        await supabase.from('users').insert([
          { id: userId, email, full_name: name }
        ]);
        navigate("/profile");  // Redirect to the homepage or dashboard after sign-up
      } else {
        setError("User ID is missing from the response.");
      }
    }
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
            <form onSubmit={handleSignUp}>
              <div className="form-control">
                <label className="label" htmlFor="name">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Name"
                  className="input input-bordered"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="form-control mt-6">
                <button className="btn btn-primary">Sign Up</button>
              </div>
            </form>
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
