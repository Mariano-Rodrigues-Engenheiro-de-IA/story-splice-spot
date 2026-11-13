import { createFileRoute } from '@tanstack/react-router';
import { ArrowUp, Clock } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { BotoesKiwify, Duvidas, ListaOferta, MidiaClone, Modulos, brl, useScriptKiwify } from '@/components/clone-oferta';

/* /ultima-chance: o downsell do Modo Clone. Quem clica em "não" no /obrigado cai aqui (o script da Kiwify traz o token
   da compra), com o mesmo curso por um preço menor (R$ 67 contra R$ 97). No "não" daqui, vai para a área de membros. */
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
    <div className="clone-ultima" role="status"><Clock aria-hidden="true" /><span><b>Última oportunidade.</b> Esta oferta não aparece de novo.</span></div>

    <main className="clone-col">
      <section className="clone-topo" aria-labelledby="clone-titulo">
        <p className="clone-espera">Espera, antes de ir para o seu acesso</p>
        <h1 id="clone-titulo">Leve o Modo Clone por <em>{brl(price)}.</em></h1>
        <p className="clone-sub">É o mesmo mini curso, com as mesmas 3 aulas, para você criar o seu clone e gerar o seu primeiro vídeo com ele. Muda só o preço, e ele vale só nesta página.</p>
        <MidiaClone vsl={vsl} poster={vslPoster} />
      </section>

      <section className="clone-oferta" id="oferta" aria-labelledby="clone-oferta-titulo">
        <div className="clone-oferta-marca"><img src="/img/clone/icone.webp" width={44} height={44} alt="" /><h2 id="clone-oferta-titulo">Modo Clone</h2></div>
        <div className="clone-preco">
          {precoCheio > price && <s className="clone-preco-de">de {brl(precoCheio)}</s>}
          <strong>{brl(price)}</strong>
          <span>pagamento único</span>
        </div>
        <BotoesKiwify codigo={kiwifyCodigo} textoSim={`Sim, quero por ${brl(price)}`} textoNao="Não, obrigado. Quero ir para o meu acesso." evento="Downsell_Clone" />
        <ListaOferta />
      </section>

      <Modulos />
      <Duvidas />

      <section className="clone-fim">
        <p className="clone-fim-frase">O mesmo Modo Clone. <em>Por {brl(price)}.</em></p>
        <a href="#oferta" className="clone-sim clone-sim-sobe">Quero por {brl(price)} <ArrowUp aria-hidden="true" /></a>
      </section>
    </main>

    <footer className="clone-rodape">Modo Editor · Modo Clone</footer>
  </div>;
}
