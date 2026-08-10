"use client";

import Link from "next/link";
import { useState } from "react";

const SUCCESS_MESSAGE =
  "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/colaboradores/senha/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível enviar as instruções agora.");
      }

      setMessage(SUCCESS_MESSAGE);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível enviar as instruções agora.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800 bg-[#0b0f19]/90 p-6 font-jakarta shadow-2xl backdrop-blur-xl sm:p-8">
      <div className="mb-6 space-y-2 text-center">
        <span className="inline-flex rounded-full border border-[#15B85C]/20 bg-[#15B85C]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#15B85C]">
          Recuperação de acesso
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-white">Esqueci minha senha</h1>
        <p className="text-xs font-light leading-relaxed text-slate-400">
          Informe o e-mail cadastrado. O link enviado será válido por 30 minutos e poderá ser usado uma única vez.
        </p>
      </div>

      {message ? (
        <div role="status" className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-medium leading-relaxed text-emerald-300">
          {message}
        </div>
      ) : null}

      {error ? (
        <div role="alert" className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs font-medium leading-relaxed text-rose-300">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="recovery-email" className="text-[11px] font-bold uppercase tracking-wide text-slate-300">
            E-mail cadastrado
          </label>
          <input
            id="recovery-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            placeholder="consultor@empresa.com"
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:border-[#15B85C] focus:outline-none focus:ring-2 focus:ring-[#15B85C]/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-xl border-none bg-[#0A7B3E] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-[#086332] hover:shadow-[#0A7B3E]/30 disabled:bg-slate-800 disabled:text-slate-500"
        >
          {loading ? "Enviando..." : "Enviar link de redefinição"}
        </button>
      </form>

      <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
        <Link href="/colaboradores/portal" className="text-xs font-semibold text-[#15B85C] hover:underline">
          Voltar ao acesso do portal
        </Link>
      </div>
    </div>
  );
}
