'use client';

import LogoLoop from './LogoLoop';

/* ── LOGOS DOS PARCEIROS TITANIUM ───────────────────────────────────── */
const partnerLogos = [
  { src: '/uber/assets/logos/santander.png', alt: 'Santander' },
  { src: '/uber/assets/logos/bradesco.png', alt: 'Bradesco' },
  { src: '/uber/assets/logos/safra.png', alt: 'Safra' },
  { src: '/uber/assets/logos/sicredi.png', alt: 'Sicredi' },
  { src: '/uber/assets/logos/portoseguro.png', alt: 'Porto Seguro' },
  { src: '/uber/assets/logos/itau.png', alt: 'Itaú' },
  { src: '/uber/assets/logos/rodobens.png', alt: 'Rodobens' },
  { src: '/uber/assets/logos/embracon.png', alt: 'Embracon' },
  { src: '/uber/assets/logos/simplebank.png', alt: 'SimpleBank' },
  { src: '/uber/assets/logos/pagplus.png', alt: 'PagPlus' },
  { src: '/uber/assets/logos/mycon.png', alt: 'Mycon' },
];

export default function TrustLogos() {
  return (
    <section
      className="relative w-full py-10 overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-dark, #0a0e0a)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Subtítulo */}
      <div className="max-w-[1140px] mx-auto px-6 mb-6">
        <p
          className="text-center text-xs font-bold uppercase tracking-[0.25em] font-[family-name:var(--font-montserrat)]"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Administradoras parceiras
        </p>
      </div>

      {/* LogoLoop */}
      <div style={{ height: '60px', position: 'relative', overflow: 'hidden' }}>
        <LogoLoop
          logos={partnerLogos}
          speed={80}
          direction="left"
          logoHeight={36}
          gap={48}
          hoverSpeed={20}
          scaleOnHover
          fadeOut={false}
          ariaLabel="Parceiros Titanium Consultorias"
        />
      </div>
    </section>
  );
}
