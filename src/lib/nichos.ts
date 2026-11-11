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
  /** nome curto pro seletor de profissão */
  nome: string;
  /** 4 vídeos que a pessoa pode gravar esta semana: a pergunta do paciente (título), o que ela fala, o que a IA põe na tela */
  ideias: { pergunta: string; fala: string; tela: string }[];
  /** o que o conselho da profissão exige e como o Modo Editor respeita */
  regra: string;
  /** /pro2: a última palavra do título troca sozinha ("enquanto você trabalha. / atende. / almoça."…) */
  verbos?: string[];
};

export const nichoPadrao: Nicho = {
  slug: '',
  selo: 'Funciona no ChatGPT e no Claude',
  titulo: ['A IA edita seus vídeos', 'enquanto você trabalha.'],
  verbos: ['trabalha.', 'atende.', 'almoça.', 'descansa.', 'vive.'],
  frase: 'Você grava no celular. O Modo Editor corta os erros, legenda e coloca na tela o que você explica. Volta pronto em minutos.',
  publico: '',
  galeriaPrimeiro: 'Explicação em 3D',
  nome: 'Todas',
  ideias: [],
  regra: '',
};

export const nichos: Nicho[] = [
  {
    slug: 'psicologo',
    selo: 'Pra psicólogos e terapeutas que postam',
    titulo: ['A IA edita seus vídeos', 'e o paciente entende.'],
    frase: 'Você grava no consultório como fala com o paciente. A IA corta, legenda e coloca na tela o sintoma, o padrão, a saída. Sem editor, sem programa de edição.',
    publico: 'Psicólogos e terapeutas',
    galeriaPrimeiro: 'Objeto 3D na mão',
    duvida: ['Serve pra psicólogo?', 'Serve. Você grava falando como fala com o paciente e pede, em português, o que quer na tela: um título, os sinais em lista, uma ilustração do que está explicando. A IA monta e devolve. Nada de promessa de resultado: o vídeo mostra o que você já diz no consultório.'],
    nome: 'Psicólogo',
    ideias: [
      { pergunta: 'Parece grosseria. Pode ser ansiedade.', fala: 'você explica os sinais que a família lê errado', tela: 'o título em cima, os três sinais acendem em lista enquanto você fala' },
      { pergunta: 'Terapia é só pra quem está mal?', fala: 'você responde como responde no consultório', tela: 'a pergunta vira título; as palavras-chave da resposta aparecem na tela' },
      { pergunta: 'Por que eu travo na hora de falar?', fala: 'você explica o corpo em alarme', tela: 'coração e respiração ilustrados ao lado da sua cabeça, só nesse trecho' },
      { pergunta: 'Como é a primeira sessão?', fala: 'você conta o passo a passo', tela: 'cada etapa entra num cartão, na ordem em que você fala' },
    ],
    regra: 'Sem promessa de resultado, sem depoimento de paciente, sem antes e depois; seu nome e CRP na tela. É o que o Código de Ética do CFP pede, e o Modo Editor já edita assim.',
  },
  {
    slug: 'nutricionista',
    selo: 'Pra nutricionistas que postam',
    titulo: ['A IA edita seus vídeos', 'e o paciente entende.'],
    frase: 'Você grava explicando o prato, a troca, a quantidade. A IA corta, legenda e coloca tudo na tela. Sem editor, sem programa de edição.',
    publico: 'Nutricionistas',
    galeriaPrimeiro: 'Título atrás de você',
    duvida: ['Serve pra nutricionista?', 'Serve. Você grava explicando e pede o que quer na tela: a comparação de dois pratos, a lista do que trocar, o título grande. A IA monta e devolve pronto.'],
    nome: 'Nutricionista',
    ideias: [
      { pergunta: 'Nutri, posso comer pizza?', fala: 'você responde como responde na consulta', tela: 'dois pratos lado a lado, a troca marcada' },
      { pergunta: 'Carboidrato à noite engorda?', fala: 'você desfaz o mito', tela: 'mito e verdade em dois cartões, na hora em que você fala' },
      { pergunta: 'O que levar da feira', fala: 'você fala item por item', tela: 'a lista acende item por item' },
      { pergunta: 'Rótulo: o que olhar primeiro', fala: 'você explica a tabela', tela: 'zoom no rótulo com o que importa destacado' },
    ],
    regra: 'Sem prometer emagrecimento em prazo, sem expor paciente; seu nome e CRN na tela. O Modo Editor já edita assim.',
  },
  {
    slug: 'fisioterapeuta',
    selo: 'Pra fisioterapeutas que postam',
    titulo: ['A IA edita seus vídeos', 'e o paciente entende.'],
    frase: 'Você grava na clínica. A IA corta, legenda e coloca na tela a coluna, o disco, o exercício certo. Sem editor, sem programa de edição.',
    publico: 'Fisioterapeutas e personais',
    galeriaPrimeiro: 'Explicação em 3D',
    duvida: ['Serve pra fisioterapeuta?', 'Serve. Você explica e pede o que quer na tela: a coluna em 3D, o músculo que trabalha, o passo a passo do exercício. A IA monta no tempo da sua fala.'],
    nome: 'Fisioterapeuta',
    ideias: [
      { pergunta: 'Por que dói de manhã e melhora andando?', fala: 'você explica o disco e a rigidez', tela: 'a coluna em 3D sobre o seu tronco, o disco em destaque' },
      { pergunta: 'Hérnia de disco é sentença?', fala: 'você explica o que muda com tratamento', tela: 'título em cima, as fases em cartões' },
      { pergunta: 'Postura errada é culpada de tudo?', fala: 'você desfaz o mito', tela: 'mito e verdade lado a lado' },
      { pergunta: 'Exercício certo e errado', fala: 'você demonstra os dois', tela: 'os dois lado a lado, o certo com selo' },
    ],
    regra: 'Sem promessa de cura, sem expor paciente; seu nome e CREFITO na tela. O Modo Editor já edita assim.',
  },
  {
    slug: 'dentista',
    selo: 'Pra dentistas que postam',
    titulo: ['A IA edita seus vídeos', 'e o paciente entende.'],
    frase: 'Você grava no consultório. A IA corta, legenda e coloca na tela o dente em corte, a cárie, o tratamento. Sem editor, sem programa de edição.',
    publico: 'Dentistas',
    galeriaPrimeiro: 'Explicação em 3D',
    duvida: ['Serve pra dentista?', 'Serve. O exemplo do dente em corte desta página foi feito assim: a gravação e um pedido em português. A IA monta o 3D no tempo da fala e devolve pronto.'],
    nome: 'Dentista',
    ideias: [
      { pergunta: 'Clareamento estraga o esmalte?', fala: 'você explica o que acontece no dente', tela: 'o dente em corte ao seu lado, com o esmalte destacado' },
      { pergunta: 'Por que o dente dói com gelado?', fala: 'você fala da dentina e do nervo', tela: 'o corte do dente, o caminho do frio até o nervo' },
      { pergunta: 'Preciso tirar o siso?', fala: 'você explica quando sim e quando não', tela: 'o siso em 3D na posição que você descreve' },
      { pergunta: 'Antes e depois do seu caso', fala: 'você comenta o tratamento', tela: 'as duas fotos lado a lado, sem mexer na imagem, com seu nome e CRO' },
    ],
    regra: 'Antes e depois só com autorização do paciente por escrito e com seu nome e CRO na tela, como a Resolução CFO 196 pede. Nada de vídeo do procedimento. O Modo Editor já edita assim.',
  },
  {
    slug: 'estetica',
    selo: 'Pra clínicas de estética e harmonização',
    titulo: ['A IA edita seus vídeos', 'de antes e depois.'],
    frase: 'Você grava na clínica e manda as fotos. A IA corta, legenda e monta o antes e depois com a região em destaque. Sem editor, sem programa de edição.',
    publico: 'Clínicas de estética',
    galeriaPrimeiro: 'Explicação em 3D',
    duvida: ['Serve pra clínica de estética?', 'Serve. Você manda a gravação e as fotos de antes e depois, e pede como quer na tela. A IA monta a comparação, destaca a região e devolve pronto.'],
    nome: 'Estética',
    ideias: [
      { pergunta: 'Antes e depois do seu procedimento', fala: 'você comenta o resultado', tela: 'as duas fotos lado a lado, região em destaque, sem mexer na imagem' },
      { pergunta: 'Dói? Quanto tempo dura?', fala: 'você responde as duas perguntas', tela: 'cada resposta num cartão, na hora em que você fala' },
      { pergunta: 'O que é bioestimulador?', fala: 'você explica o que ele faz na pele', tela: 'a pele em camadas ilustrada ao seu lado' },
      { pergunta: 'Cuidados nas primeiras 48 horas', fala: 'você lista os cuidados', tela: 'a lista acende item por item' },
    ],
    regra: 'Antes e depois só com autorização por escrito, sem promessa de resultado; seu nome e registro na tela. O Modo Editor já edita assim.',
  },
  {
    slug: 'arquiteto',
    selo: 'Pra arquitetos e designers de interiores',
    titulo: ['A IA edita seus vídeos', 'e o cliente enxerga.'],
    frase: 'Você grava no projeto ou na obra. A IA corta, legenda e coloca na tela o antes e depois, a medida, a mudança. Sem editor, sem programa de edição.',
    publico: 'Arquitetos e corretores',
    galeriaPrimeiro: 'Cenário novo',
    duvida: ['Serve pra arquiteto?', 'Serve. Você explica o projeto e pede o que quer na tela: o antes e depois, a cota, a opção cara e a barata. A IA monta e devolve pronto.'],
    nome: 'Arquiteto',
    ideias: [
      { pergunta: 'Sua sala pode parecer maior sem derrubar parede', fala: 'você explica cor, espelho, móvel com pé', tela: 'a sala muda item por item com você dentro; a cota aparece' },
      { pergunta: 'Opção cara e opção barata', fala: 'você compara os dois acabamentos', tela: 'os dois preços lado a lado' },
      { pergunta: 'Antes e depois da reforma', fala: 'você comenta o projeto', tela: 'as duas fotos lado a lado, sem mexer na imagem' },
      { pergunta: 'Por que a casa vira um forno?', fala: 'você explica sol, janela e ventilação', tela: 'o sol e a janela ilustrados enquanto você fala' },
    ],
    regra: 'Seu nome e CAU na tela, crédito do projeto certo. O Modo Editor já edita assim.',
  },
  {
    slug: 'personal',
    selo: 'Pra personais e professores de educação física',
    titulo: ['A IA edita seus vídeos', 'e o aluno entende.'],
    frase: 'Você grava na academia. A IA corta, legenda e coloca na tela o músculo, o erro comum e o jeito certo. Sem editor, sem programa de edição.',
    publico: 'Fisioterapeutas e personais',
    galeriaPrimeiro: 'Título atrás de você',
    duvida: ['Serve pra personal?', 'Serve. Você explica o exercício e pede o que quer na tela: o músculo que trabalha, o erro e o certo lado a lado, o título grande. A IA monta no tempo da fala.'],
    nome: 'Personal',
    ideias: [
      { pergunta: 'Joelho pode passar da ponta do pé?', fala: 'você explica o agachamento', tela: 'certo e errado lado a lado, o certo com selo' },
      { pergunta: 'Por que dói no dia seguinte?', fala: 'você explica o músculo', tela: 'o músculo destacado no corpo enquanto você fala' },
      { pergunta: 'Quantas vezes por semana?', fala: 'você responde por objetivo', tela: 'as opções em cartões' },
      { pergunta: 'Treino de 15 minutos em casa', fala: 'você demonstra', tela: 'a lista com o tempo de cada exercício' },
    ],
    regra: 'Sem promessa de resultado em prazo; seu nome e CREF na tela. O Modo Editor já edita assim.',
  },
  {
    slug: 'professor',
    selo: 'Pra quem dá aula e grava conteúdo',
    titulo: ['A IA edita as suas aulas', 'enquanto você ensina.'],
    frase: 'Você grava a aula de uma vez. A IA corta os erros, legenda, alterna o enquadramento e coloca as ilustrações no tempo da sua fala.',
    publico: 'Quem ensina',
    galeriaPrimeiro: 'Legenda que acompanha',
    aulas: true,
    nome: 'Professor',
    ideias: [
      { pergunta: 'A aula inteira, sem os erros', fala: 'você grava de uma vez', tela: 'as pausas e as repetições somem; a fala fica limpa' },
      { pergunta: 'O conceito aparece quando você explica', fala: 'você explica como em sala', tela: 'a ilustração entra ao seu lado no tempo da fala' },
      { pergunta: 'Título com a dúvida do aluno', fala: 'você responde', tela: 'a pergunta vira título grande' },
      { pergunta: 'Cortes para o Reels', fala: 'você grava a aula longa', tela: 'a IA tira os melhores trechos em 9:16' },
    ],
    regra: 'Seu nome e a escola ou curso na tela.',
  },
];

export const nichoPorSlug = (p?: string | null): Nicho => nichos.find(n => n.slug === (p || '').toLowerCase()) ?? nichoPadrao;
