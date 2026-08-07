import React from "react";

interface AdministradoraLogoProps {
  name: string;
  className?: string;
}

export default function AdministradoraLogo({ name, className = "h-6 max-w-[120px] object-contain inline-block" }: AdministradoraLogoProps) {
  if (!name) return <span className="text-gray-400 font-light italic text-xs">Sem admin</span>;

  // Normalização do texto para correspondência de arquivo
  const normalized = name
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-") // Substitui caracteres especiais/espaços por hífen
    .replace(/-+/g, "-") // Remove hífens duplicados
    .replace(/^-|-$/g, ""); // Remove hífens no início/fim

  let slug = normalized;
  
  // Tratamento de typos ou encodings ruins do banco de dados (ex: ita?, hs cons?ricio)
  if (normalized.includes("ita") || normalized.includes("itau")) {
    slug = "itau";
  } else if (normalized.includes("hs-cons") || normalized.includes("hs-consorcio")) {
    slug = "hs-consorcio";
  } else if (normalized.includes("multiimarcas") || normalized.includes("multimarcas")) {
    slug = "multimarcas";
  } else if (normalized.includes("porto-seguro") || normalized.includes("porto")) {
    slug = "porto-seguro";
  }

  const knownSlugs = [
    "caixa",
    "cnp",
    "disal",
    "embracon",
    "hs-consorcio",
    "itau",
    "multimarcas",
    "mycon",
    "pagplus",
    "porto-seguro",
    "racon",
    "randon",
    "rodobens",
    "santander",
    "servopa",
    "sicoob",
    "simplebank",
    "volkswagen"
  ];

  if (knownSlugs.includes(slug)) {
    const logoSrc = `/images/logos/${slug}.png`;
    return (
      <div className="inline-flex items-center">
        <img
          src={logoSrc}
          alt={name}
          className={className}
          onError={(e) => {
            // Se o arquivo PNG não existir fisicamente no servidor ainda, esconde a tag de imagem corrompida e mostra o fallback de texto estilizado
            const img = e.currentTarget as HTMLImageElement;
            img.style.display = "none";
            const sibling = img.nextElementSibling as HTMLElement;
            if (sibling) {
              sibling.classList.remove("hidden");
            }
          }}
        />
        <span className="fallback-text hidden text-[10px] font-bold text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap">
          {name}
        </span>
      </div>
    );
  }

  // Administradora desconhecida ou customizada
  return (
    <span className="text-[10px] font-bold text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap">
      {name}
    </span>
  );
}
