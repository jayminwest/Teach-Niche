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

  return (
    <header className="sticky top-0 z-50 py-2 bg-base-100 border-b border-base-300">
      <div className="container">
        <nav className="navbar px-0">
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
                  <>
                    <li>
                      <Link to="/my-purchases">My Purchased Lessons</Link>
                    </li>
                    <li className="lg:hidden">
                      <Link to="/profile">Profile</Link>
                    </li>
                    <li className="lg:hidden">
                      <Link to="/logout">Logout</Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
            <Link to="/" className="btn btn-ghost normal-case text-2xl">
              Teach Niche
            </Link>
          </div>
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
          <div className="navbar-end">
            {user ? (
              <>
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                      <i className="bi bi-person-circle text-2xl" aria-hidden="true"></i>
                    </div>
                  </label>
                  <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52">
                    <li>
                      <Link to="/profile">Profile</Link>
                    </li>
                    <li>
                      <Link to="/logout">Logout</Link>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <Link className="btn btn-accent" to="/sign-up">
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
