import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Check, Fingerprint, Play, Sparkles } from 'lucide-react';
import { NumberTicker } from '@/components/number-ticker';
import { LogoChatGPT, LogoClaude } from '@/components/marcas-ia';
import { siteConfig } from '@/lib/site-config';

/* Página /pro2 (9/11/2026): refeita do zero a partir da pesquisa de mercado.
   Cada seção tem UMA demonstração grande, e o que se transforma é o vídeo de verdade. */

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

/* ───────────── 1. O que vai aparecer no seu vídeo (carrossel de saídas) ───────────── */

const saidas = [
  { src: '/videos/cenas/dente.mp4', titulo: 'Explicação em 3D', linha: 'O paciente entende o tratamento na hora.' },
  { src: '/videos/cenas/titulo.mp4', titulo: 'A dúvida vira título', linha: 'Você responde antes de perguntarem.' },
  { src: '/videos/cenas/cerebro.mp4', titulo: 'Objeto na sua mão', linha: 'Prende o olho de quem está rolando.' },
  { src: '/videos/cenas/mapa.mp4', titulo: 'Onde fica, no mapa', linha: 'Mostra o caminho até o seu consultório.' },
  { src: '/videos/cenas/legenda.mp4', titulo: 'Dica legendada', linha: 'Quem assiste sem som entende tudo.' },
  { src: '/videos/cenas/cenario.mp4', titulo: 'Gravou em casa, saiu no estúdio', linha: 'Sem montar cenário nenhum.' },
  { src: '/videos/cenas/cinema.mp4', titulo: 'Cara de cinema', linha: 'Pro vídeo institucional da sua marca.' },
];

export function Saidas() {
  const [secao, naTela] = useNaTela<HTMLElement>('200px 0px');
  const trilho = useRef<HTMLOListElement>(null);
  const [atual, setAtual] = useState(0);
  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    let pedido = 0;
    const medir = () => {
      cancelAnimationFrame(pedido);
      pedido = requestAnimationFrame(() => {
        const cartoes = Array.from(el.children) as HTMLElement[];
        const centro = el.scrollLeft + el.clientWidth / 2;
        let melhor = 0, dist = Infinity;
        cartoes.forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - centro); if (d < dist) { dist = d; melhor = i; } });
        setAtual(melhor);
      });
    };
    el.addEventListener('scroll', medir, { passive: true });
    return () => { el.removeEventListener('scroll', medir); cancelAnimationFrame(pedido); };
  }, []);
  const irPara = (i: number) => { const el = trilho.current; const c = el?.children[i] as HTMLElement | undefined; if (el && c) el.scrollTo({ left: c.offsetLeft - (el.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' }); };
  return (
    <section className="section p2-saidas" id="exemplos" ref={secao}>
      <div className="container section-heading reveal">
        <h2>O que vai aparecer <em>no seu vídeo?</em></h2>
        <p>Você grava no celular. A IA devolve assim:</p>
      </div>
      <div className="container p2-origem reveal">
        <div className="p2-origem-video"><VideoVivo src="/videos/cenas/cru_modo.mp4" ativo={naTela} perto={naTela} label="Gravação no celular, sem edição" /></div>
        <div><strong>Você grava assim</strong><span>no celular, de uma vez, sem nada</span></div>
        <span className="p2-origem-seta" aria-hidden="true"><ArrowDown size={16} /></span>
      </div>
      <div className="p2-ponte reveal" aria-hidden="true"><span><Sparkles size={13} /> O Modo Editor edita</span></div>
      <ol className="p2-trilho" ref={trilho} aria-label="Exemplos de vídeos editados">
        {saidas.map((s, i) => (
          <li key={s.src} className={`p2-cartao ${i === atual ? 'on' : ''}`}>
            <div className="p2-cartao-tela"><VideoVivo src={s.src} ativo={naTela && i === atual} perto={naTela && Math.abs(i - atual) <= 1} label={s.titulo} /></div>
            <h3>{s.titulo}</h3>
            <p>{s.linha}</p>
          </li>
        ))}
      </ol>
      <div className="p2-pontos" role="tablist" aria-label="Escolher exemplo">
        {saidas.map((s, i) => <button key={s.src} type="button" role="tab" aria-selected={i === atual} aria-label={s.titulo} className={i === atual ? 'on' : ''} onClick={() => irPara(i)} />)}
      </div>
      <p className="p2-dica">{atual + 1} de {saidas.length} · deslize para o lado</p>
    </section>
  );
}

/* ───────────── 2. Segure para ver como foi gravado ───────────── */

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
  // até a pessoa tocar, o vídeo mostra sozinho o antes de tempos em tempos
  useEffect(() => {
    if (tocou || !naTela || menosMovimento()) return;
    const id = window.setTimeout(() => setAuto(a => !a), auto ? 1800 : 3600);
    return () => window.clearTimeout(id);
  }, [auto, tocou, naTela]);
  const soltar = () => setSegurando(false);
  return (
    <section className="section container p2-segure" id="antes-depois">
      <div className="section-heading reveal">
        <h2>Veja como o seu vídeo <em>muda.</em></h2>
        <p>Segure o dedo no vídeo para ver como ele foi gravado.</p>
      </div>
      <div className="reveal">
        <div ref={caixa} className={`p2-fone p2-fone-segure ${mostraBruto ? 'is-bruto' : ''}`}
          onPointerDown={e => { if (e.button === 0) { setTocou(true); setSegurando(true); } }}
          onPointerUp={soltar} onPointerCancel={soltar} onPointerLeave={soltar} onContextMenu={e => e.preventDefault()}
          role="button" tabIndex={0} aria-pressed={segurando} aria-label="Segure para ver a gravação original"
          onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setTocou(true); setSegurando(true); } }} onKeyUp={soltar}>
          <span className="p2-ilha" aria-hidden="true" />
          <div className="p2-fone-tela">
            <VideoVivo src={siteConfig.videos.raw} ativo={naTela} perto={naTela} className="p2-camada-bruto" label="Gravação original" onRef={v => { bruto.current = v; }} />
            <VideoVivo src={siteConfig.videos.edited} ativo={naTela} perto={naTela} className="p2-camada-editado" label="Vídeo editado pelo Modo Editor" onRef={v => { editado.current = v; }} />
            <span className={`p2-selo ${mostraBruto ? '' : 'pronto'}`}>{mostraBruto ? '● Como foi gravado' : '✓ Editado pela IA'}</span>
          </div>
        </div>
        <p className={`p2-segure-dica ${tocou ? 'tocou' : ''}`}><Fingerprint size={22} /> {segurando ? 'Agora solte' : 'Segure o dedo no vídeo'}</p>
        <div className="p2-numeros">
          <div><strong>{siteConfig.demo.rawLength}</strong><small>de gravação</small></div>
          <span aria-hidden="true">→</span>
          <div className="pronto"><strong>{siteConfig.demo.editedLength}</strong><small>pronto pra postar</small></div>
          <div className="p2-numeros-cortes"><strong><NumberTicker value={siteConfig.demo.cuts} /></strong><small>pausas e erros cortados</small></div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── 3. Como a IA edita (celular parado, passos trocam com a rolagem) ───────────── */

const passos = [
  { titulo: 'Você manda o vídeo e pede', linha: 'Em português, como falaria com um editor.' },
  { titulo: 'A IA tira os erros', linha: 'Pausas, “éééé” e frases repetidas somem.' },
  { titulo: 'Coloca na tela o que você explica', linha: 'O dente aparece quando você fala dele.' },
  { titulo: 'Devolve pronto pra postar', linha: 'Você confere e posta.' },
];
const pedido = 'Tira as pausas, coloca legenda e mostra o dente quando eu falar do canal';

export function ComoEdita() {
  const secao = useRef<HTMLElement>(null);
  const [passo, setPasso] = useState(0);
  const [perto, setPerto] = useState(false);
  const [letras, setLetras] = useState(0);
  useEffect(() => {
    const el = secao.current;
    if (!el) return;
    let pedidoQuadro = 0;
    const medir = () => {
      cancelAnimationFrame(pedidoQuadro);
      pedidoQuadro = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        setPerto(r.top < window.innerHeight * 1.6 && r.bottom > -window.innerHeight * 0.6);
        const curso = r.height - window.innerHeight;
        const p = curso > 0 ? Math.min(0.999, Math.max(0, -r.top / curso)) : 0;
        setPasso(Math.floor(p * passos.length));
      });
    };
    medir();
    window.addEventListener('scroll', medir, { passive: true });
    window.addEventListener('resize', medir);
    return () => { window.removeEventListener('scroll', medir); window.removeEventListener('resize', medir); cancelAnimationFrame(pedidoQuadro); };
  }, []);
  // o pedido é digitado quando a pessoa chega no passo 1
  useEffect(() => {
    if (!perto) return;
    if (menosMovimento()) { setLetras(pedido.length); return; }
    if (letras >= pedido.length) return;
    const id = window.setTimeout(() => setLetras(n => n + 1), 28);
    return () => window.clearTimeout(id);
  }, [perto, letras]);
  const irPara = (i: number) => {
    const el = secao.current;
    if (!el) return;
    const curso = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + curso * ((i + 0.5) / passos.length), behavior: 'smooth' });
  };
  const atual = passos[passo] ?? passos[0]!;
  return (
    <section className="p2-como" id="como-funciona" ref={secao} style={{ height: `${passos.length * 75 + 25}svh` }}>
      <div className="p2-como-fixo">
        <h2 className="p2-como-titulo">Como a IA edita <em>o seu vídeo?</em></h2>
        <div className="p2-fone p2-fone-como">
          <span className="p2-ilha" aria-hidden="true" />
          <div className="p2-fone-tela">
            {/* passo 1: a conversa com a IA */}
            <div className={`p2-tela p2-chat ${passo === 0 ? 'on' : ''}`}>
              <div className="p2-chat-topo"><LogoChatGPT /><LogoClaude /><span>Sua IA · Modo Editor ativo</span></div>
              <div className="p2-chat-corpo">
                <div className="p2-anexo"><img src={capa('/videos/cenas/ao_vivo_bruto.mp4')} alt="" width={54} height={96} /><div><strong>gravacao.mp4</strong><small>gravado no celular</small></div></div>
                <p className="p2-balao">{pedido.slice(0, letras)}{letras < pedido.length && <i className="caret" />}</p>
                <p className={`p2-resposta ${letras >= pedido.length ? 'on' : ''}`}><Sparkles size={13} /> Pode deixar. Já estou editando.</p>
              </div>
            </div>
            {/* passo 2: os erros saem */}
            <div className={`p2-tela ${passo === 1 ? 'on' : ''}`}>
              <VideoVivo src={siteConfig.videos.cenas.aoVivoBruto} ativo={passo === 1} perto={perto} label="Gravação sendo cortada" />
              <div className={`p2-faixa ${passo === 1 ? 'cortando' : ''}`} aria-hidden="true">
                {Array.from({ length: 22 }, (_, i) => <i key={i} className={[4, 5, 11, 12, 13, 18].includes(i) ? 'erro' : ''} />)}
              </div>
            </div>
            {/* passo 3: o que você explica aparece */}
            <div className={`p2-tela ${passo === 2 ? 'on' : ''}`}><VideoVivo src="/videos/cenas/dente.mp4" ativo={passo === 2} perto={perto} label="Dente em 3D ao lado de quem explica" /></div>
            {/* passo 4: pronto */}
            <div className={`p2-tela ${passo === 3 ? 'on' : ''}`}><VideoVivo src={siteConfig.videos.cenas.aoVivoPronto} ativo={passo === 3} perto={perto} label="Vídeo pronto" /></div>
            <div className="p2-avisos" aria-live="polite">
              {passo === 1 && <span className="p2-aviso" key="a1"><Check size={13} /> {siteConfig.vslDemo.cuts} pausas e erros cortados</span>}
              {passo === 2 && <span className="p2-aviso" key="a2"><Check size={13} /> Dente em 3D colocado</span>}
              {passo === 3 && <span className="p2-aviso pronto" key="a3"><Check size={13} /> Vídeo pronto · {siteConfig.vslDemo.rawLength} viraram {siteConfig.vslDemo.editedLength}</span>}
            </div>
          </div>
        </div>
        <div className="p2-passo" key={passo}><strong>{passo + 1}. {atual.titulo}</strong><span>{atual.linha}</span></div>
        <ol className="p2-bolinhas" aria-label="Passos">
          {passos.map((p, i) => <li key={p.titulo}><button type="button" className={i === passo ? 'on' : i < passo ? 'feito' : ''} onClick={() => irPara(i)} aria-label={`Passo ${i + 1}: ${p.titulo}`}>{i < passo ? <Check size={13} /> : i + 1}</button></li>)}
        </ol>
      </div>
    </section>
  );
}

/* ───────────── 4. Quanto você vai pagar por mês (o recibo) ───────────── */

export function Recibo() {
  const linhas: [string, string, string?][] = [
    ['Plano da sua IA', 'US$ 20', 'A partir de US$ 20, no ChatGPT ou no Claude, pago direto pra eles. Pode ser o plano mais básico.'],
    ['Mensalidade do Modo Editor', 'R$ 0'],
    ['Valor por vídeo editado', 'R$ 0'],
    ['Aplicativo ou programa novo', 'R$ 0'],
  ];
  return (
    <section className="section container p2-conta" id="conta">
      <div className="section-heading reveal">
        <h2>Quanto você vai pagar <em>por mês?</em></h2>
        <p>Só o plano da sua IA. Nada a mais.</p>
      </div>
      <div className="reveal">
        <div className="p2-recibo" role="group" aria-label="Recibo do mês">
          <div className="p2-recibo-topo"><span>SEU MÊS COM O MODO EDITOR</span><span className="p2-recibo-logos"><LogoChatGPT /><LogoClaude /></span></div>
          <ul>{linhas.map(([nome, valor, obs]) => <li key={nome}><div><span>{nome}</span><b className={valor === 'R$ 0' ? 'zero' : ''}>{valor}</b></div>{obs && <small>{obs}</small>}</li>)}</ul>
          <div className="p2-recibo-total"><span>A mais por mês</span><strong>R$ 0</strong></div>
          <span className="p2-carimbo" aria-hidden="true">Sem mensalidade nova</span>
        </div>
        <p className="p2-conta-nota"><Play size={13} /> O Modo Editor você paga uma vez só.</p>
      </div>
    </section>
  );
}
