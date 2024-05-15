import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Testimonial from "./components/Testimonial";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import { ColorModeProvider } from "daisyui";

function App() {
  return (
    <div>
      <Header />
      <Hero />
      <Services />
      <Testimonial />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
