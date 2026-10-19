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
//                                    Se preferir o InitiateCheckout no clique do botão, ligue
//                                    siteConfig.pixel.initiateCheckoutNoBotao (e desligue na Kiwify para não duplicar).
import { siteConfig } from './site-config';

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let iniciado = false;
const disparados = new Set<string>();
const PRODUTO = () => ({ content_name: 'Modo Editor', content_type: 'product', content_ids: ['modo-editor'], value: siteConfig.price, currency: 'BRL' });

/** Carrega o pixel e dispara PageView + ViewContent. Chamar uma vez, no navegador. */
export function iniciarPixel() {
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
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
  }
  window.fbq!('init', id);
  window.fbq!('track', 'PageView');
  window.fbq!('track', 'ViewContent', PRODUTO());
}

/** Evento padrão da Meta (ex.: InitiateCheckout). */
export function evento(nome: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.fbq) window.fbq('track', nome, params);
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
  if (siteConfig.pixel.initiateCheckoutNoBotao) evento('InitiateCheckout', PRODUTO());
}

/** Link do checkout com os UTMs e o fbclid de quem chegou pelo anúncio (a venda fica atribuída à campanha). */
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
