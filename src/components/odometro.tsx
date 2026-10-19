import { useEffect, useRef, useState } from 'react';

// Preço que gira como um caça-níquel: cada dígito parte do próprio valor, roda para trás algumas voltas (borrado no
// começo) e desacelera até parar no mesmo valor. Sem JavaScript, ou antes de aparecer na tela, mostra o valor parado.
const VOLTAS = 3;

export function Odometro({ valor, className = '' }: { valor: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [girar, setGirar] = useState(false);
  const digitos = String(valor).split('').map(Number);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setGirar(true); io.disconnect(); }
    }, { threshold: 0.6 });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={ref} className={`odometro ${girar ? 'girando' : ''} ${className}`} aria-label={String(valor)}>
      {digitos.map((d, i) => {
        // fita que começa e termina no dígito certo, contando para trás; cada coluna gira uma volta a mais
        const fita = Array.from({ length: (VOLTAS + i) * 10 + 1 }, (_, k) => (d - k + 1000) % 10);
        const fim = fita.length - 1;
        return (
          <span key={i} className="odometro-coluna" aria-hidden="true">
            <span className="odometro-fita" style={{ transform: `translateY(-${girar ? fim : 0}em)`, transitionDelay: `${i * 0.15}s`, animationDelay: `${i * 0.15}s` }}>
              {fita.map((n, k) => <span key={k}>{n}</span>)}
            </span>
          </span>
        );
      })}
    </span>
  );
}
