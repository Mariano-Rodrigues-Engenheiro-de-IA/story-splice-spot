import { createFileRoute } from '@tanstack/react-router';
import { ArrowUp, CircleCheck } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { BotoesKiwify, ComoFunciona, Duvidas, ListaOferta, MidiaClone, Modulos, Usos, brl, useScriptKiwify } from '@/components/clone-oferta';

/* /obrigado: a página de obrigado do Modo Editor, que oferece o Modo Clone (upsell de 1 clique da Kiwify).
   A Kiwify manda para cá depois da compra aprovada. No "não", o script da Kiwify leva para o downsell (/ultima-chance). */
export const Route = createFileRoute('/obrigado')({
  head: () => ({ meta: [
    { title: 'Compra aprovada · Modo Editor' },
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Sua compra do Modo Editor foi aprovada.' },
  ] }),
  component: Obrigado,
});

function Obrigado() {
  const { price, kiwifyCodigo, vsl, vslPoster } = siteConfig.clone.upsell;
  useScriptKiwify(kiwifyCodigo, 'obrigado');

  return <div className="page geral clone-pagina">
    <div className="clone-aprovado" role="status"><CircleCheck aria-hidden="true" /><span><b>Compra aprovada!</b> O acesso ao Modo Editor chega no seu e-mail.</span></div>

    <main className="clone-col">
      <section className="clone-topo" aria-labelledby="clone-titulo">
        <p className="clone-espera">Espera, antes de ir para o seu acesso</p>
        <h1 id="clone-titulo">A edição você já resolveu. Agora, <em>o seu clone grava por você.</em></h1>
        <p className="clone-sub">Você escreve o texto, o seu clone fala com o seu rosto e a sua voz, e o Modo Editor edita. Sem ligar a câmera.</p>
        <MidiaClone vsl={vsl} poster={vslPoster} />
      </section>

      <section className="clone-oferta" id="oferta" aria-labelledby="clone-oferta-titulo">
        <div className="clone-oferta-marca"><img src="/img/clone/icone.webp" width={44} height={44} alt="" /><h2 id="clone-oferta-titulo">Modo Clone</h2></div>
        <p className="clone-oferta-desc">Um mini curso direto ao ponto: em 3 aulas, você cria o seu clone e gera o seu primeiro vídeo com ele.</p>
        <div className="clone-preco"><strong>{brl(price)}</strong><span>pagamento único</span></div>
        <BotoesKiwify codigo={kiwifyCodigo} downsellUrl={siteConfig.clone.downsellUrl} textoSim="Sim, quero o Modo Clone" textoNao="Não, obrigado. Quero ir para o meu acesso." evento="Upsell_Clone" />
        <ListaOferta />
      </section>

      <ComoFunciona />
      <Modulos />
      <Usos />
      <Duvidas />

      <section className="clone-fim">
        <p className="clone-fim-frase">Grave uma vez. <em>Depois, é só escrever.</em></p>
        <a href="#oferta" className="clone-sim clone-sim-sobe">Quero o Modo Clone por {brl(price)} <ArrowUp aria-hidden="true" /></a>
      </section>
    </main>

    <footer className="clone-rodape">Modo Editor · Modo Clone</footer>
  </div>;
}
