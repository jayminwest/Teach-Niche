import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AlertMessage from "./AlertMessage";

/**
 * Footer Component
 *
 * Renders the footer section with navigation links and newsletter subscription.
 *
 * @returns {JSX.Element} The footer element.
 */
const Footer = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState(null);
  const [subscriptionError, setSubscriptionError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubscriptionMessage(null);
    setSubscriptionError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_FUNCTIONS_URL}/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Subscription failed");
      }

      setSubscriptionMessage(data.message);
      setEmail("");
    } catch (error) {
      console.error("Subscription error:", error);
      setSubscriptionError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyEmail = async (e) => {
    e.preventDefault();
    const email = "jaymin@teach-niche.com";
    
    try {
      await navigator.clipboard.writeText(email);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  return (
    <footer className="bottom-0 bg-base-200 text-base-content">
      <div className="container mx-auto px-4">
        <div className="footer py-10 md:py-16 grid-cols-2 sm:grid-cols-3 lg:grid-cols-auto gap-8">
          <nav aria-label="Services">
            <h6 className="footer-title">Services</h6>
            <Link
              className="link link-hover"
              to={user ? "/profile" : "/sign-up"}
              aria-label={user ? "Go to teaching profile" : "Sign up to teach"}
            >
              Teaching
            </Link>
            <Link 
              className="link link-hover" 
              to="/marketplace"
              aria-label="Browse lessons"
            >
              Lessons
            </Link>
          </nav>

          <nav aria-label="Company">
            <h6 className="footer-title">Company</h6>
            <Link 
              className="link link-hover" 
              to="/about"
              aria-label="About Teach Niche"
            >
              About us
            </Link>
            <a 
              href="mailto:jaymin@teach-niche.com"
              className="link link-hover relative"
              onClick={handleCopyEmail}
              aria-label="Contact via email"
            >
              {copySuccess ? "Email copied!" : "Contact"}
            </a>
          </nav>

          <nav aria-label="Legal">
            <h6 className="footer-title">Legal</h6>
            <Link 
              className="link link-hover" 
              to="/legal"
              aria-label="Terms of use"
            >
              Terms of use
            </Link>
            <Link 
              className="link link-hover" 
              to="/legal"
              aria-label="Privacy policy"
            >
              Privacy policy
            </Link>
            <Link 
              className="link link-hover" 
              to="/legal"
              aria-label="Cookie policy"
            >
              Cookie policy
            </Link>
          </nav>

          <form
            className="w-full col-span-full md:col-auto"
            onSubmit={handleSubscribe}
            aria-label="Newsletter subscription"
          >
            <h6 className="footer-title">Newsletter</h6>
            <fieldset className="form-control w-full" disabled={isSubmitting}>
              <label htmlFor="newsletter-email" className="label">
                <span className="label-text">Enter your email address</span>
              </label>
              <div className="join">
                <input
                  type="email"
                  id="newsletter-email"
                  placeholder="username@site.com"
                  className="input input-bordered join-item flex-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email address for newsletter"
                />
                <button 
                  type="submit" 
                  className="btn btn-primary join-item"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Subscribing...
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </div>
            </fieldset>
            <AlertMessage
              success={subscriptionMessage}
              error={subscriptionError}
            />
          </form>
        </div>

        <div className="flex flex-col sm:flex-row items-center border-t border-base-300 py-4 gap-2">
          <div className="flex-grow text-center sm:text-start">
            <p>
              &copy; {new Date().getFullYear()}{" "}
              Teach Niche, LLC. All rights reserved.
            </p>
          </div>
          <div className="grid grid-flow-col gap-4">
            <Link
              className="link link-primary hover:underline flex items-center"
              to="https://www.instagram.com/teachniche/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Teach Niche on Instagram"
            >
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
