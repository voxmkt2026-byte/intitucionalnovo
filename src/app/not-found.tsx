import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg, #0a0a0a)",
        color: "var(--ink, #fff)",
        fontFamily: "var(--font-jakarta), sans-serif",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(4rem, 12vw, 8rem)",
          fontWeight: 800,
          lineHeight: 1,
          background: "linear-gradient(135deg, #0A7B3E, #0ed760)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "0.5rem",
        }}
      >
        404
      </h1>
      <p
        style={{
          fontSize: "1.25rem",
          color: "var(--ink-muted, rgba(255,255,255,0.6))",
          marginBottom: "2rem",
          maxWidth: "420px",
        }}
      >
        Página não encontrada. A página que você procura não existe ou foi
        movida.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.875rem 2rem",
          background: "#0A7B3E",
          color: "#fff",
          borderRadius: "999px",
          fontWeight: 600,
          fontSize: "1rem",
          textDecoration: "none",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
      >
        ← Voltar para o início
      </Link>
    </main>
  );
}
