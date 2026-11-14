import { createFileRoute } from '@tanstack/react-router';
import { siteConfig } from '@/lib/site-config';
import { BotoesKiwify, Duvidas, EuEClone, Fecho, GaleriaClone, MidiaClone, Modulos, PorDentro, Progresso, UmaGravacao, VoceEscreve, brl, useRevelarDepoisDoRecado, useScriptKiwify } from '@/components/clone-oferta';

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
  const { price, kiwifyCodigo, vsl, vslPoster, revelarEm, revelarMaximo } = siteConfig.clone.upsell;
  useScriptKiwify(kiwifyCodigo, 'obrigado');
  // o Sim, as parcelas e o resto da página só aparecem depois do recado (o "não" fica sempre à vista)
  const revelado = useRevelarDepoisDoRecado(revelarEm, revelarMaximo);

  return <div className="page geral clone-pagina">
    {/* 1ª dobra (pedido dele, 14/11): o aviso, a compra aprovada, o título em 2 linhas numa fonte só, o vídeo e o "não";
        o "Sim" e o resto aparecem depois de 30 s de recado. O fundo de vídeo desfocado saiu ("borrão", reprovado). */}
    <header className="clone-dobra">
      <Progresso passo={2} />
      <section className="clone-topo clone-col-dobra" id="oferta" aria-labelledby="clone-titulo">
        <h1 id="clone-titulo" className="clone-recado"><span>Espere!</span> O seu produto já está liberado.</h1>
        <p className="clone-recado-sub">Antes de acessar, veja este recado.</p>
        <MidiaClone vsl={vsl} poster={vslPoster} />
        <BotoesKiwify codigo={kiwifyCodigo} downsellUrl={siteConfig.clone.downsellUrl} evento="Upsell_Clone" esperando={!revelado}
          textoSim={<>Sim, quero o Modo Clone por {brl(price)}</>}
          textoNao={revelado ? 'Não, obrigado. Prefiro continuar gravando todos os meus vídeos.' : 'Não, obrigado. Quero pular este recado.'} />
      </section>
    </header>

    {revelado && <>
    <main className="clone-col clone-revelado">
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
    </>}
  </div>;
}
