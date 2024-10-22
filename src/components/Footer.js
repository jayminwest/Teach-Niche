import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Footer Component
 *
 * Renders the footer section with navigation links and newsletter subscription.
 *
 * @returns {JSX.Element} The footer element.
 */
const Footer = () => {
  const { user } = useAuth();

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Implement subscription logic here
    console.log("Newsletter subscription submitted");
  };

  return (
    <footer className="bottom-0 bg-base-200 text-base-content">
      <div className="container">
        <div className="footer py-10 md:py-16 grid-cols-3 sm:grid-cols-3 lg:grid-cols-auto">
          <nav aria-label="Services">
            <h6 className="footer-title">Services</h6>
            <Link className="link link-hover" to={user ? "/profile" : "/sign-up"}>Teaching</Link>
            <Link className="link link-hover" to="/marketplace">Lessons</Link>
          </nav>
          <nav aria-label="Company">
            <h6 className="footer-title">Company</h6>
            <Link className="link link-hover" to="/about">About us</Link>
            <Link className="link link-hover" to="/about">Contact</Link>
          </nav>
          <nav aria-label="Legal">
            <h6 className="footer-title">Legal</h6>
            <Link className="link link-hover" to="/legal">Terms of use</Link>
            <Link className="link link-hover" to="/legal">Privacy policy</Link>
            <Link className="link link-hover" to="/legal">Cookie policy</Link>
          </nav>
          <form className="w-full cols-span-full md:col-auto" onSubmit={handleSubscribe}>
            <h6 className="footer-title">Newsletter</h6>
            <fieldset className="form-control w-full">
              <label htmlFor="newsletter-email" className="label">
                <span className="label-text">Enter your email address</span>
              </label>
              <div className="join">
                <input
                  type="email"
                  id="newsletter-email"
                  placeholder="username@site.com"
                  className="input input-bordered join-item"
                  required
                />
                <button type="submit" className="btn btn-primary join-item">Subscribe</button>
              </div>
            </fieldset>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row items-center border-t border-base-300 py-4 gap-2">
          <div className="flex-grow text-center sm:text-start">
            <p>&copy; {new Date().getFullYear()} Teach Niche. All rights reserved.</p>
          </div>
          <div className="grid grid-flow-col gap-4">
            <Link className="link link-primary" to="https://instagram.com" aria-label="Follow Teach Niche on Instagram">
              Follow Teach Niche On Instagram
              <i className="bi bi-instagram text-xl ml-2" aria-hidden="true"></i>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
