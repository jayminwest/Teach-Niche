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
export default function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 py-2 bg-base-100">
      <div className="container">
        <div className="navbar px-0">
          <div className="navbar-start">
            {/* Mobile Dropdown Menu */}
            <div className="dropdown">
              <label
                tabIndex={0}
                role="button"
                className="btn btn-primary btn-circle lg:hidden mr-1"
              >
                <i className="bi bi-list text-2xl"></i>
              </label>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-1 z-[1] p-2 shadow bg-base-200 rounded-box w-52"
              >
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/marketplace">Lessons</Link>
                </li>
                <li>
                  <Link to="/about">About</Link>
                </li>
                {user && (
                  <li>
                    <Link to="/my-purchases">My Purchased Lessons</Link>
                  </li>
                )}
              </ul>
            </div>
            {/* Brand Logo */}
            <Link to="/" className="btn btn-ghost normal-case text-2xl">
              Teach Niche
            </Link>
          </div>
          {/* Desktop Navigation Links */}
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal p-0 font-medium">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/marketplace">Lessons</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              {user && (
                <li>
                  <Link to="/my-purchases">My Purchased Lessons</Link>
                </li>
              )}
            </ul>
          </div>
          {/* Authentication Buttons */}
          <div className="navbar-end">
            {user
              ? (
                <>
                  <Link className="btn mr-2" to="/profile">View Profile</Link>
                  <Link className="btn btn-secondary" to="/logout">Logout</Link>
                </>
              )
              : <Link className="btn btn-accent" to="/sign-up">Get Started</Link>}
          </div>
        </div>
      </div>
    </header>
  );
}
