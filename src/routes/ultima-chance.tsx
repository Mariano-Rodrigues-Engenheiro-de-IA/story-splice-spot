import { createFileRoute } from '@tanstack/react-router';
import { siteConfig } from '@/lib/site-config';
import { BotoesKiwify, Fecho, GaleriaClone, MidiaClone, Modulos, Progresso, brl, useScriptKiwify } from '@/components/clone-oferta';

/* /ultima-chance: o downsell do Modo Clone. Quem clica em "não" no /obrigado cai aqui (o script da Kiwify traz o token
   da compra), com o mesmo curso por um preço menor (R$ 67 contra R$ 97). No "não" daqui, vai para a área de membros.
   Mesmo esqueleto do /obrigado, mais curto: topo, as cenas do clone, as aulas e o fecho. */
export const Route = createFileRoute('/ultima-chance')({
  head: () => ({ meta: [
    { title: 'Última oportunidade · Modo Clone' },
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'O Modo Clone por um preço especial.' },
  ] }),
  component: UltimaChance,
});

function UltimaChance() {
  const { price, kiwifyCodigo, vsl, vslPoster } = siteConfig.clone.downsell;
  const precoCheio = siteConfig.clone.upsell.price;
  useScriptKiwify(kiwifyCodigo, 'ultima-chance');

  return <div className="page geral clone-pagina clone-downsell">
    <Progresso passo={3} />

    <main className="clone-col">
      <section className="clone-topo" id="oferta" aria-labelledby="clone-titulo">
        <p className="clone-espera clone-espera-ultima">Tudo bem, entendo. Mas antes de ir…</p>
        <h1 id="clone-titulo">Última oportunidade: o mesmo Modo Clone <em>por {brl(price)}.</em></h1>
        <p className="clone-sub">{precoCheio > price && <><s>{brl(precoCheio)}</s> </>}Mesmas 3 aulas. Muda só o preço, e ele vale só nesta página.</p>
        <MidiaClone vsl={vsl} poster={vslPoster} />
        <BotoesKiwify codigo={kiwifyCodigo} evento="Downsell_Clone"
          textoSim={<>Sim, quero por {brl(price)}</>}
          textoNao="Não, obrigado. Quero ir para o meu acesso." />
      </section>

      <GaleriaClone />
      <Modulos />
      <Fecho preco={price} precoDe={precoCheio} frase={<>O mesmo Modo Clone. <em>Por {brl(price)}.</em></>} textoBotao={`Quero por ${brl(price)}`} />
    </main>

    <footer className="clone-rodape">Modo Editor · Modo Clone</footer>
  </div>;
}
