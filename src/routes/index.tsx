import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Gift, Loader2, FileArchive, Lock, MousePointer2, GripVertical, Image as ImageIcon, Music2, Play, RefreshCw, Scissors, Sparkles, Subtitles, Volume2, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Clip } from '@/components/clip';
import { VslPlayer } from '@/components/vsl-player';
import type { ClipOpts } from '@/lib/clip-renderer';
import { NumberTicker } from '@/components/number-ticker';
import { Creator, ForWho, LiveDemo, ModeSwitch, RequestLibrary, WhatYouGet, useReveal } from '@/components/landing-extras';
import { siteConfig } from '@/lib/site-config';
import { LogoChatGPT, LogoClaude } from '@/components/marcas-ia';
import { Odometro } from '@/components/odometro';
import { cliqueComprar, evento, eventoProprio, linkCheckout } from '@/lib/pixel';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'Modo Editor — Deixe a IA editando. Vá viver.' },
    { name: 'description', content: 'Solte o Modo Editor no ChatGPT ou Claude e transforme sua gravação em um vídeo pronto para postar. R$ 67, pagamento único e 7 dias de garantia.' },
    { property: 'og:title', content: 'Modo Editor — Deixe a IA editando. Vá viver.' },
    { property: 'og:description', content: 'Seu próximo vídeo pronto enquanto você vive. Conheça o Modo Editor: R$ 67, pagamento único.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Index,
});

const words = ['treinar.', 'almoçar.', 'passear.', 'dormir.', 'viver.'];
const brlCents = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const purchaseHref = siteConfig.checkoutUrl || '#oferta';

function Brand() {
  return <a href="#" className="brand" aria-label="Modo Editor, início"><span className="brand-icon"><Play /><span className="brand-dot" /></span>Modo Editor</a>;
}
/** De onde veio o clique de compra (para o pixel): barra fixa, ou a seção onde o botão está. */
function localDoBotao(el: HTMLElement) {
  if (el.closest('.sticky-bar')) return 'barra-fixa';
  const sec = el.closest('section');
  return sec?.id || sec?.className.split(' ').find(c => c && c !== 'section' && c !== 'container') || 'topo';
}
/** Botão de compra. Acima da oferta ele desce até a oferta (a pessoa vê o pacote, o bônus e a garantia antes de pagar);
 *  só o da oferta e o do fim da página abrem o checkout. */
function PurchaseButton({ label = `Quero o Modo Editor · R$ ${siteConfig.price}`, className, destino = 'oferta' }: { label?: string; className?: string; destino?: 'oferta' | 'checkout' }) {
  // o toque precisa de resposta: o botão afunda e mostra que o pagamento está abrindo
  const [abrindo, setAbrindo] = useState(false);
  useEffect(() => {
    const volta = () => setAbrindo(false); // voltou do checkout pelo botão de voltar
    window.addEventListener('pageshow', volta);
    return () => window.removeEventListener('pageshow', volta);
  }, []);
  if (destino === 'oferta' || !siteConfig.checkoutUrl)
    return <Button asChild variant="purchase" className={`botao-compra ${className ?? ''}`}><a href="#oferta" onClick={e => eventoProprio('IrParaOferta', { local: localDoBotao(e.currentTarget) }, false)}>{label} <ArrowRight /></a></Button>;
  return <Button asChild variant="purchase" className={`botao-compra ${abrindo ? 'is-abrindo' : ''} ${className ?? ''}`}><a href={purchaseHref} onClick={e => { e.currentTarget.href = linkCheckout(e.currentTarget.href); cliqueComprar(localDoBotao(e.currentTarget)); setAbrindo(true); window.setTimeout(() => setAbrindo(false), 8000); }} aria-busy={abrindo}>{abrindo ? <><Loader2 className="botao-girando" /> Abrindo o pagamento…</> : <>{label} <ArrowRight /></>}</a></Button>;
}
/** "Agora as suas aulas saem prontas": trecho de uma aula no formato de YouTube, editada no mesmo processo. */
function Aulas() {
  return <section className="section container" id="aulas">
    <div className="section-heading reveal"><span className="eyebrow">Aulas e vídeos longos</span><h2>Agora as suas aulas <em>saem prontas.</em></h2><p>Do Reels à aula do YouTube: a IA corta os erros, alterna o enquadramento e coloca as ilustrações no tempo da sua fala.</p></div>
    <div className="aula reveal">
      <div className="aula-tela"><Clip src="/videos/cenas/aula_modo_editor.mp4" label="Trecho de uma aula editada com IA" /><div className="aula-progresso" aria-hidden="true"><span /></div></div>
      <div className="aula-info"><span className="aula-avatar">M</span><div><strong>Aula · Boas-vindas ao Modo Editor</strong><small>{siteConfig.creator.name} · editada com IA</small></div></div>
      <div className="aula-chips">{['Corte limpo, sem pausa', 'Zoom a cada corte', 'Ilustração ao lado', 'Palavra-chave na tela'].map(t => <span key={t}><CheckCircle2 size={14} />{t}</span>)}</div>
    </div>
  </section>;
}
/** Small vertical preview used in the cards. Animated canvas until real videos are configured. */
function MiniClip({ className = '', preset = 'pronto', opts, src }: { className?: string; preset?: 'bruto' | 'pronto'; opts?: ClipOpts; src?: string | undefined }) {
  return <div className={`mini-clip ${className}`}><Clip src={src} preset={preset} opts={opts} /></div>;
}
/** true enquanto o elemento está na tela (ou perto): animações e temporizadores só rodam quando alguém vê. */
function useNaTela<T extends Element>() {
  const ref = useRef<T>(null);
  const [visivel, setVisivel] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return setVisivel(true);
    const io = new IntersectionObserver(([e]) => setVisivel(!!e?.isIntersecting), { rootMargin: '100px 0px' });
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return [ref, visivel] as const;
}
function Comparison() {
  const [position, setPosition] = useState(50);
  const [touched, setTouched] = useState(false);
  const [box, naTela] = useNaTela<HTMLDivElement>();
  // bruto e editado são o mesmo trecho: o lado bruto segue o tempo do editado para a linha comparar o mesmo instante
  useEffect(() => {
    if (!naTela) return;
    const timer = window.setInterval(() => {
      const [raw, edit] = Array.from(box.current?.querySelectorAll('video') ?? []);
      if (raw && edit && !edit.paused && Math.abs(raw.currentTime - edit.currentTime) > 0.12) raw.currentTime = edit.currentTime;
    }, 400);
    return () => window.clearInterval(timer);
  }, [naTela, box]);
  useEffect(() => {
    if (touched || !naTela || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = Date.now();
    const timer = window.setInterval(() => setPosition(50 + Math.sin((Date.now() - start) / 1600) * 25), 40);
    return () => window.clearInterval(timer);
  }, [touched, naTela]);
  return <div className="comparison-wrap">
    <div className="comparison" ref={box} data-clip-grupo>
      <div className="compare-raw"><Clip grupo src={siteConfig.videos.raw} preset="bruto" opts={{ scene: 'green', offset: 1 }} label="Gravação bruta" /></div>
      <div className="compare-edit" style={{ clipPath: `inset(0 0 0 ${position}%)` }}><Clip grupo src={siteConfig.videos.edited} preset="pronto" opts={{ scene: 'green', offset: 1 }} label="Vídeo editado" /></div>
      <div className="compare-labels"><span>BRUTO</span><span>EDITADO</span></div>
      <div className="compare-line" style={{ left: `${position}%` }}><span className="compare-handle"><GripVertical size={13} /></span></div>
      <input className="compare-input" type="range" min="0" max="100" value={position} aria-label="Comparar antes e depois" onPointerDown={() => setTouched(true)} onKeyDown={() => setTouched(true)} onChange={event => { setTouched(true); setPosition(Number(event.target.value)); }} />
    </div>
    <p className="compare-help">Arraste a linha para os lados</p>
    {!siteConfig.videos.raw && <p className="illustration-note">Prévia ilustrativa · demonstração em vídeo em breve</p>}
  </div>;
}
const requests = ['Corta as pausas e coloca legenda', 'Troca meu fundo por uma cidade', 'Dá zoom quando eu enfatizar'];
function useTyping(lines: string[], ativo = true) {
  const [state, setState] = useState({ line: 0, chars: 0 });
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setState({ line: 0, chars: lines[0]?.length ?? 0 }); return; }
    if (!ativo) return;
    const timer = window.setInterval(() => setState(({ line, chars }) => chars < (lines[line]?.length ?? 0) + 25 ? { line, chars: chars + 1 } : { line: (line + 1) % lines.length, chars: 0 }), 60);
    return () => window.clearInterval(timer);
  }, [lines, ativo]);
  return (lines[state.line] ?? "").slice(0, state.chars);
}
function ChatHeader() {
  return <div className="chat-header"><i className="chat-dot" /><i className="chat-dot" /><i className="chat-dot" /><span>Sua IA · ChatGPT ou Claude</span></div>;
}
function DropChat() {
  return <div className="chat-window"><ChatHeader /><div className="chat-body">
    <div className="file-bubble file-drop"><FileArchive className="file-icon" /><div><strong>modo-editor.zip</strong><small>arquivo</small></div><MousePointer2 className="drop-cursor" size={14} /></div>
    <div className="chat-success chat-reply"><CheckCircle2 size={12} />Pronto! O Modo Editor está ativo.</div>
  </div></div>;
}
function RequestChat() {
  const [ref, naTela] = useNaTela<HTMLDivElement>();
  const text = useTyping(requests, naTela);
  return <div className="chat-window" ref={ref}><ChatHeader /><div className="chat-body">
    <div className="file-bubble"><Play className="file-icon" /><div><strong>gravacao.mp4</strong><small>vídeo · 1:11</small></div></div>
    <div className="chat-prompt" aria-label={requests.join(' / ')}>{text}<span className="caret" /></div>
  </div></div>;
}
/** Altura de barra fixa (mesma no servidor e no navegador). */
const barra = (i: number, min = 14, amp = 65) => `${(min + Math.abs(Math.sin(i * 1.3) * Math.cos(i * .2)) * amp).toFixed(2)}%`;
/** Corte de pausas e erros: a IA acha os trechos ruins, a agulha passa e eles somem, a fala fica corrida. */
function CutTimeline() {
  const trechos: (number | string)[] = [9, 'pausa', 11, 'ééé', 8, 'erro', 9];
  let n = 0;
  return <div className="corte" aria-hidden="true">
    <div className="corte-trilha">{trechos.map((t, k) => typeof t === 'number'
      ? <span key={k} className="corte-fala">{Array.from({ length: t }, () => { const i = n++; return <span key={i} style={{ height: barra(i, 22) }} />; })}</span>
      : <span key={k} className="corte-tira"><i>{t}</i></span>)}</div>
    <span className="corte-agulha"><Scissors size={12} /></span>
    <span className="corte-ok"><CheckCircle2 size={12} /> Fala corrida, sem pausa</span>
  </div>;
}
/** Trilha e efeitos: voz na frente, trilha baixinha por baixo e um efeito em cada corte, na hora em que a agulha passa. */
function MusicTimeline() {
  const efeitos = [0.2, 0.47, 0.76];
  return <div className="mix" aria-hidden="true">
    <div className="mix-linha"><b>Voz</b><div className="mix-ondas mix-voz">{Array.from({ length: 34 }, (_, i) => <span key={i} style={{ height: barra(i, 30, 70), animationDelay: `${-((i * 0.37) % 1.2).toFixed(2)}s` }} />)}</div></div>
    <div className="mix-linha"><b>Trilha</b><div className="mix-ondas mix-trilha">{Array.from({ length: 34 }, (_, i) => <span key={i} style={{ animationDelay: `${-(i * 0.12).toFixed(2)}s` }} />)}</div></div>
    <div className="mix-linha"><b>Efeitos</b><div className="mix-efeitos">{efeitos.map(x => <i key={x} style={{ left: `${x * 100}%`, animationDelay: `${(x * 4).toFixed(2)}s` }}><Sparkles size={11} /></i>)}</div></div>
    <span className="mix-agulha" />
  </div>;
}
const features = [
  { title: 'Corta pausas e erros', copy: 'Silêncio, “ééé” e a frase que travou saem sozinhos. A fala fica corrida.', icon: Scissors, type: 'cut', wide: true },
  { title: 'Legenda palavra por palavra', copy: 'Cada palavra acende no momento em que você fala.', icon: Subtitles, type: 'caption' },
  { title: 'Zoom nas partes fortes', copy: 'A câmera aproxima na ênfase e volta sozinha.', icon: ZoomIn, type: 'zoom' },
  { title: 'Troca o fundo sem pano verde', copy: 'Você no cenário que pedir, recortado com capricho.', icon: ImageIcon, type: 'background', wide: true },
  { title: 'Trilha e efeitos no tempo certo', copy: 'A trilha entra baixinha por baixo da sua voz e cada corte ganha um efeito, sem você posicionar nada.', icon: Music2, type: 'music' },
];
const galleryCopy: [string, string, string][] = [
  ['Título atrás de você', 'põe um título grande atrás de mim', '/videos/cenas/titulo.mp4'],
  ['Virou quadrinho', 'me transforma em personagem de HQ', '/videos/cenas/quadrinho.mp4'],
  ['Objeto 3D na mão', 'coloca um cérebro 3D na minha mão', '/videos/cenas/cerebro.mp4'],
  ['Explicação em 3D', 'mostra o dente em corte enquanto explico', '/videos/cenas/dente.mp4'],
  ['Modo cinema', 'cor de cinema e faixas pretas', '/videos/cenas/cinema.mp4'],
  ['Cenário novo', 'troca meu fundo, sem pano verde', '/videos/cenas/cenario.mp4'],
  ['Mapa de satélite', 'mostra a cidade no mapa', '/videos/cenas/mapa.mp4'],
  ['Legenda que acompanha', 'legenda palavra por palavra', '/videos/cenas/legenda.mp4'],
];
/** Look of each animated preview (only used if a card has no video). */
const galleryLooks: ClipOpts[] = [
  { impact: 'A IDEIA VEM PRIMEIRO', captions: false, scene: 'blue' }, { scene: 'studio' }, { scene: 'blue', captions: false }, { scene: 'green' },
  { letterbox: true, scene: 'warm', captions: false }, { bgSwap: true }, { scene: 'blue' }, { scene: 'studio' },
];
const gallery: [string, string, string][] = galleryCopy;
const scripts = [
  ['Oi gente, tudo bem? Hoje eu vou falar um pouco sobre como editar vídeo.', 'Você grava em 2 minutos e passa 2 horas editando? Dá pra inverter isso.'],
  ['Nesse vídeo eu vou mostrar umas dicas de anúncio pra vocês.', 'Seu anúncio morre nos 3 primeiros segundos. Olha o que muda quando o gancho vem antes.'],
  ['Se gostou, compra meu curso, o link tá na bio.', 'Se isso te ajudou, o passo a passo completo está no link. Começa hoje.'],
];
function BonusCountdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!siteConfig.bonusEndsAt) return;
    const end = new Date(siteConfig.bonusEndsAt).getTime();
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick(); const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);
  if (left === null || left === 0) return null;
  const d = Math.floor(left / 864e5), h = Math.floor(left / 36e5) % 24, m = Math.floor(left / 6e4) % 60, sec = Math.floor(left / 1000) % 60;
  return <span className="bonus-countdown">Bônus acaba em {d}d {h}h {m}m {sec}s</span>;
}
function BonusBox() {
  const [example, setExample] = useState(0);
  const [shown, setShown] = useState(0);
  const [box, naTela] = useNaTela<HTMLDivElement>();
  const [before = '', after = ''] = scripts[example] ?? [];
  const words = (after ?? '').split(' ');
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setShown(reduced ? words.length : 0);
    if (reduced || !naTela) return;
    // as palavras aparecem uma a uma e o contador para quando todas apareceram
    const reveal = window.setInterval(() => setShown(current => { if (current >= words.length) window.clearInterval(reveal); return Math.min(current + 1, words.length); }), 110);
    const next = window.setTimeout(() => setExample(current => (current + 1) % scripts.length), 7000);
    return () => { window.clearInterval(reveal); window.clearTimeout(next); };
  }, [example, words.length, naTela]);
  return <div className="bonus-box border-beam" ref={box}><div><span className="bonus-badge"><Lock size={11} /> BÔNUS</span><BonusCountdown /><h2>O Arquivo<br />Secreto <em>do Roteiro.</em></h2><p>Um segundo arquivo, pra usar antes de gravar. Você cola o seu roteiro e a IA devolve com gancho mais forte, fala mais clara e um final que chama pra ação.</p><ul className="bonus-list"><li>Gancho nos 3 primeiros segundos</li><li>Frases curtas, fáceis de falar</li><li>Chamada pra ação no final</li></ul></div>
    <div className="script-demo"><span className="eyebrow">Seu roteiro</span><p className="script-old">{before}</p><div className="after-label">↓ DEPOIS DO ARQUIVO SECRETO</div><strong aria-label={after}>{words.map((word, i) => <span key={`${example}-${i}`} className={i < shown ? 'gen-word on' : 'gen-word'}>{word} </span>)}</strong><Button variant="ghost" size="sm" className="script-next" onClick={() => setExample(current => (current + 1) % scripts.length)}><RefreshCw size={10} />Outro exemplo</Button></div></div>;
}
/** Custo de cada vídeo no plano da IA, com os números que o Mariano mostra na aula "Quanto custa editar com IA":
 *  simples (corte e legenda) de até 1 min sai de R$ 2 a 5; longo ou detalhado, com 3D, de R$ 8 a 15;
 *  casos reais: 1:50 cheio de efeitos = R$ 8 e 4 min = R$ 12. Cada tipo cresce um pouco por minuto a mais. */
const tiposEdicao = [
  { nome: 'Simples', desc: 'cortes e legenda', base: [2, 5], porMinuto: [0.6, 1.2] },
  { nome: 'Com efeitos', desc: 'zoom, títulos, trilha', base: [4, 8], porMinuto: [1, 1.6] },
  { nome: 'Detalhado', desc: '3D, mapas, motion', base: [6, 10], porMinuto: [1.5, 1.6] },
] as const;
const duracaoTexto = (min: number) => min < 1 ? '30 s' : `${Math.floor(min)}${min % 1 ? ':30' : ''} min`;
function Calculator() {
  const [minutos, setMinutos] = useState(1);
  const [tipo, setTipo] = useState(1);
  const t = tiposEdicao[tipo] ?? tiposEdicao[1];
  const extra = Math.max(0, minutos - 1);
  const de = Math.floor(t.base[0] + t.porMinuto[0] * extra);
  const ate = Math.ceil(t.base[1] + t.porMinuto[1] * extra);
  return <div className="calculator"><div>
      <div className="calc-control"><div className="calc-label"><label>Duração do vídeo</label><strong>{duracaoTexto(minutos)}</strong></div><Slider aria-label="Duração do vídeo" value={[minutos]} onValueChange={v => setMinutos(v[0] ?? 1)} min={0.5} max={10} step={0.5} /></div>
      <div className="calc-control"><div className="calc-label"><label>Tipo de edição</label></div>
        <div className="calc-tipos" role="radiogroup" aria-label="Tipo de edição">{tiposEdicao.map((item, k) => <button key={item.nome} type="button" role="radio" aria-checked={k === tipo} className={k === tipo ? 'on' : ''} onClick={() => setTipo(k)}><strong>{item.nome}</strong><small>{item.desc}</small></button>)}</div>
      </div>
      <div className="calc-sem-extra"><CheckCircle2 size={18} /><p><strong>Você não paga nada a mais por vídeo.</strong> Só o plano da sua IA (ChatGPT ou Claude, a partir de US$ 20 por mês). A estimativa mostra quanto desse plano cada vídeo usa.</p></div>
    </div>
    <div className="calc-result" aria-live="polite">
      <p className="calc-rotulo">Quanto do seu plano cada vídeo usa</p>
      <strong className="calc-faixa">R$ {de} <span className="calc-a">a</span> R$ {ate}</strong>
      <p>estimados para um vídeo de {duracaoTexto(minutos)}, edição {t.nome.toLowerCase()}. Já está dentro da mensalidade do seu plano: não vem cobrança separada. Muda com cada vídeo e com os ajustes que você pedir.</p>
      <p className="calc-caso"><b>Caso real:</b> um vídeo de 1:50 cheio de efeitos, com mapa de satélite, saiu por R$ 8. Um editor cobraria de R$ 200 a R$ 300.</p>
    </div></div>;
}
function DepoVideo({ name, role, quote, video }: { name: string; role: string; quote: string; video: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [tocando, setTocando] = useState(false);
  const tocar = () => { const v = ref.current; if (v) { v.controls = true; void v.play(); } };
  return <figure className="depo-video reveal">
    <figcaption><blockquote>“{quote}”</blockquote><span><strong>{name}</strong> · {role}</span></figcaption>
    <div className="depo-tela">
      {/* só baixa o vídeo quando a pessoa aperta o play; a capa .webp tem poucos KB */}
      <video ref={ref} src={video} poster={video.replace(/\.mp4$/, '.webp')} playsInline preload="none" aria-label={`Depoimento de ${name}`}
        onPlay={() => { setTocando(true); eventoProprio('Depoimento_Play', { nome: name }); }} onPause={() => setTocando(false)} />
      {!tocando && <button type="button" className="depo-play" onClick={tocar} aria-label={`Assistir o depoimento de ${name}`}><Play /></button>}
    </div>
  </figure>;
}
function Testimonials() {
  const list = siteConfig.testimonials;
  const videos = siteConfig.videoTestimonials;
  if (list.length === 0 && videos.length === 0) return null;
  return <section className="section container" id="depoimentos"><div className="section-heading reveal"><span className="eyebrow">Quem já usa</span><h2>Gente que parou<br /><em>de esperar o editor.</em></h2></div>
    {videos.length > 0 && <div className="depo-videos">{videos.map(item => <DepoVideo key={item.video} {...item} />)}</div>}
    {list.length > 0 && <div className="marquee" tabIndex={0} aria-label="Depoimentos de clientes"><div className="marquee-track">{[...list, ...list].map((item, i) => <figure className="testimonial-card" key={i} aria-hidden={i >= list.length}><strong>{item.result}</strong><blockquote>“{item.quote}”</blockquote><figcaption>{item.name} <span>{item.handle}</span></figcaption></figure>)}</div></div>}</section>;
}
function SpinningSeal() {
  const text = '7 DIAS DE GARANTIA • REEMBOLSO TOTAL • ';
  return <div className="spin-seal" aria-label="7 dias de garantia"><svg viewBox="0 0 100 100" className="spin-ring" aria-hidden="true"><defs><path id="seal-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" /></defs><text><textPath href="#seal-circle" textLength="238">{text}</textPath></text></svg><span>7</span></div>;
}
const offerItems = [
  ['Modo Editor', 'O arquivo que transforma o seu ChatGPT ou Claude num editor de vídeo profissional.'],
  ['Videoaulas curtas', 'Do computador pronto ao primeiro vídeo editado, mostrado tela por tela.'],
  ['Gerador de Pedido', 'Você clica no que quer e ele monta o pedido completo pra IA.'],
  ['Acesso na hora', 'Área de membros liberada assim que o pagamento é aprovado. Funciona no ChatGPT e no Claude (plano pago, à parte).'],
];
function Offer() {
  return <section className="section container" id="oferta"><div className="section-heading reveal"><span className="eyebrow">A oferta</span><h2>Comece hoje <em>por R$ {siteConfig.price}.</em></h2><p>Pagamento único. Sem mensalidade do nosso lado.</p></div>
    <div className="offer border-beam beam-teal"><div className="offer-main"><div className="offer-details"><h3 className="offer-marca"><span className="brand-icon" aria-hidden="true"><Play /><span className="brand-dot" /></span>Modo Editor</h3><p>Método completo de edição com IA, no ChatGPT e no Claude</p><ul className="offer-list">{offerItems.map(([title, copy]) => <li key={title}><CheckCircle2 /><div><strong>{title}</strong><p>{copy}</p></div></li>)}</ul></div>
      <div className="offer-price"><p className="preco-rotulo">{siteConfig.priceAfterLaunch ? 'Preço de lançamento' : 'Pagamento único'}</p><div className="price"><sup>R$</sup><Odometro valor={siteConfig.price} de={siteConfig.priceAfterLaunch || siteConfig.price} /></div>{siteConfig.priceAfterLaunch > 0 && <p className="preco-depois">Depois do lançamento: R$ {siteConfig.priceAfterLaunch}</p>}<p>{siteConfig.installmentValue > 0 ? `à vista no PIX, ou em até 12x no cartão de ${brlCents(siteConfig.installmentValue)}` : 'à vista no PIX, ou parcelado no cartão'}</p><PurchaseButton label="Quero o Modo Editor" className="offer-button" destino="checkout" /><span className="fine-print">PIX, cartão ou boleto · Compra segura</span><div className="bonus-card"><span className="bonus-card-tag"><Gift size={13} /> Bônus incluído</span><strong>O Arquivo Secreto do Roteiro</strong><p>Antes de gravar, a IA revisa o seu roteiro: gancho forte nos 3 primeiros segundos, fala clara e chamada final.</p><span className="bonus-card-gratis">Vem junto, sem pagar nada a mais</span></div></div></div>
      <div className="guarantee"><SpinningSeal /><div><strong>Garantia de 7 dias</strong><p>Testou e não era pra você? Peça o reembolso dentro de 7 dias e receba tudo de volta.</p></div></div></div></section>;
}
const faqItems = [
  ['Preciso saber editar vídeo?', 'Não. Você descreve o que quer em português e a IA faz a edição. Quem nunca abriu um editor consegue usar.'],
  ['Posso mesmo sair enquanto a IA edita?', 'Pode. Depois que você manda a gravação e o pedido, a edição segue sozinha. Na volta, o vídeo está pronto pra revisar.'],
  ['Funciona no ChatGPT e no Claude?', 'Sim, nos dois, no plano pago. Você usa a IA que já tem.'],
  ['Quanto custa a assinatura da IA?', 'A partir de US$ 20 por mês, pagos direto à OpenAI ou à Anthropic. Não está incluída no valor do Modo Editor.'],
  ['É um curso de edição?', 'Não. Você não precisa aprender a editar: quem edita é a IA. As videoaulas curtas só mostram, tela por tela, como instalar o Modo Editor, montar o pedido e editar o seu primeiro vídeo.'],
  ['O que é o Gerador de Pedido?', 'Uma página onde você clica no que quer (estilo, legenda, efeitos, trilha) e ele monta o pedido completo pra você colar na IA. Dá até pra explicar por áudio.'],
  ['Serve pra anúncio e pra conteúdo?', 'Serve. Reels, anúncio, aula, depoimento: se é um vídeo falado, você manda a gravação e pede a edição.'],
  ['Preciso de computador?', 'Para editar, sim: Mac ou Windows. O celular serve para gravar.'],
  ['Como recebo o acesso?', 'O login da área de membros chega no seu e-mail assim que o pagamento é aprovado. No PIX e no cartão é na hora.'],
  ['E se eu não gostar?', 'Você tem 7 dias de garantia. Pede o reembolso e recebe 100% do valor de volta.'],
];
function StickyBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let offerVisible = false, fimVisivel = false;
    const offer = document.getElementById('oferta');
    const fim = document.querySelector('.lamp');
    const update = () => setShow(window.scrollY > 700 && !offerVisible && !fimVisivel);
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.target === offer) { offerVisible = entry.isIntersecting; if (offerVisible) eventoProprio('ViuOferta'); }
      else fimVisivel = entry.isIntersecting;
      update();
    }));
    if (offer) observer.observe(offer);
    if (fim) observer.observe(fim);
    window.addEventListener('scroll', update, { passive: true }); update();
    return () => { observer.disconnect(); window.removeEventListener('scroll', update); };
  }, []);
  return <div className={`sticky-bar ${show ? 'on' : ''}`} aria-hidden={!show}><div><strong>R$ {siteConfig.price}</strong><p>Pagamento único · 7 dias de garantia</p></div><PurchaseButton label="Quero" className="sticky-button" /></div>;
}
/** Botão flutuante do WhatsApp, igual ao do checkout: logo redondo no canto, para quem ficou com dúvida. */
function WhatsAppButton() {
  // no topo ele ficaria em cima do botão de compra e da linha de garantia: só aparece depois que a pessoa rola um pouco
  const [on, setOn] = useState(false);
  useEffect(() => {
    const ver = () => setOn(window.scrollY > 450);
    ver(); window.addEventListener('scroll', ver, { passive: true });
    return () => window.removeEventListener('scroll', ver);
  }, []);
  if (!siteConfig.whatsapp) return null;
  const href = `https://api.whatsapp.com/send?phone=${siteConfig.whatsapp}&text=${encodeURIComponent('Oi! Tenho uma dúvida sobre o Modo Editor.')}`;
  return <a className={`whats ${on ? 'on' : ''}`} aria-hidden={!on} tabIndex={on ? 0 : -1} href={href} target="_blank" rel="noopener noreferrer" aria-label="Tirar dúvidas no WhatsApp" onClick={() => evento('Contact', { content_name: 'Modo Editor' })}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="whats-verde" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#20b038" /><stop offset="1" stopColor="#60d66a" /></linearGradient></defs>
      <path fill="url(#whats-verde)" d="M12.051 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884Z" />
      <path fill="#fff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  </a>;
}
/** Seções fora da tela ficam com as animações de CSS pausadas: o celular não gasta recalculando o que ninguém vê. */
function usePausaForaDaTela() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(entradas => entradas.forEach(e => e.target.classList.toggle('fora-da-tela', !e.isIntersecting)), { rootMargin: '150px 0px' });
    document.querySelectorAll('main > section, main > div > section, .lamp, footer').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}
/** A página sempre abre no topo (no vídeo de vendas), inclusive ao recarregar; os links internos (#oferta, #bonus…)
 *  descem até a seção sem gravar o "#" no endereço, senão recarregar levaria a pessoa direto para lá. */
function useSempreNoTopo() {
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (location.hash) { history.replaceState(null, '', location.pathname + location.search); window.scrollTo(0, 0); }
    const aoClicar = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const href = link?.getAttribute('href');
      if (!href) return;
      e.preventDefault();
      if (href === '#') return window.scrollTo({ top: 0, behavior: 'smooth' });
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    document.addEventListener('click', aoClicar);
    return () => document.removeEventListener('click', aoClicar);
  }, []);
}
function Index() {
  useReveal();
  usePausaForaDaTela();
  useSempreNoTopo();
  const [word, setWord] = useState(0);
  const [progress, setProgress] = useState(0);
  const [sound, setSound] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = reduced ? undefined : window.setInterval(() => setWord(current => (current + 1) % words.length), 2200);
    const scroll = () => { const height = document.documentElement.scrollHeight - window.innerHeight; setProgress(height > 0 ? window.scrollY / height : 0); };
    window.addEventListener('scroll', scroll, { passive: true }); scroll();
    return () => { if (timer) window.clearInterval(timer); window.removeEventListener('scroll', scroll); };
  }, []);
  function enableSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false; video.currentTime = 0; setSound(true); void video.play().catch(() => setSound(false));
  }
  return <div className="page">
    <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />
    <div className="hero-wrap">
      <header className="site-header container"><Brand /><nav className="nav" aria-label="Seções da página"><a href="#ao-vivo">Ao vivo</a><a href="#como-funciona">Como funciona</a><a href="#pedidos">Pedidos</a><a href="#bonus">Bônus</a><a href="#oferta">Preço</a></nav></header>
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="badge"><span className="record-dot" />Funciona no ChatGPT <LogoChatGPT /> e no Claude <LogoClaude /></div>
          <h1 id="hero-title">Deixe a IA editando.<br />Vá <em key={word}>{words[word]}</em></h1>
          <div className="hero-video">
            {siteConfig.videos.vsl ? <VslPlayer src={siteConfig.videos.vsl} poster={siteConfig.videos.vslPoster || undefined} /> : siteConfig.videos.hero ? <><video ref={videoRef} src={siteConfig.videos.hero} autoPlay muted loop playsInline /><Button variant="secondary" size="sm" className="sound-button" onClick={enableSound}><Volume2 />{sound ? 'Som ligado' : 'Toque para ouvir'}</Button></> : <Clip opts={{ impact: 'PRONTO SEM VOCÊ' }} label="Prévia de um vídeo editado pelo Modo Editor" />}
          </div>
          <div className="hero-cta"><PurchaseButton /></div>
          <p className="purchase-note">Pagamento único · Acesso na hora · 7 dias de garantia</p>
          <p className="hero-copy">Solte o arquivo Modo Editor no seu ChatGPT ou Claude, mande a gravação e diga o que quer. Na volta, o vídeo está cortado, legendado e pronto pra postar.</p>
        </section>
        <section className="section container" id="galeria">
          <div className="section-heading reveal"><span className="eyebrow">Feito com o Modo Editor</span><h2>Gravei, pedi <em>e fui fazer outra coisa.</em></h2><p>Cada efeito abaixo foi a IA que fez, a partir de um pedido em português.</p></div>
          <div className="marquee" tabIndex={0} aria-label="Exemplos de vídeos feitos com o Modo Editor" data-clip-grupo><div className="marquee-track">{[...gallery, ...gallery].map(([title, request, src], i) => <div className="gallery-card" key={i} aria-hidden={i >= gallery.length}><Clip grupo src={src} opts={{ ...galleryLooks[i % galleryLooks.length], offset: 1.4 + (i % galleryLooks.length) * 0.9 }} label={title} /><div className="gallery-caption"><strong>{title}</strong><p className="gallery-request">“{request}”</p></div></div>)}</div></div>
        </section>
        <LiveDemo />
        <section className="section container comparison-section" id="antes-depois">
          <div className="comparison-copy reveal"><span className="eyebrow">Antes e depois</span><h2>Arraste. <em>É o mesmo vídeo.</em></h2><p>À esquerda, a gravação do jeito que saiu da câmera. À direita, o que a IA devolveu: cortes, legenda, trilha e o mapa de satélite que desce até a cidade enquanto você explica.</p>
            <div className="stats"><div className="stat"><strong><NumberTicker value={siteConfig.demo.cuts} /></strong><p>pausas e erros cortados</p></div><div className="stat"><strong><NumberTicker value={siteConfig.demo.secondsSaved} format={v => `${Math.round(v)}s`} /></strong><p>a menos no vídeo final</p></div><div className="stat"><strong>0</strong><p>programas de edição abertos</p></div></div>
            <p className="fine-print">Números reais deste vídeo: {siteConfig.demo.rawLength} de gravação viraram {siteConfig.demo.editedLength}. Variam com cada gravação.</p>
          </div><Comparison />
        </section>
        <section className="section container" id="como-funciona">
          <div className="section-heading reveal"><span className="eyebrow">Como funciona</span><h2>Em 3 passos. <em className="text-ready">O último é sair.</em></h2><p>É como mandar mensagem pra um editor. Só que o editor é a sua IA.</p></div>
          <div className="steps"><div className="step reveal"><div className="step-number">1</div><h3>Arraste o arquivo pra conversa</h3><p>Abra o ChatGPT ou o Claude e solte o arquivo Modo Editor. A IA avisa quando está pronta.</p><DropChat /></div><div className="step reveal"><div className="step-number">2</div><h3>Mande o vídeo e diga o que quer</h3><p>Envie a gravação e escreva o pedido em português, como se fosse pra um editor.</p><RequestChat /></div><div className="step reveal"><div className="step-number">3</div><h3>Vá viver. Volte com ele pronto.</h3><p>A edição acontece sozinha. Quando você volta, o vídeo está cortado e legendado.</p><div className="ready-preview"><MiniClip className="ready-clip" src={siteConfig.videos.cenas.pronto} opts={{ scene: 'blue', offset: 2 }} /><span className="ready-tag ready-pulse">✓ Pronto</span><span className="away-tag">☕ você estava fora</span></div></div></div>
        </section>
        <ModeSwitch />
        <section className="section container" id="o-que-faz">
          <div className="section-heading reveal"><span className="eyebrow">O que a IA faz no seu vídeo</span><h2>O que você fazia na mão, <em>a IA faz sozinha.</em></h2><p>Do primeiro corte à trilha: você grava, diz o que quer e recebe o vídeo editado.</p></div>
          <div className="bento">{features.map(feature => <article key={feature.type} className={`feature reveal ${feature.wide ? 'feature-wide' : ''} ${feature.type === 'music' ? 'feature-full' : ''}`}><div className="feature-art">{feature.type === 'cut' ? <CutTimeline /> : feature.type === 'music' ? <MusicTimeline /> : feature.type === 'background' ? <div className="background-pair"><MiniClip preset="bruto" src={siteConfig.videos.cenas.fundoBruto} opts={{ scene: 'studio', offset: 3 }} /><MiniClip src={siteConfig.videos.cenas.fundoNovo} opts={{ bgSwap: true, captions: false, offset: 3 }} /></div> : <MiniClip className={`feature-thumbnail ${feature.type === 'zoom' ? 'zoom-thumbnail' : ''}`} src={feature.type === 'zoom' ? siteConfig.videos.cenas.zoom : siteConfig.videos.cenas.legendaTroca} opts={feature.type === 'zoom' ? { captions: false, scene: 'warm', offset: 4 } : { zoom: false, offset: 2 }} />}</div><feature.icon className="feature-icon" /><h3>{feature.title}</h3><p>{feature.copy}</p></article>)}</div>
        </section>
        <Aulas />
        <ForWho />
        <RequestLibrary />
        <section className="section container" id="conta">
          <div className="section-heading reveal"><span className="eyebrow">Custo por vídeo</span><h2>Quanto sai cada vídeo <em>editado com IA?</em></h2><p>Você só paga o plano da sua IA. Escolha a duração e o tipo de edição e veja quanto desse plano cada vídeo usa.</p></div>
          <Calculator />
        </section>
        <Creator name={siteConfig.creator.name} photo={siteConfig.creator.photo} />
        <Testimonials />
        <WhatYouGet />
        <section className="section container" id="bonus"><BonusBox /></section>
        <Offer />
        <section className="section container faq" id="duvidas"><div className="faq-intro reveal"><span className="eyebrow">Dúvidas</span><h2>Perguntas que<br /><em>chegam no direct.</em></h2><p>O que vale saber antes de comprar.</p></div><Accordion type="single" collapsible className="faq-list">{faqItems.map(([question, answer], i) => <AccordionItem key={question} value={`question-${i}`}><AccordionTrigger>{question}</AccordionTrigger><AccordionContent className="faq-answer">{answer}</AccordionContent></AccordionItem>)}</Accordion></section>
        <section className="lamp"><div className="lamp-light" aria-hidden="true"><span className="lamp-cone left" /><span className="lamp-cone right" /><span className="lamp-glow" /><span className="lamp-line" /></div><div className="lamp-content"><h2>Seu próximo vídeo pode<br />ficar pronto <em>enquanto você vive.</em></h2><PurchaseButton destino="checkout" /><p className="purchase-note">Pagamento único · 7 dias de garantia</p></div></section>
      </main>
    </div>
    <footer className="footer"><div className="container"><Brand /><p>ChatGPT é uma marca da OpenAI e Claude, da Anthropic. Este produto é independente e não tem vínculo com nenhuma das duas.</p><nav className="footer-links" aria-label="Links legais"><a href={siteConfig.legal.termsUrl}>Termos de uso</a>·<a href={siteConfig.legal.privacyUrl}>Política de privacidade</a>·<a href={siteConfig.legal.supportUrl}>Suporte</a></nav><p className="copyright">© 2026 Modo Editor</p></div></footer>
    <StickyBar />
    <WhatsAppButton />
  </div>;
}
