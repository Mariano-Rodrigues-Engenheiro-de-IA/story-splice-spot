import { useEffect, useRef, useState } from 'react';
import { Check, Fingerprint, Loader2, Sparkles } from 'lucide-react';
import { NumberTicker } from '@/components/number-ticker';
import { LogoChatGPT, LogoClaude } from '@/components/marcas-ia';
import { siteConfig } from '@/lib/site-config';

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
function VideoVivo({ src, ativo, perto, className = '', label, onRef }: { src: string; ativo: boolean; perto: boolean; className?: string; label?: string; onRef?: (v: HTMLVideoElement | null) => void }) {
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

/* ───────────── 1. Como funciona? (3 passos que andam sozinhos dentro do celular) ───────────── */

const passos = [
  { titulo: 'Mande o vídeo e peça o que quer', linha: 'No seu ChatGPT ou Claude, em português.' },
  { titulo: 'A IA edita sozinha', linha: 'Você pode fechar e ir trabalhar.' },
  { titulo: 'Receba pronto pra postar', linha: 'Cortado, legendado e com a explicação na tela.' },
];
const pedido = 'Tira as pausas, coloca legenda e mostra o dente quando eu falar do canal';
const tarefas = ['Cortando as pausas e os erros', 'Colocando a legenda', 'Colocando o dente em 3D'];

export function ComoFunciona() {
  const [caixa, naTela] = useNaTela<HTMLDivElement>('0px');
  const [passo, setPasso] = useState(0);
  const [letras, setLetras] = useState(0);
  const [feitas, setFeitas] = useState(0);
  // cada passo anda sozinho; o toque num passo pula para ele e o ciclo continua dali
  useEffect(() => {
    if (!naTela) return;
    if (menosMovimento()) { setLetras(pedido.length); setFeitas(tarefas.length); return; }
    let id: number;
    if (passo === 0) id = letras < pedido.length ? window.setTimeout(() => setLetras(n => n + 1), 32) : window.setTimeout(() => { setFeitas(0); setPasso(1); }, 1300);
    else if (passo === 1) id = feitas < tarefas.length ? window.setTimeout(() => setFeitas(n => n + 1), 1100) : window.setTimeout(() => setPasso(2), 900);
    else id = window.setTimeout(() => { setLetras(0); setPasso(0); }, 5200);
    return () => window.clearTimeout(id);
  }, [naTela, passo, letras, feitas]);
  const irPara = (i: number) => { setPasso(i); if (i === 0) setLetras(0); if (i === 1) setFeitas(0); if (i === 2) setFeitas(tarefas.length); };
  const atual = passos[passo] ?? passos[0]!;
  return (
    <section className="section container p2-como" id="como-funciona">
      <div className="section-heading reveal">
        <h2>Como <em>funciona?</em></h2>
        <p>Você coloca o Modo Editor no seu ChatGPT ou Claude uma vez, seguindo a aula. Depois, todo vídeo é assim:</p>
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
        <div className="p2-etapa-texto" key={passo}><strong>{passo + 1}. {atual.titulo}</strong><span>{atual.linha}</span></div>
        <Celular escura={passo !== 0} className="p2-cel-como">
          {/* passo 1: a conversa com a IA */}
          <div className={`p2-tela p2-chat ${passo === 0 ? 'on' : ''}`}>
            <div className="p2-chat-topo"><LogoChatGPT /><LogoClaude /><span>Sua IA · Modo Editor ativo</span></div>
            <div className="p2-chat-corpo">
              <div className="p2-anexo"><img src={capa(siteConfig.videos.cenas.aoVivoBruto)} alt="" width={54} height={96} /><div><strong>Vídeo</strong><small>gravado no celular</small></div></div>
              {letras > 0 && <p className="p2-balao">{pedido.slice(0, letras)}{letras < pedido.length && <i className="caret" />}</p>}
            </div>
            <div className="p2-chat-entrada" aria-hidden="true"><span>Mensagem</span><i /></div>
          </div>
          {/* passo 2: a IA trabalhando em cima da gravação */}
          <div className={`p2-tela ${passo === 1 ? 'on' : ''}`}>
            <VideoVivo src={siteConfig.videos.cenas.aoVivoBruto} ativo={naTela && passo === 1} perto={naTela} label="Gravação sendo editada" />
            <div className="p2-tarefas">
              <span className="p2-tarefas-topo"><Sparkles size={13} /> Editando seu vídeo…</span>
              {tarefas.map((t, i) => <span key={t} className={`p2-tarefa ${i < feitas ? 'ok' : i === feitas ? 'agora' : ''}`}>{i < feitas ? <Check size={14} /> : i === feitas ? <Loader2 size={14} className="p2-girando" /> : <i />}{t}</span>)}
            </div>
          </div>
          {/* passo 3: o vídeo pronto, com o dente na tela */}
          <div className={`p2-tela ${passo === 2 ? 'on' : ''}`}>
            <VideoVivo src="/videos/cenas/dente.mp4" ativo={naTela && passo === 2} perto={naTela} label="Vídeo pronto, com o dente em 3D" />
            {passo === 2 && <span className="p2-aviso"><Check size={14} /> Vídeo pronto pra postar</span>}
          </div>
        </Celular>
      </div>
    </section>
  );
}

/* ───────────── 2. Veja como o seu vídeo muda (segure para ver como foi gravado) ───────────── */

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
        <h2>Veja como o seu vídeo <em>muda.</em></h2>
        <p>Segure o dedo no vídeo para ver como ele foi gravado.</p>
      </div>
      <div className="reveal" ref={caixa}>
        <Celular className={`p2-cel-segure ${mostraBruto ? 'is-bruto' : ''}`}
          onPointerDown={e => { if (e.button === 0) segurar(); }} onPointerUp={soltar} onPointerCancel={soltar} onPointerLeave={soltar}
          onContextMenu={e => e.preventDefault()} role="button" tabIndex={0} aria-pressed={segurando} aria-label="Segure para ver a gravação original"
          onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); segurar(); } }} onKeyUp={soltar}>
          <VideoVivo src={siteConfig.videos.raw} ativo={naTela} perto={naTela} className="p2-camada-bruto" label="Gravação original" onRef={v => { bruto.current = v; }} />
          <VideoVivo src={siteConfig.videos.edited} ativo={naTela} perto={naTela} className="p2-camada-editado" label="Vídeo editado pelo Modo Editor" onRef={v => { editado.current = v; }} />
          <span className={`p2-selo ${mostraBruto ? '' : 'pronto'}`}>{mostraBruto ? 'Como foi gravado' : '✓ Editado pela IA'}</span>
        </Celular>
        <p className={`p2-segure-dica ${tocou ? 'tocou' : ''}`}><Fingerprint size={22} /> {segurando ? 'Agora solte' : 'Segure o dedo no vídeo'}</p>
        <div className="p2-relogio">
          <div><small>Você gravou às</small><strong>10:00</strong></div>
          <span aria-hidden="true">→</span>
          <div className="pronto"><small>Pronto pra postar às</small><strong><NumberTicker value={20} duration={1800} format={v => `10:${String(Math.round(v)).padStart(2, '0')}`} /></strong></div>
        </div>
        <p className="p2-relogio-nota">Enquanto a IA editava, você trabalhava.</p>
      </div>
    </section>
  );
}

/* ───────────── Estilos de conteúdo (arsenal lado a lado, passando sozinho) ───────────── */

const saidas = [
  { src: '/videos/karina-estria.mp4', titulo: 'A pele em 3D', linha: 'Vídeo da Karina, esteticista.' },
  { src: '/videos/cenas/dente.mp4', titulo: 'Explicação em 3D', linha: 'O paciente entende o tratamento na hora.' },
  { src: '/videos/cenas/titulo.mp4', titulo: 'A dúvida vira título', linha: 'Você responde antes de perguntarem.' },
  { src: '/videos/cenas/cerebro.mp4', titulo: 'Objeto na sua mão', linha: 'Prende o olho de quem está rolando.' },
  { src: '/videos/cenas/mapa.mp4', titulo: 'Onde fica, no mapa', linha: 'Mostra o caminho até você.' },
  { src: '/videos/cenas/legenda.mp4', titulo: 'Dica legendada', linha: 'Quem assiste sem som entende tudo.' },
  { src: '/videos/cenas/cenario.mp4', titulo: 'Gravou em casa, saiu no estúdio', linha: 'Sem montar cenário nenhum.' },
  { src: '/videos/cenas/cinema.mp4', titulo: 'Cara de cinema', linha: 'Pro vídeo institucional da sua marca.' },
];
const TEMPO_CARTAO = 4200;

export function Saidas() {
  const [secao, naTela] = useNaTela<HTMLElement>('0px');
  const trilho = useRef<HTMLOListElement>(null);
  const [atual, setAtual] = useState(0);
  const [volta, setVolta] = useState(0);
  const pausaAte = useRef(0);
  const rolandoSozinho = useRef(0);
  const irPara = (i: number, suave = true) => {
    const el = trilho.current; const c = el?.children[i] as HTMLElement | undefined;
    if (!el || !c) return;
    rolandoSozinho.current = Date.now() + 900;
    el.scrollTo({ left: c.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft), behavior: suave ? 'smooth' : 'auto' });
    setAtual(i);
  };
  // quando a própria pessoa arrasta, o cartão do meio vira o atual e o automático espera um pouco
  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    let quadro = 0;
    const medir = () => {
      if (Date.now() < rolandoSozinho.current) return;
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        const inicio = el.scrollLeft + parseFloat(getComputedStyle(el).paddingLeft);
        let melhor = 0, dist = Infinity;
        (Array.from(el.children) as HTMLElement[]).forEach((c, i) => { const d = Math.abs(c.offsetLeft - inicio); if (d < dist) { dist = d; melhor = i; } });
        setAtual(melhor);
      });
    };
    const tocou = () => { pausaAte.current = Date.now() + 7000; };
    el.addEventListener('scroll', medir, { passive: true });
    el.addEventListener('pointerdown', tocou);
    el.addEventListener('touchstart', tocou, { passive: true });
    return () => { el.removeEventListener('scroll', medir); el.removeEventListener('pointerdown', tocou); el.removeEventListener('touchstart', tocou); cancelAnimationFrame(quadro); };
  }, []);
  // passa sozinho para o próximo vídeo enquanto a seção está na tela
  useEffect(() => {
    if (!naTela || menosMovimento()) return;
    const id = window.setTimeout(() => {
      if (Date.now() < pausaAte.current) { setVolta(v => v + 1); return; }
      // no fim da fila (últimos já à mostra) volta para o primeiro
      const el = trilho.current;
      const noFim = !!el && el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      irPara(noFim ? 0 : (atual + 1) % saidas.length);
    }, TEMPO_CARTAO);
    return () => window.clearTimeout(id);
  }, [atual, naTela, volta]);
  return (
    <section className="section p2-saidas" id="exemplos" ref={secao}>
      <div className="container section-heading reveal">
        <h2>Estilos de conteúdo que você pode usar <em>no seu vídeo.</em></h2>
      </div>
      <ol className="p2-trilho" ref={trilho} aria-label="Exemplos de vídeos editados">
        {saidas.map((s, i) => (
          <li key={s.src} className="p2-cartao">
            <div className="p2-cartao-tela"><VideoVivo src={s.src} ativo={naTela && i >= atual && i <= atual + 2} perto={naTela && i >= atual - 1 && i <= atual + 3} label={s.titulo} /></div>
            <h3>{s.titulo}</h3>
            <p>{s.linha}</p>
          </li>
        ))}
      </ol>
      <div className="p2-pontos" aria-hidden="true">
        {saidas.map((s, i) => <span key={s.src} className={i === atual ? 'on' : i < atual ? 'foi' : ''}>{i === atual && <i key={`${atual}-${volta}`} style={{ animationDuration: `${TEMPO_CARTAO}ms` }} />}</span>)}
      </div>
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

export function QualIA2() {
  return (
    <section className="section container" id="qual-ia">
      <div className="section-heading reveal">
        <h2>Qual IA você <em>vai usar?</em></h2>
        <p>O Modo Editor funciona nos dois. Você escolhe um.</p>
      </div>
      <div className="reveal">
        <div className="p2-ias">
          <div className="p2-ia"><LogoChatGPT /><div><strong>ChatGPT</strong><span>Plano Plus <b>pago</b></span></div></div>
          <div className="p2-ia"><LogoClaude /><div><strong>Claude</strong><span>Plano Pro <b>pago</b></span></div></div>
        </div>
        <p className="p2-ias-nota">Você edita no computador (Mac ou Windows). O celular serve pra gravar.</p>
      </div>
    </section>
  );
}
