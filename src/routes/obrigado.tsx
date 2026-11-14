import { createFileRoute } from '@tanstack/react-router';
import { siteConfig } from '@/lib/site-config';
import { BotoesKiwify, Duvidas, EuEClone, Fecho, GaleriaClone, MidiaClone, Modulos, PorDentro, Progresso, UmaGravacao, VoceEscreve, brl, useScriptKiwify } from '@/components/clone-oferta';

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
        {/* 13/11: ele tirou o título do produto e o subtítulo. O título agora é o próprio "Espere!", grande: confirma a compra
            e manda ver o recado (como o pós-compra real da Molise: "Espera! Seu Clone já tá liberado. Antes de abrir, assista") */}
        <h1 id="clone-titulo" className="clone-espere">
          <span className="clone-espere-1">Espere!</span>
          <span className="clone-espere-2">O seu produto já está liberado.</span>
          <span className="clone-espere-3">Antes de acessar, veja este recado.</span>
        </h1>
        <MidiaClone vsl={vsl} poster={vslPoster} />
        <BotoesKiwify codigo={kiwifyCodigo} downsellUrl={siteConfig.clone.downsellUrl} evento="Upsell_Clone"
          textoSim={<>Sim, quero o Modo Clone por {brl(price)}</>}
          textoNao="Não, obrigado. Prefiro continuar gravando todos os meus vídeos." />
      </section>

      {/* página rica e diferente da principal (pedido dele, 13/11), com ideias de fora: lado a lado real x clone, roteiro que
          vira fala (HeyGen), anatomia (Tavus), 1 gravação que vira muitos vídeos (Codrops) */}
      <GaleriaClone />
      <EuEClone />
      <VoceEscreve />
      <PorDentro />
      <UmaGravacao />
      <Modulos />
      <Duvidas />
      <Fecho preco={price} frase={<>Grave uma vez. <em>Depois, é só escrever.</em></>} textoBotao={`Quero o Modo Clone por ${brl(price)}`} />
    </main>

    <footer className="clone-rodape">Modo Editor · Modo Clone</footer>
  </div>;
}
