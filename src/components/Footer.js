import React from "react";

export default function Footer() {
  return (
    <footer className="bg-base-200 text-base-content">
      <div className="container">
        <div className="footer py-10 md:py-16 grid-cols-3 sm:grid-cols-3 lg:grid-cols-auto">
          <nav>
            <h6 className="footer-title">Services</h6>
            <a className="link link-hover">Teaching</a>
            <a className="link link-hover">Lessons</a>
          </nav>
          <nav>
            <h6 className="footer-title">Company</h6>
            <a className="link link-hover">About us</a>
            <a className="link link-hover">Contact</a>
          </nav>
          <nav>
            <h6 className="footer-title">Legal</h6>
            <a className="link link-hover">Terms of use</a>
            <a className="link link-hover">Privacy policy</a>
            <a className="link link-hover">Cookie policy</a>
          </nav>
          <form className="w-full cols-span-full md:col-auto">
            <h6 className="footer-title">Newsletter</h6>
            <fieldset className="form-control w-full">
              <label className="label">
                <span className="label-text">Enter your email address</span>
              </label>
              <div className="join">
                <input
                  type="text"
                  placeholder="username@site.com"
                  className="input input-bordered join-item"
                />
                <button className="btn btn-primary join-item">Subscribe</button>
              </div>
            </fieldset>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row items-center border-t border-base-300 py-4 gap-2">
          <div className="flex-grow text-center sm:text-start">
            <p>&copy; 2024 Teach Niche. All rights reserved.</p>
          </div>
          <div className="grid grid-flow-col gap-4">
            <a className="link link-primary" href="#!">Follow Teach Niche On Instagram</a>
            <i className="bi bi-instagram text-xl"></i>
          </div>
        </div>
      </div>
    </footer>
  );
}
