import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUp, Box, Check, ChevronDown, ChevronRight, Download, Film, Fingerprint, FolderClosed, Loader2, Mic, Music, PanelLeft, Play, Plus, Search, Shapes, SlidersHorizontal, Sparkles, SquarePen, Type } from 'lucide-react';
import { LogoChatGPT, LogoClaude, LogoWhatsApp } from '@/components/marcas-ia';
import { siteConfig } from '@/lib/site-config';
import { eventoProprio } from '@/lib/pixel';

/* Página /pro2 (9/11/2026, 2ª versão): tudo anda sozinho (nada de rolar para o lado nem rolagem presa),
   o celular tem proporção de celular de verdade e cada seção responde UMA pergunta do leigo. */

const menosMovimento = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const capa = (src: string) => src.replace(/\.mp4$/, '.webp');

/** true enquanto o elemento está na tela (com folga de `margem`). */
function useNaTela<T extends Element>(margem = '0px') {
  const ref = useRef<T>(null);
  const [na, setNa] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setNa(true); return; }
    const io = new IntersectionObserver(([e]) => setNa(!!e?.isIntersecting), { rootMargin: margem });
    io.observe(el);
    return () => io.disconnect();
  }, [margem]);
  return [ref, na] as const;
}

/** Vídeo mudo em loop que só baixa quando `perto` e só toca quando `ativo`: no celular, um vídeo tocando por vez. */
export function VideoVivo({ src, ativo, perto, className = '', label, onRef }: { src: string; ativo: boolean; perto: boolean; className?: string; label?: string; onRef?: (v: HTMLVideoElement | null) => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [carregar, setCarregar] = useState(false);
  useEffect(() => { if (perto) setCarregar(true); }, [perto]);
  useEffect(() => {
    const v = ref.current;
    if (!v || !carregar) return;
    if (!ativo) { v.pause(); return; }
    const tocar = () => void v.play().catch(() => undefined);
    tocar();
    v.addEventListener('loadeddata', tocar, { once: true });
    return () => v.removeEventListener('loadeddata', tocar);
  }, [ativo, carregar]);
  return <video ref={el => { (ref as React.MutableRefObject<HTMLVideoElement | null>).current = el; onRef?.(el); }} src={carregar ? src : undefined} poster={capa(src)}
    muted loop playsInline preload={carregar ? 'auto' : 'none'} aria-label={label} className={`p2-video ${className}`} />;
}

/** Moldura de iPhone na proporção real (tela 9 : 19,5), com a ilha e a barra de status. */
function Celular({ children, className = '', escura = true, ...resto }: React.HTMLAttributes<HTMLDivElement> & { escura?: boolean }) {
  return (
    <div className={`p2-cel ${className}`} {...resto}>
      <div className={`p2-cel-tela ${escura ? 'escura' : 'clara'}`}>
        <div className="p2-status" aria-hidden="true"><span>9:41</span><span className="p2-ilha" /><span className="p2-status-icones"><i /><i /><i /></span></div>
        {children}
      </div>
    </div>
  );
}

/* ───────────── 1. Como funciona? (pedido e edição no notebook, vídeo pronto no celular; anda sozinho) ───────────── */

const passos = [
  { titulo: 'Instale o Modo Editor no ChatGPT ou no Claude', linha: 'Uma vez só, seguindo a aula.' },
  { titulo: 'Mande o vídeo e peça o que quer', linha: 'No ChatGPT ou no Claude, pelo computador.' },
  { titulo: 'A IA edita sozinha', linha: 'Você pode sair e ir trabalhar.' },
  { titulo: 'Receba pronto pra postar', linha: 'É só passar pro celular e postar.' },
];
const pedido = 'Tira as pausas, põe legenda e mostra na tela o que eu explicar';

/* Efeitos sonoros do "Como funciona", feitos no próprio navegador (sem arquivo): tecla, tique da lista, sininho e vush.
   O navegador só libera som depois que a pessoa toca na página (por exemplo, no vídeo); até lá, fica tudo em silêncio. */
let audio: AudioContext | null = null;
let ruido: AudioBuffer | null = null;
function prepararSom() {
  if (typeof window === 'undefined' || audio) return;
  const liberar = () => {
    try {
      const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audio && C) audio = new C();
      void audio?.resume();
    } catch { /* sem som */ }
  };
  ['pointerdown', 'touchend', 'keydown'].forEach(e => window.addEventListener(e, liberar, { passive: true }));
}
/** som liberado e nenhum vídeo tocando com som (o vídeo de vendas segue tocando quando a pessoa rola: a voz dele vem antes) */
function somPronto() {
  if (!audio || audio.state !== 'running') return null;
  const videoComSom = Array.from(document.querySelectorAll('video')).some(v => !v.paused && !v.muted);
  return videoComSom ? null : audio;
}
function bufferRuido(ctx: AudioContext) {
  if (!ruido) {
    ruido = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.4), ctx.sampleRate);
    const d = ruido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return ruido;
}
/** nota curta com ataque rápido e queda suave */
function nota(ctx: AudioContext, freq: number, quando: number, dur: number, vol: number, tipo: OscillatorType = 'sine', ate?: number) {
  const osc = ctx.createOscillator(); const g = ctx.createGain();
  osc.type = tipo; osc.frequency.setValueAtTime(freq, quando);
  if (ate) osc.frequency.exponentialRampToValueAtTime(ate, quando + dur * 0.6);
  g.gain.setValueAtTime(0, quando);
  g.gain.linearRampToValueAtTime(vol, quando + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, quando + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(quando); osc.stop(quando + dur + 0.02);
}
/** tecla de notebook: o estalinho agudo da tecla e o "toc" grave dela batendo, cada um um pouco diferente */
function somTecla() {
  const ctx = somPronto(); if (!ctx) return;
  const t = ctx.currentTime;
  const vol = 0.75 + Math.random() * 0.5;
  const clique = ctx.createBufferSource(); clique.buffer = bufferRuido(ctx);
  const agudo = ctx.createBiquadFilter(); agudo.type = 'highpass'; agudo.frequency.value = 3800 + Math.random() * 1200;
  const g1 = ctx.createGain(); g1.gain.setValueAtTime(0.035 * vol, t); g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);
  clique.connect(agudo).connect(g1).connect(ctx.destination);
  clique.start(t, Math.random() * 0.3, 0.02);
  const toc = ctx.createBufferSource(); toc.buffer = bufferRuido(ctx);
  const grave = ctx.createBiquadFilter(); grave.type = 'bandpass'; grave.frequency.value = 650 + Math.random() * 350; grave.Q.value = 2.2;
  const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.0001, t); g2.gain.linearRampToValueAtTime(0.09 * vol, t + 0.003); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
  toc.connect(grave).connect(g2).connect(ctx.destination);
  toc.start(t, Math.random() * 0.3, 0.06);
}
/** "blup" de pingo d'água: o Modo Editor caindo dentro da IA */
function somGota() {
  const ctx = somPronto(); if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator(); const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(420, t); osc.frequency.exponentialRampToValueAtTime(1500, t + 0.07);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  osc.connect(g).connect(ctx.destination); osc.start(t); osc.stop(t + 0.18);
  nota(ctx, 1900, t + 0.05, 0.12, 0.03);
}
/** sininho de "deu certo" (instalou, vídeo pronto) */
function somSininho() {
  const ctx = somPronto(); if (!ctx) return;
  const t = ctx.currentTime;
  nota(ctx, 1318.5, t, 0.5, 0.11);
  nota(ctx, 1760, t + 0.11, 0.6, 0.1);
  nota(ctx, 2637, t + 0.11, 0.35, 0.025);
}

/** Passo 4: o celular rola um vídeo pronto a cada 2 s, como o Reels, cada um de uma profissão. */
const FEED = [
  // primeiro três pessoas diferentes: a Karina, o professor e o Mariano; depois os outros vídeos
  { src: '/videos/karina-estria.mp4', profissao: 'Esteticista', emoji: '💆‍♀️' },
  { src: '/videos/pro2/professor-cassio.mp4', profissao: 'Professor', emoji: '📚' },
  { src: '/videos/cenas/dente.mp4', profissao: 'Dentista', emoji: '🦷' },
  { src: '/videos/pro2/fisio-coluna.mp4', profissao: 'Fisioterapeuta', emoji: '🦴' },
  { src: '/videos/pro2/arquiteto-obra.mp4', profissao: 'Arquiteto', emoji: '📐' },
];
const TEMPO_FEED = 1100;
function FeedCelular({ ativo, perto }: { ativo: boolean; perto: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    if (!ativo) return;
    const id = window.setInterval(() => setI(n => Math.min(n + 1, FEED.length - 1)), TEMPO_FEED);
    return () => window.clearInterval(id);
  }, [ativo]);
  return (
    <div className="p2-feed" style={{ transform: `translateY(${-i * 100}%)` }}>
      {FEED.map((f, k) => (
        <div className="p2-feed-item" key={f.src} style={{ top: `${k * 100}%` }}>
          <VideoVivo src={f.src} ativo={ativo && k === i} perto={perto && k <= i + 1} label={`Vídeo pronto de ${f.profissao}`} />
          <span className="p2-feed-tag"><span aria-hidden="true">{f.emoji}</span>{f.profissao}</span>
        </div>
      ))}
    </div>
  );
}

export function ComoFunciona() {
  const [caixa, naTela] = useNaTela<HTMLDivElement>('0px 0px 120px 0px');
  const [passo, setPasso] = useState(0);
  const cena = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(0.488);
  // o MacBook tem 740 px de largura no desenho original: a cena mede a própria largura e reduz o aparelho inteiro
  useEffect(() => {
    const el = cena.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const medir = () => setEscala(el.clientWidth / 740);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [letras, setLetras] = useState(0);
  const [carga, setCarga] = useState(0);
  const [inst, setInst] = useState(0); // 0 chegando · 1 instalando · 2 instalado
  // som só nas duas primeiras voltas cada vez que a seção aparece: chama a atenção sem virar barulho
  const voltas = useRef(0);
  useEffect(() => { prepararSom(); }, []);
  useEffect(() => { if (!naTela) voltas.current = 0; }, [naTela]);
  // e só com a cena do MacBook de fato na tela: passou rápido para a seção seguinte, os efeitos param na hora
  const audivel = useRef(false);
  useEffect(() => {
    const el = cena.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => { audivel.current = !!e && e.intersectionRatio >= 0.6; }, { threshold: [0, 0.6, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const comSom = () => voltas.current < 2 && audivel.current;
  // anda sozinho e rápido (quem rola a página vê os passos se completando em ~3,8 s): instala o Modo Editor (~1,4 s),
  // digita o pedido (~0,9 s), carrega a edição (~1 s) e mostra os vídeos prontos no celular (1,1 s cada)
  useEffect(() => {
    if (!naTela) return;
    if (menosMovimento()) { setInst(2); setLetras(pedido.length); setCarga(100); return; }
    let id: number;
    if (passo === 0) {
      if (inst === 0) id = window.setTimeout(() => { setInst(1); if (comSom()) somGota(); }, 650);
      else if (inst === 1) id = window.setTimeout(() => setInst(2), 400);
      else id = window.setTimeout(() => { setLetras(0); setPasso(1); }, 350);
    } else if (passo === 1) id = letras < pedido.length ? window.setTimeout(() => { setLetras(n => Math.min(pedido.length, n + 2)); if (comSom() && letras % 8 === 0) somTecla(); }, 22) : window.setTimeout(() => { setCarga(0); setPasso(2); }, 250);
    else if (passo === 2) id = carga < 100 ? window.setTimeout(() => { const nova = Math.min(100, carga + 10); setCarga(nova); }, 80) : window.setTimeout(() => { setPasso(3); if (comSom()) somSininho(); }, 250);
    else id = window.setTimeout(() => { voltas.current += 1; setInst(0); setLetras(0); setPasso(0); }, FEED.length * TEMPO_FEED + 300);
    return () => window.clearTimeout(id);
  }, [naTela, passo, inst, letras, carga]);
  const irPara = (i: number) => { setPasso(i); setInst(i === 0 ? 0 : 2); setLetras(i <= 1 ? 0 : pedido.length); setCarga(i === 3 ? 100 : 0); };
  const instalado = passo > 0 || inst === 2;
  return (
    <section className="section container p2-como" id="como-funciona">
      <div className="section-heading reveal">
        <h2>Como funciona a <em>edição com IA?</em></h2>
        <p>Você instala uma vez. Depois, é só mandar o vídeo e pedir.</p>
      </div>
      <div className="p2-como-corpo reveal" ref={caixa}>
        <ol className="p2-etapas" aria-label="Passos">
          {passos.map((p, i) => (
            <li key={p.titulo}>
              <button type="button" className={i === passo ? 'on' : i < passo ? 'feito' : ''} onClick={() => irPara(i)} aria-label={`Passo ${i + 1}: ${p.titulo}`}>
                <span className="p2-etapa-num">{i < passo ? <Check size={14} /> : i + 1}</span>
                <span className="p2-etapa-barra"><i key={`${passo}-${i}`} /></span>
              </button>
            </li>
          ))}
        </ol>
        <div className="p2-etapa-textos" aria-live="polite">{passos.map((p, i) => <div key={p.titulo} className={`p2-etapa-texto ${i === passo ? 'on' : ''}`} aria-hidden={i !== passo}><strong>{i + 1}. {p.titulo}</strong><span>{p.linha}</span></div>)}</div>
        <div className={`p2-cena passo-${passo}`} ref={cena} style={{ height: Math.round(434 * escala + 108), ['--mac-h' as string]: `${Math.round(434 * escala)}px` }}>
          {/* MacBook Pro (devices.css, MIT) com a tela no estilo do chat do Claude: o pedido e a IA editando, sem mostrar o resultado */}
          {passo === 0 && inst === 0 && <span className="p2-voa" aria-hidden="true"><span className="brand-icon"><Play /><span className="brand-dot" /></span>Modo Editor</span>}
          <span className={`p2-instalado ${passo === 0 && inst === 2 ? 'on' : ''}`} aria-hidden={!(passo === 0 && inst === 2)}><Check size={14} /> Modo Editor instalado</span>
          <div className="p2-mac" aria-hidden="true">
            <span className="p2-mac-ias"><LogoChatGPT /><small>ou</small><LogoClaude /></span>
            <div className="device device-macbook-pro" style={{ transform: `scale(${escala})` }}>
              <div className="device-frame">
                <div className="device-screen p2-claude">
                  <aside className="p2-cl-lado">
                    <div className="p2-cl-marca"><span className="p2-cl-marca-ico"><Sparkles /></span><span>Sua IA</span><PanelLeft /></div>
                    <span className="p2-cl-nav on"><SquarePen />Novo chat</span>
                    <span className="p2-cl-nav"><Search />Buscar chats</span>
                    <span className="p2-cl-nav"><FolderClosed />Projetos</span>
                    <span className="p2-cl-nav"><Shapes />Biblioteca</span>
                    <small className="p2-cl-grupo">Fixados <ChevronRight /></small>
                    <small className="p2-cl-grupo">Recentes <ChevronDown /></small>
                    {['Vídeo da semana', 'Legenda do Reels', 'Corte da aula de ontem', 'Vídeo explicativo', 'Roteiro do próximo vídeo', 'Dúvidas dos clientes', 'Vídeo do lançamento'].map((t, i) => <span key={t} className={`p2-cl-item ${i === 0 ? 'on' : ''}`}>{t}</span>)}
                    <span className="p2-cl-conta"><i>M</i>Mariano <em>· Pro</em><ChevronDown /></span>
                  </aside>
                  <div className="p2-cl-main">
                    <div className="p2-cl-topo">
                      <span className="p2-cl-titulo">Vídeo da semana <ChevronDown /></span>
                      <span className={`p2-cl-modo ${instalado ? '' : 'oculto'}`}><Check />Modo Editor ativo</span>
                      <span className="p2-cl-share">Compartilhar</span>
                    </div>
                    {passo === 0 ? (
                      <div className="p2-cl-inicio">
                        <p className="p2-cl-saudacao">Boa tarde, Mariano</p>
                        <div className="p2-cl-entrada p2-cl-entrada-inicio"><span className="p2-cl-placeholder">Pergunte qualquer coisa</span><span className="p2-cl-barra"><Plus /><Mic className="p2-cl-mic" /><i><ArrowUp /></i></span></div>
                        <div className={`p2-cl-instalando fase-${inst}`}>
                          <span className="brand-icon" aria-hidden="true"><Play /><span className="brand-dot" /></span>
                          <div>
                            <b>{inst === 2 ? 'Modo Editor instalado' : 'Instalando o Modo Editor…'}</b>
                            <span className="p2-cl-carga"><i style={{ width: inst === 0 ? '0%' : '100%' }} /></span>
                          </div>
                          <span className="p2-cl-instalando-ok">{inst === 2 ? <Check /> : <Loader2 className="p2-girando" />}</span>
                        </div>
                      </div>
                    ) : (
                    <div className="p2-cl-conversa">
                      <div className="p2-cl-coluna">
                        <div className="p2-cl-voce">
                          <span className="p2-cl-anexo"><img src={capa(siteConfig.videos.cenas.aoVivoBruto)} alt="" width={14} height={25} /><span><b>gravacao.mp4</b><small>MP4 · 2:14</small></span></span>
                          {letras > 0 && <p>{pedido.slice(0, letras)}{letras < pedido.length && <i className="caret" />}</p>}
                        </div>
                        {passo >= 2 && (
                          <div className="p2-cl-ia">
                            <p>{passo === 2 ? 'Combinado! Estou editando o seu vídeo agora.' : 'Pronto! O seu vídeo está editado e salvo na pasta.'}</p>
                            <ul>
                              {['Ouvi a gravação inteira', 'Cortei as pausas e os erros', 'Coloquei a legenda', 'Coloquei na tela o que você explicou'].map((t, i) => {
                                const feito = passo === 3 || carga >= (i + 1) * 24;
                                const agora = passo === 2 && !feito && carga >= i * 24;
                                return <li key={t} className={feito ? 'ok' : agora ? 'agora' : ''}>{feito ? <Check /> : agora ? <Loader2 className="p2-girando" /> : <i />}{t}</li>;
                              })}
                            </ul>
                            <span className="p2-cl-carga"><i style={{ width: `${passo === 2 ? carga : 100}%` }} /></span>
                            <span className={`p2-cl-spark ${passo === 2 ? 'pensando' : ''}`}><Sparkles /></span>
                          </div>
                        )}
                      </div>
                    </div>
                    )}
                    {passo > 0 && <div className="p2-cl-entrada">
                      <span className="p2-cl-placeholder">Escreva sua mensagem…</span>
                      <span className="p2-cl-barra"><Plus /><Mic className="p2-cl-mic" /><i><ArrowUp /></i></span>
                    </div>}
                  </div>
                </div>
              </div>
              <div className="device-stripe" /><div className="device-header" /><div className="device-sensors" /><div className="device-btns" /><div className="device-power" />
            </div>
          </div>
          {/* o celular: o vídeo pronto pra postar */}
          <div className="p2-cena-cel">
            <span className="p2-pronto"><Check size={14} /> Pronto pra postar</span>
            <Celular className="p2-cel-mini">
              <FeedCelular ativo={naTela && passo === 3} perto={naTela && passo >= 2} />
            </Celular>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── 2. Veja como o seu vídeo muda (segure para ver como foi gravado) ───────────── */

/** O mesmo trecho do fisioterapeuta (criativo 09): a gravação na parede branca e o vídeo editado, alinhados no tempo. */
const PAR = { bruto: '/videos/pro2/fisio-bruto.mp4', editado: '/videos/pro2/fisio-editado.mp4' };

export function Segure() {
  const [caixa, naTela] = useNaTela<HTMLDivElement>('150px 0px');
  const [segurando, setSegurando] = useState(false);
  const [tocou, setTocou] = useState(false);
  const [auto, setAuto] = useState(false);
  const bruto = useRef<HTMLVideoElement | null>(null);
  const editado = useRef<HTMLVideoElement | null>(null);
  const mostraBruto = segurando || (!tocou && auto);
  // os dois são o mesmo trecho: o bruto acompanha o tempo do editado, então soltar o dedo não pula a fala
  useEffect(() => {
    if (!naTela) return;
    const id = window.setInterval(() => {
      const b = bruto.current, e = editado.current;
      if (b && e && !e.paused && Math.abs(b.currentTime - e.currentTime) > 0.15) b.currentTime = e.currentTime;
    }, 300);
    return () => window.clearInterval(id);
  }, [naTela]);
  // até a pessoa tocar, o vídeo mostra sozinho como foi gravado, de tempos em tempos
  useEffect(() => {
    if (tocou || !naTela || menosMovimento()) return;
    const id = window.setTimeout(() => setAuto(a => !a), auto ? 2000 : 3800);
    return () => window.clearTimeout(id);
  }, [auto, tocou, naTela]);
  const soltar = () => setSegurando(false);
  const segurar = () => { setTocou(true); setSegurando(true); };
  return (
    <section className="section container p2-segure" id="antes-depois">
      <div className="section-heading reveal">
        <h2>Veja o poder da <em>edição com IA.</em></h2>
        <p>Segure o dedo no vídeo para ver como ele foi gravado.</p>
      </div>
      <div className="reveal" ref={caixa}>
        <Celular className={`p2-cel-segure ${mostraBruto ? 'is-bruto' : ''}`}
          onPointerDown={e => { if (e.button === 0) segurar(); }} onPointerUp={soltar} onPointerCancel={soltar} onPointerLeave={soltar}
          onContextMenu={e => e.preventDefault()} role="button" tabIndex={0} aria-pressed={segurando} aria-label="Segure para ver a gravação original"
          onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); segurar(); } }} onKeyUp={soltar}>
          <VideoVivo src={PAR.bruto} ativo={naTela} perto={naTela} className="p2-camada-bruto" label="Gravação original" onRef={v => { bruto.current = v; }} />
          <VideoVivo src={PAR.editado} ativo={naTela} perto={naTela} className="p2-camada-editado" label="Vídeo editado pelo Modo Editor" onRef={v => { editado.current = v; }} />
          <span className={`p2-selo ${mostraBruto ? '' : 'pronto'}`}>{mostraBruto ? 'Como foi gravado' : '✓ Editado pela IA'}</span>
        </Celular>
        <p className={`p2-segure-dica ${tocou ? 'tocou' : ''}`}><Fingerprint size={22} /> {segurando ? 'Agora solte' : 'Segure o dedo no vídeo'}</p>
      </div>
    </section>
  );
}

/* ───────────── Estilos de conteúdo (esteira que roda sem parar; dedo em cima para) ───────────── */

const saidas: { src: string; titulo: string; profissao: string; emoji: string; real?: string }[] = [
  { src: '/videos/karina-estria.mp4', titulo: 'A pele em 3D', profissao: 'Esteticista', emoji: '💆‍♀️', real: 'Aluna real' },
  { src: '/videos/pro2/fisio-coluna.mp4', titulo: 'A coluna em 3D', profissao: 'Fisioterapeuta', emoji: '🦴' },
  { src: '/videos/cenas/dente.mp4', titulo: 'O dente por dentro', profissao: 'Dentista', emoji: '🦷' },
  { src: '/videos/pro2/professor-cassio.mp4', titulo: 'A aula ganha desenhos', profissao: 'Professor', emoji: '📚', real: 'Aluno real' },
  { src: '/videos/pro2/psicologo-ansiedade.mp4', titulo: 'A ansiedade no corpo', profissao: 'Psicólogo', emoji: '🧠' },
  { src: '/videos/pro2/arquiteto-obra.mp4', titulo: 'A obra subindo', profissao: 'Arquiteto', emoji: '📐' },
  { src: '/videos/pro2/personal-braco.mp4', titulo: 'O músculo trabalhando', profissao: 'Personal', emoji: '💪' },
  { src: '/videos/cenas/mapa.mp4', titulo: 'Onde fica, no mapa', profissao: 'Corretor', emoji: '🏠' },
];
/** velocidade da esteira, em pixels por segundo (~5 s por cartão no celular) */
const VELOCIDADE = 36;
/** quantas voltas da lista ficam montadas lado a lado: com 3, a tela nunca alcança o fim, nem no computador */
const VOLTAS = 3;

/** Cartão da esteira: a capa fica por baixo do vídeo, então ele nunca aparece vazio, nem carregando. */
function CartaoEstilo({ src, titulo, profissao, emoji, real, copia, ativo, perto }: { src: string; titulo: string; profissao: string; emoji: string; real?: string; copia: boolean; ativo: boolean; perto: boolean }) {
  return (
    <li className="p2-cartao" aria-hidden={copia || undefined}>
      <span className="p2-etiqueta"><span aria-hidden="true">{emoji}</span>{profissao}</span>
      <div className="p2-cartao-tela" style={{ backgroundImage: `url(${capa(src)})` }}>
        <VideoVivo src={src} ativo={ativo} perto={perto} label={`${profissao}: ${titulo}`} />
        {real && <span className="p2-aluna">✓ {real}</span>}
      </div>
      <h3>{titulo}</h3>
    </li>
  );
}

/** `titulo`/`sub`/`depois`: a página geral usa a mesma esteira com outro título e o "básico vem junto" embaixo. */
export function Saidas({ titulo, sub, depois }: { titulo?: React.ReactNode; sub?: React.ReactNode; depois?: React.ReactNode } = {}) {
  const [secao, naTela] = useNaTela<HTMLElement>('200px 0px');
  const fila = useRef<HTMLOListElement>(null);
  const posicao = useRef(0);
  const parado = useRef(false);
  const [paradoTela, setParadoTela] = useState(false);
  const [visiveis, setVisiveis] = useState<number[]>([0, 1, 2]);
  // a esteira anda quadro a quadro e mede a si mesma: quando uma volta inteira passa, ela recua exatamente
  // uma volta (o que está na tela é idêntico), então nunca existe fim nem tela vazia
  useEffect(() => {
    const el = fila.current;
    if (!el || !naTela) return;
    let quadro = 0, antes = performance.now(), vistos = '';
    const andar = (agora: number) => {
      const dt = Math.min(64, agora - antes); antes = agora;
      const itens = el.children as HTMLCollectionOf<HTMLElement>;
      const volta = (itens[saidas.length]?.offsetLeft ?? 0) - (itens[0]?.offsetLeft ?? 0);
      if (!parado.current && !menosMovimento() && volta > 0) {
        posicao.current += (VELOCIDADE * dt) / 1000;
        if (posicao.current >= volta) posicao.current -= volta;
      }
      el.style.transform = `translate3d(${-posicao.current}px, 0, 0)`;
      const largura = el.parentElement?.clientWidth ?? window.innerWidth;
      const agoraVistos: number[] = [];
      for (let i = 0; i < itens.length; i++) {
        const esquerda = itens[i]!.offsetLeft - posicao.current;
        if (esquerda + itens[i]!.offsetWidth > -20 && esquerda < largura + 20) agoraVistos.push(i);
      }
      const chave = agoraVistos.join(',');
      if (chave !== vistos) { vistos = chave; setVisiveis(agoraVistos); }
      quadro = requestAnimationFrame(andar);
    };
    quadro = requestAnimationFrame(andar);
    return () => cancelAnimationFrame(quadro);
  }, [naTela]);
  const segurar = () => { parado.current = true; setParadoTela(true); };
  const soltar = () => { parado.current = false; setParadoTela(false); };
  const lista = Array.from({ length: VOLTAS }, () => saidas).flat();
  return (
    <section className="section p2-saidas" id="exemplos" ref={secao}>
      <div className="container section-heading reveal">
        <h2>{titulo ?? <>Estilos de edição que você pode usar <em>no seu vídeo.</em></>}</h2>
        {sub && (typeof sub === 'string' ? <p>{sub}</p> : sub)}
      </div>
      <div className="p2-esteira" aria-label="Exemplos de estilos de vídeo"
        onPointerDown={segurar} onPointerUp={soltar} onPointerCancel={soltar} onPointerLeave={soltar} onContextMenu={e => e.preventDefault()}>
        <ol className="p2-esteira-fila" ref={fila}>
          {lista.map((s, i) => {
            const perto = visiveis.some(v => Math.abs(v - i) <= 1);
            return <CartaoEstilo key={i} {...s} copia={i >= saidas.length} ativo={naTela && visiveis.includes(i)} perto={naTela && perto} />;
          })}
        </ol>
      </div>
      <p className="p2-dica">{paradoTela ? 'Solte para continuar' : 'Toque e segure para parar'}</p>
      {depois}
    </section>
  );
}

/* ───────────── O vídeo que a aluna editou (junto do depoimento) ───────────── */

/** O vídeo que a aluna editou, tocando mudo em loop; um toque liga o som. */
export function ResultadoCliente({ src, nome }: { src: string; nome: string }) {
  const [caixa, naTela] = useNaTela<HTMLDivElement>('100px 0px');
  const video = useRef<HTMLVideoElement | null>(null);
  const [som, setSom] = useState(false);
  const alternar = () => { const v = video.current; if (!v) return; const ligar = v.muted; v.muted = !ligar; if (ligar) { v.currentTime = 0; void v.play().catch(() => undefined); } setSom(ligar); };
  return (
    <div className="p2-resultado" ref={caixa}>
      <p>O vídeo que a {nome.split(' ')[0]} editou:</p>
      <div className="p2-resultado-tela">
        <VideoVivo src={src} ativo={naTela} perto={naTela} label={`Vídeo editado por ${nome}`} onRef={v => { video.current = v; }} />
        <button type="button" className="p2-ouvir" onClick={alternar}>{som ? 'Som ligado' : 'Toque para ouvir'}</button>
      </div>
    </div>
  );
}

/* ───────────── Qual IA você vai usar? ───────────── */

/** `extra`: uma linha a mais embaixo (a página geral diz que não paga nada a mais por vídeo). */
export function QualIA2({ extra }: { extra?: React.ReactNode } = {}) {
  return (
    <section className="section container" id="qual-ia">
      <div className="section-heading reveal">
        <h2>Qual IA você <em>vai usar?</em></h2>
        <p>O Modo Editor funciona nos dois. Você escolhe um.</p>
      </div>
      <div className="reveal">
        <div className="p2-ias">
          <div className="p2-ia"><LogoChatGPT /><div><strong>ChatGPT</strong><span>Plano Plus <b>pago</b></span></div></div>
          <span className="p2-ias-ou" aria-hidden="true">ou</span>
          <div className="p2-ia"><LogoClaude /><div><strong>Claude</strong><span>Plano Pro <b>pago</b></span></div></div>
        </div>
        <p className="p2-ias-nota">Você edita no computador (Mac ou Windows). O celular serve pra gravar.</p>
        {extra && <p className="p2-ias-extra">{extra}</p>}
      </div>
    </section>
  );
}

/* ───────────── Prova social: faixas cruzadas + carrossel de vídeos + carrossel de prints ───────────── */

/** Esteira genérica: anda quadro a quadro, três voltas da lista (nunca acaba), para com o dedo, vídeo só toca à vista. */
export function Esteira<T>({ itens, velocidade = 34, reverso = false, rotulo, render }: {
  itens: T[]; velocidade?: number; reverso?: boolean; rotulo: string;
  render: (item: T, i: number, estado: { copia: boolean; ativo: boolean; perto: boolean }) => React.ReactNode;
}) {
  const [caixa, naTela] = useNaTela<HTMLDivElement>('200px 0px');
  const fila = useRef<HTMLOListElement>(null);
  const posicao = useRef(0);
  const parado = useRef(false);
  const [visiveis, setVisiveis] = useState<number[]>([0, 1, 2]);
  useEffect(() => {
    const el = fila.current;
    if (!el || !naTela) return;
    let quadro = 0, antes = performance.now(), vistos = '';
    const andar = (agora: number) => {
      const dt = Math.min(64, agora - antes); antes = agora;
      const filhos = el.children as HTMLCollectionOf<HTMLElement>;
      const volta = (filhos[itens.length]?.offsetLeft ?? 0) - (filhos[0]?.offsetLeft ?? 0);
      if (!parado.current && !menosMovimento() && volta > 0) {
        posicao.current += ((reverso ? -1 : 1) * velocidade * dt) / 1000;
        if (posicao.current >= volta) posicao.current -= volta;
        if (posicao.current < 0) posicao.current += volta;
      }
      // anda em pixels inteiros da tela: em fração de pixel a borda fina dos cartões fica borrada e treme
      const dpr = window.devicePixelRatio || 1;
      el.style.transform = `translate3d(${-Math.round(posicao.current * dpr) / dpr}px, 0, 0)`;
      const largura = el.parentElement?.clientWidth ?? window.innerWidth;
      const agoraVistos: number[] = [];
      for (let i = 0; i < filhos.length; i++) {
        const esq = filhos[i]!.offsetLeft - posicao.current;
        if (esq + filhos[i]!.offsetWidth > -20 && esq < largura + 20) agoraVistos.push(i);
      }
      const chave = agoraVistos.join(',');
      if (chave !== vistos) { vistos = chave; setVisiveis(agoraVistos); }
      quadro = requestAnimationFrame(andar);
    };
    quadro = requestAnimationFrame(andar);
    return () => cancelAnimationFrame(quadro);
  }, [naTela, itens.length, reverso, velocidade]);
  const soltar = () => { parado.current = false; };
  const lista = Array.from({ length: 3 }, () => itens).flat();
  return (
    <div className="p2-esteira" ref={caixa} aria-label={rotulo}
      onPointerDown={() => { parado.current = true; }} onPointerUp={soltar} onPointerCancel={soltar} onPointerLeave={soltar} onContextMenu={e => e.preventDefault()}>
      <ol className="p2-esteira-fila" ref={fila}>
        {lista.map((item, i) => render(item, i, { copia: i >= itens.length, ativo: naTela && visiveis.includes(i), perto: naTela && visiveis.some(v => Math.abs(v - i) <= 1) }))}
      </ol>
    </div>
  );
}

/** Duas faixas cruzadas na diagonal que andam junto com a rolagem: rolou, elas andam (cada uma para um lado); parou, elas param.
 *  Ficam logo abaixo da primeira dobra, como divisória da oferta (11/11: Black Friday). */
/** `sempre`: as faixas rolam sozinhas o tempo todo (na oferta), em vez de andar só com a rolagem da página. */
export function Faixas({ palavras = ['Modo Black', 'Black', 'Black Friday'], sempre = false }: { palavras?: string[]; sempre?: boolean } = {}) {
  const texto = Array.from({ length: 6 }, () => palavras).flat();
  const azul = useRef<HTMLDivElement>(null);
  const branca = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (sempre) return; // rolam por CSS, sem depender da rolagem
    // as letras andam enquanto a pessoa rola, mas com velocidade-teto: rolar com força não dispara as fitas
    const TETO = 150; // px por segundo, no máximo
    let quadro = 0, antes = 0, ultimoY = window.scrollY, pos = 0, vel = 0;
    const desenhar = () => {
      for (const [el, sentido] of [[azul.current, 1], [branca.current, -1]] as const) {
        if (!el) continue;
        const metade = el.scrollWidth / 2;
        if (!metade) continue;
        const d = ((pos % metade) + metade) % metade;
        el.style.transform = `translate3d(${(sentido === 1 ? -d : d - metade).toFixed(1)}px, 0, 0)`;
      }
    };
    const passo = (agora: number) => {
      const dt = Math.min(0.064, (agora - antes) / 1000); antes = agora;
      const y = window.scrollY, delta = y - ultimoY; ultimoY = y;
      const alvo = dt > 0 ? Math.max(-TETO, Math.min(TETO, (delta * 0.4) / dt)) : 0;
      vel += (alvo - vel) * Math.min(1, dt * 6);
      pos += vel * dt;
      desenhar();
      quadro = delta !== 0 || Math.abs(vel) > 1 ? requestAnimationFrame(passo) : 0;
    };
    const acordar = () => { if (!quadro && !menosMovimento()) { antes = performance.now(); quadro = requestAnimationFrame(passo); } };
    desenhar();
    window.addEventListener('scroll', acordar, { passive: true });
    window.addEventListener('resize', desenhar);
    return () => { window.removeEventListener('scroll', acordar); window.removeEventListener('resize', desenhar); cancelAnimationFrame(quadro); };
  }, [sempre]);
  const conteudo = [...texto, ...texto].map((p, i) => <span key={i}>{p}<i /></span>);
  return (
    <div className={`p2-faixas ${sempre ? 'p2-faixas-sempre' : ''}`} aria-hidden="true">
      <div className="p2-faixa p2-faixa-azul"><div className="p2-faixa-trilho" ref={azul}>{conteudo}</div></div>
      <div className="p2-faixa p2-faixa-branca"><div className="p2-faixa-trilho" ref={branca}>{conteudo}</div></div>
    </div>
  );
}

type Depo = { src: string; cheio?: string; nome: string; papel: string; real: string; frase?: string; selo?: string };
const DEPOIMENTOS: Depo[] = [
  { src: '/videos/depo-esteticista.mp4', nome: 'Karina Guimarães', papel: 'Esteticista', real: 'aluna real', selo: 'Depoimento', frase: 'Eu tava quebrando a cabeça com vídeo, com edição, e não conseguia. Resultados extraordinários.' },
  { src: '/videos/karina-estria.mp4', nome: 'Karina Guimarães', papel: 'Esteticista', real: 'aluna real', selo: 'Vídeo que ela editou' },
  { src: '/videos/pro2/professor-cassio.mp4', cheio: '/videos/pro2/professor-santo-expedito.mp4', nome: 'Professor Cássio', papel: 'Professor', real: 'aluno real', selo: 'Vídeo que ele editou' },
  { src: '/videos/depo-isaque.mp4', nome: 'Isaque', papel: '', real: 'aluno real', selo: 'Depoimento', frase: 'Depois que eu deixei o primeiro vídeo do jeito que eu gostei, o segundo e o terceiro vieram com muito mais facilidade.' },
];

/** Vídeo em tela cheia, com som, aberto ao tocar num cartão. */
function VideoAberto({ src, nome, fechar }: { src: string; nome: string; fechar: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar(); };
    window.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [fechar]);
  return (
    <div className="p2-modal" role="dialog" aria-modal="true" aria-label={`Vídeo de ${nome}`} onClick={fechar}>
      <div className="p2-modal-caixa" onClick={e => e.stopPropagation()}>
        <video src={src} poster={capa(src)} controls autoPlay playsInline />
        <button type="button" className="p2-modal-fechar" onClick={fechar} aria-label="Fechar o vídeo">×</button>
      </div>
    </div>
  );
}

export function ProvaSocial({ prints }: { prints: { src: string; quem: string }[] }) {
  const [aberto, setAberto] = useState<Depo | null>(null);
  const [print, setPrint] = useState<string | null>(null);
  const fechar = () => { setAberto(null); setPrint(null); };
  return (
    <section className="p2-prova" id="depoimentos">
      <div className="section container p2-prova-topo"><div className="section-heading reveal"><h2>Profissionais que já <em>usam o Modo Editor.</em></h2><p>Alunos reais do Modo Editor: o depoimento e o vídeo que eles editaram.</p></div></div>
      <Esteira itens={DEPOIMENTOS} rotulo="Depoimentos em vídeo" render={(d, i, { copia, ativo, perto }) => (
        <li key={i} className="p2-depo" aria-hidden={copia || undefined}>
          <button type="button" className="p2-depo-tela" style={{ backgroundImage: `url(${capa(d.src)})` }}
            onClick={() => { setAberto(d); eventoProprio('Depoimento_Play', { nome: d.nome }); }} aria-label={`Assistir: ${d.nome}, ${d.selo ?? ''}`}>
            <VideoVivo src={d.src} ativo={ativo} perto={perto} label={d.nome} />
            {d.selo && <span className="p2-depo-selo">{d.selo}</span>}
            <span className="p2-depo-play"><Play /> Ouvir</span>
          </button>
          <strong>{d.nome}</strong>
          <small>{d.papel ? `${d.papel} · ${d.real}` : d.real.charAt(0).toUpperCase() + d.real.slice(1)}</small>
          {d.frase && <p>“{d.frase}”</p>}
        </li>
      )} />
      {prints.length > 0 && (
        <Esteira itens={prints} reverso velocidade={28} rotulo="Mensagens de alunos no WhatsApp" render={(pr, i, { copia }) => (
          <li key={i} className="p2-print" aria-hidden={copia || undefined}>
            <button type="button" onClick={() => setPrint(pr.src)} aria-label={`Ver a mensagem de ${pr.quem} maior`}>
              <span className="p2-print-topo"><span className="p2-print-zap"><LogoWhatsApp /></span><span><b>{pr.quem}</b><small>mensagem no WhatsApp</small></span></span>
              <span className="p2-print-conversa"><img src={pr.src} alt={`Mensagem de ${pr.quem} no WhatsApp`} loading="lazy" decoding="async" /></span>
              <span className="p2-print-selo"><Check /> Aluno real</span>
            </button>
          </li>
        )} />
      )}
      {aberto && <VideoAberto src={aberto.cheio ?? aberto.src} nome={aberto.nome} fechar={fechar} />}
      {print && (
        <div className="p2-modal" role="dialog" aria-modal="true" aria-label="Mensagem de aluno" onClick={fechar}>
          <div className="p2-modal-caixa p2-modal-print" onClick={e => e.stopPropagation()}>
            <img src={print} alt="Mensagem de aluno no WhatsApp" />
            <button type="button" className="p2-modal-fechar" onClick={fechar} aria-label="Fechar">×</button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ───────────── Faixa reta com o que a IA coloca no vídeo (as duas páginas) ───────────── */

export const itensIA = ['Efeitos visuais e sonoros', 'Ilustrações realistas', 'Objetos em 3D', 'Motion design', 'Títulos animados'];
/** Faixa reta que roda sem parar, de ponta a ponta (as frases se repetem sem emenda). */
export function FaixaIA() {
  const volta = [...itensIA, ...itensIA];
  return (
    <div className="galeria-ticker" aria-label={itensIA.join(', ')}>
      <div className="galeria-ticker-trilho" aria-hidden="true">{[...volta, ...volta].map((t, i) => <span key={i}>{t}<i>✦</i></span>)}</div>
    </div>
  );
}
/** Embaixo do título da galeria: a frase "do básico ao avançado" e, depois dela, a faixa rolante com o que a IA faz. */
export const tituloAlemDoBasico = <>Edição com IA<br /><em>muito além de corte e legenda.</em></>;
export function SubAlemDoBasico() {
  return <><p className="galeria-apoio"><b>Do básico ao avançado:</b> de um vídeo simples, com corte e legenda, a um vídeo super editado, com 3D e motion design.</p><FaixaIA /></>;
}

/* ───────────── Linhas da oferta com a mesma largura de outro elemento (as duas páginas) ───────────── */

/** Linha cuja letra se ajusta até as pontas baterem com outro elemento da oferta
 *  (`alvo`: a linha do preço, do "R$" ao "à vista", ou o botão de compra). */
export function LinhaAjustada({ children, alvo = '.price', className = 'p2-parcela', min = 12, max = 22 }: { children: ReactNode; alvo?: string; className?: string; min?: number; max?: number }) {
  const texto = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = texto.current;
    const referencia = el?.closest('.offer-price')?.querySelector<HTMLElement>(alvo);
    if (!el || !referencia) return;
    const ajustar = () => {
      el.style.fontSize = '16px';
      // offsetWidth: a medida sem o pulso do botão (a animação muda a escala, não o tamanho)
      const largura = referencia.offsetWidth, atual = el.offsetWidth;
      if (largura > 0 && atual > 0) el.style.fontSize = `${Math.max(min, Math.min(max, (16 * largura) / atual)).toFixed(2)}px`;
    };
    ajustar();
    const ro = new ResizeObserver(ajustar);
    ro.observe(referencia);
    document.fonts?.ready.then(ajustar);
    return () => ro.disconnect();
  }, [alvo, min, max]);
  return <p className={className}><span ref={texto}>{children}</span></p>;
}
/** Linha da parcela com a mesma largura da linha do preço. */
export function LinhaDoPreco({ children }: { children: ReactNode }) {
  return <LinhaAjustada>{children}</LinhaAjustada>;
}

/* ───────────── MacBook nas seções novas: escala pela largura da cena (o desenho tem 740 px) ───────────── */

function useEscalaMac() {
  const cena = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(0.488);
  useEffect(() => {
    const el = cena.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const medir = () => setEscala(el.clientWidth / 740);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [cena, escala] as const;
}

/** MacBook Pro (devices.css, MIT) com a tela que vier dentro. */
function MacBook({ escala, children }: { escala: number; children: ReactNode }) {
  return (
    <div className="device device-macbook-pro" style={{ transform: `scale(${escala})` }}>
      <div className="device-frame">{children}</div>
      <div className="device-stripe" /><div className="device-header" /><div className="device-sensors" /><div className="device-btns" /><div className="device-power" />
    </div>
  );
}

/* ───────────── A IA agora é o seu editor de vídeo (a conversa no mesmo visual do chat do "Como funciona") ───────────── */

const PEDIDOS_IA = [
  { nivel: 'Básico', texto: 'Corta onde eu errei e coloca legenda', video: '/videos/cenas/legenda.mp4' },
  { nivel: 'Intermediário', texto: 'Troca o meu fundo por um cenário mais bonito', video: '/videos/galeria/cenario.mp4' },
  { nivel: 'Avançado', texto: 'Quando eu falar do coração, mostra ele em 3D batendo', video: '/videos/galeria/coracao.mp4' },
  { nivel: 'Avançado', texto: 'Mostra no mapa, visto do satélite, a cidade que eu falar', video: '/videos/galeria/mapa.mp4' },
] as const;
const NIVEIS_IA = ['Básico', 'Intermediário', 'Avançado'];

/** Uma conversa só, no mesmo visual do chat do computador do "Como funciona" (com as logos do ChatGPT e do Claude no
 *  topo). O pedido é escrito na caixa de mensagem, vai para a conversa, a IA responde e o vídeo pronto aparece na resposta. */
export function EditorIA() {
  const [caixa, naTela] = useNaTela<HTMLDivElement>('0px 0px 120px 0px');
  const [i, setI] = useState(0);
  const [letras, setLetras] = useState(0);
  const [fase, setFase] = useState(0); // 0 escrevendo · 1 enviado, a IA editando · 2 pronto
  const p = PEDIDOS_IA[i]!;
  useEffect(() => {
    if (!naTela) return;
    if (menosMovimento()) { setLetras(p.texto.length); setFase(2); return; }
    let id: number;
    if (fase === 0) id = letras < p.texto.length ? window.setTimeout(() => setLetras(n => Math.min(p.texto.length, n + 2)), 16) : window.setTimeout(() => setFase(1), 180);
    else if (fase === 1) id = window.setTimeout(() => setFase(2), 900);
    else id = window.setTimeout(() => { setI(n => (n + 1) % PEDIDOS_IA.length); setLetras(0); setFase(0); }, 3200);
    return () => window.clearTimeout(id);
  }, [naTela, fase, letras, p.texto.length]);
  const texto = p.texto.slice(0, letras);
  return (
    <section className="section container ei" id="pedidos">
      <div className="section-heading reveal">
        <h2>A IA agora é o seu<br /><em>editor de vídeo.</em></h2>
        <p className="ei-lead"><strong>Fale do seu jeito e ela edita pra você.</strong>Com o Modo Editor, a sua IA já sabe editar o seu vídeo do básico ao avançado: basta você pedir.</p>
      </div>
      <div className="ei-corpo reveal" ref={caixa}>
        <div className="ei-niveis" aria-hidden="true">{NIVEIS_IA.map(n => <span key={n} className={n === p.nivel ? 'on' : ''}>{n}</span>)}</div>
        <div className="ei-janela">
          <div className="ei-topo">
            <span className="ei-topo-ias" aria-label="No ChatGPT ou no Claude"><LogoChatGPT /><small>ou</small><LogoClaude /></span>
            <span className="ei-topo-modo"><Check aria-hidden="true" /> Modo Editor ativo</span>
          </div>
          <div className="ei-conversa">
            {fase === 0 && <p className="ei-ola">O que vamos editar hoje?</p>}
            {fase >= 1 && (
              <div className="ei-voce">
                <span className="ei-anexo"><span className="ei-anexo-ico"><Film aria-hidden="true" /></span><span><b>gravacao.mp4</b><small>Vídeo · 1:48</small></span></span>
                <p className="ei-msg">{p.texto}</p>
              </div>
            )}
            {fase >= 1 && (
              <div className="ei-ia" key={`ia-${i}-${fase}`}>
                <span className="ei-ia-avatar" aria-hidden="true"><Sparkles /></span>
                <div className="ei-ia-corpo">
                  <p>{fase === 1 ? 'Combinado! Estou editando o seu vídeo.' : 'Pronto! Editei do jeito que você pediu.'}</p>
                  {fase === 1 ? <span className="ei-ia-carga" aria-hidden="true"><i /></span> : (
                    <div className="ei-ia-video">
                      <VideoVivo key={p.video} src={p.video} ativo={naTela} perto={naTela} label={`Resultado do pedido: ${p.texto}`} />
                      <span className="ei-ia-selo"><Check aria-hidden="true" /> {p.nivel}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className={`ei-entrada ${fase === 0 ? 'escrevendo' : ''}`}>
            {fase === 0 && <span className="ei-anexo ei-anexo-mini"><span className="ei-anexo-ico"><Film aria-hidden="true" /></span><span><b>gravacao.mp4</b></span></span>}
            <span className="ei-entrada-linha">
              <Plus className="ei-entrada-mais" aria-hidden="true" />
              <span className="ei-entrada-texto" aria-live="polite">{fase === 0 && letras > 0 ? <>{texto}<i className="caret" /></> : <span className="ei-entrada-dica">Pergunte qualquer coisa</span>}</span>
              <Mic className="ei-entrada-mic" aria-hidden="true" />
              <i className="ei-enviar" aria-hidden="true"><ArrowUp /></i>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Veja a IA trabalhando (um editor de vídeo no MacBook e as etapas, uma por vez, com ✓) ───────────── */

// todas as etapas com o mesmo tempo: os ✓ entram num ritmo constante (com tempos diferentes, a etapa longa parecia
// travada e as curtas pareciam acontecer todas de uma vez)
const ETAPAS_IA = [
  { agora: 'Recebendo o vídeo', feito: 'Recebido', ms: 1000 },
  { agora: 'Analisando o vídeo', feito: 'Analisado', ms: 1000 },
  { agora: 'Editando o vídeo', feito: 'Editado', ms: 1000 },
  { agora: 'Enviando a prévia', feito: 'Prévia', ms: 1000 },
  { agora: 'Finalizando', feito: 'Pronto', ms: 1000 },
];
// trechos do vídeo na linha do tempo, em % da faixa: a gravação inteira e, depois da edição, mais curta e sem buracos
const TRECHOS_TL = {
  inteiro: [[0, 24], [24, 20], [44, 22], [66, 16], [82, 18]],
  editado: [[0, 21], [22, 17], [40, 18.5], [59.5, 13.5], [74, 14]],
} as const;
const TEXTOS_TL = [[1, 15], [22, 13], [40, 14], [59.5, 11], [74, 12]] as const;
const EFEITOS_TL = [[6, 9, 'a'], [27, 11, 'b'], [45, 8, 'c'], [63, 10, 'a']] as const;
const ONDA_TL = Array.from({ length: 64 }, (_, k) => (24 + Math.abs(Math.sin(k * 1.37) * Math.cos(k * 0.29)) * 70).toFixed(1));

const CICLO_IA = 7800; // 5 etapas de 1 s + 2,8 s de "Vídeo pronto" (o mesmo ciclo do CSS: it-barra-ciclo 7.8s)
const PASSO_IA = 1000;

/** As etapas, os ✓ e a barra são animação pura de CSS (ciclo fixo de 7,8 s): no iPhone, mesmo com o Safari segurando
 *  o JavaScript (rolagem, economia de bateria, navegador do Instagram), elas seguem no ritmo, 1 s por etapa. O
 *  JavaScript só lê o relógio da animação da barra para acompanhar o editor no MacBook e a porcentagem; se ele
 *  engasgar, o editor alcança depois, sem mexer nas etapas. */
export function IATrabalhando() {
  const [caixa, naTela] = useNaTela<HTMLDivElement>('0px 0px 120px 0px');
  const [cena, escala] = useEscalaMac();
  const ed = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const barra = useRef<HTMLElement>(null);
  const rodando = naTela && !menosMovimento();
  useEffect(() => {
    const el = ed.current, num = pct.current;
    if (!el || !num) return;
    if (!rodando) { const fim = naTela && menosMovimento(); el.dataset['etapa'] = fim ? 'fim' : '0'; num.textContent = fim ? '100%' : '0%'; return; }
    const inicio = performance.now();
    let raf = 0, ultEtapa = '', ultPct = -1;
    const loop = () => {
      const anim = barra.current?.getAnimations?.()[0];
      const relogio = typeof anim?.currentTime === 'number' ? anim.currentTime : performance.now() - inicio;
      const t = ((relogio % CICLO_IA) + CICLO_IA) % CICLO_IA;
      const etapa = t >= 5 * PASSO_IA ? 'fim' : String(Math.floor(t / PASSO_IA));
      const p = t >= 5 * PASSO_IA ? 100 : Math.min(100, Math.round(t / 50));
      if (etapa !== ultEtapa) { el.dataset['etapa'] = etapa; ultEtapa = etapa; }
      if (p !== ultPct) { num.textContent = `${p}%`; ultPct = p; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [rodando, naTela]);
  return (
    <section className={`section container it ${rodando ? 'rodando' : ''}`} id="ao-vivo">
      <div className="section-heading reveal">
        <h2>Veja a IA <em>trabalhando.</em></h2>
        <p>Você manda a gravação e vai fazer outra coisa. Na volta, o vídeo está pronto.</p>
      </div>
      <div className="it-corpo reveal" ref={caixa}>
        <div className="it-status">
          <div className="it-palavras" aria-hidden="true">
            {ETAPAS_IA.map((x, k) => <strong key={x.feito} className={`it-palavra it-palavra-${k}`}><Loader2 className="it-girando" />{x.agora}</strong>)}
            <strong className="it-palavra it-palavra-fim">Vídeo pronto<Check /></strong>
          </div>
          <p className="sr-only">A IA recebe o vídeo, analisa, edita, envia a prévia e finaliza o vídeo pronto.</p>
          <div className="it-progresso" aria-hidden="true"><span className="it-barra"><i ref={barra} /></span><span className="it-pct" ref={pct}>0%</span></div>
          <ol className="it-passos" aria-hidden="true">
            {ETAPAS_IA.map((x, k) => (
              <li key={x.feito}>
                <span className="it-passo-bola"><span className="it-bola-num">{k + 1}</span><span className="it-bola-gira"><Loader2 className="it-girando" /></span><span className="it-bola-ok"><Check /></span></span>
                <span className="it-passo-nome">{x.feito}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="it-cena" ref={cena} style={{ height: Math.round(434 * escala + 24), ['--mac-h' as string]: `${Math.round(434 * escala)}px` }}>
          <div className="p2-mac it-mac" aria-hidden="true">
            <MacBook escala={escala}>
              <div className="device-screen it-ed" ref={ed} data-etapa="0">
                <div className="it-ed-topo">
                  <span className="it-ed-luzes"><i /><i /><i /></span>
                  <span className="it-ed-nome"><span className="brand-icon"><Play /><span className="brand-dot" /></span>Modo Editor<em>gravacao.mp4</em></span>
                  <span className="it-ed-exportar"><span className="it-exp-nao"><Download />Exportar</span><span className="it-exp-ok"><Check />Exportado</span></span>
                </div>
                <div className="it-ed-meio">
                  <div className="it-ed-midia">
                    <span className="it-ed-aba"><Film />Mídia</span>
                    <div className="it-ed-pecas">
                      <span className="it-peca it-peca-video" style={{ backgroundImage: `url(${capa(PAR.bruto)})` }}><i className="it-anel" /></span>
                      {[Music, Box, Type].map((Icone, k) => <span key={k} className={`it-peca it-peca-${k}`} style={{ transitionDelay: `${k * 110}ms` }}><Icone /></span>)}
                    </div>
                  </div>
                  <div className="it-ed-previa">
                    <div className="it-ed-player">
                      <VideoVivo src={PAR.bruto} ativo={naTela} perto={naTela} />
                      <VideoVivo src={PAR.editado} ativo={naTela} perto={naTela} className="it-video-editado" />
                      <span className="it-ed-carregando"><Loader2 className="p2-girando" /></span>
                    </div>
                  </div>
                  <div className="it-ed-props">
                    <span className="it-ed-aba"><SlidersHorizontal />Ajustes</span>
                    {[62, 38, 80, 54, 70].map((alvo, k) => <span key={k} className="it-prop"><i /><span><b style={{ ['--alvo' as string]: `${alvo}%`, transitionDelay: `${k * 80}ms` }} /></span></span>)}
                  </div>
                </div>
                <div className="it-ed-linha">
                  <div className="it-ed-regua">{Array.from({ length: 13 }, (_, k) => <i key={k} />)}</div>
                  <div className="it-faixa"><span className="it-faixa-ico"><Film /></span><div className="it-pista">{TRECHOS_TL.inteiro.map(([l0, w0], k) => { const [l1, w1] = TRECHOS_TL.editado[k]!; return <span key={k} className="it-clipe" style={{ ['--l0' as string]: `${l0}%`, ['--w0' as string]: `${w0}%`, ['--l1' as string]: `${l1}%`, ['--w1' as string]: `${w1}%` }} />; })}</div></div>
                  <div className="it-faixa"><span className="it-faixa-ico"><Type /></span><div className="it-pista">{TEXTOS_TL.map(([l, w], k) => <span key={k} className="it-bloco it-texto" style={{ left: `${l}%`, width: `${w}%`, transitionDelay: `${120 + k * 70}ms` }} />)}</div></div>
                  <div className="it-faixa"><span className="it-faixa-ico"><Music /></span><div className="it-pista it-onda">{ONDA_TL.map((h, k) => <i key={k} style={{ height: `${h}%` }} />)}</div></div>
                  <div className="it-faixa"><span className="it-faixa-ico"><Sparkles /></span><div className="it-pista">{EFEITOS_TL.map(([l, w, c], k) => <span key={k} className={`it-bloco it-efeito-${c}`} style={{ left: `${l}%`, width: `${w}%`, transitionDelay: `${260 + k * 70}ms` }} />)}</div></div>
                  <span className="it-cabeca" />
                </div>
              </div>
            </MacBook>
          </div>
        </div>
      </div>
    </section>
  );
}
