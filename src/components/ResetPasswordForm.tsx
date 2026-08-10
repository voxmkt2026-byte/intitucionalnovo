"use client";

import Link from "next/link";
import { useState } from "react";

type ResetPasswordFormProps = {
  token: string;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(token ? "" : "Este link de redefinição é inválido.");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (senha !== confirmacao) {
      setError("As senhas informadas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/colaboradores/senha/redefinir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, senha }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível redefinir a senha.");
      }

      setSuccess(true);
      setSenha("");
      setConfirmacao("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível redefinir a senha.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800 bg-[#0b0f19]/90 p-6 font-jakarta shadow-2xl backdrop-blur-xl sm:p-8">
      <div className="mb-6 space-y-2 text-center">
        <span className="inline-flex rounded-full border border-[#15B85C]/20 bg-[#15B85C]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#15B85C]">
          Segurança da conta
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-white">Crie uma nova senha</h1>
        <p className="text-xs font-light leading-relaxed text-slate-400">
          Use ao menos 8 caracteres, incluindo letra, número e caractere especial.
        </p>
      </div>

      {success ? (
        <div className="space-y-5 text-center">
          <div role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-medium leading-relaxed text-emerald-300">
            Senha redefinida com sucesso. Você já pode acessar o portal.
          </div>
          <Link href="/colaboradores/portal" className="inline-flex w-full justify-center rounded-xl bg-[#0A7B3E] py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#086332]">
            Acessar o portal
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <div role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs font-medium leading-relaxed text-rose-300">
              {error}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor="new-password" className="text-[11px] font-bold uppercase tracking-wide text-slate-300">Nova senha</label>
            <input
              id="new-password"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-xs text-white focus:border-[#15B85C] focus:outline-none focus:ring-2 focus:ring-[#15B85C]/20"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="text-[11px] font-bold uppercase tracking-wide text-slate-300">Confirme a nova senha</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmacao}
              onChange={(event) => setConfirmacao(event.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-xs text-white focus:border-[#15B85C] focus:outline-none focus:ring-2 focus:ring-[#15B85C]/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full cursor-pointer rounded-xl border-none bg-[#0A7B3E] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-[#086332] disabled:bg-slate-800 disabled:text-slate-500"
          >
            {loading ? "Redefinindo..." : "Redefinir senha"}
          </button>

          <div className="pt-2 text-center">
            <Link href="/colaboradores/esqueci-senha" className="text-xs font-semibold text-[#15B85C] hover:underline">
              Solicitar um novo link
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
