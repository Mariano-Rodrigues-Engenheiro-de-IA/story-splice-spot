import { useEffect, useRef } from 'react';

// Preço em rolos de caça-níquel: o preço de antes (`de`) aparece por um instante, cada rolo recua, acelera, gira e
// freia passando um pouco do ponto até assentar em `valor`; no fim, uma batida de luz. Os rolos param um depois do
// outro (centena, dezena, unidade) e a centena que sobra some. Roda quando o preço aparece e de novo se a pessoa
// sair e voltar. Sem JavaScript ou com movimento reduzido, o preço final aparece direto.
const ESPERA = 260; // ms com o preço de antes parado
const DURACAO = [1000, 1450, 1950]; // ms de cada rolo, da esquerda para a direita
const VOLTAS = [1, 2, 3];

type Rolo = { seq: string[]; fim: string };

/** Sequência de um rolo: do dígito inicial, contando para cima, algumas voltas até o final ('' = some). */
function montaRolo(ini: string, fim: string, voltas: number): Rolo {
  const a = Number(ini);
  const passos = fim === '' ? voltas * 10 + 2 : voltas * 10 + ((Number(fim) - a + 10) % 10);
  const seq = [ini, ...Array.from({ length: passos - 1 }, (_, i) => String((a + 1 + i) % 10)), fim];
  return { seq, fim };
}

export function Odometro({ valor, de = valor, className = '' }: { valor: number; de?: number; className?: string }) {
  const raiz = useRef<HTMLSpanElement>(null);
  const casas = Math.max(String(valor).length, String(de).length);
  const ini = String(de).padStart(casas, ' ').split('');
  const fim = String(valor).padStart(casas, ' ').split('').map(c => (c === ' ' ? '' : c));
  const desloc = 3 - casas; // alinha tempos à direita: a unidade usa sempre o último tempo
  const rolos = ini.map((c, i) => montaRolo(c.trim() || '0', fim[i]!, VOLTAS[i + desloc] ?? 3));

  useEffect(() => {
    const el = raiz.current;
    if (!el || de === valor || typeof el.animate !== 'function' || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const caixa = el.closest('.offer-price');
    const fitas = Array.from(el.querySelectorAll<HTMLElement>('.odometro-fita'));
    const colunas = Array.from(el.querySelectorAll<HTMLElement>('.odometro-coluna'));
    let estado: 'armado' | 'girando' | 'feito' = 'armado';
    let visivel = false;
    let timers: number[] = [];
    let anims: Animation[] = [];
    const limpa = () => { timers.forEach(clearTimeout); timers = []; anims.forEach(a => a.cancel()); anims = []; };
    const pos = (k: number, p: number) => `translateY(${(p - k).toFixed(3)}em)`;

    // mostra o preço de antes, sem animar (sempre fora da vista)
    const arma = () => {
      limpa();
      el.classList.remove('batida');
      el.classList.add('armado');
      caixa?.classList.add('preco-armado');
      fitas.forEach((f, i) => { f.style.transform = pos(rolos[i]!.seq.length - 1, 0); });
      estado = 'armado';
    };
    const termina = () => {
      fitas.forEach(f => { f.style.transform = ''; });
      el.classList.remove('armado', 'fechando');
      estado = 'feito';
    };

    // um rolo: recua um pouco, acelera, gira e freia passando do ponto antes de assentar
    const gira = (fita: HTMLElement, coluna: HTMLElement, k: number, dur: number, blur: number) => {
      const recuo = 0.16, cauda = 3, inclinacao = 1.45 / 0.2, tw = 150;
      const lead = k - cauda + recuo;
      const resto = dur - tw;
      const ta = resto / (1 + (inclinacao * cauda) / (2 * lead));
      const tb = resto - ta;
      anims.push(fita.animate([
        { transform: pos(k, 0), easing: 'cubic-bezier(.3,0,.5,1)' },
        { transform: pos(k, -recuo), offset: tw / dur, easing: 'cubic-bezier(.5,0,1,1)' },
        { transform: pos(k, k - cauda), offset: (tw + ta) / dur, easing: 'cubic-bezier(.2,1.45,.5,1)' },
        { transform: pos(k, k) },
      ], { duration: dur, delay: ESPERA, fill: 'both' }));
      anims.push(coluna.animate([
        { filter: 'blur(0px)' },
        { filter: `blur(${blur}px)`, offset: (tw + ta * 0.3) / dur },
        { filter: `blur(${blur}px)`, offset: (tw + ta) / dur },
        { filter: 'blur(0px)', offset: Math.min(1, (tw + ta + tb * 0.45) / dur) },
        { filter: 'blur(0px)' },
      ], { duration: dur, delay: ESPERA }));
    };

    const toca = () => {
      if (estado !== 'armado') return;
      estado = 'girando';
      const blur = Math.max(2, parseFloat(getComputedStyle(el).fontSize) * 0.028);
      fitas.forEach((f, i) => gira(f, colunas[i]!, rolos[i]!.seq.length - 1, DURACAO[i + desloc] ?? 1950, blur));
      timers.push(window.setTimeout(() => el.classList.add('fechando'), ESPERA + 760)); // o espaço da centena fecha
      timers.push(window.setTimeout(() => { el.classList.remove('batida'); void el.offsetWidth; el.classList.add('batida'); }, ESPERA + 1890));
      timers.push(window.setTimeout(() => caixa?.classList.remove('preco-armado'), ESPERA + 2080)); // "depois do lançamento" aparece
      timers.push(window.setTimeout(() => { limpa(); termina(); if (!visivel) arma(); }, ESPERA + 3300));
    };

    arma();
    const io = new IntersectionObserver(entradas => {
      const e = entradas[entradas.length - 1]!;
      visivel = e.isIntersecting;
      if (e.isIntersecting && e.intersectionRatio >= 0.55 && estado === 'armado') toca();
      else if (!e.isIntersecting && estado === 'feito') arma();
    }, { threshold: [0, 0.55, 1] });
    io.observe(el);
    return () => { io.disconnect(); limpa(); termina(); el.classList.remove('batida'); caixa?.classList.remove('preco-armado'); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor, de]);

  return (
    <span ref={raiz} className={`odometro ${className}`} aria-label={String(valor)}>
      <span className="odometro-luz" aria-hidden="true" />
      <span className="odometro-anel" aria-hidden="true" />
      <span className="odometro-faiscas" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <i key={i} style={{ ['--a' as string]: `${i * 36}deg` }} />)}</span>
      {rolos.map((r, i) => (
        <span key={i} className={`odometro-coluna ${r.fim === '' ? 'odometro-some' : ''}`} aria-hidden="true">
          {/* no repouso o dígito final fica no topo; armado, a fita sobe até o dígito inicial */}
          <span className="odometro-fita">{[...r.seq].reverse().map((d, k) => <span key={k}>{d || ' '}</span>)}</span>
        </span>
      ))}
    </span>
  );
}
