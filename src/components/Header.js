// src/components/Header.js
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Header Component
 *
 * Renders the navigation bar with links based on user authentication status.
 *
 * @returns {JSX.Element} The header element.
 */
const Header = () => {
  const { user } = useAuth();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/marketplace", label: "Lessons" },
    { to: "/about", label: "About" },
    ...(user ? [{ to: "/my-purchases", label: "My Purchased Lessons" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 py-2 bg-base-100 border-b border-base-300">
      <div className="container mx-auto px-4">
        <nav className="navbar p-0" aria-label="Main navigation">
          <div className="navbar-start">
            <div className="dropdown">
              <label
                tabIndex={0}
                className="btn btn-primary btn-circle lg:hidden mr-1"
                aria-label="Open menu"
              >
                <i className="bi bi-list text-2xl" aria-hidden="true"></i>
              </label>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-1 z-[1] p-2 shadow bg-base-200 rounded-box w-52"
                role="menu"
              >
                {navLinks.map((link) => (
                  <li key={link.to} role="none">
                    <Link 
                      to={link.to}
                      role="menuitem"
                      className="py-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <Link 
              to="/" 
              className="btn btn-ghost normal-case text-2xl"
              aria-label="Teach Niche Home"
            >
              Teach Niche
            </Link>
          </div>

          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal p-0 font-medium">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="navbar-end gap-2">
            {user ? (
              <>
                <Link 
                  className="btn btn-ghost" 
                  to="/profile"
                  aria-label="View your profile"
                >
                  View Profile
                </Link>
                <Link
                  className="btn btn-primary hidden md:inline-flex"
                  to="/logout"
                  aria-label="Log out of your account"
                >
                  Logout
                </Link>
              </>
            ) : (
              <Link 
                className="btn btn-accent" 
                to="/sign-up"
                aria-label="Get started with Teach Niche"
              >
                Get Started
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
