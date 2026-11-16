// Pixel da Meta (Facebook/Instagram). Sem ID em site-config, nada carrega e as funções não fazem nada.
//
// Mapa de eventos da página:
//   PageView + ViewContent ......... ao abrir a página
//   VSL_AtivouSom .................. tocou em "ativar o som" do vídeo de vendas
//   VSL_25 / VSL_50 / VSL_75 ....... assistiu 25%, 50% e 75% do vídeo (com som)
//   VSL_Concluiu ................... assistiu até o fim
//   ViuOferta ...................... a seção do preço apareceu na tela
//   IrParaOferta {local} ........... tocou num botão de compra acima da oferta (desce até a oferta)
//   CliqueComprar {local} .......... tocou num botão que abre o checkout (oferta ou fim da página)
//   Contact ........................ tocou no botão flutuante do WhatsApp
//   InitiateCheckout / Purchase .... disparados pela Kiwify no checkout (configure o mesmo pixel lá).
//   TikTok (siteConfig.pixel.tiktokId): PageView + ViewContent ao abrir, ClickButton no botão de compra, Contact no
//                                    WhatsApp; InitiateCheckout e CompletePayment vêm da Kiwify (mesmo pixel no produto).
//                                    Se preferir o InitiateCheckout no clique do botão, ligue
//                                    siteConfig.pixel.initiateCheckoutNoBotao (e desligue na Kiwify para não duplicar).
import { siteConfig } from './site-config';

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
type Ttq = { page: () => void; track: (nome: string, params?: Record<string, unknown>) => void; load: (id: string) => void };
declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
    ttq?: Ttq;
  }
}

let iniciado = false;
const disparados = new Set<string>();
/** A /pro vende a oferta de R$ 97; a página geral, a de R$ 67. O valor enviado ao pixel segue a página. */
const naPro = () => typeof window !== 'undefined' && window.location.pathname.startsWith('/pro');
const naClone = () => typeof window !== 'undefined' && window.location.pathname.startsWith('/clone');
const PRODUTO = () => naClone()
  ? ({ content_name: 'Modo Clone', content_type: 'product', content_ids: ['modo-clone'], value: siteConfig.clone.vendas.price, currency: 'BRL' })
  : ({ content_name: 'Modo Editor', content_type: 'product', content_ids: ['modo-editor'], value: naPro() ? siteConfig.pro.price : siteConfig.price, currency: 'BRL' });

/** Os dados do produto no formato do TikTok. */
const PRODUTO_TT = () => {
  const p = PRODUTO();
  return { contents: [{ content_id: p.content_ids[0], content_type: 'product', content_name: p.content_name }], value: p.value, currency: 'BRL' };
};

let ttIniciado = false;
/** Pixel do TikTok (código-base oficial, reescrito em TS). Como o da Meta, o script (~100 KB) só baixa depois que a
 *  página carregou; os eventos ficam na fila até lá. */
function iniciarTikTok() {
  const id = siteConfig.pixel.tiktokId;
  if (!id || ttIniciado || typeof window === 'undefined') return;
  ttIniciado = true;
  const metodos = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'];
  const adiar = (alvo: unknown[], m: string) => { (alvo as unknown as Record<string, unknown>)[m] = (...args: unknown[]) => { alvo.push([m, ...args]); }; };
  const fila: unknown[] = (window.ttq as unknown as unknown[]) || [];
  const t = fila as unknown as Record<string, unknown>;
  t['methods'] = metodos;
  metodos.forEach(m => adiar(fila, m));
  const inst: Record<string, unknown[]> = {};
  t['_i'] = inst;
  t['_t'] = {} as Record<string, number>;
  t['_o'] = {} as Record<string, unknown>;
  t['instance'] = (nome: string) => { const i = inst[nome] || []; metodos.forEach(m => adiar(i, m)); return i; };
  t['load'] = (e: string) => {
    const r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
    inst[e] = Object.assign([], { _u: r });
    (t['_t'] as Record<string, number>)[e] = +new Date();
    (t['_o'] as Record<string, unknown>)[e] = {};
    const sc = document.createElement('script');
    sc.async = true;
    sc.src = `${r}?sdkid=${e}&lib=ttq`;
    document.head.appendChild(sc);
  };
  (window as unknown as Record<string, unknown>)['TiktokAnalyticsObject'] = 'ttq';
  window.ttq = fila as unknown as Ttq;
  const carregar = () => {
    const q = window.ttq!;
    q.load(id);
    q.page();
    q.track('ViewContent', PRODUTO_TT());
  };
  const depois = () => window.setTimeout(carregar, 300);
  if (document.readyState === 'complete') depois();
  else window.addEventListener('load', depois, { once: true });
}

/** Evento do TikTok (nomes padrão: ClickButton, Contact...). */
function eventoTT(nome: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.ttq && siteConfig.pixel.tiktokId) window.ttq.track(nome, params);
}

/** Carrega os pixels (Meta e TikTok) e dispara PageView + ViewContent. Chamar uma vez, no navegador. */
export function iniciarPixel() {
  iniciarTikTok();
  const id = siteConfig.pixel.id;
  if (!id || iniciado || typeof window === 'undefined') return;
  iniciado = true;
  if (!window.fbq) {
    const n: Fbq = function (...args: unknown[]) {
      if (n.callMethod) n.callMethod(...args);
      else n.queue!.push(args);
    } as Fbq;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    window.fbq = n;
    window._fbq = n;
    // Os eventos entram na fila na hora; o código da Meta (~270 KB) só baixa depois que a página terminou de
    // carregar, para não disputar o celular com o vídeo de vendas. Ao chegar, ele envia a fila inteira.
    const carregar = () => {
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(s);
    };
    const depois = () => window.setTimeout(carregar, 300);
    if (document.readyState === 'complete') depois();
    else window.addEventListener('load', depois, { once: true });
  }
  window.fbq!('init', id);
  window.fbq!('track', 'PageView');
  window.fbq!('track', 'ViewContent', PRODUTO());
}

/** Evento padrão da Meta (ex.: InitiateCheckout). O Contact (WhatsApp) também vai para o TikTok. */
export function evento(nome: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.fbq) window.fbq('track', nome, params);
  if (nome === 'Contact') eventoTT('Contact', PRODUTO_TT());
}

/** Evento personalizado (ex.: VSL_50). `unico` = dispara só uma vez por visita. */
export function eventoProprio(nome: string, params?: Record<string, unknown>, unico = true) {
  if (typeof window === 'undefined' || !window.fbq) return;
  if (unico) {
    if (disparados.has(nome)) return;
    disparados.add(nome);
  }
  window.fbq('trackCustom', nome, params);
}

/** Clique num botão de compra: registra de onde veio e (opcional) o InitiateCheckout. */
export function cliqueComprar(local: string) {
  eventoProprio('CliqueComprar', { local, ...PRODUTO() }, false);
  eventoTT('ClickButton', { ...PRODUTO_TT(), description: local });
  if (siteConfig.pixel.initiateCheckoutNoBotao) evento('InitiateCheckout', PRODUTO());
}

/** Link do checkout com os UTMs e o fbclid de quem chegou pelo anúncio (a venda fica atribuída à campanha).
 *  Recebe o link como está no botão: o que a UTMify já colocou nele fica, aqui só entra o que faltar. */
export function linkCheckout(base: string) {
  if (typeof window === 'undefined' || !base.startsWith('http')) return base;
  try {
    const url = new URL(base);
    const daPagina = new URLSearchParams(window.location.search);
    daPagina.forEach((v, k) => {
      if (/^(utm_|src$|sck$|fbclid$|xcod$)/i.test(k) && !url.searchParams.has(k)) url.searchParams.set(k, v);
    });
    return url.toString();
  } catch {
    return base;
  }
}
