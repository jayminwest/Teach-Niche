import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
    return (
        <header className='sticky top-0 z-50 py-2 bg-base-100'>
            <div className='container'>
                <div className="navbar px-0">
                    <div className="navbar-start">
                        <div className="dropdown">
                            <label tabIndex={0} role="button" className="btn btn-primary btn-circle lg:hidden mr-1">
                                <i className="bi bi-list text-2xl"></i>
                            </label>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-1 z-[1] p-2 shadow bg-base-200 rounded-box w-52">
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/marketplace">Lessons</Link></li>
                                <li><Link to="/about">About</Link></li>
                            </ul>
                        </div>
                        <Link to="/" className="btn btn-ghost normal-case text-2xl">Teach Niche</Link>
                    </div>
                    <div className="navbar-center hidden lg:flex">
                        <ul className="menu menu-horizontal p-0 font-medium">
                        <li>
                            <Link to="/">Home</Link></li>
                            <li><Link to="/marketplace">Lessons</Link></li>
                            <li><Link to="/about">About</Link></li>
                        </ul>
                    </div>
                    <div className="navbar-end">
                        <Link className="btn" to="/sign-up">Get Started</Link>
                    </div>
                </div>
            </div>
        </header>
    );
}