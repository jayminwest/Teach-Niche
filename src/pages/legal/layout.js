import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function Legal() {
    return (
        <div>
            <Header />
            <div className="flex justify-center items-center min-h-screen py-10">
                <div className="card w-full max-w-2xl shadow-2xl bg-base-100 p-6">
                    <h2 className="card-title text-3xl mb-4">Legal</h2>
                    
                    <section className="mb-8">
                        <h3 className="text-2xl mb-2">Terms of Use</h3>
                        <p className="text-lg mb-2">
                            Welcome to our website. These terms of use outline the rules and regulations for the use of our website.
                        </p>
                        <p className="text-lg mb-2">
                            By accessing this website, we assume you accept these terms and conditions. Do not continue to use the website if you do not agree to take all of the terms and conditions stated on this page.
                        </p>
                        <p className="text-lg">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vehicula, erat vitae euismod efficitur, ex nunc varius lacus, sit amet bibendum lectus erat eget arcu.
                        </p>
                    </section>
                    
                    <section className="mb-8">
                        <h3 className="text-2xl mb-2">Privacy Policy</h3>
                        <p className="text-lg mb-2">
                            We value your privacy and are committed to protecting your personal information. This privacy policy explains how we handle your personal data.
                        </p>
                        <p className="text-lg mb-2">
                            By using our website, you consent to the collection and use of your information as outlined in this policy.
                        </p>
                        <p className="text-lg">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vehicula, erat vitae euismod efficitur, ex nunc varius lacus, sit amet bibendum lectus erat eget arcu.
                        </p>
                    </section>
                    
                    <section>
                        <h3 className="text-2xl mb-2">Cookie Policy</h3>
                        <p className="text-lg mb-2">
                            Our website uses cookies to improve your experience. This cookie policy explains what cookies are and how we use them.
                        </p>
                        <p className="text-lg mb-2">
                            By using our website, you agree to the use of cookies in accordance with this policy.
                        </p>
                        <p className="text-lg">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vehicula, erat vitae euismod efficitur, ex nunc varius lacus, sit amet bibendum lectus erat eget arcu.
                        </p>
                    </section>
                </div>
            </div>
            <Footer />
        </div>
    );
}
