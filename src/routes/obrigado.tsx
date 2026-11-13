import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { ArrowUp, Check, CircleCheck, Clapperboard, Megaphone, PenLine, Presentation, ShieldCheck, Sparkles, Video } from 'lucide-react';
import { VslPlayer } from '@/components/vsl-player';
import { siteConfig } from '@/lib/site-config';
import { eventoProprio } from '@/lib/pixel';

/* /obrigado: a página de obrigado do Modo Editor, que oferece o Modo Clone (upsell de 1 clique da Kiwify).
   A Kiwify manda para cá depois da compra aprovada. O botão "sim" e o link "não" usam os ids do script da Kiwify. */
export const Route = createFileRoute('/obrigado')({
  head: () => ({ meta: [
    { title: 'Compra aprovada · Modo Editor' },
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Sua compra do Modo Editor foi aprovada.' },
  ] }),
  component: Obrigado,
});

const SCRIPT_KIWIFY = 'https://kiwify-snippets.netlify.app/upsell/upsell.min.js';
const ID_RECUSAR = 'kiwify-upsell-cancel-trigger';
const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: v % 1 ? 2 : 0 }).format(v);

/** O script da Kiwify vai no fim da página, depois que os botões existem. */
function useScriptKiwify() {
  useEffect(() => {
    if (!siteConfig.clone.aceitarId) {
      console.warn('[obrigado] siteConfig.clone.aceitarId vazio: o botão de aceitar ainda não compra. Gere o código na Kiwify.');
    }
    if (document.querySelector(`script[src="${SCRIPT_KIWIFY}"]`)) return;
    const s = document.createElement('script');
    s.src = SCRIPT_KIWIFY;
    document.body.appendChild(s);
  }, []);
}

const passos = [
  { icone: <Video />, titulo: 'Você grava uma vez', texto: 'Uma gravação sua, falando normalmente. Com ela, o seu clone fica com a sua aparência, o seu jeito de mexer e a sua voz.' },
  { icone: <PenLine />, titulo: 'Você escreve o texto', texto: 'Para cada vídeo novo, é só escrever o que você quer falar. Sem câmera, sem cenário, sem repetir frase.' },
  { icone: <Sparkles />, titulo: 'O clone fala, o Modo Editor edita', texto: 'O seu clone grava o vídeo por você, e o Modo Editor deixa pronto para postar.' },
];

const modulos = [
  { capa: '/img/clone/modulo-01.webp', numero: '01', titulo: 'Comece aqui', texto: 'O que é um clone, as três partes dele (aparência, movimento e voz) e o que você vai precisar.' },
  { capa: '/img/clone/modulo-02.webp', numero: '02', titulo: 'Criando o seu avatar', texto: 'Tela por tela: a conta, a sua foto, a gravação do seu movimento e a sua voz clonada.' },
  { capa: '/img/clone/modulo-03.webp', numero: '03', titulo: 'Criando o vídeo', texto: 'Do texto ao vídeo pronto: a voz em português, a pronúncia certa, o teste de 10 segundos e o download para editar.' },
];

const usos = [
  { icone: <Presentation />, titulo: 'Aula e explicação', texto: 'Você explica o que domina, e o clone fala por você quantas vezes precisar.' },
  { icone: <Megaphone />, titulo: 'Anúncio', texto: 'Várias versões do mesmo vídeo, mudando só o texto.' },
  { icone: <Clapperboard />, titulo: 'Conteúdo do dia a dia', texto: 'Aquele vídeo que você precisa postar no dia em que não está com cara de gravar.' },
];

const perguntas = [
  { p: 'Preciso pagar a ferramenta do clone?', r: 'Dá para começar no plano grátis da ferramenta, sem cadastrar cartão. No grátis, o vídeo sai com marca d’água e com até um minuto. Para vídeos maiores e sem marca, é o plano pago dela.' },
  { p: 'Preciso saber editar?', r: 'Não. O clone grava, e você manda o vídeo para o Modo Editor, que você acabou de comprar.' },
  { p: 'E se eu não gostar?', r: 'Você tem 7 dias de garantia. Se não gostar, pede o reembolso.' },
];

function Obrigado() {
  useScriptKiwify();
  const { price, aceitarId, vsl, vslPoster } = siteConfig.clone;

  return <div className="page geral clone-pagina">
    <div className="clone-aprovado" role="status"><CircleCheck aria-hidden="true" /><span><b>Compra aprovada!</b> O acesso ao Modo Editor chega no seu e-mail.</span></div>

    <main className="clone-col">
      <section className="clone-topo" aria-labelledby="clone-titulo">
        <p className="clone-espera">Espera, antes de ir para o seu acesso</p>
        <h1 id="clone-titulo">A edição você já resolveu. Agora, <em>o seu clone grava por você.</em></h1>
        <p className="clone-sub">Você escreve o texto, o seu clone fala com o seu rosto e a sua voz, e o Modo Editor edita. Sem ligar a câmera.</p>
        {vsl
          ? <div className="clone-video"><VslPlayer src={vsl} poster={vslPoster || undefined} /></div>
          : <img className="clone-capa" src="/img/clone/capa.webp" width={1280} height={720} alt="Modo Clone: você escreve, o clone fala" />}
      </section>

      <section className="clone-oferta" id="oferta" aria-labelledby="clone-oferta-titulo">
        <div className="clone-oferta-marca"><img src="/img/clone/icone.webp" width={44} height={44} alt="" /><h2 id="clone-oferta-titulo">Modo Clone</h2></div>
        <p className="clone-oferta-desc">Um mini curso direto ao ponto: em 3 aulas, você cria o seu clone e gera o seu primeiro vídeo com ele.</p>
        <div className="clone-preco"><strong>{brl(price)}</strong><span>pagamento único</span></div>
        <button
          type="button"
          id={aceitarId || undefined}
          className="clone-sim"
          onClick={() => { eventoProprio('Upsell_Clone_Sim'); if (!aceitarId) console.warn('[obrigado] botão sem o id da Kiwify'); }}
        >
          Sim, quero o Modo Clone
        </button>
        <a id={ID_RECUSAR} href="#" className="clone-nao" onClick={() => eventoProprio('Upsell_Clone_Nao')}>Não, obrigado. Quero ir para o meu acesso.</a>
        <ul className="clone-oferta-lista">
          <li><Check aria-hidden="true" />3 aulas, tela por tela</li>
          <li><Check aria-hidden="true" />Começa no plano grátis da ferramenta, sem cartão</li>
          <li><Check aria-hidden="true" />Feito para usar junto com o Modo Editor</li>
        </ul>
        <p className="clone-garantia"><ShieldCheck aria-hidden="true" />7 dias de garantia. Se não gostar, você pede o reembolso.</p>
      </section>

      <section className="clone-secao" aria-labelledby="clone-como">
        <h2 id="clone-como">Como <em>funciona</em></h2>
        <ol className="clone-passos">
          {passos.map((p, i) => <li key={p.titulo}><span className="clone-passo-num">{i + 1}</span><span className="clone-passo-icone" aria-hidden="true">{p.icone}</span><div><strong>{p.titulo}</strong><p>{p.texto}</p></div></li>)}
        </ol>
      </section>

      <section className="clone-secao" aria-labelledby="clone-aulas">
        <h2 id="clone-aulas">O que tem <em>dentro</em></h2>
        <div className="clone-modulos">
          {modulos.map(m => <article key={m.numero} className="clone-modulo"><img src={m.capa} width={640} height={960} alt={`Aula ${m.numero}: ${m.titulo}`} loading="lazy" /><div><span>Aula {m.numero}</span><strong>{m.titulo}</strong><p>{m.texto}</p></div></article>)}
        </div>
      </section>

      <section className="clone-secao" aria-labelledby="clone-usos">
        <h2 id="clone-usos">Para que <em>serve</em></h2>
        <div className="clone-usos">
          {usos.map(u => <div key={u.titulo} className="clone-uso"><span aria-hidden="true">{u.icone}</span><div><strong>{u.titulo}</strong><p>{u.texto}</p></div></div>)}
        </div>
      </section>

      <section className="clone-secao" aria-labelledby="clone-duvidas">
        <h2 id="clone-duvidas">Dúvidas</h2>
        <dl className="clone-faq">
          {perguntas.map(q => <div key={q.p}><dt>{q.p}</dt><dd>{q.r}</dd></div>)}
        </dl>
      </section>

      <section className="clone-fim">
        <p className="clone-fim-frase">Grave uma vez. <em>Depois, é só escrever.</em></p>
        <a href="#oferta" className="clone-sim clone-sim-sobe">Quero o Modo Clone por {brl(price)} <ArrowUp aria-hidden="true" /></a>
      </section>
    </main>

    <footer className="clone-rodape">Modo Editor · Modo Clone</footer>
  </div>;
}
