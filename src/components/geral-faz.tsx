import { useEffect, useRef, useState } from 'react';
import { Bone, Check, CheckCircle2, MapPinned, PenLine, Scissors, Sparkles } from 'lucide-react';

/* Página geral (/), 11/11/2026: "Do corte ao 3D, a IA faz sozinha." — a seção do que a IA faz, refeita.
   Nenhum vídeo da vitrine de cima se repete aqui: cada cartão tem uma peça própria que mostra o trabalho
   (a fala virando imagem na tela, o corte, a legenda acendendo, o zoom na ênfase, a trilha, a conferência). */

const reduzido = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** true enquanto o elemento está na tela: as animações só rodam quando alguém vê. */
function useNaTela<T extends Element>() {
  const ref = useRef<T>(null);
  const [na, setNa] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setNa(true); return; }
    const io = new IntersectionObserver(([e]) => setNa(!!e?.isIntersecting), { rootMargin: '60px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, na] as const;
}

/** Conta de 0 até `total` (um passo a cada `ms`), segura `pausa` ms no fim e recomeça. Parado fora da tela. */
function useContagem(total: number, ms: number, pausa: number, ativo: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduzido()) { setN(total); return; }
    if (!ativo) return;
    const id = window.setTimeout(() => setN(v => (v >= total ? 0 : v + 1)), n >= total ? pausa : ms);
    return () => window.clearTimeout(id);
  }, [n, total, ms, pausa, ativo]);
  return n;
}

/* ───────── 1. A fala vira imagem na tela ───────── */

const fala: { t: string; k?: number }[] = [
  { t: 'Quando' }, { t: 'o' }, { t: 'disco' }, { t: 'da' }, { t: 'coluna', k: 0 }, { t: 'sai' }, { t: 'do' }, { t: 'lugar,' },
  { t: 'a' }, { t: 'dor' }, { t: 'desce' }, { t: 'pela' }, { t: 'perna.' }, { t: 'A' }, { t: 'clínica' }, { t: 'fica' }, { t: 'no' },
  { t: 'centro' }, { t: 'da' }, { t: 'cidade', k: 1 }, { t: 'e' }, { t: 'o' }, { t: 'tratamento' }, { t: 'tem' }, { t: 'três', k: 2 }, { t: 'passos.', k: 2 },
];
const camadas = [
  { Icone: Bone, nome: 'Coluna em 3D', quando: '0:02' },
  { Icone: MapPinned, nome: 'Mapa de satélite', quando: '0:06' },
  { Icone: PenLine, nome: 'Desenho dos 3 passos', quando: '0:09' },
];

function FalaViraImagem() {
  const [ref, na] = useNaTela<HTMLDivElement>();
  const n = useContagem(fala.length, 260, 2200, na);
  // a camada que está entrando é a da última palavra-chave já dita
  let atual = -1;
  for (let i = 0; i < Math.min(n, fala.length); i++) { const k = fala[i]?.k; if (k !== undefined) atual = k; }
  return (
    <div className="faz-arte faz-fala" ref={ref} aria-hidden="true">
      <ul className="faz-camadas">
        {camadas.map(({ Icone, nome, quando }, i) => (
          <li key={nome} className={i === atual ? 'agora' : i < atual ? 'feito' : ''}>
            <span className="faz-camada-ico"><Icone /></span>
            <span className="faz-camada-nome">{nome}</span>
            <span className="faz-camada-tempo">{i === atual ? 'na tela' : i < atual ? <Check /> : quando}</span>
          </li>
        ))}
      </ul>
      <div className="faz-transcricao">
        <small>Sua fala</small>
        <p>{fala.map((w, i) => <span key={i} className={`${w.k !== undefined ? 'chave' : ''} ${i === n - 1 ? 'agora' : i < n ? 'dita' : ''}`}>{w.t} </span>)}</p>
      </div>
    </div>
  );
}

/* ───────── 2. Corta pausas e erros ───────── */

const barra = (i: number, min = 22, amp = 65) => `${(min + Math.abs(Math.sin(i * 1.3) * Math.cos(i * .2)) * amp).toFixed(2)}%`;
function Corte() {
  const trechos: (number | string)[] = [8, 'pausa', 10, 'ééé', 7, 'erro', 8];
  let n = 0;
  return (
    <div className="faz-arte faz-corte" aria-hidden="true"><div className="corte">
      <div className="corte-trilha">{trechos.map((t, k) => typeof t === 'number'
        ? <span key={k} className="corte-fala">{Array.from({ length: t }, () => { const i = n++; return <span key={i} style={{ height: barra(i) }} />; })}</span>
        : <span key={k} className="corte-tira"><i>{t}</i></span>)}</div>
      <span className="corte-agulha"><Scissors size={14} /></span>
      <span className="corte-ok"><CheckCircle2 size={14} /> Fala corrida, sem buraco</span>
    </div></div>
  );
}

/* ───────── 3. Legenda palavra por palavra ───────── */

const legenda = [['VOCÊ', 'GRAVA', 'DO', 'SEU', 'JEITO'], ['E', 'A', 'IA', 'EDITA', 'SOZINHA']];
function Legenda() {
  const [ref, na] = useNaTela<HTMLDivElement>();
  const total = legenda.flat().length;
  const n = useContagem(total, 330, 1400, na);
  const linha = n <= legenda[0]!.length ? 0 : 1;
  const antes = linha === 0 ? 0 : legenda[0]!.length;
  return (
    <div className="faz-arte faz-tela" ref={ref} aria-hidden="true">
      <img src="/videos/cenas/cru_modo.webp" alt="" loading="lazy" decoding="async" />
      <p className="faz-legenda" key={linha}>{legenda[linha]!.map((w, i) => <span key={w + i} className={antes + i === n - 1 ? 'agora' : antes + i < n ? 'dita' : ''}>{w}</span>)}</p>
    </div>
  );
}

/* ───────── 4. Zoom nas partes fortes ───────── */

function Zoom() {
  return (
    <div className="faz-arte faz-tela faz-zoom" aria-hidden="true">
      <img src="/videos/cenas/zoom.webp" alt="" loading="lazy" decoding="async" />
      <span className="faz-mira"><i /><i /><i /><i /></span>
      <span className="faz-enfase">ênfase · zoom</span>
    </div>
  );
}

/* ───────── 5. Trilha e efeitos no tempo certo ───────── */

function Trilha() {
  const efeitos = [0.2, 0.47, 0.76];
  return (
    <div className="faz-arte faz-mix" aria-hidden="true"><div className="mix">
      <div className="mix-linha"><b>Voz</b><div className="mix-ondas mix-voz">{Array.from({ length: 30 }, (_, i) => <span key={i} style={{ height: barra(i, 30, 70), animationDelay: `${-((i * 0.37) % 1.2).toFixed(2)}s` }} />)}</div></div>
      <div className="mix-linha"><b>Trilha</b><div className="mix-ondas mix-trilha">{Array.from({ length: 30 }, (_, i) => <span key={i} style={{ animationDelay: `${-(i * 0.12).toFixed(2)}s` }} />)}</div></div>
      <div className="mix-linha"><b>Efeitos</b><div className="mix-efeitos">{efeitos.map(x => <i key={x} style={{ left: `${x * 100}%`, animationDelay: `${(x * 4).toFixed(2)}s` }}><Sparkles size={12} /></i>)}</div></div>
      <span className="mix-agulha" />
    </div></div>
  );
}

/* ───────── 6. Confere tudo antes de entregar ───────── */

const conferencia = ['Assiste o vídeo pronto', 'Confere a legenda com a fala', 'Confere o volume do som', 'Entrega pronto pra postar'];
function Confere() {
  const [ref, na] = useNaTela<HTMLDivElement>();
  const n = useContagem(conferencia.length, 750, 2400, na);
  return (
    <div className="faz-arte faz-confere" ref={ref} aria-hidden="true">
      <ul>{conferencia.map((c, i) => <li key={c} className={i < n ? 'ok' : i === n ? 'agora' : ''}><span className="faz-check">{i < n ? <Check /> : null}</span>{c}</li>)}</ul>
      <span className={`faz-pronto ${n >= conferencia.length ? 'on' : ''}`}><CheckCircle2 /> Pronto</span>
    </div>
  );
}

/* ───────── a seção ───────── */

const cartoes = [
  { id: 'fala', titulo: 'Coloca na tela o que você explica', texto: 'Falou de coluna, aparece a coluna em 3D. Falou da cidade, desce o mapa. A IA lê a sua fala e põe a imagem na hora certa.', Arte: FalaViraImagem, destaque: true },
  { id: 'corte', titulo: 'Corta pausas e erros', texto: 'Silêncio, “ééé” e a frase que travou saem sozinhos. A fala fica corrida.', Arte: Corte },
  { id: 'legenda', titulo: 'Legenda palavra por palavra', texto: 'Cada palavra acende no momento em que você fala.', Arte: Legenda },
  { id: 'zoom', titulo: 'Zoom nas partes fortes', texto: 'A câmera aproxima quando você enfatiza e volta sozinha.', Arte: Zoom },
  { id: 'trilha', titulo: 'Trilha e efeitos no tempo certo', texto: 'A trilha entra baixinha por baixo da voz e cada corte ganha um efeito.', Arte: Trilha },
  { id: 'confere', titulo: 'Confere tudo antes de entregar', texto: 'Antes de te devolver, a IA assiste o vídeo pronto e confere legenda e som.', Arte: Confere, largo: true },
];

export function OQueFaz() {
  return (
    <section className="section container faz" id="o-que-faz">
      <div className="section-heading reveal">
        <h2>Do corte ao 3D,<br /><em>a IA faz sozinha.</em></h2>
        <p>O que você fazia na mão, e o que nem dava pra fazer, sai pronto a partir de um pedido em português.</p>
      </div>
      <div className="faz-grade">
        {cartoes.map(({ id, titulo, texto, Arte, destaque, largo }) => (
          <article key={id} className={`faz-cartao reveal faz-c-${id} ${destaque ? 'faz-destaque border-beam' : ''} ${largo ? 'faz-largo' : ''}`}>
            <Arte />
            <div className="faz-texto"><h3>{titulo}</h3><p>{texto}</p></div>
          </article>
        ))}
      </div>
    </section>
  );
}
