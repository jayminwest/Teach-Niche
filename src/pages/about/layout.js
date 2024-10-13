import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function AboutUs() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = { name, email, message };
        console.log(JSON.stringify(formData));
        // You can also send this data to a server or API here
        setName('');
        setEmail('');
        setMessage('');
        setFormSubmitted(true);
    };

    return (
        <div>
            <Header />
            <div className="flex justify-center items-center min-h-screen py-10">
                <div className="card w-full max-w-2xl shadow-2xl bg-base-100 p-6">
                    <h2 className="card-title text-3xl mb-4">About Us</h2>
                    <p className="text-lg mb-4">
                        Welcome to our website! We are a team of dedicated professionals committed to providing exceptional services to our customers. Our mission is to deliver high-quality solutions that meet your needs and exceed your expectations.
                    </p>
                    <p className="text-lg mb-4">
                        Our team has extensive experience in the industry, and we take pride in our work. We believe in continuous improvement and strive to stay updated with the latest trends and technologies.
                    </p>
                    <p className="text-lg mb-8">
                        Thank you for choosing us. We look forward to working with you and achieving great results together.
                    </p>
                    <section className="mt-10">
                        <h3 className="text-2xl mb-4">Contact Us</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-control mb-4">
                                <label className="label" htmlFor="name">
                                    <span className="label-text">Name</span>
                                </label>
                                <input type="text" id="name" placeholder="Name" className="input input-bordered" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="form-control mb-4">
                                <label className="label" htmlFor="email">
                                    <span className="label-text">Email</span>
                                </label>
                                <input type="email" id="email" placeholder="Email" className="input input-bordered" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="form-control mb-4">
                                <label className="label" htmlFor="message">
                                    <span className="label-text">Message</span>
                                </label>
                                <textarea id="message" placeholder="Your message" className="textarea textarea-bordered" value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
                            </div>
                            <div className="form-control mt-6">
                                <button className={formSubmitted ? "btn btn-success" : "btn btn-primary"}>{formSubmitted ? "Success! Thanks for reaching out!" : "Send Message"}</button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
            <Footer />
        </div>
    );
}