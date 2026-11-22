import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, AudioLines, Check, Copy, ExternalLink, Link2, Pause, Play, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import { CATEGORIAS_MOTION, EFEITOS, ESTILOS_VIDEO, FORMATOS, LEGENDAS, MOTIONS, PROMPT_REFERENCIA, TIPOS, TRECHO_DESTAQUES, TRECHO_PALAVRAS, TRILHAS, agendaMotions, audioEfeitos, audioTrilha, exemploEstilo, exemploFormato, montarPedidoZero, videoBase, videoMotion, type Escolhas } from '@/lib/criar';
import { LegendaModelo } from '@/components/legendas-modelos';
import { eventoProprio } from '@/lib/pixel';

/* "Criar meu vídeo" (21/11/2026, desenho dele): separado do catálogo. Porta 1 = "Tenho uma referência" (prompt);
   porta 2 = "Criar do zero": o trecho cru de 10 s dele vai sendo construído camada por camada (formato -> legenda ->
   motions -> som), sempre à vista. Toda opção tem exemplo de verdade. Dados e códigos em src/lib/criar.ts. */

const PASSOS = [
  { id: 'formato', nome: 'Formato' },
  { id: 'estilo', nome: 'Estilo' },
  { id: 'legenda', nome: 'Legenda' },
  { id: 'tipos', nome: 'Tipo de efeito' },
  { id: 'motions', nome: 'Efeitos' },
  { id: 'som', nome: 'Som' },
  { id: 'pedido', nome: 'Pedido' },
] as const;
const ULTIMO = PASSOS.length - 1;
const CHAVE = 'me-criar-v1';
const PADRAO: Escolhas = { formato: 'FMT-02', estilo: 'motion-design', legenda: 'LEG-01', cor: '#8B5CF6', tipos: [], motions: [], trilha: 'SOM-00', efeitos: 'EFE-01' };
/** a altura da legenda no palco, pelo formato (na skill ela acha o queixo sozinha) */
const ALTURA_LEG: Record<string, number> = { cheia: 0.7, cartao: 0.86, dividida: 0.84, narracao: 0.72 };
const DURACAO = 10.3;

function ler(): Escolhas {
  try {
    const s = window.localStorage.getItem(CHAVE);
    const v = s ? (JSON.parse(s) as Partial<Escolhas>) : {};
    return {
      formato: FORMATOS.some(f => f.codigo === v.formato) ? v.formato! : PADRAO.formato,
      legenda: LEGENDAS.some(l => l.codigo === v.legenda) ? v.legenda! : PADRAO.legenda,
      cor: /^#[0-9a-f]{6}$/i.test(v.cor ?? '') ? v.cor! : PADRAO.cor,
      estilo: ESTILOS_VIDEO.some(x => x.id === v.estilo) ? v.estilo! : PADRAO.estilo,
      tipos: Array.isArray(v.tipos) ? v.tipos.filter(c => (CATEGORIAS_MOTION as readonly string[]).includes(c)) : [],
      motions: Array.isArray(v.motions) ? v.motions.filter(c => MOTIONS.some(m => m.codigo === c)) : [],
      trilha: TRILHAS.some(x => x.codigo === v.trilha) ? v.trilha! : PADRAO.trilha,
      efeitos: EFEITOS.some(x => x.codigo === v.efeitos) ? v.efeitos! : PADRAO.efeitos,
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

/** O vídeo da pessoa sendo construído: o formato muda o lugar dela, os motions escolhidos entram na zona de cima um
    depois do outro (cada um no momento em que tem algo na tela), a legenda é desenhada ao vivo por cima (o mesmo motor
    da skill) e o som vem em camadas (voz + efeitos e a trilha), tudo no mesmo tempo do vídeo. */
function Palco({ e, som, setSom }: { e: Escolhas; som: boolean; setSom: (v: boolean) => void }) {
  const f = FORMATOS.find(x => x.codigo === e.formato) ?? FORMATOS[0]!;
  const narr = f.id === 'narracao';
  const { video, capa } = videoBase(narr);
  const ref = useRef<HTMLVideoElement>(null);
  const zonas = useRef<Record<string, HTMLVideoElement | null>>({});
  const efe = useRef<HTMLAudioElement>(null);
  const tri = useRef<HTMLAudioElement>(null);
  const somRef = useRef(som);
  somRef.current = som;
  const tempo = useRef(0);
  const [t, setT] = useState(0);
  const agenda = useMemo(() => (f.id === 'cheia' ? [] : agendaMotions(e.motions)), [e.motions, f.id]);
  const naAgenda = [...new Set(agenda.map(s => s.c))];
  const agora = agenda.find(s => t >= s.ini && t < s.fim)?.c ?? '';
  const trilha = audioTrilha(e.trilha);
  // tudo segue o vídeo: a legenda quadro a quadro; os motions e o som corrigem quando escorregam
  useEffect(() => {
    let id = 0;
    const alinhar = (m: HTMLMediaElement | null, tocar: boolean) => {
      const v = ref.current;
      if (!m || !v || m.readyState < 1) return;
      if (Math.abs(m.currentTime - v.currentTime) > 0.15) m.currentTime = v.currentTime;
      if (tocar && !v.paused && m.paused) m.play().catch(() => {});
      if (!tocar && !m.paused) m.pause();
    };
    let ultimo = 0;
    const segue = () => {
      ultimo = performance.now();
      const v = ref.current;
      if (v) {
        setT(v.currentTime);
        for (const z of Object.values(zonas.current)) alinhar(z, true);
        alinhar(efe.current, somRef.current);
        alinhar(tri.current, somRef.current);
      }
    };
    const passo = () => { segue(); id = requestAnimationFrame(passo); };
    id = requestAnimationFrame(passo);
    // reserva: quando o navegador congela o quadro a quadro (aba em segundo plano, economia de bateria), segue a 15 qps
    const reserva = window.setInterval(() => { if (performance.now() - ultimo > 120) segue(); }, 66);
    return () => { cancelAnimationFrame(id); window.clearInterval(reserva); };
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
  // o som liga no toque (o navegador só deixa tocar depois de um toque da pessoa)
  useEffect(() => {
    for (const m of [efe.current, tri.current]) {
      if (!m) continue;
      if (som) { m.currentTime = ref.current?.currentTime ?? 0; m.play().catch(() => {}); } else m.pause();
    }
  }, [som, e.efeitos, trilha]);
  return (
    <div className={`cz-palco cz-f-${f.id}`}>
      {f.id !== 'cheia' && (naAgenda.length ? (
        <div className="cz-zona cz-zona-motion">
          {naAgenda.map(c => (
            <video key={c} ref={el => { zonas.current[c] = el; }} src={videoMotion(c).video} muted loop playsInline autoPlay style={{ opacity: c === agora ? 1 : 0 }} />
          ))}
        </div>
      ) : (
        <div className="cz-zona">
          <Sparkles aria-hidden="true" />
          <span>Os motions entram aqui</span>
        </div>
      ))}
      <div className="cz-pessoa">
        {/* o vídeo é sempre mudo: a voz vem na camada de efeitos (voz + efeitos), para tudo sair sincronizado */}
        <video ref={ref} key={video} src={video} poster={narr ? undefined : capa} autoPlay muted loop playsInline
          onTimeUpdate={ev => { tempo.current = ev.currentTarget.currentTime; }} />
      </div>
      {e.legenda !== 'LEG-00' && (
        <div className="cz-leg-camada">
          <LegendaModelo palavras={TRECHO_PALAVRAS} t={t} estilo={e.legenda} cor={e.cor} y={ALTURA_LEG[f.id] ?? 0.7} destaques={TRECHO_DESTAQUES} />
        </div>
      )}
      <audio ref={efe} key={e.efeitos} src={audioEfeitos(e.efeitos)} loop preload="auto" />
      {trilha && <audio ref={tri} key={trilha} src={trilha} loop preload="auto" />}
      {agora && <span className="cz-agora">{agora}</span>}
      <button type="button" className="cz-som" onClick={() => { setSom(!som); eventoProprio('Criar_Som', {}, true); }} aria-pressed={som}>
        {som ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />} {som ? 'Com som' : 'Ouvir'}
      </button>
    </div>
  );
}

/** Um som para escolher (trilha ou pacote de efeitos): tocar escolhe e liga o som no vídeo ao lado. */
function CartaoSom({ x, ativo, tocando, escolher }: { x: { codigo: string; nome: string; desc: string }; ativo: boolean; tocando: boolean; escolher: () => void }) {
  return (
    <button type="button" className={`cz-som-cartao ${ativo ? 'ativo' : ''}`} aria-pressed={ativo} onClick={escolher}>
      <span className="cz-som-icone">{ativo && tocando ? <AudioLines aria-hidden="true" /> : ativo ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}</span>
      <span className="cz-som-texto"><b>{x.nome}</b><small>{x.desc}</small></span>
      <span className="cz-som-cod">{x.codigo}</span>
    </button>
  );
}


/** Relógio dos cartões de legenda (todos andam juntos, 20 quadros por segundo, em volta dos 10,3 s do trecho). */
function useRelogio(fps = 20) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const id = window.setInterval(() => setT(((performance.now() - t0) / 1000) % DURACAO), 1000 / fps);
    return () => window.clearInterval(id);
  }, [fps]);
  return t;
}

const hslHex = (h: number, s = 0.86, l = 0.6) => {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  return `#${[f(0), f(8), f(4)].map(v => v.toString(16).padStart(2, '0')).join('')}`;
};
const AMOSTRAS = ['#8B5CF6', '#3CE6C8', '#FFD84D', '#FF8A3D', '#EF4444', '#EC4899', '#3B82F6', '#22C55E', '#FFFFFF'];

/** A cor da legenda: a faixa com todas as cores (arrasta para um lado e para o outro) e algumas cores prontas. */
function CorDaLegenda({ cor, mudar }: { cor: string; mudar: (c: string) => void }) {
  const [h, setH] = useState(275);
  return (
    <div className="cz-cor">
      <div className="cz-cor-topo"><span className="cl-rotulo">Cor da legenda</span><span className="cz-cor-atual"><i style={{ background: cor }} />{cor.toUpperCase()}</span></div>
      <input type="range" min={0} max={359} value={h} className="cz-cor-faixa" aria-label="Cor da legenda: arraste para escolher"
        onChange={ev => { const v = Number(ev.target.value); setH(v); mudar(hslHex(v)); }} style={{ '--cor': cor } as CSSProperties} />
      <div className="cz-cor-amostras">
        {AMOSTRAS.map(c => <button key={c} type="button" style={{ background: c }} aria-label={`Cor ${c}`} aria-pressed={cor.toLowerCase() === c.toLowerCase()} onClick={() => mudar(c)} />)}
      </div>
    </div>
  );
}

/** As 30 legendas, cada uma desenhada ao vivo na cor escolhida, por cima de um quadro do trecho. */
function GradeLegendas({ e, escolher }: { e: Escolhas; escolher: (k: keyof Escolhas, v: string) => void }) {
  const t = useRelogio();
  return (
    <div className="cz-grade">
      {LEGENDAS.map(x => {
        const ativo = e.legenda === x.codigo;
        return (
          <button key={x.codigo} type="button" className={`cz-cartao ${ativo ? 'ativo' : ''}`} aria-pressed={ativo} onClick={() => escolher('legenda', x.codigo)}>
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

function CriarDoZero({ sair }: { sair: () => void }) {
  const [e, setE] = useState<Escolhas>(ler);
  const [passo, setPasso] = useState(0);
  const [som, setSom] = useState(false);
  const [cat, setCat] = useState('Escolhidos');
  const alternaMotion = (c: string) => setE(x => ({ ...x, motions: x.motions.includes(c) ? x.motions.filter(y => y !== c) : [...x.motions, c] }));
  const alternaTipo = (c: string) => setE(x => ({ ...x, tipos: x.tipos.includes(c) ? x.tipos.filter(y => y !== c) : [...x.tipos, c] }));
  const [copiado, setCopiado] = useState(false);
  const topo = useRef<HTMLDivElement>(null);
  useEffect(() => { gravar(e); setCopiado(false); }, [e]);
  useEffect(() => { topo.current?.scrollIntoView({ block: 'start' }); }, [passo]);

  const f = FORMATOS.find(x => x.codigo === e.formato) ?? FORMATOS[0]!;
  const l = LEGENDAS.find(x => x.codigo === e.legenda) ?? LEGENDAS[0]!;
  const narr = f.id === 'narracao';
  const pedido = montarPedidoZero(e);
  const escolher = (k: keyof Escolhas, v: string) => { setE(x => ({ ...x, [k]: v })); eventoProprio('Criar_Escolha', { [k]: v }, false); };

  async function copiar() {
    await copiarTexto(pedido);
    setCopiado(true);
    eventoProprio('Criar_Copiar', { formato: e.formato, legenda: e.legenda }, false);
  }

  return (
    <div className="cz-criar" ref={topo}>
      <nav className="cz-passos" aria-label="Camadas do vídeo">
        {PASSOS.map((s, k) => (
          <button key={s.id} type="button" className={`cz-passo ${k === passo ? 'agora' : ''} ${k < passo ? 'feito' : ''}`} aria-current={k === passo ? 'step' : undefined} onClick={() => setPasso(k)}>
            <span className="cz-passo-n">{k < passo ? <Check aria-hidden="true" /> : k + 1}</span>{s.nome}{'breve' in s && <em>em produção</em>}
          </button>
        ))}
      </nav>

      <div className="cz-miolo">
        <aside className="cz-lado" aria-label="O seu vídeo">
          <Palco e={e} som={som} setSom={setSom} />
          <ul className="cz-resumo">
            <li><span>Formato</span><b>{f.nome}</b></li>
            <li><span>Estilo</span><b>{ESTILOS_VIDEO.find(x => x.id === e.estilo)?.nome ?? ''}</b></li>
            <li><span>Legenda</span><b>{e.legenda !== 'LEG-00' && <i className="cz-ponto" style={{ background: e.cor }} />}{l.nome}</b></li>
            <li><span>Efeitos</span><b>{e.motions.length ? `${e.motions.length} escolhido${e.motions.length > 1 ? 's' : ''}` : 'nenhum'}</b></li>
            <li><span>Som</span><b>{TRILHAS.find(x => x.codigo === e.trilha)?.nome ?? ''} · {EFEITOS.find(x => x.codigo === e.efeitos)?.nome ?? ''}</b></li>
          </ul>
        </aside>

        <section className="cz-opcoes">
          {passo === 0 && (
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

          {passo === 1 && (
            <>
              <h2 className="cz-h">Qual o estilo do vídeo?</h2>
              <p className="cz-sub">Cada estilo com um vídeo meu de exemplo. Ele dá o jeito do vídeo; nas próximas camadas você escolhe a legenda e os efeitos.</p>
              <div className="cz-grade">
                {ESTILOS_VIDEO.map(x => {
                  const a = exemploEstilo(x.id);
                  const ativo = e.estilo === x.id;
                  return (
                    <button key={x.id} type="button" className={`cz-cartao ${ativo ? 'ativo' : ''}`} aria-pressed={ativo} onClick={() => escolher('estilo', x.id)}>
                      <span className="cz-midia"><VideoLoop src={a.loop} poster={a.capa} /></span>
                      <span className="cz-cartao-nome">{x.nome}</span>
                      <small>{x.dark ? 'Dark: você não aparece' : 'Você aparece'}</small>
                      <span className="cz-codigo">{x.codigo}</span>
                      {ativo && <span className="cz-marca"><Check aria-hidden="true" /></span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {passo === 2 && (
            <>
              <h2 className="cz-h">Qual legenda?</h2>
              <p className="cz-sub">30 estilos diferentes, todos na cor que você escolher. A IA faz exatamente esta legenda no seu vídeo.</p>
              <CorDaLegenda cor={e.cor} mudar={c => setE(x => ({ ...x, cor: c }))} />
              <GradeLegendas e={e} escolher={escolher} />
            </>
          )}

          {passo === 3 && (
            <>
              <h2 className="cz-h">Que tipo de efeito?</h2>
              <p className="cz-sub">Marque quantos tipos quiser. Cada um com um exemplo na sua fala. Na próxima camada você escolhe os efeitos de cada tipo.</p>
              <div className="cz-grade">
                {TIPOS.map(x => {
                  const v = videoMotion(x.exemplo);
                  const marcado = e.tipos.includes(x.cat);
                  return (
                    <button key={x.cat} type="button" className={`cz-cartao ${marcado ? 'ativo' : ''}`} aria-pressed={marcado} onClick={() => alternaTipo(x.cat)}>
                      <span className="cz-midia cz-midia-q"><VideoLoop src={v.video} poster={v.capa} /></span>
                      <span className="cz-cartao-nome">{x.nome}</span>
                      <small>{x.desc}</small>
                      <span className="cz-codigo">{MOTIONS.filter(m => m.cat === x.cat).length} efeitos</span>
                      {marcado && <span className="cz-marca"><Check aria-hidden="true" /></span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {passo === 4 && (
            <>
              <h2 className="cz-h">Quais efeitos?</h2>
              <p className="cz-sub">Marque quantos quiser: eles entram no seu vídeo, ao lado, um depois do outro, cada um no momento da fala.</p>
              {f.id === 'cheia' && <p className="cz-aviso">No formato Tela cheia entra só a legenda. Para ver os efeitos no seu vídeo, escolha o formato Você no cartão, Tela dividida ou Só narração.</p>}
              <div className="cz-filtros" role="group" aria-label="Tipo de efeito">
                {['Escolhidos', 'Todos', ...CATEGORIAS_MOTION].map(c => (
                  <button key={c} type="button" className={cat === c ? 'ativo' : ''} aria-pressed={cat === c} onClick={() => setCat(c)}>
                    {c === 'Escolhidos' ? `Os tipos que você marcou${e.tipos.length ? '' : ' (todos)'}` : c}
                  </button>
                ))}
              </div>
              <div className="cz-grade">
                {MOTIONS.filter(m => (cat === 'Escolhidos' ? !e.tipos.length || e.tipos.includes(m.cat) : cat === 'Todos' || m.cat === cat)).map(m => {
                  const v = videoMotion(m.codigo);
                  const marcado = e.motions.includes(m.codigo);
                  return (
                    <button key={m.codigo} type="button" className={`cz-cartao ${marcado ? 'ativo' : ''}`} aria-pressed={marcado} onClick={() => alternaMotion(m.codigo)}>
                      <span className="cz-midia cz-midia-q"><VideoLoop src={v.video} poster={v.capa} /></span>
                      <span className="cz-cartao-nome">{m.nome}</span>
                      <small>{m.cat}</small>
                      <span className="cz-codigo">{m.codigo}</span>
                      {marcado && <span className="cz-marca"><Check aria-hidden="true" /></span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {passo === 5 && (
            <>
              <h2 className="cz-h">Qual som?</h2>
              <p className="cz-sub">Toque para ouvir no seu vídeo, ao lado. A trilha fica baixinha, por baixo da sua voz, e os efeitos entram nos momentos da fala.</p>
              <h3 className="cz-h3">Trilha</h3>
              <div className="cz-sons">
                {TRILHAS.map(x => <CartaoSom key={x.codigo} x={x} ativo={e.trilha === x.codigo} tocando={som} escolher={() => { escolher('trilha', x.codigo); setSom(true); }} />)}
              </div>
              <h3 className="cz-h3">Efeitos sonoros</h3>
              <div className="cz-sons">
                {EFEITOS.map(x => <CartaoSom key={x.codigo} x={x} ativo={e.efeitos === x.codigo} tocando={som} escolher={() => { escolher('efeitos', x.codigo); setSom(true); }} />)}
              </div>
            </>
          )}


          {passo === ULTIMO && (
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
              <span>Monte camada por camada: formato, legenda, motions e som. Cada opção com exemplo, no seu vídeo.</span>
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
