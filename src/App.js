import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import FeaturedLessons from "./components/FeaturedLessons";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

/**
 * App Component
 *
 * Renders the main application layout with header, hero section, services, featured lessons, call-to-action, and footer.
 *
 * @returns {JSX.Element} The main application layout.
 */
function App() {
  return (
    <div>
      <Header />
      <Hero />
      <Services />
      <FeaturedLessons />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
