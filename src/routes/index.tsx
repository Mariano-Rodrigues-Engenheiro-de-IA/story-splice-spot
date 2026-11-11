import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, GripVertical, Infinity as Infinito, Loader2, Play, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Clip } from '@/components/clip';
import { VslPlayer } from '@/components/vsl-player';
import { NumberTicker } from '@/components/number-ticker';
import { Creator, ForWho, ModeSwitch, WhatYouGet, useReveal } from '@/components/landing-extras';
import { ComoFunciona, EditorIA, Esteira, Faixas, IATrabalhando, LinhaAjustada, LinhaDoPreco, ProvaSocial, QualIA2, VideoVivo } from '@/components/pro2';
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
const purchaseHref = siteConfig.checkoutUrl || '#preco';

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
  if (destino === 'oferta' || !siteConfig.checkoutUrl)
    return <Button asChild variant="purchase" className={`botao-compra ${className ?? ''}`}><a href="#preco" onClick={e => eventoProprio('IrParaOferta', { local: localDoBotao(e.currentTarget) }, false)}>{label} <ArrowRight /></a></Button>;
  return <Button asChild variant="purchase" className={`botao-compra ${abrindo ? 'is-abrindo' : ''} ${className ?? ''}`}><a href={purchaseHref} onClick={e => { e.currentTarget.href = linkCheckout(e.currentTarget.href); cliqueComprar(localDoBotao(e.currentTarget)); setAbrindo(true); window.setTimeout(() => setAbrindo(false), 8000); }} aria-busy={abrindo}>{abrindo ? <><Loader2 className="botao-girando" /> Abrindo o pagamento…</> : <>{label} <ArrowRight /></>}</a></Button>;
}
/** "Agora as suas aulas saem prontas": trecho de uma aula no formato de YouTube, editada no mesmo processo. */
function Aulas() {
  return <section className="section container" id="aulas">
    <div className="section-heading reveal"><h2>Agora as suas aulas <em>saem prontas.</em></h2><p>Do Reels à aula do YouTube: a IA corta os erros, alterna o enquadramento e coloca as ilustrações no tempo da sua fala.</p></div>
    <div className="aula reveal">
      <div className="aula-tela"><Clip src="/videos/cenas/aula_modo_editor.mp4" label="Trecho de uma aula editada com IA" /><div className="aula-progresso" aria-hidden="true"><span /></div></div>
      <div className="aula-info"><span className="aula-avatar">M</span><div><strong>Aula · Boas-vindas ao Modo Editor</strong><small>{siteConfig.creator.name} · editada com IA</small></div></div>
      <div className="aula-chips">{['Corte limpo, sem pausa', 'Zoom a cada corte', 'Ilustração ao lado', 'Palavra-chave na tela'].map(t => <span key={t}><CheckCircle2 size={14} />{t}</span>)}</div>
    </div>
  </section>;
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
/** Os números reais do vídeo do antes e depois. No celular eles vêm depois do vídeo (primeiro a pessoa vê, depois lê). */
function NumerosDemo() {
  // números reais do vídeo do antes e depois (criativo 10 inteiro)
  const d = siteConfig.demoGeral;
  return <>
    <div className="stats"><div className="stat"><strong><NumberTicker value={d.palavras} /></strong><p>palavras com legenda</p></div><div className="stat"><strong><NumberTicker value={d.efeitos} /></strong><p>efeitos sonoros no tempo certo</p></div><div className="stat"><strong>0</strong><p>programas de edição abertos</p></div></div>
    <p className="fine-print">Números reais deste vídeo: um anúncio de {d.duracao}, editado inteiro pela IA.</p>
  </>;
}
function Comparison() {
  const [position, setPosition] = useState(50);
  const [box, naTela] = useNaTela<HTMLDivElement>();
  // arraste: só vira arraste quando o dedo anda para o lado (para cima e para baixo é a página rolando)
  const toque = useRef<{ x: number; y: number } | null>(null);
  const arrastando = useRef(false);
  const parado = useRef(0); // até quando o balanço espera depois que a pessoa solta
  // bruto e editado são o mesmo trecho: o lado bruto segue o tempo do editado para a linha comparar o mesmo instante
  useEffect(() => {
    if (!naTela) return;
    const timer = window.setInterval(() => {
      const [raw, edit] = Array.from(box.current?.querySelectorAll('video') ?? []);
      if (raw && edit && !edit.paused && !raw.seeking && !edit.seeking && raw.readyState >= 3 && Math.abs(raw.currentTime - edit.currentTime) > 0.3) raw.currentTime = edit.currentTime;
    }, 1500);
    return () => window.clearInterval(timer);
  }, [naTela, box]);
  // a linha vai e volta o tempo todo mostrando o resultado; durante o arraste ela segue o dedo e, 2,5 s depois de
  // soltar, volta a balançar sem pulo (vai deslizando até o balanço)
  useEffect(() => {
    if (!naTela || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = Date.now();
    const timer = window.setInterval(() => {
      if (arrastando.current || Date.now() < parado.current) return;
      const alvo = 50 + Math.sin((Date.now() - start) / 1500) * 34;
      setPosition(p => p + (alvo - p) * 0.14);
    }, 33);
    return () => window.clearInterval(timer);
  }, [naTela]);
  const mover = (x: number) => {
    const r = box.current?.getBoundingClientRect();
    if (r && r.width > 0) setPosition(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)));
  };
  const soltar = () => { if (arrastando.current) parado.current = Date.now() + 2500; arrastando.current = false; toque.current = null; };
  return <div className="comparison-wrap">
    <div className="comparison" ref={box} data-clip-grupo
      onPointerDown={e => { toque.current = { x: e.clientX, y: e.clientY }; if (e.pointerType === 'mouse') { arrastando.current = true; mover(e.clientX); } }}
      onPointerMove={e => {
        const t0 = toque.current;
        if (!t0) return;
        if (!arrastando.current) {
          const dx = Math.abs(e.clientX - t0.x), dy = Math.abs(e.clientY - t0.y);
          if (dx > 6 && dx > dy) { arrastando.current = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* sem captura, o arraste segue pelo próprio quadro */ } }
          else return;
        }
        mover(e.clientX);
      }}
      onPointerUp={soltar} onPointerCancel={soltar} onPointerLeave={e => { if (e.pointerType === 'mouse') soltar(); }}>
      <div className="compare-raw"><Clip grupo src={siteConfig.videos.rawGeral} preset="bruto" opts={{ scene: 'green', offset: 1 }} label="Gravação bruta" /></div>
      <div className="compare-edit" style={{ clipPath: `inset(0 0 0 ${position}%)` }}><Clip grupo src={siteConfig.videos.editedGeral} preset="pronto" opts={{ scene: 'green', offset: 1 }} label="Vídeo editado" /></div>
      <div className="compare-labels"><span>BRUTO</span><span>EDITADO</span></div>
      <div className="compare-line" style={{ left: `${position}%` }}><span className="compare-handle"><GripVertical size={13} /></span></div>
      <input className="compare-input" type="range" min="0" max="100" value={Math.round(position)} aria-label="Comparar antes e depois" onChange={event => { parado.current = Date.now() + 4000; setPosition(Number(event.target.value)); }} />
    </div>
    <p className="compare-help">Arraste a linha para os lados</p>
    {!siteConfig.videos.rawGeral && <p className="illustration-note">Prévia ilustrativa · demonstração em vídeo em breve</p>}
  </div>;
}
/** Exemplos da galeria: trechos de criativos diferentes (sala escura com planta, estúdio com prateleiras,
 *  anatomia em 3D) e exemplos por profissão (dentista, personal, arquiteto, psicólogo),
 *  alternando cenário de um cartão para o outro. */
const galleryCopy: [string, string, string, string][] = [
  ['Ilustração do que você fala', 'mostra na tela o que eu estou explicando', '/videos/galeria/ilustracao.mp4', 'Ilustração'],
  ['Título atrás de você', 'põe um título grande atrás de mim', '/videos/galeria/titulo.mp4', 'Frase grande'],
  ['Dente em 3D', 'mostra em 3D o que acontece no dente', '/videos/cenas/dente.mp4', '3D'],
  ['Coluna em 3D', 'mostra em 3D o que acontece na coluna', '/videos/galeria/esqueleto.mp4', 'Anatomia 3D'],
  ['Mapa de satélite', 'mostra no mapa o lugar que eu citar', '/videos/galeria/mapa.mp4', 'Mapa'],
  ['Músculo em 3D', 'mostra o músculo trabalhando no exercício', '/videos/pro2/personal-braco.mp4', 'Músculo 3D'],
  ['Gráfico que sobe', 'quando eu falar o número, mostra num gráfico', '/videos/galeria/grafico.mp4', 'Gráfico'],
  ['Sala em 3D', 'mostra a sala em 3D enquanto eu explico', '/videos/galeria/sala3d.mp4', 'Projeto 3D'],
  ['Desenho a lápis', 'desenha a história enquanto eu conto', '/videos/galeria/lapis.mp4', 'Historinha'],
  ['Objeto 3D girando', 'coloca um objeto em 3D girando do meu lado', '/videos/galeria/objeto3d.mp4', 'Objeto 3D'],
  ['Coração em 3D', 'mostra o que a ansiedade faz no corpo', '/videos/galeria/coracao.mp4', 'Animação 3D'],
  ['Obra em 3D', 'mostra a casa sendo construída em 3D', '/videos/pro2/arquiteto-obra.mp4', 'Obra em 3D'],
  ['Cenário novo', 'troca o meu fundo, sem pano verde', '/videos/galeria/cenario.mp4', 'Troca de fundo'],
  ['Objeto 3D na mão', 'coloca um objeto em 3D na minha mão', '/videos/cenas/cerebro.mp4', '3D na mão'],
  ['Esquema animado', 'monta um esquema animado do que eu explico', '/videos/galeria/esquema.mp4', 'Passo a passo'],
  ['Título e logos em 3D', 'título animado e as logos em 3D do meu lado', '/videos/galeria/logos3d.mp4', 'Motion design'],
];
const gallery: [string, string, string, string][] = galleryCopy;
/** Quando o meio de um vídeo passa embaixo da setinha do título, ela cutuca para baixo e esse vídeo brilha (contorno,
 *  reflexo e um leve aumento): uma cutucada por vídeo, na hora em que ele passa. Só com a galeria na tela, depois que a
 *  setinha terminou de se desenhar. */
function CutucaVideo() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const galeria = document.getElementById('galeria');
    const seta = galeria?.querySelector<SVGElement>('.seta-curva');
    if (!galeria || !seta) return;
    const antes = new WeakMap<HTMLElement, number>(); // onde estava o meio de cada vídeo na olhada anterior
    let ligado = false, id = 0, inicio = 0;
    const cutuca = (card: HTMLElement) => {
      seta.classList.remove('cutuca'); void seta.getBoundingClientRect(); seta.classList.add('cutuca');
      window.setTimeout(() => {
        card.classList.remove('cutucado'); void card.offsetWidth; card.classList.add('cutucado');
        window.setTimeout(() => card.classList.remove('cutucado'), 1000);
      }, 150);
    };
    const olha = () => {
      const r = seta.getBoundingClientRect();
      const x = r.left + r.width / 2;
      galeria.querySelectorAll<HTMLElement>('.gallery-card').forEach(c => {
        const rc = c.getBoundingClientRect();
        const meio = rc.left + rc.width / 2;
        const era = antes.get(c);
        // cruzou a linha da setinha (indo para a esquerda, ou para a direita se a pessoa arrastar)
        if (era !== undefined && ((era > x && meio <= x) || (era < x && meio >= x))) cutuca(c);
        antes.set(c, meio);
      });
    };
    const io = new IntersectionObserver(([e]) => {
      const na = !!e?.isIntersecting;
      if (na && !ligado) { ligado = true; inicio = window.setTimeout(() => { olha(); id = window.setInterval(olha, 60); }, 1700); }
      if (!na && ligado) { ligado = false; window.clearTimeout(inicio); window.clearInterval(id); }
    }, { threshold: .35 });
    io.observe(galeria);
    return () => { io.disconnect(); window.clearTimeout(inicio); window.clearInterval(id); };
  }, []);
  return null;
}
/** Setinha curva ao lado de "Modo Editor" no título da galeria, apontando para os vídeos (desenha quando a seção aparece). */
function SetaCurva() {
  return <svg className="seta-curva" viewBox="0 0 30 44" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6 C 18 2, 28 14, 22 36" pathLength={100} /><path d="M14 30 L22 38 L27 28" pathLength={100} />
  </svg>;
}
function SpinningSeal() {
  const text = '7 DIAS DE GARANTIA • REEMBOLSO TOTAL • ';
  return <div className="spin-seal" aria-label="7 dias de garantia"><svg viewBox="0 0 100 100" className="spin-ring" aria-hidden="true"><defs><path id="seal-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" /></defs><circle cx="50" cy="50" r="31" /><text><textPath href="#seal-circle" textLength="238" lengthAdjust="spacing">{text}</textPath></text></svg><span>7</span></div>;
}
function Offer() {
  return <section className="section container" id="oferta"><div className="section-heading reveal"><h2>Comece <em>hoje.</em></h2><p>Pagamento único. Vídeos sem limite. 7 dias de garantia.</p></div>
    <div className="offer border-beam beam-teal"><div className="offer-main"><div className="offer-price" id="preco"><p className="preco-rotulo">{siteConfig.precoDe ? 'Preço de Black Friday' : 'Pagamento único'}</p>{siteConfig.precoDe > 0 && <p className="preco-de">de <s className="preco-riscado">R$ {siteConfig.precoDe}<svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path d="M3 33 C 30 27, 62 16, 97 6" pathLength={100} /></svg></s></p>}<div className="price"><sup>R$</sup><Odometro valor={siteConfig.price} de={siteConfig.precoDe || siteConfig.price} /><span className="p2-avista">à vista</span></div><LinhaDoPreco>{siteConfig.installmentValue > 0 ? <>ou <strong>12x de {brlCents(siteConfig.installmentValue)}</strong> no cartão</> : 'no PIX, ou parcelado no cartão'}</LinhaDoPreco><PurchaseButton label="Quero o Modo Editor" className="offer-button" destino="checkout" /><LinhaAjustada alvo=".offer-button" className="p2-selos" min={11} max={16}><b><Infinito aria-hidden="true" /> Acesso vitalício</b><b><CheckCircle2 aria-hidden="true" /> Pagamento único</b></LinhaAjustada></div></div>
      <div className="guarantee"><SpinningSeal /><div><strong>Garantia de 7 dias</strong><p>Testou e não era pra você? Peça o reembolso dentro de 7 dias e receba tudo de volta.</p></div></div></div>
    <Faixas sempre /></section>;
}
const faqItems = [
  ['O que exatamente eu estou comprando?', 'O Modo Editor, um treinamento pronto pro seu ChatGPT ou Claude, mais as videoaulas pra instalar e editar o primeiro vídeo e o Gerador de Pedido. Depois disso, a sua IA edita os seus vídeos: você grava, manda e pede em português.'],
  ['Preciso saber editar vídeo?', 'Não. Você descreve o que quer em português e a IA faz a edição. Quem nunca abriu um editor consegue usar.'],
  ['Posso mesmo sair enquanto a IA edita?', 'Pode. Depois que você manda a gravação e o pedido, a edição segue sozinha. Na volta, o vídeo está pronto pra revisar.'],
  ['Funciona no ChatGPT e no Claude?', 'Sim, nos dois, no plano pago. Pode ser o plano mais básico.'],
  ['Quanto custa a assinatura da IA?', 'A partir de US$ 20 por mês, pagos direto à OpenAI ou à Anthropic. Não está incluída no valor do Modo Editor.'],
  ['É um curso de edição?', 'Não. Você não precisa aprender a editar: quem edita é a IA. As videoaulas curtas só mostram, tela por tela, como instalar o Modo Editor, montar o pedido e editar o seu primeiro vídeo.'],
  ['O que é o Gerador de Pedido?', 'Uma página onde você clica no que quer (estilo, legenda, efeitos, trilha) e ele monta o pedido completo pra você colar na IA. Dá até pra explicar por áudio.'],
  ['Serve pra anúncio e pra conteúdo?', 'Serve. Reels, anúncio, aula, depoimento: se é um vídeo falado, você manda a gravação e pede a edição.'],
  ['Preciso de computador?', 'Para editar, sim: Mac ou Windows. O celular serve para gravar.'],
  ['Como recebo o acesso?', 'O login da área de membros chega no seu e-mail assim que o pagamento é aprovado. No PIX e no cartão é na hora.'],
  ['E se eu não gostar?', 'Você tem 7 dias de garantia. Pede o reembolso e recebe 100% do valor de volta.'],
];
/** true quando o fim dos depoimentos já passou pela tela: antes disso não aparece nenhum botão de compra
 *  (a pessoa vê o vídeo, os exemplos e os depoimentos antes de poder ir para o preço). */
function passouDepoimentos() {
  const d = document.getElementById('depoimentos');
  return !!d && d.getBoundingClientRect().bottom < window.innerHeight;
}
function StickyBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let offerVisible = false, fimVisivel = false;
    const offer = document.getElementById('oferta');
    const fim = document.querySelector('.lamp');
    const update = () => setShow(passouDepoimentos() && !offerVisible && !fimVisivel);
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
  return <div className={`sticky-bar ${show ? 'on' : ''}`} aria-hidden={!show}><div><strong>Modo Editor</strong><p>7 dias de garantia</p></div><PurchaseButton label="Quero" className="sticky-button" /></div>;
}
/** Botão flutuante do WhatsApp, igual ao do checkout: logo redondo no canto, para quem ficou com dúvida. */
function WhatsAppButton() {
  // entra junto com a barra fixa de compra: só depois dos depoimentos
  const [on, setOn] = useState(false);
  useEffect(() => {
    const ver = () => setOn(passouDepoimentos());
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
  return <div className="page geral" data-faixa="amarela">
    <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />
    {/* faixa do alto: a logo à esquerda e o sinal de Black Friday à direita (sem preço: o preço fica na oferta);
        ela substitui o cabeçalho, e o toque em qualquer ponto leva até a oferta */}
    <a href="#preco" className="barra-black" aria-label="Modo Editor. Modo Black: oferta de Black Friday. Ver o preço">
      <span className="barra-black-oferta" aria-hidden="true"><b>Modo Black</b><span className="barra-black-ponto" /><span className="barra-black-txt"><span className="barra-black-so-pc">Oferta de </span>Black Friday</span><span className="barra-black-ir">→</span></span>
      <span className="barra-black-marca" aria-hidden="true"><span className="brand-icon"><Play /><span className="brand-dot" /></span>Modo Editor</span>
    </a>
    <div className="hero-wrap">
      <main>
        <section className="hero" aria-labelledby="hero-title">
          {/* primeira tela: título, frase e vídeo, sem botão de compra (a ideia é a pessoa assistir e rolar, não pular para o preço);
              o bloco ocupa a altura da tela e o vídeo cresce até onde cabe */}
          <div className="hero-dobra">
          <h1 id="hero-title">Deixe a IA editando.<br />Vá <em key={word}>{words[word]}</em></h1>
          {/* colada no vídeo: quem assiste olha para cima e já lê onde aquilo funciona */}
          <p className="hero-funciona"><span className="hf-linha">Funciona no <b><LogoChatGPT /> ChatGPT</b> e no <b><LogoClaude /> Claude</b></span></p>
          <div className="hero-video">
            {siteConfig.videos.vsl ? <VslPlayer src={siteConfig.videos.vsl} poster={siteConfig.videos.vslPoster || undefined} /> : siteConfig.videos.hero ? <><video ref={videoRef} src={siteConfig.videos.hero} autoPlay muted loop playsInline /><Button variant="secondary" size="sm" className="sound-button" onClick={enableSound}><Volume2 />{sound ? 'Som ligado' : 'Toque para ouvir'}</Button></> : <Clip opts={{ impact: 'PRONTO SEM VOCÊ' }} label="Prévia de um vídeo editado pelo Modo Editor" />}
          </div>
          </div>
          <p className="hero-copy">Instale o Modo Editor no seu ChatGPT ou Claude, mande a gravação e diga o que quer. Na volta, o vídeo está cortado, legendado, com efeitos e pronto pra postar.</p>
        </section>
        <section className="section container" id="galeria">
          <div className="section-heading reveal galeria-topo"><h2>Vídeos editados com o <em className="seta-ancora">Modo Editor<SetaCurva /></em></h2></div><CutucaVideo />
          <Esteira itens={gallery} velocidade={78} rotulo="Exemplos de vídeos feitos com o Modo Editor" render={([title, request, src, etiqueta], i, { copia, ativo, perto }) => <li key={i} className="gallery-card" aria-hidden={copia || undefined} style={{ backgroundImage: `url(${src.replace(/\.mp4$/, '.webp')})` }}><VideoVivo src={src} ativo={ativo} perto={perto} label={title} /><span className="gallery-tag">{etiqueta}</span><div className="gallery-caption"><strong>{title}</strong><p className="gallery-request">“{request}”</p></div></li>} />
        </section>
        <ProvaSocial prints={siteConfig.pro.prints.filter(Boolean)} />
        <ForWho />
        <section className="section container comparison-section" id="antes-depois">
          <div className="comparison-copy reveal"><h2>Arraste. <em>É o mesmo vídeo.</em></h2><p>À esquerda, a gravação do jeito que saiu da câmera. À direita, o que a IA devolveu: cenário novo, título atrás de você, objeto em 3D girando, gráfico e legenda.</p>
            <div className="stats-topo"><NumerosDemo /></div>
          </div><Comparison />
          <div className="stats-baixo reveal"><NumerosDemo /></div>
        </section>
        <ComoFunciona />
        <EditorIA />
        <ModeSwitch enxuto />
        <IATrabalhando />
        <Aulas />
        <QualIA2 extra={<>Nada a mais por vídeo: <b>só o plano da sua IA</b>, a partir de US$ 20 por mês.</>} />
        <Creator name={siteConfig.creator.name} photo={siteConfig.creator.photo} />
        <WhatYouGet suporte />
        <Offer />
        <section className="section container faq" id="duvidas"><div className="faq-intro reveal"><h2>Perguntas que<br /><em>chegam no direct.</em></h2><p>O que vale saber antes de comprar.</p></div><Accordion type="single" collapsible className="faq-list">{faqItems.map(([question, answer], i) => <AccordionItem key={question} value={`question-${i}`}><AccordionTrigger>{question}</AccordionTrigger><AccordionContent className="faq-answer">{answer}</AccordionContent></AccordionItem>)}</Accordion></section>
        <section className="lamp"><div className="lamp-light" aria-hidden="true"><span className="lamp-cone left" /><span className="lamp-cone right" /><span className="lamp-glow" /><span className="lamp-line" /></div><div className="lamp-content"><h2>Seu próximo vídeo pode<br />ficar pronto <em>enquanto você vive.</em></h2><PurchaseButton label={`Quero o Modo Editor · R$ ${siteConfig.price}`} destino="checkout" /><p className="purchase-note">Pagamento único · 7 dias de garantia</p></div></section>
      </main>
    </div>
    <footer className="footer"><div className="container"><Brand /><p>ChatGPT é uma marca da OpenAI e Claude, da Anthropic. Este produto é independente e não tem vínculo com nenhuma das duas.</p><nav className="footer-links" aria-label="Links legais"><a href={siteConfig.legal.termsUrl}>Termos de uso</a>·<a href={siteConfig.legal.privacyUrl}>Política de privacidade</a>·<a href={siteConfig.legal.supportUrl}>Suporte</a></nav><p className="copyright">© 2026 Modo Editor</p></div></footer>
    <StickyBar />
    <WhatsAppButton />
  </div>;
}
