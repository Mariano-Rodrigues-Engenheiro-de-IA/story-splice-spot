/* Motor de efeitos do "Criar meu vídeo" (22/11/2026). O MESMO arquivo roda na página /criar (ao vivo, no espaço dos
   efeitos, na cor escolhida) e na skill (modelo-motion/src/efeitos-modelos.tsx, composição "EfeitoModelo"): o que a
   pessoa vê é o que a IA dela renderiza. Pedido dele: cada estilo de efeito com a SUA direção de arte (não o mesmo fundo
   escuro em todos), muitos efeitos, e o vídeo montando a cada clique. Tudo é função do tempo `t` (segundos).
   O pai precisa de tamanho definido (o efeito ocupa 100% dele); tamanhos em cqmin. Textos e tempos vêm de `fala`
   (o padrão é o trecho de exemplo: "Gravar, ligar a câmera, acertar a luz, errar a fala..."). */
import type { CSSProperties, ReactNode } from 'react';

export type EstiloEfeito = { id: string; nome: string; desc: string };
export const ESTILOS_EFEITO: EstiloEfeito[] = [
  { id: 'grafico', nome: 'Motion gráfico', desc: 'Formas chapadas, cor forte, tipografia grande que pula.' },
  { id: 'design', nome: 'Motion design', desc: 'Interface, vidro e notificações, como app de celular.' },
  { id: 'desenho', nome: 'Desenhado', desc: 'Traço à mão num caderno: círculos, setas e rabiscos.' },
  { id: 'documental', nome: 'Documental', desc: 'Papel, jornal, polaroid, carimbo, mapa e linha do tempo.' },
  { id: 'tech', nome: 'Tecnológico', desc: 'Neon, grade, terminal, HUD e números digitais.' },
  { id: 'minimal', nome: 'Minimalista', desc: 'Fundo claro, letra fina, pouca coisa e muito respiro.' },
];

export type EfeitoInfo = { codigo: string; nome: string; estilo: string };
export const EFEITOS_MODELO: EfeitoInfo[] = [
  { codigo: 'FX-01', nome: 'Título que pula', estilo: 'grafico' },
  { codigo: 'FX-02', nome: 'Lista com check', estilo: 'grafico' },
  { codigo: 'FX-03', nome: 'Número gigante', estilo: 'grafico' },
  { codigo: 'FX-04', nome: 'Ícones em sequência', estilo: 'grafico' },
  { codigo: 'FX-05', nome: 'Bateria acabando', estilo: 'grafico' },
  { codigo: 'FX-06', nome: 'Palavras em bloco', estilo: 'grafico' },
  { codigo: 'FX-07', nome: 'Notificações do celular', estilo: 'design' },
  { codigo: 'FX-08', nome: 'Conversa de chat', estilo: 'design' },
  { codigo: 'FX-09', nome: 'Cartão de vidro', estilo: 'design' },
  { codigo: 'FX-10', nome: 'Busca digitando', estilo: 'design' },
  { codigo: 'FX-11', nome: 'Botão e cursor', estilo: 'design' },
  { codigo: 'FX-12', nome: 'Interruptores', estilo: 'design' },
  { codigo: 'FX-13', nome: 'Círculo à mão', estilo: 'desenho' },
  { codigo: 'FX-14', nome: 'Seta desenhada', estilo: 'desenho' },
  { codigo: 'FX-15', nome: 'Lista riscada', estilo: 'desenho' },
  { codigo: 'FX-16', nome: 'Bonequinho cansado', estilo: 'desenho' },
  { codigo: 'FX-17', nome: 'Estrelas e destaque', estilo: 'desenho' },
  { codigo: 'FX-18', nome: 'Balão de pensamento', estilo: 'desenho' },
  { codigo: 'FX-19', nome: 'Manchete de jornal', estilo: 'documental' },
  { codigo: 'FX-20', nome: 'Polaroid com fita', estilo: 'documental' },
  { codigo: 'FX-21', nome: 'Papel e carimbo', estilo: 'documental' },
  { codigo: 'FX-22', nome: 'Mapa com rota', estilo: 'documental' },
  { codigo: 'FX-23', nome: 'Linha do tempo', estilo: 'documental' },
  { codigo: 'FX-24', nome: 'Post-its no quadro', estilo: 'documental' },
  { codigo: 'FX-25', nome: 'Scanner HUD', estilo: 'tech' },
  { codigo: 'FX-26', nome: 'Terminal', estilo: 'tech' },
  { codigo: 'FX-27', nome: 'Gráfico neon', estilo: 'tech' },
  { codigo: 'FX-28', nome: 'Painel de números', estilo: 'tech' },
  { codigo: 'FX-29', nome: 'Onda de áudio REC', estilo: 'tech' },
  { codigo: 'FX-30', nome: 'Carregando', estilo: 'tech' },
  { codigo: 'FX-31', nome: 'Palavra serifada', estilo: 'minimal' },
  { codigo: 'FX-32', nome: 'Citação', estilo: 'minimal' },
  { codigo: 'FX-33', nome: 'Número fino', estilo: 'minimal' },
  { codigo: 'FX-34', nome: 'Linha que se desenha', estilo: 'minimal' },
  { codigo: 'FX-35', nome: 'Lista numerada', estilo: 'minimal' },
  { codigo: 'FX-36', nome: 'Bloco preto', estilo: 'minimal' },
];

/** O conteúdo de cada efeito: textos e os segundos da fala em que cada coisa entra. A skill troca pela fala da pessoa. */
export type Fala = {
  titulo: string; subtitulo: string; itens: string[]; tempos: number[]; palavra: string; tPalavra: number;
  extras: string[]; tExtras: number[]; fim: string; tFim: number; numero: number;
};
export const FALA_EXEMPLO: Fala = {
  titulo: 'Gravar cansa', subtitulo: 'e ninguém fala disso',
  itens: ['Ligar a câmera', 'Acertar a luz', 'Errar a fala', 'Gravar de novo'], tempos: [1.1, 2.3, 3.46, 4.56],
  palavra: 'cansado', tPalavra: 6.68, extras: ['sem tempo', 'doente'], tExtras: [7.7, 8.42],
  fim: 'só não quer aparecer', tFim: 9.68, numero: 4,
};

/* ---------- utilidades ---------- */
const c01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ease = (x: number) => 1 - Math.pow(1 - c01(x), 3);
const back = (x: number) => { const v = c01(x) - 1; return 1 + 2.70158 * v * v * v + 1.70158 * v * v; };
const ent = (t: number, t0: number, d = 0.4) => ease((t - t0) / d);
const pop = (t: number, t0: number, d = 0.45) => back((t - t0) / d);
const sai = (t: number, t1: number, d = 0.35) => 1 - ease((t - t1) / d);
const jan = (t: number, t0: number, t1: number) => Math.min(ent(t, t0), sai(t, t1));
const digita = (s: string, t: number, t0: number, cps = 18) => s.slice(0, Math.max(0, Math.floor((t - t0) * cps)));
function rgb(h: string): [number, number, number] { const n = parseInt(h.replace('#', '').slice(0, 6), 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
export function misturaCor(a: string, b: string, k: number) {
  const x = rgb(a), y = rgb(b);
  return `#${[0, 1, 2].map(i => Math.round(x[i]! + (y[i]! - x[i]!) * k).toString(16).padStart(2, '0')).join('')}`;
}
const clara = (c: string) => { const [r, g, b] = rgb(c); return r * 0.299 + g * 0.587 + b * 0.114 > 160; };
const MONT = 'Montserrat, "Arial Black", sans-serif';
const ANTON = 'Anton, Impact, sans-serif';
const ARCH = '"Archivo Black", "Arial Black", sans-serif';
const BEBAS = '"Bebas Neue", Impact, sans-serif';
const PLAY = '"Playfair Display", Georgia, serif';
const MAO = 'Caveat, "Segoe Print", "Comic Sans MS", cursive';
const MONO = '"Courier New", Courier, monospace';
const abs = (s: CSSProperties): CSSProperties => ({ position: 'absolute', ...s });
const centro: CSSProperties = { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };

const FUNDO: Record<string, (cor: string) => string> = {
  grafico: cor => `linear-gradient(155deg, ${misturaCor(cor, '#ffffff', 0.08)}, ${misturaCor(cor, '#000000', 0.5)})`,
  design: () => 'radial-gradient(120% 90% at 25% 5%, #2b2556, #0a0916 72%)',
  desenho: () => '#fbfaf5',
  documental: () => 'radial-gradient(130% 110% at 50% 35%, #ead9b6, #b89767)',
  tech: () => '#04060c',
  minimal: () => '#f3efe7',
};
/** ícones simples em traço (SVG 24x24) */
const ICONE: Record<string, string> = {
  camera: 'M3 7h4l2-3h6l2 3h4v13H3z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  luz: 'M9 18h6 M10 21h4 M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z',
  erro: 'M12 3l9 16H3z M12 9v5 M12 17v.5',
  relogio: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  play: 'M8 5l11 7-11 7z',
};
const Ic = ({ n, cor, s, w = 2.2 }: { n: string; cor: string; s: string; w?: number }) => (
  <svg viewBox="0 0 24 24" style={{ width: s, height: s }} fill="none" stroke={cor} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d={ICONE[n] ?? ''} /></svg>
);

type Ctx = { t: number; cor: string; f: Fala; img: (n: string) => string };

/* ---------- os efeitos ---------- */
const P: Record<string, (c: Ctx) => ReactNode> = {
  /* ===== MOTION GRÁFICO ===== */
  'FX-01': ({ t, cor, f }) => {
    const seg = t >= f.tPalavra - 0.2;
    const tit = seg ? `Tem dia que` : f.titulo;
    const sub = seg ? f.fim : f.subtitulo;
    const t0 = seg ? f.tPalavra - 0.2 : 0.1;
    return <div style={centro}>
      <div style={{ display: 'flex', gap: '1.4cqmin', flexWrap: 'wrap', justifyContent: 'center', padding: '0 6cqmin' }}>
        {tit.toUpperCase().split(' ').map((w, i) => { const k = pop(t, t0 + i * 0.12); return <span key={i + tit} style={{ fontFamily: ARCH, fontSize: '13cqmin', lineHeight: 1, color: '#fff', transform: `translateY(${(1 - k) * 12}cqmin) scale(${0.6 + 0.4 * k})`, opacity: c01(k * 2), textShadow: '0 1.2cqmin 0 rgba(0,0,0,.25)' }}>{w}</span>; })}
      </div>
      <div style={{ marginTop: '3cqmin', padding: '1.6cqmin 3.6cqmin', background: '#fff', color: cor, fontFamily: MONT, fontWeight: 800, fontSize: '5cqmin', borderRadius: '1cqmin', transform: `scaleX(${ent(t, t0 + 0.45, 0.35)})` }}>{sub}</div>
    </div>;
  },
  'FX-02': ({ t, cor, f }) => (
    <div style={{ ...centro, gap: '2.4cqmin', padding: '0 8cqmin', alignItems: 'stretch' }}>
      {f.itens.map((it, i) => { const k = pop(t, f.tempos[i] ?? 0); const p = ent(t, (f.tempos[i] ?? 0) + 0.15, 0.3); return (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '3cqmin', padding: '2.2cqmin 3cqmin', borderRadius: '2.4cqmin', background: '#fff', boxShadow: '0 1.4cqmin 0 rgba(0,0,0,.18)', transform: `translateX(${(1 - k) * -40}cqmin)`, opacity: c01(k * 3) }}>
          <span style={{ display: 'grid', placeItems: 'center', width: '8cqmin', height: '8cqmin', borderRadius: '99px', background: cor }}>
            <svg viewBox="0 0 24 24" style={{ width: '5cqmin', height: '5cqmin' }} fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round"><path d={ICONE['check']} strokeDasharray={22} strokeDashoffset={22 * (1 - p)} /></svg>
          </span>
          <span style={{ fontFamily: MONT, fontWeight: 800, fontSize: '5.6cqmin', color: '#111' }}>{it}</span>
        </div>); })}
    </div>),
  'FX-03': ({ t, cor, f }) => {
    const n = f.tempos.filter(x => t >= x).length;
    const seg = t >= f.tPalavra;
    const k = pop(t, seg ? f.tPalavra : (f.tempos[Math.max(0, n - 1)] ?? 0), 0.35);
    return <div style={centro}>
      <span style={{ fontFamily: ANTON, fontSize: '42cqmin', lineHeight: 0.9, color: '#fff', transform: `scale(${0.8 + 0.2 * k})`, textShadow: `1.4cqmin 1.4cqmin 0 ${misturaCor(cor, '#000000', 0.45)}` }}>{seg ? '0' : `${Math.max(1, n)}x`}</span>
      <span style={{ marginTop: '2cqmin', fontFamily: MONT, fontWeight: 800, fontSize: '6cqmin', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.4cqmin' }}>{seg ? 'vontade de gravar' : 'a mesma tomada'}</span>
    </div>;
  },
  'FX-04': ({ t, cor, f }) => {
    const ics = ['camera', 'luz', 'erro', 'relogio'];
    const tt = [f.tempos[0] ?? 1, f.tempos[1] ?? 2, f.tempos[2] ?? 3, f.tExtras[0] ?? 7];
    return <div style={{ ...centro, flexDirection: 'row', flexWrap: 'wrap', gap: '5cqmin', padding: '0 10cqmin' }}>
      {ics.map((n, i) => { const k = pop(t, tt[i]!); return (
        <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.6cqmin', transform: `scale(${k}) rotate(${(1 - k) * -40}deg)`, opacity: c01(k * 2) }}>
          <span style={{ display: 'grid', placeItems: 'center', width: '24cqmin', height: '24cqmin', borderRadius: '6cqmin', background: '#fff', boxShadow: '0 1.6cqmin 0 rgba(0,0,0,.2)' }}><Ic n={n} cor={cor} s="13cqmin" /></span>
          <span style={{ fontFamily: MONT, fontWeight: 800, fontSize: '4cqmin', color: '#fff' }}>{[f.itens[0], f.itens[1], f.itens[2], f.extras[0]][i]}</span>
        </div>); })}
    </div>;
  },
  'FX-05': ({ t, cor, f }) => {
    const nivel = Math.max(0.06, 1 - c01((t - 0.4) / Math.max(1, f.tFim - 0.4)) * 0.94);
    const vermelho = nivel < 0.25;
    return <div style={centro}>
      <span style={{ fontFamily: MONT, fontWeight: 800, fontSize: '5.4cqmin', color: '#fff', marginBottom: '3cqmin', textTransform: 'uppercase', letterSpacing: '0.5cqmin' }}>energia pra gravar</span>
      <div style={{ position: 'relative', width: '64cqmin', height: '28cqmin', border: '1.8cqmin solid #fff', borderRadius: '4cqmin', padding: '1.6cqmin' }}>
        <i style={abs({ right: '-5.2cqmin', top: '8cqmin', width: '3.4cqmin', height: '9cqmin', background: '#fff', borderRadius: '0 1.4cqmin 1.4cqmin 0' })} />
        <div style={{ width: `${nivel * 100}%`, height: '100%', borderRadius: '2cqmin', background: vermelho ? '#ff4d4d' : '#fff' }} />
      </div>
      <span style={{ marginTop: '3cqmin', fontFamily: ANTON, fontSize: '13cqmin', color: vermelho ? '#ffd0d0' : '#fff' }}>{Math.round(nivel * 100)}%</span>
    </div>;
  },
  'FX-06': ({ t, cor, f }) => {
    const blocos = [{ w: 'GRAVAR', t0: 0.06 }, { w: 'ERRAR', t0: f.tempos[2] ?? 3.4 }, { w: 'DE NOVO', t0: f.tempos[3] ?? 4.5 }, { w: f.palavra.toUpperCase(), t0: f.tPalavra }];
    return <div style={{ ...centro, gap: '1.6cqmin' }}>
      {blocos.map((b, i) => { const k = pop(t, b.t0); const ultimo = i === blocos.length - 1; const treme = ultimo && t > b.t0 && t < b.t0 + 0.8 ? Math.sin(t * 60) * 1 : 0; return (
        <span key={i} style={{ fontFamily: ARCH, fontSize: ultimo ? '15cqmin' : '9cqmin', lineHeight: 1, padding: '1.2cqmin 3cqmin', background: ultimo ? '#fff' : 'transparent', color: ultimo ? cor : '#fff', border: ultimo ? 'none' : '0.8cqmin solid #fff', transform: `translateX(${(1 - k) * (i % 2 ? 50 : -50)}cqmin) rotate(${treme}deg)`, opacity: c01(k * 2) }}>{b.w}</span>); })}
    </div>;
  },

  /* ===== MOTION DESIGN ===== */
  'FX-07': ({ t, cor, f }) => {
    const nots = [{ app: 'LEMBRETE', txt: 'Gravar o vídeo de hoje', t0: 0.3 }, { app: 'BATERIA', txt: 'Bateria fraca: 5%', t0: f.tempos[1] ?? 2.3 }, { app: 'INSTAGRAM', txt: 'Você não posta há 7 dias', t0: f.tPalavra }];
    return <div style={{ ...centro, justifyContent: 'flex-start', paddingTop: '8cqmin', gap: '2.4cqmin' }}>
      {nots.filter(n => t >= n.t0 - 0.1).reverse().map(n => { const k = pop(t, n.t0, 0.5); return (
        <div key={n.txt} style={{ width: '82cqmin', display: 'flex', gap: '3cqmin', alignItems: 'center', padding: '3cqmin', borderRadius: '5cqmin', background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.22)', backdropFilter: 'blur(2cqmin)', WebkitBackdropFilter: 'blur(2cqmin)', transform: `translateY(${(1 - k) * -30}cqmin) scale(${0.9 + 0.1 * k})`, opacity: c01(k * 2) }}>
          <span style={{ flex: 'none', width: '10cqmin', height: '10cqmin', borderRadius: '2.6cqmin', background: cor }} />
          <span style={{ display: 'flex', flexDirection: 'column', gap: '0.6cqmin' }}>
            <b style={{ fontFamily: MONT, fontWeight: 700, fontSize: '3.2cqmin', color: 'rgba(255,255,255,.65)', letterSpacing: '0.3cqmin' }}>{n.app} · agora</b>
            <span style={{ fontFamily: MONT, fontWeight: 700, fontSize: '4.6cqmin', color: '#fff' }}>{n.txt}</span>
          </span>
        </div>); })}
    </div>;
  },
  'FX-08': ({ t, cor, f }) => {
    const msgs = [{ eu: false, txt: 'Bora gravar hoje?', t0: 0.3 }, { eu: true, txt: `Tô ${f.palavra} 😩`, t0: f.tPalavra }, { eu: true, txt: 'Amanhã eu gravo', t0: f.tExtras[1] ?? 8.4 }];
    return <div style={{ ...centro, justifyContent: 'flex-end', alignItems: 'stretch', gap: '2.4cqmin', padding: '0 7cqmin 10cqmin' }}>
      {msgs.filter(m => t >= m.t0 - 0.05).map(m => { const k = pop(t, m.t0, 0.4); return (
        <div key={m.txt} style={{ alignSelf: m.eu ? 'flex-end' : 'flex-start', maxWidth: '70cqmin', padding: '3cqmin 4cqmin', borderRadius: '5cqmin', borderBottomRightRadius: m.eu ? '1cqmin' : '5cqmin', borderBottomLeftRadius: m.eu ? '5cqmin' : '1cqmin', background: m.eu ? cor : 'rgba(255,255,255,.16)', color: m.eu && clara(cor) ? '#111' : '#fff', fontFamily: MONT, fontWeight: 600, fontSize: '5.4cqmin', transform: `scale(${k})`, transformOrigin: m.eu ? 'right bottom' : 'left bottom' }}>{m.txt}</div>); })}
      {t < (msgs[1]?.t0 ?? 6) && t > 1.2 && <div style={{ alignSelf: 'flex-end', padding: '2.6cqmin 4cqmin', borderRadius: '5cqmin', background: 'rgba(255,255,255,.12)', display: 'flex', gap: '1.4cqmin' }}>{[0, 1, 2].map(i => <i key={i} style={{ width: '2cqmin', height: '2cqmin', borderRadius: 99, background: '#fff', opacity: 0.35 + 0.65 * Math.max(0, Math.sin(t * 6 - i)) }} />)}</div>}
    </div>;
  },
  'FX-09': ({ t, cor, f }) => {
    const k = ent(t, 0.2, 0.6);
    const n = f.tempos.filter(x => t >= x).length;
    return <div style={centro}>
      <div style={{ width: '82cqmin', padding: '6cqmin', borderRadius: '6cqmin', background: 'linear-gradient(140deg, rgba(255,255,255,.2), rgba(255,255,255,.05))', border: '1px solid rgba(255,255,255,.3)', boxShadow: `0 4cqmin 12cqmin rgba(0,0,0,.4), inset 0 0 0 1px rgba(255,255,255,.05), 0 0 8cqmin ${cor}44`, backdropFilter: 'blur(3cqmin)', WebkitBackdropFilter: 'blur(3cqmin)', transform: `translateY(${(1 - k) * 14}cqmin) rotateX(${(1 - k) * 25}deg)`, opacity: k }}>
        <span style={{ fontFamily: MONT, fontWeight: 700, fontSize: '3.4cqmin', color: misturaCor(cor, '#ffffff', 0.5), letterSpacing: '0.5cqmin', textTransform: 'uppercase' }}>Etapa {Math.max(1, n)} de {f.itens.length}</span>
        <div style={{ marginTop: '1.6cqmin', fontFamily: MONT, fontWeight: 800, fontSize: '8cqmin', color: '#fff', lineHeight: 1.1 }}>{f.itens[Math.max(0, n - 1)]}</div>
        <div style={{ marginTop: '4cqmin', height: '1.8cqmin', borderRadius: 99, background: 'rgba(255,255,255,.15)', overflow: 'hidden' }}><div style={{ width: `${(n / f.itens.length) * 100}%`, height: '100%', background: cor, borderRadius: 99 }} /></div>
      </div>
    </div>;
  },
  'FX-10': ({ t, cor, f }) => {
    const q = 'como gravar sem errar';
    const res = ['Gravar de novo pela 4ª vez?', 'Por que eu travo na câmera', 'Editar vídeo com IA'];
    return <div style={{ ...centro, justifyContent: 'flex-start', paddingTop: '14cqmin', gap: '2cqmin' }}>
      <div style={{ width: '84cqmin', display: 'flex', alignItems: 'center', gap: '2.6cqmin', padding: '3.4cqmin 4cqmin', borderRadius: '99px', background: '#fff', boxShadow: `0 0 0 0.8cqmin ${cor}66` }}>
        <svg viewBox="0 0 24 24" style={{ width: '5cqmin', height: '5cqmin' }} fill="none" stroke="#666" strokeWidth={2.4}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
        <span style={{ fontFamily: MONT, fontWeight: 600, fontSize: '5cqmin', color: '#222' }}>{digita(q, t, 0.8, 9)}<span style={{ color: cor, opacity: Math.floor(t * 3) % 2 }}>|</span></span>
      </div>
      {res.map((r, i) => { const k = ent(t, 3.3 + i * 0.35, 0.35); return <div key={r} style={{ width: '84cqmin', padding: '2.6cqmin 4cqmin', borderRadius: '3cqmin', background: 'rgba(255,255,255,.1)', color: '#fff', fontFamily: MONT, fontWeight: 600, fontSize: '4.4cqmin', transform: `translateY(${(1 - k) * 5}cqmin)`, opacity: k * (i === 2 && t > f.tPalavra ? 1 : i === 2 ? 0.6 : 1), border: i === 2 && t > f.tPalavra ? `0.5cqmin solid ${cor}` : '1px solid transparent' }}>{r}</div>; })}
    </div>;
  },
  'FX-11': ({ t, cor, f }) => {
    const clique = f.tempos[1] ?? 2.3;
    const cansou = t >= f.tPalavra;
    const ida = ease((t - (clique - 1.1)) / 1.0);
    const aperta = t >= clique && t < clique + 0.18;
    const cx = 80 - 34 * ida, cy = 85 - 33 * ida;
    return <div style={centro}>
      <div style={{ padding: '5cqmin 10cqmin', borderRadius: '99px', background: cansou ? '#555' : cor, color: '#fff', fontFamily: MONT, fontWeight: 800, fontSize: '7cqmin', boxShadow: cansou ? 'none' : `0 2cqmin 6cqmin ${cor}88`, transform: `scale(${aperta ? 0.92 : 1})` }}>{cansou ? 'Cansado demais' : 'Gravar agora'}</div>
      {t > clique && t < f.tPalavra && <div style={{ marginTop: '4cqmin', fontFamily: MONT, fontWeight: 700, fontSize: '4.6cqmin', color: '#fff', opacity: ent(t, clique + 0.1) }}>● gravando… tomada {Math.min(4, 1 + Math.floor((t - clique) / 1.1))}</div>}
      <svg viewBox="0 0 24 24" style={abs({ left: `${cx}%`, top: `${cy}%`, width: '9cqmin', height: '9cqmin', filter: 'drop-shadow(0 0.6cqmin 0.8cqmin rgba(0,0,0,.5))' })}><path d="M4 2l16 9-7 2-3 7z" fill="#fff" stroke="#111" strokeWidth={1.2} /></svg>
      {aperta && <i style={abs({ left: `${cx}%`, top: `${cy}%`, width: '14cqmin', height: '14cqmin', margin: '-5cqmin 0 0 -5cqmin', borderRadius: 99, border: `0.6cqmin solid ${cor}`, opacity: 0.8 })} />}
    </div>;
  },
  'FX-12': ({ t, cor, f }) => {
    const linhas = [{ n: 'Câmera', on: f.tempos[0] ?? 1.1, off: 99 }, { n: 'Luz', on: f.tempos[1] ?? 2.3, off: 99 }, { n: 'Roteiro', on: 99, off: 99 }, { n: 'Vontade', on: 0, off: f.tPalavra }];
    return <div style={{ ...centro, gap: '0' }}>
      <div style={{ width: '82cqmin', borderRadius: '5cqmin', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)', overflow: 'hidden' }}>
        {linhas.map((l, i) => { const ligado = t >= l.on && t < l.off; return (
          <div key={l.n} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4cqmin 5cqmin', borderTop: i ? '1px solid rgba(255,255,255,.12)' : 'none' }}>
            <span style={{ fontFamily: MONT, fontWeight: 600, fontSize: '5.4cqmin', color: '#fff' }}>{l.n}</span>
            <span style={{ position: 'relative', width: '15cqmin', height: '9cqmin', borderRadius: 99, background: ligado ? cor : 'rgba(255,255,255,.25)' }}>
              <i style={abs({ top: '0.9cqmin', left: ligado ? '6.9cqmin' : '0.9cqmin', width: '7.2cqmin', height: '7.2cqmin', borderRadius: 99, background: '#fff', boxShadow: '0 0.4cqmin 1cqmin rgba(0,0,0,.3)' })} />
            </span>
          </div>); })}
      </div>
    </div>;
  },

  /* ===== DESENHADO ===== */
  'FX-13': ({ t, cor, f }) => {
    const ps = [{ w: 'câmera', t0: f.tempos[0] ?? 1.1, d: 'M10 30 C 10 5, 90 0, 92 25 C 95 50, 15 55, 8 32 C 5 20, 30 8, 55 8' }, { w: 'luz', t0: f.tempos[1] ?? 2.3, d: 'M5 40 Q 50 52, 95 38' }, { w: f.palavra, t0: f.tPalavra, d: 'M5 12 L95 40 M8 40 L92 10' }];
    return <div style={{ ...centro, gap: '6cqmin' }}>
      {ps.map(p => { const k = ent(t, p.t0, 0.25); const r = ent(t, p.t0 + 0.25, 0.5); return (
        <div key={p.w} style={{ position: 'relative', opacity: k }}>
          <span style={{ fontFamily: MAO, fontWeight: 700, fontSize: '14cqmin', color: '#1d1d1f' }}>{p.w}</span>
          <svg viewBox="0 0 100 55" preserveAspectRatio="none" style={abs({ left: '-12%', top: '-18%', width: '124%', height: '136%', overflow: 'visible' })}><path d={p.d} fill="none" stroke={cor} strokeWidth={3.2} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - r} opacity={r > 0.01 ? 1 : 0} /></svg>
        </div>); })}
    </div>;
  },
  'FX-14': ({ t, cor, f }) => {
    const r = ent(t, 0.6, 0.9);
    const r2 = ent(t, f.tPalavra, 0.7);
    return <div style={centro}>
      <span style={abs({ top: '14%', left: '10%', fontFamily: MAO, fontWeight: 700, fontSize: '12cqmin', color: '#1d1d1f', transform: 'rotate(-6deg)', opacity: ent(t, 0.2) })}>isso aqui</span>
      <svg viewBox="0 0 100 100" style={abs({ inset: '8%', width: '84%', height: '84%' })}>
        <path d="M30 32 C 45 45, 50 60, 48 88 M40 80 L48 90 L57 81" fill="none" stroke={cor} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - r} opacity={r > 0.01 ? 1 : 0} />
        <path d="M58 30 C 70 22, 85 28, 80 40 C 76 50, 60 46, 66 36" fill="none" stroke="#1d1d1f" strokeWidth={1.6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - r2} opacity={r2 > 0.01 ? 1 : 0} />
      </svg>
      <span style={abs({ top: '22%', right: '8%', fontFamily: MAO, fontWeight: 700, fontSize: '10cqmin', color: cor, transform: 'rotate(5deg)', opacity: ent(t, f.tPalavra + 0.3) })}>{f.palavra}!</span>
    </div>;
  },
  'FX-15': ({ t, cor, f }) => (
    <div style={{ ...centro, alignItems: 'flex-start', padding: '0 12cqmin', gap: '3.4cqmin' }}>
      <span style={{ fontFamily: MAO, fontWeight: 700, fontSize: '9cqmin', color: cor, opacity: ent(t, 0.2) }}>pra gravar:</span>
      {f.itens.map((it, i) => { const k = ent(t, (f.tempos[i] ?? 0) - 0.1, 0.5); const risca = ent(t, (f.tempos[i] ?? 0) + 0.7, 0.4); return (
        <span key={i} style={{ position: 'relative', fontFamily: MAO, fontWeight: 600, fontSize: '8cqmin', color: '#1d1d1f', clipPath: `inset(0 ${(1 - k) * 100}% 0 0)` }}>
          □ {it}
          <i style={abs({ left: '-2%', top: '52%', height: '0.9cqmin', width: `${risca * 104}%`, background: cor, borderRadius: 99, transform: 'rotate(-2deg)' })} />
        </span>); })}
    </div>),
  'FX-16': ({ t, cor, f }) => {
    const des = ent(t, 0.3, 1.6);
    const cansa = ent(t, f.tPalavra, 0.8);
    const tomb = cansa * 18;
    return <div style={centro}>
      <svg viewBox="0 0 100 100" style={{ width: '70cqmin', height: '70cqmin' }}>
        <g transform={`rotate(${tomb} 50 90)`} fill="none" stroke="#1d1d1f" strokeWidth={2.4} strokeLinecap="round">
          <circle cx="50" cy={30 + cansa * 4} r="10" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - c01(des * 3)} opacity={des > 0.01 ? 1 : 0} />
          <path d={`M50 ${40 + cansa * 4} L50 68 M50 50 L${36 + cansa * 4} ${60 + cansa * 8} M50 50 L${64 - cansa * 4} ${60 + cansa * 8} M50 68 L40 88 M50 68 L60 88`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - c01(des * 1.5 - 0.3)} opacity={des > 0.2 ? 1 : 0} />
          <path d={cansa > 0.5 ? 'M45 31 L48 31 M52 31 L55 31' : 'M45 29 L45 31 M55 29 L55 31'} stroke="#1d1d1f" />
        </g>
        <text x="70" y={22 - cansa * 4} fontFamily={MAO} fontWeight={700} fontSize="9" fill={cor} opacity={cansa}>z z z</text>
      </svg>
      <span style={{ fontFamily: MAO, fontWeight: 700, fontSize: '10cqmin', color: cor, opacity: ent(t, f.tPalavra + 0.4) }}>{f.palavra}…</span>
    </div>;
  },
  'FX-17': ({ t, cor, f }) => {
    const k = pop(t, f.tPalavra, 0.5);
    const est = [[-34, -20], [30, -26], [-28, 22], [36, 18], [0, -36]];
    return <div style={centro}>
      <span style={{ fontFamily: MAO, fontWeight: 700, fontSize: '11cqmin', color: '#1d1d1f', opacity: ent(t, 0.2) }}>{f.titulo.toLowerCase()}</span>
      <span style={{ position: 'relative', marginTop: '2cqmin', fontFamily: MAO, fontWeight: 700, fontSize: '19cqmin', color: cor, opacity: c01(k * 2), transform: `scale(${0.4 + 0.6 * k}) rotate(${(1 - k) * 10 - 3}deg)` }}>
        {f.palavra}
        {est.map(([x, y], i) => <svg key={i} viewBox="0 0 24 24" style={abs({ left: `calc(50% + ${x}cqmin)`, top: `calc(50% + ${y}cqmin)`, width: '7cqmin', height: '7cqmin', opacity: k, transform: `rotate(${i * 25 + t * 30}deg)` })}><path d="M12 2l2.5 7H22l-6 4.5 2.3 7.5L12 16.5 5.7 21 8 13.5 2 9h7.5z" fill="none" stroke="#1d1d1f" strokeWidth={1.5} /></svg>)}
      </span>
    </div>;
  },
  'FX-18': ({ t, cor, f }) => {
    const d = ent(t, 0.3, 1);
    const txt = t < f.tPalavra ? 'será que hoje eu gravo?' : 'hoje não…';
    return <div style={centro}>
      <svg viewBox="0 0 100 70" style={{ width: '86cqmin', height: '60cqmin', overflow: 'visible' }}>
        <path d="M20 40 C 5 40, 5 15, 25 15 C 28 2, 55 0, 60 12 C 75 2, 98 12, 88 30 C 100 45, 80 58, 65 50 C 55 62, 30 60, 28 50 C 15 55, 10 45, 20 40 Z" fill="#fff" stroke="#1d1d1f" strokeWidth={1.4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} opacity={d > 0.01 ? 1 : 0} />
        {[[22, 62, 3.5], [14, 68, 2.2]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" stroke="#1d1d1f" strokeWidth={1.2} opacity={ent(t, 1.2 + i * 0.2)} />)}
        <text x="52" y="38" textAnchor="middle" fontFamily={MAO} fontWeight={700} fontSize="8" fill={t < f.tPalavra ? '#1d1d1f' : cor} opacity={ent(t, 1.1)}>{txt}</text>
      </svg>
    </div>;
  },

  /* ===== DOCUMENTAL ===== */
  'FX-19': ({ t, cor, f }) => {
    const k = ent(t, 0.2, 0.9);
    const carimbo = pop(t, f.tPalavra, 0.35);
    return <div style={centro}>
      <div style={{ position: 'relative', width: '84cqmin', padding: '5cqmin', background: '#f4efe4', boxShadow: '0 3cqmin 8cqmin rgba(0,0,0,.35)', transform: `rotate(${-3 + (1 - k) * -12}deg) scale(${0.6 + 0.4 * k})`, opacity: k }}>
        <div style={{ fontFamily: PLAY, fontWeight: 600, fontStyle: 'italic', fontSize: '4cqmin', textAlign: 'center', borderBottom: '0.5cqmin double #222', paddingBottom: '1.4cqmin', color: '#222' }}>Diário do Criador</div>
        <div style={{ marginTop: '3cqmin', fontFamily: ANTON, fontSize: '10cqmin', lineHeight: 1, color: '#111', textTransform: 'uppercase' }}>{f.titulo}: {f.itens.length} tentativas e nada</div>
        <div style={{ marginTop: '3cqmin', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2cqmin' }}>{[0, 1, 2, 3, 4, 5].map(i => <i key={i} style={{ height: '1cqmin', background: '#bbb', width: i % 3 === 2 ? '70%' : '100%' }} />)}</div>
        <div style={abs({ right: '4cqmin', bottom: '6cqmin', padding: '1.6cqmin 3cqmin', border: `0.9cqmin solid ${cor}`, color: cor, fontFamily: ARCH, fontSize: '7cqmin', textTransform: 'uppercase', transform: `rotate(-14deg) scale(${2 - carimbo})`, opacity: c01(carimbo) * 0.9, mixBlendMode: 'multiply' })}>{f.palavra}</div>
      </div>
    </div>;
  },
  'FX-20': ({ t, cor, f, img }) => {
    const k = ent(t, 0.2, 0.8);
    return <div style={centro}>
      <div style={{ position: 'relative', width: '66cqmin', padding: '3cqmin 3cqmin 13cqmin', background: '#fff', boxShadow: '0 3cqmin 8cqmin rgba(0,0,0,.4)', transform: `translateY(${(1 - k) * -60}cqmin) rotate(${4 - (1 - k) * 20}deg)` }}>
        <img src={img('cz_parede.jpg')} alt="" style={{ display: 'block', width: '100%', aspectRatio: '1', objectFit: 'cover', objectPosition: '50% 30%', filter: `sepia(${t > f.tPalavra ? 0.6 : 0.15}) saturate(${t > f.tPalavra ? 0.6 : 1})` }} />
        <span style={abs({ left: 0, right: 0, bottom: '3cqmin', textAlign: 'center', fontFamily: MAO, fontWeight: 700, fontSize: '7.5cqmin', color: '#1d1d1f' })}>{t < f.tPalavra ? `tomada ${Math.max(1, f.tempos.filter(x => t >= x).length)}` : `${f.palavra}…`}</span>
        <i style={abs({ top: '-3cqmin', left: '22cqmin', width: '22cqmin', height: '7cqmin', background: `${cor}aa`, transform: 'rotate(-5deg)' })} />
      </div>
    </div>;
  },
  'FX-21': ({ t, cor, f }) => {
    const linhas = [...f.itens.map(x => `${x}.`), `Resultado: ${f.palavra}.`];
    const ts = [...f.tempos, f.tPalavra - 0.3];
    const k = pop(t, f.tPalavra + 0.5, 0.3);
    return <div style={centro}>
      <div style={{ position: 'relative', width: '80cqmin', minHeight: '70cqmin', padding: '7cqmin 6cqmin', background: '#f1eadb', boxShadow: '0 2cqmin 6cqmin rgba(0,0,0,.35)', transform: 'rotate(1.5deg)' }}>
        {linhas.map((l, i) => <div key={i} style={{ fontFamily: MONO, fontWeight: 700, fontSize: '4.6cqmin', color: '#222', lineHeight: 1.7 }}>{digita(l, t, ts[i] ?? 0, 22)}</div>)}
        <div style={abs({ right: '5cqmin', bottom: '6cqmin', padding: '1.4cqmin 3cqmin', border: `0.8cqmin solid ${cor}`, borderRadius: '1.4cqmin', fontFamily: ARCH, fontSize: '6.6cqmin', color: cor, textTransform: 'uppercase', transform: `rotate(-12deg) scale(${2.2 - 1.2 * k})`, opacity: c01(k), mixBlendMode: 'multiply' })}>Reprovado</div>
      </div>
    </div>;
  },
  'FX-22': ({ t, cor, f }) => {
    const r = ent(t, 0.8, Math.max(1, f.tPalavra - 1.2));
    const pino = pop(t, f.tPalavra, 0.4);
    return <div style={centro}>
      <svg viewBox="0 0 100 100" style={{ width: '92cqmin', height: '92cqmin' }}>
        <rect x="4" y="4" width="92" height="92" rx="4" fill="#e7dcc3" stroke="#8a7b5c" strokeWidth={0.8} />
        <path d="M4 60 C 25 55, 35 70, 55 62 S 85 50, 96 58 L96 96 L4 96Z" fill="#cbd9c0" opacity={0.8} />
        <path d="M30 4 C 35 30, 25 50, 40 96" fill="none" stroke="#9db6cf" strokeWidth={4} opacity={0.8} />
        {[[15, 20], [70, 18], [62, 80], [18, 78]].map(([x, y], i) => <rect key={i} x={x} y={y} width="12" height="8" fill="#d8c9a7" stroke="#a5946f" strokeWidth={0.5} />)}
        <path d="M20 30 C 40 30, 45 55, 60 50 S 75 70, 78 76" fill="none" stroke={cor} strokeWidth={2.2} strokeLinecap="round" strokeDasharray="0.04 0.03" pathLength={1} />
        <path d="M20 30 C 40 30, 45 55, 60 50 S 75 70, 78 76" fill="none" stroke="#e7dcc3" strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={-r} />
        <circle cx="20" cy="30" r="2.2" fill="#333" />
        <g transform={`translate(78 ${76 - (1 - pino) * 20}) scale(${pino})`} opacity={c01(pino)}><path d="M0 0 C -5 -6, -5 -12, 0 -12 C 5 -12, 5 -6, 0 0Z" fill={cor} /><circle cx="0" cy="-8" r="2" fill="#fff" /></g>
        <text x="20" y="25" fontFamily={MAO} fontWeight={700} fontSize="5" fill="#333">casa</text>
        <text x="66" y="88" fontFamily={MAO} fontWeight={700} fontSize="5" fill="#333" opacity={c01(pino)}>gravação</text>
      </svg>
    </div>;
  },
  'FX-23': ({ t, cor, f }) => {
    const marcos = [{ d: 'SEG', txt: 'gravar', t0: 0.3 }, { d: 'TER', txt: 'regravar', t0: f.tempos[2] ?? 3.4 }, { d: 'QUA', txt: 'de novo', t0: f.tempos[3] ?? 4.5 }, { d: 'QUI', txt: f.palavra, t0: f.tPalavra }];
    const prog = c01((t - 0.3) / Math.max(1, f.tPalavra - 0.3));
    return <div style={centro}>
      <div style={{ position: 'relative', width: '70cqmin', height: '40cqmin' }}>
        <i style={abs({ left: 0, right: 0, top: '50%', height: '0.8cqmin', background: '#6b5a3c', opacity: 0.35 })} />
        <i style={abs({ left: 0, top: '50%', height: '0.8cqmin', width: `${prog * 100}%`, background: cor })} />
        {marcos.map((m, i) => { const k = pop(t, m.t0, 0.4); const x = (i / (marcos.length - 1)) * 100; return (
          <div key={i} style={abs({ left: `${x}%`, top: '50%', transform: `translate(-50%, -50%) scale(${k})`, display: 'flex', flexDirection: 'column', alignItems: 'center' })}>
            <span style={{ fontFamily: BEBAS, fontSize: '6cqmin', color: '#3b2f1c', marginBottom: '1cqmin' }}>{m.d}</span>
            <i style={{ width: '4.4cqmin', height: '4.4cqmin', borderRadius: 99, background: i === marcos.length - 1 ? cor : '#3b2f1c', border: '0.8cqmin solid #f1e6cf' }} />
            <span style={{ marginTop: '1.4cqmin', fontFamily: MAO, fontWeight: 700, fontSize: '5.6cqmin', color: i === marcos.length - 1 ? cor : '#3b2f1c', whiteSpace: 'nowrap' }}>{m.txt}</span>
          </div>); })}
      </div>
    </div>;
  },
  'FX-24': ({ t, cor, f }) => {
    const cores = ['#ffe680', '#ffb3c7', '#b8f0d0', '#ffd0a6'];
    const pos = [[-24, -20, -6], [22, -22, 5], [-22, 18, 4], [24, 16, -4]];
    return <div style={{ ...centro, background: 'radial-gradient(circle at 30% 30%, #c49a6c, #8f6a43)' }}>
      {f.itens.map((it, i) => { const k = pop(t, f.tempos[i] ?? 0, 0.4); const [x, y, r] = pos[i]!; return (
        <div key={i} style={abs({ left: `calc(50% + ${x}cqmin)`, top: `calc(50% + ${y}cqmin)`, width: '38cqmin', height: '34cqmin', marginLeft: '-19cqmin', marginTop: '-17cqmin', padding: '4cqmin', background: i === 3 && t > f.tPalavra ? cor : cores[i], boxShadow: '0 1.4cqmin 3cqmin rgba(0,0,0,.35)', transform: `rotate(${r}deg) scale(${k})`, fontFamily: MAO, fontWeight: 700, fontSize: '7cqmin', color: '#222', lineHeight: 1.05 })}>
          <i style={abs({ top: '-1.6cqmin', left: '45%', width: '3.6cqmin', height: '3.6cqmin', borderRadius: 99, background: '#d33', boxShadow: '0 0.4cqmin 0.6cqmin rgba(0,0,0,.4)' })} />
          {it}
        </div>); })}
    </div>;
  },

  /* ===== TECNOLÓGICO ===== */
  'FX-25': ({ t, cor, f }) => {
    const y = 15 + ((t * 30) % 70);
    const rotulos = [{ txt: 'ROSTO OK', t0: 0.4 }, { txt: `LUZ ${t > (f.tempos[1] ?? 2.3) ? 72 : 12}%`, t0: f.tempos[1] ?? 2.3 }, { txt: `ENERGIA ${t > f.tPalavra ? 9 : 64}%`, t0: f.tPalavra }];
    return <div style={{ ...centro, background: `linear-gradient(${cor}1f 1px, transparent 1px) 0 0/8cqmin 8cqmin, linear-gradient(90deg, ${cor}1f 1px, transparent 1px) 0 0/8cqmin 8cqmin, #04060c` }}>
      {[[8, 8, '0 0'], [92, 8, '100% 0'], [8, 92, '0 100%'], [92, 92, '100% 100%']].map(([x, yy], i) => <i key={i} style={abs({ left: `${x}%`, top: `${yy}%`, width: '10cqmin', height: '10cqmin', transform: 'translate(-50%,-50%)', borderTop: i < 2 ? `0.6cqmin solid ${cor}` : 'none', borderBottom: i >= 2 ? `0.6cqmin solid ${cor}` : 'none', borderLeft: i % 2 === 0 ? `0.6cqmin solid ${cor}` : 'none', borderRight: i % 2 === 1 ? `0.6cqmin solid ${cor}` : 'none' })} />)}
      <i style={abs({ left: '6%', right: '6%', top: `${y}%`, height: '0.5cqmin', background: cor, boxShadow: `0 0 3cqmin ${cor}` })} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.4cqmin' }}>
        {rotulos.map(r => <span key={r.t0} style={{ fontFamily: MONO, fontWeight: 700, fontSize: '5.6cqmin', color: cor, textShadow: `0 0 2cqmin ${cor}`, opacity: ent(t, r.t0, 0.2) }}>▸ {r.txt}</span>)}
      </div>
    </div>;
  },
  'FX-26': ({ t, cor, f }) => {
    const linhas = [{ s: '$ gravar --tomada 1', t0: 0.2 }, { s: 'erro: luz insuficiente', t0: f.tempos[1] ?? 2.3, e: true }, { s: 'erro: fala travou', t0: f.tempos[2] ?? 3.4, e: true }, { s: '$ gravar --tomada 4', t0: f.tempos[3] ?? 4.5 }, { s: `aviso: criador ${f.palavra}`, t0: f.tPalavra, e: true }, { s: '$ _', t0: f.tFim }];
    return <div style={{ ...centro, alignItems: 'stretch', padding: '0 7cqmin' }}>
      <div style={{ borderRadius: '3cqmin', background: '#0b0f17', border: `1px solid ${cor}55`, boxShadow: `0 0 6cqmin ${cor}33`, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '1.4cqmin', padding: '2.4cqmin 3cqmin', background: '#151b26' }}>{['#ff5f57', '#febc2e', '#28c840'].map(c => <i key={c} style={{ width: '2.6cqmin', height: '2.6cqmin', borderRadius: 99, background: c }} />)}</div>
        <div style={{ padding: '3cqmin 4cqmin', minHeight: '52cqmin' }}>
          {linhas.filter(l => t >= l.t0).map((l, i) => <div key={i} style={{ fontFamily: MONO, fontWeight: 700, fontSize: '4.8cqmin', lineHeight: 1.6, color: l.e ? '#ff6b6b' : cor }}>{digita(l.s, t, l.t0, 26)}</div>)}
        </div>
      </div>
    </div>;
  },
  'FX-27': ({ t, cor, f }) => {
    const pts = [[5, 20], [25, 28], [40, 24], [55, 45], [70, 52], [85, 80], [95, 86]];
    const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
    const r = ent(t, 0.4, Math.max(1, f.tFim - 0.6));
    return <div style={{ ...centro, background: '#04060c' }}>
      <span style={abs({ top: '8%', left: '8%', fontFamily: MONT, fontWeight: 800, fontSize: '5cqmin', color: '#fff', letterSpacing: '0.4cqmin' })}>VONTADE DE GRAVAR</span>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={abs({ left: '6%', right: '6%', top: '22%', bottom: '10%', width: '88%', height: '68%', overflow: 'visible' })}>
        {[25, 50, 75].map(y => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#ffffff18" strokeWidth={0.4} />)}
        <path d={d} fill="none" stroke={cor} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - r} style={{ filter: `drop-shadow(0 0 2px ${cor})` }} />
      </svg>
      <span style={abs({ right: '8%', bottom: '14%', fontFamily: ANTON, fontSize: '11cqmin', color: cor, textShadow: `0 0 3cqmin ${cor}`, opacity: ent(t, f.tPalavra) })}>-86%</span>
    </div>;
  },
  'FX-28': ({ t, cor, f }) => {
    const nums = [{ r: 'tentativas', v: f.tempos.filter(x => t >= x).length }, { r: 'minutos perdidos', v: Math.round(47 * c01(t / f.tFim)) }, { r: 'posts na semana', v: 0 }];
    return <div style={{ ...centro, gap: '3cqmin', background: `radial-gradient(circle at 50% 40%, ${cor}22, #04060c 70%)` }}>
      {nums.map((n, i) => { const k = ent(t, 0.3 + i * 0.4); return (
        <div key={n.r} style={{ width: '78cqmin', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '3cqmin 5cqmin', borderRadius: '3cqmin', border: `1px solid ${cor}55`, background: '#0a0f1a', opacity: k, transform: `translateX(${(1 - k) * 20}cqmin)` }}>
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: '4.4cqmin', color: '#9fb3c8' }}>{n.r}</span>
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: '10cqmin', color: cor, textShadow: `0 0 2.6cqmin ${cor}` }}>{String(n.v).padStart(2, '0')}</span>
        </div>); })}
    </div>;
  },
  'FX-29': ({ t, cor, f }) => {
    const parado = t > f.tPalavra;
    return <div style={{ ...centro, background: '#04060c' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2cqmin', marginBottom: '6cqmin' }}>
        <i style={{ width: '4cqmin', height: '4cqmin', borderRadius: 99, background: parado ? '#555' : '#ff3b3b', opacity: parado ? 1 : 0.4 + 0.6 * (Math.floor(t * 2) % 2) }} />
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: '6cqmin', color: '#fff' }}>{parado ? 'PAUSADO' : 'REC'} 00:{String(Math.floor(Math.min(t, f.tPalavra) * 4.6)).padStart(2, '0')}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2cqmin', height: '36cqmin' }}>
        {Array.from({ length: 22 }, (_, i) => { const h = parado ? 6 : 10 + 80 * Math.abs(Math.sin(t * 7 + i * 0.7) * Math.cos(t * 3.3 + i * 0.3)); return <i key={i} style={{ width: '2.4cqmin', height: `${h}%`, borderRadius: 99, background: cor, boxShadow: `0 0 2cqmin ${cor}` }} />; })}
      </div>
    </div>;
  },
  'FX-30': ({ t, cor, f }) => {
    const p = Math.min(0.99, c01(t / (f.tPalavra - 0.5)) * 0.99);
    const trava = t > f.tPalavra;
    const v = trava ? 12 : Math.round(p * 100);
    const R = 40, C = 2 * Math.PI * R;
    return <div style={{ ...centro, background: '#04060c' }}>
      <svg viewBox="0 0 100 100" style={{ width: '62cqmin', height: '62cqmin', transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={R} fill="none" stroke="#ffffff14" strokeWidth={6} />
        <circle cx="50" cy="50" r={R} fill="none" stroke={trava ? '#ff5b5b' : cor} strokeWidth={6} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - v / 100)} style={{ filter: `drop-shadow(0 0 3px ${trava ? '#ff5b5b' : cor})` }} />
      </svg>
      <span style={abs({ top: '50%', left: '50%', transform: 'translate(-50%,-62%)', fontFamily: ANTON, fontSize: '15cqmin', color: '#fff' })}>{v}%</span>
      <span style={{ marginTop: '-6cqmin', fontFamily: MONO, fontWeight: 700, fontSize: '4.6cqmin', color: trava ? '#ff8b8b' : '#9fb3c8' }}>{trava ? 'carregando motivação…' : 'carregando vídeo…'}</span>
    </div>;
  },

  /* ===== MINIMALISTA ===== */
  'FX-31': ({ t, cor, f }) => {
    const ws = [{ w: 'Gravar.', t0: 0.06 }, { w: 'Errar.', t0: f.tempos[2] ?? 3.4 }, { w: 'Repetir.', t0: f.tempos[3] ?? 4.5 }, { w: 'Cansar.', t0: f.tPalavra }];
    const a = [...ws].reverse().find(x => t >= x.t0 - 0.1) ?? ws[0]!;
    const k = ent(t, a.t0 - 0.1, 0.5);
    return <div style={centro}><span key={a.w} style={{ fontFamily: PLAY, fontStyle: 'italic', fontWeight: 600, fontSize: '19cqmin', color: a === ws[3] ? cor : '#1c1a17', opacity: k, transform: `translateY(${(1 - k) * 3}cqmin)`, letterSpacing: '-0.4cqmin' }}>{a.w}</span></div>;
  },
  'FX-32': ({ t, cor, f }) => (
    <div style={{ ...centro, alignItems: 'flex-start', padding: '0 12cqmin' }}>
      <span style={{ fontFamily: PLAY, fontStyle: 'italic', fontSize: '30cqmin', lineHeight: 0.6, color: cor, opacity: ent(t, 0.2) }}>“</span>
      <span style={{ fontFamily: PLAY, fontStyle: 'italic', fontWeight: 600, fontSize: '9cqmin', lineHeight: 1.15, color: '#1c1a17' }}>{digita('Tem dia que você só não quer aparecer.', t, 0.5, 6)}</span>
      <span style={{ marginTop: '4cqmin', fontFamily: MONT, fontWeight: 600, fontSize: '3.8cqmin', letterSpacing: '0.6cqmin', color: '#8a8378', opacity: ent(t, f.tFim - 0.5) }}>— TODO CRIADOR</span>
    </div>),
  'FX-33': ({ t, cor, f }) => {
    const v = Math.round(47 * ease(c01((t - 0.4) / Math.max(1, f.tPalavra - 0.4))));
    return <div style={centro}>
      <span style={{ fontFamily: MONT, fontWeight: 500, fontSize: '36cqmin', lineHeight: 1, letterSpacing: '-1.4cqmin', color: '#1c1a17' }}>{v}<span style={{ fontSize: '12cqmin', color: cor }}>min</span></span>
      <i style={{ width: `${ent(t, 1, 1) * 50}cqmin`, height: '0.4cqmin', background: '#1c1a17', margin: '3cqmin 0' }} />
      <span style={{ fontFamily: MONT, fontWeight: 500, fontSize: '4.6cqmin', color: '#6b665e', letterSpacing: '0.3cqmin' }}>pra gravar 1 minuto de vídeo</span>
    </div>;
  },
  'FX-34': ({ t, cor, f }) => {
    const r = ent(t, 0.3, 1.4);
    return <div style={centro}>
      <svg viewBox="0 0 100 40" style={{ width: '84cqmin', height: '34cqmin', overflow: 'visible' }}>
        <path d="M2 30 C 20 30, 25 8, 45 10 S 70 34, 98 12" fill="none" stroke={cor} strokeWidth={0.9} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - r} opacity={r > 0.01 ? 1 : 0} />
        <circle cx="98" cy="12" r="1.6" fill={cor} opacity={c01(r * 4 - 3)} />
      </svg>
      <span style={{ marginTop: '4cqmin', fontFamily: MONT, fontWeight: 500, fontSize: '7.4cqmin', color: '#1c1a17', opacity: ent(t, 1.2) }}>{t < f.tPalavra ? 'o caminho até postar' : `até ficar ${f.palavra}`}</span>
    </div>;
  },
  'FX-35': ({ t, cor, f }) => (
    <div style={{ ...centro, alignItems: 'stretch', padding: '0 12cqmin', gap: '0' }}>
      {f.itens.map((it, i) => { const k = ent(t, (f.tempos[i] ?? 0) - 0.05, 0.4); return (
        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '4cqmin', padding: '3cqmin 0', borderBottom: '1px solid #d8d2c6', opacity: 0.15 + 0.85 * k }}>
          <span style={{ fontFamily: MONT, fontWeight: 500, fontSize: '4.4cqmin', color: cor }}>0{i + 1}</span>
          <span style={{ fontFamily: MONT, fontWeight: 500, fontSize: '6.4cqmin', color: '#1c1a17' }}>{it}</span>
        </div>); })}
    </div>),
  'FX-36': ({ t, cor, f }) => {
    const k = ease((t - 0.2) / 0.6);
    const seg = t > f.tPalavra;
    return <div style={centro}>
      <div style={abs({ left: 0, top: '28%', height: '44%', width: `${k * 100}%`, background: seg ? cor : '#141210' })} />
      <span style={{ position: 'relative', fontFamily: MONT, fontWeight: 800, fontSize: '11cqmin', color: '#f3efe7', letterSpacing: '-0.3cqmin', opacity: ent(t, 0.6) }}>{seg ? f.palavra.toUpperCase() : f.titulo.toUpperCase()}</span>
    </div>;
  },
};

/** Um efeito no tempo `t`, ocupando todo o pai. `img(nome)` devolve o endereço de uma imagem (página ou staticFile). */
export function EfeitoModelo({ codigo, t, cor, fala = FALA_EXEMPLO, img = (n: string) => n }: { codigo: string; t: number; cor: string; fala?: Fala; img?: (n: string) => string }) {
  const info = EFEITOS_MODELO.find(x => x.codigo === codigo);
  const desenha = P[codigo];
  if (!info || !desenha) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', containerType: 'size', background: (FUNDO[info.estilo] ?? FUNDO['design']!)(cor) }}>
      {info.estilo === 'desenho' && <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(#dfe6f0 1px, transparent 1px)', backgroundSize: '100% 7cqmin', opacity: 0.8 }} />}
      {info.estilo === 'documental' && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 80%, rgba(0,0,0,.12), transparent 40%), radial-gradient(circle at 80% 15%, rgba(255,255,255,.25), transparent 35%)' }} />}
      {desenha({ t, cor, f: fala, img })}
    </div>
  );
}
