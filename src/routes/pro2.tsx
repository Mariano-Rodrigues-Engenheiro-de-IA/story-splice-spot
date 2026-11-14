import { createFileRoute } from '@tanstack/react-router';
import { PaginaPro2 } from '@/components/pagina-pro2';
import { siteConfig } from '@/lib/site-config';
import { nichoPorSlug } from '@/lib/nichos';

/* /pro2: a página dos profissionais refeita do zero (9/11/2026), lado a lado com a /pro para comparar. */
export const Route = createFileRoute('/pro2')({
  validateSearch: (search: Record<string, unknown>) => { const p = search['p']; return { p: typeof p === 'string' && p ? p : undefined }; },
  head: () => ({ meta: [
    { title: 'Modo Editor — A IA edita seus vídeos enquanto você trabalha.' },
    { name: 'description', content: `Grave no celular. A IA corta os erros, legenda e coloca na tela o que você explica. R$ ${siteConfig.pro.price}, pagamento único e 7 dias de garantia.` },
    { property: 'og:title', content: 'Modo Editor — A IA edita seus vídeos enquanto você trabalha.' },
    { property: 'og:description', content: `Seu vídeo pronto, com a explicação na tela. Modo Editor: R$ ${siteConfig.pro.price}, pagamento único.` },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Pro2,
});

function Pro2() {
  const { p } = Route.useSearch();
  return <PaginaPro2 nicho={nichoPorSlug(p)} />;
}
