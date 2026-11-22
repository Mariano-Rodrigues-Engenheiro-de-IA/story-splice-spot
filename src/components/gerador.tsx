import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, Copy, ExternalLink, Film, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react';
import { arquivosEstilo, estilos, type Estilo } from '@/lib/estilos';
import {
  CAPRICHO, CHAMADA, COPIAR_REF, COR, DURACAO, ELEMENTOS, ESTADO_VAZIO, FLUXO, FORMATO, FUNDO, GANCHO, LEGENDAS,
  LEG_DEST, LEG_LETRAS, LEG_POS, LEG_TAM, ONDE, PALETAS, QUALIDADE, QUANTIDADE, RITMO, SFX, TRILHA, ZOOM,
  comEstilo, formatoDoLugar, montarPedido, padraoDo, paletaAtiva, type Estado, type Op, type Paleta,
} from '@/lib/gerador';
import { eventoProprio } from '@/lib/pixel';

/* Gerador de Pedido em camadas (21/11/2026). Abre por cima do catálogo, como uma camada (o voltar do celular fecha).
   As escolhas ficam salvas no navegador (rascunho); "Guardar como meu estilo" faz o Gerador abrir já preenchido.
   "Ver no meu vídeo": o vídeo da pessoa toca só no navegador (URL local), nada é enviado. */

const PASSOS = [
  { id: 'estilo', nome: 'Estilo', curto: 'Estilo' },
  { id: 'legenda', nome: 'Legenda', curto: 'Legenda' },
  { id: 'cores', nome: 'Cores', curto: 'Cores' },
  { id: 'elementos', nome: 'Elementos', curto: 'Elementos' },
  { id: 'roteiro', nome: 'Gancho, meio e fim', curto: 'Roteiro' },
  { id: 'som', nome: 'Som e entrega', curto: 'Som' },
  { id: 'pronto', nome: 'Pedido pronto', curto: 'Pedido' },
] as const;
const ULTIMO = PASSOS.length - 1;

const CHAVE_RASCUNHO = 'me-gerador-rascunho-v1';
const CHAVE_MEU = 'me-gerador-meu-estilo-v1';
/** o vídeo cru dele (sem legenda nem efeito): fundo das prévias de legenda e cor quando a pessoa não põe o dela */
const CRU = { video: '/videos/antes_estudio.mp4', capa: '/videos/antes_estudio.webp' };

function ler<T>(k: string): T | null { try { const s = window.localStorage.getItem(k); return s ? (JSON.parse(s) as T) : null; } catch { return null; } }
function gravar(k: string, v: unknown) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch { /* navegador sem armazenamento: segue sem salvar */ } }
function apagar(k: string) { try { window.localStorage.removeItem(k); } catch { /* idem */ } }

export async function copiarTexto(texto: string) {
  try { await navigator.clipboard.writeText(texto); }
  catch {
    const t = document.createElement('textarea');
    t.value = texto; document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); } finally { t.remove(); }
  }
}

const disponiveis = () => estilos.filter(e => e.temExemplo && e.testado);

function inicio(inicial: { estilo?: string; codigo?: string }): { estado: Estado; passo: number; doMeu: boolean } {
  const meu = ler<Estado>(CHAVE_MEU);
  if (inicial.estilo) {
    // veio do "Usar" de um estilo: o estilo já está escolhido; o resto vem do estilo guardado (se houver)
    const base = meu ? { ...ESTADO_VAZIO, ...meu } : ESTADO_VAZIO;
    return { estado: comEstilo(base, inicial.estilo, inicial.codigo), passo: 1, doMeu: !!meu };
  }
  const r = ler<{ estado: Estado; passo: number }>(CHAVE_RASCUNHO);
  if (r?.estado) return { estado: { ...ESTADO_VAZIO, ...r.estado }, passo: Math.min(Math.max(Number(r.passo) || 0, 0), ULTIMO), doMeu: false };
  if (meu) return { estado: { ...ESTADO_VAZIO, ...meu, estilo: null, codigo: null }, passo: 0, doMeu: true };
  return { estado: ESTADO_VAZIO, passo: 0, doMeu: false };
}

/* ---------- o vídeo da pessoa (só no navegador) ---------- */
type MeuVideo = { url: string; quadro: string | null };

function capturarQuadro(url: string): Promise<string> {
  return new Promise((ok, erro) => {
    const v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = url;
    const limite = window.setTimeout(() => erro(new Error('tempo')), 8000);
    v.addEventListener('loadedmetadata', () => { v.currentTime = Math.min(1, (v.duration || 3) / 3); }, { once: true });
    v.addEventListener('seeked', () => {
      window.clearTimeout(limite);
      const W = 270, H = 480;
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d');
      if (!g || !v.videoWidth) { erro(new Error('quadro')); return; }
      const k = Math.max(W / v.videoWidth, H / v.videoHeight);
      g.drawImage(v, (W - v.videoWidth * k) / 2, (H - v.videoHeight * k) / 2, v.videoWidth * k, v.videoHeight * k);
      try { ok(c.toDataURL('image/jpeg', 0.8)); } catch (x) { erro(x); }
    }, { once: true });
    v.addEventListener('error', () => { window.clearTimeout(limite); erro(new Error('video')); }, { once: true });
  });
}

function useMeuVideo() {
  const [meu, setMeu] = useState<MeuVideo | null>(null);
  const url = meu?.url;
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  async function escolher(f: File) {
    const u = URL.createObjectURL(f);
    setMeu({ url: u, quadro: null });
    eventoProprio('Gerador_MeuVideo', {}, true);
    const quadro = await capturarQuadro(u).catch(() => null);
    setMeu(cur => (cur && cur.url === u ? { url: u, quadro } : cur));
  }
  return { meu, escolher, tirar: () => setMeu(null) };
}

/* ---------- prévias: legenda e cores ---------- */
const FRASE = ['Isso', 'aqui', 'muda', 'o', 'jeito', 'que', 'você', 'posta'];
const FORTE: Record<number, string> = { 2: '🔥', 7: '✅' };

function useTique(ms = 430) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setT(2); return; }
    const id = window.setInterval(() => setT(x => x + 1), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return t;
}

const claro = (hex: string) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 > 160;
};

/** A legenda escolhida desenhada por cima do vídeo (t = o tique: qual palavra está sendo falada). */
function LegendaDemo({ e, p, t }: { e: Estado; p: Paleta; t: number }) {
  const tipo = e.legenda;
  if (tipo === 'sem' || tipo === 'exemplo') return null;
  const i = t % (FRASE.length + 2); // duas batidas paradas no fim da frase
  const atual = Math.min(i, FRASE.length - 1);
  const letras = (w: string) => (e.legLetras === 'maiusculas' || tipo === 'impacto' ? w.toUpperCase() : e.legLetras === 'minusculas' ? w.toLowerCase() : w);
  const tam = e.legTam === 'grande' ? 1.25 : e.legTam === 'discreto' ? 0.8 : 1;
  const grupo = tipo === 'impacto' ? 2 : tipo === 'palavra' ? 3 : 4;
  const ini = Math.floor(atual / grupo) * grupo;
  const palavras = FRASE.slice(ini, ini + grupo).map((w, k) => ({ w, n: ini + k }));
  const palavra = ({ w, n }: { w: string; n: number }) => {
    const forte = n in FORTE && e.legDest !== 'nenhum';
    const falada = n <= atual;
    const estiloPalavra: CSSProperties = {};
    // na faixa (que já é da cor de destaque) a palavra forte usa a cor de fundo da paleta, senão some
    if (forte && e.legDest === 'cor') estiloPalavra.color = tipo === 'caixa' ? p.fundo : p.destaque;
    if (forte && e.legDest === 'maior') estiloPalavra.fontSize = '1.3em';
    if (tipo === 'palavra' && n === atual && !(forte && e.legDest === 'cor')) estiloPalavra.color = p.destaque;
    if (tipo === 'palavra' && !falada) estiloPalavra.opacity = 0;
    return (
      <span key={n} className={`gp-leg-p ${tipo === 'palavra' && n === atual ? 'agora' : ''}`} style={estiloPalavra}>
        {letras(w)}{forte && e.legDest === 'emoji' ? ` ${FORTE[n]}` : ''}
      </span>
    );
  };
  const caixa = tipo === 'caixa' ? { background: p.destaque, color: claro(p.destaque) ? '#111' : '#fff' } : undefined;
  return (
    <div className={`gp-leg gp-leg-${tipo} gp-pos-${e.legPos}`} style={{ '--tam': tam } as CSSProperties} aria-hidden="true">
      <span className="gp-leg-linha" style={caixa}>{palavras.map(palavra)}</span>
    </div>
  );
}

/** Um título na paleta escolhida (o que a IA vai usar em textos e painéis). */
function TituloDemo({ p }: { p: Paleta }) {
  return (
    <div className="gp-titulo" style={{ background: p.fundo, color: p.texto }} aria-hidden="true">
      <span><b style={{ color: p.destaque }}>3 erros</b> que travam o seu vídeo</span>
      <i style={{ background: p.apoio }} />
    </div>
  );
}

function exemploDe(e: Estado) {
  const est = estilos.find(x => x.id === e.estilo);
  return { est, ex: est?.exemplos.find(x => x.codigo === e.codigo) ?? est?.exemplos[0] };
}

/** O palco: o vídeo (o da pessoa, o cru dele ou o exemplo do estilo) com a legenda e a paleta escolhidas por cima. */
function Palco({ e, meu, titulo }: { e: Estado; meu: MeuVideo | null; titulo: boolean }) {
  const t = useTique();
  const p = paletaAtiva(e);
  const { est, ex } = exemploDe(e);
  const dark = est?.grupo === 'dark';
  const doExemplo = e.legenda === 'exemplo' && !!ex && !meu;
  let fundo: ReactNode;
  let rotulo = 'Prévia';
  if (meu) { fundo = <video key={meu.url} src={meu.url} autoPlay muted loop playsInline />; rotulo = 'Seu vídeo'; }
  else if (ex && (doExemplo || dark)) {
    const a = arquivosEstilo(ex.id);
    fundo = <video key={a.loop} className={doExemplo ? '' : 'gp-apaga'} src={a.loop} poster={a.capa} autoPlay muted loop playsInline />;
    if (doExemplo) rotulo = `Exemplo ${ex.codigo}`;
  } else fundo = <video src={CRU.video} poster={CRU.capa} autoPlay muted loop playsInline />;
  return (
    <div className={`gp-palco ${e.formato === '16:9' ? 'gp-palco-h' : ''}`}>
      {fundo}
      {titulo && e.paleta !== 'exemplo' && <TituloDemo p={p} />}
      {!doExemplo && <LegendaDemo e={e} p={p} t={t} />}
      <span className="gp-palco-rotulo">{rotulo}</span>
    </div>
  );
}

/** Miniatura parada (cartões de opção): a foto de fundo e o que estiver por cima. */
function Mini({ fundo, apaga, children }: { fundo: string; apaga?: boolean; children?: ReactNode }) {
  return (
    <span className="gp-mini">
      <img src={fundo} alt="" loading="lazy" decoding="async" className={apaga ? 'gp-apaga' : ''} />
      {children}
    </span>
  );
}

/* ---------- peças de formulário ---------- */
function Grupo({ rotulo, nota, ops, valor, mudar, varios }: { rotulo: string; nota?: string; ops: Op[]; valor: string | string[]; mudar: (id: string) => void; varios?: boolean }) {
  const ativo = (id: string) => (Array.isArray(valor) ? valor.includes(id) : valor === id);
  return (
    <fieldset className="gp-grupo">
      <legend className="cl-rotulo">{rotulo}{varios && <span> · marque quantos quiser</span>}</legend>
      {nota && <p className="gp-nota">{nota}</p>}
      <div className="gp-chips">
        {ops.map(o => (
          <button key={o.id} type="button" className={`gp-chip ${ativo(o.id) ? 'ativo' : ''}`} aria-pressed={ativo(o.id)} onClick={() => mudar(o.id)}>
            {ativo(o.id) && <Check aria-hidden="true" />}
            <span>{o.nome}{o.det && <small>{o.det}</small>}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Campo({ rotulo, valor, mudar, dica, area }: { rotulo: string; valor: string; mudar: (v: string) => void; dica?: string; area?: boolean }) {
  return (
    <label className="gp-campo">
      <span className="cl-rotulo">{rotulo}</span>
      {area
        ? <textarea value={valor} onChange={ev => mudar(ev.target.value)} placeholder={dica} rows={3} />
        : <input type="text" value={valor} onChange={ev => mudar(ev.target.value)} placeholder={dica} />}
    </label>
  );
}

/* ---------- o Gerador ---------- */
export function Gerador({ inicial, fechar, linkCompra }: { inicial: { estilo?: string; codigo?: string }; fechar: () => void; linkCompra: string }) {
  const [comeco] = useState(() => inicio(inicial));
  const [e, setE] = useState<Estado>(comeco.estado);
  const [passo, setPasso] = useState(comeco.passo);
  const [doMeu, setDoMeu] = useState(comeco.doMeu);
  const [copiado, setCopiado] = useState(false);
  const [aviso, setAviso] = useState('');
  const { meu, escolher, tirar } = useMeuVideo();
  const rolagem = useRef<HTMLDivElement>(null);
  const arquivo = useRef<HTMLInputElement>(null);

  const pedido = useMemo(() => montarPedido(e), [e]);
  const lista = useMemo(disponiveis, []);
  const { est, ex } = exemploDe(e);
  const dark = est?.grupo === 'dark';
  const meuV = dark ? null : meu; // no Dark o vídeo da pessoa não entra nas prévias
  const p = paletaAtiva(e);
  const capaEx = ex ? arquivosEstilo(ex.id).capa : null;
  // no Dark ninguém aparece: as miniaturas usam a capa do próprio estilo (apagada), nunca uma pessoa
  const fundoMini = meuV?.quadro ?? (dark && capaEx ? capaEx : CRU.capa);

  useEffect(() => { eventoProprio('Gerador_Abrir', { estilo: inicial.estilo ?? '' }, false); }, [inicial.estilo]);
  useEffect(() => { gravar(CHAVE_RASCUNHO, { estado: e, passo }); setCopiado(false); }, [e, passo]);
  useEffect(() => { rolagem.current?.scrollTo({ top: 0 }); }, [passo]);
  useEffect(() => { if (!aviso) return; const id = window.setTimeout(() => setAviso(''), 2600); return () => window.clearTimeout(id); }, [aviso]);

  const muda = <K extends keyof Estado>(k: K, v: Estado[K]) => setE(x => ({ ...x, [k]: v }));
  const alterna = (k: 'elementos' | 'copiar', id: string) => setE(x => {
    const atual = x[k];
    if (k === 'copiar' && id === 'tudo') return { ...x, copiar: atual.includes('tudo') ? [] : ['tudo'] };
    const sem = atual.filter(v => v !== id && v !== 'tudo');
    return { ...x, [k]: atual.includes(id) ? sem : [...sem, id] };
  });
  const escolherEstilo = (id: string, codigo?: string) => setE(x => comEstilo(x, id, codigo));

  async function copiar() {
    await copiarTexto(pedido);
    setCopiado(true);
    eventoProprio('Gerador_Copiar', { estilo: e.estilo ?? '', codigo: e.codigo ?? '' }, false);
  }
  function guardar() {
    // o "meu estilo" guarda só o gosto (legenda, cores, som, entrega...); o que é daquele vídeo fica de fora
    const { estilo: _estilo, codigo: _codigo, assunto: _assunto, publico: _publico, ganchoFrase: _gf, meio: _meio, momentos: _momentos, chamadaTexto: _ct, links: _links, copiar: _copiar, obs: _obs, elementos: _el, ...gosto } = e;
    gravar(CHAVE_MEU, gosto);
    setDoMeu(true);
    setAviso('Guardado: da próxima vez o Gerador já abre com as suas escolhas.');
  }
  function zerar() {
    setE(ESTADO_VAZIO);
    setPasso(0);
    apagar(CHAVE_RASCUNHO);
    setAviso('Pedido zerado.');
  }
  function esquecer() {
    apagar(CHAVE_MEU);
    setDoMeu(false);
    setAviso('Estilo guardado apagado.');
  }

  const podeSeguir = passo !== 0 || !!e.estilo;
  const temPalco = passo === 1 || passo === 2;

  return (
    <div className="gp" role="dialog" aria-modal="true" aria-labelledby="gp-titulo">
      <header className="gp-barra">
        <button type="button" className="cl-voltar" onClick={fechar} autoFocus><X aria-hidden="true" /> Fechar</button>
        <div className="gp-barra-titulo">
          <h2 id="gp-titulo">Pedido detalhado</h2>
          {est && <span className="gp-barra-estilo">{est.nome}{e.codigo ? ` · ${e.codigo}` : ''}</span>}
        </div>
        {/* no Dark não tem pessoa no vídeo: o botão some */}
        {!dark && (
          <button type="button" className={`gp-meu ${meu ? 'ativo' : ''}`} onClick={() => (meu ? tirar() : arquivo.current?.click())}>
            <Film aria-hidden="true" />
            <span className="gp-meu-longo">{meu ? 'Tirar meu vídeo' : 'Ver no meu vídeo'}</span>
            <span className="gp-meu-curto">{meu ? 'Tirar vídeo' : 'Meu vídeo'}</span>
          </button>
        )}
        <input ref={arquivo} type="file" accept="video/*" hidden onChange={ev => { const f = ev.target.files?.[0]; if (f) void escolher(f); ev.target.value = ''; }} />
      </header>

      <nav className="gp-passos" aria-label="Camadas do pedido">
        {PASSOS.map((s, k) => (
          <button key={s.id} type="button" className={`gp-passo ${k === passo ? 'agora' : ''} ${k < passo ? 'feito' : ''}`} aria-current={k === passo ? 'step' : undefined}
            onClick={() => { if (k === 0 || e.estilo) setPasso(k); }} disabled={k > 0 && !e.estilo}>
            <span className="gp-passo-n">{k < passo ? <Check aria-hidden="true" /> : k === ULTIMO ? '✓' : k + 1}</span>{s.nome}
          </button>
        ))}
      </nav>

      <div className="gp-miolo" ref={rolagem}>
        <section className="gp-conteudo" aria-live="polite">
          {passo === 0 && (
            <>
              <h3 className="gp-h">Qual estilo você quer?</h3>
              <p className="gp-sub">É a base do vídeo. Nas próximas camadas você ajusta a legenda, as cores, o que aparece na tela e o som.{doMeu ? ' As suas escolhas guardadas já estão marcadas.' : ''}</p>
              <div className="gp-estilos">
                {lista.map((s: Estilo) => {
                  const capa = arquivosEstilo(s.exemplos[0]?.id ?? s.id).capa;
                  const ativo = e.estilo === s.id;
                  return (
                    <button key={s.id} type="button" className={`gp-estilo ${ativo ? 'ativo' : ''}`} aria-pressed={ativo} onClick={() => escolherEstilo(s.id)}>
                      <img src={capa} alt="" loading="lazy" decoding="async" />
                      <span className="gp-estilo-nome">{s.nome}</span>
                      {s.grupo === 'dark' && <span className="cl-dark">Dark</span>}
                      {ativo && <span className="gp-marca"><Check aria-hidden="true" /></span>}
                    </button>
                  );
                })}
                <button type="button" className={`gp-estilo gp-estilo-livre ${e.estilo === 'livre' ? 'ativo' : ''}`} aria-pressed={e.estilo === 'livre'} onClick={() => escolherEstilo('livre')}>
                  <span className="gp-estilo-nome">Do meu jeito</span>
                  <small>sem estilo do catálogo: você monta tudo nas camadas</small>
                  {e.estilo === 'livre' && <span className="gp-marca"><Check aria-hidden="true" /></span>}
                </button>
              </div>
              {est && est.exemplos.length > 1 && (
                <Grupo rotulo="Qual vídeo seguir" nota="Cada vídeo tem um código: a IA faz igual ao que você escolher."
                  ops={est.exemplos.map(x => ({ id: x.codigo, nome: x.codigo, det: x.titulo }))}
                  valor={e.codigo ?? ''} mudar={c => muda('codigo', c)} />
              )}
              {dark && <p className="gp-nota gp-nota-caixa">Estilo Dark: ninguém aparece. Você manda a narração (áudio ou texto) junto com o pedido.</p>}
            </>
          )}

          {passo === 1 && (
            <>
              <h3 className="gp-h">Como vai ser a legenda?</h3>
              <p className="gp-sub">Toque numa opção e veja no vídeo.{meu || dark ? '' : ' Quer ver no seu? Toque em "Ver no meu vídeo", lá em cima.'}</p>
              <div className="gp-palco-celular"><Palco e={e} meu={meuV} titulo={false} /></div>
              <div className="gp-cartoes">
                {LEGENDAS.filter(o => o.id !== 'exemplo' || est).map(o => {
                  const ativo = e.legenda === o.id;
                  return (
                    <button key={o.id} type="button" className={`gp-cartao ${ativo ? 'ativo' : ''}`} aria-pressed={ativo} onClick={() => muda('legenda', o.id)}>
                      <Mini fundo={o.id === 'exemplo' && capaEx ? capaEx : fundoMini} apaga={dark && o.id !== 'exemplo' && !meuV}>
                        <LegendaDemo e={{ ...e, legenda: o.id }} p={p} t={2} />
                      </Mini>
                      <span className="gp-cartao-nome">{o.nome}</span>
                      {o.det && <small>{o.det}</small>}
                      {ativo && <span className="gp-marca"><Check aria-hidden="true" /></span>}
                    </button>
                  );
                })}
              </div>
              {e.legenda !== 'sem' && e.legenda !== 'exemplo' && (
                <>
                  <Grupo rotulo="Posição" ops={LEG_POS} valor={e.legPos} mudar={v => muda('legPos', v)} />
                  <Grupo rotulo="Tamanho" ops={LEG_TAM} valor={e.legTam} mudar={v => muda('legTam', v)} />
                  <Grupo rotulo="Destaque das palavras importantes" ops={LEG_DEST} valor={e.legDest} mudar={v => muda('legDest', v)} />
                  <Grupo rotulo="Letras" ops={LEG_LETRAS} valor={e.legLetras} mudar={v => muda('legLetras', v)} />
                </>
              )}
            </>
          )}

          {passo === 2 && (
            <>
              <h3 className="gp-h">Quais cores?</h3>
              <p className="gp-sub">A paleta vale para os textos, a legenda e os elementos. A cor da sua imagem nunca muda.</p>
              <div className="gp-palco-celular"><Palco e={e} meu={meuV} titulo /></div>
              <div className="gp-cartoes">
                {est && (
                  <button type="button" className={`gp-cartao ${e.paleta === 'exemplo' ? 'ativo' : ''}`} aria-pressed={e.paleta === 'exemplo'} onClick={() => muda('paleta', 'exemplo')}>
                    <Mini fundo={capaEx ?? fundoMini} />
                    <span className="gp-cartao-nome">Como no exemplo</span>
                    <small>as cores do vídeo do estilo</small>
                    {e.paleta === 'exemplo' && <span className="gp-marca"><Check aria-hidden="true" /></span>}
                  </button>
                )}
                {PALETAS.map(q => {
                  const ativo = e.paleta === q.id;
                  return (
                    <button key={q.id} type="button" className={`gp-cartao ${ativo ? 'ativo' : ''}`} aria-pressed={ativo} onClick={() => muda('paleta', q.id)}>
                      <Mini fundo={fundoMini} apaga={dark && !meuV}><TituloDemo p={q} /></Mini>
                      <span className="gp-cartao-nome">{q.nome}</span>
                      <span className="gp-amostras" aria-hidden="true">{[q.fundo, q.texto, q.destaque, q.apoio].map((c, k) => <i key={k} style={{ background: c }} />)}</span>
                      {ativo && <span className="gp-marca"><Check aria-hidden="true" /></span>}
                    </button>
                  );
                })}
                <div className={`gp-cartao gp-cartao-marca ${e.paleta === 'marca' ? 'ativo' : ''}`}>
                  <button type="button" className="gp-cartao-cobre" aria-pressed={e.paleta === 'marca'} onClick={() => muda('paleta', 'marca')} aria-label="Usar a cor da minha marca" />
                  <Mini fundo={fundoMini} apaga={dark && !meuV}><TituloDemo p={paletaAtiva({ ...e, paleta: 'marca' })} /></Mini>
                  <span className="gp-cartao-nome">Da minha marca</span>
                  <label className="gp-cor">
                    <input type="color" value={e.marca} onChange={ev => setE(x => ({ ...x, marca: ev.target.value, paleta: 'marca' }))} aria-label="Cor da minha marca" />
                    <span>{e.marca.toUpperCase()}</span>
                  </label>
                  {e.paleta === 'marca' && <span className="gp-marca"><Check aria-hidden="true" /></span>}
                </div>
              </div>
            </>
          )}

          {passo === 3 && (
            <>
              <h3 className="gp-h">O que aparece na tela?</h3>
              {est && padraoDo(est.id) ? <p className="gp-nota gp-nota-caixa">O estilo {est.nome} já traz {padraoDo(est.id)!.jaVem}. Aqui você escolhe o que mais pode entrar.</p>
                : <p className="gp-sub">Marque o que pode entrar no vídeo. O que você não marcar, não entra.</p>}
              <Grupo rotulo="Elementos" ops={ELEMENTOS} valor={e.elementos} mudar={id => alterna('elementos', id)} varios />
              <Grupo rotulo="Quanta coisa na tela" ops={QUANTIDADE} valor={e.quantidade} mudar={v => muda('quantidade', v)} />
              <div className="gp-fora">
                <h4>Trazer de fora</h4>
                <p className="gp-nota">Viu um efeito ou um vídeo que quer igual? Cole o link aqui. A IA analisa e diz o que consegue fazer.</p>
                <Campo rotulo="Links (um por linha)" area valor={e.links} mudar={v => muda('links', v)} dica="https://prompt-motion.com/...  ou o link de um Reels" />
                {e.links.trim() && <Grupo rotulo="O que copiar dele" ops={COPIAR_REF} valor={e.copiar} mudar={id => alterna('copiar', id)} varios />}
                <div className="gp-links">
                  <a href="https://prompt-motion.com/" target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden="true" /> Motions prontos: Prompt Motion (grátis)</a>
                  <a href="https://www.sortfeed.com/" target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden="true" /> Baixar e transcrever Reels: Sort Feed (grátis)</a>
                </div>
              </div>
            </>
          )}

          {passo === 4 && (
            <>
              <h3 className="gp-h">Gancho, meio e fim</h3>
              <p className="gp-sub">Pense no vídeo do começo ao fim: como ele prende, o que precisa aparecer no meio e para onde ele leva a pessoa.</p>
              <div className="gp-duas">
                <Campo rotulo="Assunto, em uma frase" valor={e.assunto} mudar={v => muda('assunto', v)} dica="ex.: 3 erros que travam o seu treino em casa" />
                <Campo rotulo="Para quem é" valor={e.publico} mudar={v => muda('publico', v)} dica="ex.: mulheres de 30 a 45 que treinam em casa" />
              </div>
              <Grupo rotulo="Gancho: como o vídeo começa" ops={GANCHO} valor={e.gancho} mudar={v => muda('gancho', v)} />
              {e.gancho === 'frase' && <Campo rotulo="A frase do começo" valor={e.ganchoFrase} mudar={v => muda('ganchoFrase', v)} dica="escreva do jeito que você falou" />}
              <label className="gp-marcar">
                <input type="checkbox" checked={e.ganchoTela} onChange={ev => muda('ganchoTela', ev.target.checked)} />
                <span>A frase do gancho escrita grande na tela</span>
              </label>
              <Campo rotulo="No meio: o que precisa aparecer" area valor={e.meio} mudar={v => muda('meio', v)} dica="ex.: quando eu falar dos 3 erros, uma lista com os 3 aparecendo um por um" />
              <div className="gp-momentos">
                <span className="cl-rotulo">Momentos certos <span>· opcional</span></span>
                {e.momentos.map((m, k) => (
                  <div key={k} className="gp-momento">
                    <input type="text" value={m.fala} placeholder="Quando eu falo…" aria-label={`Momento ${k + 1}: a frase`}
                      onChange={ev => setE(x => ({ ...x, momentos: x.momentos.map((y, j) => (j === k ? { ...y, fala: ev.target.value } : y)) }))} />
                    <input type="text" value={m.quero} placeholder="…aparece isto" aria-label={`Momento ${k + 1}: o que aparece`}
                      onChange={ev => setE(x => ({ ...x, momentos: x.momentos.map((y, j) => (j === k ? { ...y, quero: ev.target.value } : y)) }))} />
                    <button type="button" className="gp-tirar" onClick={() => setE(x => ({ ...x, momentos: x.momentos.filter((_, j) => j !== k) }))} aria-label={`Tirar o momento ${k + 1}`}><Trash2 aria-hidden="true" /></button>
                  </div>
                ))}
                {e.momentos.length < 12 && (
                  <button type="button" className="gp-mais" onClick={() => setE(x => ({ ...x, momentos: [...x.momentos, { fala: '', quero: '' }] }))}><Plus aria-hidden="true" /> Adicionar um momento</button>
                )}
              </div>
              <Grupo rotulo="Final: para onde o vídeo leva" ops={CHAMADA} valor={e.chamada} mudar={v => muda('chamada', v)} />
              {e.chamada !== 'nenhuma' && (
                <Campo rotulo={e.chamada === 'comentar' ? 'Qual palavra?' : 'A frase da chamada (opcional)'} valor={e.chamadaTexto} mudar={v => muda('chamadaTexto', v)}
                  dica={e.chamada === 'comentar' ? 'ex.: EDITAR' : 'ex.: me chama no WhatsApp que eu te ajudo'} />
              )}
              <Grupo rotulo="Ritmo dos cortes" ops={RITMO} valor={e.ritmo} mudar={v => muda('ritmo', v)} />
              <Grupo rotulo="Duração final" ops={DURACAO} valor={e.duracao} mudar={v => muda('duracao', v)} />
            </>
          )}

          {passo === 5 && (
            <>
              <h3 className="gp-h">Som e entrega</h3>
              <Grupo rotulo="Trilha" nota="Fica sempre baixa e abaixa sozinha quando você fala." ops={TRILHA} valor={e.trilha} mudar={v => muda('trilha', v)} />
              <Grupo rotulo="Efeitos sonoros" ops={SFX} valor={e.sfx} mudar={v => muda('sfx', v)} />
              <Grupo rotulo="Onde vai ser postado" ops={ONDE} valor={e.onde} mudar={v => setE(x => ({ ...x, onde: v, formato: formatoDoLugar(v) }))} />
              <Grupo rotulo="Formato" ops={FORMATO} valor={e.formato} mudar={v => muda('formato', v)} />
              <Grupo rotulo="Capricho" ops={CAPRICHO} valor={e.capricho} mudar={v => muda('capricho', v)} />
              <Grupo rotulo="Qualidade final" ops={QUALIDADE} valor={e.qualidade} mudar={v => muda('qualidade', v)} />
              <Grupo rotulo="Como você quer acompanhar" ops={FLUXO} valor={e.fluxo} mudar={v => muda('fluxo', v)} />
              <details className="gp-detalhes">
                <summary>Mais opções</summary>
                {!dark && <Grupo rotulo="Zoom" ops={ZOOM} valor={e.zoom} mudar={v => muda('zoom', v)} />}
                {!dark && <Grupo rotulo="Fundo" ops={FUNDO} valor={e.fundo} mudar={v => muda('fundo', v)} />}
                <Grupo rotulo="Cor do vídeo" ops={COR} valor={e.cor} mudar={v => muda('cor', v)} />
                <Campo rotulo="O que não pode" area valor={e.naoPode} mudar={v => muda('naoPode', v)} dica="ex.: não cortar a parte do preço, não cobrir o meu rosto" />
                <Campo rotulo="Observações, do seu jeito" area valor={e.obs} mudar={v => muda('obs', v)} dica="explique como você imagina o vídeo" />
              </details>
            </>
          )}

          {passo === ULTIMO && (
            <>
              <h3 className="gp-h">Seu pedido está pronto</h3>
              <p className="gp-sub">Copie, cole na sua IA com o Modo Editor e mande {dark ? 'a narração' : 'o vídeo'} junto.</p>
              <pre className="gp-pedido gp-pedido-cheio">{pedido}</pre>
              {/* o "Copiar pedido" fica no rodapé (sempre à vista) */}
              <div className="gp-acoes">
                <button type="button" className="gp-acao" onClick={guardar}><Save aria-hidden="true" /> Guardar como meu estilo</button>
                <button type="button" className="gp-acao" onClick={zerar}><RotateCcw aria-hidden="true" /> Começar do zero</button>
              </div>
              {doMeu && <button type="button" className="gp-esquecer" onClick={esquecer}>Apagar o estilo guardado</button>}
              <p className="cl-nao-tem">Ainda não tem o Modo Editor? <a href={linkCompra} onClick={() => eventoProprio('Catalogo_Comprar', { origem: 'gerador' }, false)}>Conheça</a></p>
            </>
          )}
        </section>

        <aside className="gp-lado" aria-label="Prévia e pedido">
          {temPalco || passo === 3 ? <Palco e={e} meu={meuV} titulo={passo !== 1} /> : null}
          {passo !== ULTIMO && (
            <div className="gp-lado-pedido">
              <div className="gp-lado-cabeca"><span>pedido.txt</span><button type="button" onClick={copiar}>{copiado ? 'Copiado' : 'Copiar'}</button></div>
              <pre className="gp-pedido">{e.estilo ? pedido : 'Escolha o estilo para começar.'}</pre>
            </div>
          )}
        </aside>
      </div>

      <footer className="gp-pe">
        {passo > 0
          ? <button type="button" className="gp-anterior" onClick={() => setPasso(passo - 1)}><ArrowLeft aria-hidden="true" /> Voltar</button>
          : <span />}
        {passo < ULTIMO
          ? <button type="button" className="gp-proximo" disabled={!podeSeguir} onClick={() => setPasso(passo + 1)}>
              {passo === ULTIMO - 1 ? 'Ver o pedido' : `Próximo: ${PASSOS[passo + 1]!.curto}`} <ArrowRight aria-hidden="true" />
            </button>
          : <button type="button" className={`gp-proximo ${copiado ? 'ok' : ''}`} onClick={copiar}>{copiado ? <><Check aria-hidden="true" /> Copiado</> : <><Copy aria-hidden="true" /> Copiar pedido</>}</button>}
      </footer>
      {aviso && <div className="gp-aviso" role="status">{aviso}</div>}
    </div>
  );
}
