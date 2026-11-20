/* Catálogo de Estilos do Modo Editor (17/11/2026). Biblioteca de estilos de EDIÇÃO (não de produção de vídeo):
   a pessoa vê o exemplo, toca em "Usar", copia o prompt e manda para a IA junto com o vídeo. Os estilos são camadas
   que se misturam (ex.: troca de fundo + motion design). O Dark tem variações.

   Regras dele (17/11): nome genérico (sem cor nem objeto: "Ilustração 3D", não "estúdio roxo com iPhone"), nada de
   explicar demais na página; o texto que explica vai dentro do prompt.

   REGRA ("ele tem que funcionar"): um estilo só aparece para o público depois de TESTADO numa instalação limpa, só com
   o que o aluno recebe, editando uma gravação que não é a do exemplo. Enquanto `testado` for false ele só aparece com
   ?previa no endereço.

   Estilo novo: uma ficha abaixo + em public/videos/catalogo/ os arquivos <id>.mp4 (6-14 s sem som, 360x640),
   <id>-som.mp4 (o mesmo com som, 720x1280) e <id>.webp (capa). A skill precisa da ficha com o mesmo nome em
   biblioteca/estilos-catalogo/. */

export type GrupoEstilo = 'voce' | 'dark';

export const gruposEstilo: { id: GrupoEstilo; nome: string }[] = [
  { id: 'voce', nome: 'Você aparece' },
  { id: 'dark', nome: 'Dark' },
];

/** exemplo: id do vídeo curto em public/videos/catalogo/ (aparece na janela do Usar quando o tipo é escolhido) */
export type Variante = { id: string; nome: string; instrucao: string; exemplo?: string };

export type Estilo = {
  id: string;
  nome: string;
  grupo: GrupoEstilo;
  /** o que a IA tem que fazer, em palavras simples (vai dentro do prompt) */
  instrucao: string;
  variantes?: Variante[];
  /** false = ainda sem vídeo de exemplo: o cartão aparece como "Em breve" (sem Usar) */
  temExemplo: boolean;
  testado: boolean;
  novo?: boolean;
  /** os vídeos do estilo (a SEÇÃO), o primeiro é o melhor e é a capa do cartão. Cada um tem um CÓDIGO que vai no prompt:
      o Modo Editor liga o código à receita exata daquele vídeo (biblioteca/estilos-catalogo/codigos.md). Arquivos em
      public/videos/catalogo/<id>.mp4 (loop), <id>-som.mp4 e <id>.webp. */
  exemplos: Exemplo[];
};

/** Um vídeo do catálogo. O código é PERMANENTE (não reaproveite um código para outro vídeo). Cada exemplo é uma gravação
    DIFERENTE (regra dele, 20/11): nunca dois trechos do mesmo vídeo, nem no mesmo estilo. */
export type Exemplo = { id: string; codigo: string; titulo: string; formato?: '9:16' | '16:9' };

export const estilos: Estilo[] = [
  // 20/11 (ele): todos lado a lado; cada estilo é uma SEÇÃO com os vídeos dele; cada vídeo tem um código.
  // REGRAS dele para os exemplos: só vídeo BOM e aprovado; cada exemplo é uma gravação diferente (nunca o mesmo vídeo em
  // dois lugares) e de preferência com roupa diferente; nunca ele duplicado na tela; sem bom exemplo = "Em breve".
  // O primeiro vídeo de cada estilo é a CAPA (o melhor).
  {
    id: 'documentario',
    nome: 'Documentário',
    grupo: 'dark',
    instrucao: 'ninguém aparece, só a narração. Uma mesa de investigador vista de cima, com papéis datilografados, objetos e um fio vermelho ligando tudo: a câmera passeia pela mesa sem cortar, e cada palavra importante é datilografada, circulada ou carimbada na hora em que é falada. No fim, a câmera recua e mostra a mesa inteira.',
    temExemplo: true,
    exemplos: [{ id: 'documentario', codigo: 'DOC-01', titulo: 'A história da IA' }],
    testado: true,
    novo: true,
  },
  {
    id: 'motion-3d',
    nome: 'Motion 3D',
    grupo: 'dark',
    instrucao: 'ninguém aparece, só a narração. Tudo o que é falado vira um objeto 3D grande e brilhante na cor da minha marca, num estúdio claro, um virando o outro no ritmo da fala e com a câmera sempre em movimento. Os objetos são criados do zero para o meu assunto e para o que o meu público precisa (me pergunte a minha profissão, o meu público, a cor da marca e o formato antes de começar).',
    temExemplo: true,
    // capa = o criativo 14 ("esse vídeo inteiro foi feito com IA"), o melhor (pedido dele 20/11)
    exemplos: [
      { id: 'motion-3d-c14', codigo: 'M3D-02', titulo: 'Estúdio roxo com vidro e telas' },
      { id: 'motion-3d', codigo: 'M3D-01', titulo: 'Estúdio claro na cor da marca' },
    ],
    testado: true,
    novo: true,
  },
  {
    id: 'ilustracao-3d',
    nome: 'Ilustração 3D',
    grupo: 'voce',
    instrucao: 'quando eu citar um objeto, um produto ou uma parte do corpo, aparece uma ilustração 3D realista dele na tela, no momento em que eu falo, sem cobrir o meu rosto.',
    temExemplo: true,
    exemplos: [
      { id: 'ilustracao-3d-c09', codigo: 'I3D-03', titulo: 'Corpo humano em 3D realista' },
      { id: 'ilustracao-3d-c10', codigo: 'I3D-02', titulo: 'Objeto em órbita' },
    ],
    testado: true,
  },
  {
    id: 'antes-e-depois',
    nome: 'Antes e depois',
    grupo: 'voce',
    instrucao: 'vídeo de antes e depois do meu procedimento (estética, odontologia, corpo): as fotos de antes e depois alinhadas sem alterar nada nelas, a análise do rosto ou da região com linhas e marcações elegantes, a transformação e, no fim, o nome da minha clínica. Me pergunte o procedimento, as regiões tratadas e o nome da clínica.',
    temExemplo: true,
    // 20/11 (ele): tudo de estética no mesmo lugar, todos os aprovados (rosto, perfil, dentes, corpo)
    exemplos: [
      { id: 'antes-e-depois-rosto', codigo: 'ANT-01', titulo: 'Rosto: análise e transformação' },
      { id: 'antes-e-depois-perfil', codigo: 'ANT-02', titulo: 'Perfil: linha do contorno' },
      { id: 'antes-e-depois-trailer', codigo: 'ANT-03', titulo: 'Rosto: trailer por região' },
      { id: 'antes-e-depois-dentes', codigo: 'ANT-04', titulo: 'Dentes: lentes' },
      { id: 'antes-e-depois-corpo', codigo: 'ANT-05', titulo: 'Corpo: criolipólise' },
    ],
    testado: true,
    novo: true,
  },
  {
    id: 'youtube',
    nome: 'YouTube',
    grupo: 'voce',
    instrucao: 'vídeo para o YouTube (16:9): cortes nas pausas e nos erros, zoom no rosto com ritmo, painéis e textos que mostram o que eu explico, efeitos sonoros suaves e uma abertura que prende. Me ajude também com título, capa e capítulos.',
    temExemplo: true,
    exemplos: [{ id: 'youtube-01', codigo: 'YT-01', titulo: 'O CapCut morreu?', formato: '16:9' }],
    testado: true,
    novo: true,
  },
  {
    id: 'aula',
    nome: 'Aula',
    grupo: 'voce',
    instrucao: 'aula gravada (16:9): edição calma, cortes nas pausas e nos erros, painéis com os passos e os termos explicados ao lado de mim, sem pressa e sem efeito chamativo.',
    temExemplo: true,
    exemplos: [
      { id: 'aula-clone', codigo: 'AUL-01', titulo: 'Aula com painéis ao lado', formato: '16:9' },
      { id: 'aula-boas-vindas', codigo: 'AUL-02', titulo: 'Aula de boas-vindas', formato: '16:9' },
    ],
    testado: true,
    novo: true,
  },
  {
    id: 'troca-de-fundo',
    nome: 'Troca de fundo',
    grupo: 'voce',
    instrucao: 'troque o fundo atrás de mim por um cenário bonito e realista, sem mexer na minha imagem. Se eu não disser qual cenário, me mostre 3 opções antes.',
    temExemplo: true,
    // o criativo 10 ficou na Ilustração 3D (nunca o mesmo vídeo em dois estilos)
    exemplos: [{ id: 'troca-de-fundo-quarto', codigo: 'FUN-02', titulo: 'Parede branca vira quarto' }],
    testado: true,
  },
  {
    id: 'motion-design',
    nome: 'Motion design',
    grupo: 'voce',
    instrucao: 'enquanto eu falo, aparecem na tela elementos animados em 2D ligados ao que eu digo (textos, ícones, listas, gráficos, setas, passos), nos momentos certos e sem cobrir o meu rosto.',
    temExemplo: true,
    exemplos: [
      { id: 'motion-design', codigo: 'MOT-01', titulo: 'Painéis 2D na fala' },
      { id: 'motion-design-c08', codigo: 'MOT-02', titulo: 'Painéis da IA editando' },
    ],
    testado: true,
  },
  {
    // o id continua "dark" (links de anúncio antigos: /catalogo?estilo=dark); era o tipo "com imagens e vídeos" do Dark
    id: 'dark',
    nome: 'Colagem',
    grupo: 'dark',
    instrucao: 'ninguém aparece, só a narração. Tudo o que é narrado aparece em imagens e vídeos, montados em colagem com movimento e com as palavras-chave na tela.',
    temExemplo: true,
    exemplos: [{ id: 'dark', codigo: 'COL-01', titulo: 'Colagem' }],
    testado: true,
  },
  {
    // era o tipo "em desenho" do Dark
    id: 'dark-desenho',
    nome: 'Desenho',
    grupo: 'dark',
    instrucao: 'ninguém aparece, só a narração. Tudo o que é narrado vai sendo desenhado na tela, em traço, como se alguém desenhasse a história enquanto ela é contada.',
    temExemplo: true,
    exemplos: [{ id: 'dark-desenho', codigo: 'DES-01', titulo: 'Desenho em traço' }],
    testado: true,
  },
  {
    id: 'clean',
    nome: 'Clean',
    grupo: 'voce',
    instrucao: 'edição limpa e profissional: cortes nas pausas e nos erros, legenda discreta, luz, cor e som ajustados de leve e, só de vez em quando, um elemento simples na tela. Nada espalhafatoso.',
    // 20/11 (ele): o exemplo antigo ficou fraco ("tô todo corcunda"); fica "Em breve" até ele gravar um novo
    temExemplo: false,
    exemplos: [],
    testado: true,
  },
  {
    id: 'imagens-e-videos',
    nome: 'Imagens e vídeos',
    grupo: 'voce',
    instrucao: 'quando eu falar de algo que dá para mostrar, entra por cima um vídeo ou uma imagem real daquilo (em tela cheia ou recortado ao meu lado) e depois volta para mim. Busque em bancos gratuitos com licença de uso comercial e anote os créditos.',
    // 20/11 (ele): o exemplo antigo ficou ruim (ele duplicado na bolinha); fica "Em breve" até ele gravar um novo
    temExemplo: false,
    exemplos: [],
    testado: true,
  },
];

export const arquivosEstilo = (id: string) => ({
  loop: `/videos/catalogo/${id}.mp4`,
  som: `/videos/catalogo/${id}-som.mp4`,
  capa: `/videos/catalogo/${id}.webp`,
});

const PREVIA = 'Antes de fazer o vídeo inteiro, me mostre uma prévia de 10 segundos.';

/** O prompt que a pessoa copia: um estilo (no vídeo escolhido, pelo CÓDIGO) ou uma mistura de estilos. */
export function montarPrompt(principal: Estilo, extras: Estilo[], variante?: Variante, codigo?: string): string {
  const cod = codigo ?? principal.exemplos[0]?.codigo;
  const comCodigo = (e: Estilo, c?: string) => `"${e.nome}"${(c ?? e.exemplos[0]?.codigo) ? ` (código ${c ?? e.exemplos[0]?.codigo})` : ''}`;
  if (principal.grupo === 'dark') {
    const v = variante ?? principal.variantes?.[0];
    return [
      `Faça um vídeo no estilo "${principal.nome}${v ? ` (${v.nome.charAt(0).toLowerCase()}${v.nome.slice(1)})` : ''}"${cod ? ` (código ${cod})` : ''} do Catálogo de Estilos do Modo Editor, com a narração que eu vou te mandar.`,
      `Como eu quero: ${principal.instrucao}${v ? ` ${v.instrucao.charAt(0).toUpperCase()}${v.instrucao.slice(1)}` : ''}`,
      PREVIA,
    ].join('\n\n');
  }
  if (extras.length === 0) {
    return [
      `Edite o vídeo que eu vou te mandar no estilo ${comCodigo(principal, cod)} do Catálogo de Estilos do Modo Editor.`,
      `Como eu quero: ${principal.instrucao}`,
      PREVIA,
    ].join('\n\n');
  }
  const todos = [principal, ...extras];
  return [
    `Edite o vídeo que eu vou te mandar misturando estes estilos do Catálogo de Estilos do Modo Editor: ${todos.map((e, k) => comCodigo(e, k === 0 ? cod : undefined)).join(' + ')}.`,
    todos.map(e => `- ${e.nome}: ${e.instrucao}`).join('\n'),
    PREVIA,
  ].join('\n\n');
}
