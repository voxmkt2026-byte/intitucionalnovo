"use client";

import { useState } from "react";
import Link from "next/link";

export default function PortalLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/colaboradores/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Erro ao realizar login.");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-[#0b0f19]/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 font-jakarta">
      <div className="text-center space-y-2 mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#15B85C]/10 border border-[#15B85C]/20 text-[#15B85C] text-[10px] font-bold tracking-wider uppercase">
          Área do Representante
        </span>
        <h2 className="text-2xl font-bold text-white tracking-tight">Portal do Representante</h2>
        <p className="text-slate-400 font-light text-xs leading-relaxed">
          Acesse seu painel com e-mail e senha para acompanhar seus clientes, indicações e comissões.
        </p>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-5 font-medium leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="portal-email" className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">E-mail cadastrado</label>
          <input
            id="portal-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            placeholder="Ex: representante@empresa.com"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:border-[#15B85C] focus:ring-2 focus:ring-[#15B85C]/20 focus:outline-none transition-all text-white placeholder:text-slate-600"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="portal-senha" className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">Sua senha</label>
            <Link href="/representante/esqueci-senha" className="text-[11px] font-semibold text-[#15B85C] hover:underline">
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <input
              id="portal-senha"
              type={showPassword ? "text" : "password"}
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
              autoComplete="current-password"
              placeholder="Insira sua senha de acesso"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 pr-10 text-xs focus:border-[#15B85C] focus:ring-2 focus:ring-[#15B85C]/20 focus:outline-none transition-all text-white placeholder:text-slate-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs focus:outline-none cursor-pointer"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              title={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? "Ocultar" : "Ver"}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#0A7B3E] hover:bg-[#086332] disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold transition-all shadow-lg hover:shadow-[#0A7B3E]/30 text-xs uppercase tracking-wider cursor-pointer border-none"
          >
            {loading ? "Autenticando..." : "Acessar dashboard"}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center pt-4 border-t border-slate-800/80">
        <p className="text-xs text-slate-400 font-light">
          Ainda não é representante Titanium?{" "}
          <Link href="/representante#cadastro" className="text-[#15B85C] hover:underline font-semibold">
            Cadastre-se aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
