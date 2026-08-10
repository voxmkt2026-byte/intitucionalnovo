"use client";

import { useState } from "react";
import Link from "next/link";

export default function PortalLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [documento, setDocumento] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"senha" | "documento">("senha");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = loginMethod === "senha"
        ? { email, senha }
        : { email, documento };

      const response = await fetch("/api/colaboradores/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <div className="max-w-md w-full bg-[#0b0f19]/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 font-jakarta">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#15B85C]/10 border border-[#15B85C]/20 text-[#15B85C] text-[10px] font-bold tracking-wider uppercase">
          Área do Parceiro
        </span>
        <h2 className="text-2xl font-bold text-white tracking-tight">Portal do Colaborador</h2>
        <p className="text-slate-400 font-light text-xs leading-relaxed">
          Acesse seu painel com suas credenciais para acompanhar seus clientes, indicações e comissões.
        </p>
      </div>

      {/* Login Method Toggle */}
      <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800 mb-5">
        <button
          type="button"
          onClick={() => { setLoginMethod("senha"); setError(""); }}
          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            loginMethod === "senha"
              ? "bg-[#0A7B3E] text-white shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          E-mail e Senha
        </button>
        <button
          type="button"
          onClick={() => { setLoginMethod("documento"); setError(""); }}
          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            loginMethod === "documento"
              ? "bg-[#0A7B3E] text-white shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          E-mail e CPF/CNPJ
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-5 font-medium leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">E-mail Cadastrado</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Ex: consultor@empresa.com"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:border-[#15B85C] focus:ring-2 focus:ring-[#15B85C]/20 focus:outline-none transition-all text-white placeholder:text-slate-600"
          />
        </div>

        {loginMethod === "senha" ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">Sua Senha</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                placeholder="Insira sua senha de acesso"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 pr-10 text-xs focus:border-[#15B85C] focus:ring-2 focus:ring-[#15B85C]/20 focus:outline-none transition-all text-white placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs focus:outline-none cursor-pointer"
                title={showPassword ? "Ocultar senha" : "Ver senha"}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">CPF ou CNPJ</label>
            <input
              type="text"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              required
              placeholder="Ex: 000.000.000-00"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:border-[#15B85C] focus:ring-2 focus:ring-[#15B85C]/20 focus:outline-none transition-all text-white placeholder:text-slate-600"
            />
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#0A7B3E] hover:bg-[#086332] disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold transition-all shadow-lg hover:shadow-[#0A7B3E]/30 text-xs uppercase tracking-wider cursor-pointer border-none"
          >
            {loading ? "Autenticando..." : "Acessar Dashboard"}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center pt-4 border-t border-slate-800/80">
        <p className="text-xs text-slate-400 font-light">
          Ainda não é parceiro Titanium?{" "}
          <Link href="/colaboradores#cadastro" className="text-[#15B85C] hover:underline font-semibold">
            Cadastre-se aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
