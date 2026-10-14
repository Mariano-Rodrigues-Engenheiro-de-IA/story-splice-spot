import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, FileArchive, Lock, MousePointer2, GripVertical, Image as ImageIcon, Music2, Play, RefreshCw, Scissors, Subtitles, Volume2, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Clip } from '@/components/clip';
import type { ClipOpts } from '@/lib/clip-renderer';
import { NumberTicker } from '@/components/number-ticker';
import { siteConfig } from '@/lib/site-config';

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
const brl = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
const brlCents = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const purchaseHref = siteConfig.checkoutUrl || '#oferta';

function Brand() {
  return <a href="#" className="brand" aria-label="Modo Editor, início"><span className="brand-icon"><Play /><span className="brand-dot" /></span>Modo Editor</a>;
}
function PurchaseButton({ label = `Quero o Modo Editor · R$ ${siteConfig.price}`, className }: { label?: string; className?: string }) {
  return <Button asChild variant="purchase" className={className}><a href={purchaseHref}>{label} <ArrowRight /></a></Button>;
}
/** Small vertical preview used in the cards. Animated canvas until real videos are configured. */
function MiniClip({ className = '', preset = 'pronto', opts }: { className?: string; preset?: 'bruto' | 'pronto'; opts?: ClipOpts }) {
  return <div className={`mini-clip ${className}`}><Clip preset={preset} opts={opts} /></div>;
}
function Comparison() {
  const [position, setPosition] = useState(50);
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (touched || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = Date.now();
    const timer = window.setInterval(() => setPosition(50 + Math.sin((Date.now() - start) / 1600) * 25), 40);
    return () => window.clearInterval(timer);
  }, [touched]);
  return <div className="comparison-wrap">
    <div className="comparison">
      <div className="compare-raw"><Clip src={siteConfig.videos.raw} preset="bruto" opts={{ scene: 'green', offset: 1 }} label="Gravação bruta" /></div>
      <div className="compare-edit" style={{ clipPath: `inset(0 0 0 ${position}%)` }}><Clip src={siteConfig.videos.edited} preset="pronto" opts={{ scene: 'green', offset: 1 }} label="Vídeo editado" /></div>
      <div className="compare-labels"><span>BRUTO</span><span>EDITADO</span></div>
      <div className="compare-line" style={{ left: `${position}%` }}><span className="compare-handle"><GripVertical size={13} /></span></div>
      <input className="compare-input" type="range" min="0" max="100" value={position} aria-label="Comparar antes e depois" onPointerDown={() => setTouched(true)} onKeyDown={() => setTouched(true)} onChange={event => { setTouched(true); setPosition(Number(event.target.value)); }} />
    </div>
    <p className="compare-help">Arraste a linha para os lados</p>
    <p className="illustration-note">Prévia ilustrativa · demonstração em vídeo em breve</p>
  </div>;
}
const requests = ['Corta as pausas e coloca legenda', 'Troca meu fundo por uma cidade', 'Dá zoom quando eu enfatizar'];
function useTyping(lines: string[]) {
  const [state, setState] = useState({ line: 0, chars: 0 });
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setState({ line: 0, chars: lines[0]?.length ?? 0 }); return; }
    const timer = window.setInterval(() => setState(({ line, chars }) => chars < (lines[line]?.length ?? 0) + 25 ? { line, chars: chars + 1 } : { line: (line + 1) % lines.length, chars: 0 }), 60);
    return () => window.clearInterval(timer);
  }, [lines]);
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
  const text = useTyping(requests);
  return <div className="chat-window"><ChatHeader /><div className="chat-body">
    <div className="file-bubble"><Play className="file-icon" /><div><strong>gravacao.mp4</strong><small>vídeo · 1:11</small></div></div>
    <div className="chat-prompt" aria-label={requests.join(' / ')}>{text}<span className="caret" /></div>
  </div></div>;
}
function Waveform({ music = false }: { music?: boolean }) {
  return <div className={`waveform ${music ? 'music' : ''}`} aria-hidden="true">{Array.from({ length: music ? 38 : 58 }, (_, i) => <span key={i} className={!music && ((i > 13 && i < 19) || (i > 36 && i < 41)) ? 'cut' : ''} style={{ height: `${(14 + Math.abs(Math.sin(i * 1.3) * Math.cos(i * .2)) * 65).toFixed(2)}%` }} />)}</div>;
}
const features = [
  { title: 'Corta pausas e erros', copy: 'Silêncio, gaguejada e tomada repetida saem. A fala fica corrida.', icon: Scissors, type: 'cut', wide: true },
  { title: 'Legenda palavra por palavra', copy: 'Cada palavra acende no momento em que você fala.', icon: Subtitles, type: 'caption' },
  { title: 'Zoom nas partes fortes', copy: 'A câmera aproxima na ênfase e volta sozinha.', icon: ZoomIn, type: 'zoom' },
  { title: 'Troca o fundo sem pano verde', copy: 'Você no cenário que pedir, recortado com capricho.', icon: ImageIcon, type: 'background', wide: true },
  { title: 'Trilha e efeitos no tempo certo', copy: 'Trilha baixinha por baixo da voz e um efeito em cada corte.', icon: Music2, type: 'music' },
];
const galleryCopy: [string, string][] = [
  ['Legenda que acompanha', 'legenda palavra por palavra'], ['Frase em destaque', 'põe a ideia principal no topo'], ['Cidade à noite', 'troca meu fundo, sem pano verde'],
  ['Cor de cinema', 'cor quente e faixas pretas'], ['Ritmo de anúncio', 'zoom em cada ênfase'], ['Com trilha', 'trilha baixinha por baixo'],
];
/** Look of each animated preview, matching the style named on the card. */
const galleryLooks: ClipOpts[] = [
  { scene: 'studio' }, { impact: 'A IDEIA VEM PRIMEIRO', captions: false, scene: 'blue' }, { bgSwap: true },
  { letterbox: true, scene: 'warm', captions: false }, { scene: 'blue', captions: false }, { music: true, scene: 'green' },
];
const gallery: [string, string, string][] = galleryCopy.map(([title, request], i) => [title, request, siteConfig.videos.gallery[i] ?? '']);
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
  const [before = '', after = ''] = scripts[example] ?? [];
  const words = (after ?? '').split(' ');
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setShown(reduced ? words.length : 0);
    if (reduced) return;
    const reveal = window.setInterval(() => setShown(current => current + 1), 110);
    const next = window.setTimeout(() => setExample(current => (current + 1) % scripts.length), 7000);
    return () => { window.clearInterval(reveal); window.clearTimeout(next); };
  }, [example, words.length]);
  return <div className="bonus-box border-beam"><div><span className="bonus-badge"><Lock size={11} /> BÔNUS</span><BonusCountdown /><h2>O Arquivo<br />Secreto <em>do Roteiro.</em></h2><p>Um segundo arquivo, pra usar antes de gravar. Você cola o seu roteiro e a IA devolve com gancho mais forte, fala mais clara e um final que chama pra ação.</p><ul className="bonus-list"><li>Gancho nos 3 primeiros segundos</li><li>Frases curtas, fáceis de falar</li><li>Chamada pra ação no final</li></ul></div>
    <div className="script-demo"><span className="eyebrow">Seu roteiro</span><p className="script-old">{before}</p><div className="after-label">↓ DEPOIS DO ARQUIVO SECRETO</div><strong aria-label={after}>{words.map((word, i) => <span key={`${example}-${i}`} className={i < shown ? 'gen-word on' : 'gen-word'}>{word} </span>)}</strong><Button variant="ghost" size="sm" className="script-next" onClick={() => setExample(current => (current + 1) % scripts.length)}><RefreshCw size={10} />Outro exemplo</Button></div></div>;
}
function Calculator() {
  const [videos, setVideos] = useState(12);
  const [minutes, setMinutes] = useState(90);
  const [cost, setCost] = useState(60);
  const hours = videos * Math.max(0, minutes - 10) / 60;
  const payback = cost > 0 ? Math.ceil(siteConfig.price / cost) : 0;
  const duration = `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`.replace(/^0h/, '').replace(/h00$/, 'h');
  const controls = [
    { label: 'Vídeos por mês', value: videos, min: 1, max: 60, step: 1, display: String(videos), set: setVideos },
    { label: 'Tempo editando cada um', value: minutes, min: 10, max: 240, step: 5, display: minutes < 60 ? `${minutes} min` : duration, set: setMinutes },
    { label: 'Quanto paga a um editor por vídeo', value: cost, min: 0, max: 300, step: 5, display: brl(cost), set: setCost },
  ];
  return <div className="calculator"><div>{controls.map(control => <div className="calc-control" key={control.label}><div className="calc-label"><label>{control.label}</label><strong>{control.display}</strong></div><Slider aria-label={control.label} value={[control.value]} onValueChange={value => control.set(value[0] ?? control.min)} min={control.min} max={control.max} step={control.step} /></div>)}<p className="fine-print">Estimativa com os seus números, considerando cerca de 10 minutos por vídeo com a IA. O tempo real muda com o tipo de vídeo.</p></div>
    <div className="calc-result" aria-live="polite"><strong className="hours"><NumberTicker value={hours} format={v => `${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h`} /></strong><p>por mês de volta pra você</p><strong><NumberTicker value={videos * cost} format={brl} /></strong><p>por mês que deixam de ir pro editor</p>
      <p>{cost > 0 ? <>R$ {siteConfig.price} uma vez. Se paga com <b>{payback} {payback === 1 ? 'vídeo' : 'vídeos'}</b> que você deixa de mandar pro editor.</> : <>São <b>{Math.round(hours * 12).toLocaleString('pt-BR')} horas por ano</b> de volta na sua agenda.</>}</p></div></div>;
}
function Testimonials() {
  const list = siteConfig.testimonials;
  if (list.length === 0) return null;
  return <section className="section container" id="depoimentos"><div className="section-heading"><span className="eyebrow">Quem já usa</span><h2>Gente que parou<br /><em>de esperar o editor.</em></h2></div>
    <div className="marquee" tabIndex={0} aria-label="Depoimentos de clientes"><div className="marquee-track">{[...list, ...list].map((item, i) => <figure className="testimonial-card" key={i} aria-hidden={i >= list.length}><strong>{item.result}</strong><blockquote>“{item.quote}”</blockquote><figcaption>{item.name} <span>{item.handle}</span></figcaption></figure>)}</div></div></section>;
}
function SpinningSeal() {
  const text = '7 DIAS DE GARANTIA • REEMBOLSO TOTAL • ';
  return <div className="spin-seal" aria-label="7 dias de garantia"><svg viewBox="0 0 100 100" className="spin-ring" aria-hidden="true"><defs><path id="seal-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" /></defs><text><textPath href="#seal-circle" textLength="238">{text}</textPath></text></svg><span>7</span></div>;
}
const offerItems = [
  ['Arquivo Modo Editor', 'Você solta na conversa e a sua IA passa a cortar, legendar e animar sozinha.'],
  ['Bônus: O Arquivo Secreto do Roteiro', 'Revisa o seu roteiro antes de gravar: gancho, clareza e chamada final.'],
  ['Acesso na hora', 'Chega no seu e-mail assim que o pagamento é aprovado.'],
  ['Funciona no ChatGPT e no Claude', 'No plano pago, contratado à parte direto com eles.'],
];
function Offer() {
  return <section className="section container" id="oferta"><div className="section-heading"><span className="eyebrow">A oferta</span><h2>Comece hoje <em>por R$ {siteConfig.price}.</em></h2><p>Pagamento único. Sem mensalidade do nosso lado.</p></div>
    <div className="offer border-beam beam-teal"><div className="offer-main"><div className="offer-details"><h3>Modo Editor</h3><p>Arquivo de edição para ChatGPT e Claude</p><ul className="offer-list">{offerItems.map(([title, copy]) => <li key={title}><CheckCircle2 /><div><strong>{title}</strong><p>{copy}</p></div></li>)}</ul></div>
      <div className="offer-price"><p>Pagamento único</p><div className="price"><sup>R$</sup><NumberTicker value={siteConfig.price} duration={1400} /></div><p>{siteConfig.installmentValue > 0 ? `à vista no PIX, ou em até 12x no cartão de ${brlCents(siteConfig.installmentValue)}` : 'à vista no PIX, ou parcelado no cartão'}</p><PurchaseButton label="Quero o Modo Editor" className="offer-button" /><span className="fine-print">PIX, cartão ou boleto · Compra segura</span></div></div>
      <div className="guarantee"><SpinningSeal /><div><strong>Garantia de 7 dias</strong><p>Testou e não era pra você? Peça o reembolso dentro de 7 dias e receba tudo de volta.</p></div></div></div></section>;
}
const faqItems = [
  ['Preciso saber editar vídeo?', 'Não. Você descreve o que quer em português e a IA faz a edição. Quem nunca abriu um editor consegue usar.'],
  ['Posso mesmo sair enquanto a IA edita?', 'Pode. Depois que você manda a gravação e o pedido, a edição segue sozinha. Na volta, o vídeo está pronto pra revisar.'],
  ['Funciona no ChatGPT e no Claude?', 'Sim, nos dois, no plano pago. Você usa a IA que já tem.'],
  ['Quanto custa a assinatura da IA?', 'A partir de US$ 20 por mês, pagos direto à OpenAI ou à Anthropic. Não está incluída no valor do Modo Editor.'],
  ['Preciso de computador?', 'Para editar, sim: Mac ou Windows. O celular serve para gravar.'],
  ['Como recebo o acesso?', 'Por e-mail, assim que o pagamento é aprovado. No PIX e no cartão é na hora.'],
  ['E se eu não gostar?', 'Você tem 7 dias de garantia. Pede o reembolso e recebe 100% do valor de volta.'],
];
function StickyBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let offerVisible = false;
    const offer = document.getElementById('oferta');
    const update = () => setShow(window.scrollY > 700 && !offerVisible);
    const observer = new IntersectionObserver(([entry]) => { offerVisible = !!entry?.isIntersecting; update(); });
    if (offer) observer.observe(offer);
    window.addEventListener('scroll', update, { passive: true }); update();
    return () => { observer.disconnect(); window.removeEventListener('scroll', update); };
  }, []);
  return <div className={`sticky-bar ${show ? 'on' : ''}`} aria-hidden={!show}><div><strong>R$ {siteConfig.price}</strong><p>Pagamento único · 7 dias de garantia</p></div><PurchaseButton label="Quero" className="sticky-button" /></div>;
}
function Index() {
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
      <header className="site-header container"><Brand /><nav className="nav" aria-label="Seções da página"><a href="#antes-depois">Antes e depois</a><a href="#como-funciona">Como funciona</a><a href="#bonus">Bônus</a><a href="#oferta">Preço</a></nav></header>
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="badge"><span className="record-dot" />Funciona no ChatGPT e no Claude</div>
          <h1 id="hero-title">Deixe a IA editando.<br />Vá <em key={word}>{words[word]}</em></h1>
          <div className="hero-video">
            {siteConfig.videos.hero ? <><video ref={videoRef} src={siteConfig.videos.hero} autoPlay muted loop playsInline /><Button variant="secondary" size="sm" className="sound-button" onClick={enableSound}><Volume2 />{sound ? 'Som ligado' : 'Toque para ouvir'}</Button></> : <Clip opts={{ impact: 'PRONTO SEM VOCÊ' }} label="Prévia de um vídeo editado pelo Modo Editor" />}
          </div>
          <div className="hero-cta"><PurchaseButton /></div>
          <p className="purchase-note">Pagamento único · Acesso na hora · 7 dias de garantia</p>
          <p className="hero-copy">Solte o arquivo Modo Editor no seu ChatGPT ou Claude, mande a gravação e diga o que quer. Na volta, o vídeo está cortado, legendado e pronto pra postar.</p>
        </section>
        <section className="section container comparison-section" id="antes-depois">
          <div className="comparison-copy"><span className="eyebrow">Antes e depois</span><h2>Arraste. <em>É o mesmo vídeo.</em></h2><p>À esquerda, a gravação do jeito que saiu do celular. À direita, o que a IA devolveu enquanto você estava fora.</p>
            <div className="stats"><div className="stat"><strong>6</strong><p>pausas e repetições cortadas</p></div><div className="stat"><strong>30s</strong><p>a menos no vídeo final</p></div><div className="stat"><strong>0</strong><p>programas de edição abertos</p></div></div>
            <p className="fine-print">Valores ilustrativos até a inclusão da demonstração real. Variam com cada gravação.</p>
          </div><Comparison />
        </section>
        <section className="section container" id="como-funciona">
          <div className="section-heading"><span className="eyebrow">Como funciona</span><h2>Em 3 passos. <em className="text-ready">O último é sair.</em></h2><p>É como mandar mensagem pra um editor. Só que o editor é a sua IA.</p></div>
          <div className="steps"><div className="step"><div className="step-number">1</div><h3>Arraste o arquivo pra conversa</h3><p>Abra o ChatGPT ou o Claude e solte o arquivo Modo Editor. A IA avisa quando está pronta.</p><DropChat /></div><div className="step"><div className="step-number">2</div><h3>Mande o vídeo e diga o que quer</h3><p>Envie a gravação e escreva o pedido em português, como se fosse pra um editor.</p><RequestChat /></div><div className="step"><div className="step-number">3</div><h3>Vá viver. Volte com ele pronto.</h3><p>A edição acontece sozinha. Quando você volta, o vídeo está cortado e legendado.</p><div className="ready-preview"><MiniClip className="ready-clip" opts={{ scene: 'blue', offset: 2 }} /><span className="ready-tag ready-pulse">✓ Pronto</span><span className="away-tag">☕ você estava fora</span></div></div></div>
        </section>
        <section className="section container" id="o-que-faz">
          <div className="section-heading"><span className="eyebrow">O que a IA faz</span><h2>Tudo isso a partir de <em>uma frase.</em></h2><p>Você pede do seu jeito. O Modo Editor transforma o pedido em edição.</p></div>
          <div className="bento">{features.map(feature => <article key={feature.type} className={`feature ${feature.wide ? 'feature-wide' : ''} ${feature.type === 'music' ? 'feature-full' : ''}`}><div className="feature-art">{feature.type === 'cut' || feature.type === 'music' ? <Waveform music={feature.type === 'music'} /> : feature.type === 'background' ? <div className="background-pair"><MiniClip preset="bruto" opts={{ scene: 'studio', offset: 3 }} /><MiniClip opts={{ bgSwap: true, captions: false, offset: 3 }} /></div> : <MiniClip className={`feature-thumbnail ${feature.type === 'zoom' ? 'zoom-thumbnail' : ''}`} opts={feature.type === 'zoom' ? { captions: false, scene: 'warm', offset: 4 } : { zoom: false, offset: 2 }} />}</div><feature.icon className="feature-icon" /><h3>{feature.title}</h3><p>{feature.copy}</p><a className="feature-link" href={purchaseHref}>Quero o Modo Editor <ArrowRight size={12} /></a></article>)}</div>
        </section>
        <section className="section container" id="galeria">
          <div className="section-heading"><span className="eyebrow">Feito com o Modo Editor</span><h2>Gravei, pedi <em>e fui fazer outra coisa.</em></h2><p>Cada vídeo abaixo saiu de um pedido de uma frase.</p></div>
          <div className="marquee" tabIndex={0} aria-label="Exemplos de vídeos feitos com o Modo Editor"><div className="marquee-track">{[...gallery, ...gallery].map(([title, request, src], i) => <div className="gallery-card" key={i} aria-hidden={i >= gallery.length}><Clip src={src} opts={{ ...galleryLooks[i % galleryLooks.length], offset: 1.4 + (i % galleryLooks.length) * 0.9 }} label={title} /><div className="gallery-caption"><strong>{title}</strong><p className="gallery-request">“{request}”</p></div></div>)}</div></div>
        </section>
        <section className="section container" id="conta">
          <div className="section-heading"><span className="eyebrow">Faça a conta</span><h2>Quanto a edição <em>te custa hoje?</em></h2><p>Mexa nos números e veja o tempo e o dinheiro que voltam pra você.</p></div>
          <Calculator />
        </section>
        <Testimonials />
        <Offer />
        <section className="section container faq" id="duvidas"><div className="faq-intro"><span className="eyebrow">Dúvidas</span><h2>Perguntas que<br /><em>chegam no direct.</em></h2><p>O que vale saber antes de comprar.</p></div><Accordion type="single" collapsible className="faq-list">{faqItems.map(([question, answer], i) => <AccordionItem key={question} value={`question-${i}`}><AccordionTrigger>{question}</AccordionTrigger><AccordionContent className="faq-answer">{answer}</AccordionContent></AccordionItem>)}</Accordion></section>
        <section className="lamp"><div className="lamp-light" aria-hidden="true"><span className="lamp-cone left" /><span className="lamp-cone right" /><span className="lamp-glow" /><span className="lamp-line" /></div><div className="lamp-content"><h2>Seu próximo vídeo pode<br />ficar pronto <em>enquanto você vive.</em></h2><PurchaseButton /><p className="purchase-note">Pagamento único · 7 dias de garantia</p></div></section>
      </main>
    </div>
    <footer className="footer"><div className="container"><Brand /><p>{siteConfig.legal.companyName} · CNPJ {siteConfig.legal.cnpj} · {siteConfig.legal.city}</p><p>ChatGPT é uma marca da OpenAI e Claude, da Anthropic. Este produto é independente e não tem vínculo com nenhuma das duas.</p><nav className="footer-links" aria-label="Links legais"><a href={siteConfig.legal.termsUrl}>Termos de uso</a>·<a href={siteConfig.legal.privacyUrl}>Política de privacidade</a>·<a href={siteConfig.legal.supportUrl}>Suporte</a></nav><p className="copyright">© 2026 Modo Editor</p></div></footer>
    <StickyBar />
  </div>;
}
