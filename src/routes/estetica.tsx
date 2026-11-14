import { createFileRoute } from '@tanstack/react-router';
import { PaginaPro2 } from '@/components/pagina-pro2';
import { siteConfig } from '@/lib/site-config';
import { nichoPorSlug } from '@/lib/nichos';

/* /estetica (14/11/2026): primeira página de nicho da narrativa do "conteúdo 2.0". O anúncio é feito para clínica de
   estética, o vídeo de vendas é o geral e esta página confirma o anúncio com a ficha 'estetica' de lib/nichos.ts.
   O próximo nicho é uma cópia deste arquivo com outro slug (ex.: dentista.tsx). */
const nicho = nichoPorSlug('estetica');

export const Route = createFileRoute('/estetica')({
  head: () => ({ meta: [
    { title: 'Modo Editor para clínicas de estética — o conteúdo mudou.' },
    { name: 'description', content: `Antes e depois com as regiões marcadas, o procedimento em 3D e a sala com cara de estúdio, feitos pela IA com o que você grava na clínica. R$ ${siteConfig.pro.price}, pagamento único e 7 dias de garantia.` },
    { property: 'og:title', content: 'O conteúdo de clínica mudou de vez. A sua já pode postar o novo.' },
    { property: 'og:description', content: `Modo Editor para clínicas de estética: R$ ${siteConfig.pro.price}, pagamento único.` },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: () => <PaginaPro2 nicho={nicho} />,
});
