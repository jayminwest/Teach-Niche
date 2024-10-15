import React from "react";
import { Link } from "react-router-dom";

export default function CTA() {
    return (
        <section className="py-12 md:py-24">
            <div className="container">
                <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-center md:text-left">
                    <span className="flex-grow text-4xl md:text-5xl 2xl:text-6xl font-bold text-primary">
                        Share Your Expertise <br className="hidden sm:inline" />
                        and Grow with Teach Niche.
                    </span>
                    <Link to="/sign-up" className="btn btn-warning rounded-full sm:btn-lg">Join Us</Link>
                </div>
            </div>
        </section>
    );
}
