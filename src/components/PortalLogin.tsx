"use client";

import { useState } from "react";

export default function PortalLogin() {
  const [email, setEmail] = useState("");
  const [documento, setDocumento] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/colaboradores/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, documento }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao realizar login.");
      }

      // Reload page to apply session cookie and render dashboard
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-gray-900/50 border border-gray-800/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">Portal do Colaborador</h2>
        <p className="text-gray-400 font-light text-xs sm:text-sm">
          Acesse seu painel usando o e-mail e CPF/CNPJ cadastrados.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 font-light">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">E-mail Cadastrado</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Ex: consultor@empresa.com"
            className="w-full bg-slate-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">CPF ou CNPJ</label>
          <input
            type="text"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            required
            placeholder="Ex: 000.000.000-00"
            className="w-full bg-slate-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors text-white"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 disabled:text-gray-500 text-slate-950 font-bold transition-all shadow-lg hover:shadow-emerald-500/20 text-sm uppercase tracking-wide"
          >
            {loading ? "Autenticando..." : "Acessar Portal"}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Ainda não é colaborador Titanium?{" "}
          <a href="/colaboradores/cadastro/" className="text-emerald-400 hover:underline">
            Cadastre-se aqui
          </a>
        </p>
      </div>
    </div>
  );
}
