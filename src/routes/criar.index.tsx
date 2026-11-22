import { createFileRoute } from '@tanstack/react-router';
import { Criar } from '@/components/criar';

/* /criar (21/11/2026): "Criar meu vídeo", separado do Catálogo de Estilos. Porta 1: tenho uma referência (prompt).
   Porta 2: criar do zero, camada por camada, em cima de um trecho cru dele. Dados em src/lib/criar.ts. */
export const Route = createFileRoute('/criar/')({
  head: () => ({ meta: [
    { title: 'Criar meu vídeo · Modo Editor' },
    { name: 'description', content: 'Monte o seu vídeo com o Modo Editor: com uma referência ou do zero, camada por camada.' },
    { name: 'robots', content: 'noindex' },
  ], links: [
    // as fontes dos motores de legenda e de efeitos (as mesmas que vão na skill)
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&family=Anton&family=Archivo+Black&family=Bebas+Neue&family=Playfair+Display:ital,wght@1,400;1,600&family=Caveat:wght@400;700&display=swap' },
  ] }),
  component: Criar,
});
