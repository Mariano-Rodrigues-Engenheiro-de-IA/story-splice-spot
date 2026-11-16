import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, MessageCircle } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { eventoProprio } from '@/lib/pixel';

/* /links (16/11/2026): o link da bio do Instagram @mariano_creator. Um catálogo com os dois produtos, para quem chega
   pelo perfil escolher por onde começar: Modo Editor (página preta, /) e Modo Clone (página de vendas, /clone).
   As UTMs de quem chegou passam adiante; sem UTM, o clique leva utm_source=instagram e utm_medium=bio. */
export const Route = createFileRoute('/links')({
  head: () => ({ meta: [
    { title: 'Mariano Rodrigues — Modo Editor e Modo Clone' },
    { name: 'description', content: 'A nova produção de conteúdo com IA: a IA edita os seus vídeos e o seu clone grava por você. Escolha por onde começar.' },
    { property: 'og:title', content: 'Mariano Rodrigues — a nova produção de conteúdo com IA' },
    { property: 'og:description', content: 'Modo Editor: a IA edita os seus vídeos. Modo Clone: o seu clone grava por você.' },
    { property: 'og:type', content: 'website' },
  ] }),
  component: Links,
});

type Produto = {
  id: 'editor' | 'clone';
  destino: string;
  selo: string;
  nome: string;
  promessa: [string, string];
  itens: string[];
  botao: string;
  video: string;
};

const produtos: Produto[] = [
  {
    id: 'editor', destino: '/', selo: 'Edição com IA', nome: 'Modo Editor',
    promessa: ['A IA edita os seus vídeos', 'como um profissional.'],
    itens: ['Corta, legenda e põe na tela o que você explica', '3D, troca de fundo e antes e depois', 'Pagamento único, vídeos sem limite'],
    botao: 'Conhecer o Modo Editor', video: '/videos/galeria/ilustracao.mp4',
  },
  {
    id: 'clone', destino: '/clone', selo: 'Clone com IA', nome: 'Modo Clone',
    promessa: ['O seu clone grava', 'os vídeos por você.'],
    itens: ['Com o seu rosto e a sua voz', 'Você grava uma vez, depois é só escrever', 'Do zero ao primeiro vídeo, tela por tela'],
    botao: 'Conhecer o Modo Clone', video: '/videos/clone/topo-clone.mp4',
  },
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

/** Vídeo mudo em loop que só toca enquanto o cartão está na tela (no celular, um vídeo por vez). */
function VideoCartao({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) void v.play().catch(() => undefined); else v.pause(); }, { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} src={src} poster={src.replace(/\.mp4$/, '.webp')} muted loop playsInline preload="metadata" aria-hidden="true" />;
}

function Cartao({ p, href }: { p: Produto; href: string }) {
  return (
    <a className={`bio-cartao bio-${p.id}`} href={href} onClick={() => eventoProprio('Bio_Clique', { produto: p.nome }, false)}>
      <div className="bio-tela"><VideoCartao src={p.video} /><span className="bio-selo">{p.selo}</span></div>
      <div className="bio-texto">
        <h2>{p.nome}</h2>
        <p className="bio-promessa">{p.promessa[0]} <em>{p.promessa[1]}</em></p>
        <ul>{p.itens.map(i => <li key={i}><Check aria-hidden="true" />{i}</li>)}</ul>
      </div>
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
          <img className="bio-foto" src={siteConfig.creator.photo} alt={siteConfig.creator.name} width={88} height={88} />
          <p className="bio-nome">{siteConfig.creator.name}</p>
          <h1>A nova produção de conteúdo <em>com IA.</em></h1>
          <p className="bio-sub">A IA edita os seus vídeos e o seu clone grava por você. Escolha por onde começar.</p>
        </header>
        <div className="bio-lista">{produtos.map(p => <Cartao key={p.id} p={p} href={hrefs[p.id] ?? p.destino} />)}</div>
        {whats && <a className="bio-duvida" href={whats} target="_blank" rel="noopener noreferrer" onClick={() => eventoProprio('Bio_WhatsApp', {}, false)}><MessageCircle aria-hidden="true" /> Dúvidas? Fale comigo no WhatsApp</a>}
        <p className="bio-rodape">© 2026 {siteConfig.creator.name}</p>
      </main>
    </div>
  );
}
