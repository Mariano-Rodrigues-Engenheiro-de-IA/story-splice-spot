import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { ArrowLeft, ArrowRight, AudioLines, Check, Copy, ExternalLink, Link2, Play, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import {
  CAMERAS, DURACAO, EFEITOS, ESTILOS, FORMATOS, FRASES, GRUPOS_SFX, LEGENDAS, PROMPT_REFERENCIA, SFX, TRECHO_DESTAQUES, TRECHO_PALAVRAS, TRILHAS, VOZ,
  agendaMotions, audioSfx, audioTrilha, efeito, escalaCamera, exemploFormato, imgEfeito, montarPedidoZero, videoBase, videoMotion,
  type Escolhas, type EstiloFx,
} from '@/lib/criar';
import { LegendaModelo } from '@/components/legendas-modelos';
import { EfeitoModelo } from '@/components/efeitos-modelos';
import { mesa } from '@/lib/mesa-som';
import { eventoProprio } from '@/lib/pixel';

/* "Criar meu vídeo" (21-22/11/2026, desenho dele): separado do catálogo. Porta 1 = "Tenho uma referência" (prompt);
   porta 2 = "Criar do zero": o trecho cru de 10 s dele vai sendo construído camada por camada (formato -> legenda ->
   câmera -> estilo do efeito -> efeitos -> som), sempre à vista. TODO clique muda o vídeo na hora: o estilo clicado
   entra no vídeo, o efeito marcado aparece sozinho e depois junto com os outros, a trilha troca no mesmo instante e
   cada efeito sonoro toca no toque. Dados e códigos em src/lib/criar.ts. */

const PASSOS = [
  { id: 'formato', nome: 'Formato' },
  { id: 'legenda', nome: 'Legenda' },
  { id: 'camera', nome: 'Câmera' },
  { id: 'estilo', nome: 'Estilo do efeito' },
  { id: 'efeitos', nome: 'Efeitos' },
  { id: 'som', nome: 'Som' },
  { id: 'pedido', nome: 'Pedido' },
] as const;
type IdPasso = (typeof PASSOS)[number]['id'];
const ULTIMO = PASSOS.length - 1;
const CHAVE = 'me-criar-v2';
const PADRAO: Escolhas = { formato: 'FMT-02', legenda: 'LEG-01', cor: '#8B5CF6', camera: 'CAM-00', estilos: [], motions: [], corFx: '#8B5CF6', trilha: 'SOM-00', sfx: [] };
/** a altura da legenda no palco, pelo formato (na skill ela acha o queixo sozinha) */
const ALTURA_LEG: Record<string, number> = { cheia: 0.7, cartao: 0.86, dividida: 0.84, narracao: 0.72 };
const COR = /^#[0-9a-f]{6}$/i;
/** onde fica o rosto dentro do recorte de cada formato: o zoom da câmera gira em volta dele (como o camera.py) */
const ROSTO: Record<string, string> = { cheia: '47% 42%', cartao: '47% 19%', dividida: '47% 32%' };

function ler(): Escolhas {
  try {
    const s = window.localStorage.getItem(CHAVE);
    const v = s ? (JSON.parse(s) as Partial<Escolhas>) : {};
    const lista = (x: unknown, ok: (c: string) => boolean) => (Array.isArray(x) ? (x as unknown[]).filter((c): c is string => typeof c === 'string' && ok(c)) : []);
    return {
      formato: FORMATOS.some(f => f.codigo === v.formato) ? v.formato! : PADRAO.formato,
      legenda: LEGENDAS.some(l => l.codigo === v.legenda) ? v.legenda! : PADRAO.legenda,
      cor: COR.test(v.cor ?? '') ? v.cor! : PADRAO.cor,
      camera: CAMERAS.some(c => c.codigo === v.camera) ? v.camera! : PADRAO.camera,
      estilos: lista(v.estilos, c => ESTILOS.some(x => x.id === c)),
      motions: lista(v.motions, c => !!efeito(c)),
      corFx: COR.test(v.corFx ?? '') ? v.corFx! : PADRAO.corFx,
      trilha: TRILHAS.some(x => x.codigo === v.trilha) ? v.trilha! : PADRAO.trilha,
      sfx: lista(v.sfx, c => SFX.some(x => x.id === c)),
    };
  } catch { return PADRAO; }
}
function gravar(e: Escolhas) { try { window.localStorage.setItem(CHAVE, JSON.stringify(e)); } catch { /* sem armazenamento: segue */ } }

async function copiarTexto(texto: string) {
  try { await navigator.clipboard.writeText(texto); }
  catch {
    const t = document.createElement('textarea');
    t.value = texto; document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); } finally { t.remove(); }
  }
}

/** Telas uma por cima da outra (criar do zero > folha da referência): o VOLTAR do celular fecha só a de cima, em vez
    de sair da página (uma entrada no histórico por tela; o mesmo controle do catálogo). */
function useTelas(n: number, fecharTopo: () => void) {
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
    window.addEventListener('popstate', voltar);
    return () => window.removeEventListener('popstate', voltar);
  }, []);
  useEffect(() => {
    while (empilhadas.current < n) {
      window.history.pushState({ ...window.history.state, czTela: true }, '');
      empilhadas.current++;
    }
    if (empilhadas.current > n) {
      // fechou pelo botão: tira do histórico as entradas dessas telas
      const k = empilhadas.current - n;
      empilhadas.current = n;
      ignorar.current++;
      window.history.go(-k);
    }
  }, [n]);
}

/** Relógio dos exemplos: todos andam juntos (o mesmo ponto da fala), em volta dos 10,3 s do trecho. Parado (num quadro
    com tudo na tela) enquanto o cartão está fora da tela, para a página não pesar. */
const T0 = typeof performance === 'undefined' ? 0 : performance.now();
function useRelogio(ativo = true, fps = 20, parado = 8.6) {
  const [t, setT] = useState(parado);
  useEffect(() => {
    if (!ativo) return;
    const tic = () => setT(((performance.now() - T0) / 1000) % DURACAO);
    tic();
    const id = window.setInterval(tic, 1000 / fps);
    return () => window.clearInterval(id);
  }, [ativo, fps]);
  return ativo ? t : parado;
}
function useVisivel<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([x]) => setVis(!!x?.isIntersecting), { rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, vis];
}

/** Vídeo curto sem som que só toca enquanto está na tela (os exemplos dos cartões). */
function VideoLoop({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const io = new IntersectionObserver(([x]) => { if (x?.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.3 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} className="cz-loop" src={src} poster={poster} muted playsInline loop preload="none" aria-hidden="true" />;
}

/** Os efeitos ao vivo (FX) de uma lista, um depois do outro no tempo t, com uma passagem suave entre eles. Os efeitos
    em vídeo (PEC) da mesma lista são desenhados por quem chama (precisam seguir o tempo do vídeo). */
function CenaFx({ cods, t, cor }: { cods: string[]; t: number; cor: string }) {
  const chave = cods.join();
  const ag = useMemo(() => agendaMotions(cods), [chave]); // eslint-disable-line react-hooks/exhaustive-deps
  const i = ag.findIndex(s => t >= s.ini && t < s.fim);
  const seg = ag[i];
  if (!seg) return null;
  const ant = i > 0 ? ag[i - 1] : undefined;
  const k = Math.min(1, (t - seg.ini) / 0.25);
  const ao = (c: string, op: number) => (efeito(c)?.video ? null : (
    <div key={c} className="cz-fx" style={{ opacity: op }}><EfeitoModelo codigo={c} t={t} cor={cor} img={imgEfeito} /></div>
  ));
  return <>{ant && k < 1 && ao(ant.c, 1 - k)}{ao(seg.c, ant ? k : 1)}</>;
}

/** O vídeo da pessoa sendo construído: o formato muda o lugar dela, a câmera dá o zoom, os efeitos entram na zona de
    cima um depois do outro (cada um no momento em que tem algo na tela), a legenda é desenhada ao vivo por cima (o
    mesmo motor da skill) e o som sai da mesa de som (voz + trilha + efeitos sonoros), tudo no tempo do vídeo. */
function Palco({ e, mostrar, rotulo, reinicio, som, alternarSom }: { e: Escolhas; mostrar: string[]; rotulo: string; reinicio: number; som: boolean; alternarSom: () => void }) {
  const f = FORMATOS.find(x => x.codigo === e.formato) ?? FORMATOS[0]!;
  const narr = f.id === 'narracao';
  const { video, capa } = videoBase(narr);
  const ref = useRef<HTMLVideoElement>(null);
  const zonas = useRef<Record<string, HTMLVideoElement | null>>({});
  const tempo = useRef(0);
  const [t, setT] = useState(0);
  const st = useRef({ som, trilha: audioTrilha(e.trilha), sfx: e.sfx, ultimo: -1 });
  st.current.som = som;
  st.current.trilha = audioTrilha(e.trilha);
  st.current.sfx = e.sfx;
  const chave = mostrar.join();
  const agenda = useMemo(() => (f.id === 'cheia' ? [] : agendaMotions(mostrar)), [chave, f.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const videosNaAgenda = [...new Set(agenda.map(s => s.c))].filter(c => efeito(c)?.video);
  const agora = agenda.find(s => t >= s.ini && t < s.fim)?.c ?? '';
  useEffect(() => { mesa.preparar([VOZ]); }, []);
  // tudo segue o vídeo: legenda, efeitos e câmera quadro a quadro; os efeitos em vídeo e o som corrigem quando escorregam
  useEffect(() => {
    let id = 0;
    let ultimoQuadro = 0;
    const segue = () => {
      ultimoQuadro = performance.now();
      const v = ref.current;
      if (!v) return;
      const tv = v.currentTime;
      setT(tv);
      for (const z of Object.values(zonas.current)) {
        if (!z || z.readyState < 1) continue;
        if (Math.abs(z.currentTime - tv) > 0.15) z.currentTime = tv;
        if (!v.paused && z.paused) z.play().catch(() => {});
      }
      const s = st.current;
      mesa.quadro(tv, s.som && !v.paused, VOZ, s.trilha);
      // efeitos sonoros: no começo de cada pedaço da fala, revezando os escolhidos
      const a = s.ultimo;
      s.ultimo = tv;
      if (!s.som || !s.sfx.length || a < 0 || v.paused) return;
      const dur = v.duration || DURACAO;
      const volta = tv < a;
      const dt = volta ? dur - a + tv : tv - a;
      if (dt <= 0 || dt > 0.5) return;
      FRASES.forEach((x, k) => {
        if (volta ? x > a || x <= tv : x > a && x <= tv) mesa.tocar(audioSfx(s.sfx[k % s.sfx.length]!), true);
      });
    };
    const passo = () => { segue(); id = requestAnimationFrame(passo); };
    id = requestAnimationFrame(passo);
    // reserva: quando o navegador congela o quadro a quadro (aba em segundo plano, economia de bateria), segue a 15 qps
    const reserva = window.setInterval(() => { if (performance.now() - ultimoQuadro > 120) segue(); }, 66);
    return () => { cancelAnimationFrame(id); window.clearInterval(reserva); mesa.silenciar(); };
  }, []);
  // trocar para o formato "só narração" troca o vídeo: continua do mesmo ponto da fala
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const seguir = () => {
      if (v.duration) v.currentTime = tempo.current % v.duration;
      v.play().catch(() => {});
    };
    v.addEventListener('loadedmetadata', seguir, { once: true });
    return () => v.removeEventListener('loadedmetadata', seguir);
  }, [video]);
  // um clique novo (estilo ou efeito) recomeça o trecho: a pessoa vê a camada nova desde o começo da fala
  useEffect(() => {
    const v = ref.current;
    if (!reinicio || !v) return;
    v.currentTime = 0;
    st.current.ultimo = 0;
    v.play().catch(() => {});
  }, [reinicio]);
  const escala = narr ? 1 : escalaCamera(e.camera, t);
  const nomeAgora = agora ? `${agora} · ${efeito(agora)?.nome ?? ''}` : '';
  return (
    <div className={`cz-palco cz-f-${f.id}`}>
      {f.id !== 'cheia' && (agenda.length ? (
        <div className="cz-zona cz-zona-motion">
          {videosNaAgenda.map(c => (
            <video key={c} ref={el => { zonas.current[c] = el; }} src={videoMotion(c).video} muted loop playsInline autoPlay style={{ opacity: c === agora ? 1 : 0 }} />
          ))}
          <CenaFx cods={mostrar} t={t} cor={e.corFx} />
        </div>
      ) : (
        <div className="cz-zona">
          <Sparkles aria-hidden="true" />
          <span>Os efeitos entram aqui</span>
        </div>
      ))}
      <div className="cz-pessoa">
        {/* o vídeo é sempre mudo: a voz sai da mesa de som, junto com a trilha e os efeitos, no mesmo tempo */}
        <video ref={ref} key={video} src={video} poster={narr ? undefined : capa} autoPlay muted loop playsInline
          style={{ transform: `scale(${escala})`, transformOrigin: ROSTO[f.id] ?? '47% 42%' }}
          onTimeUpdate={ev => { tempo.current = ev.currentTarget.currentTime; }} />
      </div>
      {e.legenda !== 'LEG-00' && (
        <div className="cz-leg-camada">
          <LegendaModelo palavras={TRECHO_PALAVRAS} t={t} estilo={e.legenda} cor={e.cor} y={ALTURA_LEG[f.id] ?? 0.7} destaques={TRECHO_DESTAQUES} />
        </div>
      )}
      {(rotulo || nomeAgora) && <span className="cz-agora">{rotulo ? `Prévia: ${rotulo}` : nomeAgora}</span>}
      <button type="button" className={`cz-som ${som ? 'ligado' : ''}`} onClick={alternarSom} aria-pressed={som}>
        {som ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />} {som ? 'Com som' : 'Ouvir'}
      </button>
    </div>
  );
}

const hslHex = (h: number, s = 0.86, l = 0.6) => {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  return `#${[f(0), f(8), f(4)].map(v => v.toString(16).padStart(2, '0')).join('')}`;
};
const AMOSTRAS = ['#8B5CF6', '#3CE6C8', '#FFD84D', '#FF8A3D', '#EF4444', '#EC4899', '#3B82F6', '#22C55E', '#FFFFFF'];

/** Uma cor: a faixa com todas as cores (arrasta para um lado e para o outro) e algumas cores prontas. */
function EscolhaCor({ rotulo, cor, mudar, amostras = AMOSTRAS }: { rotulo: string; cor: string; mudar: (c: string) => void; amostras?: string[] }) {
  const [h, setH] = useState(275);
  return (
    <div className="cz-cor">
      <div className="cz-cor-topo"><span className="cl-rotulo">{rotulo}</span><span className="cz-cor-atual"><i style={{ background: cor }} />{cor.toUpperCase()}</span></div>
      <input type="range" min={0} max={359} value={h} className="cz-cor-faixa" aria-label={`${rotulo}: arraste para escolher`}
        onChange={ev => { const v = Number(ev.target.value); setH(v); mudar(hslHex(v)); }} style={{ '--cor': cor } as CSSProperties} />
      <div className="cz-cor-amostras">
        {amostras.map(c => <button key={c} type="button" style={{ background: c }} aria-label={`Cor ${c}`} aria-pressed={cor.toLowerCase() === c.toLowerCase()} onClick={() => mudar(c)} />)}
      </div>
    </div>
  );
}

/** As 30 legendas, cada uma desenhada ao vivo na cor escolhida, por cima de um quadro do trecho. */
function GradeLegendas({ e, escolher }: { e: Escolhas; escolher: (v: string) => void }) {
  const t = useRelogio();
  return (
    <div className="cz-grade">
      {LEGENDAS.map(x => {
        const ativo = e.legenda === x.codigo;
        return (
          <button key={x.codigo} type="button" className={`cz-cartao ${ativo ? 'ativo' : ''}`} aria-pressed={ativo} onClick={() => escolher(x.codigo)}>
            <span className="cz-midia">
              <img className="cz-loop" src="/videos/criar/base.webp" alt="" loading="lazy" decoding="async" />
              {x.codigo !== 'LEG-00' && <span className="cz-leg-camada"><LegendaModelo palavras={TRECHO_PALAVRAS} t={t} estilo={x.codigo} cor={e.cor} y={0.7} destaques={TRECHO_DESTAQUES} /></span>}
            </span>
            <span className="cz-cartao-nome">{x.nome}</span>
            <small>{x.desc}</small>
            <span className="cz-codigo">{x.codigo}</span>
            {ativo && <span className="cz-marca"><Check aria-hidden="true" /></span>}
          </button>
        );
      })}
    </div>
  );
}

/** Um cartão de câmera: o quadro do trecho com o zoom daquele jeito, ao vivo. */
function CartaoCamera({ c, ativo, escolher }: { c: (typeof CAMERAS)[number]; ativo: boolean; escolher: () => void }) {
  const [ref, vis] = useVisivel<HTMLButtonElement>();
  const t = useRelogio(vis, 30);
  return (
    <button ref={ref} type="button" className={`cz-cartao ${ativo ? 'ativo' : ''}`} aria-pressed={ativo} onClick={escolher}>
      <span className="cz-midia">
        <img className="cz-loop" src="/videos/criar/base.webp" alt="" loading="lazy" decoding="async" style={{ transform: `scale(${escalaCamera(c.codigo, t)})`, transformOrigin: '47% 42%' }} />
      </span>
      <span className="cz-cartao-nome">{c.nome}</span>
      <small>{c.desc}</small>
      <span className="cz-codigo">{c.codigo}</span>
      {ativo && <span className="cz-marca"><Check aria-hidden="true" /></span>}
    </button>
  );
}

/** Exemplo de um estilo ou de um efeito: ao vivo (FX, na cor escolhida) ou o vídeo renderizado pela skill (PEC). */
function Exemplo({ cods, cor }: { cods: string[]; cor: string }) {
  const [ref, vis] = useVisivel<HTMLSpanElement>();
  const t = useRelogio(vis);
  const primeiro = cods[0] ?? '';
  return (
    <span ref={ref} className="cz-midia cz-midia-q">
      {efeito(primeiro)?.video ? <VideoLoop src={videoMotion(primeiro).video} poster={videoMotion(primeiro).capa} /> : <CenaFx cods={cods} t={t} cor={cor} />}
    </span>
  );
}

/** Um som para escolher: tocar escolhe e já toca (a trilha no vídeo ao lado; o efeito sonoro na hora). */
function CartaoSom({ codigo, nome, desc, ativo, tocando, escolher, multi }: { codigo: string; nome: string; desc: string; ativo: boolean; tocando: boolean; escolher: () => void; multi?: boolean }) {
  return (
    <button type="button" className={`cz-som-cartao ${ativo ? 'ativo' : ''}`} aria-pressed={ativo} onClick={escolher}>
      <span className="cz-som-icone">{tocando ? <AudioLines aria-hidden="true" /> : <Play aria-hidden="true" />}</span>
      <span className="cz-som-texto"><b>{nome}</b><small>{desc}</small></span>
      {multi ? <span className={`cz-som-marca ${ativo ? 'ativo' : ''}`} aria-hidden="true">{ativo && <Check />}</span> : <span className="cz-som-cod">{codigo}</span>}
    </button>
  );
}

function FolhaReferencia({ fechar }: { fechar: () => void }) {
  const [copiado, setCopiado] = useState(false);
  async function copiar() {
    await copiarTexto(PROMPT_REFERENCIA);
    setCopiado(true);
    eventoProprio('Criar_Referencia_Copiar', {}, false);
  }
  return (
    <div className="cl-fundo" onClick={fechar}>
      <div className="cl-folha" role="dialog" aria-modal="true" aria-labelledby="cz-ref-titulo" onClick={ev => ev.stopPropagation()}>
        <div className="cl-alca" aria-hidden="true" />
        <div className="cl-folha-cabeca">
          <div>
            <span className="cl-rotulo">Porta 1</span>
            <h2 id="cz-ref-titulo">Tenho uma referência</h2>
          </div>
          <button type="button" className="cl-fechar cl-fechar-claro" onClick={fechar} aria-label="Fechar" autoFocus><X /></button>
        </div>
        <p className="cz-folha-sub">Pode ser um vídeo do Catálogo de Estilos, um vídeo meu ou um vídeo que você viu por aí.</p>
        <div className="cl-bloco">
          <p className="cl-rotulo">Prompt</p>
          <div className="cl-prompt">{PROMPT_REFERENCIA}</div>
        </div>
        <button type="button" className={`cl-copiar ${copiado ? 'ok' : ''}`} onClick={copiar}>
          {copiado ? <><Check aria-hidden="true" /> Copiado</> : <><Copy aria-hidden="true" /> Copiar prompt</>}
        </button>
        <p className="cl-dica">Cole na sua IA com o Modo Editor e mande junto o seu vídeo e a referência (o arquivo ou o link).</p>
        <a className="cz-link" href="https://www.sortfeed.com/" target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden="true" /> Achou no Instagram? Baixe e transcreva com o Sort Feed (grátis)</a>
      </div>
    </div>
  );
}

type Foco = { cods: string[]; rotulo: string; ate: number | null };

function CriarDoZero({ sair }: { sair: () => void }) {
  const [e, setE] = useState<Escolhas>(ler);
  const [passo, setPasso] = useState(0);
  const [som, setSom] = useState(false);
  const [foco, setFoco] = useState<Foco | null>(null);
  const [reinicio, setReinicio] = useState(0);
  const [aviso, setAviso] = useState('');
  const [filtro, setFiltro] = useState<string>(() => 'marcados');
  const [tocou, setTocou] = useState('');
  const [copiado, setCopiado] = useState(false);
  const topo = useRef<HTMLDivElement>(null);
  const id: IdPasso = PASSOS[passo]!.id;
  useEffect(() => { gravar(e); setCopiado(false); }, [e]);
  useEffect(() => { topo.current?.scrollIntoView({ block: 'start' }); setFoco(null); setAviso(''); }, [passo]);
  // o efeito clicado aparece sozinho por uma volta do trecho; depois entra junto com os outros
  useEffect(() => {
    if (!foco?.ate) return;
    const k = window.setTimeout(() => setFoco(null), Math.max(0, foco.ate - performance.now()));
    return () => window.clearTimeout(k);
  }, [foco]);
  useEffect(() => { if (id === 'som') mesa.preparar([...TRILHAS.map(x => audioTrilha(x.codigo)), ...SFX.map(x => audioSfx(x.id))]); }, [id]);
  useEffect(() => { if (!tocou) return; const k = window.setTimeout(() => setTocou(''), 900); return () => window.clearTimeout(k); }, [tocou]);

  const f = FORMATOS.find(x => x.codigo === e.formato) ?? FORMATOS[0]!;
  const l = LEGENDAS.find(x => x.codigo === e.legenda) ?? LEGENDAS[0]!;
  const cam = CAMERAS.find(x => x.codigo === e.camera) ?? CAMERAS[0]!;
  const tr = TRILHAS.find(x => x.codigo === e.trilha) ?? TRILHAS[0]!;
  const narr = f.id === 'narracao';
  const pedido = montarPedidoZero(e);
  const demoDosEstilos = (ids: string[]) => ids.flatMap(i => ESTILOS.find(s => s.id === i)?.demo.slice(0, 2) ?? []).slice(0, 8);
  const montagem = e.motions.length ? e.motions : demoDosEstilos(e.estilos);
  const mostrar = foco?.cods ?? montagem;

  const escolher = (k: 'formato' | 'legenda' | 'camera' | 'trilha', v: string) => { setE(x => ({ ...x, [k]: v })); eventoProprio('Criar_Escolha', { [k]: v }, false); };
  const verAgora = (cods: string[], rotulo: string, umaVolta: boolean) => {
    setFoco({ cods, rotulo, ate: umaVolta ? performance.now() + DURACAO * 1000 + 300 : null });
    setReinicio(r => r + 1);
    if (f.id === 'cheia') {
      setE(x => ({ ...x, formato: 'FMT-02' }));
      setAviso('Em tela cheia só entra a legenda. Para os efeitos aparecerem, o seu vídeo passou para "Você no cartão" (dá para voltar no passo Formato).');
    }
  };
  const clicaEstilo = (s: EstiloFx) => {
    const marcado = e.estilos.includes(s.id);
    setE(x => ({ ...x, estilos: marcado ? x.estilos.filter(y => y !== s.id) : [...x.estilos, s.id] }));
    eventoProprio('Criar_Estilo', { estilo: s.id }, false);
    if (marcado) { setFoco(null); return; }
    const meus = e.motions.filter(c => efeito(c)?.estilo === s.id);
    verAgora(meus.length ? meus : s.demo, s.nome, false);
  };
  const clicaEfeito = (c: string) => {
    const marcado = e.motions.includes(c);
    const est = efeito(c)?.estilo ?? '';
    setE(x => ({
      ...x,
      motions: marcado ? x.motions.filter(y => y !== c) : [...x.motions, c],
      estilos: marcado || !est || x.estilos.includes(est) ? x.estilos : [...x.estilos, est],
    }));
    if (marcado) { setFoco(null); return; }
    verAgora([c], `${c} · ${efeito(c)?.nome ?? ''}`, true);
  };
  const ligarSom = () => { mesa.ligar(); setSom(true); };
  const alternarSom = () => {
    if (som) { setSom(false); mesa.silenciar(); } else ligarSom();
    eventoProprio('Criar_Som', {}, true);
  };
  const clicaTrilha = (codigo: string) => { ligarSom(); escolher('trilha', codigo); };
  const clicaSfx = (sid: string) => {
    mesa.ligar();
    mesa.tocar(audioSfx(sid));
    setTocou(sid);
    setE(x => ({ ...x, sfx: x.sfx.includes(sid) ? x.sfx.filter(y => y !== sid) : [...x.sfx, sid] }));
  };

  async function copiar() {
    await copiarTexto(pedido);
    setCopiado(true);
    eventoProprio('Criar_Copiar', { formato: e.formato, legenda: e.legenda }, false);
  }

  const filtroAtivo = filtro === 'marcados' && !e.estilos.length ? 'todos' : filtro;
  const lista = EFEITOS.filter(x => (filtroAtivo === 'todos' ? true : filtroAtivo === 'marcados' ? e.estilos.includes(x.estilo) : x.estilo === filtroAtivo));
  const nomesEstilos = e.estilos.map(i => ESTILOS.find(s => s.id === i)?.nome).filter(Boolean).join(', ');

  return (
    <div className="cz-criar" ref={topo}>
      <nav className="cz-passos" aria-label="Camadas do vídeo">
        {PASSOS.map((s, k) => (
          <button key={s.id} type="button" className={`cz-passo ${k === passo ? 'agora' : ''} ${k < passo ? 'feito' : ''}`} aria-current={k === passo ? 'step' : undefined} onClick={() => setPasso(k)}>
            <span className="cz-passo-n">{k < passo ? <Check aria-hidden="true" /> : k + 1}</span>{s.nome}
          </button>
        ))}
      </nav>

      <div className="cz-miolo">
        <aside className="cz-lado" aria-label="O seu vídeo">
          <Palco e={e} mostrar={mostrar} rotulo={foco?.rotulo ?? ''} reinicio={reinicio} som={som} alternarSom={alternarSom} />
          <ul className="cz-resumo">
            <li><span>Formato</span><b>{f.nome}</b></li>
            <li><span>Legenda</span><b>{e.legenda !== 'LEG-00' && <i className="cz-ponto" style={{ background: e.cor }} />}{l.nome}</b></li>
            <li><span>Câmera</span><b>{cam.nome}</b></li>
            <li><span>Efeitos</span><b>{e.motions.length ? <><i className="cz-ponto" style={{ background: e.corFx }} />{`${e.motions.length} escolhido${e.motions.length > 1 ? 's' : ''}`}</> : nomesEstilos || 'nenhum'}</b></li>
            <li><span>Som</span><b>{tr.nome}{e.sfx.length ? ` · ${e.sfx.length} efeito${e.sfx.length > 1 ? 's' : ''}` : ''}</b></li>
          </ul>
        </aside>

        <section className="cz-opcoes">
          {aviso && <p className="cz-aviso" role="status">{aviso}</p>}

          {id === 'formato' && (
            <>
              <h2 className="cz-h">Como o vídeo é montado?</h2>
              <p className="cz-sub">Cada formato com um vídeo meu de exemplo. O seu vídeo, ao lado, já muda de lugar.</p>
              <div className="cz-grade">
                {FORMATOS.map(x => {
                  const a = exemploFormato(x.codigo);
                  const ativo = e.formato === x.codigo;
                  return (
                    <button key={x.codigo} type="button" className={`cz-cartao ${ativo ? 'ativo' : ''}`} aria-pressed={ativo} onClick={() => escolher('formato', x.codigo)}>
                      <span className="cz-midia"><VideoLoop src={a.loop} poster={a.capa} /></span>
                      <span className="cz-cartao-nome">{x.nome}</span>
                      <small>{x.desc}</small>
                      <span className="cz-codigo">{x.codigo}</span>
                      {ativo && <span className="cz-marca"><Check aria-hidden="true" /></span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {id === 'legenda' && (
            <>
              <h2 className="cz-h">Qual legenda?</h2>
              <p className="cz-sub">30 estilos diferentes, todos na cor que você escolher. A IA faz exatamente esta legenda no seu vídeo.</p>
              <EscolhaCor rotulo="Cor da legenda" cor={e.cor} mudar={c => setE(x => ({ ...x, cor: c }))} />
              <GradeLegendas e={e} escolher={v => escolher('legenda', v)} />
            </>
          )}

          {id === 'camera' && (
            <>
              <h2 className="cz-h">Como a câmera se mexe?</h2>
              <p className="cz-sub">O zoom sempre em volta do seu rosto, sem cortar a cabeça. Toque e veja no seu vídeo, ao lado.</p>
              <div className="cz-grade">
                {CAMERAS.map(c => <CartaoCamera key={c.codigo} c={c} ativo={e.camera === c.codigo} escolher={() => escolher('camera', c.codigo)} />)}
              </div>
            </>
          )}

          {id === 'estilo' && (
            <>
              <h2 className="cz-h">Qual o estilo dos efeitos?</h2>
              <p className="cz-sub">Toque num estilo e ele entra no seu vídeo, ao lado. Pode marcar quantos quiser e misturar. Cada estilo tem o seu fundo, a sua letra e o seu jeito de mexer.</p>
              <EscolhaCor rotulo="Cor dos efeitos" cor={e.corFx} mudar={c => setE(x => ({ ...x, corFx: c }))} />
              <div className="cz-grade">
                {ESTILOS.map(s => {
                  const marcado = e.estilos.includes(s.id);
                  return (
                    <button key={s.id} type="button" className={`cz-cartao ${marcado ? 'ativo' : ''}`} aria-pressed={marcado} onClick={() => clicaEstilo(s)}>
                      <Exemplo cods={s.demo} cor={e.corFx} />
                      <span className="cz-cartao-nome">{s.nome}</span>
                      <small>{s.desc}</small>
                      <span className="cz-codigo">{EFEITOS.filter(x => x.estilo === s.id).length} efeitos</span>
                      {marcado && <span className="cz-marca"><Check aria-hidden="true" /></span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {id === 'efeitos' && (
            <>
              <h2 className="cz-h">Quais efeitos?</h2>
              <p className="cz-sub">Marque quantos quiser: o efeito marcado aparece sozinho no seu vídeo e depois entra junto com os outros, um depois do outro, cada um no momento da fala.</p>
              <EscolhaCor rotulo="Cor dos efeitos" cor={e.corFx} mudar={c => setE(x => ({ ...x, corFx: c }))} />
              <div className="cz-filtros" role="group" aria-label="Estilo do efeito">
                {[{ id: 'marcados', nome: 'Dos estilos que você marcou' }, { id: 'todos', nome: `Todos (${EFEITOS.length})` }, ...ESTILOS.map(s => ({ id: s.id, nome: s.nome }))]
                  .filter(x => x.id !== 'marcados' || e.estilos.length)
                  .map(x => (
                    <button key={x.id} type="button" className={filtroAtivo === x.id ? 'ativo' : ''} aria-pressed={filtroAtivo === x.id} onClick={() => setFiltro(x.id)}>{x.nome}</button>
                  ))}
              </div>
              <div className="cz-grade">
                {lista.map(m => {
                  const marcado = e.motions.includes(m.codigo);
                  return (
                    <button key={m.codigo} type="button" className={`cz-cartao ${marcado ? 'ativo' : ''}`} aria-pressed={marcado} onClick={() => clicaEfeito(m.codigo)}>
                      <Exemplo cods={[m.codigo]} cor={e.corFx} />
                      <span className="cz-cartao-nome">{m.nome}</span>
                      <small>{ESTILOS.find(s => s.id === m.estilo)?.nome}</small>
                      <span className="cz-codigo">{m.codigo}</span>
                      {marcado && <span className="cz-marca"><Check aria-hidden="true" /></span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {id === 'som' && (
            <>
              <h2 className="cz-h">Qual som?</h2>
              <p className="cz-sub">Toque numa trilha e ela já toca no seu vídeo, ao lado, baixinha por baixo da sua voz.</p>
              <h3 className="cz-h3">Trilha</h3>
              <div className="cz-sons">
                {TRILHAS.map(x => <CartaoSom key={x.codigo} codigo={x.codigo} nome={x.nome} desc={x.desc} ativo={e.trilha === x.codigo} tocando={som && e.trilha === x.codigo && x.codigo !== 'SOM-00'} escolher={() => clicaTrilha(x.codigo)} />)}
              </div>
              <h3 className="cz-h3">Efeitos sonoros <span className="cz-conta">{e.sfx.length ? `${e.sfx.length} marcado${e.sfx.length > 1 ? 's' : ''}` : 'marque quantos quiser'}</span></h3>
              <p className="cz-sub">Toque para ouvir e marcar. No vídeo, os marcados entram no começo de cada frase, revezando{som ? '' : ' (ligue o som do vídeo para ouvir junto)'}.</p>
              {GRUPOS_SFX.map(g => (
                <div key={g} className="cz-grupo-som">
                  <p className="cz-grupo-nome">{g}</p>
                  <div className="cz-sons">
                    {SFX.filter(x => x.grupo === g).map(x => <CartaoSom key={x.id} codigo={x.id} nome={x.nome} desc={e.sfx.includes(x.id) ? 'no seu vídeo' : 'toque para ouvir'} ativo={e.sfx.includes(x.id)} tocando={tocou === x.id} escolher={() => clicaSfx(x.id)} multi />)}
                  </div>
                </div>
              ))}
              <p className="cz-credito">Efeitos sonoros em domínio público (CC0): Kenney e Freesound.</p>
            </>
          )}

          {id === 'pedido' && (
            <>
              <h2 className="cz-h">Seu pedido</h2>
              <p className="cz-sub">Copie, cole na sua IA com o Modo Editor e mande {narr ? 'a sua narração' : 'o seu vídeo cru, sem edição,'} junto.</p>
              <pre className="cz-pedido">{pedido}</pre>
              <button type="button" className={`cl-copiar ${copiado ? 'ok' : ''}`} onClick={copiar}>
                {copiado ? <><Check aria-hidden="true" /> Copiado</> : <><Copy aria-hidden="true" /> Copiar pedido</>}
              </button>
            </>
          )}
        </section>
      </div>

      <footer className="cz-pe">
        <button type="button" className="cz-anterior" onClick={() => (passo > 0 ? setPasso(passo - 1) : sair())}><ArrowLeft aria-hidden="true" /> Voltar</button>
        {passo < ULTIMO && (
          <button type="button" className="cz-proximo" onClick={() => setPasso(passo + 1)}>
            {passo === ULTIMO - 1 ? 'Ver o pedido' : `Próximo: ${PASSOS[passo + 1]!.nome}`} <ArrowRight aria-hidden="true" />
          </button>
        )}
      </footer>
    </div>
  );
}

export function Criar() {
  const [tela, setTela] = useState<'porta' | 'criar'>('porta');
  const [referencia, setReferencia] = useState(false);
  useTelas((tela === 'criar' ? 1 : 0) + (referencia ? 1 : 0), () => {
    if (referencia) setReferencia(false);
    else setTela('porta');
  });
  return (
    <div className="cl cz">
      <header className="cl-barra">
        <div className="cl-marca">
          <img className="cl-logo" src="/img/marca/modo-editor-logo.webp" width={342} height={72} alt="Modo Editor" />
          <span className="cl-marca-nome">Criar meu vídeo</span>
        </div>
      </header>

      {tela === 'porta' ? (
        <main className="cz-porta">
          <h1 className="cz-porta-h">Como você quer montar o seu vídeo?</h1>
          <p className="cz-sub">Com uma referência, a IA deixa o seu vídeo igual. Sem referência, você monta do zero e vê ficando pronto.</p>
          <div className="cz-portas">
            <button type="button" className="cz-porta-cartao" onClick={() => { setReferencia(true); eventoProprio('Criar_Porta', { porta: 'referencia' }, false); }}>
              <Link2 aria-hidden="true" />
              <b>Tenho uma referência</b>
              <span>Um vídeo do catálogo, um vídeo meu ou um que você viu por aí. Copie o prompt e mande junto.</span>
              <i>Copiar o prompt <ArrowRight aria-hidden="true" /></i>
            </button>
            <button type="button" className="cz-porta-cartao cz-porta-forte" onClick={() => { setTela('criar'); eventoProprio('Criar_Porta', { porta: 'zero' }, false); }}>
              <Sparkles aria-hidden="true" />
              <b>Criar do zero</b>
              <span>Monte camada por camada: formato, legenda, câmera, efeitos e som. Cada clique muda o seu vídeo na hora.</span>
              <i>Começar <ArrowRight aria-hidden="true" /></i>
            </button>
          </div>
        </main>
      ) : (
        <CriarDoZero sair={() => setTela('porta')} />
      )}

      {referencia && <FolhaReferencia fechar={() => setReferencia(false)} />}
    </div>
  );
}
