import { createFileRoute } from '@tanstack/react-router';
import { KeyRound, MonitorPlay, ScanFace, ShieldCheck, Wallet } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { BotoesKiwify, Fecho, Modulos, Progresso, brl, useScriptKiwify } from '@/components/clone-oferta';

/* /ultima-chance: o downsell do Modo Clone. Quem clica em "não" no /obrigado cai aqui (o script da Kiwify traz o token
   da compra), com o mesmo curso por um preço menor (R$ 67 contra R$ 97). No "não" daqui, vai para a área de membros.
   16/11 (pedido dele): SEM VÍDEO nenhum, oferta só com texto e a capa do produto. Estrutura do mercado para downsell:
   título com preço e benefício, preço cheio riscado + quanto economiza, o que leva em lista, oferta única desta página,
   Sim grande e Não logo embaixo. Os textos da lista são frases do recado do clone que ele aprovou (nada inventado). */
export const Route = createFileRoute('/ultima-chance')({
  head: () => ({ meta: [
    { title: 'Última oportunidade · Modo Clone' },
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'O Modo Clone por um preço especial.' },
  ] }),
  component: UltimaChance,
});

const leva = [
  { Icone: ScanFace, titulo: 'Seu clone, com o seu rosto e a sua voz', texto: 'Você grava uma vez para criar o seu clone. Depois, cada vídeo novo é só um texto novo.' },
  { Icone: MonitorPlay, titulo: '3 aulas, tela por tela', texto: 'Do zero até o seu primeiro vídeo gravado pelo seu clone, cada botão explicado.' },
  { Icone: Wallet, titulo: 'Começa sem gastar com a ferramenta', texto: 'Ela tem plano grátis para você começar, sem cadastrar cartão.' },
  { Icone: KeyRound, titulo: 'O clone é seu', texto: 'O clone que você criar fica na sua conta.' },
  { Icone: ShieldCheck, titulo: '7 dias de garantia', texto: 'Não gostou? Pede o reembolso e recebe cada centavo de volta.' },
];

function UltimaChance() {
  const { price, kiwifyCodigo, installmentValue } = siteConfig.clone.downsell;
  const precoCheio = siteConfig.clone.upsell.price;
  const economia = precoCheio - price;
  useScriptKiwify(kiwifyCodigo, 'ultima-chance');

  return <div className="page geral clone-pagina clone-downsell">
    <header className="clone-dobra">
      <Progresso passo={3} />
      <section className="clone-topo clone-col-dobra" id="oferta" aria-labelledby="clone-titulo">
        <p className="clone-ult-entendo">Tudo bem, entendo. Antes de você ir…</p>
        <h1 id="clone-titulo" className="clone-recado"><span>Última chance:</span> o Modo Clone por {brl(price)}.</h1>
        <p className="clone-recado-sub">As mesmas 3 aulas. Muda só o preço, e ele vale só nesta página.</p>

        {/* a oferta num cartão: a capa do produto e a linha do pedido, com o preço cheio riscado e a economia */}
        <div className="clone-ult-cartao">
          <img src="/img/clone/capa.webp" width={1280} height={720} alt="Modo Clone: você escreve, o clone fala" />
          <div className="clone-ult-linha">
            <div className="clone-ult-nome"><strong>Modo Clone</strong><span>3 aulas, tela por tela</span></div>
            <div className="clone-ult-preco">
              {precoCheio > price && <s>{brl(precoCheio)}</s>}
              <b>{brl(price)}</b>
            </div>
          </div>
          {economia > 0 && <p className="clone-ult-economia">Você economiza {brl(economia)} só nesta página</p>}
        </div>

        <BotoesKiwify codigo={kiwifyCodigo} evento="Downsell_Clone"
          textoSim={<>Sim, quero por {brl(price)}</>}
          textoNao="Não, obrigado. Quero ir para o meu acesso." />
      </section>
    </header>

    <main className="clone-col">
      <section className="clone-secao" aria-labelledby="clone-leva">
        <div className="clone-secao-topo"><h2 id="clone-leva" className="clone-titulo-grande"><span className="clone-t-fina">O que você</span> <span className="clone-t-forte">leva</span></h2></div>
        <ul className="clone-ult-leva">
          {leva.map(({ Icone, titulo, texto }) => <li key={titulo}>
            <span className="clone-ult-ic" aria-hidden="true"><Icone /></span>
            <div><strong>{titulo}</strong><p>{texto}</p></div>
          </li>)}
        </ul>
      </section>
      <Modulos />
      <Fecho preco={price} precoDe={precoCheio} parcela={installmentValue} frase={<>O mesmo Modo Clone. <em>Por {brl(price)}.</em></>} textoBotao={`Quero por ${brl(price)}`} />
    </main>

    <footer className="clone-rodape">Modo Editor · Modo Clone</footer>
  </div>;
}
