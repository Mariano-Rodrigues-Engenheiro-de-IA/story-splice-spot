import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Copy, ExternalLink, Layers, Link2, Music, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import { FORMATOS, LEGENDAS, PROMPT_REFERENCIA, exemploFormato, montarPedidoZero, videoLegenda, type Escolhas } from '@/lib/criar';
import { eventoProprio } from '@/lib/pixel';

/* "Criar meu vídeo" (21/11/2026, desenho dele): separado do catálogo. Porta 1 = "Tenho uma referência" (prompt);
   porta 2 = "Criar do zero": o trecho cru de 10 s dele vai sendo construído camada por camada (formato -> legenda ->
   motions -> som), sempre à vista. Toda opção tem exemplo de verdade. Dados e códigos em src/lib/criar.ts. */

const PASSOS = [
  { id: 'formato', nome: 'Formato' },
  { id: 'legenda', nome: 'Legenda' },
  { id: 'motions', nome: 'Motions', breve: true },
  { id: 'som', nome: 'Som', breve: true },
  { id: 'pedido', nome: 'Pedido' },
] as const;
const ULTIMO = PASSOS.length - 1;
const CHAVE = 'me-criar-v1';
const PADRAO: Escolhas = { formato: 'FMT-02', legenda: 'LEG-01' };

function ler(): Escolhas {
  try {
    const s = window.localStorage.getItem(CHAVE);
    const v = s ? (JSON.parse(s) as Partial<Escolhas>) : {};
    return {
      formato: FORMATOS.some(f => f.codigo === v.formato) ? v.formato! : PADRAO.formato,
      legenda: LEGENDAS.some(l => l.codigo === v.legenda) ? v.legenda! : PADRAO.legenda,
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

/** O vídeo da pessoa sendo construído: o formato muda o lugar dela, a legenda vem pronta no vídeo (feita pela skill). */
function Palco({ e, som, setSom }: { e: Escolhas; som: boolean; setSom: (v: boolean) => void }) {
  const f = FORMATOS.find(x => x.codigo === e.formato) ?? FORMATOS[0]!;
  const narr = f.id === 'narracao';
  const { video, capa } = videoLegenda(e.legenda, narr);
  const ref = useRef<HTMLVideoElement>(null);
  const tempo = useRef(0);
  // trocar a legenda ou o formato troca o vídeo: continua do mesmo ponto da fala
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
  useEffect(() => { if (ref.current) ref.current.muted = !som; }, [som]);
  return (
    <div className={`cz-palco cz-f-${f.id}`}>
      {f.id !== 'cheia' && (
        <div className="cz-zona">
          <Sparkles aria-hidden="true" />
          <span>Os motions entram aqui</span>
        </div>
      )}
      <div className="cz-pessoa">
        <video ref={ref} key={video} src={video} poster={narr ? undefined : capa} autoPlay muted={!som} loop playsInline
          onTimeUpdate={ev => { tempo.current = ev.currentTarget.currentTime; }} />
      </div>
      <button type="button" className="cz-som" onClick={() => { setSom(!som); eventoProprio('Criar_Som', {}, true); }} aria-pressed={som}>
        {som ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />} {som ? 'Com som' : 'Ouvir'}
      </button>
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
            <li><span>Legenda</span><b>{l.nome}</b></li>
            <li className="cz-resumo-breve"><span>Motions</span><b>em produção</b></li>
            <li className="cz-resumo-breve"><span>Som</span><b>em produção</b></li>
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
              <h2 className="cz-h">Qual legenda?</h2>
              <p className="cz-sub">Cada modelo já vem com a letra, a cor e o jeito de aparecer. É exatamente o que a IA faz no seu vídeo.</p>
              <div className="cz-grade">
                {LEGENDAS.map(x => {
                  const v = videoLegenda(x.codigo, false);
                  const ativo = e.legenda === x.codigo;
                  return (
                    <button key={x.codigo} type="button" className={`cz-cartao ${ativo ? 'ativo' : ''}`} aria-pressed={ativo} onClick={() => escolher('legenda', x.codigo)}>
                      <span className="cz-midia"><VideoLoop src={v.video} poster={v.capa} /></span>
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

          {(passo === 2 || passo === 3) && (
            <div className="cz-breve">
              {passo === 2 ? <Layers aria-hidden="true" /> : <Music aria-hidden="true" />}
              <h2 className="cz-h">{passo === 2 ? 'Motions' : 'Som'}: em produção</h2>
              <p className="cz-sub">{passo === 2
                ? 'Aqui entram os motions prontos (gancho, palavra-chave, lista, gráfico, celular 3D, objeto 3D, mapa, transições...), cada um com o seu vídeo de exemplo. O que você marcar aparece no seu vídeo, ao lado.'
                : 'Aqui entram as trilhas e os efeitos sonoros, cada um com o botão de ouvir no seu vídeo.'}</p>
            </div>
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
