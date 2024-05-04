import React from "react";

export default function CTA() {
    return (
        <section className="py-12 md:py-24">
            <div className="container">
                <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-center md:text-left">
                    <span className="flex-grow text-4xl md:text-5xl 2xl:text-6xl font-bold text-primary">
                        Become a teacher today <br className="hidden sm:inline" />
                        and start earning money.
                    </span>
                    <button className="btn btn-warning rounded-full sm:btn-lg">Get Started</button>
                </div>
            </div>
        </section>
    );
}