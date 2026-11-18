import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import { Check, Clapperboard, Copy, Layers, Maximize2, Plus, Search, X } from 'lucide-react';
import { arquivosEstilo, estilos, gruposEstilo, montarPrompt, type Estilo, type GrupoEstilo, type Variante } from '@/lib/estilos';
import { eventoProprio } from '@/lib/pixel';

/* Catálogo de Estilos com cara de biblioteca/app (17/11/2026, pedido dele: "não é página de vendas, é catálogo,
   sistema"): barra de app, busca, abas, cartões lado a lado só com o vídeo, o nome e "Usar". "Usar" abre uma folha
   com o prompt para copiar (e, se quiser, misturar com outros estilos; no Dark, escolher a variação). Tocar no vídeo
   abre o exemplo com som. */

/** ?previa no endereço mostra também os estilos que ainda não passaram no teste. */
function usePrevia() {
  const search = useLocation().search as Record<string, unknown>;
  return 'previa' in search;
}

/** Leva as UTMs de quem chegou até a página de vendas; sem UTM, marca que veio do catálogo. */
function useLinkCompra() {
  const [href, setHref] = useState('/');
  useEffect(() => {
    const daqui = new URLSearchParams(window.location.search);
    const url = new URL('/', window.location.origin);
    daqui.forEach((v, k) => { if (k.startsWith('utm_')) url.searchParams.set(k, v); });
    if (!url.searchParams.has('utm_source')) url.searchParams.set('utm_source', 'catalogo');
    setHref(url.pathname + url.search);
  }, []);
  return href;
}

/** Vídeo curto sem som que só toca enquanto está na tela. */
function VideoLoop({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.3 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} className="cl-loop" src={src} poster={poster} muted playsInline loop preload="none" aria-hidden="true" />;
}

/** Trava a rolagem da página e fecha com Esc enquanto uma janela está aberta. */
function useJanela(aberta: boolean, fechar: () => void) {
  useEffect(() => {
    if (!aberta) return;
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const tecla = (ev: KeyboardEvent) => { if (ev.key === 'Escape') fechar(); };
    window.addEventListener('keydown', tecla);
    return () => { document.body.style.overflow = antes; window.removeEventListener('keydown', tecla); };
  }, [aberta, fechar]);
}

function Cartao({ e, ver, usar }: { e: Estilo; ver: () => void; usar: () => void }) {
  const a = arquivosEstilo(e.id);
  return (
    <article className="cl-card">
      <button type="button" className="cl-midia" onClick={ver} disabled={!e.temExemplo} aria-label={`Ver o exemplo: ${e.nome}`}>
        {e.temExemplo
          ? <VideoLoop src={a.loop} poster={a.capa} />
          : <span className="cl-sem"><Layers aria-hidden="true" /><span>Exemplo em breve</span></span>}
        {!e.testado && <span className="cl-teste">em teste</span>}
        {e.novo && <span className="cl-novo">Novo</span>}
        {e.temExemplo && <span className="cl-ampliar" aria-hidden="true"><Maximize2 /></span>}
      </button>
      <div className="cl-card-pe">
        <h3>{e.nome}</h3>
        <button type="button" className="cl-usar" onClick={usar}>Usar</button>
      </div>
    </article>
  );
}

function Visualizador({ e, fechar, usar }: { e: Estilo; fechar: () => void; usar: () => void }) {
  useJanela(true, fechar);
  const a = arquivosEstilo(e.id);
  return (
    <div className="cl-fundo cl-fundo-escuro" onClick={fechar}>
      <div className="cl-visor" role="dialog" aria-modal="true" aria-label={e.nome} onClick={ev => ev.stopPropagation()}>
        <button type="button" className="cl-fechar" onClick={fechar} aria-label="Fechar"><X /></button>
        <video className="cl-visor-video" src={a.som} poster={a.capa} controls autoPlay playsInline />
        <div className="cl-visor-pe">
          <h2>{e.nome}</h2>
          <button type="button" className="cl-usar cl-usar-grande" onClick={usar}>Usar este estilo</button>
        </div>
      </div>
    </div>
  );
}

function FolhaPrompt({ e, disponiveis, fechar, linkCompra }: { e: Estilo; disponiveis: Estilo[]; fechar: () => void; linkCompra: string }) {
  useJanela(true, fechar);
  const [variante, setVariante] = useState<Variante | undefined>(e.variantes?.[0]);
  const [extras, setExtras] = useState<string[]>([]);
  const [copiado, setCopiado] = useState(false);
  const outros = disponiveis.filter(x => x.grupo === 'voce' && x.id !== e.id);
  const escolhidos = outros.filter(x => extras.includes(x.id));
  const prompt = montarPrompt(e, escolhidos, variante);

  function alternar(id: string) { setExtras(l => l.includes(id) ? l.filter(x => x !== id) : [...l, id]); setCopiado(false); }

  async function copiar() {
    try { await navigator.clipboard.writeText(prompt); }
    catch {
      const t = document.createElement('textarea');
      t.value = prompt; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } finally { t.remove(); }
    }
    setCopiado(true);
    eventoProprio('Catalogo_Copiar', { estilo: [e.id, ...extras].join('+'), variante: variante?.id ?? '' }, false);
  }

  return (
    <div className="cl-fundo" onClick={fechar}>
      <div className="cl-folha" role="dialog" aria-modal="true" aria-labelledby="cl-folha-titulo" onClick={ev => ev.stopPropagation()}>
        <div className="cl-alca" aria-hidden="true" />
        <div className="cl-folha-cabeca">
          <div><span className="cl-rotulo">Usar estilo</span><h2 id="cl-folha-titulo">{e.nome}</h2></div>
          <button type="button" className="cl-fechar cl-fechar-claro" onClick={fechar} aria-label="Fechar"><X /></button>
        </div>

        {e.variantes ? (
          <div className="cl-bloco">
            <p className="cl-rotulo">Tipo de Dark</p>
            <div className="cl-chips">
              {e.variantes.map(v => (
                <button key={v.id} type="button" className={`cl-chip ${variante?.id === v.id ? 'ativo' : ''}`} aria-pressed={variante?.id === v.id} onClick={() => { setVariante(v); setCopiado(false); }}>
                  {variante?.id === v.id && <Check aria-hidden="true" />}{v.nome}
                </button>
              ))}
            </div>
          </div>
        ) : outros.length > 0 && (
          <div className="cl-bloco">
            <p className="cl-rotulo">Misturar com <span>(opcional)</span></p>
            <div className="cl-chips">
              {outros.map(x => {
                const on = extras.includes(x.id);
                return (
                  <button key={x.id} type="button" className={`cl-chip ${on ? 'ativo' : ''}`} aria-pressed={on} onClick={() => alternar(x.id)}>
                    {on ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}{x.nome}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="cl-bloco">
          <p className="cl-rotulo">Prompt</p>
          <div className="cl-prompt">{prompt}</div>
        </div>
        <button type="button" className={`cl-copiar ${copiado ? 'ok' : ''}`} onClick={copiar}>
          {copiado ? <><Check aria-hidden="true" /> Copiado</> : <><Copy aria-hidden="true" /> Copiar prompt</>}
        </button>
        <p className="cl-dica">Cole na sua IA com o Modo Editor e mande o vídeo junto.</p>
        <p className="cl-nao-tem">Ainda não tem o Modo Editor? <a href={linkCompra} onClick={() => eventoProprio('Catalogo_Comprar', { estilo: e.id }, false)}>Conheça</a></p>
      </div>
    </div>
  );
}

export function Catalogo({ abrir }: { abrir?: string }) {
  const previa = usePrevia();
  const linkCompra = useLinkCompra();
  const lista = useMemo(() => estilos.filter(e => e.testado || previa), [previa]);
  const [grupo, setGrupo] = useState<GrupoEstilo | 'todos'>('todos');
  const [busca, setBusca] = useState('');
  const [vendo, setVendo] = useState<Estilo | null>(null);
  const [usando, setUsando] = useState<Estilo | null>(null);

  // link de anúncio direto para um estilo: /catalogo?estilo=dark
  useEffect(() => {
    const e = abrir ? lista.find(x => x.id === abrir) : undefined;
    if (e?.temExemplo) setVendo(e);
  }, [abrir, lista]);

  const termo = busca.trim().toLowerCase();
  const mostrados = lista.filter(e => (grupo === 'todos' || e.grupo === grupo) && (!termo || e.nome.toLowerCase().includes(termo)));
  const ver = (e: Estilo) => { setVendo(e); eventoProprio('Catalogo_Ver', { estilo: e.id }, false); };
  const usar = (e: Estilo) => { setVendo(null); setUsando(e); eventoProprio('Catalogo_Usar', { estilo: e.id }, false); };

  return (
    <div className="cl">
      <header className="cl-barra">
        <div className="cl-marca">
          <span className="cl-logo" aria-hidden="true"><Clapperboard /></span>
          <div><strong>Modo Editor</strong><span>Catálogo de Estilos</span></div>
        </div>
        <a className="cl-pegar" href={linkCompra} onClick={() => eventoProprio('Catalogo_Comprar', { estilo: 'barra' }, false)}>Pegar o Modo Editor</a>
      </header>

      <main className="cl-corpo">
        <div className="cl-titulo">
          <h1>Estilos</h1>
          {lista.length > 0 && <span className="cl-conta">{lista.length}</span>}
        </div>
        <p className="cl-sub">Escolha um estilo, toque em <b>Usar</b> e cole o prompt na sua IA com o vídeo.</p>

        <div className="cl-ferramentas">
          <label className="cl-busca">
            <Search aria-hidden="true" />
            <input type="search" value={busca} onChange={ev => setBusca(ev.target.value)} placeholder="Buscar estilo" aria-label="Buscar estilo" />
          </label>
          <div className="cl-abas" role="tablist" aria-label="Tipo de estilo">
            {[{ id: 'todos' as const, nome: 'Todos' }, ...gruposEstilo].map(g => (
              <button key={g.id} type="button" role="tab" aria-selected={grupo === g.id} className={grupo === g.id ? 'ativo' : ''} onClick={() => setGrupo(g.id)}>{g.nome}</button>
            ))}
          </div>
        </div>

        {lista.length === 0 ? (
          <p className="cl-vazio">Os primeiros estilos estão sendo testados. Volte em breve.</p>
        ) : mostrados.length === 0 ? (
          <p className="cl-vazio">Nenhum estilo com esse nome.</p>
        ) : (
          <div className="cl-grade">
            {mostrados.map(e => <Cartao key={e.id} e={e} ver={() => ver(e)} usar={() => usar(e)} />)}
          </div>
        )}

        <p className="cl-ref">Não achou o estilo? Mande para a IA um vídeo de referência junto com o seu, e ela edita no mesmo estilo.</p>
      </main>

      {vendo && <Visualizador e={vendo} fechar={() => setVendo(null)} usar={() => usar(vendo)} />}
      {usando && <FolhaPrompt e={usando} disponiveis={lista} fechar={() => setUsando(null)} linkCompra={linkCompra} />}
    </div>
  );
}
