import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Titanium Consultoria | Crédito sem banco para quem está construindo",
  description:
    "Consultoria financeira para produtores rurais, empresários e profissionais liberais que querem expandir patrimônio sem pagar juros bancários. Cartas contempladas auditadas. CNPJ 46.640.755/0001-51.",
  keywords: [
    "carta contemplada",
    "consórcio contemplado",
    "crédito sem juros bancários",
    "consórcio agro",
    "carta contemplada imóvel",
    "carta contemplada veículo",
    "titanium consultoria",
    "crédito rural",
    "consórcio empresário",
    "carta contemplada verificada",
  ],
  authors: [{ name: "Titanium Consultoria" }],
  openGraph: {
    title: "Titanium Consultoria | Crédito sem banco para quem está construindo",
    description:
      "Do agro ao imóvel. Da frota à clínica. Crédito via consórcio contemplado, sem financiamento bancário tradicional. Segurança jurídica, CNPJ ativo, regulamentado pelo Banco Central.",
    url: "https://titaniumconsultoria.com.br",
    siteName: "Titanium Consultoria",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://titaniumconsultoria.com.br/cartas/titanium-logo.png",
        width: 800,
        height: 600,
        alt: "Titanium Consultoria — Crédito inteligente para construtores de patrimônio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Titanium Consultoria | Crédito sem banco",
    description:
      "Acesse crédito com taxas menores que o financiamento tradicional",
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
  themeColor: "#F8F7F4",
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
    "description": "Consultoria financeira especializada em cartas contempladas para produtores rurais, empresários e profissionais liberais.",
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
    "name": "Carta Contemplada de Imóveis",
    "provider": { "@id": "https://titaniumconsultoria.com.br/#organization" },
    "description": "Intermediação de cartas contempladas para aquisição de imóveis, sem financiamento bancário tradicional.",
    "areaServed": "BR",
    "serviceType": "FinancialService"
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://titaniumconsultoria.com.br/#service-veiculo",
    "name": "Carta Contemplada de Veículos e Frota",
    "provider": { "@id": "https://titaniumconsultoria.com.br/#organization" },
    "description": "Crédito aprovado para aquisição de veículos, caminhões e frota sem financiamento bancário.",
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
    <html lang="pt-BR" className={`${jakarta.variable} antialiased`}>
      <head>
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />


      </head>
      <body className="min-h-full flex flex-col" style={{ background: "var(--bg)", color: "var(--ink)" }}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-green-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-bold focus:shadow-lg"
        >
          Pular para o conteúdo principal
        </a>
        {children}

        {/* Google Ads + GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1KE95X84T0"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1KE95X84T0');
            gtag('config', 'AW-18248652606');
          `}
        </Script>

        {/* Meta Pixel */}
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1667309107949808');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1667309107949808&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
