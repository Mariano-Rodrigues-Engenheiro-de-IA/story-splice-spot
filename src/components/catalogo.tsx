import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { ArrowRight, Check, Copy } from 'lucide-react';
import { arquivosEstilo, estilos, nomeTipo, pedidoEstilo, type Estilo } from '@/lib/estilos';
import { eventoProprio } from '@/lib/pixel';

/* Peças do Catálogo de Estilos (/catalogo e /catalogo/NN). Visual do roxo da bio (/links): fundo grafite com brilho
   roxo, cartões de vidro. Celular primeiro: grade de 2 colunas, o estilo 16:9 ocupa as duas. */

/** ?previa no endereço mostra também os estilos que ainda não passaram no teste (para conferir antes de liberar). */
export function usePrevia() {
  // lido do roteador (igual no servidor e no navegador, sem piscar)
  const search = useLocation().search as Record<string, unknown>;
  return 'previa' in search;
}

export const estilosVisiveis = (previa: boolean) => estilos.filter(e => e.testado || previa);

/** Leva as UTMs de quem chegou até a página de vendas; sem UTM, marca que veio do catálogo. */
export function useLinkCompra(estilo?: string) {
  const [href, setHref] = useState('/');
  useEffect(() => {
    const daqui = new URLSearchParams(window.location.search);
    const url = new URL('/', window.location.origin);
    daqui.forEach((v, k) => { if (k.startsWith('utm_')) url.searchParams.set(k, v); });
    if (!url.searchParams.has('utm_source')) { url.searchParams.set('utm_source', 'catalogo'); if (estilo) url.searchParams.set('utm_content', `estilo-${estilo}`); }
    setHref(url.pathname + url.search);
  }, [estilo]);
  return href;
}

/** Vídeo curto sem som que só toca enquanto está na tela (vários cartões juntos não pesam no celular). */
export function VideoLoop({ src, poster, rotulo }: { src: string; poster: string; rotulo: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} className="cat-loop" src={src} poster={poster} muted playsInline loop preload="none" aria-label={rotulo} />;
}

export function CartaoEstilo({ e, previa }: { e: Estilo; previa: boolean }) {
  const a = arquivosEstilo(e.numero);
  return (
    <Link to="/catalogo/$numero" params={{ numero: e.numero }} search={previa ? { previa: 1 } : {}} className={`cat-cartao ${e.formato === '16:9' ? 'cat-largo' : ''}`}>
      <div className="cat-midia">
        <VideoLoop src={a.previa} poster={a.capa} rotulo={`Exemplo do estilo ${e.numero}: ${e.nome}`} />
        <span className="cat-num">{e.numero}</span>
        {e.novo && <span className="cat-novo">Novo</span>}
        {!e.testado && <span className="cat-teste">em teste</span>}
      </div>
      <div className="cat-cartao-texto">
        <strong>{e.nome}</strong>
        <span>{nomeTipo(e.tipo)} · {e.formato}</span>
      </div>
    </Link>
  );
}

/** A frase que o aluno manda para a IA, com o botão de copiar. */
export function PedidoEstilo({ e }: { e: Estilo }) {
  const texto = pedidoEstilo(e);
  const [copiado, setCopiado] = useState(false);
  async function copiar() {
    try { await navigator.clipboard.writeText(texto); }
    catch {
      const t = document.createElement('textarea');
      t.value = texto; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } finally { t.remove(); }
    }
    setCopiado(true);
    eventoProprio('Catalogo_Copiar', { estilo: e.numero }, false);
    window.setTimeout(() => setCopiado(false), 2200);
  }
  return (
    <div className="cat-pedido">
      <p className="cat-pedido-rotulo">Já tem o Modo Editor? Mande para a sua IA junto com o vídeo:</p>
      <p className="cat-pedido-texto">“{texto}”</p>
      <button type="button" className="cat-copiar" onClick={copiar}>
        {copiado ? <><Check aria-hidden="true" /> Copiado</> : <><Copy aria-hidden="true" /> Copiar pedido</>}
      </button>
    </div>
  );
}

export function ChamadaCompra({ estilo, titulo = 'Ainda não tem o Modo Editor?' }: { estilo?: string; titulo?: string }) {
  const href = useLinkCompra(estilo);
  return (
    <section className="cat-chamada">
      <h2>{titulo}</h2>
      <p>Você grava, escolhe o estilo e a IA edita o seu vídeo igual.</p>
      <a className="cat-botao" href={href} onClick={() => eventoProprio('Catalogo_Comprar', { estilo: estilo ?? 'catalogo' }, false)}>
        Quero editar assim <ArrowRight aria-hidden="true" />
      </a>
    </section>
  );
}

export function MarcaCatalogo() {
  return <p className="cat-marca">Modo Editor</p>;
}
