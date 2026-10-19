import { useEffect, useRef, useState } from 'react';

// Preço que gira como um caça-níquel: mostra `de` (o preço depois do lançamento) parado por um instante, depois cada
// dígito roda para trás (borrado no começo) e desacelera até parar em `valor`. Os dígitos que sobram à esquerda
// (o 1 do 197) sobem e somem, sem virar zero.
const VOLTAS = 2;
const PAUSA_MS = 900; // tempo em que o preço de antes fica à vista antes de girar

export function Odometro({ valor, de = valor, className = '' }: { valor: number; de?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [girar, setGirar] = useState(false);
  const textoFim = String(valor);
  const textoIni = String(de);
  const casas = Math.max(textoFim.length, textoIni.length);
  const sobra = casas - textoFim.length; // colunas que somem no fim
  const ini = textoIni.padStart(casas, '0').split('').map(Number);
  const fim = textoFim.padStart(casas, '0').split('').map(Number);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // movimento reduzido: vai direto ao preço final (as transições estão desligadas no CSS)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setGirar(true);
    let espera = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      io.disconnect();
      espera = window.setTimeout(() => setGirar(true), de !== valor ? PAUSA_MS : 0);
    }, { threshold: 0.7 });
    io.observe(node);
    return () => { io.disconnect(); window.clearTimeout(espera); };
  }, [de, valor]);

  return (
    <span ref={ref} className={`odometro ${girar ? 'girando' : ''} ${className}`} aria-label={String(valor)}>
      {ini.map((a, i) => {
        if (i < sobra)
          // dígito que sai: sobe para o vazio e a coluna se fecha
          return (
            <span key={i} className="odometro-coluna odometro-some" aria-hidden="true">
              <span className="odometro-fita" style={{ transform: `translateY(-${girar ? 1 : 0}em)` }}><span>{a}</span><span>&nbsp;</span></span>
            </span>
          );
        // fita contando para trás, do dígito inicial ao final; cada coluna à direita gira uma volta a mais
        const passos = (VOLTAS + i - sobra) * 10 + ((a - fim[i]! + 10) % 10);
        const fita = Array.from({ length: passos + 1 }, (_, k) => (a - k + 1000) % 10);
        return (
          <span key={i} className="odometro-coluna" aria-hidden="true">
            <span className="odometro-fita" style={{ transform: `translateY(-${girar ? passos : 0}em)`, transitionDelay: `${(i - sobra) * 0.12}s`, animationDelay: `${(i - sobra) * 0.12}s` }}>
              {fita.map((n, k) => <span key={k}>{n}</span>)}
            </span>
          </span>
        );
      })}
    </span>
  );
}
