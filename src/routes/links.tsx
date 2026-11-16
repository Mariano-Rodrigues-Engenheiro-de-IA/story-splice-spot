import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { eventoProprio } from '@/lib/pixel';

/* /links (16/11/2026): o link da bio do Instagram @mariano_creator. Um catálogo com os dois produtos, para quem chega
   pelo perfil escolher por onde começar: Modo Editor (página preta, /) e Modo Clone (página de vendas, /clone).
   As UTMs de quem chegou passam adiante; sem UTM, o clique leva utm_source=instagram e utm_medium=bio.
   16/11 (pedido dele, visto no celular): cada cartão = vídeo rodando + a capa quadrada do produto (sem texto explicando;
   a capa já diz o nome), e vídeos diferentes: o do Editor é uma montagem de edições reais (3D, anatomia, antes e depois),
   o do Clone é um vídeo feito pelo clone. A foto do topo é a mesma do outro perfil dele (blazer, rosto e ombros). */
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
  capa: string;
  botao: string;
  video: string;
};

const produtos: Produto[] = [
  { id: 'editor', destino: '/', nome: 'Modo Editor', capa: '/img/bio/capa-editor.webp', botao: 'Conhecer o Modo Editor', video: '/videos/bio/editor.mp4' },
  { id: 'clone', destino: '/clone', nome: 'Modo Clone', capa: '/img/bio/capa-clone.webp', botao: 'Conhecer o Modo Clone', video: '/videos/clone/topo-clone.mp4' },
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
      <div className="bio-tela"><VideoCartao src={p.video} /></div>
      <img className="bio-capa" src={p.capa} alt={p.nome} width={640} height={640} />
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
