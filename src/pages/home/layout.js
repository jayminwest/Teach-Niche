import React from "react";
import Hero from "../../components/Hero";
import Services from "../../components/Services";
import FeaturedLessons from "../../components/FeaturedLessons";
import CTA from "../../components/CTA";

const HomePage = () => {
  return (
    <>
      <Hero />
      <Services />
      <FeaturedLessons />
      <CTA />
    </>
  );
};

export default HomePage; 