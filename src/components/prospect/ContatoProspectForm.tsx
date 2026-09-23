"use client";

import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";

interface Props {
  token: string;
  contatoNome?: string | null;
  consultorNome: string;
  whatsappAction?: ReactNode;
}

export default function ContatoProspectForm({ token, contatoNome, consultorNome, whatsappAction }: Props) {
  const [nome, setNome] = useState(contatoNome || "");
  const [telefone, setTelefone] = useState("");
  const [horario, setHorario] = useState("Qualquer horário");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [validation, setValidation] = useState("");

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 10) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    else if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
    else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    else if (v.length > 0) v = `(${v}`;
    setTelefone(v);
    setValidation("");
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    if (nome.trim().length < 2 || !/^\d{10,11}$/.test(telefone.replace(/\D/g, ""))) {
      setValidation("Informe seu nome e um telefone completo com DDD.");
      return;
    }
    setStatus("sending");
    setValidation("");
    try {
      const response = await fetch(`/api/prospects/${encodeURIComponent(token)}/contato/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), telefone, horario }),
      });
      if (!response.ok) throw new Error("contact_failed");
      setStatus("success");
    } catch { setStatus("error"); }
  }

  if (status === "success") return (
    <div role="status" className="rounded-2xl border border-[#D1ECDD] bg-[#E8F5EE] p-6 text-base font-medium text-[#0A7B3E]">
      Pronto. {consultorNome} entra em contato no período escolhido.
    </div>
  );

  const inputClass = "liquid-glass-input min-h-12 w-full rounded-xl px-4 py-3 text-base text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A7B3E]";
  return (
    <section aria-labelledby="prospect-contact-title" className="liquid-glass rounded-3xl border border-white/90 p-6 sm:p-8">
      <h2 id="prospect-contact-title" className="text-xl font-bold text-slate-900">Prefiro que me liguem</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">Escolha o melhor período para conversar com {consultorNome}.</p>
      <form onSubmit={submit} className="mt-6 space-y-4" aria-busy={status === "sending"}>
        <div>
          <label htmlFor="prospect-name" className="mb-2 block text-sm font-semibold text-slate-700">Seu nome</label>
          <input id="prospect-name" name="nome" autoComplete="name" required minLength={2} maxLength={100} value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="prospect-phone" className="mb-2 block text-sm font-semibold text-slate-700">Telefone com DDD</label>
          <input id="prospect-phone" name="telefone" type="tel" inputMode="tel" autoComplete="tel-national" required value={telefone} onChange={handlePhoneChange} placeholder="(00) 00000-0000" className={inputClass} aria-describedby={validation ? "prospect-validation" : undefined} />
        </div>
        <div>
          <label htmlFor="prospect-time" className="mb-2 block text-sm font-semibold text-slate-700">Melhor horário</label>
          <select id="prospect-time" name="horario" value={horario} onChange={(e) => setHorario(e.target.value)} className={inputClass}>
            <option>Manhã</option><option>Tarde</option><option>Qualquer horário</option>
          </select>
        </div>
        {validation && <p id="prospect-validation" role="alert" className="text-sm text-rose-700">{validation}</p>}
        <button disabled={status === "sending"} className="min-h-12 w-full cursor-pointer rounded-xl bg-[#0A7B3E] px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#086332] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A7B3E] disabled:cursor-wait disabled:opacity-60">
          {status === "sending" ? "Enviando…" : `Quero que o ${consultorNome} me ligue`}
        </button>
      </form>
      {status === "error" && <div className="mt-4 space-y-3">
        <p role="alert" className="text-sm text-slate-600">Não conseguimos enviar agora. Você também pode chamar no WhatsApp.</p>
        {whatsappAction}
      </div>}
    </section>
  );
}
