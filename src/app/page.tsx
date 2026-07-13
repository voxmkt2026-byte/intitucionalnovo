import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import PersonaGateway from "@/components/PersonaGateway";
import TrustLogos from "@/components/TrustLogos";
import ValueProps from "@/components/ValueProps";
import CaseStudy from "@/components/CaseStudy";

import ParcelSimulator from "@/components/ParcelSimulator";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <ValueProps />
        <About />
        <TrustLogos />
        <Testimonials />
        <CaseStudy />
        <ParcelSimulator />
        <PersonaGateway />

      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
