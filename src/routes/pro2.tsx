import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Loader2, Play, CheckCircle2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { VslPlayer } from '@/components/vsl-player';
import { Creator, useReveal } from '@/components/landing-pro';
import { ComoFunciona, QualIA2, ResultadoCliente, Saidas, Segure } from '@/components/pro2';
import { siteConfig } from '@/lib/site-config';
import { nichoPorSlug } from '@/lib/nichos';
import { LogoChatGPT, LogoClaude } from '@/components/marcas-ia';
import { Odometro } from '@/components/odometro';
import { cliqueComprar, evento, eventoProprio, linkCheckout } from '@/lib/pixel';

/* /pro2: a página dos profissionais refeita do zero (9/11/2026), lado a lado com a /pro para comparar. */
export const Route = createFileRoute('/pro2')({
  validateSearch: (search: Record<string, unknown>) => { const p = search['p']; return { p: typeof p === 'string' && p ? p : undefined }; },
  head: () => ({ meta: [
    { title: 'Modo Editor — A IA edita seus vídeos enquanto você trabalha.' },
    { name: 'description', content: `Grave no celular. A IA corta os erros, legenda e coloca na tela o que você explica. R$ ${siteConfig.pro.price}, pagamento único e 7 dias de garantia.` },
    { property: 'og:title', content: 'Modo Editor — A IA edita seus vídeos enquanto você trabalha.' },
    { property: 'og:description', content: `Seu vídeo pronto, com a explicação na tela. Modo Editor: R$ ${siteConfig.pro.price}, pagamento único.` },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Pro2,
});

const brlCents = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const purchaseHref = siteConfig.pro.checkoutUrl || '#oferta';


function Brand() {
  return <a href="#" className="brand" aria-label="Modo Editor, início"><span className="brand-icon"><Play /><span className="brand-dot" /></span>Modo Editor</a>;
}

/** De onde veio o clique de compra (para o pixel): barra fixa, ou a seção onde o botão está. */
function localDoBotao(el: HTMLElement) {
  if (el.closest('.sticky-bar')) return 'barra-fixa';
  const sec = el.closest('section');
  return sec?.id || sec?.className.split(' ').find(c => c && c !== 'section' && c !== 'container') || 'topo';
}

/** Botão de compra. Acima da oferta ele desce até a oferta (a pessoa vê o pacote e a garantia antes de pagar);
 *  só o da oferta e o do fim da página abrem o checkout. */
function PurchaseButton({ label = 'Quero o Modo Editor', className, destino = 'oferta' }: { label?: string; className?: string; destino?: 'oferta' | 'checkout' }) {
  // o toque precisa de resposta: o botão afunda e mostra que o pagamento está abrindo
  const [abrindo, setAbrindo] = useState(false);
  useEffect(() => {
    const volta = () => setAbrindo(false); // voltou do checkout pelo botão de voltar
    window.addEventListener('pageshow', volta);
    return () => window.removeEventListener('pageshow', volta);
  }, []);
  if (destino === 'oferta' || !siteConfig.pro.checkoutUrl)
    return <Button asChild variant="purchase" className={`botao-compra ${className ?? ''}`}><a href="#oferta" onClick={e => eventoProprio('IrParaOferta', { local: localDoBotao(e.currentTarget) }, false)}>{label} <ArrowRight /></a></Button>;
  return <Button asChild variant="purchase" className={`botao-compra ${abrindo ? 'is-abrindo' : ''} ${className ?? ''}`}><a href={purchaseHref} onClick={e => { e.currentTarget.href = linkCheckout(e.currentTarget.href); cliqueComprar(localDoBotao(e.currentTarget)); setAbrindo(true); window.setTimeout(() => setAbrindo(false), 8000); }} aria-busy={abrindo}>{abrindo ? <><Loader2 className="botao-girando" /> Abrindo o pagamento…</> : <>{label} <ArrowRight /></>}</a></Button>;
}

/** Botão de compra no meio da página (um a cada duas seções, pra quem já decidiu não ter que rolar até a oferta). */
function CtaMeio() {
  return <div className="cta-meio reveal"><PurchaseButton /></div>;
}

/** Link do WhatsApp para a edição por vídeo (serviço). Conta como Contact no pixel. */
function linkServico() {
  return `https://api.whatsapp.com/send?phone=${siteConfig.whatsapp}&text=${encodeURIComponent(siteConfig.servico.mensagem)}`;
}

function DepoVideo({ name, role, quote, video, destaque, resultado }: { name: string; role: string; quote: string; video: string; destaque?: boolean; resultado?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [tocando, setTocando] = useState(false);
  const tocar = () => { const v = ref.current; if (v) { v.controls = true; void v.play(); } };
  return <figure className={`depo-video reveal ${destaque ? 'depo-vitrine' : ''}`}>
    <figcaption>{quote && <blockquote>“{quote}”</blockquote>}<span><strong>{name}</strong> · {role}</span></figcaption>
    <div className="depo-tela">
      {/* só baixa o vídeo quando a pessoa aperta o play; a capa .webp tem poucos KB */}
      <video ref={ref} src={video} poster={video.replace(/\.mp4$/, '.webp')} playsInline preload="none" aria-label={`Depoimento de ${name}`}
        onPlay={() => { setTocando(true); eventoProprio('Depoimento_Play', { nome: name }); }} onPause={() => setTocando(false)} />
      {!tocando && <button type="button" className="depo-play" onClick={tocar} aria-label={`Assistir o depoimento de ${name}`}><Play /></button>}
    </div>
    {resultado && <ResultadoCliente src={resultado} nome={name} />}
  </figure>;
}

function Depoimentos() {
  // só depoimentos com arquivo; o destaque (a esteticista) vem primeiro, como vitrine
  const videos = [...siteConfig.pro.videoTestimonials, ...siteConfig.videoTestimonials].filter(v => v.video).sort((a, b) => Number(!!b.destaque) - Number(!!a.destaque));
  const prints = siteConfig.pro.prints.filter(Boolean);
  if (videos.length === 0 && prints.length === 0) return null;
  return <section className="section container" id="depoimentos"><div className="section-heading reveal"><h2>Profissionais que já <em>editam com IA.</em></h2></div>
    {videos.length > 0 && <div className="depo-videos">{videos.map(item => <DepoVideo key={item.video} {...item} />)}</div>}
    {prints.length > 0 && <div className="p2-prints reveal">{prints.map(src => <img key={src} src={src} alt="Mensagem de aluno no WhatsApp" loading="lazy" decoding="async" />)}</div>}
  </section>;
}

function SpinningSeal() {
  const text = '7 DIAS DE GARANTIA • REEMBOLSO TOTAL • ';
  return <div className="spin-seal" aria-label="7 dias de garantia"><svg viewBox="0 0 100 100" className="spin-ring" aria-hidden="true"><defs><path id="seal-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" /></defs><text><textPath href="#seal-circle" textLength="238">{text}</textPath></text></svg><span>7</span></div>;
}

const offerItems = [
  ['Modo Editor: o editor dentro da sua IA', 'Você coloca no ChatGPT ou no Claude uma vez e ele edita todos os seus vídeos.'],
  ['Videoaulas que te guiam do zero', 'Curtas, tela por tela, até o seu primeiro vídeo pronto.'],
  ['Gerador de Pedido', 'Não sabe o que pedir? Clica nas opções e ele escreve o pedido pra você.'],
  ['Suporte no WhatsApp', 'Travou na instalação ou no primeiro vídeo? Você fala com a gente e resolve.'],
  ['Acesso na hora', 'Liberado assim que o pagamento é aprovado. Você precisa de computador e do plano da sua IA.'],
];

function Offer() {
  return <section className="section container" id="oferta"><div className="section-heading reveal"><h2>Comece <em>hoje.</em></h2><p>Pagamento único. Vídeos sem limite. 7 dias de garantia.</p></div>
    <div className="offer border-beam beam-teal"><div className="offer-main"><div className="offer-details"><h3 className="offer-marca"><span className="brand-icon" aria-hidden="true"><Play /><span className="brand-dot" /></span>Modo Editor</h3><p>O editor de vídeo dentro do seu ChatGPT ou Claude, com as aulas pra começar hoje</p><ul className="offer-list">{offerItems.map(([title, copy]) => <li key={title}><CheckCircle2 /><div><strong>{title}</strong><p>{copy}</p></div></li>)}</ul></div>
      <div className="offer-price"><p className="preco-rotulo">{siteConfig.priceAfterLaunch ? 'Preço de lançamento' : 'Pagamento único'}</p><div className="price"><sup>R$</sup><Odometro valor={siteConfig.pro.price} de={siteConfig.priceAfterLaunch || siteConfig.pro.price} /></div>{siteConfig.priceAfterLaunch > 0 && <p className="preco-depois">Depois do lançamento: R$ {siteConfig.priceAfterLaunch}</p>}<p>{siteConfig.installmentValue > 0 ? `à vista no PIX, ou em até 12x no cartão de ${brlCents(siteConfig.installmentValue)}` : 'à vista no PIX, ou parcelado no cartão'}</p><PurchaseButton label="Quero o Modo Editor" className="offer-button" destino="checkout" /><span className="fine-print">PIX, cartão ou boleto · Compra segura</span></div></div>
      <div className="guarantee"><SpinningSeal /><div><strong>Garantia de 7 dias</strong><p>Testou e não era pra você? Peça o reembolso dentro de 7 dias e receba tudo de volta.</p></div></div></div>
    {siteConfig.servico.ativo && siteConfig.whatsapp && <aside className="delegar reveal"><div><strong>Prefere delegar?</strong><p>A nossa equipe edita pra você. Manda a gravação e recebe pronto.</p></div><a className="delegar-link" href={linkServico()} target="_blank" rel="noopener noreferrer" onClick={() => { evento('Contact', { content_name: 'Edição por vídeo' }); eventoProprio('Servico_WhatsApp'); }}><MessageCircle size={15} /> Quero delegar</a></aside>}</section>;
}

const faqItems = [
  ['O que exatamente eu estou comprando?', 'Um treinamento pronto pro seu ChatGPT ou Claude, mais as videoaulas pra colocar ele lá e editar o primeiro vídeo. Depois disso, a sua IA edita os seus vídeos: você grava, manda e pede em português.'],
  ['Preciso saber editar vídeo?', 'Não. Você pede em português e a IA faz a edição. Quem nunca abriu um editor consegue usar.'],
  ['Preciso de computador?', 'Para editar, sim: Mac ou Windows. O celular serve para gravar. Se você só tem celular, a nossa equipe edita pra você.'],
  ['Funciona no ChatGPT e no Claude?', 'Sim, nos dois, no plano pago. Pode ser o plano mais básico.'],
  ['Quanto custa o plano da IA?', 'A partir de US$ 20 por mês, pago direto pra OpenAI ou pra Anthropic. Não tem nenhuma outra mensalidade.'],
  ['Não quero editar. Vocês editam pra mim?', 'Editamos. Você manda a gravação pelo WhatsApp e recebe pronta. O valor é por vídeo e a gente passa na conversa.'],
  ['Como recebo o acesso?', 'O login chega no seu e-mail assim que o pagamento é aprovado. No PIX e no cartão é na hora.'],
  ['E se eu não gostar?', 'Você tem 7 dias de garantia. Pede o reembolso e recebe 100% do valor de volta.'],
];

/** A barra de compra e o WhatsApp só entram depois da esteira de estilos: antes disso cobririam as etiquetas e os títulos. */
function depoisDosEstilos() {
  const e = document.getElementById('exemplos');
  return e ? e.offsetTop + e.offsetHeight - window.innerHeight * 0.6 : 700;
}
function StickyBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let offerVisible = false, fimVisivel = false;
    const offer = document.getElementById('oferta');
    const fim = document.querySelector('.lamp');
    const update = () => setShow(window.scrollY > depoisDosEstilos() && !offerVisible && !fimVisivel);
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
  return <div className={`sticky-bar ${show ? 'on' : ''}`} aria-hidden={!show}><div className="p2-barra-marca"><div><strong>Modo Editor</strong><p>7 dias de garantia</p></div></div><PurchaseButton label="Quero" className="sticky-button" /></div>;
}

/** Botão flutuante do WhatsApp, igual ao do checkout: logo redondo no canto, para quem ficou com dúvida. */
function WhatsAppButton() {
  // no topo ele ficaria em cima do botão de compra e da linha de garantia: só aparece depois que a pessoa rola um pouco
  const [on, setOn] = useState(false);
  useEffect(() => {
    const ver = () => setOn(window.scrollY > depoisDosEstilos());
    ver(); window.addEventListener('scroll', ver, { passive: true });
    return () => window.removeEventListener('scroll', ver);
  }, []);
  // o balão "Dúvidas?" só aparece na hora da dúvida: quando o topo da oferta e o das dúvidas frequentes passam do meio
  // da tela, uma vez cada, por 4 s (procura as seções a cada rolagem: a página pode redesenhá-las depois de carregar)
  const [balao, setBalao] = useState(false);
  useEffect(() => {
    const vistos = new Set<string>();
    let some = 0;
    const checar = () => {
      for (const id of ['oferta', 'duvidas']) {
        if (vistos.has(id)) continue;
        const r = document.getElementById(id)?.getBoundingClientRect();
        if (r && r.top < window.innerHeight * 0.55 && r.bottom > 0) {
          vistos.add(id);
          window.clearTimeout(some);
          setBalao(true);
          some = window.setTimeout(() => setBalao(false), 4200);
        }
      }
    };
    window.addEventListener('scroll', checar, { passive: true });
    return () => { window.removeEventListener('scroll', checar); window.clearTimeout(some); };
  }, []);
  if (!siteConfig.whatsapp) return null;
  const href = `https://api.whatsapp.com/send?phone=${siteConfig.whatsapp}&text=${encodeURIComponent('Oi! Tenho uma dúvida sobre o Modo Editor.')}`;
  return <a className={`whats ${on ? 'on' : ''}`} aria-hidden={!on} tabIndex={on ? 0 : -1} href={href} target="_blank" rel="noopener noreferrer" aria-label="Tirar dúvidas no WhatsApp" onClick={() => evento('Contact', { content_name: 'Modo Editor' })}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="whats-verde" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#20b038" /><stop offset="1" stopColor="#60d66a" /></linearGradient></defs>
      <path fill="url(#whats-verde)" d="M12.051 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884Z" />
      <path fill="#fff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
    <span className={`whats-rotulo ${balao && on ? 'on' : ''}`}>Dúvidas?</span>
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

function Pro2() {
  useReveal();
  usePausaForaDaTela();
  useSempreNoTopo();
  const { p } = Route.useSearch();
  const nicho = nichoPorSlug(p);
  const duvidas = nicho.duvida ? [nicho.duvida, ...faqItems] : faqItems;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const scroll = () => { const height = document.documentElement.scrollHeight - window.innerHeight; setProgress(height > 0 ? window.scrollY / height : 0); };
    window.addEventListener('scroll', scroll, { passive: true }); scroll();
    return () => window.removeEventListener('scroll', scroll);
  }, []);
  return <div className="page pro pro2">
    <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />
    <div className="hero-wrap">
      <header className="site-header container"><Brand /><nav className="nav" aria-label="Seções da página"><a href="#exemplos">Exemplos</a><a href="#como-funciona">Como funciona</a><a href="#oferta">Comprar</a></nav></header>
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="badge"><span className="record-dot" />Funciona no ChatGPT <LogoChatGPT /> e no Claude <LogoClaude /></div>
          <h1 id="hero-title" className="hero-titulo"><span>{nicho.titulo[0]}</span><em>{nicho.titulo[1]}</em></h1>
          <div className="hero-video"><VslPlayer src={siteConfig.videos.vsl} poster={siteConfig.videos.vslPoster || undefined} /></div>
          <div className="hero-cta"><PurchaseButton /></div>
          <p className="purchase-note">Pagamento único · 7 dias de garantia</p>
          <p className="hero-copy">{nicho.frase}</p>
        </section>
        <Saidas />
        <ComoFunciona />
        <Segure />
        <div className="container"><CtaMeio /></div>
        <Depoimentos />
        <QualIA2 />
        <Creator name={siteConfig.creator.name} photo={siteConfig.creator.photo} />
        <Offer />
        <section className="section container faq" id="duvidas"><div className="faq-intro reveal"><h2>Dúvidas <em>frequentes.</em></h2></div><Accordion type="single" collapsible className="faq-list">{duvidas.map(([question, answer], i) => <AccordionItem key={question} value={`question-${i}`}><AccordionTrigger>{question}</AccordionTrigger><AccordionContent className="faq-answer">{answer}</AccordionContent></AccordionItem>)}</Accordion></section>
        <section className="lamp"><div className="lamp-light" aria-hidden="true"><span className="lamp-cone left" /><span className="lamp-cone right" /><span className="lamp-glow" /><span className="lamp-line" /></div><div className="lamp-content"><h2 className="p2-fim-titulo"><span>Seu próximo vídeo pode sair hoje.</span><em>A decisão é sua.</em></h2><PurchaseButton destino="checkout" /><p className="purchase-note">Pagamento único · 7 dias de garantia</p></div></section>
      </main>
    </div>
    <footer className="footer"><div className="container"><Brand /><p>ChatGPT é uma marca da OpenAI e Claude, da Anthropic. Este produto é independente e não tem vínculo com nenhuma das duas.</p><nav className="footer-links" aria-label="Links legais"><a href={siteConfig.legal.termsUrl}>Termos de uso</a>·<a href={siteConfig.legal.privacyUrl}>Política de privacidade</a>·<a href={siteConfig.legal.supportUrl}>Suporte</a></nav><p className="copyright">© 2026 Modo Editor</p></div></footer>
    <StickyBar />
    <WhatsAppButton />
  </div>;
}
