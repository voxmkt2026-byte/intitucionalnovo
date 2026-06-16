import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Timeline from "@/components/Timeline";

export const metadata: Metadata = {
  title: "Nossa Trajetória | Titanium Consultoria",
  description:
    "Conheça a história da Titanium Consultoria — de 2005 a 2026, cada marco que construiu nossa referência em cartas contempladas.",
};

export default function TrajetoriaPage() {
  return (
    <>
      <Navbar />
      <Timeline />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
