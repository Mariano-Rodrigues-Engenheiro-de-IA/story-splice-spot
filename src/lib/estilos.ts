/* Catálogo de Estilos do Modo Editor (17/11/2026, decisão dele): o aluno assiste, escolhe um estilo e pede à IA
   "edita esse vídeo no estilo 01"; o Modo Editor tem uma ficha com a receita de cada número
   (`biblioteca/catalogo-de-estilos.md` na skill). Fica aberto para todo mundo e também dentro do curso.

   REGRA (dele: "ele tem que funcionar"): um estilo só aparece na página depois de TESTADO numa instalação limpa, só
   com o que o aluno recebe, editando uma gravação que não é a do exemplo. Enquanto `testado` for false, ele só aparece
   com ?previa no endereço (para conferir antes de liberar). No teste, preencher `teste` com o que foi medido.

   Para pôr um estilo novo: copiar uma ficha abaixo com o próximo número e pôr os 3 arquivos em
   public/videos/catalogo/ (NN-previa.mp4 = 5-6 s sem som em 360 px; NN.mp4 = exemplo com som em 720 px; NN.webp = capa). */

export type TipoEstilo = 'falando' | 'sem-aparecer' | 'aula' | 'antes-depois' | 'anuncio';

export const tiposEstilo: { id: TipoEstilo; nome: string }[] = [
  { id: 'falando', nome: 'Você falando' },
  { id: 'sem-aparecer', nome: 'Sem aparecer' },
  { id: 'aula', nome: 'Aula e YouTube' },
  { id: 'antes-depois', nome: 'Antes e depois' },
  { id: 'anuncio', nome: 'Anúncio' },
];

export type Estilo = {
  /** o número que o aluno fala para a IA, com 2 dígitos */
  numero: string;
  nome: string;
  tipo: TipoEstilo;
  formato: '9:16' | '16:9';
  /** uma frase: o que acontece na tela */
  frase: string;
  paraQuem: string;
  voceGrava: string;
  precisa: string;
  /** quem aparece no exemplo */
  feitoCom: 'voce' | 'clone';
  testado: boolean;
  /** o que o teste em instalação limpa mediu (aparece na ficha depois do teste) */
  teste?: { tempo: string; observacao?: string };
  novo?: boolean;
};

export const estilos: Estilo[] = [
  {
    numero: '01',
    nome: 'Estúdio roxo com iPhone 3D',
    tipo: 'falando',
    formato: '9:16',
    frase: 'Você num estúdio escuro de luz roxa, com frases grandes atrás da cabeça, iPhones 3D e objetos girando em volta enquanto fala.',
    paraQuem: 'Anúncio, vídeo de vendas e Reels que precisam parar o dedo.',
    voceGrava: 'Você falando para a câmera, em qualquer lugar. O estúdio entra no lugar do seu fundo.',
    precisa: 'Um computador mais forte, porque tem 3D e troca de fundo.',
    feitoCom: 'clone',
    testado: false,
  },
  {
    numero: '02',
    nome: 'Você fala, a IA ilustra',
    tipo: 'falando',
    formato: '9:16',
    frase: 'Cada coisa que você explica vira imagem na tela, no instante em que você fala: mapa, objeto 3D, gráfico, passo a passo.',
    paraQuem: 'Quem explica no vídeo: saúde, professores, consultores, especialistas.',
    voceGrava: 'Você explicando o assunto para a câmera.',
    precisa: 'Um computador mais forte para as partes em 3D.',
    feitoCom: 'clone',
    testado: false,
  },
  {
    numero: '03',
    nome: 'Aula com painéis',
    tipo: 'aula',
    formato: '16:9',
    frase: 'Aula calma: você de um lado e, do outro, painéis roxos com o passo a passo do que você está ensinando.',
    paraQuem: 'Aulas, cursos, treinamentos e YouTube.',
    voceGrava: 'Você dando a aula na webcam ou no celular deitado.',
    precisa: 'Um computador comum.',
    feitoCom: 'voce',
    testado: false,
  },
];

export const arquivosEstilo = (numero: string) => ({
  previa: `/videos/catalogo/${numero}-previa.mp4`,
  video: `/videos/catalogo/${numero}.mp4`,
  capa: `/videos/catalogo/${numero}.webp`,
});

/** a frase que o aluno manda para a IA junto com o vídeo */
export const pedidoEstilo = (e: Estilo) => `Edita esse vídeo no estilo ${e.numero} do catálogo (${e.nome}).`;

export const nomeTipo = (t: TipoEstilo) => tiposEstilo.find(x => x.id === t)?.nome ?? '';
