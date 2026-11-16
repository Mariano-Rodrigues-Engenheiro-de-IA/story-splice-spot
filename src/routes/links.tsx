import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { eventoProprio } from '@/lib/pixel';

/* /links (16/11/2026): o link da bio do Instagram @mariano_creator. Um catálogo com os dois produtos, para quem chega
   pelo perfil escolher por onde começar: Modo Editor (página preta, /) e Modo Clone (página de vendas, /clone).
   As UTMs de quem chegou passam adiante; sem UTM, o clique leva utm_source=instagram e utm_medium=bio.
   16/11 (pedido dele, visto no celular): cada cartão = vídeo rodando + a capa quadrada do produto (sem texto explicando;
   a capa já diz o nome), e vídeos diferentes: o do Editor é uma montagem de edições reais (3D, anatomia, antes e depois),
   o do Clone é um vídeo feito pelo clone. A foto do topo é a mesma do outro perfil dele (blazer, rosto e ombros).
   v3 (16/11): as capas 3D e os vídeos saíram (vídeo de 116 px ninguém vê; objeto flutuando "não ficou legal"). Cada
   cartão é a ARTE dele em 4:5 ocupando a largura toda (feita por ele num gerador de imagem, com os nossos prompts) e o
   botão embaixo, só com o brilho passando (sem pulsar). */
export const Route = createFileRoute('/links')({
  head: () => ({ meta: [
    { title: 'Mariano Rodrigues — Modo Editor e Modo Clone' },
    { name: 'description', content: 'A nova era da produção de conteúdo com IA: a IA edita os seus vídeos e o seu clone grava por você. Escolha por onde começar.' },
    { property: 'og:title', content: 'Mariano Rodrigues — a nova era da produção de conteúdo com IA' },
    { property: 'og:description', content: 'Modo Editor: a IA edita os seus vídeos. Modo Clone: o seu clone grava por você.' },
    { property: 'og:type', content: 'website' },
  ] }),
  component: Links,
});

type Produto = {
  id: 'editor' | 'clone';
  destino: string;
  nome: string;
  /** a arte do produto, 4:5 (1080x1350) */
  arte: string;
  botao: string;
};

const produtos: Produto[] = [
  { id: 'editor', destino: '/', nome: 'Modo Editor: você grava, a IA edita', arte: '/img/bio/arte-editor.webp', botao: 'Conhecer o Modo Editor' },
  { id: 'clone', destino: '/clone', nome: 'Modo Clone: você escreve, o clone fala', arte: '/img/bio/arte-clone.webp', botao: 'Conhecer o Modo Clone' },
];

/** Leva as UTMs de quem chegou para a página do produto; sem UTM, marca que veio da bio. */
function comUtm(destino: string) {
  if (typeof window === 'undefined') return destino;
  const daqui = new URLSearchParams(window.location.search);
  const url = new URL(destino, window.location.origin);
  if (![...daqui.keys()].some(k => k.startsWith('utm_'))) { daqui.set('utm_source', 'instagram'); daqui.set('utm_medium', 'bio'); }
  daqui.forEach((v, k) => { if (!url.searchParams.has(k)) url.searchParams.set(k, v); });
  return url.pathname + url.search;
}

function Cartao({ p, href }: { p: Produto; href: string }) {
  return (
    <a className={`bio-cartao bio-${p.id}`} href={href} onClick={() => eventoProprio('Bio_Clique', { produto: p.nome }, false)}>
      <img className="bio-arte" src={p.arte} alt={p.nome} width={1080} height={1350} />
      <span className="bio-botao">{p.botao} <ArrowRight aria-hidden="true" /></span>
    </a>
  );
}

function Links() {
  // o destino com as UTMs só existe no navegador; no servidor vai o caminho limpo
  const [hrefs, setHrefs] = useState<Record<string, string>>(() => Object.fromEntries(produtos.map(p => [p.id, p.destino])));
  useEffect(() => setHrefs(Object.fromEntries(produtos.map(p => [p.id, comUtm(p.destino)]))), []);
  const whats = siteConfig.whatsapp ? `https://api.whatsapp.com/send?phone=${siteConfig.whatsapp}&text=${encodeURIComponent('Oi! Vim pelo Instagram e tenho uma dúvida.')}` : '';
  return (
    <div className="bio">
      <main className="bio-coluna">
        <header className="bio-topo">
          <img className="bio-foto" src="/img/bio/perfil.webp" alt={siteConfig.creator.name} width={88} height={88} />
          <p className="bio-nome">{siteConfig.creator.name}</p>
          <h1>A nova era da produção de conteúdo <em>com IA.</em></h1>
          <p className="bio-sub">A IA edita os seus vídeos e o seu clone grava por você. Escolha por onde começar.</p>
        </header>
        <div className="bio-lista">{produtos.map(p => <Cartao key={p.id} p={p} href={hrefs[p.id] ?? p.destino} />)}</div>
        {whats && <a className="bio-duvida" href={whats} target="_blank" rel="noopener noreferrer" onClick={() => eventoProprio('Bio_WhatsApp', {}, false)}><MessageCircle aria-hidden="true" /> Dúvidas? Fale comigo no WhatsApp</a>}
        <p className="bio-rodape">© 2026 {siteConfig.creator.name}</p>
      </main>
    </div>
  );
}
