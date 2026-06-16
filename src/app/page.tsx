import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ValueProps from "@/components/ValueProps";
import Segments from "@/components/Segments";
import ParcelSimulator from "@/components/ParcelSimulator";
import About from "@/components/About";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <ValueProps />
        <Segments />
        <ParcelSimulator />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

