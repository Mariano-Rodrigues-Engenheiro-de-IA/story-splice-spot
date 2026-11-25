import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { siteConfig } from '@/lib/site-config';
import { Duvidas, EuEClone, GaleriaClone, MidiaClone, PorDentro, UmaGravacao, VoceEscreve } from '@/components/clone-oferta';
import { BarraClone, BotaoClone, ComoFuncionaClone, CriadorClone, FimClone, OfertaClone, ParaQuemClone, PerguntasClone, ReceberClone, SemanaDoClone, SemCaraDeRobo, UsosDoClone, WhatsClone } from '@/components/clone-vendas';

/* /clone: a página de vendas do Modo Clone, vendido sozinho (anúncios e link da bio). Nasceu da /obrigado em 16/11; em
   24/11 virou página completa, no nível da principal (pedido dele): primeira dobra só com título e vídeo 9:16, sem botão
   (assistir e rolar), dor, prova, como funciona, oferta, dúvidas e fecho. O vídeo do topo é provisório (o clone, do criativo
   13) até ele gravar o de vendas: é só preencher siteConfig.clone.vendas.vsl. */
const IMG = 'https://modoeditor.zayloia.com/img/clone/compartilhar.jpg';
export const Route = createFileRoute('/clone')({
  head: () => ({ meta: [
    { title: 'Modo Clone — Agora, o seu clone grava por você.' },
    { name: 'description', content: 'Crie o seu clone com IA, com o seu rosto e a sua voz, e grave vídeos só escrevendo o texto. Do zero ao primeiro vídeo, tela por tela. R$ 97, pagamento único e 7 dias de garantia.' },
    { property: 'og:title', content: 'Agora, o seu clone grava por você.' },
    { property: 'og:description', content: 'Você escreve o texto. Ele fala com o seu rosto e a sua voz.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: IMG },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: IMG },
  ] }),
  component: Clone,
});

function Clone() {
  const { vsl, vslPoster } = siteConfig.clone.vendas;
  const [lido, setLido] = useState(0);
  useEffect(() => {
    const rolar = () => { const h = document.documentElement.scrollHeight - window.innerHeight; setLido(h > 0 ? window.scrollY / h : 0); };
    window.addEventListener('scroll', rolar, { passive: true }); rolar();
    return () => window.removeEventListener('scroll', rolar);
  }, []);
  return <div className="page geral clone-pagina clone-vendas">
    <div className="scroll-progress" style={{ transform: `scaleX(${lido})` }} />
    <header className="clone-dobra cv-dobra">
      <span className="cv-feixe" aria-hidden="true" />
      <p className="clone-vendas-marca"><img src="/img/clone/icone.webp" width={28} height={28} alt="" />Modo Clone</p>
      <section className="clone-topo clone-col-dobra" id="topo" aria-labelledby="clone-titulo">
        <h1 id="clone-titulo" className="clone-titulo-grande"><span className="clone-t-fina">Agora, o seu clone</span> <span className="clone-t-forte">grava por você.</span></h1>
        <p className="clone-recado-sub">Você escreve o texto. Ele fala com o seu rosto e a sua voz.</p>
        <MidiaClone vsl={vsl} poster={vslPoster} aviso="O vídeo já começou" />
      </section>
      <p className="cv-abertura">Este vídeo <b>não fui eu que gravei.</b> É o meu clone, feito com IA, com o meu rosto e a minha voz. Eu só escrevi o texto.</p>
    </header>
    <main className="clone-col cv-main">
      <SemanaDoClone />
      <GaleriaClone />
      <EuEClone />
      <ComoFuncionaClone />
      <VoceEscreve />
      <PorDentro />
      <SemCaraDeRobo />
      <UmaGravacao />
      <div className="cv-meio"><BotaoClone texto="Quero o meu clone" /></div>
      <UsosDoClone />
      <ParaQuemClone />
      <CriadorClone />
      <ReceberClone />
      <OfertaClone />
      <Duvidas />
      <PerguntasClone />
    </main>
    <FimClone />
    <footer className="cv-rodape">
      <p className="clone-vendas-marca"><img src="/img/clone/icone.webp" width={26} height={26} alt="" />Modo Clone</p>
      <p>A ferramenta usada para criar o clone é de outra empresa e tem planos próprios. Este curso é independente e não promete resultados.</p>
      <nav aria-label="Links legais"><a href={siteConfig.legal.termsUrl}>Termos de uso</a>·<a href={siteConfig.legal.privacyUrl}>Política de privacidade</a>·<a href={siteConfig.legal.supportUrl.replace('Modo%20Editor', 'Modo%20Clone')}>Suporte</a></nav>
      <small>© 2026 Modo Clone</small>
    </footer>
    <BarraClone />
    <WhatsClone />
  </div>;
}
