import { cn } from "@/lib/utils";

export default function Footer() {
  return (
    <footer className="bg-green-dark text-white-slate">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-16 space-y-12">
        
        {/* ── Main Footer Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Col 1: Brand details */}
          <div className="md:col-span-5 space-y-4">
            <span className="font-[family-name:var(--font-montserrat)] text-lg font-black tracking-tight text-white-pure block">
              TITANIUM CONSULTORIA
            </span>
            <p className="font-sans text-sm text-white-slate/75 leading-relaxed max-w-sm">
              Especialistas em viabilizar a conquista de imóveis e veículos através de cartas de crédito contempladas com segurança jurídica total.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-green-lime font-[family-name:var(--font-montserrat)] uppercase tracking-widest">
                Regulado pelo Banco Central
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-4 space-y-4">
            <span className="font-[family-name:var(--font-montserrat)] text-xs font-extrabold tracking-widest text-white-pure/60 uppercase block">
              Serviços
            </span>
            <ul className="space-y-2.5 font-sans text-sm text-white-slate/80">
              <li>
                <a
                  href="https://titaniumconsultoria.com.br/cartas/cartas.php?segmento=imovel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-lime transition-colors duration-200"
                >
                  Cartas de Imóveis
                </a>
              </li>
              <li>
                <a
                  href="https://titaniumconsultoria.com.br/cartas/cartas.php?segmento=veiculo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-lime transition-colors duration-200"
                >
                  Cartas de Veículos
                </a>
              </li>
              <li>
                <a href="#simulador" className="hover:text-green-lime transition-colors duration-200">
                  Simulador de Parcelas
                </a>
              </li>
              <li>
                <a href="#sobre" className="hover:text-green-lime transition-colors duration-200">
                  Sobre Nós
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact details */}
          <div className="md:col-span-3 space-y-4">
            <span className="font-[family-name:var(--font-montserrat)] text-xs font-extrabold tracking-widest text-white-pure/60 uppercase block">
              Contato
            </span>
            <ul className="space-y-2.5 font-sans text-sm text-white-slate/80">
              <li>
                <a href="tel:+5511951014269" className="hover:text-green-lime transition-colors duration-200">
                  (11) 95101-4269
                </a>
              </li>
              <li>
                <a href="mailto:contato@titaniumconsultoria.com.br" className="hover:text-green-lime transition-colors duration-200">
                  contato@titaniumconsultoria.com.br
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5511951014269"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-green-lime transition-colors duration-200"
                >
                  Falar no WhatsApp
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Legal Disclaimer ── */}
        <div className="border-t border-white-pure/10 pt-8 space-y-4">
          <p className="text-[10px] text-white-slate/45 font-sans leading-relaxed">
            A Titanium Carta Contemplada atua como empresa de intermediação e assessoria comercial especializada em oportunidades de cartas contempladas para imóveis, veículos, caminhões, motos, máquinas e investimentos, oferecendo atendimento consultivo, transparente e personalizado em todo o território nacional.
          </p>
          <p className="text-[10px] text-white-slate/45 font-sans leading-relaxed">
            A Titanium não é instituição financeira, administradora de consórcios ou concedente de crédito. Nosso papel consiste na prospecção, apresentação e intermediação de oportunidades relacionadas a cartas contempladas, sempre em conformidade com a legislação brasileira, as normas de proteção ao consumidor e as diretrizes de segurança e privacidade aplicáveis.
          </p>
          <p className="text-[10px] text-white-slate/45 font-sans leading-relaxed">
            Transparência e Informações: Todas as condições relacionadas às cartas contempladas, incluindo valores de crédito, parcelas, prazos, taxas administrativas, regras de transferência e demais características do produto, são previamente apresentadas ao cliente antes da formalização de qualquer negociação. As condições podem variar de acordo com a administradora responsável, disponibilidade de mercado e análise documental aplicável.
          </p>
          <p className="text-[10px] text-white-slate/45 font-sans leading-relaxed">
            A aquisição de uma carta contemplada está sujeita à disponibilidade, validação documental e às políticas comerciais e operacionais da administradora ou do cedente responsável, não havendo garantia prévia de aprovação ou disponibilidade permanente de determinado crédito.
          </p>
          <p className="text-[10px] text-white-slate/45 font-sans leading-relaxed">
            Segurança e Proteção de Dados: A Titanium adota medidas de segurança, confidencialidade e proteção de informações, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 – LGPD), comprometendo-se com o tratamento responsável das informações fornecidas pelos usuários.
          </p>
          <p className="text-[10px] text-white-slate/45 font-sans leading-relaxed">
            A Titanium reforça que nunca solicita depósitos antecipados, pagamentos de taxas de liberação, cobranças para aprovação de crédito ou qualquer transferência financeira sem a devida formalização contratual e apresentação clara das condições da operação. Caso receba qualquer solicitação suspeita em nome da empresa, interrompa imediatamente o contato e comunique nossa equipe pelos canais oficiais de atendimento.
          </p>
          <p className="text-[10px] text-white-slate/45 font-sans leading-relaxed">
            Ao utilizar nossos serviços, o usuário declara estar ciente das condições de intermediação, das políticas de privacidade, dos termos de uso e das diretrizes de segurança adotadas pela Titanium Carta Contemplada.
          </p>
        </div>

        {/* ── Bottom Section ── */}
        <div className="border-t border-white-pure/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white-slate/50 font-sans">
          <span>
            © {new Date().getFullYear()} Titanium Consultoria. Todos os direitos reservados.
          </span>
          <span>
            CNPJ: 46.640.755/0001-51
          </span>
        </div>

      </div>
    </footer>
  );
}

