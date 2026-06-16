import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import PainProfiles from "@/components/PainProfiles";
import ValueProps from "@/components/ValueProps";
import Segments from "@/components/Segments";
import ParcelSimulator from "@/components/ParcelSimulator";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <PainProfiles />
        <ValueProps />
        <Segments />
        <ParcelSimulator />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
