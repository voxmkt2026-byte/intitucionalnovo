import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MissaoVisaoValores from "@/components/MissaoVisaoValores";

export const metadata: Metadata = {
  title: "Missão, Visão e Valores | Titanium Consultoria",
  description:
    "Conheça a missão, visão e valores que guiam a Titanium Consultoria — transparência, segurança jurídica e compromisso com o cliente.",
};

export default function MissaoPage() {
  return (
    <>
      <Navbar />
      <MissaoVisaoValores />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
