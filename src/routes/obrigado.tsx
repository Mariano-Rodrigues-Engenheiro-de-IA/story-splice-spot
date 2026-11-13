import { createFileRoute } from '@tanstack/react-router';
import { siteConfig } from '@/lib/site-config';
import { BotoesKiwify, ComoFunciona, Duvidas, Fecho, GaleriaClone, MidiaClone, Modulos, Progresso, brl, useScriptKiwify } from '@/components/clone-oferta';

/* /obrigado: a página de obrigado do Modo Editor, que oferece o Modo Clone (upsell de 1 clique da Kiwify).
   A Kiwify manda para cá depois da compra aprovada. No "não", o script da Kiwify leva para o downsell (/ultima-chance).
   Primeira dobra: só o progresso, o aviso, o vídeo e os dois botões. O resto fica para quem rolar. */
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
    <Progresso passo={2} />

    <main className="clone-col">
      <section className="clone-topo" id="oferta" aria-labelledby="clone-titulo">
        <p className="clone-espera"><b>Espere!</b> Seu pedido ainda não está completo</p>
        <h1 id="clone-titulo">Agora, o seu clone <em>grava por você.</em></h1>
        <p className="clone-sub">Você escreve o texto. Ele fala com o seu rosto e a sua voz.</p>
        <MidiaClone vsl={vsl} poster={vslPoster} />
        <BotoesKiwify codigo={kiwifyCodigo} downsellUrl={siteConfig.clone.downsellUrl} evento="Upsell_Clone"
          textoSim={<>Sim, quero o Modo Clone por {brl(price)}</>}
          textoNao="Não, obrigado. Prefiro continuar gravando todos os meus vídeos." />
      </section>

      <GaleriaClone />
      <ComoFunciona />
      <Modulos />
      <Duvidas />
      <Fecho preco={price} frase={<>Grave uma vez. <em>Depois, é só escrever.</em></>} textoBotao={`Quero o Modo Clone por ${brl(price)}`} />
    </main>

    <footer className="clone-rodape">Modo Editor · Modo Clone</footer>
  </div>;
}
