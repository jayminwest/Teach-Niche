import React from "react";
import { Link } from "react-router-dom";

export default function CTA() {
    return (
        <section className="py-12 md:py-24">
            <div className="container">
                <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-center md:text-left">
                    <span className="flex-grow text-4xl md:text-5xl 2xl:text-6xl font-bold text-primary">
                        Become a teacher today <br className="hidden sm:inline" />
                        and start earning money.
                    </span>
                    <Link to="/sign-in" className="btn btn-warning rounded-full sm:btn-lg">Get Started</Link>
                </div>
            </div>
        </section>
    );
}