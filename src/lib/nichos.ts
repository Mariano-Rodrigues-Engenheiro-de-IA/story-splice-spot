/**
 * Portas da página por profissão. A mesma página, o mesmo checkout e o mesmo pixel; o que muda com `?p=` é
 * a primeira dobra (selo, título, frase), a ordem da galeria, o cartão em destaque do "para quem é" e uma
 * pergunta a mais nas dúvidas. Sem `?p=` (ou com um valor desconhecido) vale o padrão, que fala com todo mundo.
 *
 * Uso no anúncio: https://modoeditor.zayloia.com/?p=psicologo&utm_source=... (as UTMs continuam passando).
 */
export type Nicho = {
  slug: string;
  /** texto do selo acima do título, ex.: "Pra psicólogos que postam" */
  selo: string;
  /** título em duas partes: a segunda vai em itálico colorido */
  titulo: [string, string];
  frase: string;
  /** título do cartão correspondente no "para quem é" (fica em destaque e vem primeiro) */
  publico: string;
  /** qual cena da galeria vem primeiro (título do cartão em index.tsx) */
  galeriaPrimeiro: string;
  /** pergunta extra, no topo das dúvidas */
  duvida?: [string, string];
  /** mostra a seção de aulas longas (só pra quem ensina) */
  aulas?: boolean;
};

export const nichoPadrao: Nicho = {
  slug: '',
  selo: 'Pra quem grava explicando o que faz',
  titulo: ['Você explica.', 'O vídeo mostra.'],
  frase: 'Grave do seu jeito, no celular. A IA corta os erros, legenda e coloca na tela o que você está explicando. Volta pronto pra postar.',
  publico: '',
  galeriaPrimeiro: 'Explicação em 3D',
};

export const nichos: Nicho[] = [
  {
    slug: 'psicologo',
    selo: 'Pra psicólogos e terapeutas que postam',
    titulo: ['Você explica.', 'O paciente enxerga.'],
    frase: 'Grave no consultório, do seu jeito. A IA corta, legenda e coloca na tela o que você está explicando: o sintoma, o padrão, a saída. Sem programa de edição.',
    publico: 'Psicólogos e terapeutas',
    galeriaPrimeiro: 'Objeto 3D na mão',
    duvida: ['Serve pra psicólogo?', 'Serve. Você grava falando como fala com o paciente e pede, em português, o que quer na tela: um título, os sinais em lista, uma ilustração do que está explicando. A IA monta e devolve. Nada de promessa de resultado: o vídeo mostra o que você já diz no consultório.'],
  },
  {
    slug: 'nutricionista',
    selo: 'Pra nutricionistas que postam',
    titulo: ['Você explica.', 'O paciente entende.'],
    frase: 'Grave no consultório ou na cozinha. A IA corta, legenda e coloca na tela o que você está explicando: o prato, a quantidade, a troca. Volta pronto pra postar.',
    publico: 'Nutricionistas',
    galeriaPrimeiro: 'Título atrás de você',
    duvida: ['Serve pra nutricionista?', 'Serve. Você grava explicando e pede o que quer na tela: a comparação de dois pratos, a lista do que trocar, o título grande. A IA monta e devolve pronto.'],
  },
  {
    slug: 'fisioterapeuta',
    selo: 'Pra fisioterapeutas que postam',
    titulo: ['Você explica.', 'O paciente vê o porquê.'],
    frase: 'Grave na clínica. A IA corta, legenda e coloca na tela o que você está explicando: a coluna, o disco, o exercício certo. Volta pronto pra postar.',
    publico: 'Fisioterapeutas e personais',
    galeriaPrimeiro: 'Explicação em 3D',
    duvida: ['Serve pra fisioterapeuta?', 'Serve. Você explica e pede o que quer na tela: a coluna em 3D, o músculo que trabalha, o passo a passo do exercício. A IA monta no tempo da sua fala.'],
  },
  {
    slug: 'dentista',
    selo: 'Pra dentistas que postam',
    titulo: ['Você explica.', 'O paciente entende na hora.'],
    frase: 'Grave no consultório. A IA corta, legenda e coloca na tela o que você está explicando: o dente em corte, a cárie, o tratamento. Volta pronto pra postar.',
    publico: 'Dentistas',
    galeriaPrimeiro: 'Explicação em 3D',
    duvida: ['Serve pra dentista?', 'Serve. O exemplo do dente em corte desta página foi feito assim: a gravação e um pedido em português. A IA monta o 3D no tempo da fala e devolve pronto.'],
  },
  {
    slug: 'estetica',
    selo: 'Pra clínicas de estética e harmonização',
    titulo: ['Você explica.', 'A cliente se vê.'],
    frase: 'Grave na clínica. A IA corta, legenda e coloca na tela o antes e depois, a região tratada e o que você explica. Volta pronto pra postar.',
    publico: 'Clínicas de estética',
    galeriaPrimeiro: 'Explicação em 3D',
    duvida: ['Serve pra clínica de estética?', 'Serve. Você manda a gravação e as fotos de antes e depois, e pede como quer na tela. A IA monta a comparação, destaca a região e devolve pronto.'],
  },
  {
    slug: 'arquiteto',
    selo: 'Pra arquitetos e designers de interiores',
    titulo: ['Você explica.', 'O cliente enxerga o espaço.'],
    frase: 'Grave no projeto ou na obra. A IA corta, legenda e coloca na tela o antes e depois, a medida, a mudança que você está explicando. Volta pronto pra postar.',
    publico: 'Arquitetos e corretores',
    galeriaPrimeiro: 'Cenário novo',
    duvida: ['Serve pra arquiteto?', 'Serve. Você explica o projeto e pede o que quer na tela: o antes e depois, a cota, a opção cara e a barata. A IA monta e devolve pronto.'],
  },
  {
    slug: 'personal',
    selo: 'Pra personais e professores de educação física',
    titulo: ['Você explica.', 'O aluno vê o movimento.'],
    frase: 'Grave na academia. A IA corta, legenda e coloca na tela o músculo, o erro comum e o jeito certo. Volta pronto pra postar.',
    publico: 'Fisioterapeutas e personais',
    galeriaPrimeiro: 'Título atrás de você',
    duvida: ['Serve pra personal?', 'Serve. Você explica o exercício e pede o que quer na tela: o músculo que trabalha, o erro e o certo lado a lado, o título grande. A IA monta no tempo da fala.'],
  },
  {
    slug: 'professor',
    selo: 'Pra quem dá aula e grava conteúdo',
    titulo: ['Você explica.', 'A aula sai pronta.'],
    frase: 'Grave a aula de uma vez. A IA corta os erros, legenda, alterna o enquadramento e coloca as ilustrações no tempo da sua fala.',
    publico: 'Quem ensina',
    galeriaPrimeiro: 'Legenda que acompanha',
    aulas: true,
  },
];

export const nichoPorSlug = (p?: string | null): Nicho => nichos.find(n => n.slug === (p || '').toLowerCase()) ?? nichoPadrao;
