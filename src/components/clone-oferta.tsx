import { useEffect } from 'react';
import { Check, Clapperboard, Megaphone, PenLine, Play, Presentation, ShieldCheck, Sparkles, Video } from 'lucide-react';
import { VslPlayer } from '@/components/vsl-player';
import { eventoProprio } from '@/lib/pixel';

/* Partes das páginas de pós-compra do Modo Clone: /obrigado (upsell) e /ultima-chance (downsell).
   Os botões seguem o código que o gerador de upsell da Kiwify cria (script v2):
   caixa id="kiwify-upsell-CODIGO" (data-upsell-url / data-downsell-url), botão id="kiwify-upsell-trigger-CODIGO"
   e recusa id="kiwify-upsell-cancel-trigger-CODIGO". No "não", se a caixa tiver data-downsell-url, o script da Kiwify
   leva para essa página junto com o token da compra; sem ele, leva para a área de membros. */

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

/** O vídeo de vendas, no mesmo player da página principal. Sem vídeo ainda: só a moldura, esperando o arquivo. */
export function MidiaClone({ vsl, poster }: { vsl: string; poster: string }) {
  return vsl
    ? <div className="clone-video"><VslPlayer src={vsl} poster={poster || undefined} /></div>
    : <div className="clone-video clone-moldura" aria-label="Vídeo de apresentação do Modo Clone"><span className="clone-moldura-play" aria-hidden="true"><Play /></span></div>;
}

/** O botão de aceitar e o de recusar, dentro da caixa que o script da Kiwify lê. */
export function BotoesKiwify({ codigo, downsellUrl = '', textoSim, textoNao, evento }: { codigo: string; downsellUrl?: string; textoSim: string; textoNao: string; evento: string }) {
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

export function ListaOferta() {
  return <>
    <ul className="clone-oferta-lista">
      <li><Check aria-hidden="true" />3 aulas, tela por tela</li>
      <li><Check aria-hidden="true" />Começa no plano grátis da ferramenta, sem cartão</li>
      <li><Check aria-hidden="true" />Feito para usar junto com o Modo Editor</li>
    </ul>
    <p className="clone-garantia"><ShieldCheck aria-hidden="true" />7 dias de garantia. Se não gostar, você pede o reembolso.</p>
  </>;
}

const passos = [
  { icone: <Video />, titulo: 'Você grava uma vez', texto: 'Uma gravação sua, falando normalmente. Com ela, o seu clone fica com a sua aparência, o seu jeito de mexer e a sua voz.' },
  { icone: <PenLine />, titulo: 'Você escreve o texto', texto: 'Para cada vídeo novo, é só escrever o que você quer falar. Sem câmera, sem cenário, sem repetir frase.' },
  { icone: <Sparkles />, titulo: 'O clone fala, o Modo Editor edita', texto: 'O seu clone grava o vídeo por você, e o Modo Editor deixa pronto para postar.' },
];

export function ComoFunciona() {
  return <section className="clone-secao" aria-labelledby="clone-como">
    <h2 id="clone-como">Como <em>funciona</em></h2>
    <ol className="clone-passos">
      {passos.map((p, i) => <li key={p.titulo}><span className="clone-passo-num">{i + 1}</span><span className="clone-passo-icone" aria-hidden="true">{p.icone}</span><div><strong>{p.titulo}</strong><p>{p.texto}</p></div></li>)}
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
    <h2 id="clone-aulas">O que tem <em>dentro</em></h2>
    <div className="clone-modulos">
      {modulos.map(m => <article key={m.numero} className="clone-modulo"><img src={m.capa} width={640} height={960} alt={`Aula ${m.numero}: ${m.titulo}`} loading="lazy" /><div><span>Aula {m.numero}</span><strong>{m.titulo}</strong><p>{m.texto}</p></div></article>)}
    </div>
  </section>;
}

const usos = [
  { icone: <Presentation />, titulo: 'Aula e explicação', texto: 'Você explica o que domina, e o clone fala por você quantas vezes precisar.' },
  { icone: <Megaphone />, titulo: 'Anúncio', texto: 'Várias versões do mesmo vídeo, mudando só o texto.' },
  { icone: <Clapperboard />, titulo: 'Conteúdo do dia a dia', texto: 'Aquele vídeo que você precisa postar no dia em que não está com cara de gravar.' },
];

export function Usos() {
  return <section className="clone-secao" aria-labelledby="clone-usos">
    <h2 id="clone-usos">Para que <em>serve</em></h2>
    <div className="clone-usos">
      {usos.map(u => <div key={u.titulo} className="clone-uso"><span aria-hidden="true">{u.icone}</span><div><strong>{u.titulo}</strong><p>{u.texto}</p></div></div>)}
    </div>
  </section>;
}

const perguntas = [
  { p: 'Preciso pagar a ferramenta do clone?', r: 'Dá para começar no plano grátis da ferramenta, sem cadastrar cartão. No grátis, o vídeo sai com marca d’água e com até um minuto. Para vídeos maiores e sem marca, é o plano pago dela.' },
  { p: 'Preciso saber editar?', r: 'Não. O clone grava, e você manda o vídeo para o Modo Editor, que você acabou de comprar.' },
  { p: 'E se eu não gostar?', r: 'Você tem 7 dias de garantia. Se não gostar, pede o reembolso.' },
];

export function Duvidas() {
  return <section className="clone-secao" aria-labelledby="clone-duvidas">
    <h2 id="clone-duvidas">Dúvidas</h2>
    <dl className="clone-faq">
      {perguntas.map(q => <div key={q.p}><dt>{q.p}</dt><dd>{q.r}</dd></div>)}
    </dl>
  </section>;
}
