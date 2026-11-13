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

/* Cenas do criativo 13 (aprovado em 2/11/2026), feito inteiro pelo clone: ele só escreveu o texto.
   Cada cena vai do começo ao fim de uma frase; a frase entre aspas é o texto que ele escreveu para o clone falar. */
const cenas = [
  { src: '/videos/clone/lugar.mp4', titulo: 'Mapa de satélite', texto: 'Se eu falo de um lugar, aparece o lugar, visto do satélite.' },
  { src: '/videos/clone/cenario.mp4', titulo: 'Troca de cenário', texto: 'Você pode escolher o cenário que quiser.' },
  { src: '/videos/clone/corpo.mp4', titulo: 'Corpo em 3D', texto: 'Se eu falo do corpo, ela mostra o corpo por dentro.' },
  { src: '/videos/clone/historia.mp4', titulo: 'História em cenas', texto: 'Quer contar uma história? Ela ganha cenas.' },
  { src: '/videos/clone/ideia.mp4', titulo: 'Objeto em 3D', texto: 'Se eu falo de uma ideia, ela vira um objeto na minha frente.' },
  { src: '/videos/clone/figuras.mp4', titulo: 'Animação e gráfico', texto: 'Quer uma animação, um gráfico, uma figura? É só falar.' },
  { src: '/videos/clone/ilustra.mp4', titulo: 'Abertura de anúncio', texto: 'Agora a inteligência artificial ilustra o que você está falando.' },
];

/** A prova: cenas de um anúncio que o clone gravou, na mesma esteira da galeria da página principal. */
export function GaleriaClone() {
  return <section className="clone-secao clone-galeria" aria-labelledby="clone-galeria-titulo">
    <div className="clone-secao-topo">
      <span className="clone-rotulo">Veja o clone em ação</span>
      <h2 id="clone-galeria-titulo">Nenhuma dessas cenas <em>foi gravada por mim.</em></h2>
      <p>Eu só escrevi o texto. Quem fala é o meu clone, com o meu rosto e a minha voz. O Modo Editor fez o resto.</p>
    </div>
    <Esteira itens={cenas} velocidade={60} rotulo="Cenas gravadas pelo clone" render={(c, i, { copia, ativo, perto }) =>
      <li key={i} className="clone-cena" aria-hidden={copia || undefined}>
        {/* a legenda fica embaixo do vídeo, não por cima: a boca do clone falando é a prova */}
        <div className="clone-cena-video" style={{ backgroundImage: `url(${c.src.replace(/\.mp4$/, '.webp')})` }}>
          <VideoVivo src={c.src} ativo={ativo} perto={perto} label={c.titulo} />
          <span className="gallery-tag">Clone</span>
        </div>
        <p className="clone-cena-legenda"><strong>{c.titulo}</strong><span>“{c.texto}”</span></p>
      </li>} />
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
