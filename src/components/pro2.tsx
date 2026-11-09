import { useEffect, useRef, useState } from 'react';
import { Check, Film, Fingerprint, Loader2 } from 'lucide-react';
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

/* ───────────── 1. Como funciona? (pedido e edição no notebook, vídeo pronto no celular; anda sozinho) ───────────── */

const passos = [
  { titulo: 'Mande o vídeo e peça o que quer', linha: 'No ChatGPT ou no Claude, pelo computador.' },
  { titulo: 'A IA edita sozinha', linha: 'Você pode fechar e ir trabalhar.' },
  { titulo: 'Receba pronto pra postar', linha: 'É só passar pro celular e postar.' },
];
const pedido = 'Tira as pausas, põe legenda e mostra o dente quando eu falar do canal';

export function ComoFunciona() {
  const [caixa, naTela] = useNaTela<HTMLDivElement>('0px');
  const [passo, setPasso] = useState(0);
  const [letras, setLetras] = useState(0);
  const [carga, setCarga] = useState(0);
  // anda sozinho: digita o pedido (~1,4 s), carrega a edição (~2,8 s), mostra o vídeo pronto no celular (4 s)
  useEffect(() => {
    if (!naTela) return;
    if (menosMovimento()) { setLetras(pedido.length); setCarga(100); return; }
    let id: number;
    if (passo === 0) id = letras < pedido.length ? window.setTimeout(() => setLetras(n => n + 1), 20) : window.setTimeout(() => { setCarga(0); setPasso(1); }, 700);
    else if (passo === 1) id = carga < 100 ? window.setTimeout(() => setCarga(c => Math.min(100, c + 4)), 110) : window.setTimeout(() => setPasso(2), 350);
    else id = window.setTimeout(() => { setLetras(0); setPasso(0); }, 4200);
    return () => window.clearTimeout(id);
  }, [naTela, passo, letras, carga]);
  const irPara = (i: number) => { setPasso(i); setLetras(i === 0 ? 0 : pedido.length); setCarga(i === 2 ? 100 : 0); };
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
        <div className={`p2-cena passo-${passo}`}>
          {/* o notebook: o pedido e a IA editando (sem mostrar o resultado) */}
          <div className="p2-note" aria-hidden="true">
            <div className="p2-note-tampa">
              <span className="p2-note-cam" />
              <div className="p2-note-tela">
                <div className="p2-app-topo"><span className="p2-semaforo"><i /><i /><i /></span><LogoChatGPT /><LogoClaude /><span>Sua IA · Modo Editor ativo</span></div>
                <div className="p2-app-corpo">
                  {letras > 0 && (
                    <div className="p2-msg-eu">
                      <span className="p2-arquivo"><Film size={13} /> gravacao.mp4</span>
                      <p>{pedido.slice(0, letras)}{letras < pedido.length && <i className="caret" />}</p>
                    </div>
                  )}
                  {passo >= 1 && (
                    <div className="p2-msg-ia">
                      <span className="p2-msg-ia-ico">{passo === 1 ? <Loader2 size={14} className="p2-girando" /> : <Check size={14} />}</span>
                      <div>
                        <strong>{passo === 1 ? 'A IA está editando o seu vídeo…' : 'Pronto! Seu vídeo foi editado.'}</strong>
                        <span className="p2-carga"><i style={{ width: `${passo === 1 ? carga : 100}%` }} /></span>
                        <small>{passo === 1 ? `${carga}%` : '100%'}</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p2-note-base" />
          </div>
          {/* o celular: o vídeo pronto pra postar */}
          <div className="p2-cena-cel">
            <span className="p2-pronto"><Check size={14} /> Pronto pra postar</span>
            <Celular className="p2-cel-mini">
              <VideoVivo src="/videos/cenas/dente.mp4" ativo={naTela && passo === 2} perto={naTela} label="Vídeo pronto, com o dente em 3D" />
            </Celular>
          </div>
        </div>
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

/* ───────────── Estilos de conteúdo (esteira que roda sem parar; dedo em cima para) ───────────── */

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
/** velocidade da esteira, em pixels por segundo (~5 s por cartão no celular) */
const VELOCIDADE = 36;
/** quantas voltas da lista ficam montadas lado a lado: com 3, a tela nunca alcança o fim, nem no computador */
const VOLTAS = 3;

/** Cartão da esteira: a capa fica por baixo do vídeo, então ele nunca aparece vazio, nem carregando. */
function CartaoEstilo({ src, titulo, linha, copia, ativo, perto }: { src: string; titulo: string; linha: string; copia: boolean; ativo: boolean; perto: boolean }) {
  return (
    <li className="p2-cartao" aria-hidden={copia || undefined}>
      <div className="p2-cartao-tela" style={{ backgroundImage: `url(${capa(src)})` }}><VideoVivo src={src} ativo={ativo} perto={perto} label={titulo} /></div>
      <h3>{titulo}</h3>
      <p>{linha}</p>
    </li>
  );
}

export function Saidas() {
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
        <h2>Estilos de conteúdo que você pode usar <em>no seu vídeo.</em></h2>
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
