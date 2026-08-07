"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

interface Partner {
  id: number;
  nome: string;
  documento_cpf_cnpj: string;
  email: string;
  telefone: string;
  cidade: string;
  redes_sociais: string;
  chave_pix: string;
  status_onboarding: string;
  codigo_ref: string;
  vende_consorcio: boolean;
  experiencia_administradoras: string;
  experiencia_volume: string;
  experiencia_segmentos: string;
  base_tamanho: string;
  base_canais: string;
  base_ticket_medio: string;
  aceite_playbook: boolean;
  ip_assinatura: string;
  assinado_em: string | null;
  criado_em: string;
}

interface Planilha {
  id: number;
  filename: string;
  linhas_processadas: number;
  status: string;
  erro_mensagem: string | null;
  criado_em: string;
}

interface Comissao {
  id: number;
  cliente_nome: string;
  valor_credito: number;
  comissao_valor: number;
  status_pagamento: string;
  criado_em: string;
  parceiro_nome: string;
  codigo_ref: string;
}

interface AdminColaboradoresClientProps {
  initialPartners: Partner[];
  initialPlanilhas: Planilha[];
  initialComissoes: Comissao[];
}

export default function AdminColaboradoresClient({
  initialPartners,
  initialPlanilhas,
  initialComissoes,
}: AdminColaboradoresClientProps) {
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [planilhas, setPlanilhas] = useState<Planilha[]>(initialPlanilhas);
  const [comissoes, setComissoes] = useState<Comissao[]>(initialComissoes);

  const [activeTab, setActiveTab] = useState<"candidatos" | "ativos" | "importar" | "extrato">("candidatos");
  
  // Sheet parsing states
  const [filename, setFilename] = useState("");
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importStatus, setImportStatus] = useState({ type: "", text: "" });
  const [importLoading, setImportLoading] = useState(false);
  const [unmatchedLines, setUnmatchedLines] = useState<any[]>([]);

  // Onboarding actions
  const handleUpdateStatus = async (id: number, newStatus: "Ativo" | "Bloqueado") => {
    try {
      const res = await fetch(`/api/admin/colaboradores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_onboarding: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar status");

      setPartners((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status_onboarding: newStatus } : p))
      );
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Parsing Excel/CSV file using SheetJS (xlsx)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    setImportStatus({ type: "", text: "" });
    setUnmatchedLines([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        if (data.length === 0) {
          setImportStatus({ type: "error", text: "A planilha está vazia." });
          return;
        }

        // Map columns dynamically
        const mapped = data.map((row: any) => {
          // Find client name
          const cliente_nome = row["nome"] || row["cliente"] || row["Cliente"] || row["Nome"] || "";
          
          // Find values
          const valor_credito = row["credito"] || row["valor"] || row["valor_credito"] || row["Valor"] || 0;
          const comissao_valor = row["comissão"] || row["comissao"] || row["comissao_valor"] || row["Comissao"] || 0;
          
          // Find referral identifier or doc
          const codigo_ref_ou_doc = row["codigo"] || row["ref"] || row["indicador"] || row["cpf"] || row["cnpj"] || row["Parceiro"] || "";

          const data_fechamento = row["data"] || row["data_fechamento"] || row["Data"] || "";

          return { cliente_nome, valor_credito, comissao_valor, codigo_ref_ou_doc, data_fechamento };
        });

        setParsedRows(mapped);
        setImportStatus({
          type: "info",
          text: `Planilha lida com sucesso! Encontradas ${mapped.length} comissões prontas para importação.`,
        });
      } catch (err: any) {
        setImportStatus({ type: "error", text: `Falha ao ler o arquivo: ${err.message}` });
      }
    };
    reader.readAsBinaryString(file);
  };

  // POST parsed JSON to match engine API
  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;

    setImportLoading(true);
    setImportStatus({ type: "", text: "" });

    try {
      const res = await fetch("/api/admin/colaboradores/importar-planilha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, rows: parsedRows }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao importar comissões");

      setImportStatus({
        type: "success",
        text: `Importação concluída! ${data.matchedCount} linhas associadas com sucesso. ${data.unmatchedCount} alertas gerados.`,
      });

      // Update upload list & commissions list in background
      if (data.success) {
        window.location.reload(); // Reload data from server
      }
    } catch (e: any) {
      setImportStatus({ type: "error", text: e.message });
    } finally {
      setImportLoading(false);
    }
  };

  const pendingPartners = partners.filter((p) => p.status_onboarding === "Pendente");
  const activePartners = partners.filter((p) => p.status_onboarding === "Ativo");

  return (
    <div style={{ color: "var(--admin-text)" }}>
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, margin: 0 }}>Gestão de Colaboradores</h1>
          <p style={{ fontSize: "14px", color: "var(--admin-text-soft)", margin: "4px 0 0 0" }}>
            Inbox de candidatos, ativação de colaboradores e importação de planilhas financeiras.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--admin-border)", marginBottom: "25px" }}>
        <button
          onClick={() => setActiveTab("candidatos")}
          style={{
            padding: "12px 18px",
            background: "none",
            border: "none",
            color: activeTab === "candidatos" ? "#10b981" : "var(--admin-text-mute)",
            borderBottom: activeTab === "candidatos" ? "2px solid #10b981" : "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Candidatos Onboarding ({pendingPartners.length})
        </button>
        <button
          onClick={() => setActiveTab("ativos")}
          style={{
            padding: "12px 18px",
            background: "none",
            border: "none",
            color: activeTab === "ativos" ? "#10b981" : "var(--admin-text-mute)",
            borderBottom: activeTab === "ativos" ? "2px solid #10b981" : "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Colaboradores Ativos ({activePartners.length})
        </button>
        <button
          onClick={() => setActiveTab("importar")}
          style={{
            padding: "12px 18px",
            background: "none",
            border: "none",
            color: activeTab === "importar" ? "#10b981" : "var(--admin-text-mute)",
            borderBottom: activeTab === "importar" ? "2px solid #10b981" : "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Importar Planilha de Comissões
        </button>
        <button
          onClick={() => setActiveTab("extrato")}
          style={{
            padding: "12px 18px",
            background: "none",
            border: "none",
            color: activeTab === "extrato" ? "#10b981" : "var(--admin-text-mute)",
            borderBottom: activeTab === "extrato" ? "2px solid #10b981" : "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Histórico & Lançamentos
        </button>
      </div>

      {/* TAB Content: Candidatos */}
      {activeTab === "candidatos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {pendingPartners.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--admin-text-mute)", border: "1px dashed var(--admin-border)", borderRadius: "12px" }}>
              Nenhum candidato pendente no momento.
            </div>
          ) : (
            pendingPartners.map((p) => (
              <div key={p.id} style={{ padding: "20px", border: "1px solid var(--admin-border)", borderRadius: "12px", backgroundColor: "var(--admin-surface)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "15px", marginBottom: "15px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>{p.nome}</h3>
                    <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--admin-text-soft)" }}>
                      📧 {p.email} | 📞 {p.telefone} | 📍 {p.cidade}
                    </p>
                    <p style={{ margin: "4px 0", fontSize: "11px", color: "var(--admin-text-mute)" }}>
                      PIX: <span style={{ fontFamily: "monospace" }}>{p.chave_pix}</span> | Doc: {p.documento_cpf_cnpj}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <a
                      href={`/admin/colaboradores/${p.id}/contrato`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ padding: "8px 12px", border: "1px solid #10b981", borderRadius: "8px", fontSize: "12px", textDecoration: "none", color: "#10b981", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "5px" }}
                    >
                      📄 Ficha / Contrato
                    </a>
                    <a
                      href={`/api/admin/colaboradores/${p.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ padding: "8px 12px", border: "1px solid #6366f1", borderRadius: "8px", fontSize: "12px", textDecoration: "none", color: "#6366f1", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "5px" }}
                    >
                      ⬇️ Baixar PDF
                    </a>
                    <button
                      onClick={() => handleUpdateStatus(p.id, "Ativo")}
                      style={{ padding: "8px 16px", backgroundColor: "#0A7B3E", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
                    >
                      ✓ Aprovar & Ativar
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(p.id, "Bloqueado")}
                      style={{ padding: "8px 16px", backgroundColor: "transparent", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
                    >
                      Recusar
                    </button>
                  </div>
                </div>

                {/* Professional details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", borderTop: "1px solid var(--admin-border)", paddingTop: "15px", fontSize: "12px", color: "var(--admin-text-soft)" }}>
                  <div>
                    <p style={{ margin: "4px 0" }}><strong>Já vende consórcio:</strong> {p.vende_consorcio ? "Sim" : "Não"}</p>
                    <p style={{ margin: "4px 0" }}><strong>Administradoras:</strong> {p.experiencia_administradoras || "—"}</p>
                    <p style={{ margin: "4px 0" }}><strong>Volume de Vendas:</strong> {p.experiencia_volume || "—"}</p>
                    <p style={{ margin: "4px 0" }}><strong>Segmentos:</strong> {p.experiencia_segmentos || "—"}</p>
                  </div>
                  <div>
                    <p style={{ margin: "4px 0" }}><strong>Tamanho da Base:</strong> {p.base_tamanho || "—"}</p>
                    <p style={{ margin: "4px 0" }}><strong>Canais de Captação:</strong> {p.base_canais || "—"}</p>
                    <p style={{ margin: "4px 0" }}><strong>Ticket Médio:</strong> {p.base_ticket_medio || "—"}</p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Contrato:</strong> Playbook assinado via IP {p.ip_assinatura} em {p.assinado_em ? new Date(p.assinado_em).toLocaleString("pt-BR") : "—"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB Content: Ativos */}
      {activeTab === "ativos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {activePartners.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--admin-text-mute)", border: "1px dashed var(--admin-border)", borderRadius: "12px" }}>
              Nenhum colaborador ativo no momento.
            </div>
          ) : (
            activePartners.map((p) => (
              <div key={p.id} style={{ padding: "18px", border: "1px solid var(--admin-border)", borderRadius: "10px", backgroundColor: "var(--admin-surface)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", alignItems: "center", gap: "15px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>{p.nome}</h3>
                  <p style={{ margin: "4px 0", fontSize: "12px", color: "var(--admin-text-soft)" }}>
                    Código REF: <span style={{ color: "#10b981", fontWeight: 600 }}>{p.codigo_ref}</span> | WhatsApp: {p.telefone}
                  </p>
                  <p style={{ margin: "4px 0", fontSize: "11px", color: "var(--admin-text-mute)" }}>
                    E-mail: {p.email} | PIX: {p.chave_pix}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                   <a
                      href={`/admin/colaboradores/${p.id}/contrato`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ padding: "8px 12px", border: "1px solid #10b981", borderRadius: "6px", fontSize: "12px", textDecoration: "none", color: "#10b981", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "5px" }}
                    >
                      📄 Ficha / Contrato
                    </a>
                    <a
                      href={`/api/admin/colaboradores/${p.id}/pdf`}
                     target="_blank"
                     rel="noreferrer"
                     style={{ padding: "8px 12px", border: "1px solid #6366f1", borderRadius: "6px", fontSize: "12px", textDecoration: "none", color: "#6366f1", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "5px" }}
                   >
                     ⬇️ Baixar PDF
                   </a>
                   <a
                     href={`https://wa.me/55${p.telefone.replace(/\D/g, "")}`}
                     target="_blank"
                     rel="noreferrer"
                     style={{ padding: "8px 12px", border: "1px solid var(--admin-border)", borderRadius: "6px", fontSize: "12px", textDecoration: "none", color: "var(--admin-text-soft)", fontWeight: 500 }}
                   >
                     💬 Enviar WhatsApp
                   </a>
                    <button
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir este colaborador e todo o histórico dele do banco de dados?")) {
                          handleUpdateStatus(p.id, "Bloqueado");
                        }
                      }}
                      style={{ padding: "8px 12px", backgroundColor: "transparent", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "6px", fontSize: "12px", fontWeight: 650, cursor: "pointer" }}
                    >
                      Excluir
                    </button>
                 </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB Content: Importar */}
      {activeTab === "importar" && (
        <div style={{ padding: "20px", border: "1px solid var(--admin-border)", borderRadius: "12px", backgroundColor: "var(--admin-surface)" }}>
          <h3 style={{ margin: "0 0 15px 0", fontSize: "18px", fontWeight: 700 }}>Subir Planilha Comercial</h3>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600 }}>Selecione o arquivo Excel ou CSV:</label>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              style={{ padding: "10px", border: "1px solid var(--admin-border)", borderRadius: "8px", backgroundColor: "var(--admin-bg)", color: "var(--admin-text)", fontSize: "13px", cursor: "pointer" }}
            />
          </div>

          {importStatus.text && (
            <div style={{
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "13px",
              backgroundColor: importStatus.type === "success" ? "#0A7B3E22" : importStatus.type === "error" ? "#ef444422" : "var(--admin-border)",
              border: `1px solid ${importStatus.type === "success" ? "#0A7B3E66" : importStatus.type === "error" ? "#ef444466" : "var(--admin-border)"}`,
              color: importStatus.type === "success" ? "#10b981" : importStatus.type === "error" ? "#ef4444" : "var(--admin-text)"
            }}>
              {importStatus.text}
            </div>
          )}

          {parsedRows.length > 0 && !importLoading && (
            <div style={{ marginTop: "20px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "10px" }}>Pré-visualização dos Dados ({parsedRows.length} linhas)</h4>
              <div style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid var(--admin-border)", borderRadius: "8px", marginBottom: "20px" }}>
                <table style={{ width: "100%", textAlign: "left", fontSize: "12px", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--admin-border)", backgroundColor: "var(--admin-border)" }}>
                      <th style={{ padding: "8px" }}>Cliente</th>
                      <th style={{ padding: "8px" }}>Crédito</th>
                      <th style={{ padding: "8px" }}>Comissão</th>
                      <th style={{ padding: "8px" }}>Código/Ref/Doc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 10).map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--admin-border)" }}>
                        <td style={{ padding: "8px" }}>{row.cliente_nome}</td>
                        <td style={{ padding: "8px" }}>{row.valor_credito}</td>
                        <td style={{ padding: "8px" }}>{row.comissao_valor}</td>
                        <td style={{ padding: "8px" }}>{row.codigo_ref_ou_doc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedRows.length > 10 && (
                  <p style={{ fontSize: "11px", color: "var(--admin-text-mute)", padding: "8px", margin: 0, textAlign: "center" }}>
                    ... e mais {parsedRows.length - 10} linhas ocultadas.
                  </p>
                )}
              </div>

              <button
                onClick={handleConfirmImport}
                style={{ padding: "12px 24px", backgroundColor: "#10b981", color: "slate-950", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }}
              >
                Confirmar Importação de comissões
              </button>
            </div>
          )}

          {importLoading && (
            <div style={{ color: "var(--admin-text-soft)", fontSize: "13px" }}>
              Salvando e associando lançamentos... Aguarde.
            </div>
          )}
        </div>
      )}

      {/* TAB Content: Extratos */}
      {activeTab === "extrato" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "25px" }}>
          {/* Planilhas list */}
          <div style={{ padding: "20px", border: "1px solid var(--admin-border)", borderRadius: "12px", backgroundColor: "var(--admin-surface)" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", fontWeight: 700 }}>Arquivos Importados</h3>
            {planilhas.length === 0 ? (
              <p style={{ fontSize: "12px", color: "var(--admin-text-mute)" }}>Nenhuma planilha importada.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {planilhas.map((pl) => (
                  <div key={pl.id} style={{ padding: "12px", border: "1px solid var(--admin-border)", borderRadius: "8px", backgroundColor: "var(--admin-surface)" }}>
                    <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 700 }}>{pl.filename}</h4>
                    <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "var(--admin-text-soft)" }}>
                      Lançamentos: {pl.linhas_processadas} | Status:{" "}
                      <span style={{ color: pl.status === "concluido" ? "#10b981" : "#ef4444", fontWeight: 600 }}>{pl.status}</span>
                    </p>
                    {pl.erro_mensagem && (
                      <p style={{ margin: "4px 0 0 0", fontSize: "10px", color: "#ef4444" }}>{pl.erro_mensagem}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Commissions list */}
          <div style={{ padding: "20px", border: "1px solid var(--admin-border)", borderRadius: "12px", backgroundColor: "var(--admin-surface)", overflowX: "auto" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", fontWeight: 700 }}>Lançamentos de Comissões Recentes</h3>
            {comissoes.length === 0 ? (
              <p style={{ fontSize: "12px", color: "var(--admin-text-mute)" }}>Nenhum extrato lançado.</p>
            ) : (
              <table style={{ width: "100%", textAlign: "left", fontSize: "12px", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--admin-border)", color: "var(--admin-text-mute)" }}>
                    <th style={{ padding: "8px pb-3" }}>Colaborador</th>
                    <th style={{ padding: "8px pb-3" }}>Cliente</th>
                    <th style={{ padding: "8px pb-3" }}>Crédito</th>
                    <th style={{ padding: "8px pb-3" }}>Comissão</th>
                    <th style={{ padding: "8px pb-3", textAlign: "right" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {comissoes.map((c) => (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--admin-border)" }}>
                      <td style={{ padding: "10px 8px" }}>
                        <span style={{ fontWeight: 650, display: "block" }}>{c.parceiro_nome}</span>
                        <span style={{ fontSize: "10px", color: "var(--admin-text-mute)" }}>({c.codigo_ref})</span>
                      </td>
                      <td style={{ padding: "10px 8px" }}>{c.cliente_nome}</td>
                      <td style={{ padding: "10px 8px" }}>
                        R$ {Number(c.valor_credito).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "10px 8px", color: "#10b981", fontWeight: 600 }}>
                        R$ {Number(c.comissao_valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "right" }}>
                        <span style={{
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: 600,
                          backgroundColor: c.status_pagamento === "pago" ? "#0A7B3E22" : "#eab30822",
                          border: `1px solid ${c.status_pagamento === "pago" ? "#0A7B3E44" : "#eab30844"}`,
                          color: c.status_pagamento === "pago" ? "#10b981" : "#eab308",
                        }}>
                          {c.status_pagamento === "pago" ? "Pago" : "A Pagar"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
