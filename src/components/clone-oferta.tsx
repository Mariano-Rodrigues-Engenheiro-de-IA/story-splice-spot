import { useEffect } from 'react';
import { ArrowUp, Check, CircleCheck, PenLine, Play, ShieldCheck, Sparkles, Video } from 'lucide-react';
import { VslPlayer } from '@/components/vsl-player';
import { Esteira, VideoVivo } from '@/components/pro2';
import { eventoProprio } from '@/lib/pixel';

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

/** A prova: vários vídeos que o clone já gravou, em duas esteiras (anúncios em pé; YouTube e aulas deitados). */
export function GaleriaClone() {
  return <section className="clone-secao clone-galeria" aria-labelledby="clone-galeria-titulo">
    <div className="clone-secao-topo">
      <span className="clone-rotulo">Veja o clone em ação</span>
      <h2 id="clone-galeria-titulo">O meu clone já gravou <em>tudo isso.</em></h2>
      <p>Anúncios, aulas e vídeo para o YouTube. Eu só escrevi o texto, e ele falou com o meu rosto e a minha voz.</p>
    </div>
    <Esteira itens={anuncios} velocidade={45} rotulo="Anúncios gravados pelo clone" render={(v, i, e) => <CartaoClone key={i} v={v} {...e} />} />
    <Esteira itens={longos} velocidade={45} reverso rotulo="Aulas e vídeo do YouTube gravados pelo clone" render={(v, i, e) => <CartaoClone key={i} v={v} deitado {...e} />} />
  </section>;
}

const passos = [
  { icone: <Video />, titulo: 'Você grava uma vez', texto: 'Uma gravação sua, falando normalmente. Dela sai o seu clone, com o seu rosto e a sua voz.' },
  { icone: <PenLine />, titulo: 'Você escreve o texto', texto: 'Para cada vídeo novo, só o texto. Sem câmera, sem cenário, sem regravar.' },
  { icone: <Sparkles />, titulo: 'O clone fala, o Modo Editor edita', texto: 'O clone grava o vídeo, e o Modo Editor deixa pronto para postar.' },
];

export function ComoFunciona() {
  return <section className="clone-secao" aria-labelledby="clone-como">
    <div className="clone-secao-topo"><h2 id="clone-como">Como <em>funciona</em></h2></div>
    <ol className="clone-passos">
      {passos.map((p, i) => <li key={p.titulo}><span className="clone-passo-icone" aria-hidden="true">{p.icone}<b>{i + 1}</b></span><div><strong>{p.titulo}</strong><p>{p.texto}</p></div></li>)}
    </ol>
  </section>;
}

const modulos = [
  { capa: '/img/clone/modulo-01.webp', numero: '01', titulo: 'Comece aqui', texto: 'O que é um clone, as três partes dele (aparência, movimento e voz) e o que você vai precisar.' },
  { capa: '/img/clone/modulo-02.webp', numero: '02', titulo: 'Criando o seu avatar', texto: 'Tela por tela: a conta, a sua foto, a gravação do seu movimento e a sua voz clonada.' },
  { capa: '/img/clone/modulo-03.webp', numero: '03', titulo: 'Criando o vídeo', texto: 'Do texto ao vídeo pronto: a voz em português, a pronúncia certa, o teste de 10 segundos e o download para editar.' },
];

export function Modulos() {
  return <section className="clone-secao" aria-labelledby="clone-aulas">
    <div className="clone-secao-topo"><h2 id="clone-aulas">O que tem <em>dentro</em></h2><p>Um mini curso direto ao ponto, em 3 aulas.</p></div>
    <div className="clone-modulos">
      {modulos.map(m => <article key={m.numero} className="clone-modulo"><img src={m.capa} width={640} height={960} alt={`Aula ${m.numero}: ${m.titulo}`} loading="lazy" /><div><span>Aula {m.numero}</span><strong>{m.titulo}</strong><p>{m.texto}</p></div></article>)}
    </div>
  </section>;
}

const perguntas = [
  { p: 'Preciso pagar a ferramenta do clone?', r: 'Dá para começar no plano grátis da ferramenta, sem cadastrar cartão. No grátis, o vídeo sai com marca d’água e com até um minuto. Para vídeos maiores e sem marca, é o plano pago dela.' },
  { p: 'Preciso saber editar?', r: 'Não. O clone grava, e você manda o vídeo para o Modo Editor, que você acabou de comprar.' },
];

export function Duvidas() {
  return <section className="clone-secao" aria-labelledby="clone-duvidas">
    <div className="clone-secao-topo"><h2 id="clone-duvidas">Dúvidas</h2></div>
    <dl className="clone-faq">
      {perguntas.map(q => <div key={q.p}><dt>{q.p}</dt><dd>{q.r}</dd></div>)}
    </dl>
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
