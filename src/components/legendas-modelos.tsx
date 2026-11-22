/* Motor de legendas do "Criar meu vídeo" (22/11/2026). O MESMO arquivo roda na página /criar (ao vivo, por cima do
   vídeo) e na skill (modelo-motion/src/legendas-modelos.tsx, composição "LegendaModelo"): o que a pessoa vê é o que a
   IA dela renderiza. Pedido dele: cada legenda DIFERENTE de verdade (letra, animação e forma, não só a cor) e a cor
   escolhida pela pessoa num controle. Tudo é função do tempo `t` (segundos): nada de transição de CSS, para o render
   quadro a quadro do Remotion sair igual.
   O pai precisa de `position: relative` e `container-type: inline-size` (os tamanhos são em cqw = % da largura).
   Fontes: Montserrat (500/600/800/900), Anton, Archivo Black, Bebas Neue, Playfair Display itálica (estão na skill). */
import type { CSSProperties, ReactNode } from 'react';

export type PalavraFala = { t: string; ini: number; fim: number };
export type EstiloLegenda = { codigo: string; nome: string; desc: string };

export const ESTILOS_LEGENDA: EstiloLegenda[] = [
  { codigo: 'LEG-01', nome: 'Pop', desc: 'Até 3 palavras, cada uma entra pulando; a forte na cor.' },
  { codigo: 'LEG-02', nome: 'Karaokê', desc: 'A frase toda aparece e a palavra falada se enche de cor.' },
  { codigo: 'LEG-03', nome: 'Uma palavra', desc: 'Uma palavra por vez, gigante, em letra alta.' },
  { codigo: 'LEG-04', nome: 'Faixa', desc: 'A frase numa faixa colorida que abre da esquerda.' },
  { codigo: 'LEG-05', nome: 'Caixa que pula', desc: 'Uma caixa colorida vai pulando de palavra em palavra.' },
  { codigo: 'LEG-06', nome: 'Sublinhado', desc: 'Um traço colorido cresce embaixo da palavra falada.' },
  { codigo: 'LEG-07', nome: 'Clássica', desc: 'A frase inteira, pequena e discreta, com contorno fino.' },
  { codigo: 'LEG-08', nome: 'Elegante', desc: 'Letra serifada itálica que aparece suave.' },
  { codigo: 'LEG-09', nome: 'Máquina de escrever', desc: 'Letra por letra, com cursor, numa tarja escura.' },
  { codigo: 'LEG-10', nome: 'Neon', desc: 'Letras que brilham na cor, como letreiro de neon.' },
  { codigo: 'LEG-11', nome: 'Contorno vazado', desc: 'Só o contorno; a palavra falada se preenche.' },
  { codigo: 'LEG-12', nome: 'Degradê', desc: 'Letra cheia em degradê da cor, subindo.' },
  { codigo: 'LEG-13', nome: 'Sombra retrô', desc: 'Sombra sólida colorida deslocada, estilo pôster.' },
  { codigo: 'LEG-14', nome: 'Empilhada', desc: 'As palavras empilham em tamanhos diferentes.' },
  { codigo: 'LEG-15', nome: 'Revelação', desc: 'Cada palavra sobe de trás de uma máscara.' },
  { codigo: 'LEG-16', nome: 'Balão de conversa', desc: 'A frase num balão de chat colorido.' },
  { codigo: 'LEG-17', nome: 'Adesivo', desc: 'Etiqueta branca inclinada com borda colorida.' },
  { codigo: 'LEG-18', nome: 'Minúscula leve', desc: 'Uma palavra por vez, minúscula e fina, sem contorno.' },
  { codigo: 'LEG-19', nome: 'Condensada alta', desc: 'Duas linhas de letra alta e estreita.' },
  { codigo: 'LEG-20', nome: 'Marca-texto', desc: 'A palavra forte ganha um risco de marca-texto.' },
  { codigo: 'LEG-21', nome: 'Glitch', desc: 'A palavra entra com falha digital em duas cores.' },
  { codigo: 'LEG-22', nome: 'Tremida', desc: 'A palavra forte cresce e treme na hora.' },
  { codigo: 'LEG-23', nome: 'Cinema', desc: 'Maiúsculas pequenas e espaçadas, como em filme.' },
  { codigo: 'LEG-24', nome: 'Pílula de vidro', desc: 'A frase numa pílula de vidro com borda colorida.' },
  { codigo: 'LEG-25', nome: 'Caixa preta', desc: 'Texto branco em caixa preta; a falada na cor.' },
  { codigo: 'LEG-26', nome: 'Duas cores', desc: 'Duas palavras por vez, alternando branco e a cor.' },
  { codigo: 'LEG-27', nome: 'Com emoji', desc: 'A palavra forte vem com um emoji que pula.' },
  { codigo: 'LEG-28', nome: 'Letreiro', desc: 'Placa com moldura dupla que acende piscando.' },
  { codigo: 'LEG-29', nome: 'Onda', desc: 'As letras da palavra falada sobem em onda.' },
  { codigo: 'LEG-30', nome: 'Citação', desc: 'Texto à esquerda com uma barra colorida ao lado.' },
];

/* ---------- utilidades ---------- */
const PONT = /[.,!?;:…"“”()]/g;
const limpa = (s: string) => s.replace(PONT, '').trim();
export const normaliza = (s: string) => limpa(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const c01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const sai = (x: number) => 1 - Math.pow(1 - c01(x), 3);
const volta = (x: number) => { const v = c01(x) - 1; return 1 + 2.70158 * v * v * v + 1.70158 * v * v; };

function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h.slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const hex = (r: number, g: number, b: number) => `#${[r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;
export function mistura(a: string, b: string, k: number) {
  const x = rgb(a), y = rgb(b);
  return hex(x[0] + (y[0] - x[0]) * k, x[1] + (y[1] - x[1]) * k, x[2] + (y[2] - x[2]) * k);
}
export const ehClara = (c: string) => { const [r, g, b] = rgb(c); return r * 0.299 + g * 0.587 + b * 0.114 > 160; };
const contraste = (c: string) => (ehClara(c) ? '#111111' : '#FFFFFF');
/** contorno grosso por sombras (funciona em todo navegador e no Chrome do Remotion) */
const contorno = (e: number, cor = '#000') => [[e, 0], [-e, 0], [0, e], [0, -e], [e * 0.7, e * 0.7], [-e * 0.7, e * 0.7], [e * 0.7, -e * 0.7], [-e * 0.7, -e * 0.7]].map(([x, y]) => `${x}cqw ${y}cqw 0 ${cor}`).join(', ');
const SOMBRA = '0 0.15cqw 0.35cqw rgba(0,0,0,.9), 0 0.4cqw 1.4cqw rgba(0,0,0,.55)';
const MONT = 'Montserrat, "Arial Black", sans-serif';
const ANTON = 'Anton, Impact, sans-serif';
const ARCHIVO = '"Archivo Black", "Arial Black", sans-serif';
const BEBAS = '"Bebas Neue", Impact, sans-serif';
const PLAYFAIR = '"Playfair Display", Georgia, serif';
const MONO = '"Courier New", Courier, monospace';

type W = PalavraFala & { txt: string; forte: boolean; i: number };

function blocos(ws: W[], max: number): W[][] {
  const out: W[][] = [];
  let cur: W[] = [];
  ws.forEach((w, i) => {
    cur.push(w);
    const prox = ws[i + 1];
    const pausa = prox ? prox.ini - w.fim : 9;
    const fimFrase = /[.?!]$/.test(w.t.trim());
    if (cur.length >= max || fimFrase || pausa > 0.45 || /,$/.test(w.t.trim())) { out.push(cur); cur = []; }
  });
  if (cur.length) out.push(cur);
  return out;
}

function atual(bs: W[][], t: number): W[] | null {
  for (let k = bs.length - 1; k >= 0; k--) {
    const b = bs[k]!;
    if (t >= b[0]!.ini - 0.08) {
      const prox = bs[k + 1];
      const ate = Math.min(prox ? prox[0]!.ini - 0.08 : Infinity, b[b.length - 1]!.fim + 0.7);
      return t < ate ? b : null;
    }
  }
  return null;
}

const MAX: Record<string, number> = {
  'LEG-01': 3, 'LEG-02': 5, 'LEG-03': 1, 'LEG-04': 4, 'LEG-05': 4, 'LEG-06': 5, 'LEG-07': 7, 'LEG-08': 4, 'LEG-09': 5, 'LEG-10': 3,
  'LEG-11': 3, 'LEG-12': 3, 'LEG-13': 3, 'LEG-14': 4, 'LEG-15': 4, 'LEG-16': 5, 'LEG-17': 2, 'LEG-18': 1, 'LEG-19': 4, 'LEG-20': 4,
  'LEG-21': 2, 'LEG-22': 3, 'LEG-23': 6, 'LEG-24': 4, 'LEG-25': 4, 'LEG-26': 2, 'LEG-27': 3, 'LEG-28': 3, 'LEG-29': 3, 'LEG-30': 5,
};

/** A legenda no tempo `t`. `y` = altura do centro (0 a 1). `destaques` = palavras fortes (ganham a cor). */
export function LegendaModelo({ palavras, t, estilo, cor, y = 0.7, destaques = [] }: { palavras: PalavraFala[]; t: number; estilo: string; cor: string; y?: number; destaques?: string[] }) {
  const fortes = new Set(destaques.map(normaliza));
  const ws: W[] = palavras.map((p, i) => ({ ...p, txt: limpa(p.t), forte: fortes.has(normaliza(p.t)), i })).filter(w => w.txt);
  const b = atual(blocos(ws, MAX[estilo] ?? 3), t);
  if (!b) return null;
  const ent = (w: W, d = 0.16) => c01((t - (w.ini - 0.05)) / d); // entrada da palavra
  const falou = (w: W) => t >= w.ini - 0.03; // já começou a ser dita
  const falando = (w: W) => t >= w.ini - 0.03 && t < w.fim + 0.04;
  const prog = (w: W) => c01((t - w.ini) / Math.max(0.1, w.fim - w.ini));
  const ini = b[0]!.ini;
  const entB = c01((t - (ini - 0.08)) / 0.22); // entrada do bloco
  const caixa: CSSProperties = { position: 'absolute', left: '7%', right: '7%', top: `${y * 100}%`, transform: 'translateY(-50%)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', textAlign: 'center', pointerEvents: 'none' };
  const claraCor = mistura(cor, '#FFFFFF', 0.55);
  let corpo: ReactNode = null;

  switch (estilo) {
    case 'LEG-01': // Pop
      corpo = b.filter(falou).map(w => { const k = volta(ent(w, 0.2)); return (
        <span key={w.i} style={{ display: 'inline-block', margin: '0 0.9cqw', fontFamily: MONT, fontWeight: 800, fontSize: '8.4cqw', lineHeight: 1.1, color: w.forte ? cor : '#fff', textShadow: contorno(0.55), transform: `scale(${0.5 + 0.5 * k})`, opacity: c01(k * 2) }}>{w.txt}</span>); });
      break;
    case 'LEG-02': // Karaokê
      corpo = b.map(w => { const p = falando(w) ? prog(w) : t >= w.fim ? 1 : 0; return (
        <span key={w.i} style={{ display: 'inline-block', margin: '0 0.8cqw', fontFamily: MONT, fontWeight: 900, fontSize: '7cqw', lineHeight: 1.15, color: 'transparent', backgroundImage: `linear-gradient(90deg, ${cor} ${p * 100}%, #ffffff ${p * 100}%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', filter: 'drop-shadow(0 0 0.3cqw rgba(0,0,0,.9)) drop-shadow(0 0.4cqw 0.8cqw rgba(0,0,0,.55))', opacity: entB }}>{w.txt}</span>); });
      break;
    case 'LEG-03': { // Uma palavra
      const w = b[0]!; const k = volta(ent(w, 0.22));
      corpo = <span style={{ fontFamily: BEBAS, fontSize: '19cqw', lineHeight: 0.9, letterSpacing: '0.3cqw', color: w.forte ? cor : '#fff', textShadow: '0 1cqw 2.5cqw rgba(0,0,0,.6)', transform: `scale(${1.5 - 0.5 * k}) rotate(${(1 - k) * -6}deg)`, opacity: c01(k * 2) }}>{w.txt.toUpperCase()}</span>;
      break;
    }
    case 'LEG-04': { // Faixa
      const k = sai(entB);
      corpo = <span style={{ display: 'inline-block', padding: '1.4cqw 3cqw', background: cor, color: contraste(cor), fontFamily: ARCHIVO, fontSize: '6cqw', lineHeight: 1.2, clipPath: `inset(0 ${(1 - k) * 100}% 0 0)`, boxShadow: '0 1cqw 3cqw rgba(0,0,0,.35)' }}>{b.map(w => w.txt).join(' ')}</span>;
      break;
    }
    case 'LEG-05': // Caixa que pula
      corpo = b.map(w => { const on = falando(w); return (
        <span key={w.i} style={{ display: 'inline-block', margin: '0.6cqw 0.4cqw', padding: '0.6cqw 1.6cqw', borderRadius: '1.6cqw', background: on ? cor : 'transparent', color: on ? contraste(cor) : '#fff', fontFamily: MONT, fontWeight: 800, fontSize: '7cqw', lineHeight: 1.15, textShadow: on ? 'none' : contorno(0.45), transform: on ? 'scale(1.06)' : 'none', opacity: entB }}>{w.txt}</span>); });
      break;
    case 'LEG-06': // Sublinhado
      corpo = b.map(w => { const p = falou(w) ? sai(c01((t - w.ini) / 0.2)) : 0; const on = falando(w); return (
        <span key={w.i} style={{ position: 'relative', display: 'inline-block', margin: '0 0.9cqw', fontFamily: MONT, fontWeight: 600, fontSize: '6.6cqw', lineHeight: 1.35, color: '#fff', textShadow: SOMBRA, opacity: entB }}>
          {w.txt}<i style={{ position: 'absolute', left: 0, bottom: '0.2cqw', height: '1cqw', width: `${on ? p * 100 : 0}%`, borderRadius: '1cqw', background: cor }} />
        </span>); });
      break;
    case 'LEG-07': // Clássica
      corpo = <span style={{ fontFamily: MONT, fontWeight: 600, fontSize: '5.6cqw', lineHeight: 1.3, color: '#fff', textShadow: contorno(0.3) }}>{b.map((w, k) => <span key={w.i} style={{ color: w.forte ? cor : undefined }}>{k ? ' ' : ''}{w.txt}</span>)}</span>;
      break;
    case 'LEG-08': // Elegante
      corpo = b.map(w => (
        <span key={w.i} style={{ display: 'inline-block', margin: '0 0.9cqw', fontFamily: PLAYFAIR, fontStyle: 'italic', fontWeight: 600, fontSize: '7.6cqw', lineHeight: 1.2, color: w.forte ? cor : '#F3E9D7', textShadow: SOMBRA, opacity: sai(ent(w, 0.35)), transform: `translateY(${(1 - sai(ent(w, 0.35))) * 2}cqw)` }}>{w.txt}</span>));
      break;
    case 'LEG-09': { // Máquina de escrever
      const texto = b.map(w => w.txt).join(' ');
      const total = Math.max(0.3, b[b.length - 1]!.fim - ini);
      const n = Math.floor(texto.length * c01((t - ini + 0.05) / total));
      corpo = <span style={{ display: 'inline-block', padding: '1.2cqw 2.4cqw', background: 'rgba(10,10,14,.82)', borderRadius: '1cqw', fontFamily: MONO, fontWeight: 700, fontSize: '5.6cqw', lineHeight: 1.3, color: '#fff', textAlign: 'left' }}>{texto.slice(0, n)}<span style={{ color: cor, opacity: Math.floor(t * 4) % 2 ? 1 : 0.15 }}>▌</span></span>;
      break;
    }
    case 'LEG-10': // Neon
      corpo = b.filter(falou).map(w => { const k = ent(w, 0.18); const pisca = k < 1 ? (Math.floor(k * 6) % 2 ? 0.4 : 1) : 1; return (
        <span key={w.i} style={{ display: 'inline-block', margin: '0 1cqw', fontFamily: MONT, fontWeight: 900, fontSize: '7.4cqw', lineHeight: 1.15, textTransform: 'uppercase', color: claraCor, textShadow: `0 0.1cqw 0.3cqw rgba(0,0,0,.85), 0 0 0.6cqw #fff, 0 0 1.6cqw ${cor}, 0 0 3.5cqw ${cor}, 0 0 6cqw ${cor}`, opacity: pisca }}>{w.txt}</span>); });
      break;
    case 'LEG-11': // Contorno vazado
      corpo = b.map(w => { const on = falou(w); return (
        <span key={w.i} style={{ display: 'inline-block', margin: '0 1cqw', fontFamily: ANTON, fontSize: '10.5cqw', lineHeight: 1.05, textTransform: 'uppercase', color: on ? cor : 'transparent', WebkitTextStroke: `0.5cqw ${on ? cor : '#fff'}`, filter: 'drop-shadow(0 0.5cqw 1cqw rgba(0,0,0,.6))', opacity: entB }}>{w.txt}</span>); });
      break;
    case 'LEG-12': // Degradê
      corpo = b.filter(falou).map(w => { const k = sai(ent(w, 0.25)); return (
        <span key={w.i} style={{ display: 'inline-block', margin: '0 0.9cqw', fontFamily: MONT, fontWeight: 900, fontSize: '8.6cqw', lineHeight: 1.1, color: 'transparent', backgroundImage: `linear-gradient(180deg, ${claraCor} 0%, ${cor} 55%, ${mistura(cor, '#000000', 0.3)} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', filter: 'drop-shadow(0 0 0.35cqw rgba(0,0,0,.9)) drop-shadow(0 0.5cqw 0.8cqw rgba(0,0,0,.5))', transform: `translateY(${(1 - k) * 4}cqw)`, opacity: k }}>{w.txt}</span>); });
      break;
    case 'LEG-13': // Sombra retrô
      corpo = b.filter(falou).map(w => { const k = volta(ent(w, 0.2)); return (
        <span key={w.i} style={{ display: 'inline-block', margin: '0 1cqw', fontFamily: ARCHIVO, fontSize: '8.4cqw', lineHeight: 1.15, color: '#fff', textShadow: `${0.9 * k}cqw ${0.9 * k}cqw 0 ${cor}, ${1.5 * k}cqw ${1.5 * k}cqw 0 #111`, transform: `scale(${0.6 + 0.4 * k})` }}>{w.txt.toUpperCase()}</span>); });
      break;
    case 'LEG-14': // Empilhada
      corpo = <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 0.95 }}>{b.filter(falou).map((w, k) => { const e = sai(ent(w, 0.18)); return (
        <span key={w.i} style={{ fontFamily: ANTON, fontSize: w.forte ? '13cqw' : k % 2 ? '7cqw' : '9.5cqw', textTransform: 'uppercase', color: w.forte ? cor : '#fff', textShadow: '0 0.6cqw 1.6cqw rgba(0,0,0,.6)', transform: `translateX(${(1 - e) * (k % 2 ? 8 : -8)}cqw)`, opacity: e }}>{w.txt}</span>); })}</span>;
      break;
    case 'LEG-15': // Revelação
      corpo = b.map(w => { const k = sai(ent(w, 0.24)); return (
        <span key={w.i} style={{ display: 'inline-block', margin: '0 0.9cqw', overflow: 'hidden', verticalAlign: 'bottom', lineHeight: 1.15 }}>
          <span style={{ display: 'inline-block', fontFamily: MONT, fontWeight: 800, fontSize: '7.4cqw', color: w.forte ? cor : '#fff', textShadow: SOMBRA, transform: `translateY(${(1 - k) * 110}%)` }}>{w.txt}</span>
        </span>); });
      break;
    case 'LEG-16': { // Balão de conversa
      const k = volta(entB);
      corpo = <span style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', padding: '2cqw 3.4cqw', borderRadius: '4cqw', borderBottomLeftRadius: '0.8cqw', background: cor, color: contraste(cor), fontFamily: MONT, fontWeight: 600, fontSize: '5.4cqw', lineHeight: 1.3, textAlign: 'left', boxShadow: '0 1.2cqw 3cqw rgba(0,0,0,.35)', transform: `scale(${0.4 + 0.6 * k})`, transformOrigin: 'left bottom' }}>{b.filter(falou).map(w => w.txt).join(' ')}</span>;
      break;
    }
    case 'LEG-17': { // Adesivo
      const k = volta(entB); const lado = b[0]!.i % 2 ? 1 : -1;
      corpo = <span style={{ display: 'inline-block', padding: '1.4cqw 3cqw', background: '#fff', border: `0.8cqw solid ${cor}`, borderRadius: '1.6cqw', color: '#111', fontFamily: ARCHIVO, fontSize: '7cqw', lineHeight: 1.1, textTransform: 'uppercase', boxShadow: '0 1.2cqw 2.6cqw rgba(0,0,0,.4)', transform: `rotate(${lado * 4}deg) scale(${0.3 + 0.7 * k})` }}>{b.map(w => w.txt).join(' ')}</span>;
      break;
    }
    case 'LEG-18': { // Minúscula leve
      const w = b[0]!; const k = sai(ent(w, 0.2));
      corpo = <span style={{ fontFamily: MONT, fontWeight: 500, fontSize: '7.4cqw', lineHeight: 1.1, letterSpacing: '-0.1cqw', color: w.forte ? cor : '#fff', textShadow: SOMBRA, opacity: k, transform: `translateY(${(1 - k) * 1.5}cqw)` }}>{w.txt.toLowerCase()}</span>;
      break;
    }
    case 'LEG-19': { // Condensada alta
      const meio = Math.ceil(b.length / 2);
      const linha = (ps: W[], d: number) => <span style={{ display: 'block', opacity: sai(c01((t - ps[0]!.ini + 0.08) / 0.2)), transform: `translateY(${(1 - sai(c01((t - ps[0]!.ini + 0.08) / 0.2))) * d}cqw)` }}>{ps.map((w, k) => <span key={w.i} style={{ color: w.forte ? cor : '#fff' }}>{k ? ' ' : ''}{w.txt.toUpperCase()}</span>)}</span>;
      corpo = <span style={{ fontFamily: BEBAS, fontSize: '11cqw', lineHeight: 0.92, letterSpacing: '0.4cqw', textShadow: '0 0.6cqw 1.8cqw rgba(0,0,0,.6)' }}>{linha(b.slice(0, meio), 3)}{b.length > meio ? linha(b.slice(meio), 3) : null}</span>;
      break;
    }
    case 'LEG-20': // Marca-texto
      corpo = b.map(w => { const p = w.forte && falou(w) ? sai(c01((t - w.ini) / 0.25)) : 0; return (
        <span key={w.i} style={{ position: 'relative', display: 'inline-block', margin: '0 0.9cqw', fontFamily: MONT, fontWeight: 800, fontSize: '7cqw', lineHeight: 1.25, color: '#fff', textShadow: w.forte ? 'none' : contorno(0.4), opacity: entB }}>
          {w.forte && <i style={{ position: 'absolute', left: '-1.2cqw', right: `${(1 - p) * 100}%`, top: '18%', bottom: '8%', background: cor, opacity: 0.9, transform: 'skewX(-12deg) rotate(-2deg)', borderRadius: '0.6cqw', zIndex: 0 }} />}
          <span style={{ position: 'relative', color: w.forte ? contraste(cor) : '#fff' }}>{w.txt}</span>
        </span>); });
      break;
    case 'LEG-21': // Glitch
      corpo = b.filter(falou).map(w => { const g = 1 - c01((t - w.ini + 0.05) / 0.18); const dx = g * 1.6 * (Math.floor(t * 40) % 2 ? 1 : -1); return (
        <span key={w.i} style={{ display: 'inline-block', margin: '0 1cqw', fontFamily: MONT, fontWeight: 900, fontSize: '9cqw', lineHeight: 1.1, textTransform: 'uppercase', color: '#fff', textShadow: `${dx}cqw 0 0 ${cor}, ${-dx}cqw 0 0 #00E5FF, 0 0.5cqw 1cqw rgba(0,0,0,.6)`, transform: `translateX(${dx * 0.5}cqw) skewX(${g * 12}deg)` }}>{w.txt}</span>); });
      break;
    case 'LEG-22': // Tremida
      corpo = b.filter(falou).map(w => { const on = w.forte && falando(w); const tr = on ? Math.sin(t * 70) * 0.8 : 0; return (
        <span key={w.i} style={{ display: 'inline-block', margin: '0 1cqw', fontFamily: ANTON, fontSize: on ? '12cqw' : '8.4cqw', lineHeight: 1.05, textTransform: 'uppercase', color: w.forte ? cor : '#fff', textShadow: contorno(0.45), transform: `translate(${tr}cqw, ${-tr * 0.6}cqw) rotate(${tr * 1.5}deg)` }}>{w.txt}</span>); });
      break;
    case 'LEG-23': // Cinema
      corpo = <span style={{ fontFamily: MONT, fontWeight: 600, fontSize: '4.6cqw', lineHeight: 1.5, letterSpacing: '0.8cqw', textTransform: 'uppercase', color: '#fff', textShadow: `${contorno(0.18, 'rgba(0,0,0,.85)')}, 0 0.3cqw 1.2cqw rgba(0,0,0,.9)`, opacity: sai(entB) }}>{b.map((w, k) => <span key={w.i} style={{ color: w.forte ? claraCor : undefined, borderBottom: w.forte ? `0.4cqw solid ${cor}` : undefined }}>{k ? ' ' : ''}{w.txt}</span>)}</span>;
      break;
    case 'LEG-24': // Pílula de vidro
      corpo = <span style={{ display: 'inline-block', padding: '1.6cqw 4cqw', borderRadius: '10cqw', background: 'rgba(16,12,28,.55)', border: `0.45cqw solid ${cor}`, backdropFilter: 'blur(1.4cqw)', WebkitBackdropFilter: 'blur(1.4cqw)', boxShadow: `0 0 3cqw ${mistura(cor, '#000000', 0.2)}66`, fontFamily: MONT, fontWeight: 700, fontSize: '5.8cqw', lineHeight: 1.25, color: '#fff', textShadow: '0 0.3cqw 0.8cqw rgba(0,0,0,.5)', opacity: sai(entB), transform: `scale(${0.85 + 0.15 * sai(entB)})` }}>{b.map((w, k) => <span key={w.i} style={{ color: w.forte ? claraCor : undefined }}>{k ? ' ' : ''}{w.txt}</span>)}</span>;
      break;
    case 'LEG-25': // Caixa preta
      corpo = <span style={{ display: 'inline-block', padding: '1.2cqw 2.6cqw', borderRadius: '1.8cqw', background: 'rgba(0,0,0,.85)', fontFamily: MONT, fontWeight: 800, fontSize: '6.4cqw', lineHeight: 1.25, color: '#fff' }}>{b.map((w, k) => <span key={w.i} style={{ color: falando(w) ? cor : undefined }}>{k ? ' ' : ''}{w.txt}</span>)}</span>;
      break;
    case 'LEG-26': // Duas cores
      corpo = b.filter(falou).map(w => { const k = sai(ent(w, 0.2)); const lado = w.i % 2 ? 1 : -1; return (
        <span key={w.i} style={{ display: 'inline-block', margin: '0 1.2cqw', fontFamily: ARCHIVO, fontSize: '9cqw', lineHeight: 1.1, textTransform: 'uppercase', color: w.i % 2 ? cor : '#fff', textShadow: contorno(0.4), transform: `translateX(${(1 - k) * lado * 10}cqw)`, opacity: k }}>{w.txt}</span>); });
      break;
    case 'LEG-27': // Com emoji
      corpo = b.filter(falou).map(w => { const k = volta(ent(w, 0.2)); const pula = w.forte ? Math.abs(Math.sin((t - w.ini) * 9)) * 1.5 : 0; return (
        <span key={w.i} style={{ display: 'inline-block', margin: '0 0.9cqw', fontFamily: MONT, fontWeight: 800, fontSize: '8cqw', lineHeight: 1.15, color: w.forte ? cor : '#fff', textShadow: contorno(0.5), transform: `scale(${0.5 + 0.5 * k})` }}>
          {w.txt}{w.forte ? <span style={{ display: 'inline-block', marginLeft: '1cqw', textShadow: 'none', transform: `translateY(${-pula}cqw)` }}>{EMOJI[normaliza(w.t)] ?? '⭐'}</span> : null}
        </span>); });
      break;
    case 'LEG-28': { // Letreiro
      const pisca = entB < 1 ? (Math.floor(entB * 8) % 2 ? 0.25 : 1) : 1;
      corpo = <span style={{ display: 'inline-block', padding: '1.6cqw 3.4cqw', border: `0.6cqw solid ${cor}`, outline: `0.4cqw solid ${claraCor}`, outlineOffset: '0.9cqw', borderRadius: '1.2cqw', background: 'rgba(8,8,12,.75)', fontFamily: BEBAS, fontSize: '9.4cqw', lineHeight: 1, letterSpacing: '0.5cqw', color: '#fff', textShadow: `0 0 2cqw ${cor}`, opacity: pisca }}>{b.map(w => w.txt.toUpperCase()).join(' ')}</span>;
      break;
    }
    case 'LEG-29': // Onda
      corpo = b.filter(falou).map(w => { const on = falando(w); return (
        <span key={w.i} style={{ display: 'inline-block', margin: '0 1cqw', fontFamily: MONT, fontWeight: 800, fontSize: '8cqw', lineHeight: 1.2, color: on ? cor : '#fff', textShadow: contorno(0.45) }}>
          {[...w.txt].map((ch, j) => <span key={j} style={{ display: 'inline-block', transform: on ? `translateY(${-Math.max(0, Math.sin((t - w.ini) * 14 - j * 0.7)) * 1.8}cqw)` : 'none' }}>{ch}</span>)}
        </span>); });
      break;
    case 'LEG-30': // Citação
      corpo = <span style={{ display: 'flex', width: '100%', justifyContent: 'flex-start', gap: '2.4cqw', textAlign: 'left', opacity: sai(entB), transform: `translateX(${(1 - sai(entB)) * -4}cqw)` }}>
        <i style={{ flex: 'none', width: '1.2cqw', borderRadius: '1cqw', background: cor }} />
        <span style={{ fontFamily: MONT, fontWeight: 700, fontSize: '6cqw', lineHeight: 1.25, color: '#fff', textShadow: SOMBRA }}>{b.map((w, k) => <span key={w.i} style={{ color: w.forte ? claraCor : undefined }}>{k ? ' ' : ''}{w.txt}</span>)}</span>
      </span>;
      break;
    default:
      return null;
  }
  return <div style={caixa} aria-hidden="true">{corpo}</div>;
}

/** emoji das palavras fortes (o que não estiver aqui ganha ⭐) */
const EMOJI: Record<string, string> = { camera: '🎥', luz: '💡', cansado: '😮‍💨', aparecer: '🙈', tempo: '⏰', fala: '🗣️', dinheiro: '💰', ia: '🤖', video: '🎬', cliente: '🤝' };
