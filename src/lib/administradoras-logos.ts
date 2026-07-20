import React from "react";

export interface AdministradoraConfig {
  name: string;
  shortName: string;
  color: string;
  bgTint: string;
  borderColor: string;
  logoSvg: string; // inline SVG string or path
}

export const ADMINISTRADORAS_MAP: Record<string, AdministradoraConfig> = {
  caixa: {
    name: "Caixa Consórcios",
    shortName: "Caixa",
    color: "#005CA9",
    bgTint: "rgba(0, 92, 169, 0.08)",
    borderColor: "rgba(0, 92, 169, 0.25)",
    logoSvg: "caixa",
  },
  bradesco: {
    name: "Bradesco Consórcios",
    shortName: "Bradesco",
    color: "#CC092F",
    bgTint: "rgba(204, 9, 47, 0.08)",
    borderColor: "rgba(204, 9, 47, 0.25)",
    logoSvg: "bradesco",
  },
  itau: {
    name: "Itaú Consórcios",
    shortName: "Itaú",
    color: "#EC7000",
    bgTint: "rgba(236, 112, 0, 0.08)",
    borderColor: "rgba(236, 112, 0, 0.25)",
    logoSvg: "itau",
  },
  bb: {
    name: "Banco do Brasil",
    shortName: "Banco do Brasil",
    color: "#0038A8",
    bgTint: "rgba(0, 56, 168, 0.08)",
    borderColor: "rgba(0, 56, 168, 0.25)",
    logoSvg: "bb",
  },
  porto: {
    name: "Porto Seguro Consórcio",
    shortName: "Porto Seguro",
    color: "#004B93",
    bgTint: "rgba(0, 75, 147, 0.08)",
    borderColor: "rgba(0, 75, 147, 0.25)",
    logoSvg: "porto",
  },
  sicredi: {
    name: "Sicredi",
    shortName: "Sicredi",
    color: "#3F7A00",
    bgTint: "rgba(63, 122, 0, 0.08)",
    borderColor: "rgba(63, 122, 0, 0.25)",
    logoSvg: "sicredi",
  },
  santander: {
    name: "Santander Consórcios",
    shortName: "Santander",
    color: "#EC0000",
    bgTint: "rgba(236, 0, 0, 0.08)",
    borderColor: "rgba(236, 0, 0, 0.25)",
    logoSvg: "santander",
  },
  ademicon: {
    name: "Ademicon",
    shortName: "Ademicon",
    color: "#002B49",
    bgTint: "rgba(0, 43, 73, 0.08)",
    borderColor: "rgba(0, 43, 73, 0.25)",
    logoSvg: "ademicon",
  },
  rodobens: {
    name: "Rodobens",
    shortName: "Rodobens",
    color: "#003A70",
    bgTint: "rgba(0, 58, 112, 0.08)",
    borderColor: "rgba(0, 58, 112, 0.25)",
    logoSvg: "rodobens",
  },
  hs: {
    name: "HS Consórcios",
    shortName: "HS Consórcios",
    color: "#007A3D",
    bgTint: "rgba(0, 122, 61, 0.08)",
    borderColor: "rgba(0, 122, 61, 0.25)",
    logoSvg: "hs",
  },
  embracon: {
    name: "Embracon",
    shortName: "Embracon",
    color: "#D91B24",
    bgTint: "rgba(217, 27, 36, 0.08)",
    borderColor: "rgba(217, 27, 36, 0.25)",
    logoSvg: "embracon",
  },
};

export function getAdminKey(name: string): string {
  const norm = (name || "").toLowerCase().trim();
  if (norm.includes("caixa")) return "caixa";
  if (norm.includes("bradesco")) return "bradesco";
  if (norm.includes("itaú") || norm.includes("itau")) return "itau";
  if (norm.includes("brasil") || norm.includes("bb")) return "bb";
  if (norm.includes("porto")) return "porto";
  if (norm.includes("sicredi")) return "sicredi";
  if (norm.includes("santander")) return "santander";
  if (norm.includes("ademicon") || norm.includes("ademi")) return "ademicon";
  if (norm.includes("rodobens")) return "rodobens";
  if (norm.includes("hs")) return "hs";
  if (norm.includes("embracon")) return "embracon";
  return "default";
}

export function getAdminBadgeConfig(name: string): AdministradoraConfig {
  const key = getAdminKey(name);
  if (ADMINISTRADORAS_MAP[key]) {
    return ADMINISTRADORAS_MAP[key];
  }
  return {
    name: name || "Outra Administradora",
    shortName: name || "Outra",
    color: "#0A7B3E",
    bgTint: "rgba(10, 123, 62, 0.08)",
    borderColor: "rgba(10, 123, 62, 0.25)",
    logoSvg: "default",
  };
}
