import { createFileRoute } from '@tanstack/react-router';
import { siteConfig } from '@/lib/site-config';
import { Duvidas, EuEClone, Fecho, GaleriaClone, MidiaClone, Modulos, PorDentro, UmaGravacao, VoceEscreve } from '@/components/clone-oferta';
import { cliqueComprar, linkCheckout } from '@/lib/pixel';

/* /clone (16/11/2026): a página de vendas do Modo Clone, vendido sozinho. Nasceu da /obrigado (mesmas seções), sem o
   pós-compra (progresso, "Espere!", botões de 1 clique) e com a oferta e o checkout da Kiwify. Chegam aqui o link da bio
   do @mariano_creator (/links) e os anúncios do clone. */
export const Route = createFileRoute('/clone')({
  head: () => ({ meta: [
    { title: 'Modo Clone — Agora, o seu clone grava por você.' },
    { name: 'description', content: 'Crie o seu clone com IA, com o seu rosto e a sua voz, e grave vídeos escrevendo o texto. Do zero ao primeiro vídeo, tela por tela. 7 dias de garantia.' },
    { property: 'og:title', content: 'Modo Clone — Agora, o seu clone grava por você.' },
    { property: 'og:description', content: 'Você escreve o texto. Ele fala com o seu rosto e a sua voz.' },
    { property: 'og:type', content: 'website' },
  ] }),
  component: Clone,
});

/** Para onde vai o botão de compra: o checkout da Kiwify, ou o WhatsApp enquanto o link não existir. */
function destinoCompra() {
  const { checkoutUrl } = siteConfig.clone.vendas;
  if (checkoutUrl) return checkoutUrl;
  return siteConfig.whatsapp ? `https://api.whatsapp.com/send?phone=${siteConfig.whatsapp}&text=${encodeURIComponent('Oi! Quero o Modo Clone.')}` : '#comprar';
}

function Clone() {
  const { price, installmentValue, vsl, vslPoster } = siteConfig.clone.vendas;
  const href = destinoCompra();
  const comprar = (a: HTMLAnchorElement) => {
    if (siteConfig.clone.vendas.checkoutUrl) a.href = linkCheckout(a.href); // UTMs e fbclid de quem veio do anúncio ou da bio
    cliqueComprar(a.closest('section')?.id || 'pagina');
  };
  const itens = ['3 aulas, do zero ao seu primeiro vídeo, tela por tela', 'Começa no plano grátis da ferramenta, sem cartão', 'O clone fica na sua conta: é seu, para gravar sempre que precisar'];
  return <div className="page geral clone-pagina clone-vendas">
    <header className="clone-dobra">
      <p className="clone-vendas-marca"><img src="/img/clone/icone.webp" width={28} height={28} alt="" />Modo Clone</p>
      <section className="clone-topo clone-col-dobra" aria-labelledby="clone-titulo">
        <h1 id="clone-titulo" className="clone-titulo-grande"><span className="clone-t-fina">Agora, o seu clone</span> <span className="clone-t-forte">grava por você.</span></h1>
        <p className="clone-recado-sub">Você escreve o texto. Ele fala com o seu rosto e a sua voz.</p>
        <MidiaClone vsl={vsl} poster={vslPoster} aviso="O vídeo já começou" />
        <a href="#comprar" className="clone-sim clone-vendas-cta">Quero o meu clone</a>
      </section>
    </header>
    <main className="clone-col">
      <GaleriaClone />
      <EuEClone />
      <VoceEscreve />
      <PorDentro />
      <UmaGravacao />
      <Modulos />
      <Fecho id="comprar" preco={price} parcela={installmentValue} itens={itens} href={href} aoClicar={comprar}
        frase={<>Grave uma vez. <em>Depois, é só escrever.</em></>} textoBotao="Quero o Modo Clone" />
      <Duvidas />
      <Fecho preco={price} parcela={installmentValue} itens={itens} href={href} aoClicar={comprar}
        frase={<>O seu conteúdo <em>não para mais.</em></>} textoBotao="Quero o meu clone" />
    </main>
    <footer className="clone-rodape">Modo Clone · <a href={siteConfig.legal.termsUrl}>Termos de uso</a> · <a href={siteConfig.legal.privacyUrl}>Privacidade</a></footer>
  </div>;
}
