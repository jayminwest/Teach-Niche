import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import LessonsGrid from "./components/LessonsGrid";

export default function MarketplaceLayout() {
    return (
        <div className="container">
            <Header />
            <LessonsGrid />
            <Footer />
        </div>
    );
}