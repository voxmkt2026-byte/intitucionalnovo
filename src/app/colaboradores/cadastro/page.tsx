"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CadastroColaboradorPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/colaboradores");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-jakarta">
      <div className="text-slate-500 text-xs font-semibold animate-pulse uppercase tracking-wider">
        Redirecionando para o cadastro...
      </div>
    </div>
  );
}
