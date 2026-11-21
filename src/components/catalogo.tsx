import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import { ArrowLeft, Check, Copy, Layers, Maximize2, Play, Search, X } from 'lucide-react';
import { arquivosEstilo, estilos, montarPrompt, type Estilo, type Exemplo, type Variante } from '@/lib/estilos';
import { eventoProprio } from '@/lib/pixel';

/* Catálogo de Estilos com cara de biblioteca/app (17/11/2026, pedido dele: "não é página de vendas, é catálogo,
   sistema"): barra de app, busca, cartões lado a lado só com o vídeo, o nome e "Usar". 20/11 (pedido dele):
   - cada estilo é uma SEÇÃO: o cartão mostra o melhor vídeo e quantos vídeos tem; tocar abre a seção com todos os
     vídeos lado a lado; tocar num vídeo toca com som; estilo com um vídeo só abre direto o vídeo;
   - cada vídeo tem um CÓDIGO (M3D-02...) que vai no prompt: o Modo Editor liga o código à receita exata daquele vídeo.
   "Usar" abre a folha com o prompt para copiar. A prévia de cada cartão toca o vídeo de exemplo INTEIRO (sem som). */

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

/** Janelas abertas em camadas (seção > vídeo > prompt): trava a rolagem; o Esc e o VOLTAR do celular fecham só a de
    cima (uma entrada no histórico por camada), em vez de sair do catálogo. */
function useCamadas(n: number, fecharTopo: () => void) {
  const fechar = useRef(fecharTopo);
  fechar.current = fecharTopo;
  const empilhadas = useRef(0);
  const ignorar = useRef(0);
  useEffect(() => {
    const voltar = () => {
      if (ignorar.current > 0) { ignorar.current--; return; }
      empilhadas.current = Math.max(0, empilhadas.current - 1);
      fechar.current();
    };
    const tecla = (ev: KeyboardEvent) => { if (ev.key === 'Escape') fechar.current(); };
    window.addEventListener('popstate', voltar);
    window.addEventListener('keydown', tecla);
    return () => { window.removeEventListener('popstate', voltar); window.removeEventListener('keydown', tecla); };
  }, []);
  useEffect(() => {
    while (empilhadas.current < n) {
      window.history.pushState({ ...window.history.state, clJanela: true }, '');
      empilhadas.current++;
    }
    if (empilhadas.current > n) {
      // fechou pelo X, pelo fundo ou pelo Esc: tira do histórico as entradas dessas camadas
      const k = empilhadas.current - n;
      empilhadas.current = n;
      ignorar.current++;
      window.history.go(-k);
    }
    document.body.style.overflow = n > 0 ? 'hidden' : '';
  }, [n]);
}

function Cartao({ e, ver, usar }: { e: Estilo; ver: () => void; usar: () => void }) {
  const capa = e.exemplos[0];
  const a = arquivosEstilo(capa?.id ?? e.id);
  const n = e.exemplos.length;
  return (
    <article className="cl-card">
      <button type="button" className="cl-midia" onClick={ver} disabled={!e.temExemplo} aria-label={`Abrir o estilo ${e.nome} (${n} ${n > 1 ? 'vídeos' : 'vídeo'})`}>
        {e.temExemplo
          ? <VideoLoop src={a.loop} poster={a.capa} />
          : <span className="cl-sem"><Layers aria-hidden="true" /><span>Exemplo em breve</span></span>}
        {/* o NOME do estilo, grande, em cima do vídeo */}
        <h3 className="cl-card-titulo">{e.nome}</h3>
        <span className="cl-etiquetas">
          {!e.testado && <span className="cl-teste">em teste</span>}
          {e.novo && <span className="cl-novo">Novo</span>}
          {e.grupo === 'dark' && <span className="cl-dark">Dark</span>}
        </span>
        {e.temExemplo && <span className="cl-ampliar" aria-hidden="true"><Maximize2 /></span>}
      </button>
      <div className="cl-card-pe">
        {e.temExemplo ? (
          <>
            <button type="button" className="cl-qtd" onClick={ver}>{n} {n > 1 ? 'vídeos' : 'vídeo'} <span aria-hidden="true">›</span></button>
            <button type="button" className="cl-usar" onClick={usar}>Usar</button>
          </>
        ) : <span className="cl-em-breve">Em breve</span>}
      </div>
    </article>
  );
}

/** Banner do topo (cara de área de membros): só visual. Mosaico com as capas dos vídeos andando devagar, a etiqueta e o título
    (20/11, ele: banner é para ser bonito, sem informação nem instrução; a instrução fica embaixo). */
function Banner({ lista }: { lista: Estilo[] }) {
  // 20/11 (ele): com todos os vídeos o banner ficou cheio de capa pequena e quase só Antes e depois.
  // Agora: só a CAPA de cada estilo (o melhor vídeo dele), sem os horizontais, embaralhadas (quem aparece e Dark
  // alternando, nunca dois do mesmo estilo lado a lado), em 2 fileiras de capas maiores.
  const capaDe = (e: Estilo) => e.exemplos.find(x => x.formato !== '16:9');
  const comCapa = lista.filter(e => e.temExemplo && capaDe(e));
  const voce = comCapa.filter(e => e.grupo !== 'dark');
  const dark = comCapa.filter(e => e.grupo === 'dark');
  const mistura: Estilo[] = [];
  for (let i = 0; i < Math.max(voce.length, dark.length); i++) {
    const v = voce[i];
    const d = dark[i];
    if (v) mistura.push(v);
    if (d) mistura.push(d);
  }
  const capas = mistura.map(e => arquivosEstilo(capaDe(e)!.id).capa);
  // a 2ª fileira começa no meio da lista (as duas nunca mostram a mesma capa uma em cima da outra)
  const meio = Math.floor(capas.length / 2);
  const fileiras = [capas, [...capas.slice(meio), ...capas.slice(0, meio)]];
  return (
    <section className="cl-banner" aria-labelledby="cl-banner-titulo">
      <div className="cl-banner-mosaico" aria-hidden="true">
        {fileiras.map((f, k) => (
          // a lista 3 vezes: a fileira anda 1/3 e volta ao começo sem buraco, em qualquer largura de tela
          <div key={k} className={`cl-banner-fileira ${k % 2 ? 'volta' : ''}`}>
            {[...f, ...f, ...f].map((src, i) => <img key={i} src={src} alt="" decoding="async" />)}
          </div>
        ))}
      </div>
      <div className="cl-banner-veu" aria-hidden="true" />
      <div className="cl-banner-texto">
        <div className="cl-banner-miolo">
          <span className="cl-banner-tag">Área de membros</span>
          <h1 id="cl-banner-titulo">Catálogo de Estilos</h1>
        </div>
      </div>
    </section>
  );
}

/** Um vídeo do estilo, com som, e o código dele. */
function Visualizador({ e, ex, n, fechar, usar }: { e: Estilo; ex: Exemplo; n?: number; fechar: () => void; usar: () => void }) {
  const a = arquivosEstilo(ex.id);
  return (
    <div className="cl-fundo cl-fundo-escuro" onClick={fechar}>
      <div className={`cl-visor ${ex.formato === '16:9' ? 'cl-visor-h' : ''}`} role="dialog" aria-modal="true" aria-label={`${e.nome}, ${ex.codigo}`} onClick={ev => ev.stopPropagation()}>
        <button type="button" className="cl-fechar" onClick={fechar} aria-label="Fechar" autoFocus><X /></button>
        <video key={a.som} className={`cl-visor-video ${ex.formato === '16:9' ? 'cl-visor-video-h' : ''}`} src={a.som} poster={ex.formato === '16:9' ? undefined : a.capa} controls autoPlay playsInline />
        <div className="cl-visor-pe">
          <div>
            <h2>{e.nome}</h2>
            <span className="cl-visor-conta"><span className="cl-codigo">{ex.codigo}</span>{n ? ` · vídeo ${n} de ${e.exemplos.length}` : ''}</span>
          </div>
          <button type="button" className="cl-usar cl-usar-grande" onClick={usar}>Usar este</button>
        </div>
      </div>
    </div>
  );
}

/** A seção de um estilo: todos os vídeos dele lado a lado (o primeiro é o melhor, o mesmo da capa). */
function Secao({ e, voltar, ver, usar }: { e: Estilo; voltar: () => void; ver: (ex: Exemplo, n: number) => void; usar: (ex: Exemplo) => void }) {
  return (
    <div className="cl-secao" role="dialog" aria-modal="true" aria-labelledby="cl-secao-titulo">
      <header className="cl-secao-barra">
        <button type="button" className="cl-voltar" onClick={voltar} autoFocus><ArrowLeft aria-hidden="true" /> Voltar</button>
        <div className="cl-secao-titulo">
          <h2 id="cl-secao-titulo">{e.nome}</h2>
          <span className="cl-conta">{e.exemplos.length}</span>
        </div>
      </header>
      <div className="cl-secao-hero">
        <img className="cl-secao-hero-fundo" src={arquivosEstilo(e.exemplos[0]?.id ?? e.id).capa} alt="" aria-hidden="true" />
        <div className="cl-secao-hero-texto">
          {e.grupo === 'dark' && <span className="cl-dark">Dark · ninguém aparece</span>}
          <p className="cl-secao-hero-nome">{e.nome}</p>
          <p className="cl-secao-hero-qtd">{e.exemplos.length} {e.exemplos.length > 1 ? 'vídeos' : 'vídeo'}</p>
          <button type="button" className="cl-usar cl-usar-grande" onClick={() => e.exemplos[0] && usar(e.exemplos[0])}>Usar este estilo</button>
        </div>
      </div>
      <div className="cl-corpo">
        <p className="cl-sub">{e.exemplos.length > 1 ? 'Escolha o vídeo que você quer seguir: cada um tem um ' : 'Este vídeo tem o '}<b>código</b>{e.exemplos.length > 1 ? ', e a IA faz igual ao que você escolher.' : ' que vai no prompt: a IA faz igual a ele.'} Toque no vídeo para ver com som.</p>
        <div className="cl-grade">
          {e.exemplos.map((ex, k) => {
            const a = arquivosEstilo(ex.id);
            return (
              <article key={ex.id} className="cl-card">
                <button type="button" className="cl-midia" onClick={() => ver(ex, k + 1)} aria-label={`Ver o vídeo ${ex.codigo}: ${ex.titulo}`}>
                  <VideoLoop src={a.loop} poster={a.capa} />
                  <span className="cl-codigo cl-codigo-canto">{ex.codigo}{ex.formato === '16:9' ? ' · 16:9' : ''}</span>
                  {k === 0 && e.exemplos.length > 1 && <span className="cl-novo">Destaque</span>}
                  <span className="cl-ampliar" aria-hidden="true"><Play /></span>
                </button>
                <div className="cl-card-pe cl-card-pe-secao">
                  <h3>{ex.titulo}</h3>
                  <button type="button" className="cl-usar" onClick={() => usar(ex)}>Usar este</button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FolhaPrompt({ e, codigo, fechar, linkCompra }: { e: Estilo; codigo: string; fechar: () => void; linkCompra: string }) {
  const [variante, setVariante] = useState<Variante | undefined>(e.variantes?.[0]);
  const [copiado, setCopiado] = useState(false);
  // 20/11 (ele): sem "Misturar com" (misturar estilos é mais uma dificuldade para a pessoa)
  const prompt = montarPrompt(e, [], variante, codigo);
  const titulo = e.exemplos.find(x => x.codigo === codigo)?.titulo;

  async function copiar() {
    try { await navigator.clipboard.writeText(prompt); }
    catch {
      const t = document.createElement('textarea');
      t.value = prompt; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } finally { t.remove(); }
    }
    setCopiado(true);
    eventoProprio('Catalogo_Copiar', { estilo: e.id, codigo, variante: variante?.id ?? '' }, false);
  }

  return (
    <div className="cl-fundo" onClick={fechar}>
      <div className="cl-folha" role="dialog" aria-modal="true" aria-labelledby="cl-folha-titulo" onClick={ev => ev.stopPropagation()}>
        <div className="cl-alca" aria-hidden="true" />
        <div className="cl-folha-cabeca">
          <div>
            <span className="cl-rotulo">Usar estilo</span>
            <h2 id="cl-folha-titulo">{e.nome}</h2>
            <span className="cl-visor-conta"><span className="cl-codigo">{codigo}</span>{e.exemplos.length > 1 && titulo ? ` · ${titulo}` : ''}</span>
          </div>
          <button type="button" className="cl-fechar cl-fechar-claro" onClick={fechar} aria-label="Fechar" autoFocus><X /></button>
        </div>

        {e.variantes ? (
          <div className="cl-bloco">
            <p className="cl-rotulo">Tipo</p>
            <div className="cl-chips">
              {e.variantes.map(v => (
                <button key={v.id} type="button" className={`cl-chip ${variante?.id === v.id ? 'ativo' : ''}`} aria-pressed={variante?.id === v.id} onClick={() => { setVariante(v); setCopiado(false); }}>
                  {variante?.id === v.id && <Check aria-hidden="true" />}{v.nome}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="cl-bloco">
          <p className="cl-rotulo">Prompt</p>
          <div className="cl-prompt">{prompt}</div>
        </div>
        <button type="button" className={`cl-copiar ${copiado ? 'ok' : ''}`} onClick={copiar}>
          {copiado ? <><Check aria-hidden="true" /> Copiado</> : <><Copy aria-hidden="true" /> Copiar prompt</>}
        </button>
        <p className="cl-dica">{e.grupo === 'dark' ? 'Cole na sua IA com o Modo Editor e mande a narração junto (áudio ou texto).' : 'Cole na sua IA com o Modo Editor e mande o vídeo junto.'}</p>
        <p className="cl-nao-tem">Ainda não tem o Modo Editor? <a href={linkCompra} onClick={() => eventoProprio('Catalogo_Comprar', { estilo: e.id }, false)}>Conheça</a></p>
      </div>
    </div>
  );
}

export function Catalogo({ abrir }: { abrir?: string }) {
  const previa = usePrevia();
  const linkCompra = useLinkCompra();
  const lista = useMemo(() => estilos.filter(e => e.testado || previa), [previa]);
  const [busca, setBusca] = useState('');
  const [secao, setSecao] = useState<Estilo | null>(null);
  const [vendo, setVendo] = useState<{ e: Estilo; ex: Exemplo; n?: number } | null>(null);
  const [usando, setUsando] = useState<{ e: Estilo; codigo: string } | null>(null);

  // link de anúncio direto: /catalogo?estilo=motion-3d (a seção ou o vídeo) ou /catalogo?estilo=M3D-02 (aquele vídeo)
  useEffect(() => {
    if (!abrir) return;
    const pedido = abrir.toUpperCase();
    for (const e of lista) {
      const k = e.exemplos.findIndex(x => x.codigo === pedido);
      if (k >= 0 && e.exemplos[k]) { setVendo({ e, ex: e.exemplos[k], ...(e.exemplos.length > 1 ? { n: k + 1 } : {}) }); return; }
    }
    const e = lista.find(x => x.id === abrir);
    if (e?.temExemplo) setSecao(e);
  }, [abrir, lista]);

  const termo = busca.trim().toLowerCase();
  // 20/11: todos os estilos lado a lado, sem abas (ainda são poucos); a busca acha pelo nome ou pelo código
  const mostrados = lista.filter(e => !termo || e.nome.toLowerCase().includes(termo) || e.exemplos.some(x => x.codigo.toLowerCase().includes(termo)));
  // tocar no estilo SEMPRE abre a seção dele (todos os vídeos lado a lado), mesmo com um vídeo só
  const ver = (e: Estilo) => { if (!e.temExemplo) return; setSecao(e); eventoProprio('Catalogo_Ver', { estilo: e.id }, false); };
  const verVideo = (e: Estilo, ex: Exemplo, n: number) => { setVendo({ e, ex, n }); eventoProprio('Catalogo_Ver', { estilo: e.id, codigo: ex.codigo }, false); };
  const usar = (e: Estilo, codigo?: string) => {
    const c = codigo ?? e.exemplos[0]?.codigo ?? '';
    setVendo(null);
    setUsando({ e, codigo: c });
    eventoProprio('Catalogo_Usar', { estilo: e.id, codigo: c }, false);
  };
  // camadas abertas: seção > vídeo > prompt; o voltar fecha a de cima
  const camadas = (secao ? 1 : 0) + (vendo ? 1 : 0) + (usando ? 1 : 0);
  useCamadas(camadas, () => {
    if (usando) setUsando(null);
    else if (vendo) setVendo(null);
    else setSecao(null);
  });

  return (
    <div className="cl">
      <header className="cl-barra">
        <div className="cl-marca">
          {/* a logo oficial do Modo Editor (marca/modo-editor-logo-transparente-para-fundo-escuro.png, recortada) */}
          <img className="cl-logo" src="/img/marca/modo-editor-logo.webp" width={342} height={72} alt="Modo Editor" />
          <span className="cl-marca-nome">Catálogo de Estilos</span>
        </div>
      </header>

      {lista.length > 0 && <Banner lista={lista} />}

      <main className="cl-corpo">
        <div className="cl-titulo">
          <h2 className="cl-titulo-h">Estilos</h2>
          {lista.length > 0 && <span className="cl-conta">{lista.length}</span>}
        </div>
        <p className="cl-sub">Toque no estilo para ver todos os vídeos dele. Nos estilos <b>Dark</b> ninguém aparece: você manda só a narração.</p>

        <div className="cl-ferramentas">
          <label className="cl-busca">
            <Search aria-hidden="true" />
            <input type="search" value={busca} onChange={ev => setBusca(ev.target.value)} placeholder="Buscar estilo ou código" aria-label="Buscar estilo ou código" />
          </label>
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

      {secao && <Secao e={secao} voltar={() => setSecao(null)} ver={(ex, n) => verVideo(secao, ex, n)} usar={ex => usar(secao, ex.codigo)} />}
      {vendo && <Visualizador e={vendo.e} ex={vendo.ex} {...(vendo.n ? { n: vendo.n } : {})} fechar={() => setVendo(null)} usar={() => usar(vendo.e, vendo.ex.codigo)} />}
      {usando && <FolhaPrompt e={usando.e} codigo={usando.codigo} fechar={() => setUsando(null)} linkCompra={linkCompra} />}
    </div>
  );
}
