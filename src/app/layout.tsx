import type { Metadata, Viewport } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Titanium Consultoria | Cartas Contempladas de Elite",
  description:
    "Especialistas em cartas contempladas para imóveis e veículos. Segurança jurídica, transparência total e as melhores taxas do mercado.",
  keywords: [
    "cartas contempladas",
    "consórcio contemplado",
    "crédito imobiliário",
    "carta de crédito veículo",
    "titanium consultoria",
    "consórcio sem juros",
    "carta contemplada imóvel",
    "carta contemplada veículo",
  ],
  authors: [{ name: "Titanium Consultoria" }],
  openGraph: {
    title: "Titanium Consultoria | Cartas Contempladas de Elite",
    description:
      "Seu imóvel ou veículo sem financiamento, sem juros e com segurança jurídica. Cartas contempladas auditadas com as menores taxas do mercado.",
    url: "https://titaniumconsultoria.com.br",
    siteName: "Titanium Consultoria",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://titaniumconsultoria.com.br/cartas/titanium-logo.png",
        width: 800,
        height: 600,
        alt: "Titanium Consultoria — Cartas Contempladas de Elite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Titanium Consultoria | Cartas Contempladas de Elite",
    description:
      "Seu imóvel ou veículo sem financiamento, sem juros e com segurança jurídica.",
    images: ["https://titaniumconsultoria.com.br/cartas/titanium-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://titaniumconsultoria.com.br",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f6f6",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://titaniumconsultoria.com.br/#organization",
    "name": "Titanium Consultoria",
    "url": "https://titaniumconsultoria.com.br",
    "logo": "https://titaniumconsultoria.com.br/cartas/titanium-logo.png",
    "description": "Especialistas em cartas contempladas para imóveis e veículos com segurança jurídica total.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+55-11-95101-4269",
      "contactType": "customer service",
      "availableLanguage": "Portuguese",
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BR",
    },
    "sameAs": []
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://titaniumconsultoria.com.br/#service-imovel",
    "name": "Cartas Contempladas de Imóveis",
    "provider": {
      "@id": "https://titaniumconsultoria.com.br/#organization"
    },
    "description": "Cotas pré-aprovadas destinadas a aquisição ou incorporação de imóveis residenciais premium e galpões comerciais sem juros e com segurança jurídica total.",
    "areaServed": "BR",
    "serviceType": "FinancialService"
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://titaniumconsultoria.com.br/#service-veiculo",
    "name": "Cartas Contempladas de Veículos",
    "provider": {
      "@id": "https://titaniumconsultoria.com.br/#organization"
    },
    "description": "Acesso à liquidez imediata para aquisição de frotas executivas ou veículos de alta performance com planejamento inteligente, sem juros.",
    "areaServed": "BR",
    "serviceType": "FinancialService"
  }
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${inter.variable} antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white-bg text-green-dark">
        {children}
      </body>
    </html>
  );
}
