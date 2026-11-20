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
  /** false = ainda sem vídeo de exemplo */
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
export type Exemplo = { id: string; codigo: string; titulo: string };

export const estilos: Estilo[] = [
  // 20/11 (pedido dele): todos lado a lado, sem abas; um cartão por estilo, sem repetir; os exemplos extras ficam no visualizador.
  // Estilos só de narração (grupo "dark") levam a etiqueta "Dark" no cartão e não se misturam.
  {
    id: 'documentario',
    nome: 'Documentário',
    grupo: 'dark',
    instrucao: 'ninguém aparece, só a narração. Uma mesa de investigador vista de cima, com papéis datilografados, objetos e um fio vermelho ligando tudo: a câmera passeia pela mesa sem cortar, e cada palavra importante é datilografada, circulada ou carimbada na hora em que é falada. No fim, a câmera recua e mostra a mesa inteira.',
    temExemplo: true,
    exemplos: [{ id: 'documentario', codigo: 'DOC-01', titulo: 'A história da IA' }],
    // 20/11: exemplo aprovado por ele (história da IA)
    testado: true,
    novo: true,
  },
  {
    id: 'motion-3d',
    nome: 'Motion 3D',
    grupo: 'dark',
    instrucao: 'ninguém aparece, só a narração. Tudo o que é falado vira um objeto 3D grande e brilhante na cor da minha marca, num estúdio claro, um virando o outro no ritmo da fala e com a câmera sempre em movimento. Os objetos são criados do zero para o meu assunto e para o que o meu público precisa (me pergunte a minha profissão, o meu público, a cor da marca e o formato antes de começar).',
    temExemplo: true,
    exemplos: [
      { id: 'motion-3d', codigo: 'M3D-01', titulo: 'Estúdio claro na cor da marca' },
      { id: 'motion-3d-c14', codigo: 'M3D-02', titulo: 'Estúdio roxo com vidro e telas' },
    ],
    // 19/11: passou no teste em instalação limpa (IA só com a skill, assunto novo: nutricionista; 27 min) e ele aprovou
    testado: true,
    novo: true,
  },
  {
    id: 'clean',
    nome: 'Clean',
    grupo: 'voce',
    instrucao: 'edição limpa e profissional: cortes nas pausas e nos erros, legenda discreta, luz, cor e som ajustados de leve e, só de vez em quando, um elemento simples na tela. Nada espalhafatoso.',
    temExemplo: true,
    exemplos: [{ id: 'clean', codigo: 'CLE-01', titulo: 'Clean' }],
    // 18/11: passou no teste em instalação limpa (rodada 3: só a ficha, sem ajuste à mão; ~2 min de processamento)
    testado: true,
  },
  {
    id: 'ilustracao-3d',
    nome: 'Ilustração 3D',
    grupo: 'voce',
    instrucao: 'quando eu citar um objeto, um produto ou uma parte do corpo, aparece uma ilustração 3D realista dele na tela, no momento em que eu falo, sem cobrir o meu rosto.',
    temExemplo: true,
    // REGRA dele (20/11): cada exemplo é um vídeo DIFERENTE (nunca dois trechos da mesma gravação)
    exemplos: [
      { id: 'ilustracao-3d-c13', codigo: 'I3D-01', titulo: 'Painel: mapa, ideia e corpo' },
      { id: 'ilustracao-3d-c10', codigo: 'I3D-02', titulo: 'Objeto em órbita' },
    ],
    // 19/11: liberado por ele para ver no ar (ainda sem o teste em instalação limpa)
    testado: true,
  },
  {
    id: 'troca-de-fundo',
    nome: 'Troca de fundo',
    grupo: 'voce',
    instrucao: 'troque o fundo atrás de mim por um cenário bonito e realista, sem mexer na minha imagem. Se eu não disser qual cenário, me mostre 3 opções antes.',
    temExemplo: true,
    exemplos: [{ id: 'troca-de-fundo', codigo: 'FUN-01', titulo: 'Parede vira cenário' }],
    // 19/11: liberado por ele para ver no ar (ainda sem o teste em instalação limpa)
    testado: true,
  },
  {
    id: 'imagens-e-videos',
    nome: 'Imagens e vídeos',
    grupo: 'voce',
    instrucao: 'quando eu falar de algo que dá para mostrar, entra por cima um vídeo ou uma imagem real daquilo (em tela cheia ou recortado ao meu lado) e depois volta para mim. Busque em bancos gratuitos com licença de uso comercial e anote os créditos.',
    temExemplo: true,
    exemplos: [{ id: 'imagens-e-videos', codigo: 'IMG-01', titulo: 'Cenas reais na fala' }],
    // 19/11: liberado por ele para ver no ar (ainda sem o teste em instalação limpa)
    testado: true,
  },
  {
    id: 'motion-design',
    nome: 'Motion design',
    grupo: 'voce',
    instrucao: 'enquanto eu falo, aparecem na tela elementos animados em 2D ligados ao que eu digo (textos, ícones, listas, gráficos, setas, passos), nos momentos certos e sem cobrir o meu rosto.',
    temExemplo: true,
    exemplos: [{ id: 'motion-design', codigo: 'MOT-01', titulo: 'Painéis 2D' }],
    // 19/11: liberado por ele para ver no ar (ainda sem o teste em instalação limpa)
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
    // 19/11: liberado por ele para ver no ar (ainda sem o teste em instalação limpa)
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
    // 19/11: liberado por ele para ver no ar (ainda sem o teste em instalação limpa)
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
