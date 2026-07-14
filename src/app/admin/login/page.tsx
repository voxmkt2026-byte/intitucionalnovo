"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email,   setEmail]   = useState("");
  const [senha,   setSenha]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      if (res.ok) {
        window.location.href = "/admin/cartas";
      } else {
        const json = await res.json();
        setError(json.error || "Credenciais inválidas");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#F8F7F4", fontFamily: "var(--font-jakarta), sans-serif" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ backgroundColor: "#0A7B3E" }}
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 style={{ color: "#1A1A1A" }} className="text-xl font-bold">Painel de Cartas</h1>
          <p style={{ color: "#8A8A8A" }} className="text-sm mt-1">Titanium Consultoria · Acesso restrito</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7"
          style={{
            backgroundColor: "#FFFFFF",
            boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 6px 24px rgba(0,0,0,.06)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" style={{ color: "#4A4A4A" }} className="block text-xs font-semibold mb-1.5 uppercase tracking-wide">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-xl px-4 py-3 text-sm transition-colors duration-150 outline-none"
                style={{
                  border: "1px solid #E5E2DC",
                  backgroundColor: "#F8F7F4",
                  color: "#1A1A1A",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#0A7B3E"; e.target.style.backgroundColor = "#FFFFFF"; }}
                onBlur={(e)  => { e.target.style.borderColor = "#E5E2DC"; e.target.style.backgroundColor = "#F8F7F4"; }}
              />
            </div>

            <div>
              <label htmlFor="senha" style={{ color: "#4A4A4A" }} className="block text-xs font-semibold mb-1.5 uppercase tracking-wide">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                autoComplete="current-password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-sm transition-colors duration-150 outline-none"
                style={{
                  border: "1px solid #E5E2DC",
                  backgroundColor: "#F8F7F4",
                  color: "#1A1A1A",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#0A7B3E"; e.target.style.backgroundColor = "#FFFFFF"; }}
                onBlur={(e)  => { e.target.style.borderColor = "#E5E2DC"; e.target.style.backgroundColor = "#F8F7F4"; }}
              />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "#FEF2F2", color: "#C44040", border: "1px solid #FECACA" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-3.5 rounded-full transition-opacity duration-200 cursor-pointer text-sm mt-2"
              style={{ backgroundColor: "#0A7B3E", color: "#FFFFFF", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Verificando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#8A8A8A" }}>
          Titanium Consultoria Financeira
        </p>
      </div>
    </main>
  );
}
