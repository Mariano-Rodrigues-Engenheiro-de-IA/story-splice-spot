import { useEffect, useRef, useState } from 'react';

// Preço que gira como um caça-níquel: parte de `de` (o preço depois do lançamento), roda para trás algumas voltas
// (borrado no começo) e desacelera até parar em `valor`. Dígitos que sobram à esquerda (o 1 do 197) somem no fim.
const VOLTAS = 2;

export function Odometro({ valor, de = valor, className = '' }: { valor: number; de?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [girar, setGirar] = useState(false);
  const casas = Math.max(String(valor).length, String(de).length);
  const ini = String(de).padStart(casas, '0').split('').map(Number);
  const fim = String(valor).padStart(casas, '0').split('').map(Number);
  const sobra = casas - String(valor).length; // colunas que somem no fim

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // movimento reduzido: vai direto ao preço final (as transições estão desligadas no CSS)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setGirar(true);
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setGirar(true); io.disconnect(); }
    }, { threshold: 0.6 });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={ref} className={`odometro ${girar ? 'girando' : ''} ${className}`} aria-label={String(valor)}>
      {ini.map((a, i) => {
        // fita contando para trás, do dígito inicial ao final; cada coluna à direita gira uma volta a mais
        const passos = (VOLTAS + i) * 10 + ((a - fim[i]! + 10) % 10);
        const fita = Array.from({ length: passos + 1 }, (_, k) => (a - k + 1000) % 10);
        const some = i < sobra;
        return (
          <span key={i} className={`odometro-coluna ${some ? 'odometro-some' : ''}`} aria-hidden="true">
            <span className="odometro-fita" style={{ transform: `translateY(-${girar ? passos : 0}em)`, transitionDelay: `${i * 0.12}s`, animationDelay: `${i * 0.12}s` }}>
              {fita.map((n, k) => <span key={k}>{n}</span>)}
            </span>
          </span>
        );
      })}
    </span>
  );
}
