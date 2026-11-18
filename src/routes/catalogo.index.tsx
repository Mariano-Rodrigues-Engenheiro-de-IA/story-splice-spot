import { createFileRoute } from '@tanstack/react-router';
import { Catalogo } from '@/components/catalogo';

/* /catalogo (17/11/2026): o Catálogo de Estilos do Modo Editor, com cara de biblioteca (não de página de vendas).
   Aberto para todos e usado pelo aluno. Estilos e regras em src/lib/estilos.ts; só aparecem os testados (com ?previa
   aparecem todos). Link direto para um estilo (anúncio): /catalogo?estilo=dark abre o exemplo dele. */
export const Route = createFileRoute('/catalogo/')({
  validateSearch: (s: Record<string, unknown>): { previa?: number; estilo?: string } => ({
    ...('previa' in s ? { previa: 1 } : {}),
    ...(typeof s.estilo === 'string' ? { estilo: s.estilo } : {}),
  }),
  head: () => ({ meta: [
    { title: 'Catálogo de Estilos · Modo Editor' },
    { name: 'description', content: 'A biblioteca de estilos de edição do Modo Editor: escolha o estilo, copie o prompt e a IA edita o seu vídeo.' },
    { property: 'og:title', content: 'Catálogo de Estilos · Modo Editor' },
    { property: 'og:description', content: 'Escolha o estilo, copie o prompt e a IA edita o seu vídeo.' },
    { property: 'og:type', content: 'website' },
    // a imagem que aparece quando o link é compartilhado (WhatsApp, Instagram): logo + 5 estilos
    { property: 'og:image', content: 'https://modoeditor.zayloia.com/img/marca/catalogo-og.jpg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: PaginaCatalogo,
});

function PaginaCatalogo() {
  const { estilo } = Route.useSearch();
  return <Catalogo abrir={estilo} />;
}
