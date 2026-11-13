import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Check, CircleCheck, PenLine, Play, RotateCcw, ShieldCheck, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { VslPlayer } from '@/components/vsl-player';
import { Esteira, VideoVivo } from '@/components/pro2';
import { eventoProprio } from '@/lib/pixel';
import { siteConfig } from '@/lib/site-config';

/* Partes das páginas de pós-compra do Modo Clone: /obrigado (upsell) e /ultima-chance (downsell).
   Estrutura (pesquisa de mercado de 13/11/2026): primeira dobra só com progresso, aviso, vídeo e os dois botões;
   depois, a prova (cenas feitas pelo clone), como funciona, as aulas, duas dúvidas e o fecho, que sobe para o botão.
   Os botões seguem o código que o gerador de upsell da Kiwify cria (script v2):
   caixa id="kiwify-upsell-CODIGO" (data-upsell-url / data-downsell-url), botão id="kiwify-upsell-trigger-CODIGO"
   e recusa id="kiwify-upsell-cancel-trigger-CODIGO". No "não", se a caixa tiver data-downsell-url, o script da Kiwify
   leva para essa página junto com o token da compra; sem ele, leva para a área de membros. Os ids só podem existir
   uma vez na página: o botão do fecho só sobe até o botão de cima. */

const SCRIPT_KIWIFY = 'https://snippets.kiwify.com/upsell-v2/upsell.min.js';

export const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: v % 1 ? 2 : 0 }).format(v);

/** O script da Kiwify vai no fim da página, depois que os botões existem (ele procura os ids na hora em que carrega). */
export function useScriptKiwify(codigo: string, pagina: string) {
  useEffect(() => {
    if (!codigo) console.warn(`[${pagina}] sem o código da Kiwify: o botão de aceitar ainda não compra. Gere o código no gerador de upsell.`);
    if (document.querySelector(`script[src="${SCRIPT_KIWIFY}"]`)) return;
    const s = document.createElement('script');
    s.src = SCRIPT_KIWIFY;
    document.body.appendChild(s);
  }, [codigo, pagina]);
}

/** Faixa do topo: a compra do Modo Editor já foi aprovada, e em que passo do pedido a pessoa está. */
export function Progresso({ passo }: { passo: 2 | 3 }) {
  return <div className="clone-progresso" role="status">
    <p><CircleCheck aria-hidden="true" /><b>Compra aprovada</b><span>Passo {passo} de 3</span></p>
    <div className="clone-progresso-barra" aria-hidden="true"><i style={{ width: passo === 2 ? '66%' : '90%' }} /></div>
  </div>;
}

/** O vídeo de vendas, no mesmo player da página principal. Sem vídeo ainda: só a moldura, esperando o arquivo. */
export function MidiaClone({ vsl, poster }: { vsl: string; poster: string }) {
  return vsl
    ? <div className="clone-video"><VslPlayer src={vsl} poster={poster || undefined} /></div>
    : <div className="clone-video clone-moldura" aria-label="Vídeo de apresentação do Modo Clone"><span className="clone-moldura-play" aria-hidden="true"><Play /></span></div>;
}

/** O botão de aceitar e o de recusar, dentro da caixa que o script da Kiwify lê. */
export function BotoesKiwify({ codigo, downsellUrl = '', textoSim, textoNao, evento }: { codigo: string; downsellUrl?: string; textoSim: React.ReactNode; textoNao: string; evento: string }) {
  const k = codigo;
  return <div id={k ? `kiwify-upsell-${k}` : undefined} data-upsell-url="" data-downsell-url={downsellUrl} className="clone-kiwify">
    <button type="button" id={k ? `kiwify-upsell-trigger-${k}` : undefined} className="clone-sim" onClick={() => eventoProprio(`${evento}_Sim`)}>
      {textoSim}
    </button>
    <button type="button" id={k ? `kiwify-upsell-cancel-trigger-${k}` : undefined} className="clone-nao" onClick={() => eventoProprio(`${evento}_Nao`)}>
      {textoNao}
    </button>
  </div>;
}

/* Vídeos diferentes que o clone já gravou (um trecho curto de cada, sem som). Aqui não importa a edição de cada um,
   e sim a quantidade e a variedade: anúncios em pé, YouTube e as aulas deitados (sem cortar para 9:16, que cortava
   legenda e painéis). Fontes: criativos 13, 09 e 10; youtube/01-capcut-morreu; aulas 1 e 2 do Modo Clone; aula 3 =
   o vídeo do clone gerado (a edição ainda não estava pronta em 13/11). Na aula 2, o trecho de 2:36 a 5:12 é ele de
   verdade: o recorte daqui é de antes disso. */
type VideoClone = { src: string; tipo: string; titulo: string; duracao: string };
const anuncios: VideoClone[] = [
  { src: '/videos/clone/anuncio-ilustra.mp4', tipo: 'Anúncio', titulo: 'A IA ilustra o que você fala', duracao: '1 min' },
  { src: '/videos/clone/anuncio-profissoes.mp4', tipo: 'Anúncio', titulo: 'Psicólogo, fisio e arquiteto', duracao: '1 min 20 s' },
  { src: '/videos/clone/anuncio-descoberta.mp4', tipo: 'Anúncio', titulo: 'A IA que você já usa edita vídeo', duracao: '40 s' },
];
const longos: VideoClone[] = [
  { src: '/videos/clone/youtube-capcut.mp4', tipo: 'YouTube', titulo: 'O CapCut morreu?', duracao: '8 min' },
  { src: '/videos/clone/aula-1.mp4', tipo: 'Aula', titulo: 'Aula 1 do Modo Clone', duracao: '3 min' },
  { src: '/videos/clone/aula-2.mp4', tipo: 'Aula', titulo: 'Aula 2 do Modo Clone', duracao: '8 min' },
  { src: '/videos/clone/aula-3.mp4', tipo: 'Aula', titulo: 'Aula 3 do Modo Clone', duracao: '10 min' },
];

function CartaoClone({ v, deitado, copia, ativo, perto }: { v: VideoClone; deitado?: boolean; copia: boolean; ativo: boolean; perto: boolean }) {
  return <li className={`clone-cena${deitado ? ' deitado' : ''}`} aria-hidden={copia || undefined}>
    {/* a legenda fica embaixo do vídeo, não por cima: a boca do clone falando é a prova */}
    <div className="clone-cena-video" style={{ backgroundImage: `url(${v.src.replace(/\.mp4$/, '.webp')})` }}>
      <VideoVivo src={v.src} ativo={ativo} perto={perto} label={`${v.tipo}: ${v.titulo}`} />
      <span className="gallery-tag">{v.tipo}</span>
    </div>
    <p className="clone-cena-legenda"><strong>{v.titulo}</strong><span>{v.tipo} de {v.duracao}</span></p>
  </li>;
}

/** A prova: vários vídeos que o clone já gravou e o Modo Editor editou, em duas esteiras (anúncios em pé; YouTube e
 *  aulas deitados). O gatilho (ideia dele, 13/11): o clone é a peça que falta para quem já comprou o Modo Editor. */
export function GaleriaClone() {
  return <section className="clone-secao clone-galeria" aria-labelledby="clone-galeria-titulo">
    {/* 13/11: ele trocou o "Modo Clone + Modo Editor = combo perfeito" (quem acabou de comprar pode nem saber o que é o
        Modo Editor) por este título, na mesma tipografia grande: linha fina itálica + linha forte em roxo */}
    <div className="clone-secao-topo">
      <h2 id="clone-galeria-titulo" className="clone-titulo-grande"><span className="clone-t-fina">Vídeos gerados</span> <span className="clone-t-forte">pelo meu clone</span></h2>
      <p>Anúncios, aulas e vídeo para o YouTube. Eu só escrevi o texto, e ele falou com o meu rosto e a minha voz.</p>
    </div>
    <Esteira itens={anuncios} velocidade={45} rotulo="Anúncios gravados pelo clone" render={(v, i, e) => <CartaoClone key={i} v={v} {...e} />} />
    <Esteira itens={longos} velocidade={45} reverso rotulo="Aulas e vídeo do YouTube gravados pelo clone" render={(v, i, e) => <CartaoClone key={i} v={v} deitado {...e} />} />
  </section>;
}

/** Liga quando o elemento entra na tela (e desliga quando sai). Só troca estado; a animação fica no CSS. */
function useNaTelaClone<T extends HTMLElement>(limiar = 0.35) {
  const ref = useRef<T>(null);
  const [na, setNa] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNa(!!e?.isIntersecting), { threshold: limiar });
    io.observe(el);
    return () => io.disconnect();
  }, [limiar]);
  return [ref, na] as const;
}

/* ───────── Eu e o meu clone (pedido dele, 13/11): os dois em 9:16, lado a lado, falando; toque para ouvir cada um ─────────
   Eu: a gravação real da DICA da aula 2 (Desktop/MATERIAL PARA AULA 2 - MODO CLONE/DICA.mp4, 187,9 s + 8,1 s: "se eu colocar
   aqui lado a lado com o clone, ele fica fazendo as mesmas expressões que eu"). Clone: o bruto do clone da aula 2
   (D:/aula2clone/bruto/aula2.mp4, 103,8 s + 9,4 s, frase sem o nome da ferramenta). Os dois com a mesma camisa preta. */
const ladoALado = [
  { src: '/videos/clone/eu-real.mp4', quem: 'Eu', nota: 'gravado de verdade', classe: 'real' },
  { src: '/videos/clone/eu-clone.mp4', quem: 'Meu clone', nota: 'eu só escrevi o texto', classe: 'clone' },
];

export function EuEClone() {
  const [caixa, naTela] = useNaTelaClone<HTMLDivElement>(0.3);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [som, setSom] = useState<number | null>(null);
  useEffect(() => {
    videos.current.forEach(v => { if (!v) return; if (naTela) void v.play().catch(() => undefined); else { v.pause(); v.muted = true; } });
    if (!naTela) setSom(null);
  }, [naTela]);
  // o som liga dentro do próprio toque (o iPhone só deixa assim)
  const ouvir = (i: number) => {
    const v = videos.current[i];
    if (!v) return;
    if (som === i) { v.muted = true; setSom(null); return; }
    videos.current.forEach((o, j) => { if (o && j !== i) o.muted = true; });
    v.currentTime = 0;
    v.muted = false;
    void v.play().catch(() => { v.muted = true; setSom(null); });
    setSom(i);
    eventoProprio('Clone_Ouvir', { quem: ladoALado[i]!.classe });
  };
  return <section className="clone-secao clone-lado" aria-labelledby="clone-lado-titulo">
    <div className="clone-secao-topo">
      <h2 id="clone-lado-titulo" className="clone-titulo-grande"><span className="clone-t-fina">Lado a lado:</span> <span className="clone-t-forte">eu e o meu clone</span></h2>
      <p>A mesma pessoa, a mesma camisa. Um eu gravei. O outro, eu só escrevi o texto. Toque em cada um para ouvir.</p>
    </div>
    <div className="clone-lado-par" ref={caixa}>
      {ladoALado.map((l, i) => <figure key={l.classe} className={`clone-lado-item ${l.classe}${som === i ? ' ouvindo' : ''}`}>
        <div className="clone-lado-video">
          <video ref={el => { videos.current[i] = el; }} src={l.src} poster={l.src.replace(/\.mp4$/, '.webp')} muted loop playsInline preload="none" aria-label={l.quem} />
          <span className="clone-lado-quem">{l.quem}</span>
          <button type="button" className="clone-lado-ouvir" onClick={() => ouvir(i)} aria-pressed={som === i}>
            {som === i ? <><Volume2 aria-hidden="true" />Ouvindo</> : <><VolumeX aria-hidden="true" />Ouvir</>}
          </button>
        </div>
        <figcaption>{l.nota}</figcaption>
      </figure>)}
    </div>
  </section>;
}

/* ───────── Você escreve, ele fala: o texto aparece sendo digitado; no "Gerar", o clone fala e cada palavra acende ─────────
   Texto e vídeo reais do criativo 13 (TEXTO-CLONE.txt; bruto do clone criativos/13-a-ia-ilustra/bruto/heygen.mp4 de 28,6 s
   a 40,2 s). O tempo de cada palavra vem de D:/criativo13/work/linha.json (mesma linha do tempo do bruto, conferido). */
const roteiro = 'Agora pensa no próximo vídeo que você vai gravar. Aquele em que você explica uma coisa que só você sabe explicar. Imagina que, enquanto você fala, a explicação aparece na tela.';
const temposRoteiro = [0.32, 0.44, 0.72, 0.92, 1.12, 1.48, 1.64, 1.8, 1.96, 2.92, 3.2, 3.48, 3.64, 3.88, 4.28, 4.4, 4.72, 5.24, 5.48, 5.76, 6.08, 7.52, 7.8, 8.56, 8.76, 9.08, 9.96, 10.08, 10.44, 10.8, 11.08];

export function VoceEscreve() {
  const palavras = roteiro.split(' ');
  const [caixa, naTela] = useNaTelaClone<HTMLDivElement>(0.4);
  const [digitou, setDigitou] = useState(false);
  const [estado, setEstado] = useState<'espera' | 'falando' | 'fim'>('espera');
  const video = useRef<HTMLVideoElement>(null);
  const spans = useRef<(HTMLSpanElement | null)[]>([]);
  const quadro = useRef(0);
  const marcar = (atual: number) => spans.current.forEach((s, i) => { if (!s) return; s.classList.toggle('dita', i < atual); s.classList.toggle('agora', i === atual); });
  useEffect(() => { if (naTela) setDigitou(true); }, [naTela]);
  useEffect(() => () => cancelAnimationFrame(quadro.current), []);
  useEffect(() => {
    const v = video.current;
    if (!naTela && v && !v.paused) { v.pause(); cancelAnimationFrame(quadro.current); setEstado('espera'); marcar(-1); }
  }, [naTela]);
  const acompanhar = () => {
    const v = video.current;
    if (!v) return;
    let atual = -1;
    for (let i = 0; i < temposRoteiro.length; i++) if (v.currentTime >= temposRoteiro[i]!) atual = i;
    marcar(atual);
    if (!v.paused && !v.ended) quadro.current = requestAnimationFrame(acompanhar);
  };
  const gerar = () => {
    const v = video.current;
    if (!v) return;
    marcar(-1);
    v.currentTime = 0;
    v.muted = false;
    void v.play().then(() => { setEstado('falando'); cancelAnimationFrame(quadro.current); quadro.current = requestAnimationFrame(acompanhar); }).catch(() => undefined);
    eventoProprio('Clone_Gerar');
  };
  return <section className="clone-secao clone-escreve" aria-labelledby="clone-escreve-titulo">
    <div className="clone-secao-topo">
      <h2 id="clone-escreve-titulo" className="clone-titulo-grande"><span className="clone-t-fina">Você escreve,</span> <span className="clone-t-forte">ele fala</span></h2>
      <p>Este texto eu escrevi para um anúncio. O vídeo é o que o clone gravou com ele. Toque em gerar.</p>
    </div>
    <div className={`clone-escreve-palco${digitou ? ' digitando' : ''}`} data-estado={estado} ref={caixa}>
      <div className="clone-roteiro">
        <div className="clone-roteiro-topo"><PenLine aria-hidden="true" /><span>Roteiro</span><i>o texto que eu escrevi</i></div>
        <p>{palavras.map((p, i) => <span key={i} ref={el => { spans.current[i] = el; }} style={{ '--i': i } as React.CSSProperties}>{p} </span>)}<b className="clone-cursor" aria-hidden="true" /></p>
      </div>
      <div className="clone-escreve-video">
        <video ref={video} src="/videos/clone/escreve.mp4" poster="/videos/clone/escreve.webp" playsInline preload="none"
          onEnded={() => { cancelAnimationFrame(quadro.current); setEstado('fim'); marcar(temposRoteiro.length); }} aria-label="O clone falando o texto do roteiro" />
        {estado !== 'falando' && <button type="button" className="clone-gerar" onClick={gerar}>
          {estado === 'fim' ? <><RotateCcw aria-hidden="true" />Gerar de novo</> : <><Sparkles aria-hidden="true" />Gerar o vídeo</>}
        </button>}
      </div>
    </div>
  </section>;
}

/* ───────── Por dentro do clone: o que vem de onde (fatos ditos pelo próprio clone na aula 2) ─────────
   "quem define a aparência é a foto"; "o vídeo capta o movimento dos seus olhos e da sua boca ao falar"; "o avatar só faz
   os gestos que você grava, e o áudio desse vídeo vira sua voz"; "ela cria 3 opções, ouça cada uma". Vídeo: bruto do clone
   da aula 1 (D:/aula1clone/bruto2/heygen_fundo.mp4, 80 s + 7 s). */
const partes = [
  { nome: 'Rosto', texto: 'Vem de uma foto sua. É ela que define a aparência.', lado: 'dir', y: 17 },
  { nome: 'Olhos e boca', texto: 'O vídeo de movimento ensina como eles se mexem quando você fala.', lado: 'esq', y: 47 },
  { nome: 'Voz', texto: 'Sai do áudio da sua gravação. Você ouve as opções e fica com a que soa como você.', lado: 'dir', y: 64 },
  { nome: 'Gestos', texto: 'Ele só faz os gestos que você gravou.', lado: 'esq', y: 84 },
];

export function PorDentro() {
  const [caixa, naTela] = useNaTelaClone<HTMLDivElement>(0.35);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => { const v = video.current; if (!v) return; if (naTela) void v.play().catch(() => undefined); else v.pause(); }, [naTela]);
  return <section className="clone-secao clone-dentro" aria-labelledby="clone-dentro-titulo">
    <div className="clone-secao-topo">
      <h2 id="clone-dentro-titulo" className="clone-titulo-grande"><span className="clone-t-fina">Por dentro</span> <span className="clone-t-forte">do clone</span></h2>
      <p>Não é uma foto com a boca mexendo. Cada parte vem de você.</p>
    </div>
    <div className={`clone-dentro-palco${naTela ? ' ligado' : ''}`} ref={caixa}>
      <video ref={video} src="/videos/clone/anatomia.mp4" poster="/videos/clone/anatomia.webp" muted loop playsInline preload="none" aria-hidden="true" />
      <span className="clone-dentro-varre" aria-hidden="true" />
      {partes.map((p, i) => <span key={p.nome} className={`clone-dentro-pino ${p.lado}`} style={{ top: `${p.y}%`, '--i': i } as React.CSSProperties} aria-hidden="true"><i />{p.nome}</span>)}
    </div>
    <ol className="clone-dentro-lista">
      {partes.map((p, i) => <li key={p.nome}><b>{String(i + 1).padStart(2, '0')}</b><div><strong>{p.nome}</strong><p>{p.texto}</p></div></li>)}
    </ol>
  </section>;
}

/* ───────── Uma gravação, vídeos para sempre: 1 quadro dele de verdade se divide em 2, 4, 8 e 16 vídeos do clone ─────────
   Sequência em CSS puro (camadas com atraso), ligada quando a seção aparece: etapas em JS travaram no iPhone dele. */
const capas = ['eu-clone', 'anuncio-ilustra', 'youtube-capcut', 'anuncio-profissoes', 'aula-1', 'escreve', 'anuncio-descoberta', 'aula-2', 'anatomia', 'aula-3'].map(n => `/videos/clone/${n}.webp`);
const etapas = [{ c: 2, r: 1 }, { c: 2, r: 2 }, { c: 4, r: 2 }, { c: 4, r: 4 }];

export function UmaGravacao() {
  const [caixa, naTela] = useNaTelaClone<HTMLDivElement>(0.45);
  return <section className="clone-secao clone-mult" aria-labelledby="clone-mult-titulo">
    <div className="clone-secao-topo">
      <h2 id="clone-mult-titulo" className="clone-titulo-grande"><span className="clone-t-fina">Uma gravação.</span> <span className="clone-t-forte">Vídeos para sempre.</span></h2>
      <p>Você grava uma vez para criar o clone. Depois, cada vídeo novo é só um texto novo.</p>
    </div>
    <div className={`clone-mult-palco${naTela ? ' roda' : ''}`} ref={caixa} role="img" aria-label="Uma gravação de verdade que vira 2, 4, 8 e 16 vídeos do clone">
      <div className="clone-mult-camada base"><img src="/videos/clone/gravacao-real.webp" alt="" width={540} height={960} loading="lazy" /></div>
      {etapas.map((e, k) => <div key={k} className="clone-mult-camada" style={{ gridTemplateColumns: `repeat(${e.c}, 1fr)`, gridTemplateRows: `repeat(${e.r}, 1fr)`, '--k': k } as React.CSSProperties}>
        {Array.from({ length: e.c * e.r }, (_, i) => <img key={i} src={capas[(i + k * 3) % capas.length]} alt="" loading="lazy" />)}
      </div>)}
      <div className="clone-mult-conta" aria-hidden="true">
        <span className="base">1 gravação sua</span>
        {etapas.map((e, k) => <span key={k} style={{ '--k': k } as React.CSSProperties}>{e.c * e.r} vídeos{k === etapas.length - 1 ? '…' : ''}</span>)}
      </div>
    </div>
  </section>;
}

/* ───────── Quanto custa cada vídeo: recibo honesto (ninguém no mercado mostra o número) ─────────
   Fontes: página de preços da ferramenta lida em 13/11/2026 (grátis: 3 vídeos/mês, até 1 min, marca d'água, 1 avatar;
   plano de entrada US$ 29/mês ou US$ 24/mês no anual, 600 créditos, sem marca, até 30 min) e créditos medidos nos vídeos dele
   (modo rápido: 64,8 s = 22 créditos, ~20/min; modo mais realista: aula 2 = 264 em 5:30, 48/min). 600/20 = 30 min; 600/48 = 12 min. */
export function Custo() {
  return <section className="clone-secao clone-custo" aria-labelledby="clone-custo-titulo">
    <div className="clone-secao-topo">
      <h2 id="clone-custo-titulo" className="clone-titulo-grande"><span className="clone-t-fina">Quanto custa</span> <span className="clone-t-forte">cada vídeo</span></h2>
      <p>O curso é pagamento único. A ferramenta do clone é à parte, e começa no grátis. Sem letra miúda:</p>
    </div>
    <div className="clone-recibo">
      <p className="clone-recibo-cab">Recibo do clone</p>
      <dl>
        <div><dt>Para começar</dt><dd>US$ 0</dd></div>
        <p className="clone-recibo-obs">Plano grátis, sem cartão: 3 vídeos por mês, até 1 minuto, com marca d’água. Já cria o seu clone.</p>
        <div><dt>Plano de entrada</dt><dd>US$ 29<small>/mês</small></dd></div>
        <p className="clone-recibo-obs">600 créditos por mês, sem marca d’água, vídeos de até 30 minutos. No anual, sai US$ 24 por mês.</p>
        <div><dt>1 minuto de vídeo</dt><dd>~20 créditos</dd></div>
        <p className="clone-recibo-obs">No modo rápido. No modo mais realista, ~48 créditos.</p>
      </dl>
      <div className="clone-recibo-total"><span>Sai por volta de</span><strong>US$ 1</strong><span>por minuto de vídeo</span></div>
      <p className="clone-recibo-pe">600 créditos rendem ~30 min por mês no modo rápido, ou ~12 min no mais realista. Preços da ferramenta em 13/11/2026; créditos medidos nos meus vídeos. Podem mudar.</p>
    </div>
  </section>;
}

const modulos = [
  { capa: '/img/clone/modulo-01.webp', numero: '01', titulo: 'Comece aqui', texto: 'O que é um clone, as três partes dele (aparência, movimento e voz) e o que você vai precisar.' },
  { capa: '/img/clone/modulo-02.webp', numero: '02', titulo: 'Criando o seu avatar', texto: 'Tela por tela: a conta, a sua foto, a gravação do seu movimento e a sua voz clonada.' },
  { capa: '/img/clone/modulo-03.webp', numero: '03', titulo: 'Criando o vídeo', texto: 'Do texto ao vídeo pronto: a voz em português, a pronúncia certa, o teste de 10 segundos e o download para editar.' },
];

/** As 3 aulas. Cada capa aparece "sendo gerada", com uma linha roxa varrendo de cima para baixo, quando entra na tela. */
export function Modulos() {
  const [caixa, naTela] = useNaTelaClone<HTMLDivElement>(0.25);
  const [viu, setViu] = useState(false);
  useEffect(() => { if (naTela) setViu(true); }, [naTela]);
  return <section className="clone-secao" aria-labelledby="clone-aulas">
    <div className="clone-secao-topo"><h2 id="clone-aulas" className="clone-titulo-grande"><span className="clone-t-fina">O que tem</span> <span className="clone-t-forte">dentro</span></h2><p>Um mini curso direto ao ponto, em 3 aulas.</p></div>
    <div className={`clone-modulos${viu ? ' revelado' : ''}`} ref={caixa}>
      {modulos.map((m, i) => <article key={m.numero} className="clone-modulo" style={{ '--i': i } as React.CSSProperties}>
        <span className="clone-modulo-capa"><img src={m.capa} width={640} height={960} alt={`Aula ${m.numero}: ${m.titulo}`} loading="lazy" /></span>
        <div><span>Aula {m.numero}</span><strong>{m.titulo}</strong><p>{m.texto}</p></div>
      </article>)}
    </div>
  </section>;
}

const perguntas = [
  { p: 'Preciso pagar a ferramenta do clone?', r: 'Dá para começar no plano grátis da ferramenta, sem cadastrar cartão. No grátis, o vídeo sai com marca d’água e com até um minuto. Para vídeos maiores e sem marca, é o plano pago dela.' },
  { p: 'Preciso saber editar?', r: 'Não. O clone grava, e você manda o vídeo para o Modo Editor, que você acabou de comprar.' },
];

/** Dúvidas. Quando existirem os vídeos do clone respondendo (siteConfig.clone.perguntas), viram "Pergunte ao clone". */
export function Duvidas() {
  const comVideo = siteConfig.clone.perguntas.filter(q => q.video);
  if (comVideo.length) return <PergunteAoClone itens={comVideo} />;
  return <section className="clone-secao" aria-labelledby="clone-duvidas">
    <div className="clone-secao-topo"><h2 id="clone-duvidas" className="clone-titulo-grande"><span className="clone-t-fina">Ficou alguma</span> <span className="clone-t-forte">dúvida?</span></h2></div>
    <dl className="clone-faq">
      {perguntas.map(q => <div key={q.p}><dt>{q.p}</dt><dd>{q.r}</dd></div>)}
    </dl>
  </section>;
}

/** "Pergunte ao clone" (ideia das páginas da Tavus e da D-ID): a pessoa toca numa dúvida e o próprio clone responde em vídeo.
 *  As respostas são frases que o clone já falou na aula 2 (ver siteConfig.clone.perguntas); o som liga no próprio toque. */
function PergunteAoClone({ itens }: { itens: { pergunta: string; video: string }[] }) {
  const video = useRef<HTMLVideoElement>(null);
  const [atual, setAtual] = useState<number | null>(null);
  const perguntar = (i: number) => {
    const v = video.current;
    if (!v) return;
    v.src = itens[i]!.video;
    v.muted = false;
    void v.play().catch(() => undefined);
    v.parentElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); // a resposta fica à vista
    setAtual(i);
    eventoProprio('Clone_Pergunta', { pergunta: itens[i]!.pergunta });
  };
  return <section className="clone-secao clone-pergunte" aria-labelledby="clone-pergunte-titulo">
    <div className="clone-secao-topo">
      <h2 id="clone-pergunte-titulo" className="clone-titulo-grande"><span className="clone-t-fina">Ficou com dúvida?</span> <span className="clone-t-forte">Pergunte ao clone</span></h2>
      <p>Toque numa pergunta. Quem responde é o meu clone.</p>
    </div>
    <div className="clone-pergunte-palco">
      <div className="clone-pergunte-video">
        <video ref={video} poster={itens[0]!.video.replace(/\.mp4$/, '.webp')} playsInline preload="none" onEnded={() => setAtual(null)} aria-label="O clone respondendo" />
        {atual === null && <span className="clone-pergunte-espera">Escolha uma pergunta</span>}
      </div>
      <ul className="clone-pergunte-lista">
        {itens.map((q, i) => <li key={q.pergunta}><button type="button" className={atual === i ? 'ativa' : undefined} onClick={() => perguntar(i)}>{q.pergunta}</button></li>)}
      </ul>
    </div>
  </section>;
}

/** Fecho: o resumo da oferta com a garantia, e um botão que sobe até os botões da Kiwify, no topo. */
export function Fecho({ preco, precoDe = 0, frase, textoBotao }: { preco: number; precoDe?: number; frase: React.ReactNode; textoBotao: string }) {
  return <section className="clone-secao clone-fim" aria-labelledby="clone-fim-titulo">
    <div className="clone-fim-caixa">
      <div className="clone-oferta-marca"><img src="/img/clone/icone.webp" width={44} height={44} alt="" /><h2 id="clone-fim-titulo">Modo Clone</h2></div>
      <p className="clone-fim-frase">{frase}</p>
      <ul className="clone-oferta-lista">
        <li><Check aria-hidden="true" />3 aulas, tela por tela</li>
        <li><Check aria-hidden="true" />Começa no plano grátis da ferramenta, sem cartão</li>
        <li><Check aria-hidden="true" />Feito para usar junto com o Modo Editor</li>
      </ul>
      <div className="clone-preco">
        {precoDe > preco && <s className="clone-preco-de">de {brl(precoDe)}</s>}
        <strong>{brl(preco)}</strong><span>pagamento único, sem mensalidade</span>
      </div>
      <a href="#oferta" className="clone-sim clone-sim-sobe">{textoBotao} <ArrowUp aria-hidden="true" /></a>
      <p className="clone-garantia"><ShieldCheck aria-hidden="true" />7 dias de garantia. Se não gostar, você pede o reembolso.</p>
    </div>
  </section>;
}
